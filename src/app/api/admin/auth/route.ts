import { NextRequest, NextResponse } from 'next/server'
import { getAdminToken } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const { senha } = await req.json()
  const masterKey = process.env.ADMIN_MASTER_KEY ?? ''

  if (!masterKey || senha !== masterKey) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', getAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8h
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('admin_token')
  return res
}
