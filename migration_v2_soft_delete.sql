-- ============================================================
-- MIGRATION v2 — Soft Delete + Password Reset + Audit Log
-- Rodar via: POST /api/migrate (x-admin-key)
-- Idempotente: usa IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- ============================================================

BEGIN;

-- Soft delete
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE sessoes   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Tabela de reset de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psicologo_id UUID REFERENCES psicologos ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psicologo_id UUID,
  tabela TEXT NOT NULL,
  registro_id UUID NOT NULL,
  acao TEXT NOT NULL CHECK (acao IN ('insert', 'update', 'delete')),
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pacientes_deleted  ON pacientes(psicologo_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sessoes_deleted    ON sessoes(psicologo_id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reset_token        ON password_reset_tokens(token) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_psicologo    ON audit_logs(psicologo_id, created_at DESC);

COMMIT;
