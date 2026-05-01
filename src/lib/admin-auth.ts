import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

/** Deriva um token de sessão HMAC-SHA256 a partir da ADMIN_MASTER_KEY. */
export function getAdminToken(): string {
  const key = process.env.ADMIN_MASTER_KEY ?? ''
  // HMAC com a chave como segredo — o pepper nunca aparece no hash derivado
  return createHmac('sha256', key).update('psiplanner-admin-session-v2').digest('hex')
}

/** Compara tokens em tempo constante para prevenir timing attacks. */
export function validateAdminToken(req: NextRequest): boolean {
  if (!process.env.ADMIN_MASTER_KEY) return false
  const cookieVal = req.cookies.get('admin_token')?.value
  if (!cookieVal) return false
  try {
    const expected = Buffer.from(getAdminToken(), 'hex')
    const received = Buffer.from(cookieVal, 'hex')
    if (expected.length !== received.length) return false
    return timingSafeEqual(expected, received)
  } catch {
    return false
  }
}
