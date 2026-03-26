'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Sessao, Psicologo } from '@/types/psico'
import { format, isToday, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays, DollarSign, FileText, Clock, User } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [sessoesHoje, setSessoesHoje] = useState<Sessao[]>([])
  const [receitaMes, setReceitaMes] = useState(0)
  const [recibosCount, setRecibosCount] = useState(0)
  const [psicologo, setPsicologo] = useState<Psicologo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

      const [psicRes, sessoesHojeRes, receitaRes, recibosRes] = await Promise.all([
        supabase.from('psicologos').select('*').eq('id', user.id).single(),
        supabase
          .from('sessoes')
          .select('*, paciente:pacientes(*)')
          .eq('psicologo_id', user.id)
          .gte('data_hora', startOfDay(now).toISOString())
          .lte('data_hora', endOfDay(now).toISOString())
          .order('data_hora'),
        supabase
          .from('sessoes')
          .select('valor')
          .eq('psicologo_id', user.id)
          .eq('status', 'realizado')
          .gte('data_hora', inicioMes)
          .lte('data_hora', fimMes),
        supabase
          .from('recibos')
          .select('id', { count: 'exact', head: true })
          .eq('psicologo_id', user.id)
          .gte('created_at', inicioMes)
          .lte('created_at', fimMes),
      ])

      if (psicRes.data) setPsicologo(psicRes.data)
      if (sessoesHojeRes.data) setSessoesHoje(sessoesHojeRes.data as Sessao[])
      if (receitaRes.data) {
        const total = receitaRes.data.reduce((acc, s) => acc + Number(s.valor), 0)
        setReceitaMes(total)
      }
      if (recibosRes.count !== null) setRecibosCount(recibosRes.count)

      setLoading(false)
    }
    load()
  }, [])

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
      </div>

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
