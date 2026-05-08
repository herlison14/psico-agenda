'use client'

import {
  CalendarDays, DollarSign, FileText, Clock,
  Users, UserX, Link2, Copy, Check, Banknote,
  TrendingUp, Bell, Search, ChevronRight, CalendarCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { useState } from 'react'

/* ─── Dados mockados ───────────────────────────────────────────── */
const SESSOES_HOJE = [
  { id: 1, hora: '08:00', paciente: 'Ana Carolina Ferreira', duracao: 50, status: 'realizado', valor: 250 },
  { id: 2, hora: '09:00', paciente: 'Bruno Martins',          duracao: 50, status: 'agendado',  valor: 250 },
  { id: 3, hora: '10:30', paciente: 'Carla Mendonça',         duracao: 50, status: 'faltou',    valor: 250 },
  { id: 4, hora: '14:00', paciente: 'Daniel Oliveira',        duracao: 50, status: 'agendado',  valor: 300 },
  { id: 5, hora: '15:30', paciente: 'Fernanda Lima',          duracao: 50, status: 'agendado',  valor: 280 },
]

const STATUS_BADGE: Record<string, { variant: 'blue' | 'green' | 'red' | 'amber' | 'neutral'; label: string }> = {
  agendado:  { variant: 'blue',  label: 'Agendado'  },
  realizado: { variant: 'green', label: 'Realizado' },
  cancelado: { variant: 'red',   label: 'Cancelado' },
  faltou:    { variant: 'amber', label: 'Faltou'    },
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function PreviewPage() {
  const [copiado, setCopiado] = useState(false)

  function copiarLink() {
    navigator.clipboard.writeText('https://www.psiplanner.com.br/agendar/demo').then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div>

      {/* Banner de preview */}
      <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-200 text-sm text-violet-700 font-medium">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] font-bold shrink-0">✦</span>
        Preview de alta fidelidade — dados mockados para demonstração visual
        <a
          href="/dashboard"
          className="ml-auto flex items-center gap-1 text-violet-600 hover:text-violet-800 font-semibold transition-colors whitespace-nowrap"
        >
          Ir para o dashboard real <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Top bar (search + perfil) */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-faint]" strokeWidth={1.75} />
          <input
            readOnly
            placeholder="Buscar pacientes, sessões…"
            className="input-base pl-10 bg-white/70 backdrop-blur-sm text-sm cursor-default"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white/90 transition-colors">
            <Bell className="w-4 h-4 text-[--color-text-secondary]" strokeWidth={1.75} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3b82f6] border border-white" />
          </button>
          <div className="flex items-center gap-2.5 pl-3 border-l border-[--color-border]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center text-white text-sm font-bold shadow-sm">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[--color-text-primary] leading-tight">Dra. Ana</p>
              <p className="text-xs text-[--color-text-muted]">Psicóloga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saudação */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-[--color-text-primary]">
          Boa tarde, Dra. Ana 👋
        </h1>
        <p className="text-sm text-[--color-text-muted] mt-1.5 capitalize flex items-center gap-2">
          <CalendarCheck className="w-4 h-4" strokeWidth={1.75} />
          Quinta-feira, 8 de maio de 2026 · 5 sessões agendadas para hoje
        </p>
      </div>

      {/* KPIs — 6 cards gradiente */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Sessões hoje"     value={5}         icon={CalendarDays} variant="royal"   />
        <StatCard label="Receita do mês"   value={fmt(4200)} icon={DollarSign}   variant="emerald" />
        <StatCard label="A receber"        value={fmt(1830)} icon={Banknote}     variant="amber"   />
        <StatCard label="Recibos emitidos" value={12}        icon={FileText}     variant="teal"    />
        <StatCard label="Pacientes ativos" value={34}        icon={Users}        variant="indigo"  />
        <StatCard label="Faltas no mês"    value={3}         icon={UserX}        variant="violet"  />
      </div>

      {/* Mini painéis de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

        {/* Gráfico de receita */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[--color-text-muted]">Receita — 6 meses</p>
            <TrendingUp className="w-4 h-4 text-emerald-500" strokeWidth={1.75} />
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {[
              { h: 55, label: 'Nov' },
              { h: 68, label: 'Dez' },
              { h: 72, label: 'Jan' },
              { h: 60, label: 'Fev' },
              { h: 82, label: 'Mar' },
              { h: 100, label: 'Abr' },
            ].map(({ h, label }, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${h}%`,
                    background: i === 5
                      ? 'linear-gradient(to top, #059669, #0d9488)'
                      : 'linear-gradient(to top, rgb(5 150 105 / .2), rgb(13 148 136 / .15))',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {['Nov','Dez','Jan','Fev','Mar','Abr'].map(m => (
              <span key={m} className="text-[9px] text-[--color-text-faint] flex-1 text-center">{m}</span>
            ))}
          </div>
          <p className="text-xs text-[--color-text-muted] mt-2">
            <span className="text-emerald-600 font-semibold">↑ 22%</span> vs. mês anterior
          </p>
        </div>

        {/* Taxa de comparecimento */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[--color-text-muted]">Comparecimento</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="rgb(241 245 249)" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="14" fill="none"
                  stroke="url(#grad-ring-prev)" strokeWidth="3.5"
                  strokeDasharray={`${88 * 0.88} 88`} strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad-ring-prev" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[--color-text-primary]">88%</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[--color-text-primary] font-display">88%</p>
              <p className="text-xs text-[--color-text-muted] mt-0.5">44 de 50 sessões<br />comparecidas</p>
            </div>
          </div>
        </div>

        {/* Próxima sessão */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[--color-text-muted]">Próxima sessão</p>
            <Clock className="w-4 h-4 text-[--color-navy]" strokeWidth={1.75} />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[--color-navy-light] border border-[--color-navy-ring]">
            <div className="stat-icon bg-[--color-navy] shrink-0">
              <Clock className="w-4 h-4 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-semibold text-[--color-text-primary] text-sm">Bruno Martins</p>
              <p className="text-xs text-[--color-text-muted]">09:00 · 50 min · R$ 250</p>
            </div>
          </div>
          <p className="text-xs text-[--color-text-muted] mt-3 text-center">
            Em <span className="font-semibold text-[--color-navy]">34 minutos</span>
          </p>
        </div>
      </div>

      {/* Link de agendamento */}
      <div className="bg-[--color-navy-light] border border-[--color-navy-ring] rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="bg-[--color-navy] rounded-xl p-2.5 shrink-0">
          <Link2 className="w-4 h-4 text-white" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[--color-navy] mb-0.5">
            Seu link de agendamento
          </p>
          <p className="text-xs text-[--color-text-secondary] truncate font-mono">
            https://www.psiplanner.com.br/agendar/demo
          </p>
        </div>
        <button onClick={copiarLink} className="btn-primary shrink-0">
          {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copiado ? 'Copiado!' : 'Copiar link'}
        </button>
      </div>

      {/* Sessões de hoje */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--color-border-soft]">
          <h2 className="font-semibold text-[--color-text-primary] flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[--color-navy]" strokeWidth={1.75} />
            Sessões de hoje
            <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[--color-navy-light] text-[--color-navy]">
              {SESSOES_HOJE.length}
            </span>
          </h2>
          <a
            href="/agenda"
            className="text-sm font-medium text-[--color-navy] hover:text-[--color-navy-mid] transition-colors flex items-center gap-1"
          >
            Ver agenda completa <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <ul className="divide-y divide-[--color-border-soft]">
          {SESSOES_HOJE.map(s => {
            const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.agendado
            return (
              <li
                key={s.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[--color-surface-2] transition-colors group"
              >
                <div className="stat-icon bg-[--color-navy-light] shrink-0">
                  <Clock className="w-4 h-4 text-[--color-navy]" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[--color-text-primary] truncate group-hover:text-[--color-navy] transition-colors">
                    {s.paciente}
                  </p>
                  <p className="text-xs text-[--color-text-muted] mt-0.5">
                    {s.hora} · {s.duracao} min
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <span className="text-sm font-bold text-[--color-text-primary] tabular-nums w-20 text-right">
                    {fmt(s.valor)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Rodapé com totais */}
        <div className="px-6 py-3 border-t border-[--color-border-soft] bg-[--color-surface-2] flex items-center justify-between">
          <p className="text-xs text-[--color-text-muted]">
            Total do dia:{' '}
            <span className="font-semibold text-[--color-text-secondary]">
              {fmt(SESSOES_HOJE.reduce((a, s) => a + s.valor, 0))}
            </span>
          </p>
          <p className="text-xs text-[--color-text-muted]">
            Realizadas:{' '}
            <span className="font-semibold text-emerald-600">
              {SESSOES_HOJE.filter(s => s.status === 'realizado').length}
            </span>
            {' / '}
            Pendentes:{' '}
            <span className="font-semibold text-[--color-navy]">
              {SESSOES_HOJE.filter(s => s.status === 'agendado').length}
            </span>
          </p>
        </div>
      </div>

    </div>
  )
}
