const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.log('[migrate] DATABASE_URL não definida, pulando.')
    return
  }

  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('render.com') || url.includes('amazonaws.com')
      ? { rejectUnauthorized: false }
      : false,
  })

  try {
    const schema = fs.readFileSync(path.join(__dirname, '../SCHEMA.sql'), 'utf8')
    await pool.query(schema)
    console.log('[migrate] Schema aplicado.')

    const { rows } = await pool.query('SELECT COUNT(*) AS n FROM psicologos')
    if (parseInt(rows[0].n, 10) === 0) {
      const seed = fs.readFileSync(path.join(__dirname, '../SEED.sql'), 'utf8')
      await pool.query(seed)
      console.log('[migrate] Seed aplicado.')
    } else {
      console.log('[migrate] Banco já populado, seed ignorado.')
    }
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('[migrate] Erro:', err.message)
  process.exit(1)
})
