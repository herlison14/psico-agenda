'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Brain, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'

const RECURSOS = [
  'Agenda semanal ilimitada',
  'Cadastro de pacientes ilimitado',
  'Geração de recibos em PDF',
  'Relatório financeiro mensal',
  'Exportação Carnê-Leão (IR)',
  'Agente July via WhatsApp',
  'Prontuário SOAP gerado por IA',
  'Transcrição de áudio de consultas',
  'Suporte por e-mail',
]

function PlanosContent() {
  const searchParams = useSearchParams()
  const motivo = searchParams.get('motivo')
  const [loading, setLoading] = useState(false)

  async function handleAssinar() {
    setLoading(true)
    try {
      const res = await fetch('/api/pagamento/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.checkout_url) window.location.href = data.checkout_url
      else alert(data.error ?? 'Erro ao iniciar pagamento.')
    } catch {
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-[#2563eb] rounded-xl p-2">
              <Brain className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-[#0f172a]">PsiPlanner</span>
          </Link>
          <Link href="/login" className="text-sm text-[#334155] hover:text-[#2563eb] font-medium transition-colors">
            Acesse sua conta →
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {motivo === 'expirado' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl text-sm mb-8 text-center">
            Seu período de trial expirou. Assine o plano Pro para continuar usando o PsiPlanner.
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-3">Planos PsiPlanner</h1>
          <p className="text-[#64748b]">7 dias grátis para testar. Sem cartão de crédito.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Trial */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-sm">
            <p className="text-sm font-semibold text-[#64748b] uppercase tracking-wide mb-2">Trial</p>
            <p className="text-4xl font-bold text-[#0f172a] mb-1">Grátis</p>
            <p className="text-sm text-[#94a3b8] mb-6">7 dias · sem cartão</p>
            <ul className="space-y-2.5 mb-8">
              {RECURSOS.map(r => (
                <li key={r} className="flex items-center gap-2.5 text-sm text-[#334155]">
                  <CheckCircle className="w-4 h-4 text-[#2563eb] shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block text-center bg-[#eff6ff] text-[#2563eb] py-3 rounded-xl font-medium text-sm hover:bg-[#dbeafe] transition-colors"
            >
              Criar conta grátis
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-[#1e3a8a] rounded-2xl p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#3b82f6] text-white text-xs font-bold px-3 py-1 rounded-full">
              MAIS POPULAR
            </div>
            <p className="text-sm font-semibold text-[#93c5fd] uppercase tracking-wide mb-2">Pro</p>
            <p className="text-4xl font-bold text-white mb-1">
              R$ 50<span className="text-2xl">,00</span>
            </p>
            <p className="text-sm text-[#93c5fd] mb-6">por mês · cancele quando quiser</p>
            <ul className="space-y-2.5 mb-8">
              {RECURSOS.map(r => (
                <li key={r} className="flex items-center gap-2.5 text-sm text-[#dbeafe]">
                  <CheckCircle className="w-4 h-4 text-[#3b82f6] shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
            <button
              onClick={handleAssinar}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#2563eb] disabled:opacity-60 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Aguarde...' : 'Assinar agora'}
            </button>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#334155] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PlanosPage() {
  return (
    <Suspense>
      <PlanosContent />
    </Suspense>
  )
}
