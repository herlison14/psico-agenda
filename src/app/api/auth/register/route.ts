import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import pool from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // 5 tentativas por IP a cada 15 minutos
  const ip = getClientIp(req)
  if (!checkRateLimit(`register:${ip}`, 5)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 })
  }

  let email: string
  let password: string
  let nome: string | undefined
  let crp: string | undefined
  try {
    const body = await req.json()
    email = body.email
    password = body.password
    nome = body.nome?.trim() || undefined
    crp = body.crp?.trim() || undefined
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'E-mail e senha (mínimo 8 caracteres) são obrigatórios.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
  }

  try {
    const existing = await pool.query('SELECT id FROM psicologos WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })
    }

    const password_hash = await hash(password, 10)
    await pool.query(
      `INSERT INTO psicologos (email, password_hash, nome, crp, plano, trial_fim)
       VALUES ($1, $2, $3, $4, 'trial', NOW() + INTERVAL '7 days')`,
      [email, password_hash, nome ?? null, crp ?? null]
    )

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/auth/register]', err)
    return NextResponse.json({ error: 'Erro ao cadastrar.' }, { status: 500 })
  }
}
