import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

/**
 * POST /api/pagamento/cancelar
 * Rebaixa o plano do psicólogo autenticado para 'trial' (sem renovação automática).
 * Mantém acesso até o fim do período já pago (trial_fim permanece intacto).
 */
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const psicologoId = session.user.id

  try {
    const { rows } = await pool.query(
      'SELECT plano, trial_fim FROM psicologos WHERE id = $1',
      [psicologoId],
    )
    if (!rows.length) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    const { plano } = rows[0]
    if (plano !== 'pro') {
      return NextResponse.json({ error: 'Nenhuma assinatura ativa para cancelar.' }, { status: 400 })
    }

    // Rebaixa para trial — acesso mantido até trial_fim (data de expiração do Pro)
    await pool.query(
      `UPDATE psicologos
       SET plano = 'trial',
           mp_subscription_id = NULL
       WHERE id = $1`,
      [psicologoId],
    )

    console.log('[cancelar] plano revertido para trial:', psicologoId)
    return NextResponse.json({ ok: true, trial_fim: rows[0].trial_fim })
  } catch (err) {
    console.error('[cancelar]', err)
    return NextResponse.json({ error: 'Erro ao cancelar assinatura.' }, { status: 500 })
  }
}
