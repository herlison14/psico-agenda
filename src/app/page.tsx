'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Brain, Send, CalendarDays, Users, FileText, DollarSign,
  Mic2, ChevronRight, CheckCircle, Star, ArrowRight,
  Shield, Zap, Clock, ChevronDown,
} from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; content: string }

const SUGESTOES = [
  'Como funciona o trial?',
  'Vocês têm geração de recibo PDF?',
  'O que é o agente July?',
]

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Agenda visual semanal',
    desc: 'Visualize toda a sua semana de um relance. Arraste, confirme presenças e gerencie cancelamentos em segundos.',
  },
  {
    icon: Users,
    title: 'Gestão de pacientes',
    desc: 'Histórico completo, notas clínicas e prontuário SOAP gerado por IA a partir do áudio da consulta.',
  },
  {
    icon: FileText,
    title: 'Recibos em PDF',
    desc: 'Gere recibos profissionais com um clique e envie diretamente ao paciente por e-mail ou WhatsApp.',
  },
  {
    icon: DollarSign,
    title: 'Financeiro + Carnê-Leão',
    desc: 'Resumo mensal automático e exportação CSV pronto para importar na declaração de Imposto de Renda.',
  },
  {
    icon: Mic2,
    title: 'Transcrição de consultas',
    desc: 'Grave a sessão, a IA transcreve, organiza em SOAP e salva no prontuário — tudo sem você digitar nada.',
  },
  {
    icon: Zap,
    title: 'Agente July com IA',
    desc: 'Assistente inteligente que responde dúvidas, agenda sessões e consulta disponibilidades em tempo real.',
  },
]

const STEPS = [
  { n: '01', title: 'Crie sua conta', desc: 'Cadastro em menos de 2 minutos. Sem cartão de crédito, sem pegadinhas.' },
  { n: '02', title: 'Configure sua agenda', desc: 'Adicione pacientes, defina horários e personalize seus valores de sessão.' },
  { n: '03', title: 'Atenda com mais leveza', desc: 'Recibos, financeiro e prontuários automáticos — você foca no que importa.' },
]

const TESTIMONIALS = [
  {
    initials: 'AM',
    nome: 'Ana Martins',
    crp: 'CRP 06/87432 · Psicóloga',
    texto: 'Reduzi quase 1 hora de trabalho administrativo por dia. Os recibos em PDF me salvaram na declaração do IR.',
    estrelas: 5,
  },
  {
    initials: 'RC',
    nome: 'Rafael Costa',
    crp: 'CRN 04/23198 · Nutricionista',
    texto: 'A transcrição automática das consultas é incrível. O prontuário fica pronto antes de eu abrir o próximo paciente.',
    estrelas: 5,
  },
  {
    initials: 'FS',
    nome: 'Fernanda Souza',
    crp: 'CRM 08/14765 · Médica',
    texto: 'Finalmente tenho controle financeiro real do consultório. O relatório mensal me mostra exatamente onde estou.',
    estrelas: 5,
  },
]

const FAQS = [
  { q: 'Preciso de cartão de crédito para o trial?', a: 'Não. O trial de 7 dias é completamente gratuito e sem necessidade de informar dados de pagamento.' },
  { q: 'Posso cancelar quando quiser?', a: 'Sim. Você pode cancelar a assinatura a qualquer momento, sem multa ou prazo mínimo de fidelidade.' },
  { q: 'Meus dados ficam seguros?', a: 'Sim. Usamos criptografia em trânsito e em repouso, autenticação segura e nunca compartilhamos seus dados ou de pacientes com terceiros.' },
  { q: 'A July funciona no WhatsApp?', a: 'A July é a assistente de IA integrada ao dashboard. Ela consulta agenda, pacientes e cria sessões por comandos em linguagem natural.' },
  { q: 'Funciona em celular?', a: 'Sim. O PsiPlanner é totalmente responsivo e funciona bem em qualquer dispositivo.' },
]

const RECURSOS = [
  'Agenda semanal ilimitada',
  'Pacientes ilimitados',
  'Recibos em PDF',
  'Financeiro + Carnê-Leão',
  'Transcrição de consultas',
  'Prontuário SOAP por IA',
  'Agente July com IA',
  'Suporte por e-mail',
]

export default function HomePage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Olá! Sou a July, assistente da PsiPlanner. Posso te mostrar como a plataforma funciona ou tirar dúvidas. Como posso ajudar?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{ role: string; content: string }[]>([])
  const [faqAberta, setFaqAberta] = useState<number | null>(null)
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
    <div className="min-h-screen bg-white font-sans">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 rounded-xl p-2">
              <Brain className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-bold text-slate-900 text-lg">PsiPlanner</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-500">
            <a href="#funcionalidades" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-blue-600 transition-colors">Como funciona</a>
            <a href="#planos" className="hover:text-blue-600 transition-colors">Planos</a>
            <Link href="/login" className="hover:text-blue-600 transition-colors font-medium">Entrar</Link>
          </nav>
          <Link
            href="/register"
            className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <span className="inline-block bg-blue-500/30 text-blue-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase border border-blue-400/40">
            7 dias grátis · sem cartão de crédito
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-3xl mx-auto">
            Gerencie seu consultório com{' '}
            <span className="text-blue-200">mais leveza e menos papelada</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Agenda, pacientes, recibos, financeiro e prontuário gerado por IA —
            tudo em um lugar só. Para psicólogos, nutricionistas, médicos e todos os profissionais de saúde autônomos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-colors text-base"
            >
              Criar conta grátis <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl font-medium hover:bg-white/20 transition-colors text-base border border-white/20"
            >
              Ver demonstração
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-white/10 pt-10">
            {[
              { n: '7 dias', label: 'de trial gratuito' },
              { n: 'R$ 50', label: 'por mês após trial' },
              { n: '100%', label: 'para profissionais de saúde' },
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{n}</p>
                <p className="text-xs text-blue-200 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
          {[
            { icon: Shield, text: 'Dados protegidos com criptografia' },
            { icon: CheckCircle, text: 'Sem fidelidade, cancele quando quiser' },
            { icon: Clock, text: 'Setup em menos de 5 minutos' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-blue-500" strokeWidth={1.75} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Funcionalidades ── */}
      <section id="funcionalidades" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Funcionalidades</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-3 mb-4">Tudo que você precisa, nada que não precisa</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Uma plataforma completa pensada para a realidade do profissional de saúde autônomo brasileiro.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
              <div className="bg-blue-50 rounded-xl p-3 w-fit mb-4">
                <Icon className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como-funciona" className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Como funciona</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3 mb-4">Comece a usar em minutos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white font-bold text-lg flex items-center justify-center mx-auto mb-5">
                  {n}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo July ── */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Agente de IA</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3 mb-4">Conheça a July, sua assistente</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              A July é uma IA integrada ao PsiPlanner que conhece seus pacientes, sua agenda e seus dados.
              Pergunte sobre disponibilidade, peça para criar uma sessão ou tire dúvidas sobre a plataforma.
            </p>
            <ul className="space-y-3 mb-8">
              {['Consulta horários disponíveis', 'Cria e cancela sessões', 'Busca informações de pacientes', 'Responde dúvidas da plataforma'].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" strokeWidth={1.75} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Chat */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[460px]">
            <div className="flex items-center gap-3 px-5 py-4 bg-blue-700">
              <div className="bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">July</p>
                <p className="text-blue-200 text-xs">Assistente PsiPlanner · Demo</p>
              </div>
              <div className="ml-auto w-2 h-2 bg-blue-300 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-700 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {msgs.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 bg-slate-50">
                {SUGESTOES.map(s => (
                  <button key={s} onClick={() => send(s)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors border border-blue-100">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="px-4 pb-4 pt-2 bg-white border-t border-slate-100">
              <form onSubmit={e => { e.preventDefault(); send(input) }} className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Pergunte sobre a plataforma..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button type="submit" disabled={loading || !input.trim()} className="bg-blue-700 text-white p-2.5 rounded-xl hover:bg-blue-600 disabled:opacity-40 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Depoimentos ── */}
      <section className="bg-blue-700 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-widest">Depoimentos</span>
            <h2 className="text-3xl font-bold text-white mt-3 mb-4">O que dizem os profissionais</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ initials, nome, crp, texto, estrelas }) => (
              <div key={nome} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: estrelas }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-blue-300 fill-blue-300" />
                  ))}
                </div>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">&ldquo;{texto}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{nome}</p>
                    <p className="text-blue-300 text-xs">{crp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section id="planos" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Planos</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-3 mb-4">Simples e transparente</h2>
          <p className="text-slate-500">7 dias grátis para testar tudo. Sem cartão de crédito.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Trial */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Trial</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-slate-900">Grátis</span>
            </div>
            <p className="text-sm text-slate-300 mb-8">7 dias · sem cartão · acesso total</p>
            <ul className="space-y-3 mb-8">
              {RECURSOS.map(r => (
                <li key={r} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" strokeWidth={1.75} />
                  {r}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block text-center bg-blue-50 text-blue-600 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors"
            >
              Começar trial grátis
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-blue-700 rounded-2xl p-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-5 right-5 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">Pro</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-white">R$ 50</span>
              <span className="text-blue-300 mb-1">,00/mês</span>
            </div>
            <p className="text-sm text-blue-300 mb-8">Após o trial · cancele quando quiser</p>
            <ul className="space-y-3 mb-8">
              {RECURSOS.map(r => (
                <li key={r} className="flex items-center gap-2.5 text-sm text-blue-100">
                  <CheckCircle className="w-4 h-4 text-blue-300 shrink-0" strokeWidth={1.75} />
                  {r}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block text-center bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-400 transition-colors"
            >
              Assinar agora
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Dúvidas</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3">Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqAberta(faqAberta === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-100 transition-colors"
                >
                  <span className="font-medium text-slate-800 text-sm pr-4">{q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${faqAberta === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {faqAberta === i && (
                  <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="bg-blue-700 rounded-3xl px-8 py-16">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para organizar seu consultório?</h2>
          <p className="text-blue-200 mb-8 text-lg">Comece grátis hoje. 7 dias de acesso completo, sem cartão de crédito.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-10 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-colors text-base"
          >
            Criar conta grátis <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600 rounded-xl p-2">
                <Brain className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <span className="font-bold text-slate-900">PsiPlanner</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/login" className="hover:text-slate-900 transition-colors">Entrar</Link>
              <Link href="/register" className="hover:text-slate-900 transition-colors">Cadastrar</Link>
              <Link href="/planos" className="hover:text-slate-900 transition-colors">Planos</Link>
            </div>
            <p className="text-xs text-slate-300">© 2026 PsiPlanner · Para profissionais de saúde brasileiros</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
