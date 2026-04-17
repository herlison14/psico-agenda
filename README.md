# PsiPlanner

Sistema de gestão de agenda e recibos para psicólogos. MVP completo com agenda semanal, cadastro de pacientes, geração de recibo PDF e exportação para Carnê-Leão.

**Produção:** https://www.psiplanner.com.br

## Stack

- Next.js 14 + TypeScript + Tailwind CSS
- Supabase (banco de dados + autenticação)
- jsPDF (geração de recibo em PDF)
- date-fns com locale pt-BR

## Setup

### 1. Criar projeto no Supabase

Acesse [supabase.com](https://supabase.com) e crie um novo projeto.

### 2. Executar o schema SQL

No painel do Supabase, acesse **SQL Editor** e execute o conteúdo do arquivo `SUPABASE_SCHEMA.sql`.

### 3. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha `.env.local` com os valores do seu projeto Supabase (Settings -> API):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

### 5. Deploy no Vercel

1. Faça push do projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy!

## Funcionalidades

- **Login** — cadastro e login com email/senha via Supabase Auth
- **Perfil** — dados do psicólogo usados nos recibos (nome, CRP, CPF, endereço)
- **Pacientes** — CRUD completo com busca
- **Agenda** — visualização semanal, agendamento, marcar realizado/cancelado
- **Recibos** — geração de PDF profissional com valor por extenso
- **Financeiro** — resumo mensal e exportação CSV para Carnê-Leão

## Carnê-Leão

O CSV exportado pela página Financeiro contém as colunas:
`Data, Nome do Paciente, CPF do Paciente, Valor, Descricao`

Formato compatível para declaração de rendimentos de autônomo no Carnê-Leão.
