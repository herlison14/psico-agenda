import json
import os

import httpx
from anthropic import beta_async_tool

PSICO_API_URL = os.getenv("PSICO_API_URL", "")
AGENTE_API_KEY = os.getenv("AGENTE_API_KEY", "")
PSICOLOGO_ID = os.getenv("PSICOLOGO_ID", "")


def _headers() -> dict:
    """Reconstrói headers com a chave atual do env (seguro para hot-reload)."""
    return {
        "Authorization": f"Bearer {os.getenv('AGENTE_API_KEY', AGENTE_API_KEY)}",
        "Content-Type": "application/json",
    }


# ─── Tools registradas para o tool runner ─────────────────────────────────────

@beta_async_tool
async def verificar_horarios(dias: int = 7) -> str:
    """Verifica os horários disponíveis para agendamento nos próximos dias (seg-sex).
    Use quando o paciente quiser saber quando pode marcar uma consulta.

    Args:
        dias: Quantos dias à frente buscar (padrão 7, máximo 30)
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"{PSICO_API_URL}/api/agente/horarios",
                headers=_headers(),
                params={"psicologo_id": PSICOLOGO_ID, "dias": dias},
            )
            r.raise_for_status()
            return r.text
    except httpx.HTTPStatusError as e:
        return json.dumps({"erro": f"API retornou {e.response.status_code}", "detalhe": e.response.text[:200]})
    except Exception as e:
        return json.dumps({"erro": str(e)})


@beta_async_tool
async def agendar_sessao(
    paciente_id: str,
    data_hora: str,
    valor: float,
    observacoes: str = "",
) -> str:
    """Agenda uma sessão para o paciente. Use após o paciente confirmar o horário desejado.

    Args:
        paciente_id: UUID do paciente
        data_hora: Data e hora em ISO 8601 (ex: 2026-04-07T09:00:00.000Z)
        valor: Valor da sessão em reais
        observacoes: Observações opcionais sobre a sessão
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                f"{PSICO_API_URL}/api/agente/sessao",
                headers=_headers(),
                json={
                    "psicologo_id": PSICOLOGO_ID,
                    "paciente_id": paciente_id,
                    "data_hora": data_hora,
                    "valor": valor,
                    "observacoes": observacoes or None,
                },
            )
            r.raise_for_status()
            return r.text
    except httpx.HTTPStatusError as e:
        return json.dumps({"erro": f"API retornou {e.response.status_code}", "detalhe": e.response.text[:200]})
    except Exception as e:
        return json.dumps({"erro": str(e)})


@beta_async_tool
async def buscar_proxima_sessao(paciente_id: str) -> str:
    """Busca a próxima sessão agendada do paciente.
    Use quando o paciente perguntar sobre o próximo agendamento ou quiser cancelar/reagendar.

    Args:
        paciente_id: UUID do paciente
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"{PSICO_API_URL}/api/agente/sessao/{paciente_id}",
                headers=_headers(),
                params={"tipo": "proxima", "psicologo_id": PSICOLOGO_ID},
            )
            r.raise_for_status()
            return r.text
    except httpx.HTTPStatusError as e:
        return json.dumps({"erro": f"API retornou {e.response.status_code}", "detalhe": e.response.text[:200]})
    except Exception as e:
        return json.dumps({"erro": str(e)})


@beta_async_tool
async def cancelar_ou_reagendar_sessao(
    sessao_id: str,
    status: str = "",
    data_hora: str = "",
    observacoes: str = "",
) -> str:
    """Cancela ou reagenda uma sessão existente.
    Para cancelar: status='cancelado'. Para reagendar: informe data_hora com o novo horário.

    Args:
        sessao_id: UUID da sessão a alterar
        status: Novo status — 'cancelado' para cancelar, 'agendado' para reagendar
        data_hora: Novo horário em ISO 8601 (apenas para reagendamento)
        observacoes: Motivo ou observação opcional
    """
    try:
        payload: dict = {}
        if status:
            payload["status"] = status
        if data_hora:
            payload["data_hora"] = data_hora
        if observacoes:
            payload["observacoes"] = observacoes

        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.patch(
                f"{PSICO_API_URL}/api/agente/sessao/{sessao_id}",
                headers=_headers(),
                json=payload,
            )
            r.raise_for_status()
            return r.text
    except httpx.HTTPStatusError as e:
        return json.dumps({"erro": f"API retornou {e.response.status_code}", "detalhe": e.response.text[:200]})
    except Exception as e:
        return json.dumps({"erro": str(e)})


# ─── Factory: notificar_psicologa precisa capturar disable_agent_fn ───────────

def criar_notificar_psicologa(disable_agent_fn):
    """Cria a tool notificar_psicologa com o disable_agent_fn capturado via closure."""

    async def notificar_psicologa(motivo: str, paciente_nome: str, paciente_phone: str) -> str:
        """Notifica a psicóloga e pausa o agente para este contato.
        Use em casos de crise emocional, pedido urgente, reclamação grave ou quando não conseguir resolver.

        Args:
            motivo: Motivo detalhado da notificação
            paciente_nome: Nome do paciente
            paciente_phone: Telefone do paciente
        """
        await disable_agent_fn(paciente_phone)
        return json.dumps({"resultado": "notificacao_enviada", "agente_pausado": True})

    return beta_async_tool(notificar_psicologa)
