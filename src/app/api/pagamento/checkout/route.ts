import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'
import { asaasCreatePixCharge, asaasRegisterWebhook } from '@/lib/asaas'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.ASAAS_API_KEY) {
    return NextResponse.json({ error: 'Pagamento não configurado.' }, { status: 503 })
  }

  const { rows } = await pool.query(
    'SELECT nome, email, cpf FROM psicologos WHERE id = $1',
    [session.user.id],
  )
  const prof = rows[0]
  if (!prof) return NextResponse.json({ error: 'Profissional não encontrado.' }, { status: 404 })

  // Registra webhook automaticamente (lazy, uma vez por deploy)
  const baseUrl = (process.env.NEXTAUTH_URL ?? 'https://www.psiplanner.com.br').replace(/\/$/, '')
  asaasRegisterWebhook(`${baseUrl}/api/pagamento/webhook`).catch(() => null)

  try {
    const pix = await asaasCreatePixCharge({
      externalReference: session.user.id,
      amountBrl:         50.00,
      description:       'PsiPlanner Pro — assinatura mensal',
      customerName:      prof.nome  ?? 'Profissional',
      customerEmail:     prof.email ?? '',
      customerCpf:       prof.cpf   ?? '',
    })

    // Persiste o payment_id para polling
    await pool.query(
      'UPDATE psicologos SET mp_subscription_id = $1 WHERE id = $2',
      [pix.paymentId, session.user.id],
    )

    return NextResponse.json({
      payment_id:     pix.paymentId,
      qr_code:        pix.qrCode,
      qr_code_base64: pix.qrCodeBase64,
      amount:         pix.amount,
    })
  } catch (err) {
    console.error('[checkout/asaas]', err)
    return NextResponse.json({ error: 'Erro ao gerar cobrança PIX.' }, { status: 502 })
  }
}
