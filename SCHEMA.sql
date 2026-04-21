-- Schema para PostgreSQL (Railway) — sem dependência do Supabase Auth
-- Rodar este script no banco PostgreSQL do Railway

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS psicologos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nome TEXT,
  crp TEXT,
  cpf TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  plano TEXT DEFAULT 'trial',
  trial_fim TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  mp_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migração para bases existentes
ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS plano TEXT DEFAULT 'trial';
ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS trial_fim TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days';
ALTER TABLE psicologos ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT;

CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psicologo_id UUID REFERENCES psicologos ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  telefone TEXT,
  valor_sessao NUMERIC(10,2) DEFAULT 150,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psicologo_id UUID REFERENCES psicologos ON DELETE CASCADE NOT NULL,
  paciente_id UUID REFERENCES pacientes ON DELETE CASCADE NOT NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao_min INT DEFAULT 50,
  valor NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado','realizado','cancelado','faltou')),
  observacoes TEXT,
  notas_clinicas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recibos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psicologo_id UUID REFERENCES psicologos ON DELETE CASCADE NOT NULL,
  paciente_id UUID REFERENCES pacientes ON DELETE CASCADE NOT NULL,
  sessao_id UUID REFERENCES sessoes ON DELETE SET NULL,
  numero INT NOT NULL,
  data_emissao DATE DEFAULT CURRENT_DATE,
  valor NUMERIC(10,2) NOT NULL,
  descricao TEXT DEFAULT 'Consulta Psicológica',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Soft delete: pacientes e sessões
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE sessoes   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_pacientes_psicologo ON pacientes(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_deleted   ON pacientes(psicologo_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sessoes_psicologo   ON sessoes(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_data_hora   ON sessoes(data_hora);
CREATE INDEX IF NOT EXISTS idx_sessoes_deleted     ON sessoes(psicologo_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_recibos_psicologo   ON recibos(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token  ON password_reset_tokens(token) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_psicologo     ON audit_logs(psicologo_id, created_at DESC);
