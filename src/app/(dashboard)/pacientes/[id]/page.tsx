'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sessao, Paciente } from '@/types/psico'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft, BookOpen, CalendarDays, FileEdit, Loader2, Save, X,
  CheckCircle2, XCircle, UserX, Clock
} from 'lucide-react'
import GravadorConsulta from '@/components/GravadorConsulta'

const STATUS_BADGE: Record<string, string> = {
  realizado: 'bg-[#eff6ff] text-[#2563eb]',
  agendado: 'bg-blue-50 text-blue-700',
  cancelado: 'bg-red-50 text-red-700',
  faltou: 'bg-orange-50 text-orange-700',
}
const STATUS_LABEL: Record<string, string> = {
  realizado: 'Realizado',
  agendado: 'Agendado',
  cancelado: 'Cancelado',
  faltou: 'Faltou',
}
const STATUS_ICON: Record<string, React.ReactNode> = {
  realizado: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />,
  agendado: <CalendarDays className="w-3.5 h-3.5" strokeWidth={2} />,
  cancelado: <XCircle className="w-3.5 h-3.5" strokeWidth={2} />,
  faltou: <UserX className="w-3.5 h-3.5" strokeWidth={2} />,
}

export default function HistoricoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [loading, setLoading] = useState(true)

  const [editando, setEditando] = useState<Sessao | null>(null)
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)
  const [transcricao, setTranscricao] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [resPac, resSes] = await Promise.all([
        fetch(`/api/pacientes/${id}`),
        fetch(`/api/sessoes?paciente_id=${id}`),
      ])
      const pac = resPac.ok ? await resPac.json() : null
      const ses = resSes.ok ? await resSes.json() : []

      if (pac && typeof pac === 'object' && !('error' in pac)) setPaciente(pac)
      if (Array.isArray(ses)) {
        setSessoes((ses as Sessao[]).sort((a, b) => b.data_hora.localeCompare(a.data_hora)))
      } else {
        setSessoes([])
      }
    } catch (err) {
      console.error('[paciente load]', err)
      setSessoes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  function abrirEdicao(sessao: Sessao) {
    setEditando(sessao)
    setNotas(sessao.notas_clinicas ?? '')
    setTranscricao('')
  }

  function handleTranscrito(soap: string, transcricaoRaw: string) {
    setNotas(soap)
    setTranscricao(transcricaoRaw)
  }

  async function salvar() {
    if (!editando) return
    setSaving(true)
    await fetch(`/api/sessoes/${editando.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas_clinicas: notas }),
    })
    setSaving(false)
    setEditando(null)
    load()
  }

  const realizadas = sessoes.filter(s => s.status === 'realizado')
  const comNotas = realizadas.filter(s => s.notas_clinicas)

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[#eff6ff] rounded-xl text-[#64748b] hover:text-[#2563eb] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
        </button>
        <div className="bg-[#eff6ff] rounded-xl p-2.5">
          <BookOpen className="w-5 h-5 text-[#2563eb]" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#0f172a]" style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}>
            Histórico Clínico
          </h1>
          {paciente && (
            <p className="text-sm text-[#64748b]">{paciente.nome}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#e2e8f0] border-t-[#3b82f6]" />
        </div>
      ) : (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 text-center">
              <p className="text-2xl font-bold text-[#0f172a]">{sessoes.length}</p>
              <p className="text-xs text-[#64748b] mt-0.5">Total de sessões</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 text-center">
              <p className="text-2xl font-bold text-[#2563eb]">{realizadas.length}</p>
              <p className="text-xs text-[#64748b] mt-0.5">Realizadas</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 text-center">
              <p className="text-2xl font-bold text-[#3b82f6]">{comNotas.length}</p>
              <p className="text-xs text-[#64748b] mt-0.5">Com anotações</p>
            </div>
          </div>

          {/* Timeline de sessões */}
          {sessoes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] flex flex-col items-center justify-center py-16 text-[#94a3b8]">
              <CalendarDays className="w-10 h-10 mb-3 opacity-40" strokeWidth={1.5} />
              <p className="text-sm">Nenhuma sessão registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessoes.map((sessao) => (
                <div
                  key={sessao.id}
                  className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden"
                >
                  {/* Cabeçalho da sessão */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EDE7]">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#F5F0EB] rounded-lg p-2">
                        <Clock className="w-4 h-4 text-[#64748b]" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="font-medium text-[#0f172a] text-sm">
                          {format(parseISO(sessao.data_hora), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-[#64748b]">
                          {format(parseISO(sessao.data_hora), 'HH:mm', { locale: ptBR })} · {sessao.duracao_min} min ·{' '}
                          {Number(sessao.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[sessao.status]}`}>
                        {STATUS_ICON[sessao.status]}
                        {STATUS_LABEL[sessao.status]}
                      </span>
                      {sessao.status === 'realizado' && (
                        <button
                          onClick={() => abrirEdicao(sessao)}
                          className="p-1.5 hover:bg-[#eff6ff] rounded-lg text-[#64748b] hover:text-[#2563eb] transition-colors"
                          title={sessao.notas_clinicas ? 'Editar nota' : 'Adicionar nota'}
                        >
                          <FileEdit className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo: notas ou placeholder */}
                  <div className="px-5 py-4">
                    {sessao.notas_clinicas ? (
                      <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">{sessao.notas_clinicas}</p>
                    ) : sessao.status === 'realizado' ? (
                      <button
                        onClick={() => abrirEdicao(sessao)}
                        className="text-sm text-[#94a3b8] hover:text-[#3b82f6] italic transition-colors"
                      >
                        Clique para adicionar notas clínicas desta sessão...
                      </button>
                    ) : (
                      <p className="text-sm text-[#C0B8B0] italic">
                        {sessao.status === 'agendado' ? 'Sessão ainda não realizada' :
                         sessao.status === 'cancelado' ? 'Sessão cancelada' : 'Paciente não compareceu'}
                      </p>
                    )}

                    {sessao.observacoes && (
                      <div className="mt-3 pt-3 border-t border-[#F0EDE7]">
                        <p className="text-xs text-[#64748b] mb-1">Observações gerais</p>
                        <p className="text-sm text-[#64748b]">{sessao.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de edição de notas */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EDE7]">
              <div>
                <h2 className="font-semibold text-[#0f172a]">Notas Clínicas</h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  {format(parseISO(editando.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <button onClick={() => setEditando(null)} className="text-[#94a3b8] hover:text-[#3b82f6] transition-colors">
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Gravador de áudio */}
              <GravadorConsulta
                sessaoId={editando.id}
                onTranscrito={handleTranscrito}
              />

              {/* Textarea do prontuário */}
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                rows={8}
                autoFocus
                placeholder="Registre a evolução clínica, técnicas utilizadas, observações da sessão, plano terapêutico..."
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none resize-none leading-relaxed"
              />

              {/* Transcrição bruta colapsável */}
              {transcricao && (
                <details className="group">
                  <summary className="cursor-pointer text-xs text-[#64748b] hover:text-[#2563eb] select-none list-none flex items-center gap-1.5">
                    <span className="transition-transform group-open:rotate-90 inline-block">›</span>
                    Ver transcrição original
                  </summary>
                  <div className="mt-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 max-h-40 overflow-y-auto">
                    <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-wrap">{transcricao}</p>
                  </div>
                </details>
              )}

              <p className="text-xs text-[#94a3b8]">Confidencial — visível apenas para você.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditando(null)}
                  className="px-4 py-2.5 text-sm text-[#64748b] hover:bg-[#F5F0EB] rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvar}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={2} />}
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
