import type { Metadata } from 'next'
import pool from '@/lib/db'

interface Props {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

async function getPsicPublico(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  try {
    const { rows } = await pool.query<{ nome: string | null; crp: string | null }>(
      'SELECT nome, crp FROM psicologos WHERE id = $1',
      [id]
    )
    return rows[0] ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const psic = await getPsicPublico(id)

  const nome = psic?.nome ?? 'Profissional de Saúde'
  const crp = psic?.crp ? ` · CRP ${psic.crp}` : ''
  const title = `Agendar consulta com ${nome}${crp} | PsiPlanner`
  const description = `Agende sua consulta com ${nome} de forma rápida e segura pelo PsiPlanner.`
  const url = `https://www.psiplanner.com.br/agendar/${id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'PsiPlanner',
      type: 'website',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: { canonical: url },
  }
}

export default function AgendarLayout({ children }: Props) {
  return <>{children}</>
}
