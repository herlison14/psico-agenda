'use client'

import { useState, useRef, useEffect, use } from 'react'
import { Brain, Send, Loader2, ArrowRight, Globe, ExternalLink } from 'lucide-react'

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const IconLinkedin = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

type Msg = { role: 'user' | 'assistant'; content: string }

type PsicPublico = {
  nome: string | null
  crp: string | null
  instagram: string | null
  linkedin: string | null
  site_url: string | null
}

export default function AgendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: psicologoId } = use(params)

  const [psicologo, setPsicologo] = useState<PsicPublico | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [identificado, setIdentificado] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pacienteId, setPacienteId] = useState<string | null>(null)
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  // Carrega dados públicos do profissional
  useEffect(() => {
    fetch(`/api/psicologos/publico/${psicologoId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && !data.error) setPsicologo(data) })
      .catch(() => {})
  }, [psicologoId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function handleIdentificacao(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !telefone.trim()) return

    setIdentificado(true)
    setLoading(true)

    const primeiroNome = psicologo?.nome ? psicologo.nome.split(' ')[0] : 'seu psicólogo'
    const saudacao = `Olá, ${nome.split(' ')[0]}! 😊 Sou a July, assistente virtual de ${primeiroNome}. Como posso te ajudar hoje? Gostaria de agendar uma consulta, verificar um agendamento existente ou cancelar/reagendar?`
    setMsgs([{ role: 'assistant', content: saudacao }])
    setLoading(false)
  }

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Msg = { role: 'user', content: text }
    setMsgs((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/agendar/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psicologo_id: psicologoId,
          paciente_nome: nome,
          paciente_phone: telefone,
          message: text,
          history,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMsgs((m) => [...m, { role: 'assistant', content: data.error ?? 'Erro ao processar. Tente novamente.' }])
        return
      }

      const reply: string = data.reply ?? 'Desculpe, não consegui processar sua mensagem.'
      setMsgs((m) => [...m, { role: 'assistant', content: reply }])
      setHistory((h) => [...h, { role: 'user', content: text }, { role: 'assistant', content: reply }])
      if (data.paciente_id) setPacienteId(data.paciente_id)
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: 'Erro de conexão. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  // Redes sociais clicáveis
  const socialLinks = [
    psicologo?.instagram && {
      href: `https://instagram.com/${psicologo.instagram.replace(/^@/, '')}`,
      icon: <IconInstagram />,
      label: `@${psicologo.instagram.replace(/^@/, '')}`,
      color: 'hover:text-[#e1306c]',
    },
    psicologo?.linkedin && {
      href: psicologo.linkedin.startsWith('http') ? psicologo.linkedin : `https://${psicologo.linkedin}`,
      icon: <IconLinkedin />,
      label: 'LinkedIn',
      color: 'hover:text-[#0077b5]',
    },
    psicologo?.site_url && {
      href: psicologo.site_url.startsWith('http') ? psicologo.site_url : `https://${psicologo.site_url}`,
      icon: <Globe className="w-4 h-4" />,
      label: 'Site',
      color: 'hover:text-[#2563eb]',
    },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string; color: string }[]

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4 py-10">

      {/* Logo + Info do profissional */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#1e3a8a] rounded-xl p-2">
            <Brain className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-semibold text-[#1e3a8a] text-lg">PsiPlanner</span>
        </div>

        {psicologo?.nome && (
          <div className="text-center">
            <p className="text-sm font-semibold text-[#0f172a]">{psicologo.nome}</p>
            {psicologo.crp && (
              <p className="text-xs text-[#64748b]">CRP {psicologo.crp}</p>
            )}
          </div>
        )}

        {/* Redes sociais */}
        {socialLinks.length > 0 && (
          <div className="flex items-center gap-3 mt-1">
            {socialLinks.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 text-[#64748b] text-xs font-medium transition-colors ${s.color} group`}
                title={s.label}
              >
                <span className="text-[#94a3b8] group-hover:inherit transition-colors">{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-md">
        {!identificado ? (
          /* ── Formulário de identificação ── */
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-8">
            <h1 className="text-xl font-semibold text-[#1e3a8a] mb-1">Agendar consulta</h1>
            <p className="text-sm text-[#64748b] mb-6">
              Informe seus dados para continuar com o agendamento.
            </p>
            <form onSubmit={handleIdentificacao} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Seu nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Ana Silva"
                  required
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(21) 99999-9999"
                  required
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#1e3a8a] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#1d4ed8] transition-colors"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* ── Chat com July ── */
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col h-[560px]">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-[#1e3a8a]">
              <div className="bg-[#3b82f6] rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">July</p>
                <p className="text-[#93c5fd] text-xs">Assistente de agendamento</p>
              </div>
              <div className="ml-auto w-2 h-2 bg-[#3b82f6] rounded-full" />
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#1e3a8a] text-white rounded-br-sm'
                        : 'bg-[#F0EDE7] text-[#0f172a] rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#F0EDE7] px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-[#64748b] rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Sugestões rápidas */}
            {msgs.length <= 1 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {['Quero agendar uma consulta', 'Ver meu próximo agendamento', 'Cancelar ou reagendar'].map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-[#eff6ff] text-[#2563eb] px-3 py-1.5 rounded-full hover:bg-[#dbeafe] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-[#F0EDE7]">
              <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-[#1e3a8a] text-white p-2.5 rounded-xl hover:bg-[#1d4ed8] disabled:opacity-40 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-[#94a3b8] mt-5">
          Agendamento seguro via PsiPlanner · Seus dados são protegidos
        </p>
      </div>
    </div>
  )
}
