import { NextRequest, NextResponse } from 'next/server'
import { validateAdminToken } from '@/lib/admin-auth'
import pool from '@/lib/db'

type Acao = 'pro' | 'teste' | 'extend' | 'bloquear' | 'reset'

const QUERIES: Record<Acao, string> = {
  pro:      `UPDATE psicologos SET plano='pro',      is_teste=false, trial_fim=NULL                                WHERE id=$1`,
  teste:    `UPDATE psicologos SET plano='pro',      is_teste=true,  trial_fim=NULL                                WHERE id=$1`,
  extend:   `UPDATE psicologos SET trial_fim=COALESCE(trial_fim, NOW()) + INTERVAL '30 days'                      WHERE id=$1`,
  bloquear: `UPDATE psicologos SET plano='bloqueado'                                                               WHERE id=$1`,
  reset:    `UPDATE psicologos SET plano='trial',    is_teste=false, trial_fim=NOW() + INTERVAL '14 days'          WHERE id=$1`,
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateAdminToken(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { acao } = await req.json() as { acao: Acao }

  if (!QUERIES[acao])
    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 })

  try {
    await pool.query(QUERIES[acao], [id])
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/usuarios/[id]]', err)
    return NextResponse.json({ error: 'Erro ao aplicar ação.' }, { status: 500 })
  }
}
