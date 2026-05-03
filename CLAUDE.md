@AGENTS.md

# PsiPlanner — Guia para Assistentes de IA

**PsiPlanner** é uma plataforma SaaS para profissionais de saúde (psicólogos, nutricionistas, médicos, etc.) gerenciarem consultas, pacientes, recibos e finanças. Inclui um agente de agendamento com IA multicanal chamado "July", que agenda sessões via WhatsApp, Telegram e chat web.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | React 19, Tailwind CSS 4, Lucide Icons |
| Banco de Dados | PostgreSQL (Railway) via driver `pg` puro — **sem ORM** |
| Auth | NextAuth v5 (Credentials + JWT), HMAC-SHA256 (admin), Bearer token (API do agente) |
| IA | Anthropic API (`@ai-sdk/anthropic`), Vercel AI SDK |
| E-mail | Nodemailer (SMTP) |
| PDF | jsPDF + html2canvas |
| Pagamentos | Asaas (gerenciamento de assinaturas) |
| Mensageria | WAHA, Evolution API (WhatsApp), Telegram, Twilio |
| Agente IA | Python FastAPI (serviço separado no Render) |

---

## Estrutura do Projeto

```
psico-agenda/
├── src/
│   ├── app/
│   │   ├── (auth)/          # login, register, recuperação de senha
│   │   ├── (dashboard)/     # rotas protegidas (auth + verificação de assinatura)
│   │   │   ├── agenda/      # visualização semanal do calendário
│   │   │   ├── pacientes/   # CRUD de pacientes + páginas de detalhe
│   │   │   ├── recibos/     # geração de recibos em PDF
│   │   │   ├── financeiro/  # resumo mensal, exportação CSV
│   │   │   └── perfil/      # configuração do perfil
│   │   ├── admin/           # painel administrativo (auth HMAC)
│   │   ├── planos/          # planos de assinatura
│   │   ├── agendar/[id]/    # chat público de agendamento com IA
│   │   └── api/
│   │       ├── auth/        # register, forgot-password, reset-password, [...nextauth]
│   │       ├── agente/      # API do agente (Bearer auth): horarios, paciente, sessao
│   │       ├── sessoes/     # CRUD de sessões + transcrição
│   │       ├── pacientes/   # CRUD de pacientes
│   │       ├── recibos/     # geração de recibos
│   │       ├── pagamento/   # checkout Asaas, status, webhook
│   │       ├── admin/       # stats e gerenciamento de usuários
│   │       └── agendar/chat/# endpoint do chat público de agendamento
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── GravadorConsulta.tsx  # gravação de áudio + transcrição
│   │   ├── Providers.tsx
│   │   └── ui/              # badge, spinner, stat-card, page-header
│   ├── lib/
│   │   ├── db.ts            # pool PostgreSQL
│   │   ├── auth.ts          # configuração NextAuth
│   │   ├── auth.config.ts   # middleware de autorização
│   │   ├── agente-auth.ts   # validação do Bearer token
│   │   ├── admin-auth.ts    # token HMAC-SHA256 para admin
│   │   ├── ensure-schema.ts # migrações lazy de schema
│   │   ├── email.ts         # helpers Nodemailer
│   │   ├── rateLimit.ts     # sliding window em memória
│   │   ├── mockData.ts      # modo demo (sem DATABASE_URL)
│   │   └── utils.ts
│   ├── types/
│   │   ├── psico.ts         # definições de tipos principais
│   │   └── next-auth.d.ts   # tipos de sessão aumentados
│   └── globals.css          # tokens de design como variáveis CSS
├── agente/                  # Agente Python FastAPI (July)
│   ├── main.py              # app FastAPI + buffer de mensagens
│   ├── agent.py             # integração Claude + uso de ferramentas
│   ├── tools.py             # definições das ferramentas (chama /api/agente/*)
│   ├── meta.py              # system prompt + metadados do agente
│   ├── evolution.py / waha.py / telegram.py / twilio_wa.py
│   └── render.yaml
├── SCHEMA.sql               # schema PostgreSQL canônico (Railway)
├── DESIGN.md                # referência completa do design system
└── next.config.ts           # headers de segurança, padrões de imagem
```

---

## Convenções de Banco de Dados

- **Sem ORM.** Todas as queries usam SQL puro via o pool `pg` exportado de `src/lib/db.ts`.
- Importe o pool com `import pool from '@/lib/db'` e use `pool.query(sql, params)`.
- Sempre use queries parametrizadas — nunca interpole input do usuário em strings SQL.
- **Migrações de schema** são aplicadas de forma lazy na primeira requisição via `src/lib/ensure-schema.ts`. Mantenha migrações idempotentes (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`).
- **Soft deletes** — linhas de pacientes e sessões têm coluna `deleted_at`. Sempre filtre `WHERE deleted_at IS NULL` ao listar registros.
- **Modo demo** — quando `DATABASE_URL` está vazio, o app usa `src/lib/mockData.ts`. Rotas de API devem tratar o caso demo graciosamente.

### Tabelas Principais

| Tabela | Colunas Chave |
|---|---|
| `psicologos` | `id` (UUID PK), `email`, `password_hash`, `nome`, `crp`, `plano`, `trial_fim` |
| `pacientes` | `id`, `psicologo_id`, `nome`, `cpf`, `email`, `telefone`, `valor_sessao`, `deleted_at` |
| `sessoes` | `id`, `psicologo_id`, `paciente_id`, `data_hora`, `duracao_min`, `valor`, `status`, `pagamento_status`, `deleted_at` |
| `recibos` | `id`, `psicologo_id`, `paciente_id`, `sessao_id`, `numero`, `data_emissao`, `valor` |
| `chat_history` | `id`, `psicologo_id`, `paciente_id`, `role`, `content`, `created_at` |
| `payments` | `id`, `psicologo_id`, `mercado_pago_payment_id`, `amount_brl`, `status` |

Valores de `status` em sessões: `agendado` | `realizado` | `cancelado` | `faltou`

---

## Camadas de Autenticação

Três mecanismos de auth coexistem:

| Escopo | Mecanismo | Arquivo chave |
|---|---|---|
| Usuários regulares | NextAuth v5 JWT (Credentials) | `src/lib/auth.ts` |
| Painel admin | Cookie HMAC-SHA256 (derivado de `ADMIN_MASTER_KEY`) | `src/lib/admin-auth.ts` |
| API do agente (`/api/agente/*`) | Bearer token (`AGENTE_API_KEY`) | `src/lib/agente-auth.ts` |

- Comparações de token admin e agente usam igualdade timing-safe para prevenir ataques de timing.
- O layout do dashboard em `src/app/(dashboard)/layout.tsx` aplica verificações de sessão + assinatura.
- Rotas públicas: `/`, `/login`, `/register`, `/recuperar-senha`, `/nova-senha`, `/planos`, `/agendar/[id]`, `/api/health`.

---

## Convenções das Rotas de API

- Todas as rotas de API ficam em `src/app/api/` e usam Route Handlers do Next.js (`export async function GET/POST/PATCH/DELETE`).
- Valide a autenticação no topo de cada handler; retorne `401`/`403` antes de acessar o banco.
- Retorne JSON com formato consistente: `{ data }` no sucesso, `{ error: string }` no erro.
- Rate limiting (`src/lib/rateLimit.ts`) é aplicado no endpoint de registro — em memória, sem Redis.
- Use `NextResponse.json(...)` para respostas.

---

## Variáveis de Ambiente

**Frontend (`.env.local`):**
```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
AGENTE_API_KEY=<compartilhado com o agente>
ADMIN_MASTER_KEY=<segredo HMAC>
AUTH_SECRET=<segredo JWT NextAuth>
NEXTAUTH_URL=https://psiplanner.com.br
SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_PORT / SMTP_SECURE
EMAIL_FROM=noreply@psiplanner.com.br
DATABASE_SSL=strict   # opcional: forçar validação de certificado TLS
```

**Agente Python (`.env`):**
```
ANTHROPIC_API_KEY=sk-ant-...
PSICO_API_URL=https://www.psiplanner.com.br
AGENTE_API_KEY=<igual ao de cima>
PSICOLOGO_ID=<UUID>
WAHA_URL / WAHA_API_KEY
TELEGRAM_TOKEN / TELEGRAM_WEBHOOK_SECRET
BUFFER_DELAY=3   # segundos para agrupar mensagens recebidas
```

---

## Design System

Veja `DESIGN.md` para a especificação completa. Regras principais:

- **Tokens de cor** são definidos como variáveis CSS em `src/globals.css`. Use classes utilitárias do Tailwind que mapeiam para eles; evite valores hex arbitrários.
- **Paleta azul primária:** `#1e3a8a` (âncora/sidebar), `#2563eb` (botões CTA/ativo), `#3b82f6` (ícones/acentos).
- **Tipografia:** sans-serif do sistema (`Inter` / `system-ui`) para toda a UI; `font-bold` para valores KPI e títulos de página; `font-semibold` para cabeçalhos de seção e labels de navegação.
- **Botões:**
  - Primário: `bg-blue-600 text-white hover:bg-blue-700`
  - Secundário: `border border-blue-600 text-blue-600 hover:bg-blue-50`
  - Destrutivo: `bg-red-500 text-white hover:bg-red-600`
- **Cores de status:** verde (`#10b981`) = realizado/ativo; âmbar (`#f59e0b`) = trial/aviso; vermelho (`#ef4444`) = cancelado/erro.
- Linguagem inclusiva — todo o texto se refere a "profissional de saúde", não apenas "psicólogo".

---

## Padrões de Desenvolvimento

1. **Path alias** — sempre importe com `@/` (ex.: `@/lib/db`, `@/components/Sidebar`).
2. **Sem ORM** — apenas SQL puro; mantenha queries próximas ao route handler que as usa.
3. **Guard de modo demo** — verifique `process.env.DATABASE_URL` ou trate o erro do pool; retorne dados mock quando ausente.
4. **Migrações lazy** — ao adicionar colunas/tabelas, adicione-as em `ensure-schema.ts` com guards `IF NOT EXISTS`; não dependa de execuções únicas de migração.
5. **Soft deletes** — nunca faça `DELETE` em linhas de pacientes ou sessões; defina `deleted_at = NOW()` e filtre nas leituras.
6. **Geração de PDF** — `jsPDF` + `html2canvas` são usados no lado cliente em `src/app/(dashboard)/recibos/page.tsx`; não mova isso para o servidor.
7. **Transcrição de áudio** — tratada via `POST /api/sessoes/[id]/transcrever`; o componente `GravadorConsulta` gerencia o estado da gravação.
8. **Buffer de mensagens (agente)** — o agente Python agrupa mensagens recebidas por `BUFFER_DELAY` segundos antes de enviar ao Claude, para lidar com envios rápidos de múltiplas mensagens.

---

## Agente Python (July)

Localizado em `/agente/`. Implantado separadamente no Render.

- **`main.py`** — app FastAPI; rotas para WhatsApp (WAHA/Evolution), Telegram e web; lógica de buffer de mensagens.
- **`agent.py`** — Chama a API Claude com uso de ferramentas; orquestra o fluxo de agendamento.
- **`tools.py`** — Definições de ferramentas que chamam `/api/agente/horarios`, `/api/agente/paciente`, `/api/agente/sessao`.
- **`meta.py`** — System prompt e metadados do agente.
- Integrações de canal: `waha.py`, `evolution.py`, `telegram.py`, `twilio_wa.py`.

Ao modificar ferramentas do agente, mantenha os schemas em `tools.py` sincronizados com as rotas de API correspondentes em `src/app/api/agente/`.

---

## Implantação

| Serviço | Plataforma | Observações |
|---|---|---|
| Frontend Next.js | Vercel | Deploy automático do branch principal |
| Agente Python | Render | Config em `agente/render.yaml` |
| PostgreSQL | Railway | String de conexão em `DATABASE_URL` |

---

## Sem Testes Automatizados

Não há suite de testes automatizados. Verifique mudanças manualmente usando o modo demo (remova `DATABASE_URL`) e contra um banco de dados de staging antes de implantar.
