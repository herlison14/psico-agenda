'use client'

import { useState, Suspense, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Brain, CheckCircle, ArrowLeft, Loader2, Copy, Check, QrCode, RefreshCw, ShieldCheck, MessageCircle, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

const RECURSOS = [
  'Agenda semanal ilimitada',
  'Cadastro de pacientes ilimitado',
  'Geração de recibos em PDF',
  'Relatório financeiro mensal com exportação CSV',
  'Agendamento automático via JULY (IA)',
  'Prontuário SOAP gerado por IA',
  'Transcrição de áudio de consultas',
  'Link de agendamento público',
  'Suporte por e-mail',
]

const FAQ = [
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Não há fidelidade. Ao cancelar, você mantém o acesso Pro até o fim do período pago. Sem cobranças surpresa.',
  },
  {
    q: 'Como funciona o pagamento via PIX?',
    a: 'Ao clicar em "Assinar agora", geramos um QR Code PIX. Após o pagamento, seu plano é ativado automaticamente em segundos — sem esperar aprovação manual.',
  },
  {
    q: 'O trial de 7 dias exige cartão de crédito?',
    a: 'Não. O trial é completamente gratuito, sem necessidade de cartão ou qualquer dado financeiro. Você só paga se quiser continuar.',
  },
  {
    q: 'Meus dados de pacientes são seguros?',
    a: 'Sim. Os dados são armazenados em PostgreSQL criptografado (Railway), com HTTPS em todas as conexões. Seguimos as diretrizes da LGPD.',
  },
  {
    q: 'Posso exportar meus dados se sair?',
    a: 'Sim. Você pode exportar sessões e financeiro em CSV, e gerar PDFs de recibos. Seus dados sempre pertencem a você.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#e2e8f0] last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-[#0f172a] hover:text-[#2563eb] transition-colors gap-3"
      >
        <span>{q}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-[#64748b] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm text-[#64748b] leading-relaxed">{a}</p>}
    </div>
  )
}

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

  // Polling automático a cada 5s — useEffect garante cleanup quando modal fecha
  useEffect(() => {
    const id = setInterval(verificar, 5000)
    return () => clearInterval(id)
  }, [verificar])

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
        toast.error(data.error ?? 'Erro ao gerar cobrança PIX.')
      }
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
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

        {/* Hero */}
        <div className="text-center mb-10">
          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Usado por psicólogos em todo o Brasil
          </div>
          <h1 className="text-3xl font-bold text-[#0f172a] mb-3">Planos PsiPlanner</h1>
          <p className="text-[#64748b]">7 dias grátis para testar. Sem cartão de crédito.</p>
        </div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
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

        {/* Garantia / Risk reversal */}
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 max-w-2xl mx-auto mb-12">
          <ShieldCheck className="w-8 h-8 text-indigo-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-900">7 dias de teste sem risco</p>
            <p className="text-xs text-indigo-700 mt-0.5">
              Se não gostar durante o trial, basta não assinar. Sem cobranças, sem burocracia.
            </p>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden max-w-2xl mx-auto mb-12 shadow-sm">
          <div className="bg-[#f8fafc] px-6 py-3 border-b border-[#e2e8f0]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Comparativo de recursos</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                <th className="text-left px-6 py-3 font-medium text-[#64748b]">Recurso</th>
                <th className="text-center px-4 py-3 font-medium text-[#64748b]">Trial</th>
                <th className="text-center px-4 py-3 font-semibold text-[#1e3a8a]">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {[
                ['Agenda & sessões', true, true],
                ['Gestão de pacientes', true, true],
                ['Recibos em PDF', true, true],
                ['Financeiro & Carnê-Leão', true, true],
                ['Agente JULY (IA)', true, true],
                ['Prontuário SOAP (IA)', true, true],
                ['Transcrição de áudio', true, true],
                ['Link de agendamento público', true, true],
                ['Suporte prioritário', false, true],
                ['Uso ilimitado sem interrupção', false, true],
              ].map(([feat, trial, pro]) => (
                <tr key={feat as string}>
                  <td className="px-6 py-2.5 text-[#334155]">{feat as string}</td>
                  <td className="text-center px-4 py-2.5">
                    {trial ? <CheckCircle className="w-4 h-4 text-[#2563eb] mx-auto" /> : <span className="text-[#cbd5e1] text-lg">—</span>}
                  </td>
                  <td className="text-center px-4 py-2.5">
                    {pro ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-[#cbd5e1] text-lg">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">Perguntas frequentes</h2>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] px-6 shadow-sm">
            {FAQ.map(item => <FaqItem key={item.q} {...item} />)}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="text-center mb-10">
          <p className="text-sm text-[#64748b] mb-3">Alguma dúvida antes de assinar?</p>
          <a
            href="https://wa.me/5521997927927?text=Oi%2C+tenho+interesse+no+PsiPlanner+e+gostaria+de+tirar+uma+d%C3%BAvida."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Falar no WhatsApp
          </a>
        </div>

        <div className="text-center">
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
