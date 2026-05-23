'use client'

import { RefObject } from 'react'
import { Sessao } from '@/types/psico'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { X, Loader2, Save, Mic } from 'lucide-react'

interface Props {
  sessao: Sessao
  notas: string
  setNotas: (v: string) => void
  savingNotas: boolean
  transcrevendo: boolean
  audioInputRef: RefObject<HTMLInputElement>
  onSalvar: () => void
  onClose: () => void
  onTranscrever: (file: File) => void
}

export function ModalNotas({
  sessao, notas, setNotas, savingNotas, transcrevendo,
  audioInputRef, onSalvar, onClose, onTranscrever,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-semibold text-gray-900">Notas Clínicas</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {sessao.paciente?.nome} · {format(parseISO(sessao.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Notas clínicas</label>
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              disabled={transcrevendo}
              title="Transcreve o áudio e gera prontuário SOAP com IA"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] disabled:opacity-50 transition-colors font-medium"
            >
              {transcrevendo
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Mic className="w-3.5 h-3.5" />}
              {transcrevendo ? 'Transcrevendo...' : 'Transcrever consulta'}
            </button>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*,.mp3,.mp4,.m4a,.wav,.webm,.ogg"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) onTranscrever(f)
                e.target.value = ''
              }}
            />
          </div>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            rows={8}
            placeholder="Registre sua evolução clínica, ou clique em 'Transcrever consulta' para gerar um prontuário SOAP automaticamente a partir do áudio da sessão..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none resize-none text-gray-800 placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Notas confidenciais — visíveis apenas para você. A transcrição gera prontuário no formato SOAP via IA.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancelar
            </button>
            <button
              onClick={onSalvar}
              disabled={savingNotas}
              className="flex items-center gap-2 bg-[#1e3a8a] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {savingNotas ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar notas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
