import { NextRequest, NextResponse } from 'next/server'
import { generateText, tool, stepCountIs } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import pool from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

const HORARIOS_PADRAO = [8, 9, 10, 11, 14, 15, 16, 17]

export async function POST(req: NextRequest) {
  let body: {
    psicologo_id: string
    paciente_nome: string
    paciente_phone: string
    message: string
    history?: { role: 'user' | 'assistant'; content: string }[]
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const { psicologo_id, paciente_nome, paciente_phone, message, history = [] } = body

  if (!psicologo_id || !message?.trim() || !paciente_phone)
    return NextResponse.json({ error: 'psicologo_id, paciente_phone e message são obrigatórios.' }, { status: 400 })

  // 20 mensagens por IP a cada 15 minutos
  const ip = getClientIp(req)
  if (!checkRateLimit(`chat:${ip}`, 20)) {
    return NextResponse.json({ error: 'Muitas mensagens. Aguarde alguns minutos.' }, { status: 429 })
  }

  // Busca psicólogo
  const { rows: psicRows } = await pool.query(
    `SELECT id, nome, plano FROM psicologos WHERE id = $1`,
    [psicologo_id],
  )
  if (psicRows.length === 0)
    return NextResponse.json({ error: 'Link de agendamento inválido.' }, { status: 404 })

  const psic = psicRows[0]
  if (psic.plano === 'bloqueado')
    return NextResponse.json({ error: 'Agendamento temporariamente indisponível.' }, { status: 403 })

  // Busca ou cria paciente pelo telefone
  const phoneNorm = paciente_phone.replace(/\D/g, '')
  let pacienteId: string
  let valorSessao = 150

  const { rows: pacRows } = await pool.query(
    `SELECT id, valor_sessao FROM pacientes
     WHERE psicologo_id = $1 AND REGEXP_REPLACE(telefone, '[^0-9]', '', 'g') = $2 AND ativo = true LIMIT 1`,
    [psicologo_id, phoneNorm],
  )

  if (pacRows.length > 0) {
    pacienteId = pacRows[0].id
    valorSessao = Number(pacRows[0].valor_sessao) || 150
  } else {
    const { rows: newPac } = await pool.query(
      `INSERT INTO pacientes (psicologo_id, nome, telefone, valor_sessao) VALUES ($1, $2, $3, 150) RETURNING id`,
      [psicologo_id, (paciente_nome || 'Paciente').trim(), paciente_phone],
    )
    pacienteId = newPac[0].id
  }

  const agora = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const systemPrompt = `Você é a July, assistente virtual de agendamento${psic.nome ? ` do consultório de ${psic.nome}` : ''}.

Você ajuda pacientes a agendar, cancelar e reagendar consultas de psicologia de forma cordial e eficiente.

Regras de comportamento:
- Responda sempre em português brasileiro, com tom acolhedor, educado e empático
- Nunca forneça orientações clínicas, diagnósticos ou conselhos terapêuticos
- Nunca invente horários — use sempre a ferramenta verificar_horarios
- Apresente no máximo 5 opções de horário por vez
- Ao agendar, confirme data, horário e valor ANTES de executar
- Respostas curtas e objetivas, sem enrolação

Informações do consultório:
- Valor da sessão: R$ ${valorSessao.toFixed(2).replace('.', ',')}
- Duração: 50 minutos
- Atendimento: segunda a sexta

Fluxo de agendamento:
1. Cumprimente o paciente pelo nome de forma calorosa
2. Pergunte se é primeira consulta ou retorno
3. Use verificar_horarios e apresente as opções disponíveis
4. Aguarde o paciente escolher um horário
5. Confirme: "Posso confirmar sua consulta para [dia], [data] às [hora], no valor de R$ [valor]?"
6. Após confirmação, use agendar_sessao e finalize: "Pronto! Consulta confirmada. Até lá! 😊"

Fluxo de cancelamento/reagendamento:
1. Use buscar_proxima_sessao para localizar o agendamento
2. Pergunte o motivo (opcional, de forma gentil)
3. Para cancelar: use cancelar_ou_reagendar com status="cancelado" e confirme
4. Para reagendar: use verificar_horarios, o paciente escolhe novo horário, então use cancelar_ou_reagendar

Se o paciente perguntar sobre dúvidas clínicas, diga gentilmente que essas questões devem ser tratadas diretamente com o profissional na consulta.

Nome do paciente: ${paciente_nome}
Data/hora atual: ${agora}`

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4.5'),
      system: systemPrompt,
      messages: [
        ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: message.slice(0, 500) },
      ],
      stopWhen: stepCountIs(6),
      tools: {
        verificar_horarios: tool({
          description: 'Verifica os horários disponíveis para agendamento nos próximos dias (segunda a sexta). Retorna lista de slots com data_hora_utc — use esse valor EXATO em agendar_sessao.',
          inputSchema: z.object({
            dias: z.number().min(1).max(30).default(7).describe('Quantos dias à frente buscar'),
          }),
          execute: async ({ dias }) => {
            const agora = new Date()
            const limite = new Date(agora)
            limite.setDate(limite.getDate() + dias)

            const { rows } = await pool.query(
              `SELECT data_hora FROM sessoes
               WHERE psicologo_id = $1 AND status = 'agendado'
                 AND data_hora >= $2 AND data_hora < $3`,
              [psicologo_id, agora.toISOString(), limite.toISOString()],
            )

            // node-postgres retorna TIMESTAMPTZ como Date — normaliza para ISO sem ambiguidade
            const ocupados = new Set(
              rows.map((s) => (s.data_hora instanceof Date ? s.data_hora : new Date(s.data_hora + 'Z')).toISOString())
            )

            const slots: { descricao: string; data_hora_utc: string }[] = []

            for (let d = 1; d <= dias && slots.length < 20; d++) {
              // Calcula o dia em UTC para evitar mix de local/UTC
              const baseMs = agora.getTime()
              const diaMs = baseMs + d * 86_400_000
              const dia = new Date(diaMs)
              // Zera para meia-noite BRT (03:00 UTC)
              const diaUTC = new Date(Date.UTC(dia.getUTCFullYear(), dia.getUTCMonth(), dia.getUTCDate(), 3, 0, 0, 0))
              const dow = diaUTC.getUTCDay()
              if (dow === 0 || dow === 6) continue

              for (const hora of HORARIOS_PADRAO) {
                const slot = new Date(Date.UTC(
                  diaUTC.getUTCFullYear(), diaUTC.getUTCMonth(), diaUTC.getUTCDate(),
                  hora + 3, 0, 0, 0  // hora BRT → UTC (+3)
                ))
                if (!ocupados.has(slot.toISOString())) {
                  const label = slot.toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  slots.push({ descricao: label, data_hora_utc: slot.toISOString() })
                }
              }
            }
            return {
              slots: slots.slice(0, 20),
              instrucao: 'Use o campo data_hora_utc EXATO em agendar_sessao. Nunca construa uma data manualmente.',
            }
          },
        }),

        agendar_sessao: tool({
          description: 'Agenda uma sessão. Use SOMENTE o campo data_hora_utc retornado por verificar_horarios — nunca construa a data manualmente.',
          inputSchema: z.object({
            data_hora_utc: z.string().describe('Valor EXATO do campo data_hora_utc retornado por verificar_horarios (ISO 8601 UTC)'),
            observacoes: z.string().optional().describe('Observações opcionais'),
          }),
          execute: async ({ data_hora_utc, observacoes }) => {
            // Valida que o horário é um slot BRT válido (horas UTC esperadas: 11-20)
            const dt = new Date(data_hora_utc)
            if (isNaN(dt.getTime())) return { erro: 'data_hora_utc inválido.' }

            const horaUTC = dt.getUTCHours()
            const minutosUTC = dt.getUTCMinutes()
            const horasUtcValidas = HORARIOS_PADRAO.map(h => h + 3) // [11,12,13,14,17,18,19,20]
            if (!horasUtcValidas.includes(horaUTC) || minutosUTC !== 0) {
              return {
                erro: `Horário inválido (${horaUTC}:${minutosUTC} UTC). Use exatamente o campo data_hora_utc retornado por verificar_horarios.`,
              }
            }

            const conflito = await pool.query(
              `SELECT id FROM sessoes WHERE psicologo_id = $1 AND status = 'agendado' AND data_hora = $2`,
              [psicologo_id, dt.toISOString()],
            )
            if (conflito.rows.length > 0)
              return { erro: 'Horário já ocupado, por favor escolha outro.' }

            const { rows } = await pool.query(
              `INSERT INTO sessoes (psicologo_id, paciente_id, data_hora, duracao_min, valor, observacoes, status)
               VALUES ($1, $2, $3, 50, $4, $5, 'agendado') RETURNING id, data_hora`,
              [psicologo_id, pacienteId, dt.toISOString(), valorSessao, observacoes || null],
            )
            const dtFormatada = new Date(rows[0].data_hora).toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
            return { sucesso: true, sessao_id: rows[0].id, data_hora_formatada: dtFormatada }
          },
        }),

        buscar_proxima_sessao: tool({
          description: 'Busca a próxima sessão agendada do paciente.',
          inputSchema: z.object({}),
          execute: async () => {
            const { rows } = await pool.query(
              `SELECT s.id, s.data_hora, s.valor FROM sessoes s
               WHERE s.paciente_id = $1 AND s.psicologo_id = $2
                 AND s.status = 'agendado' AND s.data_hora > NOW()
               ORDER BY s.data_hora ASC LIMIT 1`,
              [pacienteId, psicologo_id],
            )
            if (rows.length === 0) return { encontrado: false }
            const dt = new Date(rows[0].data_hora).toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
            return { encontrado: true, sessao_id: rows[0].id, data_hora_formatada: dt, valor: rows[0].valor }
          },
        }),

        cancelar_ou_reagendar: tool({
          description: 'Cancela ou reagenda uma sessão. Para cancelar: status="cancelado". Para reagendar: informe data_hora.',
          inputSchema: z.object({
            sessao_id: z.string().describe('UUID da sessão a alterar'),
            status: z.enum(['cancelado', 'agendado']).optional().describe('"cancelado" para cancelar'),
            data_hora: z.string().optional().describe('Novo horário ISO 8601 (para reagendamento)'),
            observacoes: z.string().optional().describe('Motivo ou observação'),
          }),
          execute: async ({ sessao_id, status, data_hora, observacoes }) => {
            const campos: string[] = []
            const valores: unknown[] = []
            let idx = 1
            if (status) { campos.push(`status = $${idx++}`); valores.push(status) }
            if (data_hora) { campos.push(`data_hora = $${idx++}`); valores.push(data_hora) }
            if (observacoes) { campos.push(`observacoes = $${idx++}`); valores.push(observacoes) }
            if (campos.length === 0) return { erro: 'Nenhum campo para atualizar.' }
            valores.push(sessao_id, psicologo_id)
            const { rows } = await pool.query(
              `UPDATE sessoes SET ${campos.join(', ')} WHERE id = $${idx} AND psicologo_id = $${idx + 1} RETURNING id, status, data_hora`,
              valores,
            )
            if (rows.length === 0) return { erro: 'Sessão não encontrada.' }
            return { sucesso: true, sessao: rows[0] }
          },
        }),
      },
    })

    return NextResponse.json({ reply: text, paciente_id: pacienteId })
  } catch (err) {
    console.error('[agendar/chat]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
