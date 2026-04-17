import { Pool } from 'pg'

// Railway/Neon/Supabase usam certificados auto-assinados. Manter
// rejectUnauthorized: true em produção quebra TODAS as queries com
// "self signed certificate in certificate chain". Mantemos false por padrão
// e permitimos DATABASE_SSL=strict para forçar validação quando a infra
// suportar.
const url = process.env.DATABASE_URL ?? ''
const needsSsl =
  url.length > 0 &&
  (process.env.NODE_ENV === 'production' ||
    /sslmode=(require|verify-ca|verify-full)/i.test(url))

const sslConfig = needsSsl
  ? { rejectUnauthorized: process.env.DATABASE_SSL === 'strict' }
  : false

const pool = new Pool({
  connectionString: url || undefined,
  ssl: sslConfig,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 10000,
})

pool.on('error', (err) => {
  console.error('[pg pool] idle client error:', err)
})

export default pool
