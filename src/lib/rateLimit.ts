import { NextRequest } from 'next/server'

const WINDOW_MS = 15 * 60 * 1000 // 15 minutos
const store = new Map<string, { count: number; resetAt: number }>()

// Limpeza periódica para evitar memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of store.entries()) {
    if (now > val.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

export function checkRateLimit(key: string, max: number): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}
