'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Sessao, Psicologo } from '@/types/psico'
import { format, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays, DollarSign, FileText, Clock, Users, UserX, Link2, Copy, Check } from 'lucide-react'
import Link from 'next/link'

async function safeJson<T = unknown>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url)
    if (!r.ok) {
      console.warn(`[fetch ${url}] status ${r.status}`)
      return null
    }
    return (await r.json()) as T
  } catch (err) {
    console.error(`[fetch ${url}] network error`, err)
    return null
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [sessoesHoje, setSessoesHoje] = useState<Sessao[]>([])
  const [receitaMes, setReceitaMes] = useState(0)
  const [recibosCount, setRecibosCount] = useState(0)
  const [pacientesAtivos, setPacientesAtivos] = useState(0)
  const [faltasMes, setFaltasMes] = useState(0)
  const [psicologo, setPsicologo] = useState<Psicologo | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    // Espera a sessão carregar antes de buscar dados protegidos
    if (status === 'loading') return

    let cancelled = false

    async function load() {
      setErro(null)
      const now = new Date()
      const inicio = startOfDay(now).toISOString()
      const fim = endOfDay(now).toISOString()
      const mes = format(now, 'yyyy-MM')

      try {
        const [psicRes, sessoesRes, sessoesRealizadasRes, recibosRes, pacientesRes, faltasRes] = await Promise.all([
          safeJson<Psicologo | { error: string } | null>('/api/psicologos'),
          safeJson<Sessao[] | { error: string }>(`/api/sessoes?inicio=${inicio}&fim=${fim}`),
          safeJson<Sessao[] | { error: string }>(`/api/sessoes?mes=${mes}&status=realizado`),
          safeJson<{ created_at: string }[] | { error: string }>('/api/recibos'),
          safeJson<{ ativo: boolean }[] | { error: string }>('/api/pacientes'),
          safeJson<Sessao[] | { error: string }>(`/api/sessoes?mes=${mes}&status=faltou`),
        ])

        if (cancelled) return

        if (psicRes && typeof psicRes === 'object' && !('error' in psicRes)) {
          setPsicologo(psicRes as Psicologo)
        }
        if (Array.isArray(sessoesRes)) setSessoesHoje(sessoesRes as Sessao[])
        if (Array.isArray(sessoesRealizadasRes)) {
          const total = (sessoesRealizadasRes as Sessao[]).reduce((acc, s) => acc + Number(s.valor), 0)
          setReceitaMes(total)
        }
        if (Array.isArray(recibosRes)) {
          const now2 = new Date()
          const inicioMes = new Date(now2.getFullYear(), now2.getMonth(), 1)
          const fimMes = new Date(now2.getFullYear(), now2.getMonth() + 1, 0, 23, 59, 59)
          const count = (recibosRes as { created_at: string }[]).filter((r) => {
            const d = new Date(r.created_at)
            return d >= inicioMes && d <= fimMes
          }).length
          setRecibosCount(count)
        }
        if (Array.isArray(pacientesRes)) {
          setPacientesAtivos((pacientesRes as { ativo: boolean }[]).filter((p) => p.ativo).length)
        }
        if (Array.isArray(faltasRes)) setFaltasMes((faltasRes as Sessao[]).length)
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

  const statusColor: Record<string, string> = {
    agendado: 'bg-[#E8F4FF] text-[#2563EB]',
    realizado: 'bg-[#EBF5EF] text-[#2D6A52]',
    cancelado: 'bg-red-50 text-red-600',
  }

  const statusLabel: Record<string, string> = {
    agendado: 'Agendado',
    realizado: 'Realizado',
    cancelado: 'Cancelado',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E8E3DB] border-t-[#5A9E7C]" />
      </div>
    )
  }

  return (
    <div>
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
          {erro}
        </div>
      )}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold text-[#1C2B22]"
          style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}
        >
          Bom dia{psicologo?.nome ? `, ${psicologo.nome.split(' ')[0]}` : ''}
        </h1>
        <p className="text-[#7A8C82] mt-1 text-sm">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-5 flex items-center gap-4 shadow-sm">
          <div className="bg-[#EBF5EF] rounded-xl p-3">
            <CalendarDays className="w-5 h-5 text-[#2D6A52]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs text-[#7A8C82] font-medium uppercase tracking-wide">Sessões hoje</p>
            <p className="text-2xl font-bold text-[#1C2B22] mt-0.5">{sessoesHoje.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-5 flex items-center gap-4 shadow-sm">
          <div className="bg-[#F0F9F4] rounded-xl p-3">
            <DollarSign className="w-5 h-5 text-[#5A9E7C]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs text-[#7A8C82] font-medium uppercase tracking-wide">Receita do mês</p>
            <p className="text-2xl font-bold text-[#1C2B22] mt-0.5">
              {receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-5 flex items-center gap-4 shadow-sm">
          <div className="bg-[#F5F0EB] rounded-xl p-3">
            <FileText className="w-5 h-5 text-[#C4956A]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs text-[#7A8C82] font-medium uppercase tracking-wide">Recibos emitidos</p>
            <p className="text-2xl font-bold text-[#1C2B22] mt-0.5">{recibosCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-5 flex items-center gap-4 shadow-sm">
          <div className="bg-[#EBF5EF] rounded-xl p-3">
            <Users className="w-5 h-5 text-[#2D6A52]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs text-[#7A8C82] font-medium uppercase tracking-wide">Pacientes ativos</p>
            <p className="text-2xl font-bold text-[#1C2B22] mt-0.5">{pacientesAtivos}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E3DB] p-5 flex items-center gap-4 shadow-sm">
          <div className="bg-orange-50 rounded-xl p-3">
            <UserX className="w-5 h-5 text-orange-500" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs text-[#7A8C82] font-medium uppercase tracking-wide">Faltas no mês</p>
            <p className="text-2xl font-bold text-[#1C2B22] mt-0.5">{faltasMes}</p>
          </div>
        </div>
      </div>

      {/* Link de agendamento */}
      {session?.user?.id && (
        <div className="bg-[#EBF5EF] border border-[#C8E6D4] rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="bg-[#1B3A2F] rounded-xl p-2.5 shrink-0">
            <Link2 className="w-4 h-4 text-white" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1B3A2F]">Seu link de agendamento</p>
            <p className="text-xs text-[#3D5247] truncate mt-0.5">
              {typeof window !== 'undefined' ? window.location.origin : 'https://www.psiplanner.com.br'}/agendar/{session.user.id}
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
            className="flex items-center gap-1.5 bg-[#1B3A2F] text-white text-xs font-medium px-3 py-2 rounded-xl hover:bg-[#244D3F] transition-colors shrink-0"
          >
            {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiado ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      )}

      {/* Sessões de hoje */}
      <div className="bg-white rounded-2xl border border-[#E8E3DB] shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EDE7]">
          <h2 className="font-semibold text-[#1C2B22]">Sessões de hoje</h2>
          <Link href="/agenda" className="text-sm text-[#2D6A52] font-medium hover:underline">
            Ver agenda completa →
          </Link>
        </div>
        {sessoesHoje.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-[#A8BFB2]">
            <CalendarDays className="w-10 h-10 mb-3 opacity-40" strokeWidth={1.5} />
            <p className="text-sm">Nenhuma sessão agendada para hoje</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F0EDE7]">
            {sessoesHoje.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-6 py-4">
                <div className="bg-[#EBF5EF] rounded-xl p-2">
                  <Clock className="w-4 h-4 text-[#2D6A52]" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1C2B22] truncate">
                    {s.paciente?.nome ?? 'Paciente'}
                  </p>
                  <p className="text-sm text-[#7A8C82]">
                    {format(new Date(s.data_hora), 'HH:mm')} · {s.duracao_min} min
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[s.status]}`}>
                    {statusLabel[s.status]}
                  </span>
                  <span className="text-sm font-semibold text-[#1C2B22]">
                    {Number(s.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
