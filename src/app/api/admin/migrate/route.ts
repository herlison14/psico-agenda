import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

const ADMIN_KEY = process.env.AGENTE_API_KEY ?? process.env.ADMIN_KEY ?? ''

// Temporary migration endpoint — remove after first use
export async function POST(req: NextRequest) {
  const key = req.headers.get('x-admin-key') ?? ''
  if (!ADMIN_KEY || key !== ADMIN_KEY)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const log: string[] = []

  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS psicologos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nome TEXT, crp TEXT, cpf TEXT, telefone TEXT,
        endereco TEXT, cidade TEXT, estado TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        psicologo_id UUID REFERENCES psicologos ON DELETE CASCADE NOT NULL,
        nome TEXT NOT NULL, cpf TEXT, email TEXT, telefone TEXT,
        valor_sessao NUMERIC(10,2) DEFAULT 150,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessoes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        psicologo_id UUID REFERENCES psicologos ON DELETE CASCADE NOT NULL,
        paciente_id UUID REFERENCES pacientes ON DELETE CASCADE NOT NULL,
        data_hora TIMESTAMPTZ NOT NULL,
        duracao_min INT DEFAULT 50,
        valor NUMERIC(10,2) NOT NULL,
        status TEXT DEFAULT 'agendado'
          CHECK (status IN ('agendado','realizado','cancelado','faltou')),
        observacoes TEXT, notas_clinicas TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`)
    await pool.query(`
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
      )`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pacientes_psicologo ON pacientes(psicologo_id)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessoes_psicologo ON sessoes(psicologo_id)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessoes_data_hora ON sessoes(data_hora)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_recibos_psicologo ON recibos(psicologo_id)`)
    log.push('schema OK')

    const { rows } = await pool.query('SELECT COUNT(*) AS n FROM psicologos')
    if (parseInt(rows[0].n, 10) === 0) {
      // bcrypt hash of "123456" with cost 10
      await pool.query(`
        INSERT INTO psicologos (email, password_hash, nome)
        VALUES ('herlison14@gmail.com',
                '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
                'Herlison')
        ON CONFLICT (email) DO NOTHING
      `)
      const { rows: r } = await pool.query(`SELECT id FROM psicologos WHERE email='herlison14@gmail.com'`)
      const pid = r[0]?.id
      if (pid) {
        await pool.query(`
          INSERT INTO pacientes (psicologo_id, nome, telefone, valor_sessao)
          VALUES ($1,'Ana Paula Silva','5521999990001',200),
                 ($1,'Carlos Eduardo Rocha','5521999990002',180)
          ON CONFLICT DO NOTHING
        `, [pid])
      }
      log.push('seed OK')
    } else {
      log.push('seed skipped (data exists)')
    }

    const { rows: pids } = await pool.query('SELECT id FROM psicologos WHERE email=$1', ['herlison14@gmail.com'])
    return NextResponse.json({ ok: true, log, psicologo_id: pids[0]?.id ?? null })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: msg, log }, { status: 500 })
  }
}
