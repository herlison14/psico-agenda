import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  let email: string
  let password: string
  try {
    const body = await req.json()
    email = body.email
    password = body.password
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
  }

  try {
    const existing = await pool.query('SELECT id FROM psicologos WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })
    }

    const password_hash = await hash(password, 10)
    await pool.query(
      `INSERT INTO psicologos (email, password_hash, plano, trial_fim)
       VALUES ($1, $2, 'trial', NOW() + INTERVAL '3 days')`,
      [email, password_hash]
    )

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/auth/register]', err)
    return NextResponse.json({ error: 'Erro ao cadastrar.' }, { status: 500 })
  }
}
