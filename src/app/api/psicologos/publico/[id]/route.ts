/**
 * GET /api/psicologos/publico/[id]
 * Dados públicos do profissional — sem autenticação.
 * Usado na página de agendamento do paciente.
 */
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensurePsicologosSchema } from '@/lib/ensure-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
  }

  await ensurePsicologosSchema()

  try {
    const { rows } = await pool.query(
      `SELECT nome, crp, instagram, linkedin, site_url
       FROM psicologos WHERE id = $1`,
      [id]
    )

    if (!rows[0]) return NextResponse.json({ error: 'Profissional não encontrado.' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[GET /api/psicologos/publico]', err)
    return NextResponse.json({ error: 'Erro ao buscar profissional.' }, { status: 500 })
  }
}
