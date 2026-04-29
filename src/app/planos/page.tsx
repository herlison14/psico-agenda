'use client'

import { useState, Suspense, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Brain, CheckCircle, ArrowLeft, Loader2, Copy, Check, QrCode, RefreshCw } from 'lucide-react'

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

type PixData = {
  payment_id: string
  qr_code: string
  qr_code_base64: string | null
  amount: number
}

function ModalPix({ pix, onClose, onConfirmed }: {
  pix: PixData
  onClose: () => void
  onConfirmed: () => void
}) {
  const [copiado, setCopiado] = useState(false)
  const [polling, setPolling] = useState(false)
  const [tentativas, setTentativas] = useState(0)

  const copiar = () => {
    navigator.clipboard.writeText(pix.qr_code).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  const verificar = useCallback(async () => {
    if (polling) return
    setPolling(true)
    try {
      const r = await fetch(`/api/pagamento/status?payment_id=${pix.payment_id}`)
      const d = await r.json()
      if (d.status === 'active') {
        onConfirmed()
        return
      }
      setTentativas(t => t + 1)
    } catch {
      setTentativas(t => t + 1)
    } finally {
      setPolling(false)
    }
  }, [pix.payment_id, polling, onConfirmed])

  // Polling automático a cada 5s
  useState(() => {
    const id = setInterval(verificar, 5000)
    return () => clearInterval(id)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#eff6ff] text-[#2563eb] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <QrCode className="w-3.5 h-3.5" />
            PIX — pagamento instantâneo
          </div>
          <h2 className="text-xl font-bold text-[#0f172a]">Assinatura PsiPlanner Pro</h2>
          <p className="text-3xl font-bold text-[#1e3a8a] mt-2">R$ 50,00</p>
          <p className="text-xs text-[#64748b] mt-1">por mês · cancele quando quiser</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-5">
          {pix.qr_code_base64 ? (
            <img
              src={`data:image/png;base64,${pix.qr_code_base64}`}
              alt="QR Code PIX"
              className="w-52 h-52 rounded-xl border border-[#e2e8f0]"
            />
          ) : (
            <div className="w-52 h-52 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex items-center justify-center">
              <QrCode className="w-12 h-12 text-[#cbd5e1]" />
            </div>
          )}
        </div>

        {/* Copia e Cola */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 mb-4">
          <p className="text-[10px] text-[#64748b] font-medium mb-1.5 uppercase tracking-wide">PIX Copia e Cola</p>
          <div className="flex items-center gap-2">
            <p className="flex-1 text-[11px] text-[#334155] font-mono truncate">{pix.qr_code}</p>
            <button
              onClick={copiar}
              className="shrink-0 flex items-center gap-1 text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-[#64748b] mb-5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Aguardando pagamento...
          </span>
          <button
            onClick={verificar}
            disabled={polling}
            className="flex items-center gap-1 text-[#2563eb] hover:text-[#1d4ed8] disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${polling ? 'animate-spin' : ''}`} />
            {tentativas > 0 ? `Verificar (${tentativas})` : 'Verificar'}
          </button>
        </div>

        <p className="text-center text-xs text-[#94a3b8]">
          Após o pagamento, seu plano Pro é ativado automaticamente em segundos.
        </p>
      </div>
    </div>
  )
}

function PlanosContent() {
  const searchParams = useSearchParams()
  const motivo = searchParams.get('motivo')
  const [loading, setLoading] = useState(false)
  const [pix, setPix] = useState<PixData | null>(null)

  async function handleAssinar() {
    setLoading(true)
    try {
      const res = await fetch('/api/pagamento/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.qr_code) {
        setPix(data as PixData)
      } else {
        alert(data.error ?? 'Erro ao gerar cobrança PIX.')
      }
    } catch {
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleConfirmed() {
    window.location.assign('/dashboard?pagamento=sucesso')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {pix && <ModalPix pix={pix} onClose={() => setPix(null)} onConfirmed={handleConfirmed} />}

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
            <p className="text-sm text-[#93c5fd] mb-2">por mês · cancele quando quiser</p>
            <div className="flex items-center gap-1.5 mb-6">
              <QrCode className="w-3.5 h-3.5 text-[#60a5fa]" />
              <span className="text-xs text-[#60a5fa] font-medium">Pagamento via PIX</span>
            </div>
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
              {loading ? 'Gerando PIX...' : 'Assinar agora via PIX'}
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
