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

export async function sendWelcomeEmail(to: string, nome: string): Promise<boolean> {
  const transport = createTransport()
  const from = process.env.EMAIL_FROM ?? `PsiPlanner <noreply@psiplanner.com.br>`
  const loginUrl = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://psiplanner.com.br').replace(/\/$/, '') + '/dashboard'
  const firstName = nome?.split(' ')[0] || 'Psicólogo(a)'

  if (!transport) {
    console.warn('[email] SMTP não configurado — welcome email não enviado para', to)
    return false
  }

  await transport.sendMail({
    from,
    to,
    subject: 'Bem-vindo(a) ao PsiPlanner! 🎉',
    text: `Olá, ${firstName}!\n\nSua conta PsiPlanner foi criada com sucesso. Você tem 7 dias de trial gratuito para explorar todas as funcionalidades.\n\nAcesse agora: ${loginUrl}\n\nQualquer dúvida, responda este e-mail.\n\nEquipe PsiPlanner`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="margin-bottom:28px">
          <span style="font-size:18px;font-weight:700;color:#1e3a8a">PsiPlanner</span>
        </div>
        <h1 style="font-size:22px;color:#0f172a;margin-bottom:8px">Bem-vindo(a), ${firstName}! 🎉</h1>
        <p style="color:#64748b;font-size:14px;margin-bottom:8px">
          Sua conta foi criada com sucesso. Você tem <strong>7 dias gratuitos</strong> para explorar tudo o que o PsiPlanner oferece.
        </p>
        <div style="background:#eff6ff;border-radius:12px;padding:20px;margin:24px 0">
          <p style="color:#1e40af;font-size:14px;font-weight:600;margin:0 0 12px">O que você pode fazer:</p>
          <ul style="color:#3b82f6;font-size:13px;margin:0;padding:0 0 0 18px;line-height:1.9">
            <li>Gerenciar agenda e sessões</li>
            <li>Cadastrar e acompanhar pacientes</li>
            <li>Emitir recibos em PDF</li>
            <li>Controle financeiro integrado</li>
            <li>Agente July com IA para agendamentos</li>
            <li>Transcrição de sessões e SOAP automático</li>
          </ul>
        </div>
        <a href="${loginUrl}" style="display:inline-block;background:#1e3a8a;color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:600">
          Acessar minha conta
        </a>
        <hr style="border:none;border-top:1px solid #f1f5f9;margin:28px 0">
        <p style="color:#94a3b8;font-size:12px;margin:0">
          Após 7 dias, continue por <strong>R$ 50/mês</strong> · Cancele quando quiser.<br>
          Dúvidas? Responda este e-mail.
        </p>
      </div>
    `,
  })

  return true
}
