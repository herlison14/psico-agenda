import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

/**
 * DELETE /api/account
 * Exclui permanentemente a conta do psicólogo autenticado e todos os seus dados.
 * Requisito LGPD — direito ao esquecimento (Art. 18, VI).
 *
 * Ordem de exclusão respeita FK constraints:
 *   sessoes → pacientes → password_reset_tokens → rate_limits → psicologos
 */
export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const psicologoId = session.user.id
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Sessões (prontuários, transcrições etc.)
    await client.query(
      'DELETE FROM sessoes WHERE psicologo_id = $1',
      [psicologoId],
    )

    // 2. Pacientes
    await client.query(
      'DELETE FROM pacientes WHERE psicologo_id = $1',
      [psicologoId],
    )

    // 3. Tokens de reset de senha
    await client.query(
      'DELETE FROM password_reset_tokens WHERE psicologo_id = $1',
      [psicologoId],
    )

    // 4. Rate-limit entries (chave contém e-mail ou UUID)
    await client.query(
      "DELETE FROM rate_limits WHERE key LIKE $1",
      [`%${psicologoId}%`],
    )

    // 5. Próprio registro
    await client.query(
      'DELETE FROM psicologos WHERE id = $1',
      [psicologoId],
    )

    await client.query('COMMIT')

    console.log('[account/delete] conta excluída:', psicologoId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[account/delete]', err)
    return NextResponse.json({ error: 'Erro ao excluir conta. Tente novamente.' }, { status: 500 })
  } finally {
    client.release()
  }
}
