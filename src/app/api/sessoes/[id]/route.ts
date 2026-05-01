import { auth } from '@/auth'
import pool from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, DEMO_SESSOES } from '@/lib/mockData'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (isDemoMode()) return NextResponse.json({ ok: true })

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { rows } = await pool.query(
      `UPDATE sessoes SET deleted_at = NOW(), status = 'cancelado'
       WHERE id = $1 AND psicologo_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [id, session.user.id]
    )
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/sessoes/[id]]', err)
    return NextResponse.json({ error: 'Erro ao remover sessão.' }, { status: 500 })
  }
}

const ALLOWED_STATUS = new Set(['agendado', 'realizado', 'cancelado', 'faltou'])
const ALLOWED_PAGAMENTO = new Set(['pendente', 'pago', 'isento'])

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { status, notas_clinicas, pagamento_status } = body

  if (status !== undefined && !ALLOWED_STATUS.has(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
  }
  if (pagamento_status !== undefined && !ALLOWED_PAGAMENTO.has(pagamento_status)) {
    return NextResponse.json({ error: 'Status de pagamento inválido.' }, { status: 400 })
  }

  if (isDemoMode()) {
    const sessao = DEMO_SESSOES.find(s => s.id === id)
    if (sessao) {
      if (status !== undefined) sessao.status = status as typeof sessao.status
      if (notas_clinicas !== undefined) sessao.notas_clinicas = notas_clinicas
    }
    return NextResponse.json({ ...(sessao ?? { id }), ...body })
  }

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const updates: string[] = []
  const values: unknown[] = []
  let idx = 1
  if (status !== undefined) { updates.push(`status=$${idx++}`); values.push(status) }
  if (notas_clinicas !== undefined) { updates.push(`notas_clinicas=$${idx++}`); values.push(notas_clinicas) }
  if (pagamento_status !== undefined) { updates.push(`pagamento_status=$${idx++}`); values.push(pagamento_status) }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar.' }, { status: 400 })
  }

  values.push(id, session.user.id)

  try {
    const { rows } = await pool.query(
      `UPDATE sessoes SET ${updates.join(', ')} WHERE id=$${idx++} AND psicologo_id=$${idx} RETURNING *`,
      values
    )

    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[PUT /api/sessoes/[id]]', err)
    return NextResponse.json({ error: 'Erro ao atualizar sessão.' }, { status: 500 })
  }
}
