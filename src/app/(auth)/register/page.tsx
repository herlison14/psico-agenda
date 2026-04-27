'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Leaf, Loader2, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [crp, setCrp] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, crp, email, password: senha }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErro(data?.error ?? 'Erro ao criar conta.')
        setLoading(false)
        return
      }
    } catch {
      setErro('Falha de rede. Tente novamente.')
      setLoading(false)
      return
    }

    const result = await signIn('credentials', {
      email,
      password: senha,
      redirect: false,
    })

    if (!result || result.error) {
      setErro('Conta criada! Faça login para continuar.')
      setLoading(false)
      return
    }

    window.location.assign('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Painel lateral */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-[#1B3A2F] px-12 py-16">
        <div className="flex items-center gap-3">
          <div className="bg-[#5A9E7C] rounded-xl p-2">
            <Leaf className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">PsiPlanner</span>
        </div>

        <div>
          <div className="inline-block bg-[#5A9E7C]/20 text-[#A8D5BC] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            7 dias grátis · sem cartão
          </div>
          <h2
            className="text-white text-2xl font-semibold mb-6 leading-snug"
            style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}
          >
            Tudo que você precisa para gerenciar sua clínica
          </h2>
          <ul className="space-y-3">
            {[
              'Agenda semanal visual',
              'Cadastro de pacientes',
              'Recibos em PDF',
              'Financeiro + Carnê-Leão',
              'Agente July com IA',
              'Transcrição e prontuário SOAP',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[#A8D5BC] text-sm">
                <CheckCircle className="w-4 h-4 text-[#5A9E7C] shrink-0" strokeWidth={1.75} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[#5A9E7C] text-xs">R$ 50,00/mês após o trial · Cancele quando quiser</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F7F5F0]">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="bg-[#1B3A2F] rounded-xl p-2">
              <Leaf className="w-5 h-5 text-[#5A9E7C]" strokeWidth={1.5} />
            </div>
            <span className="text-[#1C2B22] font-semibold text-lg">PsiPlanner</span>
          </div>

          <h1
            className="text-2xl font-semibold text-[#1C2B22] mb-1"
            style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}
          >
            Criar sua conta
          </h1>
          <p className="text-[#7A8C82] text-sm mb-8">
            7 dias grátis · sem cartão de crédito
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Dra. Ana Silva"
                className="w-full px-4 py-3 bg-white border border-[#D4CFC6] rounded-xl focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none text-sm text-[#1C2B22] placeholder:text-[#B0ABA3] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D5247] mb-1.5">
                CRP <span className="text-[#A8BFB2] font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={crp}
                onChange={(e) => setCrp(e.target.value)}
                placeholder="06/12345"
                className="w-full px-4 py-3 bg-white border border-[#D4CFC6] rounded-xl focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none text-sm text-[#1C2B22] placeholder:text-[#B0ABA3] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D5247] mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-white border border-[#D4CFC6] rounded-xl focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none text-sm text-[#1C2B22] placeholder:text-[#B0ABA3] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                className="w-full px-4 py-3 bg-white border border-[#D4CFC6] rounded-xl focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none text-sm text-[#1C2B22] placeholder:text-[#B0ABA3] transition-all"
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
              className="w-full bg-[#1B3A2F] text-white py-3 rounded-xl font-medium hover:bg-[#244D3F] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-center text-sm text-[#7A8C82] mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-[#2D6A52] font-medium hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
