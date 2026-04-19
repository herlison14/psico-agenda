import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verificarAgenteApiKey, getPsicologoId } from '@/lib/agente-auth'

// Horários padrão de atendimento (hora cheia)
const HORARIOS_PADRAO = [8, 9, 10, 11, 14, 15, 16, 17]

// GET /api/agente/horarios?dias=7
export async function GET(req: NextRequest) {
  if (!verificarAgenteApiKey(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const psicologo_id = getPsicologoId()
  const { searchParams } = req.nextUrl
  const diasRaw = parseInt(searchParams.get('dias') ?? '7')
  const dias = isNaN(diasRaw) ? 7 : Math.min(Math.max(diasRaw, 1), 30)

  // Busca sessões agendadas nos próximos N dias
  const agora = new Date()
  const limite = new Date(agora)
  limite.setDate(limite.getDate() + dias)

  const { rows: sessoesOcupadas } = await pool.query(
    `SELECT data_hora FROM sessoes
     WHERE psicologo_id = $1
       AND status = 'agendado'
       AND data_hora >= $2
       AND data_hora < $3`,
    [psicologo_id, agora.toISOString(), limite.toISOString()]
  )

  const ocupados = new Set(
    sessoesOcupadas.map(s => new Date(s.data_hora).toISOString())
  )

  // Gera slots disponíveis (seg-sex, horários padrão)
  const slots: { data: string; hora: string; data_hora: string }[] = []

  for (let d = 1; d <= dias; d++) {
    const dia = new Date(agora)
    dia.setDate(dia.getDate() + d)
    dia.setUTCHours(3, 0, 0, 0) // meia-noite BRT (UTC-3) = 03:00 UTC

    const diaSemana = dia.getUTCDay()
    if (diaSemana === 0 || diaSemana === 6) continue // pula fim de semana

    for (const hora of HORARIOS_PADRAO) {
      const slot = new Date(dia)
      slot.setUTCHours(hora + 3, 0, 0, 0) // hora BRT → UTC

      if (!ocupados.has(slot.toISOString())) {
        slots.push({
          data: dia.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }),
          hora: `${hora.toString().padStart(2, '0')}:00`,
          data_hora: slot.toISOString(),
        })
      }
    }
  }

  return NextResponse.json({ slots })
}
