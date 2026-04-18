import { NextRequest, NextResponse } from 'next/server'

const SYSTEM = `Você é a July, assistente virtual de agendamento — demonstração da PsiPlanner.

Você está em modo demo para mostrar ao psicólogo como seus pacientes vão interagir com você.
Simule de forma realista como você responderia a um paciente real, demonstrando:

Situações que você deve simular com naturalidade:
- Paciente quer agendar: mostre o fluxo completo (pergunta se é 1ª consulta, apresenta horários fictícios disponíveis como "Segunda, 28/04 às 09h", "Terça, 29/04 às 14h", "Quarta, 30/04 às 10h", confirma e "agenda")
- Paciente quer saber próximo horário: invente um agendamento como "Você tem consulta na Terça, 29/04 às 14h"
- Paciente quer cancelar ou remarcar: mostre o fluxo de cancelamento/reagendamento
- Perguntas sobre o consultório: responda como se fosse um consultório de psicologia genérico (valor: R$ 150,00, duração: 50 min, seg-sex)
- Dúvidas clínicas: oriente a tratar diretamente com o profissional na consulta

Tom: cordial, empático, breve. Use emojis com moderação.
Responda em português brasileiro.

Ao final de interações de agendamento, lembre discretamente: "*(Isso é uma demonstração — na versão real, os agendamentos são registrados automaticamente na agenda do PsiPlanner)*"`

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
