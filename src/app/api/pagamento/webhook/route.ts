import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

async function handlePayment(id: string, mpToken: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${mpToken}` },
  })
  if (!res.ok) return
  const payment = await res.json()
  if (payment.status !== 'approved') return

  // Pagamento de assinatura: external_reference = psicologo_id
  const psicologoId = payment.external_reference ?? payment.metadata?.psicologo_id
  if (!psicologoId) return

  await pool.query(
    `UPDATE psicologos
     SET plano = 'pro', trial_fim = NOW() + INTERVAL '35 days', mp_subscription_id = $1
     WHERE id = $2`,
    [String(payment.preapproval_id ?? payment.id), psicologoId]
  )
  console.log(`[webhook] Pagamento aprovado → pro ativado para ${psicologoId}`)
}

async function handleSubscription(id: string, mpToken: string) {
  const res = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${mpToken}` },
  })
  if (!res.ok) return
  const sub = await res.json()

  const psicologoId = sub.external_reference
  if (!psicologoId) return

  if (sub.status === 'authorized' || sub.status === 'active') {
    await pool.query(
      `UPDATE psicologos SET plano = 'pro', mp_subscription_id = $1 WHERE id = $2`,
      [sub.id, psicologoId]
    )
    console.log(`[webhook] Assinatura ativa para ${psicologoId}`)
  } else if (sub.status === 'cancelled' || sub.status === 'paused') {
    await pool.query(
      `UPDATE psicologos SET plano = 'bloqueado' WHERE id = $1 AND mp_subscription_id = $2`,
      [psicologoId, sub.id]
    )
    console.log(`[webhook] Assinatura ${sub.status} para ${psicologoId}`)
  }
}

export async function POST(req: NextRequest) {
  const mpToken = process.env.MP_ACCESS_TOKEN
  if (!mpToken) return NextResponse.json({ ok: false }, { status: 503 })

  let body: { type?: string; data?: { id?: string } }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  const id = body.data?.id
  if (!id) return NextResponse.json({ ok: true })

  try {
    if (body.type === 'payment') await handlePayment(id, mpToken)
    else if (body.type === 'subscription_preapproval') await handleSubscription(id, mpToken)
  } catch (err) {
    console.error('[webhook]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
