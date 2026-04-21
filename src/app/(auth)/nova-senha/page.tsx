'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Leaf, Loader2 } from 'lucide-react'

function NovaSenhaForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!token) setErro('Link inválido ou expirado. Solicite um novo.')
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha !== confirmacao) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 8) { setErro('A senha deve ter pelo menos 8 caracteres.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: senha }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao redefinir senha.'); return }
      router.push('/login?reset=ok')
    } catch {
      setErro('Falha de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#F7F5F0]">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-[#1B3A2F] rounded-xl p-2">
            <Leaf className="w-5 h-5 text-[#5A9E7C]" strokeWidth={1.5} />
          </div>
          <span className="text-[#1C2B22] font-semibold text-lg">PsiPlanner</span>
        </div>

        <h1 className="text-2xl font-semibold text-[#1C2B22] mb-1">Nova senha</h1>
        <p className="text-[#7A8C82] text-sm mb-8">Escolha uma senha segura com pelo menos 8 caracteres.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Nova senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              disabled={!token}
              className="w-full px-4 py-3 bg-white border border-[#D4CFC6] rounded-xl focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none text-sm text-[#1C2B22] placeholder:text-[#B0ABA3] transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Confirmar senha</label>
            <input
              type="password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              disabled={!token}
              className="w-full px-4 py-3 bg-white border border-[#D4CFC6] rounded-xl focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none text-sm text-[#1C2B22] placeholder:text-[#B0ABA3] transition-all disabled:opacity-50"
            />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{erro}</div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-[#1B3A2F] text-white py-3 rounded-xl font-medium hover:bg-[#244D3F] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Redefinir senha
          </button>
        </form>
      </div>
    </div>
  )
}

export default function NovaSenhaPage() {
  return (
    <Suspense>
      <NovaSenhaForm />
    </Suspense>
  )
}
