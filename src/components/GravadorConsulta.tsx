'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff, Loader2, CheckCircle2, AlertCircle, Square } from 'lucide-react'

type Estado = 'idle' | 'gravando' | 'processando' | 'concluido' | 'erro'

interface Props {
  sessaoId: string
  onTranscrito: (soap: string, transcricao: string) => void
}

export default function GravadorConsulta({ sessaoId, onTranscrito }: Props) {
  const [estado, setEstado] = useState<Estado>('idle')
  const [segundos, setSegundos] = useState(0)
  const [erro, setErro] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef        = useRef<MediaStream | null>(null)

  // Limpa recursos ao desmontar
  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const iniciarGravacao = useCallback(async () => {
    setErro('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Escolhe o melhor formato suportado
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4']
        .find(m => MediaRecorder.isTypeSupported(m)) ?? ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        timerRef.current && clearInterval(timerRef.current)
        stream.getTracks().forEach(t => t.stop())
        setEstado('processando')

        const blob     = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const ext      = (recorder.mimeType || 'audio/webm').includes('ogg') ? 'ogg'
                       : (recorder.mimeType || '').includes('mp4') ? 'mp4' : 'webm'
        const audioFile = new File([blob], `consulta.${ext}`, { type: blob.type })

        const form = new FormData()
        form.append('audio', audioFile)

        try {
          const res = await fetch(`/api/sessoes/${sessaoId}/transcrever`, {
            method: 'POST',
            body: form,
          })
          const data = await res.json()

          if (!res.ok) throw new Error(data.error ?? 'Erro ao transcrever')

          setEstado('concluido')
          onTranscrito(data.prontuario ?? '', data.transcricao ?? '')
        } catch (e) {
          console.error('[GravadorConsulta]', e)
          setErro(e instanceof Error ? e.message : 'Erro ao processar áudio')
          setEstado('erro')
        }
      }

      recorder.start(1000) // chunk a cada 1s
      setEstado('gravando')
      setSegundos(0)
      timerRef.current = setInterval(() => setSegundos(s => s + 1), 1000)
    } catch (e) {
      console.error('[GravadorConsulta] getUserMedia', e)
      setErro('Não foi possível acessar o microfone. Verifique as permissões do navegador.')
      setEstado('erro')
    }
  }, [sessaoId, onTranscrito])

  const pararGravacao = useCallback(() => {
    mediaRecorderRef.current?.stop()
  }, [])

  const resetar = useCallback(() => {
    setEstado('idle')
    setSegundos(0)
    setErro('')
  }, [])

  // Formata tempo mm:ss
  const tempo = `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`

  // ── Idle ──────────────────────────────────────────────────────────────
  if (estado === 'idle') {
    return (
      <button
        type="button"
        onClick={iniciarGravacao}
        className="w-full flex items-center justify-center gap-2 bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] border border-[#bfdbfe] rounded-xl py-2.5 text-sm font-medium transition-colors"
      >
        <Mic className="w-4 h-4" strokeWidth={2} />
        Gravar consulta e gerar SOAP com IA
      </button>
    )
  }

  // ── Gravando ──────────────────────────────────────────────────────────
  if (estado === 'gravando') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-700">Gravando</span>
          <span className="text-sm font-mono text-red-600">{tempo}</span>
        </div>
        <button
          type="button"
          onClick={pararGravacao}
          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <Square className="w-3 h-3 fill-white" />
          Parar e transcrever
        </button>
      </div>
    )
  }

  // ── Processando ───────────────────────────────────────────────────────
  if (estado === 'processando') {
    return (
      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-3 flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-[#2563eb] animate-spin shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#1e40af]">Transcrevendo e gerando SOAP…</p>
          <p className="text-xs text-[#3b82f6]">Groq Whisper + Claude — pode levar alguns segundos</p>
        </div>
      </div>
    )
  }

  // ── Concluído ─────────────────────────────────────────────────────────
  if (estado === 'concluido') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-700">SOAP gerado com sucesso! Revise e salve.</p>
        </div>
        <button
          type="button"
          onClick={resetar}
          className="text-xs text-green-600 hover:text-green-800 underline"
        >
          Nova gravação
        </button>
      </div>
    )
  }

  // ── Erro ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
        <p className="text-sm text-red-700">{erro || 'Erro ao processar áudio.'}</p>
      </div>
      <button
        type="button"
        onClick={resetar}
        className="text-xs text-red-600 hover:text-red-800 underline shrink-0"
      >
        Tentar novamente
      </button>
    </div>
  )
}
