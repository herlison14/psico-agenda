import { NextRequest, NextResponse } from 'next/server'
import { validateAdminToken } from '@/lib/admin-auth'
import pool from '@/lib/db'

// Migração lazy — roda apenas uma vez quando admin acessa o painel
async function ensureMigration() {
  await pool.query(`
    ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS is_teste   BOOLEAN     DEFAULT FALSE;
    ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
  `)
}

export async function GET(req: NextRequest) {
  if (!validateAdminToken(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await ensureMigration()

  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int                                                             AS total,
      COUNT(*) FILTER (WHERE plano = 'trial')::int                             AS trial,
      COUNT(*) FILTER (WHERE plano = 'pro' AND NOT COALESCE(is_teste,false))::int AS pro,
      COUNT(*) FILTER (WHERE COALESCE(is_teste,false) = true)::int             AS teste,
      COUNT(*) FILTER (WHERE plano = 'bloqueado')::int                         AS bloqueado,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int    AS novos_30d,
      COALESCE(SUM(
        CASE WHEN plano = 'pro' AND NOT COALESCE(is_teste,false) THEN 50 ELSE 0 END
      ), 0)::numeric                                                            AS receita_mensal
    FROM psicologos
  `)

  return NextResponse.json(rows[0])
}
