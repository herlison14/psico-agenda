import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

// Retorna quantidade de sessões agendadas na última hora (via link/agente)
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ count: 0 }, { status: 401 })

  const { rows } = await pool.query(
    `SELECT COUNT(*)::int as count
     FROM sessoes
     WHERE psicologo_id = $1
       AND status = 'agendado'
       AND created_at >= NOW() - INTERVAL '1 hour'`,
    [session.user.id],
  )

  return NextResponse.json({ count: rows[0]?.count ?? 0 })
}
