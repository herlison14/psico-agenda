import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await params

  const formData = await req.formData()
  const audioFile = formData.get('audio') as File | null
  if (!audioFile) return NextResponse.json({ error: 'Arquivo de áudio obrigatório.' }, { status: 400 })

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) return NextResponse.json({ error: 'GROQ_API_KEY não configurada.' }, { status: 500 })

  // 1. Transcrição via Groq Whisper large-v3
  const groqForm = new FormData()
  groqForm.append('file', audioFile)
  groqForm.append('model', 'whisper-large-v3')
  groqForm.append('language', 'pt')
  groqForm.append('response_format', 'text')

  const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${groqKey}` },
    body: groqForm,
  })

  if (!groqRes.ok) {
    const err = await groqRes.text()
    console.error('[transcrever] Groq error:', err)
    return NextResponse.json({ error: 'Erro na transcrição de áudio.' }, { status: 502 })
  }

  const transcricao = (await groqRes.text()).trim()

  // 2. Gerar prontuário SOAP via Claude
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) return NextResponse.json({ transcricao, prontuario: transcricao })

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: `Você é um assistente especializado em documentação clínica para psicólogos brasileiros. Com base na transcrição da consulta abaixo, gere um prontuário no formato SOAP em português, de forma concisa e profissional.

TRANSCRIÇÃO:
${transcricao}

Formato obrigatório:
**S — Subjetivo:** (relato do paciente, queixas, sentimentos expressos)
**O — Objetivo:** (observações clínicas: comportamento, afeto, aparência, insight)
**A — Avaliação:** (impressão clínica, hipóteses diagnósticas, progresso)
**P — Plano:** (intervenções realizadas, tarefas, próximos passos, frequência)`,
      }],
    }),
  })

  if (!claudeRes.ok) return NextResponse.json({ transcricao, prontuario: transcricao })

  const claudeData = await claudeRes.json()
  const prontuario = claudeData.content?.[0]?.text ?? transcricao

  return NextResponse.json({ transcricao, prontuario })
}
