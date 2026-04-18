import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Next.js 16 renamed `middleware` -> `proxy`. Only `nodejs` runtime is supported.
// NextAuth v5's authConfig.authorized() handles redirect to /login for unauthenticated UI routes.
export const { auth: proxy } = NextAuth(authConfig)

export default proxy

export const config = {
  // Match only UI routes. API routes handle their own auth via `await auth()`
  // inside each route handler, so we do NOT include them here. Including /api
  // in the matcher breaks client fetches because the middleware redirects
  // unauthenticated API calls to /login (HTML) instead of returning 401 JSON.
  // Root `/`, `/planos` e `/agendar` são públicos — excluídos do matcher
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|planos|agendar|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).+)',
  ],
}
