import asyncio
import os
import re

import httpx

META_TOKEN = os.getenv("META_WHATSAPP_TOKEN", "")
META_PHONE_NUMBER_ID = os.getenv("META_PHONE_NUMBER_ID", "")


def _api_url() -> str:
    return f"https://graph.facebook.com/v21.0/{META_PHONE_NUMBER_ID}/messages"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {os.getenv('META_WHATSAPP_TOKEN', META_TOKEN)}",
        "Content-Type": "application/json",
    }


async def enviar_texto(phone: str, texto: str):
    if not META_TOKEN or not META_PHONE_NUMBER_ID:
        print("[Meta] TOKEN ou PHONE_NUMBER_ID não configurados")
        return
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(
            _api_url(),
            headers=_headers(),
            json={
                "messaging_product": "whatsapp",
                "to": phone,
                "type": "text",
                "text": {"body": texto, "preview_url": False},
            },
        )
        if not r.is_success:
            print(f"[Meta] Erro ao enviar mensagem: {r.status_code} {r.text[:200]}")


async def marcar_lido(message_id: str):
    """Marca a mensagem recebida como lida (✓✓ azul)."""
    if not META_TOKEN or not META_PHONE_NUMBER_ID:
        return
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(
                _api_url(),
                headers=_headers(),
                json={
                    "messaging_product": "whatsapp",
                    "status": "read",
                    "message_id": message_id,
                },
            )
    except Exception:
        pass


async def enviar_resposta_humanizada(phone: str, texto: str):
    """Divide resposta em partes e adiciona delay proporcional ao tamanho."""
    partes = re.split(r"(?<=[.!?])\s+", texto.strip())

    grupos: list[str] = []
    for frase in partes:
        if grupos and len(grupos[-1]) + len(frase) < 200:
            grupos[-1] += " " + frase
        else:
            grupos.append(frase)

    for parte in grupos:
        parte = parte.strip()
        if not parte:
            continue
        delay_s = min(0.8 + len(parte) * 0.02, 4.0)
        await asyncio.sleep(delay_s)
        await enviar_texto(phone, parte)
        await asyncio.sleep(0.4)
