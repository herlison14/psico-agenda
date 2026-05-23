'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Psicologo } from '@/types/psico'

interface PsicologoContextValue {
  psicologo: Psicologo | null
  loading: boolean
  /** Força um refetch — útil após salvar o perfil */
  refresh: () => void
}

const PsicologoContext = createContext<PsicologoContextValue>({
  psicologo: null,
  loading: true,
  refresh: () => {},
})

export function PsicologoProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [psicologo, setPsicologo] = useState<Psicologo | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/psicologos')
      if (res.ok) {
        const data = await res.json()
        if (data && !('error' in data)) {
          setPsicologo(data as Psicologo)
          return
        }
      }
      setPsicologo(null)
    } catch {
      setPsicologo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.id) { setLoading(false); return }
    fetch_()
  }, [session, status, fetch_])

  return (
    <PsicologoContext.Provider value={{ psicologo, loading, refresh: fetch_ }}>
      {children}
    </PsicologoContext.Provider>
  )
}

export function usePsicologo() {
  return useContext(PsicologoContext)
}
