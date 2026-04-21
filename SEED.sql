-- =====================================================================
-- SEED.sql — Dados de teste para PsiPlanner
-- =====================================================================
-- ATENÇÃO: Substitua SEU_EMAIL e gere um hash seguro antes de rodar.
-- Para gerar hash: node -e "const b=require('bcryptjs');b.hash('SUA_SENHA',10).then(console.log)"
--
-- Pré-requisitos: SCHEMA.sql já executado.
-- Execução: idempotente (ON CONFLICT / WHERE NOT EXISTS).
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1) PSICÓLOGO de teste — SUBSTITUA os valores antes de rodar
-- ---------------------------------------------------------------------
-- Substitua SEU@EMAIL.COM e gere um hash bcrypt para a senha desejada.
-- Nunca commite credenciais reais neste arquivo.
INSERT INTO psicologos (email, password_hash, nome, crp, cpf, telefone, cidade, estado)
VALUES (
  'teste@psiplanner.local',
  '$2a$10$SUBSTITUA_ESTE_HASH_POR_UM_GERADO_LOCALMENTE_COM_BCRYPT',
  'Psicólogo Teste',
  'CRP 00/00000',
  '000.000.000-00',
  '(00) 00000-0000',
  'Rio de Janeiro',
  'RJ'
)
ON CONFLICT (email) DO UPDATE
SET nome = COALESCE(psicologos.nome, EXCLUDED.nome);

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
