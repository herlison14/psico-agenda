import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const mpToken = process.env.MP_ACCESS_TOKEN
  if (!mpToken) return NextResponse.json({ error: 'Pagamento não configurado.' }, { status: 503 })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://www.psiplanner.com.br'

  const { rows } = await pool.query('SELECT email FROM psicologos WHERE id = $1', [session.user.id])
  const email = rows[0]?.email ?? ''

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mpToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{
        id: 'psiplanner-pro-mensal',
        title: 'PsiPlanner Pro — Mensal',
        description: 'Acesso completo ao PsiPlanner por 30 dias',
        quantity: 1,
        unit_price: 49.90,
        currency_id: 'BRL',
      }],
      payer: { email },
      back_urls: {
        success: `${baseUrl}/dashboard?pagamento=sucesso`,
        failure: `${baseUrl}/planos?pagamento=erro`,
        pending: `${baseUrl}/planos?pagamento=pendente`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/pagamento/webhook`,
      metadata: { psicologo_id: session.user.id },
      statement_descriptor: 'PSIPLANNER',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[checkout] MP error:', err)
    return NextResponse.json({ error: 'Erro ao criar preferência de pagamento.' }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json({ checkout_url: data.init_point })
}
