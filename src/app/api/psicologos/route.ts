import { auth } from '@/auth'
import pool from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, DEMO_PSICOLOGO } from '@/lib/mockData'
import { ensurePsicologosSchema } from '@/lib/ensure-schema'

export async function GET() {
  if (isDemoMode()) return NextResponse.json(DEMO_PSICOLOGO)

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await ensurePsicologosSchema()

  try {
    const { rows } = await pool.query(
      `SELECT id, nome, crp, cpf, email, telefone, endereco, cidade, estado,
              instagram, linkedin, site_url,
              plano, trial_fim, created_at
       FROM psicologos WHERE id = $1`,
      [session.user.id]
    )

    return NextResponse.json(rows[0] ?? null)
  } catch (err) {
    console.error('[GET /api/psicologos]', err)
    return NextResponse.json({ error: 'Erro ao consultar perfil.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (isDemoMode()) {
    const body = await req.json()
    return NextResponse.json({ ...DEMO_PSICOLOGO, ...body })
  }

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await ensurePsicologosSchema()

  const body = await req.json()
  const { nome, crp, cpf, email, telefone, endereco, cidade, estado, instagram, linkedin, site_url } = body

  try {
    const { rows } = await pool.query(
      `UPDATE psicologos
       SET nome=$1, crp=$2, cpf=$3, email=$4, telefone=$5, endereco=$6, cidade=$7, estado=$8,
           instagram=$9, linkedin=$10, site_url=$11
       WHERE id=$12
       RETURNING id, nome, crp, cpf, email, telefone, endereco, cidade, estado, instagram, linkedin, site_url`,
      [nome, crp, cpf, email || null, telefone, endereco, cidade, estado, instagram || null, linkedin || null, site_url || null, session.user.id]
    )

    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[PUT /api/psicologos]', err)
    return NextResponse.json({ error: 'Erro ao atualizar perfil.' }, { status: 500 })
  }
}
