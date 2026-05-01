'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Sessao } from '@/types/psico'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  DollarSign, CalendarCheck, Download, ChevronLeft, ChevronRight,
  Banknote, CircleCheck, AlertTriangle, Clock, Gift, TrendingUp,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

/* ── helpers ──────────────────────────────────────────────────────────────── */
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function fmtDt(iso: string) {
  try { return format(parseISO(iso), "dd/MM/yy 'às' HH:mm") } catch { return iso }
}

/* ── tipos internos ──────────────────────────────────────────────────────── */
type Grupo = 'agendado' | 'realizado' | 'pendente' | 'decisao'

function grupoLabel(g: Grupo) {
  return {
    agendado: 'A Receber',
    realizado: 'Recebido',
    pendente:  'Realizado — Aguardando Pagamento',
    decisao:   'Cancelamentos / Faltas — Decisão Pendente',
  }[g]
}

function classificar(s: Sessao): Grupo | null {
  if (s.status === 'agendado') return 'agendado'
  if (s.status === 'realizado') {
    const pg = s.pagamento_status ?? 'pendente'
    if (pg === 'isento') return null          // isentas: fora do financeiro
    if (pg === 'pago')   return 'realizado'
    return 'pendente'                         // realizado mas ainda não pago
  }
  if (s.status === 'cancelado' || s.status === 'faltou') {
    const pg = s.pagamento_status ?? 'pendente'
    if (pg === 'isento') return null          // profissional isentou
    return 'decisao'                          // aguardando decisão
  }
  return null
}

/* ── componente ───────────────────────────────────────────────────────────── */
export default function FinanceiroPage() {
  const { data: session } = useSession()
  const now = new Date()
  const [mes, setMes]           = useState(now.getMonth())
  const [ano, setAno]           = useState(now.getFullYear())
  const [sessoes, setSessoes]   = useState<Sessao[]>([])
  const [loading, setLoading]   = useState(true)
  const [atualizando, setAtualizando] = useState<string | null>(null)

  const nomeMes = format(new Date(ano, mes, 1), 'MMMM yyyy', { locale: ptBR })

  /* Busca todas as sessões do mês (todos os status) */
  const carregar = useCallback(async () => {
    setLoading(true)
    const mesStr = `${ano}-${String(mes + 1).padStart(2, '0')}`
    try {
      const r = await fetch(`/api/sessoes?mes=${mesStr}`)
      const data = r.ok ? await r.json() : []
      setSessoes(Array.isArray(data) ? (data as Sessao[]) : [])
    } catch { setSessoes([]) }
    finally { setLoading(false) }
  }, [mes, ano, session])

  useEffect(() => { carregar() }, [carregar])

  function mudarMes(delta: number) {
    let nm = mes + delta, ny = ano
    if (nm < 0)  { nm = 11; ny-- }
    if (nm > 11) { nm = 0;  ny++ }
    setMes(nm); setAno(ny)
  }

  /* Altera pagamento_status de uma sessão */
  async function alterarPagamento(s: Sessao, novoStatus: Sessao['pagamento_status']) {
    setSessoes(prev => prev.map(x => x.id === s.id ? { ...x, pagamento_status: novoStatus } : x))
    setAtualizando(s.id)
    try {
      await fetch(`/api/sessoes/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagamento_status: novoStatus }),
      })
    } catch {
      setSessoes(prev => prev.map(x => x.id === s.id ? { ...x, pagamento_status: s.pagamento_status } : x))
    } finally { setAtualizando(null) }
  }

  /* Altera status da sessão (ex: cancelado → realizado para corrigir) */
  async function alterarStatus(s: Sessao, novoStatus: Sessao['status']) {
    setSessoes(prev => prev.map(x => x.id === s.id ? { ...x, status: novoStatus } : x))
    setAtualizando(s.id)
    try {
      await fetch(`/api/sessoes/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })
    } catch {
      setSessoes(prev => prev.map(x => x.id === s.id ? { ...x, status: s.status } : x))
    } finally { setAtualizando(null) }
  }

  /* Agrupa sessões */
  const grupos: Record<Grupo, Sessao[]> = { agendado: [], realizado: [], pendente: [], decisao: [] }
  for (const s of sessoes) {
    const g = classificar(s)
    if (g) grupos[g].push(s)
  }

  /* KPIs */
  const totalAReceber  = grupos.agendado.reduce((a, s) => a + Number(s.valor), 0)
  const totalRecebido  = grupos.realizado.reduce((a, s) => a + Number(s.valor), 0)
  const totalPendente  = grupos.pendente.reduce((a, s) => a + Number(s.valor), 0)
  const totalDecisao   = grupos.decisao.reduce((a, s) => a + Number(s.valor), 0)
  const ticketMedio    = grupos.realizado.length > 0
    ? totalRecebido / grupos.realizado.length : 0

  /* Export CSV */
  function exportarCSV() {
    const cab  = 'Data,Paciente,CPF,Status,Pagamento,Valor'
    const rows = sessoes.map(s => [
      fmtDt(s.data_hora),
      `"${s.paciente?.nome ?? ''}"`,
      s.paciente?.cpf ?? '',
      s.status,
      s.pagamento_status ?? 'pendente',
      Number(s.valor).toFixed(2).replace('.', ','),
    ].join(','))
    const csv  = [cab, ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `financeiro-${String(mes + 1).padStart(2, '0')}-${ano}.csv` })
    a.click(); URL.revokeObjectURL(url)
  }

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div>
      <PageHeader title="Financeiro" subtitle={`Competência: ${nomeMes}`} icon={DollarSign}>
        <div className="flex items-center gap-1 bg-white border border-[--color-border] rounded-xl px-1 py-1">
          <button onClick={() => mudarMes(-1)} className="p-1.5 rounded-lg text-[--color-text-muted] hover:bg-[--color-surface-2] transition-colors" aria-label="Mês anterior">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-[--color-text-primary] capitalize min-w-32 text-center px-1">{nomeMes}</span>
          <button onClick={() => mudarMes(1)} className="p-1.5 rounded-lg text-[--color-text-muted] hover:bg-[--color-surface-2] transition-colors" aria-label="Próximo mês">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button onClick={exportarCSV} disabled={sessoes.length === 0} className="btn-primary">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </PageHeader>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="A Receber" value={fmt(totalAReceber)} icon={Clock}
          iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard label="Recebido" value={fmt(totalRecebido)} icon={CircleCheck}
          iconBg="bg-[--color-success-bg]" iconColor="text-[--color-success]" />
        <StatCard label="Aguardando pagto." value={fmt(totalPendente)} icon={Banknote}
          iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard label="Ticket médio" value={fmt(ticketMedio)} icon={TrendingUp}
          iconBg="bg-[--color-navy-light]" iconColor="text-[--color-navy]" />
      </div>

      {/* ── Barra de progresso ── */}
      {sessoes.filter(s => classificar(s) !== null).length > 0 && (() => {
        const total = totalRecebido + totalPendente + totalAReceber || 1
        return (
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[--color-text-primary]">Visão geral do mês</p>
              <p className="text-xs text-[--color-text-muted]">{grupos.realizado.length + grupos.pendente.length} sessão(ões) realizada(s)</p>
            </div>
            <div className="h-2.5 w-full bg-[--color-surface-2] rounded-full overflow-hidden flex">
              <div className="h-full bg-[--color-success] transition-all" style={{ width: `${(totalRecebido / total) * 100}%` }} />
              <div className="h-full bg-amber-400 transition-all"        style={{ width: `${(totalPendente / total) * 100}%` }} />
              <div className="h-full bg-blue-400 transition-all"         style={{ width: `${(totalAReceber / total) * 100}%` }} />
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[--color-text-muted]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[--color-success] inline-block" /> Recebido — {fmt(totalRecebido)}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Aguardando — {fmt(totalPendente)}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> A receber — {fmt(totalAReceber)}</span>
            </div>
          </div>
        )
      })()}

      {loading ? (
        <div className="flex items-center justify-center h-36"><Spinner /></div>
      ) : (
        <div className="space-y-6">

          {/* ── A RECEBER (agendadas) ── */}
          <SecaoFinanceira
            titulo="📅 A Receber — Sessões Agendadas"
            subtitulo="Sessões futuras confirmadas. O valor será movido para 'Recebido' quando a consulta for realizada."
            cor="blue"
            total={totalAReceber}
            sessoes={grupos.agendado}
            atualizando={atualizando}
            renderAcoes={() => null}
          />

          {/* ── RECEBIDO (realizadas + pagas) ── */}
          <SecaoFinanceira
            titulo="✅ Recebido"
            subtitulo="Sessões realizadas com pagamento confirmado."
            cor="green"
            total={totalRecebido}
            sessoes={grupos.realizado}
            atualizando={atualizando}
            renderAcoes={(s) => (
              <button
                onClick={() => alterarPagamento(s, 'pendente')}
                disabled={!!atualizando}
                className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-40"
              >
                Marcar pendente
              </button>
            )}
          />

          {/* ── REALIZADO mas aguardando pagamento ── */}
          <SecaoFinanceira
            titulo="⏳ Realizado — Aguardando Pagamento"
            subtitulo="Sessões já realizadas, mas o pagamento ainda não foi confirmado."
            cor="amber"
            total={totalPendente}
            sessoes={grupos.pendente}
            atualizando={atualizando}
            renderAcoes={(s) => (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => alterarPagamento(s, 'pago')}
                  disabled={!!atualizando}
                  className="text-xs px-2.5 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-40 font-medium"
                >
                  ✓ Confirmar recebimento
                </button>
                <button
                  onClick={() => alterarPagamento(s, 'isento')}
                  disabled={!!atualizando}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-40"
                >
                  Isentar
                </button>
              </div>
            )}
          />

          {/* ── CANCELADOS / FALTAS — DECISÃO ── */}
          {grupos.decisao.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-[--color-border-soft] bg-orange-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-orange-800 text-sm">
                      ⚖️ Cancelamentos / Faltas — Decisão Pendente
                    </p>
                    <p className="text-xs text-orange-600 mt-0.5">
                      Sessões canceladas ou em que o paciente faltou. Decida se vai cobrar ou isentar — cada escolha reflete imediatamente no financeiro.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full shrink-0">
                    {fmt(totalDecisao)} em aberto
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Paciente</th>
                      <th>Ocorrência</th>
                      <th className="text-right">Valor</th>
                      <th>Decisão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupos.decisao.map(s => {
                      const busy = atualizando === s.id
                      const jaCobrado = s.pagamento_status === 'pago'
                      return (
                        <tr key={s.id}>
                          <td className="whitespace-nowrap text-xs">{fmtDt(s.data_hora)}</td>
                          <td className="font-medium text-[--color-text-primary]">{s.paciente?.nome}</td>
                          <td>
                            <Badge variant={s.status === 'cancelado' ? 'neutral' : 'amber'}>
                              {s.status === 'cancelado' ? 'Cancelado' : 'Faltou'}
                            </Badge>
                          </td>
                          <td className="text-right font-semibold">{fmt(Number(s.valor))}</td>
                          <td>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => alterarPagamento(s, jaCobrado ? 'pendente' : 'pago')}
                                disabled={busy || !!atualizando}
                                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 ${
                                  jaCobrado
                                    ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                                    : 'bg-[--color-navy] text-white hover:bg-[--color-navy-mid]'
                                }`}
                              >
                                {busy ? '…' : jaCobrado ? '✓ Cobrança ativa' : '💳 Cobrar'}
                              </button>
                              <button
                                onClick={() => alterarPagamento(s, 'isento')}
                                disabled={busy || !!atualizando}
                                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-40"
                              >
                                <Gift className="w-3 h-3 inline mr-1" />
                                Isentar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="px-5 py-3 text-xs font-semibold text-orange-700 border-t-2 border-orange-200 bg-orange-50">
                        Total em aberto
                      </td>
                      <td colSpan={2} className="px-5 py-3 text-right font-bold text-orange-700 border-t-2 border-orange-200 bg-orange-50">
                        {fmt(totalDecisao)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {sessoes.length === 0 && (
            <div className="card flex flex-col items-center justify-center py-16 gap-2">
              <CalendarCheck className="w-10 h-10 text-[--color-text-faint] opacity-30" strokeWidth={1.5} />
              <p className="text-sm text-[--color-text-muted]">Nenhuma sessão registrada neste mês</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Sub-componente de seção ──────────────────────────────────────────────── */
type CorTema = 'blue' | 'green' | 'amber'

const COR: Record<CorTema, { header: string; total: string; border: string }> = {
  blue:  { header: 'bg-blue-50  border-blue-100',  total: 'text-blue-700  bg-blue-50  border-blue-200',  border: 'border-blue-200'  },
  green: { header: 'bg-green-50 border-green-100', total: 'text-green-700 bg-green-50 border-green-200', border: 'border-green-200' },
  amber: { header: 'bg-amber-50 border-amber-100', total: 'text-amber-700 bg-amber-50 border-amber-200', border: 'border-amber-200' },
}

function SecaoFinanceira({
  titulo, subtitulo, cor, total, sessoes, atualizando, renderAcoes,
}: {
  titulo: string
  subtitulo: string
  cor: CorTema
  total: number
  sessoes: Sessao[]
  atualizando: string | null
  renderAcoes: (s: Sessao) => React.ReactNode
}) {
  if (sessoes.length === 0) return null
  const tema = COR[cor]

  return (
    <div className="card overflow-hidden">
      <div className={`px-6 py-4 border-b ${tema.header} flex items-center justify-between flex-wrap gap-2`}>
        <div>
          <p className="font-semibold text-[--color-text-primary] text-sm">{titulo}</p>
          <p className="text-xs text-[--color-text-muted] mt-0.5">{subtitulo}</p>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full border ${tema.total}`}>
          {fmt(total)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Data</th>
              <th>Paciente</th>
              <th className="hidden sm:table-cell">CPF</th>
              <th className="text-right">Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sessoes.map(s => (
              <tr key={s.id}>
                <td className="whitespace-nowrap text-xs">{fmtDt(s.data_hora)}</td>
                <td className="font-medium text-[--color-text-primary]">{s.paciente?.nome}</td>
                <td className="hidden sm:table-cell text-[--color-text-muted]">{s.paciente?.cpf || '—'}</td>
                <td className="text-right font-semibold">{fmt(Number(s.valor))}</td>
                <td>
                  <div className={atualizando === s.id ? 'opacity-50 pointer-events-none' : ''}>
                    {renderAcoes(s)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className={`px-5 py-3 text-xs font-semibold border-t-2 ${tema.total} ${tema.border}`}>
                Subtotal — {sessoes.length} sessão(ões)
              </td>
              <td className={`px-5 py-3 text-right font-bold border-t-2 ${tema.total} ${tema.border}`}>
                {fmt(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
