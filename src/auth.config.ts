import type { NextAuthConfig } from 'next-auth'
import { NextResponse } from 'next/server'

export const authConfig: NextAuthConfig = {
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname
      const isAuthPage = pathname.startsWith('/login')
      const isApiAuth = pathname.startsWith('/api/auth')
      const isAgenteApi = pathname.startsWith('/api/agente')
      const isApiRoute = pathname.startsWith('/api/')

      // Redireciona usuários já logados para o dashboard
      if (isAuthPage) {
        if (isLoggedIn) return NextResponse.redirect(new URL('/', nextUrl))
        return true
      }

      // NextAuth e o endpoint público do agente devem sempre passar
      if (isApiAuth || isAgenteApi) return true

      // Rotas de API sem auth retornam 401 JSON (não redirect)
      if (isApiRoute && !isLoggedIn)
        return Response.json({ error: 'Unauthorized' }, { status: 401 })

      if (!isLoggedIn) return false
      return true
    },
  },
  providers: [],
}
