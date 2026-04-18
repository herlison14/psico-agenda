import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  const mpToken = process.env.MP_ACCESS_TOKEN
  if (!mpToken) return NextResponse.json({ ok: false }, { status: 503 })

  let body: { type?: string; data?: { id?: string } }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  if (body.type !== 'payment' || !body.data?.id) return NextResponse.json({ ok: true })

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${body.data.id}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    })
    if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 })

    const payment = await res.json()
    if (payment.status !== 'approved') return NextResponse.json({ ok: true })

    const psicologoId = payment.metadata?.psicologo_id
    if (!psicologoId) return NextResponse.json({ ok: true })

    // Ativa plano por 31 dias a partir de hoje
    await pool.query(
      `UPDATE psicologos
       SET plano = 'pro', trial_fim = NOW() + INTERVAL '31 days', mp_subscription_id = $1
       WHERE id = $2`,
      [String(payment.id), psicologoId]
    )

    console.log(`[webhook] Plano pro ativado para ${psicologoId}`)
  } catch (err) {
    console.error('[webhook] Erro:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
