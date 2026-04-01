import { auth } from '@/auth'
import pool from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, DEMO_PACIENTES } from '@/lib/mockData'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (isDemoMode()) {
    const paciente = DEMO_PACIENTES.find(p => p.id === id)
    if (!paciente) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(paciente)
  }

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { rows } = await pool.query(
      'SELECT * FROM pacientes WHERE id=$1 AND psicologo_id=$2',
      [id, session.user.id]
    )
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[GET /api/pacientes/[id]]', err)
    return NextResponse.json({ error: 'Erro ao consultar paciente.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  if (isDemoMode()) {
    const original = DEMO_PACIENTES.find(p => p.id === id) ?? {}
    return NextResponse.json({ ...original, ...body })
  }

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { nome, cpf, email, telefone, valor_sessao, ativo } = body

  try {
    const { rows } = await pool.query(
      `UPDATE pacientes
       SET nome=$1, cpf=$2, email=$3, telefone=$4, valor_sessao=$5, ativo=$6
       WHERE id=$7 AND psicologo_id=$8
       RETURNING *`,
      [nome, cpf || null, email || null, telefone || null, valor_sessao, ativo, id, session.user.id]
    )
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[PUT /api/pacientes/[id]]', err)
    return NextResponse.json({ error: 'Erro ao atualizar paciente.' }, { status: 500 })
  }
}
