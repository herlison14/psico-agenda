'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Leaf, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'

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
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E3DB]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-[#1B3A2F] rounded-xl p-2">
              <Leaf className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-[#1B3A2F]">PsiPlanner</span>
          </Link>
          <Link href="/login" className="text-sm text-[#3D5247] hover:text-[#1B3A2F] font-medium">
            Acesse sua conta →
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {motivo === 'expirado' && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 px-5 py-4 rounded-xl text-sm mb-8 text-center">
            Seu período de trial expirou. Assine o plano Pro para continuar usando o PsiPlanner.
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#1B3A2F] mb-3">Planos PsiPlanner</h1>
          <p className="text-[#5A7268]">7 dias grátis para testar. Sem cartão de crédito.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Trial */}
          <div className="bg-white rounded-2xl border border-[#E8E3DB] p-8 shadow-sm">
            <p className="text-sm font-semibold text-[#7A8C82] uppercase tracking-wide mb-2">Trial</p>
            <p className="text-4xl font-bold text-[#1B3A2F] mb-1">Grátis</p>
            <p className="text-sm text-[#7A8C82] mb-6">7 dias · sem cartão</p>
            <ul className="space-y-2.5 mb-8">
              {RECURSOS.map(r => (
                <li key={r} className="flex items-center gap-2.5 text-sm text-[#3D5247]">
                  <CheckCircle className="w-4 h-4 text-[#5A9E7C] shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block text-center bg-[#EBF5EF] text-[#2D6A52] py-3 rounded-xl font-medium text-sm hover:bg-[#D4EDDF] transition-colors"
            >
              Criar conta grátis
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-[#1B3A2F] rounded-2xl p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#5A9E7C] text-white text-xs font-bold px-3 py-1 rounded-full">
              MAIS POPULAR
            </div>
            <p className="text-sm font-semibold text-[#A8D5BC] uppercase tracking-wide mb-2">Pro</p>
            <p className="text-4xl font-bold text-white mb-1">
              R$ 50<span className="text-2xl">,00</span>
            </p>
            <p className="text-sm text-[#A8D5BC] mb-6">por mês · cancele quando quiser</p>
            <ul className="space-y-2.5 mb-8">
              {RECURSOS.map(r => (
                <li key={r} className="flex items-center gap-2.5 text-sm text-[#D4EDE0]">
                  <CheckCircle className="w-4 h-4 text-[#5A9E7C] shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
            <button
              onClick={handleAssinar}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#5A9E7C] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#4A8E6C] disabled:opacity-60 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Aguarde...' : 'Assinar agora'}
            </button>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#7A8C82] hover:text-[#3D5247] transition-colors">
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
