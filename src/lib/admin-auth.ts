import { createHash } from 'crypto'
import type { NextRequest } from 'next/server'

export function getAdminToken(): string {
  const key = process.env.ADMIN_MASTER_KEY ?? ''
  return createHash('sha256').update(key + 'psiplanner-admin-2026').digest('hex')
}

export function validateAdminToken(req: NextRequest): boolean {
  if (!process.env.ADMIN_MASTER_KEY) return false
  return req.cookies.get('admin_token')?.value === getAdminToken()
}
