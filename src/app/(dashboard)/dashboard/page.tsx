'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Sessao, Psicologo } from '@/types/psico'
import { format, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarDays, DollarSign, FileText, Clock,
  Users, UserX, Link2, Copy, Check,
} from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

async function safeJson<T = unknown>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url)
    if (!r.ok) return null
    return (await r.json()) as T
  } catch { return null }
}

const STATUS_BADGE: Record<string, { variant: 'blue' | 'green' | 'red' | 'amber' | 'neutral'; label: string }> = {
  agendado:  { variant: 'blue',    label: 'Agendado'  },
  realizado: { variant: 'green',   label: 'Realizado' },
  cancelado: { variant: 'red',     label: 'Cancelado' },
  faltou:    { variant: 'amber',   label: 'Faltou'    },
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [sessoesHoje, setSessoesHoje]     = useState<Sessao[]>([])
  const [receitaMes, setReceitaMes]       = useState(0)
  const [recibosCount, setRecibosCount]   = useState(0)
  const [pacientesAtivos, setPacientes]   = useState(0)
  const [faltasMes, setFaltasMes]         = useState(0)
  const [psicologo, setPsicologo]         = useState<Psicologo | null>(null)
  const [loading, setLoading]             = useState(true)
  const [erro, setErro]                   = useState<string | null>(null)
  const [copiado, setCopiado]             = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    let cancelled = false

    async function load() {
      setErro(null)
      const now   = new Date()
      const inicio = startOfDay(now).toISOString()
      const fim    = endOfDay(now).toISOString()
      const mes    = format(now, 'yyyy-MM')

      try {
        const [psicRes, sessoesRes, realizadasRes, recibosRes, pacientesRes, faltasRes] =
          await Promise.all([
            safeJson<Psicologo>('/api/psicologos'),
            safeJson<Sessao[]>(`/api/sessoes?inicio=${inicio}&fim=${fim}`),
            safeJson<Sessao[]>(`/api/sessoes?mes=${mes}&status=realizado`),
            safeJson<{ created_at: string }[]>('/api/recibos'),
            safeJson<{ ativo: boolean; data?: unknown[] }>('/api/pacientes'),
            safeJson<Sessao[]>(`/api/sessoes?mes=${mes}&status=faltou`),
          ])

        if (cancelled) return

        if (psicRes && !('error' in psicRes)) setPsicologo(psicRes as Psicologo)

        if (Array.isArray(sessoesRes)) setSessoesHoje(sessoesRes)

        if (Array.isArray(realizadasRes))
          setReceitaMes(realizadasRes.reduce((acc, s) => acc + Number(s.valor), 0))

        if (Array.isArray(recibosRes)) {
          const now2 = new Date()
          const inicioMes = new Date(now2.getFullYear(), now2.getMonth(), 1)
          const fimMes    = new Date(now2.getFullYear(), now2.getMonth() + 1, 0, 23, 59, 59)
          setRecibosCount(recibosRes.filter(r => {
            const d = new Date(r.created_at)
            return d >= inicioMes && d <= fimMes
          }).length)
        }

        // pacientes pode vir como array direto ou { data: [] }
        const pacArr = Array.isArray(pacientesRes)
          ? pacientesRes
          : Array.isArray((pacientesRes as { data?: unknown[] })?.data)
            ? (pacientesRes as { data: { ativo: boolean }[] }).data
            : []
        setPacientes((pacArr as { ativo: boolean }[]).filter(p => p.ativo).length)

        if (Array.isArray(faltasRes)) setFaltasMes(faltasRes.length)
      } catch (err) {
        console.error('[dashboard load]', err)
        if (!cancelled) setErro('Não foi possível carregar os dados. Tente recarregar a página.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [session, status])

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      {/* Erro */}
      {erro && (
        <div className="bg-[--color-danger-bg] border border-red-200 text-[--color-danger] px-4 py-3 rounded-2xl text-sm mb-6">
          {erro}
        </div>
      )}

      {/* Saudação */}
      <div className="mb-8">
        <h1 className="font-display text-2xl text-[--color-text-primary]">
          Bom dia{psicologo?.nome ? `, ${psicologo.nome.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-sm text-[--color-text-muted] mt-1 capitalize">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Sessões hoje"    value={sessoesHoje.length}  icon={CalendarDays} />
        <StatCard
          label="Receita do mês"
          value={fmt(receitaMes)}
          icon={DollarSign}
          iconBg="bg-[--color-success-bg]"
          iconColor="text-[--color-success]"
        />
        <StatCard
          label="Recibos emitidos"
          value={recibosCount}
          icon={FileText}
          iconBg="bg-[--color-amber-bg]"
          iconColor="text-[--color-amber]"
        />
        <StatCard label="Pacientes ativos" value={pacientesAtivos} icon={Users} />
        <StatCard
          label="Faltas no mês"
          value={faltasMes}
          icon={UserX}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
      </div>

      {/* Link de agendamento */}
      {session?.user?.id && (
        <div className="bg-[--color-navy-light] border border-[--color-navy-ring] rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="bg-[--color-navy] rounded-xl p-2.5 shrink-0">
            <Link2 className="w-4 h-4 text-white" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[--color-navy] mb-0.5">
              Seu link de agendamento
            </p>
            <p className="text-xs text-[--color-text-secondary] truncate font-mono">
              {typeof window !== 'undefined' ? window.location.origin : 'https://www.psiplanner.com.br'}
              /agendar/{session.user.id}
            </p>
          </div>
          <button
            onClick={() => {
              const url = `${window.location.origin}/agendar/${session.user.id}`
              navigator.clipboard.writeText(url).then(() => {
                setCopiado(true)
                setTimeout(() => setCopiado(false), 2000)
              })
            }}
            className="btn-primary shrink-0"
          >
            {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiado ? 'Copiado!' : 'Copiar link'}
          </button>
        </div>
      )}

      {/* Sessões de hoje */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--color-border-soft]">
          <h2 className="font-semibold text-[--color-text-primary]">Sessões de hoje</h2>
          <Link
            href="/agenda"
            className="text-sm font-medium text-[--color-navy] hover:text-[--color-navy-mid] transition-colors"
          >
            Ver agenda completa →
          </Link>
        </div>

        {sessoesHoje.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <CalendarDays className="w-10 h-10 text-[--color-text-faint] opacity-40" strokeWidth={1.5} />
            <p className="text-sm text-[--color-text-muted]">Nenhuma sessão agendada para hoje</p>
          </div>
        ) : (
          <ul className="divide-y divide-[--color-border-soft]">
            {sessoesHoje.map(s => {
              const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.agendado
              return (
                <li key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[--color-surface-2] transition-colors">
                  <div className="stat-icon bg-[--color-navy-light] shrink-0">
                    <Clock className="w-4 h-4 text-[--color-navy]" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[--color-text-primary] truncate">
                      {s.paciente?.nome ?? 'Paciente'}
                    </p>
                    <p className="text-xs text-[--color-text-muted] mt-0.5">
                      {format(new Date(s.data_hora), 'HH:mm')} · {s.duracao_min} min
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <span className="text-sm font-semibold text-[--color-text-primary] tabular-nums">
                      {fmt(Number(s.valor))}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
