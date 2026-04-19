import asyncio
import os
import time
from contextlib import asynccontextmanager

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response

load_dotenv()

from agent import processar
from waha import enviar_resposta_humanizada as waha_resposta, enviar_texto as waha_texto
from telegram import enviar_mensagem, enviar_digitando, registrar_webhook
import meta as meta_api
import twilio_wa

PSICO_API_URL = os.getenv("PSICO_API_URL", "")
AGENTE_API_KEY = os.getenv("AGENTE_API_KEY", "")
PSICOLOGO_ID = os.getenv("PSICOLOGO_ID", "")
BUFFER_DELAY = float(os.getenv("BUFFER_DELAY", "2"))

PSICO_HEADERS = {
    "Authorization": f"Bearer {AGENTE_API_KEY}",
    "Content-Type": "application/json",
}

# ─── Estado em memória ─────────────────────────────────────────────────────────
_buffers: dict[str, list[dict]] = {}
_buffer_tasks: dict[str, asyncio.Task] = {}
_agent_status: dict[str, tuple[str, float]] = {}


def agente_ativo(phone: str) -> bool:
    if phone not in _agent_status:
        return True
    status, expires_at = _agent_status[phone]
    if expires_at and time.time() > expires_at:
        del _agent_status[phone]
        return True
    return status != "disabled"


def desativar_agente(phone: str, ttl_segundos: int = 86400):
    _agent_status[phone] = ("disabled", time.time() + ttl_segundos)


async def _disable_agent_fn(phone: str):
    desativar_agente(phone)


# ─── Busca / cria paciente ─────────────────────────────────────────────────────

async def obter_paciente(phone: str, nome: str) -> dict | None:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{PSICO_API_URL}/api/agente/paciente",
            headers=PSICO_HEADERS,
            params={"phone": phone, "psicologo_id": PSICOLOGO_ID},
        )
        data = r.json()

    if data.get("encontrado"):
        return data["paciente"]

    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.post(
            f"{PSICO_API_URL}/api/agente/paciente",
            headers=PSICO_HEADERS,
            json={"psicologo_id": PSICOLOGO_ID, "nome": nome, "telefone": phone},
        )
        result = r.json()
        return result.get("paciente")


# ─── Análise de imagem via Claude ─────────────────────────────────────────────

async def _analisar_imagem(url: str, caption: str) -> str:
    if not url:
        return f"[imagem recebida{': ' + caption if caption else ''}]"
    try:
        import anthropic as _anthropic
        _client = _anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        resp = await _client.messages.create(
            model="claude-opus-4-6",
            max_tokens=512,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "url", "url": url}},
                    {"type": "text", "text": f"Descreva o que vê na imagem.{' Legenda: ' + caption if caption else ''}"},
                ],
            }],
        )
        return resp.content[0].text
    except Exception as e:
        return f"[imagem recebida — erro na análise: {e}]"


# ─── Buffer de mensagens ───────────────────────────────────────────────────────

async def _processar_buffer(phone: str, nome: str):
    await asyncio.sleep(BUFFER_DELAY)

    mensagens = _buffers.pop(phone, [])
    if not mensagens or not agente_ativo(phone):
        return

    partes = [f"[{m['type'].upper()}]: {m['content']}" for m in mensagens]
    texto_consolidado = "\n".join(partes)

    try:
        paciente = await obter_paciente(phone, nome)
        paciente_id = paciente["id"] if paciente else None
        paciente_nome = paciente["nome"] if paciente else nome

        resposta = await processar(
            phone=phone,
            paciente_id=paciente_id,
            paciente_nome=paciente_nome,
            mensagem_usuario=texto_consolidado,
            disable_agent_fn=_disable_agent_fn,
        )

        await enviar_resposta_humanizada(phone, resposta)

    except Exception as e:
        print(f"[ERRO] Processamento falhou: {e}")
        await enviar_texto(phone, "Desculpe, ocorreu um erro. Tente novamente em instantes.")


def adicionar_ao_buffer(phone: str, nome: str, mensagem: dict):
    if phone not in _buffers:
        _buffers[phone] = []
    _buffers[phone].append(mensagem)

    tarefa = _buffer_tasks.get(phone)
    if tarefa is None or tarefa.done():
        _buffer_tasks[phone] = asyncio.create_task(_processar_buffer(phone, nome))


# ─── FastAPI ───────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("✅ Agente July iniciado (WAHA + Telegram)")
    yield


_ENV = os.getenv("ENV", "development")

app = FastAPI(
    title="Agente July — PsiPlanner",
    lifespan=lifespan,
    docs_url="/docs" if _ENV != "production" else None,
    redoc_url="/redoc" if _ENV != "production" else None,
    openapi_url="/openapi.json" if _ENV != "production" else None,
)


@app.get("/health")
async def health():
    return {"status": "ok", "agente": "July", "whatsapp": "WAHA"}


@app.get("/ping")
async def ping():
    return "pong"


@app.post("/webhook")
async def webhook(request: Request):
    try:
        body = await request.json()
    except Exception:
        return Response(status_code=400)

    # Formato WAHA: { event, session, payload: { from, fromMe, body, hasMedia, ... } }
    if body.get("event") != "message":
        return Response(status_code=200)

    payload = body.get("payload", {})

    if payload.get("fromMe"):
        return Response(status_code=200)

    # Extrai telefone no formato limpo (sem @c.us)
    from_jid = payload.get("from", "")

    # Ignorar grupos e broadcasts
    if "@g.us" in from_jid or "@status.broadcast" in from_jid or "@newsletter" in from_jid:
        return Response(status_code=200)

    phone = from_jid.replace("@c.us", "").replace("@s.whatsapp.net", "")
    nome = body.get("me", {}).get("pushName") or payload.get("pushName") or "Paciente"

    if not phone:
        return Response(status_code=200)

    if not agente_ativo(phone):
        return Response(status_code=200)

    has_media = payload.get("hasMedia", False)
    body_text = payload.get("body", "")
    media = payload.get("media", {}) or {}

    if not has_media:
        # Mensagem de texto
        if body_text:
            adicionar_ao_buffer(phone, nome, {"type": "text", "content": body_text})

    else:
        mime = media.get("mimetype", "")

        if mime.startswith("audio/"):
            adicionar_ao_buffer(phone, nome, {"type": "audio", "content": "[áudio recebido — transcrição indisponível]"})

        elif mime.startswith("image/"):
            url = media.get("url", "")
            caption = payload.get("caption", "")
            descricao = await _analisar_imagem(url, caption)
            adicionar_ao_buffer(phone, nome, {"type": "image", "content": descricao})

        else:
            adicionar_ao_buffer(phone, nome, {"type": "other", "content": "[arquivo recebido]"})

    return Response(status_code=200)


TELEGRAM_SECRET_TOKEN = os.getenv("TELEGRAM_WEBHOOK_SECRET", "")


@app.post("/webhook/telegram")
async def webhook_telegram(request: Request):
    # Valida secret token do Telegram para evitar spoofing
    if TELEGRAM_SECRET_TOKEN:
        token_header = request.headers.get("X-Telegram-Bot-Api-Secret-Token", "")
        if token_header != TELEGRAM_SECRET_TOKEN:
            return Response(status_code=403)

    try:
        body = await request.json()
    except Exception:
        return Response(status_code=400)

    message = body.get("message") or body.get("edited_message")
    if not message:
        return Response(status_code=200)

    chat_id = message.get("chat", {}).get("id")
    text = message.get("text", "")
    from_user = message.get("from", {})
    nome = from_user.get("first_name", "Paciente")
    phone = f"tg_{chat_id}"  # identificador único por chat

    if not chat_id or not text or text.startswith("/"):
        if text == "/start":
            await enviar_mensagem(chat_id, "Olá! Sou a *July*, assistente virtual da clínica de psicologia. Como posso ajudar?")
        return Response(status_code=200)

    if not agente_ativo(phone):
        return Response(status_code=200)

    adicionar_ao_buffer_telegram(chat_id, phone, nome, text)
    return Response(status_code=200)


def adicionar_ao_buffer_telegram(chat_id: int, phone: str, nome: str, texto: str):
    if phone not in _buffers:
        _buffers[phone] = []
    _buffers[phone].append({"type": "text", "content": texto})

    tarefa = _buffer_tasks.get(phone)
    if tarefa is None or tarefa.done():
        _buffer_tasks[phone] = asyncio.create_task(
            _processar_buffer_telegram(chat_id, phone, nome)
        )


async def _processar_buffer_telegram(chat_id: int, phone: str, nome: str):
    await asyncio.sleep(BUFFER_DELAY)

    mensagens = _buffers.pop(phone, [])
    if not mensagens or not agente_ativo(phone):
        return

    partes = [f"[{m['type'].upper()}]: {m['content']}" for m in mensagens]
    texto_consolidado = "\n".join(partes)

    try:
        await enviar_digitando(chat_id)

        paciente = await obter_paciente(phone, nome)
        paciente_id = paciente["id"] if paciente else None
        paciente_nome = paciente["nome"] if paciente else nome

        resposta = await processar(
            phone=phone,
            paciente_id=paciente_id,
            paciente_nome=paciente_nome,
            mensagem_usuario=texto_consolidado,
            disable_agent_fn=_disable_agent_fn,
        )

        await enviar_mensagem(chat_id, resposta)

    except Exception as e:
        import traceback
        print(f"[ERRO Telegram] processamento falhou: {e}\n{traceback.format_exc()}")
        await enviar_mensagem(chat_id, "Desculpe, ocorreu um erro interno. Tente novamente em instantes.")


@app.get("/setup/telegram")
async def setup_telegram(request: Request):
    # Protegido por API key para evitar reconfiguração não autorizada
    auth = request.headers.get("Authorization", "")
    admin_key = os.getenv("ADMIN_KEY", "")
    if not admin_key or auth != f"Bearer {admin_key}":
        return Response(status_code=403)
    base_url = str(request.base_url).rstrip("/")
    result = await registrar_webhook(base_url)
    return result


META_VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "")


@app.get("/webhook/meta")
async def webhook_meta_verify(request: Request):
    """Verificação do webhook pela Meta (challenge-response)."""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    if mode == "subscribe" and token == META_VERIFY_TOKEN and META_VERIFY_TOKEN:
        return Response(content=challenge, media_type="text/plain")
    return Response(status_code=403)


@app.post("/webhook/meta")
async def webhook_meta(request: Request):
    """Recebe mensagens do WhatsApp via Meta Cloud API."""
    try:
        body = await request.json()
    except Exception:
        return Response(status_code=400)

    if body.get("object") != "whatsapp_business_account":
        return Response(status_code=200)

    for entry in body.get("entry", []):
        for change in entry.get("changes", []):
            if change.get("field") != "messages":
                continue
            value = change.get("value", {})
            messages = value.get("messages", [])
            contacts = value.get("contacts", [])

            for msg in messages:
                msg_type = msg.get("type", "")
                phone = msg.get("from", "")
                message_id = msg.get("id", "")

                if not phone:
                    continue

                # Marca como lido imediatamente
                asyncio.create_task(meta_api.marcar_lido(message_id))

                if not agente_ativo(phone):
                    continue

                nome = contacts[0].get("profile", {}).get("name", "Paciente") if contacts else "Paciente"

                if msg_type == "text":
                    texto = msg.get("text", {}).get("body", "").strip()
                    if texto:
                        adicionar_ao_buffer_meta(phone, nome, texto)

                elif msg_type == "audio":
                    adicionar_ao_buffer_meta(phone, nome, "[áudio recebido — transcrição indisponível]")

                elif msg_type == "image":
                    caption = msg.get("image", {}).get("caption", "")
                    adicionar_ao_buffer_meta(phone, nome, f"[imagem recebida{': ' + caption if caption else ''}]")

    return Response(status_code=200)


def adicionar_ao_buffer_meta(phone: str, nome: str, texto: str):
    if phone not in _buffers:
        _buffers[phone] = []
    _buffers[phone].append({"type": "text", "content": texto})
    tarefa = _buffer_tasks.get(phone)
    if tarefa is None or tarefa.done():
        _buffer_tasks[phone] = asyncio.create_task(_processar_buffer_meta(phone, nome))


async def _processar_buffer_meta(phone: str, nome: str):
    await asyncio.sleep(BUFFER_DELAY)

    mensagens = _buffers.pop(phone, [])
    if not mensagens or not agente_ativo(phone):
        return

    texto_consolidado = "\n".join(f"[{m['type'].upper()}]: {m['content']}" for m in mensagens)

    try:
        paciente = await obter_paciente(phone, nome)
        paciente_id = paciente["id"] if paciente else None
        paciente_nome = paciente["nome"] if paciente else nome

        resposta = await processar(
            phone=phone,
            paciente_id=paciente_id,
            paciente_nome=paciente_nome,
            mensagem_usuario=texto_consolidado,
            disable_agent_fn=_disable_agent_fn,
        )

        await meta_api.enviar_resposta_humanizada(phone, resposta)

    except Exception as e:
        import traceback
        print(f"[Erro Meta] {e}\n{traceback.format_exc()}")
        await meta_api.enviar_texto(phone, "Desculpe, ocorreu um erro. Tente novamente em instantes.")


@app.post("/webhook/twilio")
async def webhook_twilio(request: Request):
    """Recebe mensagens do WhatsApp via Twilio."""
    try:
        form = await request.form()
    except Exception:
        return Response(status_code=400)

    phone = str(form.get("From", ""))       # ex: whatsapp:+5521999999999
    body = str(form.get("Body", "")).strip()
    nome = str(form.get("ProfileName", "Paciente")) or "Paciente"
    msg_type = str(form.get("MessageType", "text"))

    if not phone:
        return Response(status_code=200)

    # Normaliza: remove prefixo whatsapp: para uso interno
    phone_key = phone.replace("whatsapp:", "")

    if not agente_ativo(phone_key):
        return Response(status_code=200)

    if msg_type == "text" and body:
        adicionar_ao_buffer_twilio(phone_key, phone, nome, body)
    elif msg_type == "audio":
        adicionar_ao_buffer_twilio(phone_key, phone, nome, "[áudio recebido — transcrição indisponível]")
    elif msg_type == "image":
        caption = str(form.get("Body", ""))
        adicionar_ao_buffer_twilio(phone_key, phone, nome, f"[imagem recebida{': ' + caption if caption else ''}]")

    # Twilio espera resposta vazia (reply via API, não via TwiML)
    return Response(status_code=200)


def adicionar_ao_buffer_twilio(phone_key: str, phone_full: str, nome: str, texto: str):
    if phone_key not in _buffers:
        _buffers[phone_key] = []
    _buffers[phone_key].append({"type": "text", "content": texto})
    tarefa = _buffer_tasks.get(phone_key)
    if tarefa is None or tarefa.done():
        _buffer_tasks[phone_key] = asyncio.create_task(
            _processar_buffer_twilio(phone_key, phone_full, nome)
        )


async def _processar_buffer_twilio(phone_key: str, phone_full: str, nome: str):
    await asyncio.sleep(BUFFER_DELAY)

    mensagens = _buffers.pop(phone_key, [])
    if not mensagens or not agente_ativo(phone_key):
        return

    texto_consolidado = "\n".join(f"[{m['type'].upper()}]: {m['content']}" for m in mensagens)

    try:
        paciente = await obter_paciente(phone_key, nome)
        paciente_id = paciente["id"] if paciente else None
        paciente_nome = paciente["nome"] if paciente else nome

        resposta = await processar(
            phone=phone_key,
            paciente_id=paciente_id,
            paciente_nome=paciente_nome,
            mensagem_usuario=texto_consolidado,
            disable_agent_fn=_disable_agent_fn,
        )

        await twilio_wa.enviar_resposta_humanizada(phone_full, resposta)

    except Exception as e:
        import traceback
        print(f"[Erro Twilio] {e}\n{traceback.format_exc()}")
        await twilio_wa.enviar_texto(phone_full, "Desculpe, ocorreu um erro. Tente novamente em instantes.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
