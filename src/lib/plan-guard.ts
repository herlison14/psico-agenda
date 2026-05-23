import pool from '@/lib/db'
import { NextResponse } from 'next/server'

/**
 * Verifica se o plano do psicólogo permite criar novos registros.
 * Retorna um NextResponse de erro (402) se bloqueado/expirado, ou null se OK.
 */
export async function checkPlanActive(psicologoId: string): Promise<NextResponse | null> {
  const { rows } = await pool.query<{ plano: string; trial_fim: string | null }>(
    'SELECT plano, trial_fim FROM psicologos WHERE id = $1',
    [psicologoId],
  )

  if (!rows.length) return null // usuário não encontrado — deixa o handler lidar

  const { plano, trial_fim } = rows[0]

  if (plano === 'bloqueado') {
    return NextResponse.json({ error: 'Conta bloqueada. Entre em contato com o suporte.' }, { status: 402 })
  }

  if (plano === 'trial' && trial_fim && new Date(trial_fim) < new Date()) {
    return NextResponse.json({ error: 'Período de teste expirado. Assine um plano para continuar.' }, { status: 402 })
  }

  return null
}
