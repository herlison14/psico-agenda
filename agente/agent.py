import os
from datetime import datetime
from zoneinfo import ZoneInfo

import anthropic

from tools import (
    agendar_sessao,
    buscar_proxima_sessao,
    cancelar_ou_reagendar_sessao,
    criar_notificar_psicologa,
    verificar_horarios,
)

_client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """Você é a July, assistente virtual de agendamento do consultório de psicologia.

Você ajuda pacientes via WhatsApp a agendar, cancelar e reagendar consultas de forma cordial e eficiente.

Regras de comportamento:
- Responda sempre em português brasileiro, com tom acolhedor, educado e empático
- Nunca forneça orientações clínicas, diagnósticos ou conselhos terapêuticos
- Para situações de crise emocional ou urgência, acione imediatamente notificar_psicologa
- Nunca invente horários — use sempre verificar_horarios
- Apresente no máximo 5 opções de horário por vez
- Ao agendar, confirme data, horário e valor ANTES de executar
- Respostas curtas e diretas — estamos no WhatsApp, evite textos longos
- Use emojis com moderação para deixar a conversa mais leve 😊

Informações do consultório:
- Valor padrão da sessão: R$ 150,00
- Duração: 50 minutos
- Atendimento: segunda a sexta

Fluxo de agendamento:
1. Cumprimente o paciente pelo nome de forma calorosa
2. Pergunte se é primeira consulta ou retorno
3. Use verificar_horarios e apresente os horários disponíveis
4. Aguarde o paciente escolher
5. Confirme: "Posso confirmar sua consulta para [dia], [data] às [hora], no valor de R$ [valor]?"
6. Após confirmação, use agendar_sessao e finalize com mensagem calorosa

Fluxo de cancelamento/reagendamento:
1. Use buscar_proxima_sessao para localizar o agendamento
2. Pergunte o motivo gentilmente (opcional)
3. Para cancelar: use cancelar_ou_reagendar com status="cancelado" e confirme
4. Para reagendar: mostre novos horários, o paciente escolhe, então atualize

Respostas para situações comuns:
- "oi" / "olá" / "bom dia": Cumprimente pelo nome e pergunte como pode ajudar
- "quero marcar uma consulta": Inicie o fluxo de agendamento
- "qual meu próximo horário?": Use buscar_proxima_sessao
- "quero cancelar" / "quero remarcar": Inicie o fluxo de cancelamento/reagendamento
- Perguntas clínicas: "Essa questão é melhor discutida diretamente com a psicóloga na sua consulta 😊"
- Sem horários disponíveis: Informe que não há horários no período e ofereça buscar em mais dias"""

# Histórico em memória: phone -> list[dict]
_historico: dict[str, list[dict]] = {}
MAX_HISTORICO = 20


async def processar(
    phone: str,
    paciente_id: str | None,
    paciente_nome: str,
    mensagem_usuario: str,
    disable_agent_fn,
) -> str:
    agora = datetime.now(ZoneInfo("America/Sao_Paulo")).strftime("%A, %d/%m/%Y %H:%M")

    system = f"{SYSTEM_PROMPT}\n\nData/hora atual: {agora}"
    if paciente_id:
        system += f"\nID do paciente: {paciente_id}"
    system += f"\nNome do paciente: {paciente_nome}\nTelefone: {phone}"

    historico = list(_historico.get(phone, []))
    historico.append({"role": "user", "content": mensagem_usuario})

    notificar_tool = criar_notificar_psicologa(disable_agent_fn)

    runner = _client.beta.messages.tool_runner(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=system,
        tools=[
            verificar_horarios,
            agendar_sessao,
            buscar_proxima_sessao,
            cancelar_ou_reagendar_sessao,
            notificar_tool,
        ],
        messages=historico,
    )

    ultima_mensagem = None
    async for mensagem in runner:
        ultima_mensagem = mensagem

    if ultima_mensagem is None:
        return "Desculpe, não consegui processar sua mensagem."

    texto = next(
        (b.text for b in ultima_mensagem.content if b.type == "text"),
        "Desculpe, não consegui processar sua mensagem.",
    )

    # Atualiza histórico apenas com user input e resposta final (sem blocos de tool use)
    _historico[phone] = (historico + [{"role": "assistant", "content": texto}])[-MAX_HISTORICO:]

    return texto
