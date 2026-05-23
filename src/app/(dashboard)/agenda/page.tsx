'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Sessao, Paciente } from '@/types/psico'
import {
  format, addDays, startOfWeek, isSameDay, parseISO, setHours, setMinutes
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react'
import { ModalNovaSessao } from './_components/ModalNovaSessao'
import { ModalDetalheSessao } from './_components/ModalDetalheSessao'
import { ModalNotas } from './_components/ModalNotas'

const HORAS = Array.from({ length: 16 }, (_, i) => i + 7)
const STATUS_COLORS: Record<string, string> = {
  agendado:  'bg-blue-100 border-blue-400 text-blue-800',
  realizado: 'bg-green-100 border-green-400 text-green-800',
  cancelado: 'bg-red-100 border-red-400 text-red-700 line-through opacity-60',
  faltou:    'bg-orange-100 border-orange-400 text-orange-700 opacity-70',
}

const EMPTY_FORM = {
  paciente_id: '',
  data: format(new Date(), 'yyyy-MM-dd'),
  hora: '09:00',
  duracao_min: 50,
  valor: 150,
  observacoes: '',
  status: 'agendado' as const,
}

export default function AgendaPage() {
  const { data: session } = useSession()
  const [semanaInicio, setSemanaInicio] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [modalNova, setModalNova] = useState(false)
  const [modalDetalhe, setModalDetalhe] = useState<Sessao | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [modalNotas, setModalNotas] = useState<Sessao | null>(null)
  const [notas, setNotas] = useState('')
  const [savingNotas, setSavingNotas] = useState(false)
  const [transcrevendo, setTranscrevendo] = useState(false)
  const audioInputRef = useRef<HTMLInputElement>(null)

  async function alterarPagamento(sessao: Sessao, novo: Sessao['pagamento_status']) {
    await fetch(`/api/sessoes/${sessao.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagamento_status: novo }),
    })
    // Atualiza localmente para feedback imediato
    setModalDetalhe(prev => prev ? { ...prev, pagamento_status: novo } : prev)
    setSessoes(prev => prev.map(s => s.id === sessao.id ? { ...s, pagamento_status: novo } : s))
  }

  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(semanaInicio, i))


  const loadSessoes = useCallback(async () => {
    setLoading(true)
    try {
      const inicio = semanaInicio.toISOString()
      const fim = addDays(semanaInicio, 7).toISOString()
      const res = await fetch(`/api/sessoes?inicio=${inicio}&fim=${fim}`)
      if (!res.ok) {
        console.warn('[GET /api/sessoes] status', res.status)
        setSessoes([])
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) setSessoes(data as Sessao[])
      else setSessoes([])
    } catch (err) {
      console.error('[loadSessoes]', err)
      setSessoes([])
    } finally {
      setLoading(false)
    }
  }, [semanaInicio])

  useEffect(() => {
    let cancelled = false
    fetch('/api/pacientes?ativo=true')
      .then(r => r.ok ? r.json() : { data: [] })
      .then(data => {
        if (!cancelled) {
          // A API retorna { data, total, limit, offset } — extrair o array
          const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
          setPacientes(list)
        }
      })
      .catch(err => console.error('[GET /api/pacientes]', err))
    return () => { cancelled = true }
  }, [session])

  useEffect(() => { loadSessoes() }, [loadSessoes])

  // Auto-refresh a cada 30s para capturar agendamentos feitos pelo link/agente
  useEffect(() => {
    const interval = setInterval(() => { loadSessoes() }, 30_000)
    return () => clearInterval(interval)
  }, [loadSessoes])

  function getSessoesDoDia(dia: Date, hora: number): Sessao[] {
    return sessoes.filter(s => {
      const d = parseISO(s.data_hora)
      return isSameDay(d, dia) && d.getHours() === hora
    })
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.paciente_id) { setErro('Selecione um paciente.'); return }
    setSaving(true)
    setErro('')

    try {
      const [hh, mm] = form.hora.split(':').map(Number)
      const data_hora = setMinutes(setHours(parseISO(form.data), hh), mm).toISOString()

      const res = await fetch('/api/sessoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: form.paciente_id,
          data_hora,
          duracao_min: form.duracao_min,
          valor: form.valor,
          observacoes: form.observacoes || null,
          status: form.status,
        }),
      })

      if (!res.ok) { const d = await res.json(); setErro(d.error ?? 'Erro ao salvar.'); return }
      setModalNova(false)
      setForm(EMPTY_FORM)
      loadSessoes()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function marcarStatus(sessao: Sessao, status: 'realizado' | 'cancelado' | 'faltou') {
    try {
      const res = await fetch(`/api/sessoes/${sessao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setErro(d.error ?? 'Erro ao atualizar sessão.')
        return
      }
      setModalDetalhe(null)
      loadSessoes()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    }
  }

  const marcarRealizado  = (sessao: Sessao) => marcarStatus(sessao, 'realizado')
  const marcarCancelado  = (sessao: Sessao) => marcarStatus(sessao, 'cancelado')
  const marcarFaltou     = (sessao: Sessao) => marcarStatus(sessao, 'faltou')

  function abrirNotas(sessao: Sessao) {
    setModalNotas(sessao)
    setNotas(sessao.notas_clinicas ?? '')
    setModalDetalhe(null)
  }

  async function transcreverAudio(file: File) {
    if (!modalNotas) return
    setTranscrevendo(true)
    try {
      const form = new FormData()
      form.append('audio', file)
      const res = await fetch(`/api/sessoes/${modalNotas.id}/transcrever`, { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok && data.prontuario) setNotas(data.prontuario)
      else alert(data.error ?? 'Erro ao transcrever.')
    } catch {
      alert('Erro de conexão ao transcrever.')
    } finally {
      setTranscrevendo(false)
    }
  }

  async function salvarNotas() {
    if (!modalNotas) return
    setSavingNotas(true)
    await fetch(`/api/sessoes/${modalNotas.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas_clinicas: notas }),
    })
    setSavingNotas(false)
    setModalNotas(null)
    loadSessoes()
  }

  async function gerarRecibo(sessao: Sessao) {
    try {
      const res = await fetch('/api/recibos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: sessao.paciente_id,
          sessao_id: sessao.id,
          valor: sessao.valor,
          data_emissao: format(parseISO(sessao.data_hora), 'yyyy-MM-dd'),
          descricao: 'Consulta',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Recibo #${data.numero} gerado com sucesso! Acesse a aba Recibos para baixar o PDF.`)
        setModalDetalhe(null)
      } else {
        setErro(data.error ?? 'Erro ao gerar recibo.')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#eff6ff] rounded-xl p-2.5">
            <CalendarDays className="w-5 h-5 text-[#2563eb]" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#0f172a]" style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}>Agenda</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSemanaInicio(s => addDays(s, -7))} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-40 text-center">
            {format(semanaInicio, "d 'de' MMM", { locale: ptBR })} —{' '}
            {format(addDays(semanaInicio, 6), "d 'de' MMM, yyyy", { locale: ptBR })}
          </span>
          <button onClick={() => setSemanaInicio(s => addDays(s, 7))} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setForm(EMPTY_FORM); setErro(''); setModalNova(true) }}
            className="flex items-center gap-2 bg-[#1e3a8a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1d4ed8]"
          >
            <Plus className="w-4 h-4" /> Nova sessão
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
        <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          <div className="p-2" />
          {diasSemana.map((dia, i) => (
            <div
              key={i}
              className={`p-2 text-center text-xs font-medium border-l border-gray-100 ${isSameDay(dia, new Date()) ? 'bg-[#eff6ff] text-[#2563eb]' : 'text-gray-500'}`}
            >
              <div>{format(dia, 'EEE', { locale: ptBR })}</div>
              <div className={`text-base font-bold mt-0.5 ${isSameDay(dia, new Date()) ? 'text-[#2563eb]' : 'text-gray-800'}`}>
                {format(dia, 'd')}
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
          </div>
        ) : (
          HORAS.map(hora => (
            <div
              key={hora}
              className="grid border-b border-gray-100 min-h-12"
              style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}
            >
              <div className="px-2 py-1 text-xs text-gray-400 font-mono">{hora}:00</div>
              {diasSemana.map((dia, di) => {
                const ses = getSessoesDoDia(dia, hora)
                return (
                  <div key={di} className="border-l border-gray-100 p-0.5 space-y-0.5">
                    {ses.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setModalDetalhe(s)}
                        className={`w-full text-left px-1.5 py-1 rounded border text-xs truncate leading-tight ${STATUS_COLORS[s.status]}`}
                      >
                        <span className="flex items-center justify-between gap-1">
                          <span className="truncate">{s.paciente?.nome?.split(' ')[0]}</span>
                          {s.status === 'realizado' && s.pagamento_status === 'pendente' && (
                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" title="Pagamento pendente" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {modalNova && (
        <ModalNovaSessao
          pacientes={pacientes}
          form={form}
          setForm={setForm}
          erro={erro}
          saving={saving}
          onSubmit={handleSalvar}
          onClose={() => setModalNova(false)}
        />
      )}

      {modalDetalhe && (
        <ModalDetalheSessao
          sessao={modalDetalhe}
          onClose={() => setModalDetalhe(null)}
          onMarcarRealizado={marcarRealizado}
          onMarcarFaltou={marcarFaltou}
          onMarcarCancelado={marcarCancelado}
          onAbrirNotas={abrirNotas}
          onGerarRecibo={gerarRecibo}
          onAlterarPagamento={alterarPagamento}
        />
      )}

      {modalNotas && (
        <ModalNotas
          sessao={modalNotas}
          notas={notas}
          setNotas={setNotas}
          savingNotas={savingNotas}
          transcrevendo={transcrevendo}
          audioInputRef={audioInputRef}
          onSalvar={salvarNotas}
          onClose={() => setModalNotas(null)}
          onTranscrever={transcreverAudio}
        />
      )}
    </div>
  )
}
