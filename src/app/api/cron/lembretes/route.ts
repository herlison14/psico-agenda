/**
 * GET /api/cron/lembretes
 * Vercel Cron Job — roda diariamente às 8h BRT (11h UTC)
 * Envia lembretes via WhatsApp (WPPConnect Server) para sessões do dia seguinte.
 *
 * Variáveis de ambiente necessárias (opcionais — sem elas, o cron é no-op):
 *   WPPCONNECT_URL     — URL pública do seu servidor WPPConnect (ex: https://wpp.railway.app)
 *   WPPCONNECT_SESSION — nome da sessão (ex: psiplanner)
 *   WPPCONNECT_TOKEN   — Bearer token gerado no WPPConnect
 *   CRON_SECRET        — segredo para autenticar a chamada do Vercel Cron
 */
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureSessoesSchema } from '@/lib/ensure-schema'

const CRON_SECRET = process.env.CRON_SECRET

async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  const baseUrl = process.env.WPPCONNECT_URL?.replace(/\/$/, '')
  const session = process.env.WPPCONNECT_SESSION ?? 'psiplanner'
  const token   = process.env.WPPCONNECT_TOKEN

  if (!baseUrl || !token) return false

  // WPPConnect espera número internacional sem '+' ou '@c.us' (ex: 5521999999999)
  const phoneNorm = phone.replace(/\D/g, '')
  const phoneIntl = phoneNorm.startsWith('55') ? phoneNorm : `55${phoneNorm}`

  try {
    const res = await fetch(`${baseUrl}/api/${session}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        phone: phoneIntl,
        message,
        isGroup: false,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.warn(`[lembretes] WPPConnect ${res.status}:`, body)
    }
    return res.ok
  } catch (err) {
    console.error('[lembretes] WhatsApp send error:', err)
    return false
  }
}

export async function GET(req: NextRequest) {
  // Autenticação: Vercel Cron envia o segredo via header Authorization
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // WPPConnect não configurado — cron é no-op (não falha o deploy)
  if (!process.env.WPPCONNECT_URL || !process.env.WPPCONNECT_TOKEN) {
    return NextResponse.json({ skipped: true, reason: 'WPPConnect not configured' })
  }

  // Sessões agendadas para amanhã (BRT) — janela de 24h a partir de agora + 20h
  const agora = new Date()
  const amanha = new Date(agora)
  amanha.setDate(amanha.getDate() + 1)

  // Início (00:00 BRT = 03:00 UTC) e fim (23:59 BRT = 02:59 UTC +1 dia)
  const inicioDia = new Date(Date.UTC(
    amanha.getUTCFullYear(), amanha.getUTCMonth(), amanha.getUTCDate(), 3, 0, 0
  ))
  const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000)

  // Garante que a coluna lembrete_enviado existe
  await ensureSessoesSchema()

  try {
    const { rows } = await pool.query<{
      sessao_id: string
      data_hora: Date
      duracao_min: number
      paciente_nome: string | null
      paciente_telefone: string | null
      psic_nome: string | null
    }>(
      `SELECT
         s.id        AS sessao_id,
         s.data_hora,
         s.duracao_min,
         p.nome      AS paciente_nome,
         p.telefone  AS paciente_telefone,
         ps.nome     AS psic_nome
       FROM sessoes s
       JOIN pacientes  p  ON p.id  = s.paciente_id
       JOIN psicologos ps ON ps.id = s.psicologo_id
       WHERE s.status = 'agendado'
         AND s.data_hora >= $1
         AND s.data_hora <  $2
         AND p.telefone IS NOT NULL
         AND p.telefone <> ''
         AND s.lembrete_enviado IS NOT TRUE`,
      [inicioDia.toISOString(), fimDia.toISOString()],
    )

    let enviados = 0
    let falhas = 0

    for (const sessao of rows) {
      const dtFormatada = new Date(sessao.data_hora).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })

      const nomePaciente = sessao.paciente_nome?.split(' ')[0] ?? 'Paciente'
      const nomePsic     = sessao.psic_nome ?? 'seu psicólogo(a)'

      const mensagem =
        `Olá, ${nomePaciente}! 😊\n\n` +
        `Lembrete da sua consulta de psicologia com *${nomePsic}*:\n` +
        `📅 ${dtFormatada}\n` +
        `⏱ Duração: ${sessao.duracao_min} minutos\n\n` +
        `Precisa reagendar? Entre em contato com antecedência.\n\n` +
        `_— PsiPlanner_`

      const ok = await sendWhatsApp(sessao.paciente_telefone!, mensagem)

      if (ok) {
        // Marca lembrete como enviado (requer coluna lembrete_enviado na tabela)
        await pool.query(
          `UPDATE sessoes SET lembrete_enviado = true WHERE id = $1`,
          [sessao.sessao_id],
        ).catch(() => {}) // silencia se a coluna não existir ainda
        enviados++
      } else {
        falhas++
      }
    }

    console.log(`[lembretes] total=${rows.length} enviados=${enviados} falhas=${falhas}`)
    return NextResponse.json({ ok: true, total: rows.length, enviados, falhas })
  } catch (err) {
    console.error('[lembretes] DB error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
