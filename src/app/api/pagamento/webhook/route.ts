import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import pool from '@/lib/db'

// Valida assinatura Mercado Pago (x-signature header)
// Formato: ts=TIMESTAMP,v1=HMAC_SHA256
// String assinada: id:{notification_id};request-date:{ts};
function validarAssinaturaMP(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[webhook/mp] MP_WEBHOOK_SECRET não configurado — validação ignorada')
    return true // Permissivo enquanto secret não estiver configurado
  }

  const signatureHeader = req.headers.get('x-signature') ?? ''
  const requestId = req.headers.get('x-request-id') ?? ''
  const notificationId = req.nextUrl.searchParams.get('data.id') ?? requestId

  const parts: Record<string, string> = {}
  for (const part of signatureHeader.split(',')) {
    const [k, v] = part.split('=')
    if (k && v) parts[k.trim()] = v.trim()
  }

  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  // Rejeita notificações com timestamp maior que 5 minutos (replay attack)
  const age = Date.now() - Number(ts) * 1000
  if (age > 5 * 60 * 1000 || age < -30_000) return false

  const manifest = `id:${notificationId};request-date:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1))
  } catch {
    return false
  }
}

async function handlePayment(id: string, mpToken: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${mpToken}` },
  })
  if (!res.ok) return
  const payment = await res.json()
  if (payment.status !== 'approved') return

  const psicologoId = payment.external_reference ?? payment.metadata?.psicologo_id
  if (!psicologoId) return

  // Verificar se psicólogo existe antes de atualizar
  const { rows } = await pool.query('SELECT id FROM psicologos WHERE id = $1', [psicologoId])
  if (rows.length === 0) {
    console.error(`[webhook] Psicólogo não encontrado: ${psicologoId}`)
    return
  }

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

  // Verificar se psicólogo existe
  const { rows } = await pool.query('SELECT id FROM psicologos WHERE id = $1', [psicologoId])
  if (rows.length === 0) return

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

  const rawBody = await req.text()

  if (!validarAssinaturaMP(req, rawBody)) {
    console.warn('[webhook/mp] Assinatura inválida rejeitada')
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  let body: { type?: string; data?: { id?: string } }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

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
