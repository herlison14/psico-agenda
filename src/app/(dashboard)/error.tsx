'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Loga o erro para monitoramento (sem expor stack ao usuário)
    console.error('[dashboard/error]', error.digest ?? error.message)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-5">
          <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={1.75} />
        </div>
        <h2 className="text-xl font-semibold text-[#0f172a] mb-2">
          Algo deu errado
        </h2>
        <p className="text-sm text-[#64748b] mb-6">
          Ocorreu um erro inesperado. Se o problema persistir, entre em contato com o suporte.
        </p>
        {error.digest && (
          <p className="text-xs text-[#94a3b8] font-mono mb-6">
            Cód.: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2} />
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
