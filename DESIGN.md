# Design System: PsiPlanner
**Projeto:** Plataforma SaaS de Gestão para Profissionais de Saúde

---

## 1. Visual Theme & Atmosphere

**Sereno, Clínico e Confiável.**

PsiPlanner adota uma estética de SaaS de saúde moderno — organizado, profissional e humano ao mesmo tempo. O visual comunica confiança e clareza, sem ser frio ou impessoal. O fundo branco puro com acentos em azul cria uma sensação de limpeza clínica que remete a ambientes de saúde, enquanto toques de azul-marinho profundo ancoram hierarquia e autoridade. O espaçamento generoso e a tipografia leve transmitem leveza e redução de carga cognitiva — alinhado ao propósito da plataforma: menos papelada, mais foco no paciente.

---

## 2. Color Palette & Roles

| Nome Descritivo | Hex | Papel Funcional |
|---|---|---|
| **Azul Âncora** | `#1e3a8a` | Backgrounds primários (sidebar, hero, cabeçalhos escuros) |
| **Azul Autoridade** | `#1d4ed8` | Hover em elementos primários, botões secundários |
| **Azul Ação** | `#2563eb` | Botões CTA, links ativos, badges de destaque |
| **Azul Clareza** | `#3b82f6` | Ícones ativos, acentos interativos, item ativo da sidebar |
| **Azul Suave** | `#93c5fd` | Textos secundários em fundos escuros |
| **Azul Névoa** | `#dbeafe` | Hover em cards, badges informativos |
| **Azul Gelo** | `#eff6ff` | Backgrounds de ícone containers, seções alternativas |
| **Cinza Profundo** | `#0f172a` | Títulos principais, valores de KPI |
| **Cinza Sombra** | `#334155` | Textos de corpo, labels de formulário |
| **Cinza Médio** | `#64748b` | Textos secundários, subtítulos |
| **Cinza Claro** | `#94a3b8` | Metadados, rodapés, placeholders |
| **Cinza Borda** | `#e2e8f0` | Bordas de cards, divisores |
| **Cinza Superfície** | `#f1f5f9` | Backgrounds de seção alternativa |
| **Branco Puro** | `#ffffff` | Background principal, cards, formulários |
| **Verde Sucesso** | `#10b981` | Status "realizado", confirmações, ativo |
| **Âmbar Alerta** | `#f59e0b` | Avisos de trial, notificações de atenção |
| **Vermelho Erro** | `#ef4444` | Erros, validações negativas |

---

## 3. Typography Rules

**Família:** Sans-serif do sistema (`Inter`, `Segoe UI`, `system-ui`) para toda interface. Serif (`Georgia`) reservado para citações no painel lateral de autenticação.

**Hierarquia de Peso:**
- `font-bold` (700) — Títulos de página, valores KPI, nomes em destaque
- `font-semibold` (600) — Subtítulos de seção, labels nav, botões
- `font-medium` (500) — Labels de formulário, itens de lista
- `font-normal` (400) — Corpo de texto, descrições

**Escala Tipográfica:**
- `text-6xl/text-5xl` — Hero headline (landing apenas)
- `text-3xl` — Títulos de seção (h2)
- `text-2xl` — Títulos de página, KPIs
- `text-xl` — Subtítulos de card
- `text-sm` — Labels, metadados
- `text-xs` + `uppercase` + `tracking-widest` — Badges de categoria exclusivamente

---

## 4. Component Stylings

### Botões
- **Primário:** `bg-[#2563eb]` texto branco, `rounded-xl`, hover `bg-[#1d4ed8]`, transição 150ms
- **Secundário:** `bg-[#eff6ff]` texto `#2563eb`, borda `#dbeafe`, hover `bg-[#dbeafe]`
- **Ghost:** `border border-[#e2e8f0]` texto `#334155`, hover `bg-[#f1f5f9]`
- **Tamanhos:** `px-5 py-2.5` (padrão) · `px-8 py-4` (CTA hero)

### Cards / Containers
- `rounded-2xl` — nunca reto, nunca pílula
- `bg-white border border-[#e2e8f0] shadow-sm` — padrão
- Hover: `shadow-md` — elevação suave
- Cards premium: `bg-[#1e3a8a]` texto branco

### Inputs / Forms
- `bg-white border border-[#e2e8f0] rounded-xl`
- Focus: `ring-2 ring-[#2563eb] border-[#2563eb]`
- Placeholder: `text-[#94a3b8]`
- Label: `text-sm font-medium text-[#334155]`

### Badges / Pills
- Sempre `rounded-full`
- Info: `bg-[#eff6ff] text-[#2563eb]`
- Sucesso: `bg-green-50 text-green-700`
- Alerta: `bg-amber-50 text-amber-700`
- Erro: `bg-red-50 text-red-600`

### Sidebar
- Fundo: `bg-[#1e3a8a]` (Azul Âncora)
- Item ativo: `bg-[#3b82f6] text-white`
- Item inativo: `text-[#93c5fd] hover:bg-white/10 hover:text-white`
- Logo icon: container `bg-[#3b82f6] rounded-xl`

### KPI Cards (Dashboard)
- `bg-white border border-[#e2e8f0] shadow-sm rounded-2xl p-5`
- Ícone container: `bg-[#eff6ff] rounded-xl p-3`
- Ícone: `text-[#2563eb]`
- Valor: `text-2xl font-bold text-[#0f172a]`
- Label: `text-xs uppercase tracking-wide text-[#64748b]`

---

## 5. Layout Principles

- **Espaçamento:** `p-6` (cards), `py-24` (seções landing), `px-6` (margens laterais)
- **Máximos:** `max-w-6xl` (geral), `max-w-2xl` (formulários/planos), `max-w-7xl` (wide)
- **Grid:** Mobile-first. KPIs: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`. Split: `lg:grid-cols-2`
- **Ritmo:** Seções alternam `bg-white` ↔ `bg-[#f1f5f9]` sem bordas extras
- **Radius:** `rounded-xl` (botões, inputs) e `rounded-2xl` (cards) — nunca misturar
- **Header:** `bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] shadow-sm` sticky

---

## 6. Linguagem & Inclusividade

A plataforma atende **todos os profissionais de saúde**: psicólogos, nutricionistas, médicos, endocrinologistas, fisioterapeutas, fonoaudiólogos e outros.

| ❌ Específico | ✅ Inclusivo |
|---|---|
| "Psicólogo(a)" em títulos | "Profissional de saúde" |
| "Consulta Psicológica" genérico | "Consulta" |
| "Desenvolvido para psicólogos" | "Para profissionais de saúde" |
| "Gestão psicológica" | "Gestão em saúde" |
| "CRP" em campos genéricos | "Registro profissional (CRM, CRP, CRN...)" |
