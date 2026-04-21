import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-admin-key')
  if (!key || key !== process.env.ADMIN_KEY)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const schema = readFileSync(join(process.cwd(), 'SCHEMA.sql'), 'utf8')
    await pool.query(schema)

    const migration2 = readFileSync(join(process.cwd(), 'migration_v2_soft_delete.sql'), 'utf8')
    await pool.query(migration2)

    const { rows } = await pool.query('SELECT COUNT(*) AS n FROM psicologos')
    let seeded = false
    if (parseInt(rows[0].n, 10) === 0) {
      const seed = readFileSync(join(process.cwd(), 'SEED.sql'), 'utf8')
      await pool.query(seed)
      seeded = true
    }

    return NextResponse.json({ ok: true, seeded, migrations: ['v1-schema', 'v2-soft-delete'] })
  } catch (err) {
    console.error('[migrate]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
