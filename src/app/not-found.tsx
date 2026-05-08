import Link from 'next/link'
import { Brain } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#eff6ff] mb-6">
          <Brain className="w-8 h-8 text-[#2563eb]" strokeWidth={1.5} />
        </div>
        <p className="text-5xl font-bold text-[#1e3a8a] mb-3">404</p>
        <h2 className="text-xl font-semibold text-[#0f172a] mb-2">
          Página não encontrada
        </h2>
        <p className="text-sm text-[#64748b] mb-8">
          O endereço que você acessou não existe ou foi movido.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
        >
          Voltar ao dashboard
        </Link>
      </div>
    </div>
  )
}
