import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import pool from '@/lib/db'
import { authConfig } from '@/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  // Required in production behind Vercel's proxy and custom domains
  // (psiplanner.onrender.com / psiplanner.com.br). Without this,
  // NextAuth v5 rejects the Host header and sign-in silently fails.
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const { rows } = await pool.query(
            'SELECT id, email, password_hash FROM psicologos WHERE email = $1',
            [credentials.email]
          )

          const user = rows[0]
          if (!user || !user.password_hash) return null

          const valid = await compare(credentials.password as string, user.password_hash)
          if (!valid) return null

          return { id: String(user.id), email: user.email }
        } catch (err) {
          console.error('[auth.authorize] DB/hash error:', err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
})
