'use client'

import { Paciente } from '@/types/psico'
import { X, Loader2 } from 'lucide-react'

type FormState = {
  paciente_id: string
  data: string
  hora: string
  duracao_min: number
  valor: number
  observacoes: string
  status: 'agendado'
}

interface Props {
  pacientes: Paciente[]
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  erro: string
  saving: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function ModalNovaSessao({ pacientes, form, setForm, erro, saving, onSubmit, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9] sticky top-0 bg-white">
          <h2 className="font-semibold text-[#0f172a]">Nova sessão</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#3b82f6] transition-colors">
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Paciente *</label>
            <select
              value={form.paciente_id}
              onChange={e => {
                const p = pacientes.find(p => p.id === e.target.value)
                setForm(f => ({ ...f, paciente_id: e.target.value, valor: p?.valor_sessao ?? 150 }))
              }}
              required
              className="w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#0f172a] focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none"
            >
              <option value="">Selecione um paciente</option>
              {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1.5">Data *</label>
              <input
                type="date"
                value={form.data}
                onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                required
                className="w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#0f172a] focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1.5">Horário *</label>
              <input
                type="time"
                value={form.hora}
                onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                required
                className="w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#0f172a] focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1.5">Duração (min)</label>
              <input
                type="number"
                min="10"
                value={form.duracao_min}
                onChange={e => setForm(f => ({ ...f, duracao_min: parseInt(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#0f172a] focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1.5">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.valor}
                onChange={e => setForm(f => ({ ...f, valor: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#0f172a] focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
              rows={3}
              placeholder="Observações opcionais..."
              className="w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none resize-none"
            />
          </div>
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">{erro}</div>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-[#64748b] hover:bg-[#F5F0EB] rounded-xl transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Agendar sessão
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

