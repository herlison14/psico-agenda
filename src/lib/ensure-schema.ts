/**
 * Lazy schema migrations — run on first request, idempotent.
 * Avoids requiring a manual /api/migrate call in production.
 */
import pool from '@/lib/db'

const done = new Set<string>()

async function run(key: string, sql: string) {
  if (done.has(key)) return
  try {
    await pool.query(sql)
    done.add(key)
  } catch (err) {
    // Não bloqueia a request em caso de erro de permissão etc.
    console.warn(`[ensure-schema] ${key}:`, err)
  }
}

export async function ensurePacientesSchema() {
  await run(
    'pacientes_deleted_at',
    'ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ',
  )
  await run(
    'pacientes_ativo',
    'ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE',
  )
}

export async function ensureSessoesSchema() {
  await run(
    'sessoes_deleted_at',
    'ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ',
  )
  await run(
    'sessoes_notas_clinicas',
    'ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS notas_clinicas TEXT',
  )
  await run(
    'sessoes_pagamento_status',
    `ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS pagamento_status TEXT NOT NULL DEFAULT 'pendente'`,
  )
}

export async function ensurePsicologosSchema() {
  await run(
    'psicologos_plano',
    "ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS plano TEXT DEFAULT 'trial'",
  )
  await run(
    'psicologos_trial_fim',
    "ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS trial_fim TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days'",
  )
  await run(
    'psicologos_is_teste',
    'ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS is_teste BOOLEAN DEFAULT FALSE',
  )
  await run(
    'psicologos_last_login',
    'ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ',
  )
  await run(
    'psicologos_instagram',
    'ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS instagram TEXT',
  )
  await run(
    'psicologos_linkedin',
    'ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS linkedin TEXT',
  )
  await run(
    'psicologos_site_url',
    'ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS site_url TEXT',
  )
}
