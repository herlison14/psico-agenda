import { auth } from '@/auth'
import pool from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, DEMO_RECIBOS } from '@/lib/mockData'

export async function GET() {
  if (isDemoMode()) return NextResponse.json(DEMO_RECIBOS)

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { rows } = await pool.query(
      `SELECT
         r.id, r.psicologo_id, r.paciente_id, r.sessao_id,
         r.numero, r.valor, r.data_emissao, r.descricao, r.created_at,
         json_build_object('id', p.id, 'nome', p.nome, 'cpf', p.cpf, 'email', p.email) AS paciente
       FROM recibos r
       LEFT JOIN pacientes p ON p.id = r.paciente_id
       WHERE r.psicologo_id = $1
       ORDER BY r.numero DESC`,
      [session.user.id]
    )

    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/recibos]', err)
    return NextResponse.json({ error: 'Erro ao consultar recibos.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (isDemoMode()) {
    const body = await req.json()
    const numero = DEMO_RECIBOS.length + 1
    return NextResponse.json({ id: 'r-new-' + Date.now(), psicologo_id: 'demo', numero, created_at: new Date().toISOString(), ...body }, { status: 201 })
  }

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { paciente_id, sessao_id, valor, data_emissao, descricao } = await req.json()

  if (!paciente_id || valor == null || !data_emissao) {
    return NextResponse.json({ error: 'paciente_id, valor e data_emissao são obrigatórios.' }, { status: 400 })
  }

  try {
    // Garante que paciente pertence ao psicólogo logado
    const { rows: pacCheck } = await pool.query(
      'SELECT id FROM pacientes WHERE id = $1 AND psicologo_id = $2',
      [paciente_id, session.user.id]
    )
    if (pacCheck.length === 0)
      return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 403 })

    // Garante que sessão (se fornecida) pertence ao psicólogo logado
    if (sessao_id) {
      const { rows: sesCheck } = await pool.query(
        'SELECT id FROM sessoes WHERE id = $1 AND psicologo_id = $2',
        [sessao_id, session.user.id]
      )
      if (sesCheck.length === 0)
        return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 403 })
    }

    const { rows: last } = await pool.query(
      'SELECT COALESCE(MAX(numero), 0) + 1 as proximo FROM recibos WHERE psicologo_id = $1',
      [session.user.id]
    )
    const numero = last[0].proximo

    const { rows } = await pool.query(
      `INSERT INTO recibos (psicologo_id, paciente_id, sessao_id, numero, valor, data_emissao, descricao)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [session.user.id, paciente_id, sessao_id || null, numero, valor, data_emissao, descricao ?? 'Consulta Psicológica']
    )

    return NextResponse.json({ ...rows[0], numero }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/recibos]', err)
    return NextResponse.json({ error: 'Erro ao emitir recibo.' }, { status: 500 })
  }
}
