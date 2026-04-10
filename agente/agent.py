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

SYSTEM_PROMPT = """Você é a July, assistente virtual da clínica de psicologia.

Suas funções:
1. Responder dúvidas sobre a clínica e o processo terapêutico
2. Verificar horários disponíveis para consultas
3. Agendar, cancelar ou reagendar sessões
4. Confirmar agendamentos existentes
5. Escalar para a psicóloga quando necessário

Regras:
- Responda sempre em português brasileiro, de forma acolhedora e empática
- Nunca forneça orientações clínicas, diagnósticos ou conselhos terapêuticos
- Para questões emocionais urgentes ou crises, acione imediatamente notificar_psicologa
- O valor padrão da sessão é R$ 150,00
- Sessões têm duração de 50 minutos
- Ao agendar, sempre confirme: nome, data, horário e valor antes de executar
- Nunca invente horários — use sempre a tool verificar_horarios
- Apresente no máximo 5 opções de horário por vez

Fluxo de agendamento:
1. Pergunte se é primeira consulta ou retorno
2. Use verificar_horarios para buscar datas disponíveis
3. Apresente opções claras (ex: "Segunda 07/04 às 09:00")
4. Confirme os dados com o paciente
5. Use agendar_sessao para registrar
6. Confirme com data/hora formatada em português"""

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
        model="claude-opus-4-6",
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
