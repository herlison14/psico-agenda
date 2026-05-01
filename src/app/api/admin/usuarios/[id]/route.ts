import { NextRequest, NextResponse } from 'next/server'
import { validateAdminToken } from '@/lib/admin-auth'
import { randomBytes } from 'crypto'
import pool from '@/lib/db'

type Acao =
  | 'pro'            // → Pro pago (remove is_teste)
  | 'trial'          // → Trial (mantém trial_fim existente ou define 14d se nulo)
  | 'teste'          // → Pro com flag de equipe interna
  | 'remover_teste'  // → Remove flag is_teste, mantém plano atual
  | 'extend'         // → +30 dias no trial
  | 'bloquear'       // → Bloqueia acesso
  | 'desbloquear'    // → Volta para trial (mantém trial_fim existente)
  | 'reset'          // → Trial zerado com 14 dias novos
  | 'link_reset'     // → Gera link de redefinição de senha (sem email)
  | 'reparar_conta'  // → Corrige email + senha_hash diretamente

const QUERIES: Record<Exclude<Acao, 'link_reset' | 'reparar_conta'>, string> = {
  pro:           `UPDATE psicologos SET plano='pro',      is_teste=false, trial_fim=NULL                                    WHERE id=$1`,
  trial:         `UPDATE psicologos SET plano='trial',    is_teste=false, trial_fim=COALESCE(trial_fim, NOW() + INTERVAL '14 days') WHERE id=$1`,
  teste:         `UPDATE psicologos SET plano='pro',      is_teste=true,  trial_fim=NULL                                    WHERE id=$1`,
  remover_teste: `UPDATE psicologos SET is_teste=false                                                                      WHERE id=$1`,
  extend:        `UPDATE psicologos SET trial_fim=COALESCE(trial_fim, NOW()) + INTERVAL '30 days'                           WHERE id=$1`,
  bloquear:      `UPDATE psicologos SET plano='bloqueado'                                                                   WHERE id=$1`,
  desbloquear:   `UPDATE psicologos SET plano='trial',    trial_fim=COALESCE(trial_fim, NOW() + INTERVAL '14 days')         WHERE id=$1`,
  reset:         `UPDATE psicologos SET plano='trial',    is_teste=false, trial_fim=NOW() + INTERVAL '14 days'              WHERE id=$1`,
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateAdminToken(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as { acao: Acao; email?: string; password_hash?: string }
  const { acao } = body

  // Ação especial: repara email + senha corrompidos/vazios
  if (acao === 'reparar_conta') {
    try {
      const updates: string[] = []
      const vals: unknown[] = []
      let i = 1
      if (body.email)         { updates.push(`email=$${i++}`);         vals.push(body.email) }
      if (body.password_hash) { updates.push(`password_hash=$${i++}`); vals.push(body.password_hash) }
      if (updates.length === 0)
        return NextResponse.json({ error: 'Nenhum campo para reparar.' }, { status: 400 })
      vals.push(id)
      const { rowCount } = await pool.query(
        `UPDATE psicologos SET ${updates.join(', ')} WHERE id=$${i} RETURNING id, email`,
        vals,
      )
      if (!rowCount) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
      console.log('[admin] reparar_conta id=%s email=%s', id, body.email)
      return NextResponse.json({ ok: true })
    } catch (err) {
      console.error('[admin/reparar_conta]', err)
      return NextResponse.json({ error: 'Erro ao reparar.' }, { status: 500 })
    }
  }

  // Ação especial: gera link de reset de senha sem precisar de email
  if (acao === 'link_reset') {
    try {
      await pool.query(
        'CREATE TABLE IF NOT EXISTS password_reset_tokens (id SERIAL PRIMARY KEY, psicologo_id UUID NOT NULL, token TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL, used_at TIMESTAMPTZ)',
      )
      await pool.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE psicologo_id = $1 AND used_at IS NULL',
        [id],
      )
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 horas
      await pool.query(
        'INSERT INTO password_reset_tokens (psicologo_id, token, expires_at) VALUES ($1, $2, $3)',
        [id, token, expiresAt],
      )
      const baseUrl = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://psiplanner.com.br').replace(/\/$/, '')
      return NextResponse.json({ ok: true, link: `${baseUrl}/nova-senha?token=${token}` })
    } catch (err) {
      console.error('[admin/link_reset]', err)
      return NextResponse.json({ error: 'Erro ao gerar link.' }, { status: 500 })
    }
  }

  type AcaoSQL = Exclude<Acao, 'link_reset' | 'reparar_conta'>
  if (!QUERIES[acao as AcaoSQL])
    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 })

  try {
    const { rowCount } = await pool.query(QUERIES[acao as AcaoSQL], [id])
    if (!rowCount) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    console.log('[admin] acao=%s id=%s', acao, id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/usuarios/[id]]', err)
    return NextResponse.json({ error: 'Erro ao aplicar ação.' }, { status: 500 })
  }
}
