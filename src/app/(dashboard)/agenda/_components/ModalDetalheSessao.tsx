'use client'

import { Sessao } from '@/types/psico'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { X, CheckCircle2, XCircle, UserX, FileEdit, Banknote, CircleCheck, Gift } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  agendado:  'bg-blue-100 border-blue-400 text-blue-800',
  realizado: 'bg-green-100 border-green-400 text-green-800',
  cancelado: 'bg-red-100 border-red-400 text-red-700 line-through opacity-60',
  faltou:    'bg-orange-100 border-orange-400 text-orange-700 opacity-70',
}

const STATUS_LABEL: Record<string, string> = {
  agendado:  'Agendado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  faltou:    'Faltou',
}

const PAGAMENTO_CONFIG = {
  pendente: { label: 'Pendente', Icon: Banknote,    cls: 'bg-amber-50 border-amber-200 text-amber-700' },
  pago:     { label: 'Pago',     Icon: CircleCheck,  cls: 'bg-green-50 border-green-200 text-green-700' },
  isento:   { label: 'Isento',   Icon: Gift,         cls: 'bg-slate-100 border-slate-200 text-slate-500' },
} as const

interface Props {
  sessao: Sessao
  onClose: () => void
  onMarcarRealizado: (s: Sessao) => void
  onMarcarFaltou: (s: Sessao) => void
  onMarcarCancelado: (s: Sessao) => void
  onAbrirNotas: (s: Sessao) => void
  onGerarRecibo: (s: Sessao) => void
  onAlterarPagamento: (s: Sessao, status: Sessao['pagamento_status']) => void
}

export function ModalDetalheSessao({
  sessao, onClose,
  onMarcarRealizado, onMarcarFaltou, onMarcarCancelado,
  onAbrirNotas, onGerarRecibo, onAlterarPagamento,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9]">
          <div>
            <h2 className="font-semibold text-[#0f172a]">{sessao.paciente?.nome}</h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              {format(parseISO(sessao.data_hora), "EEEE, dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#3b82f6] transition-colors">
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="p-6 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[#64748b]">Duração</span>
            <span className="font-medium text-[#0f172a]">{sessao.duracao_min} min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748b]">Valor</span>
            <span className="font-semibold text-[#0f172a]">
              {Number(sessao.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748b]">Status</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[sessao.status]}`}>
              {STATUS_LABEL[sessao.status]}
            </span>
          </div>

          {sessao.status === 'realizado' && (
            <div className="pt-2 border-t border-[#f1f5f9]">
              <p className="text-[#64748b] text-xs mb-2 font-medium uppercase tracking-wide">Pagamento</p>
              <div className="grid grid-cols-3 gap-2">
                {(['pendente', 'pago', 'isento'] as const).map(op => {
                  const { label, Icon, cls } = PAGAMENTO_CONFIG[op]
                  const ativo = (sessao.pagamento_status ?? 'pendente') === op
                  return (
                    <button
                      key={op}
                      onClick={() => onAlterarPagamento(sessao, op)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        ativo ? `${cls} ring-2 ring-offset-1 ring-current` : 'bg-white border-[#e2e8f0] text-[#94a3b8] hover:border-[#cbd5e1]'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.75} />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {sessao.observacoes && (
            <div className="pt-1 border-t border-[#f1f5f9]">
              <p className="text-[#64748b] text-xs mb-1">Observações</p>
              <p className="text-[#0f172a]">{sessao.observacoes}</p>
            </div>
          )}
        </div>

        {sessao.status === 'agendado' && (
          <div className="px-6 pb-6 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onMarcarRealizado(sessao)}
                className="flex flex-col items-center justify-center gap-1.5 bg-[#eff6ff] text-[#2563eb] py-3 rounded-xl text-xs font-medium hover:bg-[#dbeafe] transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> Realizada
              </button>
              <button
                onClick={() => onMarcarFaltou(sessao)}
                className="flex flex-col items-center justify-center gap-1.5 bg-orange-50 text-orange-700 py-3 rounded-xl text-xs font-medium hover:bg-orange-100 transition-colors"
              >
                <UserX className="w-4 h-4" strokeWidth={2} /> Faltou
              </button>
              <button
                onClick={() => onMarcarCancelado(sessao)}
                className="flex flex-col items-center justify-center gap-1.5 bg-red-50 text-red-700 py-3 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors"
              >
                <XCircle className="w-4 h-4" strokeWidth={2} /> Cancelar
              </button>
            </div>
          </div>
        )}

        {sessao.status === 'realizado' && (
          <div className="px-6 pb-6 space-y-2">
            <button
              onClick={() => onAbrirNotas(sessao)}
              className="w-full flex items-center justify-center gap-2 bg-[#eff6ff] text-[#2563eb] py-2.5 rounded-xl text-sm font-medium hover:bg-[#dbeafe] transition-colors"
            >
              <FileEdit className="w-4 h-4" strokeWidth={1.75} />
              {sessao.notas_clinicas ? 'Editar notas clínicas' : 'Adicionar notas clínicas'}
            </button>
            <button
              onClick={() => onGerarRecibo(sessao)}
              className="w-full flex items-center justify-center gap-2 bg-[#1e3a8a] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
            >
              Gerar recibo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
