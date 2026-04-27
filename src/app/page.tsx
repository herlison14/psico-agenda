'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Leaf, Send, CalendarDays, Users, FileText, DollarSign, Mic2, ChevronRight, CheckCircle, MessageCircle, QrCode } from 'lucide-react'

const AGENTE_WA_NUMBER = process.env.NEXT_PUBLIC_AGENTE_WHATSAPP ?? ''

type Msg = { role: 'user' | 'assistant'; content: string }

const SUGESTOES = [
  'Como funciona o agendamento?',
  'Vocês têm geração de recibo PDF?',
  'O que é o trial gratuito?',
]

export default function HomePage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Olá! Sou a July, assistente da PsiPlanner. Posso te mostrar como a plataforma funciona ou tirar dúvidas. Como posso ajudar?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{ role: string; content: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Msg = { role: 'user', content: text }
    setMsgs(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      const data = await res.json()
      const reply = data.reply ?? 'Desculpe, não consegui processar sua mensagem.'
      setMsgs(m => [...m, { role: 'assistant', content: reply }])
      setHistory(h => [...h, { role: 'user', content: text }, { role: 'assistant', content: reply }])
    } catch {
      setMsgs(m => [...m, { role: 'assistant', content: 'Erro de conexão. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#E8E3DB]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#1B3A2F] rounded-xl p-2">
              <Leaf className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-[#1B3A2F] text-lg">PsiPlanner</span>
          </div>
          <Link
            href="/login"
            className="text-sm text-[#3D5247] hover:text-[#1B3A2F] font-medium transition-colors"
          >
            Acesse sua conta →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block bg-[#EBF5EF] text-[#2D6A52] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          7 dias grátis — sem cartão
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1B3A2F] leading-tight mb-5">
          Gestão de agenda para<br />
          <span className="text-[#5A9E7C]">psicólogos que valorizam</span><br />
          seu tempo
        </h1>
        <p className="text-lg text-[#5A7268] max-w-xl mx-auto mb-10">
          Agenda, pacientes, recibos e financeiro em um só lugar.
          Com agente de agendamento via WhatsApp e prontuário gerado por IA.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-[#1B3A2F] text-white px-8 py-3.5 rounded-xl font-medium hover:bg-[#244D3F] transition-colors"
          >
            Começar grátis <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/planos"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#3D5247] border border-[#D4CFC6] px-8 py-3.5 rounded-xl font-medium hover:bg-[#F0EDE7] transition-colors"
          >
            Ver planos
          </Link>
        </div>
      </section>

      {/* Features + Chat */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid lg:grid-cols-2 gap-10 items-start">
        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1B3A2F] mb-6">Tudo que você precisa</h2>
          {[
            { icon: CalendarDays, title: 'Agenda visual semanal', desc: 'Gerencie sessões, confirme presenças e visualize sua semana de forma clara.' },
            { icon: Users, title: 'Cadastro de pacientes', desc: 'Histórico completo, notas clínicas e prontuário SOAP gerado por IA a partir de áudio.' },
            { icon: FileText, title: 'Recibos em PDF', desc: 'Gere recibos profissionais com um clique e envie diretamente ao paciente.' },
            { icon: DollarSign, title: 'Financeiro + Carnê-Leão', desc: 'Resumo mensal e exportação CSV compatível com a declaração de IR.' },
            { icon: Mic2, title: 'Agente July via WhatsApp', desc: 'Seus pacientes agendam, confirmam e reagendam diretamente pelo WhatsApp.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 bg-white rounded-2xl border border-[#E8E3DB] p-5 shadow-sm">
              <div className="bg-[#EBF5EF] rounded-xl p-2.5 shrink-0 h-fit">
                <Icon className="w-5 h-5 text-[#2D6A52]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-medium text-[#1C2B22] text-sm">{title}</p>
                <p className="text-sm text-[#7A8C82] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat July */}
        <div className="lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold text-[#1B3A2F] mb-6">Conheça a July, sua assistente</h2>
          <div className="bg-white rounded-2xl border border-[#E8E3DB] shadow-sm overflow-hidden flex flex-col h-[480px]">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0EDE7] bg-[#1B3A2F]">
              <div className="bg-[#5A9E7C] rounded-full w-9 h-9 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">July</p>
                <p className="text-[#A8D5BC] text-xs">Assistente PsiPlanner · Demo</p>
              </div>
              <div className="ml-auto w-2 h-2 bg-[#5A9E7C] rounded-full" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#1B3A2F] text-white rounded-br-sm'
                      : 'bg-[#F0EDE7] text-[#1C2B22] rounded-bl-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#F0EDE7] px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-[#7A8C82] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Sugestões */}
            {msgs.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGESTOES.map(s => (
                  <button key={s} onClick={() => send(s)} className="text-xs bg-[#EBF5EF] text-[#2D6A52] px-3 py-1.5 rounded-full hover:bg-[#D4EDDF] transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4">
              <form onSubmit={e => { e.preventDefault(); send(input) }} className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Pergunte sobre a plataforma..."
                  className="flex-1 px-4 py-2.5 bg-[#F7F5F0] border border-[#E8E3DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A9E7C]"
                />
                <button type="submit" disabled={loading || !input.trim()} className="bg-[#1B3A2F] text-white p-2.5 rounded-xl hover:bg-[#244D3F] disabled:opacity-40 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Agent Section */}
      {AGENTE_WA_NUMBER && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="bg-white rounded-3xl border border-[#E8E3DB] shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: info */}
              <div className="p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-[#25D366] rounded-xl p-2">
                    <MessageCircle className="w-5 h-5 text-white" strokeWidth={1.75} />
                  </div>
                  <span className="text-sm font-semibold text-[#25D366] uppercase tracking-wide">WhatsApp</span>
                </div>
                <h2 className="text-2xl font-bold text-[#1B3A2F] mb-3">
                  Fale com a July agora
                </h2>
                <p className="text-[#5A7268] mb-6 leading-relaxed">
                  Seus pacientes agendam consultas diretamente pelo WhatsApp, sem precisar acessar nenhum site. A July cuida de tudo automaticamente.
                </p>
                <div className="bg-[#F7F5F0] rounded-2xl px-6 py-4 mb-6 inline-block">
                  <p className="text-xs text-[#7A8C82] mb-1">Número do agente</p>
                  <p className="text-xl font-bold text-[#1B3A2F] tracking-wide">
                    +{AGENTE_WA_NUMBER.replace(/\D/g, '')}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${AGENTE_WA_NUMBER.replace(/\D/g, '')}?text=Ol%C3%A1%2C+gostaria+de+agendar+uma+consulta`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1DAA55] transition-colors w-fit text-sm"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={2} />
                  Abrir no WhatsApp
                </a>
              </div>

              {/* Right: QR code */}
              <div className="bg-[#F7F5F0] flex flex-col items-center justify-center p-10 border-l border-[#E8E3DB]">
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`https://wa.me/${AGENTE_WA_NUMBER.replace(/\D/g, '')}?text=Ol%C3%A1%2C+gostaria+de+agendar+uma+consulta`)}&size=180x180&margin=8&color=1B3A2F`}
                    alt="QR Code WhatsApp"
                    width={180}
                    height={180}
                    unoptimized
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[#7A8C82] text-sm">
                  <QrCode className="w-4 h-4" />
                  <span>Escaneie para abrir no WhatsApp</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing teaser */}
      <section className="bg-[#1B3A2F] text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Simples e acessível</h2>
          <p className="text-[#A8D5BC] mb-8">7 dias grátis, depois apenas R$ 50,00/mês. Cancele quando quiser.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left">
            {['Agenda ilimitada', 'Pacientes ilimitados', 'Recibos em PDF', 'Agente WhatsApp (July)', 'Prontuário por IA', 'Exportação Carnê-Leão'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-[#D4EDE0]">
                <CheckCircle className="w-4 h-4 text-[#5A9E7C] shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#5A9E7C] text-white px-8 py-3.5 rounded-xl font-medium hover:bg-[#4A8E6C] transition-colors">
            Criar conta grátis <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-[#A8BFB2]">
        © 2026 PsiPlanner · <Link href="/login" className="hover:underline">Entrar</Link> · <Link href="/register" className="hover:underline">Cadastrar</Link> · <Link href="/planos" className="hover:underline">Planos</Link>
      </footer>
    </div>
  )
}
