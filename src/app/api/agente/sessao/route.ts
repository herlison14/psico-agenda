import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verificarAgenteApiKey, getPsicologoId } from '@/lib/agente-auth'

// POST /api/agente/sessao — agenda uma nova sessão
export async function POST(req: NextRequest) {
  if (!verificarAgenteApiKey(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const psicologo_id = getPsicologoId()

  const { paciente_id, data_hora, duracao_min, valor, observacoes } = await req.json()

  if (!paciente_id || !data_hora || !valor)
    return NextResponse.json(
      { error: 'paciente_id, data_hora e valor são obrigatórios' },
      { status: 400 }
    )

  try {
    // Garante que o paciente pertence a este psicólogo
    const { rows: pacCheck } = await pool.query(
      'SELECT id FROM pacientes WHERE id = $1 AND psicologo_id = $2',
      [paciente_id, psicologo_id]
    )
    if (pacCheck.length === 0)
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 403 })

    // Verifica conflito de horário
    const { rows: conflito } = await pool.query(
      `SELECT id FROM sessoes
       WHERE psicologo_id = $1 AND status = 'agendado' AND data_hora = $2`,
      [psicologo_id, data_hora]
    )
    if (conflito.length > 0)
      return NextResponse.json({ error: 'Horário já ocupado' }, { status: 409 })

    const { rows } = await pool.query(
      `INSERT INTO sessoes (psicologo_id, paciente_id, data_hora, duracao_min, valor, observacoes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'agendado')
       RETURNING *, (SELECT nome FROM pacientes WHERE id = $2) as paciente_nome`,
      [psicologo_id, paciente_id, data_hora, duracao_min ?? 50, valor, observacoes || null]
    )

    return NextResponse.json({ sessao: rows[0] }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/agente/sessao]', err)
    return NextResponse.json({ error: 'Erro interno ao agendar sessão' }, { status: 500 })
  }
}
