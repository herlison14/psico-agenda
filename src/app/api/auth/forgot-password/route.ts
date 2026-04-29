import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import pool from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`forgot:${ip}`, 3)) {
    return NextResponse.json({ ok: true }) // Resposta genérica para não vazar info
  }

  let email: string
  try {
    const body = await req.json()
    email = (body.email ?? '').toLowerCase().trim()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  if (!email) return NextResponse.json({ ok: true })

  try {
    const { rows } = await pool.query('SELECT id FROM psicologos WHERE email = $1', [email])
    if (rows.length === 0) {
      // Resposta genérica: não revela se o e-mail existe
      return NextResponse.json({ ok: true })
    }

    const psicologoId = rows[0].id
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Invalida tokens anteriores do usuário
    await pool.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE psicologo_id = $1 AND used_at IS NULL',
      [psicologoId]
    )

    await pool.query(
      'INSERT INTO password_reset_tokens (psicologo_id, token, expires_at) VALUES ($1, $2, $3)',
      [psicologoId, token, expiresAt]
    )

    const baseUrl = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? '').replace(/\/$/, '')
    const resetUrl = `${baseUrl}/nova-senha?token=${token}`

    await sendPasswordResetEmail(email, resetUrl)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[forgot-password]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
