import { auth } from '@/auth'
import pool from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, DEMO_PACIENTES } from '@/lib/mockData'

export async function GET(req: NextRequest) {
  if (isDemoMode()) return NextResponse.json(DEMO_PACIENTES)

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '100'), 1), 200)
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'), 0)
  const busca = searchParams.get('busca')?.trim() ?? ''

  try {
    const values: unknown[] = [session.user.id]
    let where = 'WHERE psicologo_id = $1 AND deleted_at IS NULL'
    if (busca) {
      values.push(`%${busca}%`)
      where += ` AND (nome ILIKE $${values.length} OR telefone ILIKE $${values.length} OR email ILIKE $${values.length})`
    }
    values.push(limit, offset)
    const { rows } = await pool.query(
      `SELECT * FROM pacientes ${where} ORDER BY nome LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    )
    const { rows: total } = await pool.query(
      `SELECT COUNT(*) FROM pacientes ${where.replace(/ LIMIT \$\d+ OFFSET \$\d+/, '')}`,
      values.slice(0, -2)
    )
    return NextResponse.json({ data: rows, total: parseInt(total[0].count), limit, offset })
  } catch (err) {
    console.error('[GET /api/pacientes]', err)
    return NextResponse.json({ error: 'Erro ao consultar pacientes.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (isDemoMode()) {
    const body = await req.json()
    return NextResponse.json({ id: 'p-new-' + Date.now(), psicologo_id: 'demo', ativo: true, created_at: new Date().toISOString(), ...body }, { status: 201 })
  }

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { nome, cpf, email, telefone, valor_sessao } = await req.json()
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })

  try {
    const { rows } = await pool.query(
      `INSERT INTO pacientes (psicologo_id, nome, cpf, email, telefone, valor_sessao)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [session.user.id, nome, cpf || null, email || null, telefone || null, valor_sessao ?? 150]
    )
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error('[POST /api/pacientes]', err)
    return NextResponse.json({ error: 'Erro ao cadastrar paciente.' }, { status: 500 })
  }
}
