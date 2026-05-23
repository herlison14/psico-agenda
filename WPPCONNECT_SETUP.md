# WPPConnect Server — Deploy no Railway (gratuito)

Guia para subir o servidor WPPConnect no Railway e conectar ao PsiPlanner.

---

## 1. Subir o WPPConnect Server no Railway

### Opção A — Deploy via template (mais fácil)

1. Acesse: https://railway.app/new
2. Clique em **"Deploy from GitHub repo"**
3. Cole a URL: `https://github.com/wppconnect-team/wppconnect-server`
4. Railway detecta automaticamente e faz o build

### Opção B — Fork + Railway

1. Faça fork de: https://github.com/wppconnect-team/wppconnect-server
2. No Railway → New Project → Deploy from GitHub → selecione seu fork

---

## 2. Configurar variáveis de ambiente no Railway

No painel do Railway → seu serviço WPPConnect → **Variables**:

```
PORT=21465
SECRET_KEY=psiplanner-secret-troque-isso
WEBHOOK_URL=
```

> `SECRET_KEY` é usado para gerar tokens. Escolha uma string longa e aleatória.

---

## 3. Obter a URL pública

No Railway → seu serviço → **Settings** → **Domains** → clique em **Generate Domain**.

Você receberá uma URL como: `https://wppconnect-xxx.up.railway.app`

---

## 4. Criar a sessão e obter o token

Com o servidor rodando, gere o token via curl:

```bash
curl -X POST https://SEU_DOMINIO.railway.app/api/psiplanner/SEU_SECRET_KEY/generate-token
```

Substitua:
- `SEU_DOMINIO.railway.app` — URL gerada no passo 3
- `SEU_SECRET_KEY` — o valor que você definiu em `SECRET_KEY`
- `psiplanner` — nome da sessão (você escolhe)

Resposta esperada:
```json
{
  "status": "Success",
  "session": "psiplanner",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Copie o `token` — ele é o `WPPCONNECT_TOKEN`.

---

## 5. Conectar o WhatsApp (escanear QR Code)

```bash
curl -X POST https://SEU_DOMINIO.railway.app/api/psiplanner/start-session \
  -H "Authorization: Bearer SEU_TOKEN"
```

Depois acesse no navegador:
```
https://SEU_DOMINIO.railway.app/api/psiplanner/qrcode-session
```

Escaneie o QR Code com o WhatsApp do número que enviará os lembretes.

> ⚠️ Use um número de WhatsApp **dedicado** (não o seu pessoal), pois automações podem resultar em banimento temporário pelo Meta.

---

## 6. Configurar as variáveis no Vercel

No Vercel Dashboard → seu projeto → **Settings** → **Environment Variables**:

| Variável | Valor | Ambientes |
|----------|-------|-----------|
| `WPPCONNECT_URL` | `https://SEU_DOMINIO.railway.app` | Production, Preview |
| `WPPCONNECT_SESSION` | `psiplanner` | Production, Preview |
| `WPPCONNECT_TOKEN` | `eyJ...` (token do passo 4) | Production, Preview |
| `CRON_SECRET` | *(string aleatória — `openssl rand -base64 32`)* | Production |

Marque todos como **Sensitive** (🔒).

---

## 7. Testar manualmente o cron

Após configurar, dispare o cron manualmente para testar:

```bash
curl -H "Authorization: Bearer SEU_CRON_SECRET" \
  https://www.psiplanner.com.br/api/cron/lembretes
```

Resposta esperada:
```json
{ "ok": true, "total": 2, "enviados": 2, "falhas": 0 }
```

---

## Manutenção

- A sessão do WhatsApp expira se o celular ficar offline por muito tempo
- Se parar de funcionar, repita o passo 5 (reconectar via QR Code)
- O Railway mantém o container ativo — mas no plano gratuito pode hibernar após inatividade

---

## Alternativas se o Railway hibernar

- **Render** (free tier com sleep): https://render.com
- **Fly.io** (free tier): https://fly.io
- **VPS própria** (DigitalOcean $6/mês, Hostinger, etc.)
