'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Brain, Loader2 } from 'lucide-react'

const SYMBOLS = [
  { char: 'ψ', label: 'Psicologia' },
  { char: '⚖', label: 'Direito' },
  { char: '∞', label: 'Filosofia' },
  { char: '✍', label: 'Letras' },
  { char: '⚕', label: 'Saúde' },
  { char: 'Σ', label: 'Ciências' },
  { char: '♪', label: 'Artes' },
  { char: '✝', label: 'Teologia' },
  { char: 'Ω', label: 'Humanidades' },
  { char: 'θ', label: 'Filosofia' },
  { char: '♥', label: 'Serviço Social' },
  { char: 'π', label: 'Ciências Sociais' },
]

// Duplicado para o loop contínuo sem quebra
const TRACK = [...SYMBOLS, ...SYMBOLS]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password: senha,
      redirect: false,
    })

    if (!result || result.error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    window.location.assign('/dashboard')
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex">

      {/* ── Fundo: imagem da praia ── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/bg-login.png)' }}
      />
      {/* Overlay escuro para legibilidade */}
      <div className="absolute inset-0 bg-black/45" />

      {/* ── Carrossel de símbolos ── */}
      <div
        className="absolute inset-0 flex items-center pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="symbols-carousel flex items-center gap-20 whitespace-nowrap">
          {TRACK.map((s, i) => (
            <span
              key={i}
              title={s.label}
              className="text-white select-none"
              style={{
                fontSize: '30vh',
                lineHeight: 1,
                opacity: 0.07,
                fontFamily: 'Georgia, serif',
                display: 'inline-block',
              }}
            >
              {s.char}
            </span>
          ))}
        </div>
      </div>

      {/* ── Conteúdo principal ── */}
      <div className="relative z-10 flex w-full min-h-screen">

        {/* Painel esquerdo */}
        <div className="hidden lg:flex flex-col justify-between w-2/5 px-12 py-16 bg-[#1e3a8a]/70 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="bg-[#3b82f6] rounded-xl p-2">
              <Brain className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-white font-semibold text-lg tracking-wide">PsiPlanner</span>
          </div>

          <div>
            <blockquote
              className="text-[#93c5fd] text-2xl font-light leading-relaxed mb-6"
              style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}
            >
              &ldquo;Cuidar de quem cuida começa com organização e clareza.&rdquo;
            </blockquote>
            <ul className="space-y-3">
              {[
                'Agenda inteligente de consultas',
                'Recibos digitais em segundos',
                'Gestão financeira e Carnê-Leão',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[#93c5fd] text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[#3b82f6] text-xs">Para profissionais de saúde brasileiros</p>
        </div>

        {/* Painel direito — formulário */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl px-8 py-10">

            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="bg-[#1e3a8a] rounded-xl p-2">
                <Brain className="w-5 h-5 text-[#3b82f6]" strokeWidth={1.5} />
              </div>
              <span className="text-[#0f172a] font-semibold text-lg">PsiPlanner</span>
            </div>

            <h1
              className="text-2xl font-semibold text-[#0f172a] mb-1"
              style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}
            >
              Bem-vindo de volta
            </h1>
            <p className="text-[#64748b] text-sm mb-8">Entre para acessar sua agenda</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] outline-none text-sm text-[#0f172a] placeholder:text-[#94a3b8] transition-all"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-[#334155]">Senha</label>
                  <Link href="/recuperar-senha" className="text-xs text-[#2563eb] hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] outline-none text-sm text-[#0f172a] placeholder:text-[#94a3b8] transition-all"
                />
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563eb] text-white py-3 rounded-xl font-medium hover:bg-[#1d4ed8] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 text-sm mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Entrar
              </button>
            </form>

            <p className="text-center text-sm text-[#64748b] mt-6">
              Não tem conta?{' '}
              <Link href="/register" className="text-[#2563eb] font-medium hover:underline">
                Criar conta grátis — 7 dias
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
