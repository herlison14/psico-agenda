'use client'

import { useState, useRef, useEffect, use } from 'react'
import { Leaf, Send, Loader2, ArrowRight } from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function AgendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: psicologoId } = use(params)

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [identificado, setIdentificado] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pacienteId, setPacienteId] = useState<string | null>(null)
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function handleIdentificacao(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !telefone.trim()) return

    setIdentificado(true)
    setLoading(true)

    const saudacao = `Olá, ${nome.split(' ')[0]}! 😊 Sou a July, assistente virtual. Como posso te ajudar hoje? Gostaria de agendar uma consulta, verificar um agendamento existente ou cancelar/reagendar?`
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

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="bg-[#1B3A2F] rounded-xl p-2">
          <Leaf className="w-4 h-4 text-white" strokeWidth={1.5} />
        </div>
        <span className="font-semibold text-[#1B3A2F] text-lg">PsiPlanner</span>
      </div>

      <div className="w-full max-w-md">
        {!identificado ? (
          /* ── Formulário de identificação ── */
          <div className="bg-white rounded-2xl border border-[#E8E3DB] shadow-sm p-8">
            <h1 className="text-xl font-semibold text-[#1B3A2F] mb-1">Agendar consulta</h1>
            <p className="text-sm text-[#7A8C82] mb-6">
              Informe seus dados para continuar com o agendamento.
            </p>
            <form onSubmit={handleIdentificacao} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Seu nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Ana Silva"
                  required
                  className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E8E3DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A9E7C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(21) 99999-9999"
                  required
                  className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E8E3DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A9E7C]"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#1B3A2F] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#244D3F] transition-colors"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* ── Chat com July ── */
          <div className="bg-white rounded-2xl border border-[#E8E3DB] shadow-sm overflow-hidden flex flex-col h-[560px]">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-[#1B3A2F]">
              <div className="bg-[#5A9E7C] rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">July</p>
                <p className="text-[#A8D5BC] text-xs">Assistente de agendamento</p>
              </div>
              <div className="ml-auto w-2 h-2 bg-[#5A9E7C] rounded-full" />
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#1B3A2F] text-white rounded-br-sm'
                        : 'bg-[#F0EDE7] text-[#1C2B22] rounded-bl-sm'
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
                          className="w-1.5 h-1.5 bg-[#7A8C82] rounded-full animate-bounce"
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
                    className="text-xs bg-[#EBF5EF] text-[#2D6A52] px-3 py-1.5 rounded-full hover:bg-[#D4EDDF] transition-colors"
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
                  className="flex-1 px-4 py-2.5 bg-[#F7F5F0] border border-[#E8E3DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A9E7C]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-[#1B3A2F] text-white p-2.5 rounded-xl hover:bg-[#244D3F] disabled:opacity-40 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-[#A8BFB2] mt-5">
          Agendamento seguro via PsiPlanner · Seus dados são protegidos
        </p>
      </div>
    </div>
  )
}
