import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import pool from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`reset:${ip}`, 5)) {
    return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 })
  }

  let token: string, password: string
  try {
    const body = await req.json()
    token = body.token ?? ''
    password = body.password ?? ''
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  if (!token || password.length < 8) {
    return NextResponse.json({ error: 'Token e senha (mínimo 8 caracteres) são obrigatórios.' }, { status: 400 })
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, psicologo_id FROM password_reset_tokens
       WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [token]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 400 })
    }

    const { id: tokenId, psicologo_id } = rows[0]
    const password_hash = await hash(password, 10)

    await pool.query('UPDATE psicologos SET password_hash = $1 WHERE id = $2', [password_hash, psicologo_id])
    await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [tokenId])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[reset-password]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
