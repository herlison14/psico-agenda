'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Sessao, Paciente } from '@/types/psico'
import {
  format, addDays, startOfWeek, isSameDay, parseISO, setHours, setMinutes
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, X, Loader2, CalendarDays, CheckCircle2, XCircle, UserX, FileEdit, Save } from 'lucide-react'

const HORAS = Array.from({ length: 16 }, (_, i) => i + 7)
const STATUS_COLORS: Record<string, string> = {
  agendado: 'bg-blue-100 border-blue-400 text-blue-800',
  realizado: 'bg-green-100 border-green-400 text-green-800',
  cancelado: 'bg-red-100 border-red-400 text-red-700 line-through opacity-60',
  faltou: 'bg-orange-100 border-orange-400 text-orange-700 opacity-70',
}
const STATUS_LABEL: Record<string, string> = { agendado: 'Agendado', realizado: 'Realizado', cancelado: 'Cancelado', faltou: 'Faltou' }

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
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (!cancelled && Array.isArray(data)) setPacientes(data) })
      .catch(err => console.error('[GET /api/pacientes]', err))
    return () => { cancelled = true }
  }, [session])

  useEffect(() => { loadSessoes() }, [loadSessoes])

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

  async function marcarRealizado(sessao: Sessao) {
    await fetch(`/api/sessoes/${sessao.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'realizado' }),
    })
    setModalDetalhe(null)
    loadSessoes()
  }

  async function marcarCancelado(sessao: Sessao) {
    await fetch(`/api/sessoes/${sessao.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelado' }),
    })
    setModalDetalhe(null)
    loadSessoes()
  }

  async function marcarFaltou(sessao: Sessao) {
    await fetch(`/api/sessoes/${sessao.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'faltou' }),
    })
    setModalDetalhe(null)
    loadSessoes()
  }

  function abrirNotas(sessao: Sessao) {
    setModalNotas(sessao)
    setNotas(sessao.notas_clinicas ?? '')
    setModalDetalhe(null)
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
    const res = await fetch('/api/recibos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: sessao.paciente_id,
        sessao_id: sessao.id,
        valor: sessao.valor,
        data_emissao: format(parseISO(sessao.data_hora), 'yyyy-MM-dd'),
        descricao: 'Consulta Psicológica',
      }),
    })
    const data = await res.json()
    if (res.ok) {
      alert(`Recibo #${data.numero} gerado com sucesso! Acesse a aba Recibos para baixar o PDF.`)
      setModalDetalhe(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
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
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
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
              className={`p-2 text-center text-xs font-medium border-l border-gray-100 ${isSameDay(dia, new Date()) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'}`}
            >
              <div>{format(dia, 'EEE', { locale: ptBR })}</div>
              <div className={`text-base font-bold mt-0.5 ${isSameDay(dia, new Date()) ? 'text-indigo-600' : 'text-gray-800'}`}>
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
                        {s.paciente?.nome?.split(' ')[0]}
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EDE7] sticky top-0 bg-white">
              <h2 className="font-semibold text-[#1C2B22]">Nova sessão</h2>
              <button onClick={() => setModalNova(false)} className="text-[#A8BFB2] hover:text-[#5A9E7C] transition-colors"><X className="w-5 h-5" strokeWidth={1.75} /></button>
            </div>
            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Paciente *</label>
                <select
                  value={form.paciente_id}
                  onChange={e => {
                    const p = pacientes.find(p => p.id === e.target.value)
                    setForm(f => ({ ...f, paciente_id: e.target.value, valor: p?.valor_sessao ?? 150 }))
                  }}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-[#D4CFC6] rounded-xl text-sm text-[#1C2B22] focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none"
                >
                  <option value="">Selecione um paciente</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Data *</label>
                  <input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} required className="w-full px-4 py-2.5 bg-white border border-[#D4CFC6] rounded-xl text-sm text-[#1C2B22] focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Horário *</label>
                  <input type="time" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} required className="w-full px-4 py-2.5 bg-white border border-[#D4CFC6] rounded-xl text-sm text-[#1C2B22] focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Duração (min)</label>
                  <input type="number" min="10" value={form.duracao_min} onChange={e => setForm(f => ({ ...f, duracao_min: parseInt(e.target.value) }))} className="w-full px-4 py-2.5 bg-white border border-[#D4CFC6] rounded-xl text-sm text-[#1C2B22] focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Valor (R$)</label>
                  <input type="number" step="0.01" min="0" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: parseFloat(e.target.value) }))} className="w-full px-4 py-2.5 bg-white border border-[#D4CFC6] rounded-xl text-sm text-[#1C2B22] focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D5247] mb-1.5">Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={3} placeholder="Observações opcionais..." className="w-full px-4 py-2.5 bg-white border border-[#D4CFC6] rounded-xl text-sm text-[#1C2B22] placeholder:text-[#B0ABA3] focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none resize-none" />
              </div>
              {erro && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">{erro}</div>}
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setModalNova(false)} className="px-4 py-2.5 text-sm text-[#7A8C82] hover:bg-[#F5F0EB] rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#1B3A2F] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#244D3F] active:scale-[0.98] transition-all disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Agendar sessão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDetalhe && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EDE7]">
              <div>
                <h2 className="font-semibold text-[#1C2B22]">{modalDetalhe.paciente?.nome}</h2>
                <p className="text-xs text-[#7A8C82] mt-0.5">{format(parseISO(modalDetalhe.data_hora), "EEEE, dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
              <button onClick={() => setModalDetalhe(null)} className="text-[#A8BFB2] hover:text-[#5A9E7C] transition-colors"><X className="w-5 h-5" strokeWidth={1.75} /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#7A8C82]">Duração</span>
                <span className="font-medium text-[#1C2B22]">{modalDetalhe.duracao_min} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#7A8C82]">Valor</span>
                <span className="font-semibold text-[#1C2B22]">{Number(modalDetalhe.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#7A8C82]">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[modalDetalhe.status]}`}>{STATUS_LABEL[modalDetalhe.status]}</span>
              </div>
              {modalDetalhe.observacoes && (
                <div className="pt-1 border-t border-[#F0EDE7]">
                  <p className="text-[#7A8C82] text-xs mb-1">Observações</p>
                  <p className="text-[#1C2B22]">{modalDetalhe.observacoes}</p>
                </div>
              )}
            </div>
            {modalDetalhe.status === 'agendado' && (
              <div className="px-6 pb-6 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => marcarRealizado(modalDetalhe)} className="flex flex-col items-center justify-center gap-1.5 bg-[#EBF5EF] text-[#2D6A52] py-3 rounded-xl text-xs font-medium hover:bg-[#D4EDDF] transition-colors">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> Realizada
                  </button>
                  <button onClick={() => marcarFaltou(modalDetalhe)} className="flex flex-col items-center justify-center gap-1.5 bg-orange-50 text-orange-700 py-3 rounded-xl text-xs font-medium hover:bg-orange-100 transition-colors">
                    <UserX className="w-4 h-4" strokeWidth={2} /> Faltou
                  </button>
                  <button onClick={() => marcarCancelado(modalDetalhe)} className="flex flex-col items-center justify-center gap-1.5 bg-red-50 text-red-700 py-3 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors">
                    <XCircle className="w-4 h-4" strokeWidth={2} /> Cancelar
                  </button>
                </div>
              </div>
            )}
            {modalDetalhe.status === 'realizado' && (
              <div className="px-6 pb-6 space-y-2">
                <button onClick={() => abrirNotas(modalDetalhe)} className="w-full flex items-center justify-center gap-2 bg-[#EBF5EF] text-[#2D6A52] py-2.5 rounded-xl text-sm font-medium hover:bg-[#D4EDDF] transition-colors">
                  <FileEdit className="w-4 h-4" strokeWidth={1.75} /> {modalDetalhe.notas_clinicas ? 'Editar notas clínicas' : 'Adicionar notas clínicas'}
                </button>
                <button onClick={() => gerarRecibo(modalDetalhe)} className="w-full flex items-center justify-center gap-2 bg-[#1B3A2F] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#244D3F] transition-colors">
                  Gerar recibo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Notas Clínicas */}
      {modalNotas && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="font-semibold text-gray-900">Notas Clínicas</h2>
                <p className="text-xs text-gray-500 mt-0.5">{modalNotas.paciente?.nome} · {format(parseISO(modalNotas.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
              <button onClick={() => setModalNotas(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6">
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                rows={8}
                placeholder="Registre sua evolução clínica, observações da sessão, técnicas utilizadas, plano terapêutico..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none resize-none text-gray-800 placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1.5">Estas notas são confidenciais e visíveis apenas para você.</p>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setModalNotas(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button onClick={salvarNotas} disabled={savingNotas} className="flex items-center gap-2 bg-[#1B3A2F] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#244D3F] disabled:opacity-60">
                  {savingNotas ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar notas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
