import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'
import { asaasGetPayment } from '@/lib/asaas'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const paymentId = req.nextUrl.searchParams.get('payment_id')
  if (!paymentId) return NextResponse.json({ error: 'payment_id obrigatório' }, { status: 400 })

  // Verifica se o profissional é dono desse payment_id
  const { rows } = await pool.query(
    'SELECT plano, mp_subscription_id FROM psicologos WHERE id = $1',
    [session.user.id],
  )
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const prof = rows[0]

  // Se já é pro, retorna ativo
  if (prof.plano === 'pro') return NextResponse.json({ status: 'active' })

  // Consulta Asaas
  try {
    const payment = await asaasGetPayment(paymentId)
    if (!payment) return NextResponse.json({ status: 'pending' })

    if (['RECEIVED', 'CONFIRMED'].includes(payment.status)) {
      // Ativa o plano
      await pool.query(
        `UPDATE psicologos
         SET plano = 'pro',
             trial_fim = NOW() + INTERVAL '35 days',
             mp_subscription_id = $1
         WHERE id = $2`,
        [paymentId, session.user.id],
      )
      return NextResponse.json({ status: 'active' })
    }

    return NextResponse.json({ status: payment.status.toLowerCase() })
  } catch (err) {
    console.error('[status/asaas]', err)
    return NextResponse.json({ status: 'pending' })
  }
}
