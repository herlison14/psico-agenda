# Configuração do n8n — Agente Psico-Agenda

## 1. Importar os workflows

**Importar nesta ordem:**

1. `notificar_psicologa_n8n.json` — importar **primeiro**, anotar o ID gerado
2. `agente_psico_agenda_n8n.json` — importar em seguida

No n8n: **Settings → Import workflow → selecionar o arquivo**

> Após importar o sub-workflow, copie o ID dele e cole em `NOTIFY_HUMAN_WORKFLOW_ID`.

---

## 2. Variáveis de ambiente no n8n

Configurar em: **Settings → Environment Variables**

| Variável | Valor | Descrição |
|---|---|---|
| `PSICO_API_URL` | `https://psiplanner.com.br` | URL do psico-agenda em produção (sem `/` no final) |
| `AGENTE_API_KEY` | (mesma do `.env.local`) | Chave de autenticação dos endpoints `/api/agente/*` |
| `PSICOLOGO_ID` | UUID do psicólogo | Pegar no banco: `SELECT id FROM psicologos LIMIT 1` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Chave da API Anthropic |
| `EVOLUTION_API_KEY` | chave da Evolution API | Para envio de mensagens WhatsApp |
| `REDIS_HOST` | `redis://...` ou IP | Host do Redis |
| `NOTIFY_HUMAN_WORKFLOW_ID` | ID do sub-workflow | Pegar após importar `notificar_psicologa_n8n.json` |
| `PSICOLOGA_PHONE` | `5521999999999` | WhatsApp da psicóloga (com DDI, sem +) |
| `EVOLUTION_INSTANCE_ID` | nome da instância | Instância Evolution API padrão do agente |

---

## 3. Credenciais no n8n

Configurar em: **Credentials → New**

| Nome usado no workflow | Tipo | Dados |
|---|---|---|
| `Anthropic` | Anthropic API | `ANTHROPIC_API_KEY` |
| `OpenAI` | OpenAI API | Chave OpenAI (só para Whisper/transcrição de áudio) |
| `Redis` | Redis | Host + porta do Redis |
| `Postgres` | PostgreSQL | Mesma `DATABASE_URL` do Railway |

---

## 4. Executar a migration no banco

Rodar o arquivo `migration_chat_history.sql` no PostgreSQL do Railway:

```
psql $DATABASE_URL -f migration_chat_history.sql
```

Ou colar o conteúdo diretamente no painel de queries do Railway.

---

## 5. Testar os endpoints

```bash
# Verificar horários
curl -H "Authorization: Bearer SUA_AGENTE_API_KEY" \
  "https://psiplanner.com.br/api/agente/horarios?psicologo_id=UUID"

# Buscar paciente por telefone
curl -H "Authorization: Bearer SUA_AGENTE_API_KEY" \
  "https://psiplanner.com.br/api/agente/paciente?phone=5521999999999&psicologo_id=UUID"
```

---

## 6. Fluxo completo

```
Paciente WhatsApp
    ↓
Evolution API → n8n Webhook
    ↓
Agente Sofia (Claude claude-opus-4-6)
    ├── verificar_horarios     → GET /api/agente/horarios
    ├── agendar_sessao         → POST /api/agente/sessao
    ├── buscar_proxima_sessao  → GET /api/agente/sessao/:id?tipo=proxima
    ├── cancelar_ou_reagendar  → PATCH /api/agente/sessao/:id
    └── notificar_psicologa    → sub-workflow n8n
    ↓
Humanizar resposta → Enviar WhatsApp (Evolution API)
```

---

## Obs: transcrição de áudio

O nó **Transcrever Áudio** usa OpenAI Whisper (pt-BR).
Claude não possui API de transcrição de áudio — este nó deve permanecer com OpenAI.
