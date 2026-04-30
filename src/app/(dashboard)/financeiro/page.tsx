'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Sessao } from '@/types/psico'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DollarSign, TrendingUp, CalendarCheck, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Spinner } from '@/components/ui/spinner'

export default function FinanceiroPage() {
  const { data: session } = useSession()
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth())
  const [ano, setAno] = useState(now.getFullYear())
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const mesStr = `${ano}-${String(mes + 1).padStart(2, '0')}`
    fetch(`/api/sessoes?mes=${mesStr}&status=realizado`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (cancelled) return
        setSessoes(Array.isArray(data) ? (data as Sessao[]) : [])
      })
      .catch(() => { if (!cancelled) setSessoes([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [mes, ano, session])

  function mudarMes(delta: number) {
    let novoMes = mes + delta
    let novoAno = ano
    if (novoMes < 0) { novoMes = 11; novoAno-- }
    if (novoMes > 11) { novoMes = 0; novoAno++ }
    setMes(novoMes)
    setAno(novoAno)
  }

  const receita = sessoes.reduce((acc, s) => acc + Number(s.valor), 0)
  const ticketMedio = sessoes.length > 0 ? receita / sessoes.length : 0
  const nomeMes = format(new Date(ano, mes, 1), 'MMMM yyyy', { locale: ptBR })

  function exportarCSV() {
    const cabecalho = 'Data,Nome do Paciente,CPF do Paciente,Valor,Descrição'
    const linhas = sessoes.map(s => {
      const data = format(parseISO(s.data_hora), 'dd/MM/yyyy')
      const nome = `"${s.paciente?.nome ?? ''}"`
      const cpf = s.paciente?.cpf ?? ''
      const valor = Number(s.valor).toFixed(2).replace('.', ',')
      return [data, nome, cpf, valor, 'Consulta'].join(',')
    })
    const csv = [cabecalho, ...linhas].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `carne-leao-${String(mes + 1).padStart(2, '0')}-${ano}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div>
      <PageHeader title="Financeiro" subtitle={`Competência: ${nomeMes}`} icon={DollarSign}>
        {/* Navegação de mês */}
        <div className="flex items-center gap-1 bg-white border border-[--color-border] rounded-xl px-1 py-1">
          <button
            onClick={() => mudarMes(-1)}
            className="p-1.5 rounded-lg text-[--color-text-muted] hover:bg-[--color-surface-2] hover:text-[--color-text-primary] transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-[--color-text-primary] capitalize min-w-32 text-center px-1">
            {nomeMes}
          </span>
          <button
            onClick={() => mudarMes(1)}
            className="p-1.5 rounded-lg text-[--color-text-muted] hover:bg-[--color-surface-2] hover:text-[--color-text-primary] transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Exportar */}
        <button
          onClick={exportarCSV}
          disabled={sessoes.length === 0}
          className="btn-primary"
        >
          <Download className="w-4 h-4" />
          Exportar Carnê-Leão
        </button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Receita total"
          value={fmt(receita)}
          icon={DollarSign}
          iconBg="bg-[--color-success-bg]"
          iconColor="text-[--color-success]"
        />
        <StatCard
          label="Sessões realizadas"
          value={sessoes.length}
          icon={CalendarCheck}
          iconBg="bg-[--color-info-bg]"
          iconColor="text-[--color-info]"
        />
        <StatCard
          label="Ticket médio"
          value={fmt(ticketMedio)}
          icon={TrendingUp}
          iconBg="bg-[--color-navy-light]"
          iconColor="text-[--color-navy]"
        />
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--color-border-soft]">
          <h2 className="font-semibold text-[--color-text-primary] capitalize">
            Sessões realizadas — {nomeMes}
          </h2>
          <span className="text-xs text-[--color-text-muted]">
            {sessoes.length} sessão{sessoes.length !== 1 ? 'ões' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-36">
            <Spinner />
          </div>
        ) : sessoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <CalendarCheck className="w-10 h-10 text-[--color-text-faint] opacity-40" strokeWidth={1.5} />
            <p className="text-sm text-[--color-text-muted]">Nenhuma sessão realizada neste mês</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Paciente</th>
                  <th className="hidden sm:table-cell">CPF</th>
                  <th className="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {sessoes.map(s => (
                  <tr key={s.id}>
                    <td className="whitespace-nowrap">
                      {format(parseISO(s.data_hora), "dd/MM/yyyy 'às' HH:mm")}
                    </td>
                    <td className="font-medium text-[--color-text-primary]">
                      {s.paciente?.nome}
                    </td>
                    <td className="hidden sm:table-cell text-[--color-text-muted]">
                      {s.paciente?.cpf || '—'}
                    </td>
                    <td className="text-right font-semibold text-[--color-text-primary]">
                      {fmt(Number(s.valor))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-3 text-sm font-semibold text-[--color-text-secondary] border-t-2 border-[--color-border] bg-[--color-surface-2]"
                  >
                    Total do mês
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-base text-[--color-success] border-t-2 border-[--color-border] bg-[--color-surface-2]">
                    {fmt(receita)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
