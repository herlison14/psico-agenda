import nodemailer from 'nodemailer'

function createTransport() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const transport = createTransport()

  if (!transport) {
    console.warn('[email] SMTP não configurado. Variáveis necessárias: SMTP_HOST, SMTP_USER, SMTP_PASS')
    console.log(`[email] Link de recuperação para ${to}: ${resetUrl}`)
    return false
  }

  const from = process.env.EMAIL_FROM ?? `PsiPlanner <noreply@psiplanner.com.br>`

  await transport.sendMail({
    from,
    to,
    subject: 'Redefinição de senha — PsiPlanner',
    text: `Olá,\n\nVocê solicitou a redefinição da sua senha. Clique no link abaixo para criar uma nova senha:\n\n${resetUrl}\n\nEste link expira em 1 hora. Se você não solicitou a redefinição, ignore este e-mail.\n\nEquipe PsiPlanner`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="margin-bottom:24px">
          <span style="font-size:18px;font-weight:700;color:#1e3a8a">PsiPlanner</span>
        </div>
        <h1 style="font-size:20px;color:#0f172a;margin-bottom:8px">Redefinição de senha</h1>
        <p style="color:#64748b;font-size:14px;margin-bottom:24px">
          Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#1e3a8a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">
          Redefinir senha
        </a>
        <p style="color:#94a3b8;font-size:12px;margin-top:28px">
          Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este e-mail.
        </p>
        <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0">
        <p style="color:#94a3b8;font-size:11px">
          Caso o botão não funcione, copie e cole este link no navegador:<br>
          <a href="${resetUrl}" style="color:#2563eb;word-break:break-all">${resetUrl}</a>
        </p>
      </div>
    `,
  })

  return true
}
