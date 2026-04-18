import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import pool from '@/lib/db'
import Sidebar from '@/components/Sidebar'

async function getPlano(userId: string) {
  try {
    const { rows } = await pool.query(
      'SELECT plano, trial_fim FROM psicologos WHERE id = $1',
      [userId]
    )
    return rows[0] ?? null
  } catch {
    return null
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const plano = await getPlano(session.user.id)
  if (plano) {
    const isTrialExpirado = plano.plano === 'trial' && plano.trial_fim && new Date(plano.trial_fim) < new Date()
    const isBloqueado = plano.plano === 'bloqueado'
    if (isTrialExpirado || isBloqueado) redirect('/planos?motivo=expirado')
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8 min-h-full bg-[#F7F5F0]">
          {children}
        </div>
      </main>
    </div>
  )
}
