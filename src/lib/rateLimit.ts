/**
 * Rate limiting via PostgreSQL — funciona em ambientes serverless multi-instância.
 * Substitui a versão in-memory que não funcionava no Vercel Fluid Compute.
 *
 * Usa upsert atômico com janela de 15 minutos:
 *   - Se o registro não existe → cria com count=1
 *   - Se a janela ainda é a atual → incrementa count
 *   - Se a janela mudou → reseta para count=1
 */
import pool from '@/lib/db'
import { ensureRateLimitsSchema } from '@/lib/ensure-schema'
import type { NextRequest } from 'next/server'

const WINDOW_MIN = 15

// Ensure the rate_limits table exists once per cold start
ensureRateLimitsSchema().catch((err) => console.warn('[rateLimit] schema init:', err))

/** Retorna o timestamp do início da janela de 15 minutos atual */
function currentWindow(): Date {
  const now = Date.now()
  const windowMs = WINDOW_MIN * 60 * 1000
  return new Date(Math.floor(now / windowMs) * windowMs)
}

/**
 * Verifica e incrementa o contador de rate limit para a chave dada.
 * @returns true se a requisição está dentro do limite, false se excedeu
 */
export async function checkRateLimit(key: string, max: number): Promise<boolean> {
  const windowStart = currentWindow()
  try {
    const { rows } = await pool.query<{ count: number }>(`
      INSERT INTO rate_limits (key, window_start, count)
      VALUES ($1, $2, 1)
      ON CONFLICT (key) DO UPDATE
        SET
          count        = CASE
                           WHEN rate_limits.window_start = $2 THEN rate_limits.count + 1
                           ELSE 1
                         END,
          window_start = $2
      RETURNING count
    `, [key, windowStart.toISOString()])

    return rows[0].count <= max
  } catch (err) {
    // Fail open: prefere deixar passar a bloquear por erro de DB
    console.error('[rateLimit] DB error, allowing request:', err)
    return true
  }
}

/** Extrai o IP real do cliente respeitando proxies (Vercel, Cloudflare, etc.) */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
