import { NextRequest, NextResponse } from 'next/server'
import { validateAdminToken } from '@/lib/admin-auth'
import pool from '@/lib/db'
import { ensurePsicologosSchema } from '@/lib/ensure-schema'

export async function GET(req: NextRequest) {
  if (!validateAdminToken(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await ensurePsicologosSchema()

  try {
    const { rows } = await pool.query(`
      SELECT
        id, nome, email, plano,
        trial_fim, is_teste, last_login_at, created_at,
        (SELECT COUNT(*)::int FROM sessoes WHERE psicologo_id = p.id) AS total_sessoes,
        (SELECT COUNT(*)::int FROM pacientes WHERE psicologo_id = p.id AND ativo = true) AS pacientes_ativos
      FROM psicologos p
      ORDER BY created_at DESC
    `)
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/admin/usuarios]', err)
    return NextResponse.json({ error: 'Erro ao consultar usuários.' }, { status: 500 })
  }
}
