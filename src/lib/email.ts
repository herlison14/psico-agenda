import { Resend } from 'resend'

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY não configurado — e-mails desativados')
    return null
  }
  return new Resend(apiKey)
}

const FROM = process.env.EMAIL_FROM ?? 'PsiPlanner <onboarding@resend.dev>'

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.log(`[email] Link de recuperação para ${to}: ${resetUrl}`)
    return false
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Redefinição de senha — PsiPlanner',
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
          Caso o botão não funcione, copie e cole este link:<br>
          <a href="${resetUrl}" style="color:#2563eb;word-break:break-all">${resetUrl}</a>
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('[email] sendPasswordResetEmail error:', error)
    return false
  }
  return true
}

export async function sendBookingNotificationEmail(
  psicEmail: string,
  psicNome: string,
  pacNome: string,
  dataHoraISO: string,
  confirmacaoUrl: string,
): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.warn('[email] booking notification não enviado para', psicEmail)
    return false
  }

  const firstName = psicNome?.split(' ')[0] || 'Psicólogo(a)'
  const dtFormatada = new Date(dataHoraISO).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const { error } = await resend.emails.send({
    from: FROM,
    to: psicEmail,
    subject: `📅 Nova sessão agendada via July — ${pacNome}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="margin-bottom:20px">
          <span style="font-size:18px;font-weight:700;color:#1e3a8a">PsiPlanner</span>
        </div>
        <div style="background:#eff6ff;border-radius:12px;padding:20px;margin-bottom:20px">
          <p style="color:#1e40af;font-size:13px;font-weight:600;margin:0 0 4px">📅 Nova sessão agendada via July</p>
          <h2 style="font-size:18px;color:#0f172a;margin:0">${pacNome}</h2>
          <p style="color:#3b82f6;font-size:14px;margin:8px 0 0;font-weight:500">${dtFormatada}</p>
        </div>
        <p style="color:#64748b;font-size:14px;margin-bottom:20px">
          Olá, ${firstName}! Um novo agendamento foi realizado pelo agente July. Clique abaixo para ver o comprovante.
        </p>
        <a href="${confirmacaoUrl}" style="display:inline-block;background:#1e3a8a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">
          Ver comprovante
        </a>
        <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0">
        <p style="color:#94a3b8;font-size:12px">Acesse sua agenda em <a href="https://www.psiplanner.com.br/agenda" style="color:#2563eb">psiplanner.com.br</a></p>
      </div>
    `,
  })

  if (error) {
    console.error('[email] sendBookingNotificationEmail error:', error)
    return false
  }
  return true
}

export async function sendWelcomeEmail(to: string, nome: string): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.warn('[email] welcome email não enviado para', to)
    return false
  }

  const firstName = nome?.split(' ')[0] || 'Psicólogo(a)'
  const loginUrl = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://psiplanner.com.br').replace(/\/$/, '') + '/dashboard'

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Bem-vindo(a) ao PsiPlanner! 🎉',
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

  if (error) {
    console.error('[email] sendWelcomeEmail error:', error)
    return false
  }
  return true
}
