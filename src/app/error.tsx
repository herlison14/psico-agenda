'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global/error]', error.digest ?? error.message)
  }, [error])

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-5">
          <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={1.75} />
        </div>
        <h2 className="text-xl font-semibold text-[#0f172a] mb-2">
          Algo deu errado
        </h2>
        <p className="text-sm text-[#64748b] mb-6">
          Ocorreu um erro inesperado. Tente novamente ou acesse o início.
        </p>
        {error.digest && (
          <p className="text-xs text-[#94a3b8] font-mono mb-6">
            Cód.: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
            Tentar novamente
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-[#e2e8f0] text-[#334155] hover:bg-[#f1f5f9] transition-colors"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  )
}
