'use client'

import { useState } from 'react'
import { Brain, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setEnviado(true)
    } catch {
      setErro('Falha de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#f8fafc]">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-[#1e3a8a] rounded-xl p-2">
            <Brain className="w-5 h-5 text-[#3b82f6]" strokeWidth={1.5} />
          </div>
          <span className="text-[#0f172a] font-semibold text-lg">PsiPlanner</span>
        </div>

        {enviado ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[#0f172a] mb-2">Verifique seu e-mail</h1>
            <p className="text-[#64748b] text-sm mb-6">
              Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em breve.
            </p>
            <Link href="/login" className="text-[#2563eb] font-medium text-sm hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-[#0f172a] mb-1">Recuperar senha</h1>
            <p className="text-[#64748b] text-sm mb-8">Digite seu e-mail para receber o link de redefinição.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none text-sm text-[#0f172a] placeholder:text-[#94a3b8] transition-all"
                />
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{erro}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a8a] text-white py-3 rounded-xl font-medium hover:bg-[#1d4ed8] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar link de recuperação
              </button>
            </form>

            <Link href="/login" className="flex items-center justify-center gap-1 text-center text-sm text-[#64748b] mt-6 hover:text-[#2563eb]">
              <ArrowLeft className="w-4 h-4" /> Voltar ao login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
