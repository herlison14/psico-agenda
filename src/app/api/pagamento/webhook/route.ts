import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

const PAID_EVENTS = new Set(['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'RECEIVED_IN_CASH'])

export async function POST(req: NextRequest) {
  if (!process.env.ASAAS_API_KEY) {
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  // Valida token de segurança do webhook — obrigatório
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN
  if (!webhookToken) {
    console.error('[webhook/asaas] ASAAS_WEBHOOK_TOKEN não configurado — endpoint bloqueado')
    return NextResponse.json({ ok: false }, { status: 503 })
  }
  const authHeader = req.headers.get('asaas-access-token') ?? req.headers.get('authorization') ?? ''
  const receivedToken = authHeader.replace(/^Bearer\s+/i, '')
  if (receivedToken !== webhookToken) {
    console.warn('[webhook/asaas] token inválido recebido')
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let body: { event?: string; payment?: { id?: string; externalReference?: string; status?: string } }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const event   = body.event ?? ''
  const payment = body.payment ?? {}
  const payId   = payment.id ?? ''
  const extRef  = payment.externalReference ?? ''

  console.log('[webhook/asaas] event=%s pay=%s ext=%s', event, payId, extRef)

  if (!extRef || !payId) return NextResponse.json({ ok: true })

  // Deduplicação simples via flag no banco
  if (!PAID_EVENTS.has(event)) return NextResponse.json({ ok: true })

  try {
    // extRef = psicologo_id (UUID)
    const { rows } = await pool.query('SELECT id, plano, mp_subscription_id FROM psicologos WHERE id = $1', [extRef])
    if (!rows.length) return NextResponse.json({ ok: true })

    // Idempotência: skip se já processamos este payId específico
    if (rows[0].mp_subscription_id === payId) {
      console.log('[webhook/asaas] payId=%s já processado (idempotente), skip', payId)
      return NextResponse.json({ ok: true })
    }

    // Ativa pro — renovação cumulativa: soma 30 dias ao maior entre trial_fim e agora
    const { rowCount } = await pool.query(
      `UPDATE psicologos
       SET plano = 'pro',
           trial_fim = GREATEST(trial_fim, NOW()) + INTERVAL '30 days',
           mp_subscription_id = $1
       WHERE id = $2 AND mp_subscription_id IS DISTINCT FROM $1`,
      [payId, extRef],
    )
    if ((rowCount ?? 0) > 0) {
      console.log('[webhook/asaas] plano pro ativado para', extRef, 'pay', payId)
    }
  } catch (err) {
    console.error('[webhook/asaas]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
