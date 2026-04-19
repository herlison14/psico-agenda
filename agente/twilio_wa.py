import asyncio
import base64
import os
import re

import httpx

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "")  # ex: whatsapp:+14155238886


def _auth() -> tuple[str, str]:
    return (
        os.getenv("TWILIO_ACCOUNT_SID", TWILIO_ACCOUNT_SID),
        os.getenv("TWILIO_AUTH_TOKEN", TWILIO_AUTH_TOKEN),
    )


def _messages_url() -> str:
    sid = os.getenv("TWILIO_ACCOUNT_SID", TWILIO_ACCOUNT_SID)
    return f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"


async def enviar_texto(phone: str, texto: str):
    """Envia mensagem WhatsApp via Twilio."""
    account_sid, auth_token = _auth()
    if not account_sid or not auth_token or not TWILIO_WHATSAPP_NUMBER:
        print("[Twilio] Credenciais não configuradas")
        return

    # Garante prefixo whatsapp:
    to = phone if phone.startswith("whatsapp:") else f"whatsapp:{phone}"

    credentials = base64.b64encode(f"{account_sid}:{auth_token}".encode()).decode()

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(
            _messages_url(),
            headers={
                "Authorization": f"Basic {credentials}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={
                "From": TWILIO_WHATSAPP_NUMBER,
                "To": to,
                "Body": texto,
            },
        )
        if not r.is_success:
            print(f"[Twilio] Erro ao enviar: {r.status_code} {r.text[:200]}")


async def enviar_resposta_humanizada(phone: str, texto: str):
    """Divide resposta em partes com delay proporcional ao tamanho."""
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
