import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

const PAID_EVENTS = new Set(['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'RECEIVED_IN_CASH'])

export async function POST(req: NextRequest) {
  if (!process.env.ASAAS_API_KEY) {
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  // Valida token de segurança do webhook
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN
  if (webhookToken) {
    const authHeader = req.headers.get('asaas-access-token') ?? req.headers.get('authorization') ?? ''
    const receivedToken = authHeader.replace(/^Bearer\s+/i, '')
    if (receivedToken !== webhookToken) {
      console.warn('[webhook/asaas] token inválido')
      return NextResponse.json({ ok: false }, { status: 401 })
    }
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
    const { rows } = await pool.query('SELECT id, plano FROM psicologos WHERE id = $1', [extRef])
    if (!rows.length) return NextResponse.json({ ok: true })

    if (rows[0].plano !== 'pro') {
      await pool.query(
        `UPDATE psicologos
         SET plano = 'pro',
             trial_fim = NOW() + INTERVAL '35 days',
             mp_subscription_id = $1
         WHERE id = $2`,
        [payId, extRef],
      )
      console.log('[webhook/asaas] plano pro ativado para', extRef)
    }
  } catch (err) {
    console.error('[webhook/asaas]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
