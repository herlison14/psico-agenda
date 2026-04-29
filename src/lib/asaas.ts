const ASAAS_API_KEY  = process.env.ASAAS_API_KEY  ?? ''
// Sandbox: https://sandbox.asaas.com/api/v3 | Produção: https://api.asaas.com/v3
const ASAAS_API_BASE = process.env.ASAAS_API_BASE ?? 'https://sandbox.asaas.com/api/v3'

function headers() {
  return { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' }
}

export async function asaasUpsertCustomer(
  name: string,
  email: string,
  cpf?: string,
): Promise<string> {
  const cpfDigits = (cpf ?? '').replace(/\D/g, '')

  if (cpfDigits) {
    const r = await fetch(`${ASAAS_API_BASE}/customers?cpfCnpj=${cpfDigits}&limit=1`, { headers: headers() })
    if (r.ok) {
      const d = await r.json()
      if (d.data?.length) return d.data[0].id
    }
  }

  const r2 = await fetch(`${ASAAS_API_BASE}/customers?email=${encodeURIComponent(email)}&limit=1`, { headers: headers() })
  if (r2.ok) {
    const d = await r2.json()
    if (d.data?.length) return d.data[0].id
  }

  const payload: Record<string, string> = { name: name || 'Cliente PsiPlanner', email }
  if (cpfDigits) payload.cpfCnpj = cpfDigits

  const r3 = await fetch(`${ASAAS_API_BASE}/customers`, {
    method: 'POST', headers: headers(), body: JSON.stringify(payload),
  })
  if (!r3.ok) throw new Error(`Asaas customer: ${await r3.text()}`)
  return (await r3.json()).id
}

export async function asaasCreatePixCharge({
  externalReference,
  amountBrl,
  description,
  customerName,
  customerEmail,
  customerCpf,
}: {
  externalReference: string
  amountBrl: number
  description: string
  customerName: string
  customerEmail: string
  customerCpf?: string
}) {
  const customerId = await asaasUpsertCustomer(customerName, customerEmail, customerCpf)
  const dueDate    = new Date().toISOString().split('T')[0]

  const payR = await fetch(`${ASAAS_API_BASE}/payments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      customer:          customerId,
      billingType:       'PIX',
      value:             Math.round(amountBrl * 100) / 100,
      dueDate,
      description:       description.slice(0, 200),
      externalReference,
    }),
  })
  if (!payR.ok) throw new Error(`Asaas payment: ${await payR.text()}`)
  const payment   = await payR.json()
  const paymentId = payment.id as string

  const qrR = await fetch(`${ASAAS_API_BASE}/payments/${paymentId}/pixQrCode`, { headers: headers() })
  if (!qrR.ok) throw new Error(`Asaas qrcode: ${await qrR.text()}`)
  const qr = await qrR.json()

  return {
    paymentId,
    qrCode:       (qr.payload       ?? '') as string,
    qrCodeBase64: (qr.encodedImage  ?? null) as string | null,
    status:       (payment.status   ?? 'PENDING') as string,
    amount:       amountBrl,
  }
}

export async function asaasGetPayment(paymentId: string) {
  const r = await fetch(`${ASAAS_API_BASE}/payments/${paymentId}`, { headers: headers() })
  if (!r.ok) return null
  return r.json() as Promise<{ id: string; status: string; externalReference?: string }>
}

export async function asaasRegisterWebhook(webhookUrl: string) {
  const h = headers()
  try {
    const r = await fetch(`${ASAAS_API_BASE}/webhooks`, { headers: h })
    if (r.ok) {
      const d = await r.json()
      const exists = (d.data ?? []).some((w: { url: string }) => w.url === webhookUrl)
      if (exists) return
    }
    await fetch(`${ASAAS_API_BASE}/webhooks`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        url:         webhookUrl,
        email:       process.env.ADMIN_EMAIL ?? '',
        enabled:     true,
        interrupted: false,
        authToken:   process.env.ASAAS_WEBHOOK_TOKEN ?? '',
        events:      ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_OVERDUE', 'PAYMENT_DELETED'],
      }),
    })
  } catch (e) {
    console.warn('[asaas] webhook register error:', e)
  }
}
