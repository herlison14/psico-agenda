import { NextRequest, NextResponse } from 'next/server'

const SYSTEM = `Você é a July, assistente virtual de agendamento da PsiPlanner — plataforma de gestão para psicólogos.

Você está em modo demonstração no site da PsiPlanner. Seu papel é:
- Apresentar as funcionalidades da plataforma de forma natural e amigável
- Mostrar como funciona o agendamento de consultas
- Responder dúvidas sobre a plataforma
- Incentivar o psicólogo a criar uma conta gratuita

Funcionalidades que você pode apresentar:
- Agenda semanal visual com gestão de sessões
- Cadastro de pacientes com histórico completo
- Geração de recibos em PDF profissionais
- Relatório financeiro mensal e exportação para Carnê-Leão
- Notas clínicas com transcrição automática de áudio (IA)
- Agente de agendamento via WhatsApp para os pacientes

Seja breve, simpática e profissional. Responda em português brasileiro.
Não invente dados reais de pacientes ou sessões — você está em modo demo.`

export async function POST(req: NextRequest) {
  const { message, history = [] } = await req.json().catch(() => ({ message: '', history: [] }))
  if (!message?.trim()) return NextResponse.json({ error: 'Mensagem vazia.' }, { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 })

  const messages = [
    ...history.slice(-6),
    { role: 'user', content: message.slice(0, 500) },
  ]

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM,
      messages,
    }),
  })

  if (!res.ok) return NextResponse.json({ error: 'Erro ao processar.' }, { status: 502 })
  const data = await res.json()
  return NextResponse.json({ reply: data.content?.[0]?.text ?? '' })
}
