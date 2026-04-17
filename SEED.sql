-- =====================================================================
-- SEED.sql — Dados de teste para PsiPlanner (Railway PostgreSQL)
-- =====================================================================
-- Usuário de teste:
--   email:    herlison14@gmail.com
--   senha:    123456
--   hash gerado com bcryptjs (mesmo lib usado em src/auth.ts), rounds=10
--
-- Pré-requisitos: SCHEMA.sql já executado (extension pgcrypto + tabelas).
-- Execução: idempotente (ON CONFLICT / WHERE NOT EXISTS).
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1) PSICÓLOGO de teste
-- ---------------------------------------------------------------------
INSERT INTO psicologos (email, password_hash, nome, crp, cpf, telefone, cidade, estado)
VALUES (
  'herlison14@gmail.com',
  '$2a$10$.neUaHlOOAAL0NWZMTz4E.VXOGX87LoJy4MwvotvKr.Xcc/eWwyyy', -- "123456"
  'Herlison (Teste)',
  'CRP 05/99999',
  '000.000.000-00',
  '5521997927927',
  'Rio de Janeiro',
  'RJ'
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    nome          = COALESCE(psicologos.nome, EXCLUDED.nome);

-- ---------------------------------------------------------------------
-- 2) PACIENTES de exemplo (2)
-- ---------------------------------------------------------------------
INSERT INTO pacientes (psicologo_id, nome, cpf, email, telefone, valor_sessao, ativo)
SELECT p.id, 'Carlos Mendes', '111.222.333-44', 'carlos@email.com', '(21) 91111-1111', 180, TRUE
FROM psicologos p
WHERE p.email = 'herlison14@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM pacientes pa
    WHERE pa.psicologo_id = p.id AND pa.nome = 'Carlos Mendes'
  );

INSERT INTO pacientes (psicologo_id, nome, cpf, email, telefone, valor_sessao, ativo)
SELECT p.id, 'Fernanda Lima', '222.333.444-55', 'fernanda@email.com', '(21) 92222-2222', 150, TRUE
FROM psicologos p
WHERE p.email = 'herlison14@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM pacientes pa
    WHERE pa.psicologo_id = p.id AND pa.nome = 'Fernanda Lima'
  );

-- ---------------------------------------------------------------------
-- 3) SESSÕES de exemplo (3)
--    - 1 sessão futura (agendado)
--    - 1 sessão de hoje (agendado)
--    - 1 sessão passada (realizado)
-- ---------------------------------------------------------------------
INSERT INTO sessoes (psicologo_id, paciente_id, data_hora, duracao_min, valor, status, observacoes)
SELECT p.id, pa.id,
       NOW() + INTERVAL '2 days',
       50, 180, 'agendado',
       'Primeira consulta agendada via SEED.'
FROM psicologos p
JOIN pacientes  pa ON pa.psicologo_id = p.id AND pa.nome = 'Carlos Mendes'
WHERE p.email = 'herlison14@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM sessoes s
    WHERE s.psicologo_id = p.id
      AND s.paciente_id  = pa.id
      AND s.observacoes  = 'Primeira consulta agendada via SEED.'
  );

INSERT INTO sessoes (psicologo_id, paciente_id, data_hora, duracao_min, valor, status, observacoes)
SELECT p.id, pa.id,
       DATE_TRUNC('day', NOW()) + INTERVAL '14 hours',
       50, 150, 'agendado',
       'Sessão de hoje (SEED).'
FROM psicologos p
JOIN pacientes  pa ON pa.psicologo_id = p.id AND pa.nome = 'Fernanda Lima'
WHERE p.email = 'herlison14@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM sessoes s
    WHERE s.psicologo_id = p.id
      AND s.paciente_id  = pa.id
      AND s.observacoes  = 'Sessão de hoje (SEED).'
  );

INSERT INTO sessoes (psicologo_id, paciente_id, data_hora, duracao_min, valor, status, observacoes, notas_clinicas)
SELECT p.id, pa.id,
       NOW() - INTERVAL '3 days',
       50, 180, 'realizado',
       'Sessão passada (SEED).',
       'Paciente relatou melhora na ansiedade. Técnicas de respiração trabalhadas.'
FROM psicologos p
JOIN pacientes  pa ON pa.psicologo_id = p.id AND pa.nome = 'Carlos Mendes'
WHERE p.email = 'herlison14@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM sessoes s
    WHERE s.psicologo_id = p.id
      AND s.paciente_id  = pa.id
      AND s.observacoes  = 'Sessão passada (SEED).'
  );

COMMIT;

-- ---------------------------------------------------------------------
-- Verificação rápida (opcional — rodar manualmente):
--   SELECT id, email, nome FROM psicologos WHERE email = 'herlison14@gmail.com';
--   SELECT nome, valor_sessao FROM pacientes
--    WHERE psicologo_id = (SELECT id FROM psicologos WHERE email='herlison14@gmail.com');
--   SELECT data_hora, valor, status, observacoes FROM sessoes
--    WHERE psicologo_id = (SELECT id FROM psicologos WHERE email='herlison14@gmail.com')
--    ORDER BY data_hora;
-- ---------------------------------------------------------------------
