import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

const PLAN_ID = process.env.MP_PLAN_ID ?? '7bb9bd9a3d1443178bba9a3ae4a6f885'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const mpToken = process.env.MP_ACCESS_TOKEN
  if (!mpToken) return NextResponse.json({ error: 'Pagamento não configurado.' }, { status: 503 })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://www.psiplanner.com.br'

  const { rows } = await pool.query('SELECT email FROM psicologos WHERE id = $1', [session.user.id])
  const email = rows[0]?.email ?? ''

  // Cria assinatura recorrente (preapproval) vinculada ao plano mensal
  const res = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mpToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      preapproval_plan_id: PLAN_ID,
      reason: 'PsiPlanner Pro Mensal',
      external_reference: session.user.id,
      payer_email: email,
      back_url: `${baseUrl}/dashboard?pagamento=sucesso`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 50.00,
        currency_id: 'BRL',
        billing_day: 10,
        billing_day_proportional: true,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[checkout] MP error:', err)
    return NextResponse.json({ error: 'Erro ao criar assinatura.' }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json({ checkout_url: data.init_point, subscription_id: data.id })
}
