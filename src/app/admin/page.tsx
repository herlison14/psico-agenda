'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield, Users, TrendingUp, LogOut, RefreshCw,
  Crown, FlaskConical, Clock, Ban, RotateCcw,
  Eye, EyeOff, ChevronUp, ChevronDown, Unlock, KeyRound,
} from 'lucide-react'

type Stats = {
  total: number; trial: number; pro: number
  teste: number; bloqueado: number; novos_30d: number; receita_mensal: number
}

type Usuario = {
  id: string; nome: string; email: string; plano: string
  trial_fim: string | null; is_teste: boolean; last_login_at: string | null
  created_at: string; total_sessoes: number; pacientes_ativos: number
}

type SortKey = keyof Pick<Usuario, 'nome' | 'plano' | 'created_at' | 'last_login_at' | 'total_sessoes'>

function diasRestantes(trialFim: string | null): number | null {
  if (!trialFim) return null
  return Math.max(0, Math.ceil((new Date(trialFim).getTime() - Date.now()) / 86_400_000))
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function fmtDatetime(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

const PLANO_SELECT_CLS: Record<string, string> = {
  trial:     'bg-amber-500/15 text-amber-300 border-amber-500/30',
  pro:       'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  bloqueado: 'bg-red-500/15 text-red-300 border-red-500/30',
}

export default function AdminPage() {
  const [authed, setAuthed]       = useState(false)
  const [checking, setChecking]   = useState(true)
  const [senha, setSenha]         = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [loginErr, setLoginErr]   = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [stats, setStats]         = useState<Stats | null>(null)
  const [usuarios, setUsuarios]   = useState<Usuario[]>([])
  const [busca, setBusca]         = useState('')
  const [filtroPlano, setFiltroPlano] = useState('todos')
  const [loading, setLoading]     = useState(false)
  const [sortKey, setSortKey]     = useState<SortKey>('created_at')
  const [sortAsc, setSortAsc]     = useState(false)
  const [acaoId, setAcaoId]       = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => { if (r.ok) setAuthed(true) })
      .finally(() => setChecking(false))
  }, [])

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, uRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/usuarios'),
      ])
      if (sRes.ok) setStats(await sRes.json())
      if (uRes.ok) setUsuarios(await uRes.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (authed) carregar() }, [authed, carregar])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoggingIn(true)
    setLoginErr('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha }),
    })
    if (res.ok) setAuthed(true)
    else setLoginErr('Senha incorreta.')
    setLoggingIn(false)
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    setAuthed(false)
    setStats(null)
    setUsuarios([])
  }

  async function acao(id: string, tipo: string, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return
    setAcaoId(id + tipo)
    try {
      await fetch(`/api/admin/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: tipo }),
      })
      await carregar()
    } finally {
      setAcaoId(null)
    }
  }

  async function gerarLinkReset(u: Usuario) {
    if (!confirm(`Gerar link de redefinição de senha para ${u.email}?`)) return
    setAcaoId(u.id + 'link_reset')
    try {
      const res = await fetch(`/api/admin/usuarios/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'link_reset' }),
      })
      const data = await res.json()
      if (data.link) {
        await navigator.clipboard.writeText(data.link).catch(() => null)
        alert(`✅ Link copiado para a área de transferência!\n\nSe não copiou, copie manualmente:\n\n${data.link}`)
      } else {
        alert('Erro ao gerar link: ' + (data.error ?? 'desconhecido'))
      }
    } finally {
      setAcaoId(null)
    }
  }

  async function handlePlanoChange(u: Usuario, novoPlano: string) {
    if (novoPlano === u.plano) return
    const mapa: Record<string, string> = { pro: 'pro', trial: 'trial', bloqueado: 'bloquear' }
    const acaoTipo = mapa[novoPlano]
    if (!acaoTipo) return
    const label = novoPlano === 'bloqueado' ? 'Bloquear' : `Mudar para ${novoPlano}`
    await acao(u.id, acaoTipo, `${label}: ${u.nome}?`)
  }

  const lista = usuarios
    .filter(u => {
      const q = busca.toLowerCase()
      const matchBusca = !q || u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      const matchPlano = filtroPlano === 'todos' ? true
        : filtroPlano === 'teste' ? u.is_teste
        : u.plano === filtroPlano
      return matchBusca && matchPlano
    })
    .sort((a, b) => {
      const va = a[sortKey] ?? ''
      const vb = b[sortKey] ?? ''
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(true) }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-20" />
    return sortAsc
      ? <ChevronUp className="w-3 h-3 text-indigo-400" />
      : <ChevronDown className="w-3 h-3 text-indigo-400" />
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-900/40">
              <Shield className="w-7 h-7 text-white" strokeWidth={1.75} />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold text-center mb-1">Painel Master</h1>
          <p className="text-slate-400 text-sm text-center mb-8">Acesso restrito — PsiPlanner Admin</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Senha master"
                required
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {loginErr && <p className="text-red-400 text-sm">{loginErr}</p>}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loggingIn ? 'Autenticando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Shield className="w-4 h-4 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-bold text-white text-sm">PsiPlanner Admin</p>
            <p className="text-slate-400 text-xs">Painel Master</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={carregar}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total',          value: stats.total,           icon: Users,        color: 'text-slate-300' },
              { label: 'Em trial',       value: stats.trial,           icon: Clock,        color: 'text-amber-400' },
              { label: 'Pro (pagantes)', value: stats.pro,             icon: Crown,        color: 'text-emerald-400' },
              { label: 'Equipe teste',   value: stats.teste,           icon: FlaskConical, color: 'text-indigo-400' },
              { label: 'Bloqueados',     value: stats.bloqueado,       icon: Ban,          color: 'text-red-400' },
              {
                label: 'Receita mensal',
                value: `R$ ${Number(stats.receita_mensal).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
                icon: TrendingUp,
                color: 'text-emerald-400',
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <Icon className={`w-4 h-4 ${color} mb-2`} strokeWidth={1.75} />
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            className="bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            {['todos', 'trial', 'pro', 'teste', 'bloqueado'].map(f => (
              <button
                key={f}
                onClick={() => setFiltroPlano(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filtroPlano === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-slate-500 text-xs ml-auto">{lista.length} usuário(s)</span>
        </div>

        {/* Tabela */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  {([
                    { label: 'Nome / E-mail',  key: 'nome' as SortKey },
                    { label: 'Plano',          key: 'plano' as SortKey },
                    { label: 'Trial restante', key: null },
                    { label: 'Sessões / Pac.', key: 'total_sessoes' as SortKey },
                    { label: 'Último login',   key: 'last_login_at' as SortKey },
                    { label: 'Cadastro',       key: 'created_at' as SortKey },
                    { label: 'Ações extras',   key: null },
                  ] as { label: string; key: SortKey | null }[]).map(({ label, key }) => (
                    <th
                      key={label}
                      onClick={() => key && toggleSort(key)}
                      className={`px-4 py-3 text-left font-medium whitespace-nowrap ${key ? 'cursor-pointer hover:text-white' : ''}`}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {key && <SortIcon k={key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {lista.map(u => {
                  const dias = diasRestantes(u.trial_fim)
                  const busy = (tipo: string) => acaoId === u.id + tipo

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">

                      {/* Nome / e-mail */}
                      <td className="px-4 py-3 min-w-[180px]">
                        <p className="font-medium text-white flex items-center gap-1.5 flex-wrap">
                          {u.nome ?? '—'}
                          {u.is_teste && (
                            <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              <FlaskConical className="w-2.5 h-2.5" /> TESTE
                            </span>
                          )}
                        </p>
                        <p className="text-slate-400 text-xs">{u.email}</p>
                      </td>

                      {/* Plano — select direto */}
                      <td className="px-4 py-3">
                        <select
                          value={u.plano}
                          disabled={!!acaoId}
                          onChange={e => handlePlanoChange(u, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors appearance-none bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${
                            PLANO_SELECT_CLS[u.plano] ?? PLANO_SELECT_CLS.trial
                          }`}
                        >
                          <option value="trial">Trial</option>
                          <option value="pro">Pro</option>
                          <option value="bloqueado">Bloqueado</option>
                        </select>
                      </td>

                      {/* Trial restante */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {u.plano === 'trial' && dias !== null ? (
                          <span className={
                            dias === 0 ? 'text-red-400 font-bold' :
                            dias <= 3  ? 'text-red-400 font-semibold' :
                            dias <= 7  ? 'text-amber-400 font-semibold' :
                            'text-slate-300'
                          }>
                            {dias === 0 ? 'Expirado' : `${dias}d restantes`}
                            {u.trial_fim && (
                              <span className="block text-slate-500 font-normal">{fmtDate(u.trial_fim)}</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Sessões / Pacientes */}
                      <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">
                        <span className="font-medium">{u.total_sessoes}</span> sess.
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="font-medium">{u.pacientes_ativos}</span> pac.
                      </td>

                      {/* Último login */}
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {fmtDatetime(u.last_login_at)}
                      </td>

                      {/* Cadastro */}
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {fmtDate(u.created_at)}
                      </td>

                      {/* Ações extras */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">

                          {/* Marcar como equipe teste (só se não é Pro já como teste) */}
                          {!u.is_teste && (
                            <button
                              onClick={() => acao(u.id, 'teste', `Marcar ${u.nome} como equipe teste (Pro interno)?`)}
                              disabled={!!acaoId}
                              title="Marcar como equipe teste (Pro gratuito)"
                              className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-xs transition-colors disabled:opacity-40 whitespace-nowrap"
                            >
                              <FlaskConical className="w-3 h-3" />
                              Teste
                            </button>
                          )}

                          {/* Remover flag de teste */}
                          {u.is_teste && (
                            <button
                              onClick={() => acao(u.id, 'remover_teste', `Remover flag de teste de ${u.nome}?`)}
                              disabled={!!acaoId}
                              title="Remover flag de equipe teste"
                              className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-300 hover:bg-red-500/15 hover:text-red-300 rounded-lg text-xs transition-colors disabled:opacity-40 whitespace-nowrap"
                            >
                              <FlaskConical className="w-3 h-3" />
                              Rem. Teste
                            </button>
                          )}

                          {/* +30 dias trial */}
                          {u.plano === 'trial' && (
                            <button
                              onClick={() => acao(u.id, 'extend')}
                              disabled={busy('extend') || !!acaoId}
                              title="Adicionar 30 dias ao trial"
                              className="flex items-center gap-1 px-2 py-1 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded-lg text-xs transition-colors disabled:opacity-40 whitespace-nowrap"
                            >
                              <Clock className="w-3 h-3" />
                              {busy('extend') ? '…' : '+30d'}
                            </button>
                          )}

                          {/* Pro direto */}
                          {u.plano !== 'pro' && (
                            <button
                              onClick={() => acao(u.id, 'pro', `Ativar Pro para ${u.nome}?`)}
                              disabled={busy('pro') || !!acaoId}
                              title="Ativar plano Pro"
                              className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs transition-colors disabled:opacity-40 whitespace-nowrap"
                            >
                              <Crown className="w-3 h-3" />
                              {busy('pro') ? '…' : 'Pro'}
                            </button>
                          )}

                          {/* Desbloquear */}
                          {u.plano === 'bloqueado' && (
                            <button
                              onClick={() => acao(u.id, 'desbloquear')}
                              disabled={busy('desbloquear') || !!acaoId}
                              title="Desbloquear (volta para trial)"
                              className="flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg text-xs transition-colors disabled:opacity-40 whitespace-nowrap"
                            >
                              <Unlock className="w-3 h-3" />
                              Desbloquear
                            </button>
                          )}

                          {/* Reset trial */}
                          {(u.plano === 'pro' || u.is_teste) && (
                            <button
                              onClick={() => acao(u.id, 'reset', `Resetar ${u.nome} para trial (14 dias)? Isso remove o plano Pro.`)}
                              disabled={busy('reset') || !!acaoId}
                              title="Resetar para trial com 14 dias novos"
                              className="flex items-center gap-1 px-2 py-1 bg-slate-700/60 text-slate-400 hover:bg-slate-700 rounded-lg text-xs transition-colors disabled:opacity-40 whitespace-nowrap"
                            >
                              <RotateCcw className="w-3 h-3" />
                              {busy('reset') ? '…' : 'Reset'}
                            </button>
                          )}

                          {/* Link reset de senha */}
                          <button
                            onClick={() => gerarLinkReset(u)}
                            disabled={busy('link_reset') || !!acaoId}
                            title="Gerar link de redefinição de senha (sem email)"
                            className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-lg text-xs transition-colors disabled:opacity-40 whitespace-nowrap"
                          >
                            <KeyRound className="w-3 h-3" />
                            {busy('link_reset') ? '…' : 'Reset senha'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {lista.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center text-slate-500 text-sm">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
