'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Mic, Pause, Play, Square, Loader2,
  CheckCircle2, AlertCircle, RotateCcw,
} from 'lucide-react'

type Estado = 'idle' | 'gravando' | 'pausado' | 'processando' | 'concluido' | 'erro'

interface Props {
  sessaoId: string
  onTranscrito: (soap: string, transcricao: string) => void
}

export default function GravadorConsulta({ sessaoId, onTranscrito }: Props) {
  const [estado, setEstado]     = useState<Estado>('idle')
  const [segundos, setSegundos] = useState(0)
  const [erro, setErro]         = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef        = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const iniciarTimer = () => {
    timerRef.current = setInterval(() => setSegundos(s => s + 1), 1000)
  }

  const pararTimer = () => {
    timerRef.current && clearInterval(timerRef.current)
    timerRef.current = null
  }

  const iniciarGravacao = useCallback(async () => {
    setErro('')
    setSegundos(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4']
        .find(m => MediaRecorder.isTypeSupported(m)) ?? ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        pararTimer()
        stream.getTracks().forEach(t => t.stop())
        setEstado('processando')

        const blob      = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const ext       = (recorder.mimeType || 'audio/webm').includes('ogg') ? 'ogg'
                        : (recorder.mimeType || '').includes('mp4') ? 'mp4' : 'webm'
        const audioFile = new File([blob], `consulta.${ext}`, { type: blob.type })

        const form = new FormData()
        form.append('audio', audioFile)

        try {
          const res  = await fetch(`/api/sessoes/${sessaoId}/transcrever`, { method: 'POST', body: form })
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

      recorder.start(1000)
      setEstado('gravando')
      iniciarTimer()
    } catch (e) {
      console.error('[GravadorConsulta] getUserMedia', e)
      setErro('Não foi possível acessar o microfone. Verifique as permissões do navegador.')
      setEstado('erro')
    }
  }, [sessaoId, onTranscrito])

  const pausarGravacao = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      pararTimer()
      setEstado('pausado')
    }
  }, [])

  const retomarGravacao = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      iniciarTimer()
      setEstado('gravando')
    }
  }, [])

  const finalizarGravacao = useCallback(() => {
    mediaRecorderRef.current?.stop()
  }, [])

  const resetar = useCallback(() => {
    pararTimer()
    streamRef.current?.getTracks().forEach(t => t.stop())
    mediaRecorderRef.current = null
    chunksRef.current = []
    setEstado('idle')
    setSegundos(0)
    setErro('')
  }, [])

  // Formata mm:ss
  const mm = String(Math.floor(segundos / 60)).padStart(2, '0')
  const ss = String(segundos % 60).padStart(2, '0')
  const tempo = `${mm}:${ss}`

  // ── Idle ────────────────────────────────────────────────────────────────
  if (estado === 'idle') {
    return (
      <button
        type="button"
        onClick={iniciarGravacao}
        className="w-full flex items-center justify-center gap-2.5 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe] hover:border-[#93c5fd] rounded-xl py-3 text-sm font-semibold transition-all"
      >
        <Mic className="w-4 h-4" strokeWidth={2} />
        Gravar sessão e gerar SOAP com IA
      </button>
    )
  }

  // ── Gravando / Pausado ───────────────────────────────────────────────────
  if (estado === 'gravando' || estado === 'pausado') {
    const gravando = estado === 'gravando'
    return (
      <div className={`rounded-xl border px-4 py-3 space-y-3 transition-colors ${
        gravando
          ? 'bg-red-50 border-red-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        {/* Indicador de estado + timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {gravando ? (
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            )}
            <span className={`text-sm font-semibold ${gravando ? 'text-red-700' : 'text-amber-700'}`}>
              {gravando ? 'Gravando…' : 'Pausado'}
            </span>
            <span className={`font-mono text-sm tabular-nums ${gravando ? 'text-red-600' : 'text-amber-600'}`}>
              {tempo}
            </span>
          </div>

          {/* Barra de progresso simulada (pulsa durante gravação) */}
          {gravando && (
            <div className="flex items-center gap-0.5 h-5">
              {[...Array(8)].map((_, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-red-400 animate-pulse"
                  style={{
                    height: `${Math.random() * 12 + 6}px`,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2">
          {/* Pausar / Retomar */}
          {gravando ? (
            <button
              type="button"
              onClick={pausarGravacao}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Pause className="w-3.5 h-3.5 fill-white" />
              Pausar
            </button>
          ) : (
            <button
              type="button"
              onClick={retomarGravacao}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Retomar
            </button>
          )}

          {/* Finalizar e transcrever */}
          <button
            type="button"
            onClick={finalizarGravacao}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            Finalizar e transcrever
          </button>

          {/* Cancelar gravação */}
          <button
            type="button"
            onClick={resetar}
            title="Cancelar gravação"
            className="ml-auto p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // ── Processando ──────────────────────────────────────────────────────────
  if (estado === 'processando') {
    return (
      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-3 flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-[#2563eb] animate-spin shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[#1e40af]">Transcrevendo e gerando SOAP…</p>
          <p className="text-xs text-[#3b82f6] mt-0.5">
            Groq Whisper + Claude Haiku · Áudio de {tempo}
          </p>
        </div>
      </div>
    )
  }

  // ── Concluído ────────────────────────────────────────────────────────────
  if (estado === 'concluido') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700">SOAP gerado! Revise e salve.</p>
            <p className="text-xs text-green-600 mt-0.5">Duração gravada: {tempo}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetar}
          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium shrink-0"
        >
          <Mic className="w-3 h-3" />
          Nova gravação
        </button>
      </div>
    )
  }

  // ── Erro ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
        <p className="text-sm text-red-700">{erro || 'Erro ao processar áudio.'}</p>
      </div>
      <button
        type="button"
        onClick={resetar}
        className="text-xs text-red-600 hover:text-red-800 font-medium underline shrink-0"
      >
        Tentar novamente
      </button>
    </div>
  )
}
