import { NextRequest, NextResponse } from 'next/server'
import { generateText, tool, stepCountIs } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import pool from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { ensurePacientesSchema } from '@/lib/ensure-schema'

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

  // Garante que as colunas ativo e deleted_at existem antes de qualquer SELECT/INSERT
  await ensurePacientesSchema()

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

Fluxo de agendamento (sessão única):
1. Cumprimente o paciente pelo nome de forma calorosa
2. Pergunte: "Você gostaria de agendar uma sessão avulsa ou um pacote de sessões (ex: 4, 8 ou 12 sessões semanais)?"
3. Se SESSÃO AVULSA → siga o fluxo normal abaixo
4. Se PACOTE → siga o fluxo de pacote

Fluxo sessão avulsa:
1. Use verificar_horarios e apresente até 5 opções
2. Confirme: "Posso confirmar para [dia] às [hora], valor R$ [valor]?"
3. Use agendar_sessao e finalize com:
   "Pronto! ✅ Confirmada para [data_hora_formatada] 😊
   📄 Comprovante + Políticas de Cancelamento: [confirmacao_url]
   Até lá!"

Fluxo de PACOTE de sessões:
1. Pergunte: "Quantas sessões no pacote? (ex: 4, 8 ou 12)"
2. Pergunte: "Qual frequência? Semanal (7 dias), quinzenal (14 dias) ou mensal (30 dias)?"
3. Use verificar_horarios para encontrar o primeiro horário disponível
4. Apresente: "Posso confirmar um pacote de [N] sessões [frequência], começando em [data_hora], valor R$ [valor] por sessão (total R$ [total])?"
5. Após confirmação, use agendar_pacote
6. Finalize com:
   "Pacote confirmado! ✅ [N] sessões agendadas a partir de [data] 😊
   📄 Comprovante da primeira sessão + Políticas: [confirmacao_url]
   As datas completas estão registradas na agenda do profissional."

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
      model: anthropic('claude-haiku-4-5'),
      system: systemPrompt,
      messages: [
        ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: message.slice(0, 500) },
      ],
      stopWhen: stepCountIs(6),
      tools: {
        verificar_horarios: tool({
          description: 'Verifica os horários disponíveis para agendamento nos próximos dias (segunda a sexta). Retorna lista de slots — use o campo horario_token EXATO em agendar_sessao, sem modificações.',
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

            // Normaliza ocupados para ISO UTC
            const ocupados = new Set(
              rows.map((s) => (s.data_hora instanceof Date ? s.data_hora : new Date(s.data_hora + 'Z')).toISOString())
            )

            const slots: { descricao: string; horario_token: string }[] = []

            // Referência: agora em BRT
            const agoraBRT = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))

            for (let d = 1; d <= dias && slots.length < 20; d++) {
              // Constrói o dia em BRT (YYYY-MM-DD)
              const diaBRT = new Date(agoraBRT)
              diaBRT.setDate(diaBRT.getDate() + d)
              const ano  = diaBRT.getFullYear()
              const mes  = diaBRT.getMonth()
              const dia  = diaBRT.getDate()
              const dow  = diaBRT.getDay() // 0=Dom, 6=Sab
              if (dow === 0 || dow === 6) continue

              for (const horaBRT of HORARIOS_PADRAO) {
                // Constrói o slot como UTC para comparar com ocupados
                const slotUTC = new Date(Date.UTC(ano, mes, dia, horaBRT + 3, 0, 0, 0))
                if (ocupados.has(slotUTC.toISOString())) continue

                // horario_token: ISO com offset BRT explícito — o AI usa esse valor literal
                const pad = (n: number) => String(n).padStart(2, '0')
                const horario_token = `${ano}-${pad(mes + 1)}-${pad(dia)}T${pad(horaBRT)}:00:00-03:00`

                const descricao = slotUTC.toLocaleString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                  weekday: 'long',
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                slots.push({ descricao, horario_token })
              }
            }
            return {
              slots: slots.slice(0, 20),
              instrucao: 'Use o campo horario_token EXATAMENTE como recebeu em agendar_sessao. Nunca altere o valor.',
            }
          },
        }),

        agendar_sessao: tool({
          description: 'Agenda uma sessão. Use SOMENTE o campo horario_token retornado por verificar_horarios — copie o valor sem nenhuma modificação.',
          inputSchema: z.object({
            horario_token: z.string().describe('Valor EXATO do campo horario_token retornado por verificar_horarios (ex: "2025-05-07T14:00:00-03:00")'),
            observacoes: z.string().optional().describe('Observações opcionais'),
          }),
          execute: async ({ horario_token, observacoes }) => {
            // Parseia o token com offset BRT (-03:00) — JS converte para UTC automaticamente
            const dt = new Date(horario_token)
            if (isNaN(dt.getTime())) return { erro: 'horario_token inválido.' }

            // Valida hora BRT: extrai da string (posição 11-13)
            const horaBRTStr = horario_token.slice(11, 13)
            const horaBRT = parseInt(horaBRTStr, 10)
            const minBRT  = parseInt(horario_token.slice(14, 16), 10)
            if (!HORARIOS_PADRAO.includes(horaBRT) || minBRT !== 0) {
              return {
                erro: `Horário inválido (${horaBRTStr}h BRT). Use exatamente o horario_token retornado por verificar_horarios.`,
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
            // Formata a confirmação em BRT
            const dtFormatada = new Date(rows[0].data_hora).toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
            const baseUrl = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://psiplanner.com.br').replace(/\/$/, '')
            const confirmacaoUrl = `${baseUrl}/api/confirmacao/${rows[0].id}`
            return { sucesso: true, sessao_id: rows[0].id, data_hora_formatada: dtFormatada, confirmacao_url: confirmacaoUrl }
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

        agendar_pacote: tool({
          description: 'Agenda um pacote de múltiplas sessões recorrentes. Use SOMENTE após confirmar com o paciente: quantidade, frequência e horário base (retornado por verificar_horarios).',
          inputSchema: z.object({
            horario_token: z.string().describe('Token da PRIMEIRA sessão retornado por verificar_horarios (ex: "2025-05-07T14:00:00-03:00")'),
            quantidade: z.number().min(2).max(52).describe('Número de sessões no pacote (ex: 4, 8, 12)'),
            intervalo_dias: z.number().min(1).describe('Intervalo entre sessões em dias: 7=semanal, 14=quinzenal, 30=mensal'),
            observacoes: z.string().optional().describe('Observação sobre o pacote'),
          }),
          execute: async ({ horario_token, quantidade, intervalo_dias, observacoes }) => {
            const dt0 = new Date(horario_token)
            if (isNaN(dt0.getTime())) return { erro: 'horario_token inválido.' }

            // Valida hora BRT
            const horaBRT = parseInt(horario_token.slice(11, 13), 10)
            const minBRT  = parseInt(horario_token.slice(14, 16), 10)
            if (!HORARIOS_PADRAO.includes(horaBRT) || minBRT !== 0)
              return { erro: 'Horário inválido. Use o token exato retornado por verificar_horarios.' }

            // Gera todas as datas
            const datas: Date[] = []
            for (let i = 0; i < quantidade; i++) {
              datas.push(new Date(dt0.getTime() + i * intervalo_dias * 86_400_000))
            }

            // Checa conflitos
            const phConflito = datas.map((_, i) => `$${i + 2}`).join(', ')
            const { rows: conflitos } = await pool.query(
              `SELECT data_hora FROM sessoes
               WHERE psicologo_id = $1 AND status = 'agendado' AND deleted_at IS NULL
                 AND data_hora IN (${phConflito})`,
              [psicologo_id, ...datas.map(d => d.toISOString())],
            )
            if (conflitos.length > 0) {
              const ocupados = conflitos.map(r =>
                new Date(r.data_hora).toLocaleString('pt-BR', {
                  timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                }),
              ).join(', ')
              return { erro: `Conflitos de horário nessas datas: ${ocupados}. Por favor, escolha outro horário.` }
            }

            // Insere todas as sessões
            const client = await pool.connect()
            const sessoesCriadas: { id: string; data_hora_fmt: string }[] = []
            try {
              await client.query('BEGIN')
              for (const dt of datas) {
                const { rows } = await client.query(
                  `INSERT INTO sessoes (psicologo_id, paciente_id, data_hora, duracao_min, valor, observacoes, status, pagamento_status)
                   VALUES ($1, $2, $3, 50, $4, $5, 'agendado', 'pendente') RETURNING id, data_hora`,
                  [psicologo_id, pacienteId, dt.toISOString(), valorSessao, observacoes || `Pacote ${quantidade}x` ],
                )
                sessoesCriadas.push({
                  id: rows[0].id,
                  data_hora_fmt: new Date(rows[0].data_hora).toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                  }),
                })
              }
              await client.query('COMMIT')
            } catch (err) {
              await client.query('ROLLBACK')
              console.error('[agendar_pacote] rollback:', err)
              return { erro: 'Erro ao registrar o pacote. Tente novamente.' }
            } finally {
              client.release()
            }

            const baseUrl = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://psiplanner.com.br').replace(/\/$/, '')
            const confirmacaoUrl = `${baseUrl}/api/confirmacao/${sessoesCriadas[0].id}`
            const totalValor = (valorSessao * quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

            return {
              sucesso: true,
              quantidade: sessoesCriadas.length,
              total_valor: totalValor,
              sessoes_resumo: sessoesCriadas.map(s => s.data_hora_fmt).join(' | '),
              confirmacao_url: confirmacaoUrl,
            }
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
