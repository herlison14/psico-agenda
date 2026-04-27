# Design System: PsiPlanner
**Project:** psico-agenda · SaaS de gestão para psicólogos brasileiros

---

## 1. Visual Theme & Atmosphere

**Calm Authority.** O PsiPlanner comunica confiança e tranquilidade — as qualidades centrais de um bom terapeuta. A paleta vem da floresta: verdes profundos e terrosos que transmitem seriedade sem intimidar, sobre fundos creme que aquecem sem distrair.

A densidade é **moderada-baixa**: muito espaço em branco, seções bem separadas, hierarquia clara. Não é austero como um sistema médico, nem lúdico como um app de fitness. É o meio-termo certo: profissional, humano, tranquilo.

---

## 2. Color Palette & Roles

### Verdes Primários (Floresta)
- **Deep Forest** (`#1B3A2F`) — Cor de marca. Fundos de hero, sidebar, header de chat, botões primários. Âncora visual do sistema.
- **Forest Mid** (`#244D3F`) — Estado hover dos elementos Forest. Aprofunda sem chocar.
- **Forest Light** (`#2D6A52`) — Links internos, texto de destaque sobre fundos claros, rótulos secundários.

### Verdes de Ação (Sage)
- **Sage** (`#5A9E7C`) — CTA principal, ícones ativos, indicador de status online, stars de rating. O "sim" visual do sistema.
- **Sage Dark** (`#4A8E6C`) — Hover do Sage. Pressão controlada.
- **Sage Light** (`#A8D5BC`) — Texto sobre fundos Forest. Legível sem brilhar.
- **Sage Pale** (`#EBF5EF`) — Backgrounds de ícones, badges, botões ghost. Tom de respiro.
- **Sage Border** (`#C8E6D4`) — Bordas de elementos com contexto verde. Muito suave.

### Neutros Quentes (Creme & Terra)
- **Cream** (`#F7F5F0`) — Background global. Quente, não branco puro. Reduz fadiga visual.
- **Cream Mid** (`#F0EDE7`) — Hover de linhas de lista, divisores internos de card, fundo de mensagem do agente.
- **Warm Border** (`#E8E3DB`) — Bordas de cards, separadores de seção. Tom padrão de contorno.
- **Input Border** (`#D4CFC6`) — Bordas de campos de formulário no estado normal.

### Texto
- **Primary Text** (`#1C2B22`) — Títulos H1/H2, valores numéricos, labels principais. Verde-escuro quase preto.
- **Secondary Text** (`#3D5247`) — Labels de formulário, itens de lista, texto de card.
- **Body Text** (`#5A7268`) — Parágrafos longos, descrições de funcionalidades.
- **Tertiary Text** (`#7A8C82`) — Metadata, timestamps, textos de apoio.
- **Muted Text** (`#A8BFB2`) — Footer, placeholders desativados, textos legais.
- **Placeholder** (`#B0ABA3`) — Placeholder de inputs.

---

## 3. Typography Rules

**Dois papéis, dois tipos.**

- **Inter** (sans-serif) — Usado em todo o corpo de texto, UI, botões, badges, formulários e navegação. Peso padrão `font-normal` (400), `font-medium` (500) para labels e navegação, `font-semibold` (600) para títulos de card e nomes, `font-bold` (700) para headings de seção e KPIs.

- **Lora** (serif, `var(--font-lora, Georgia, serif)`) — Reservado para momentos de calor humano: títulos de login/register (`text-2xl font-semibold`), citações e blockquotes. Cria contraste emocional com a objetividade do Inter.

**Hierarquia de tamanhos:**
- Hero H1: `text-4xl` → `text-5xl` → `text-6xl` (responsivo)
- Section H2: `text-3xl font-bold`
- Card H3: `text-base font-semibold`
- Body: `text-sm` a `text-base`, `leading-relaxed`
- Metadata: `text-xs`

**Letter-spacing:** Badges e labels de seção usam `tracking-widest uppercase text-xs` em Sage — cria ritmo visual entre títulos grandes.

---

## 4. Component Stylings

### Botões

- **Primário Forest:** `bg-[#1B3A2F] text-white px-8 py-3.5 rounded-xl font-medium hover:bg-[#244D3F]` — Ação principal (login, submit). Sem sombra.
- **Primário Sage:** `bg-[#5A9E7C] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#4A8E6C]` — CTA de conversão (criar conta, assinar). Levemente maior, mais impacto.
- **Ghost Verde:** `bg-[#EBF5EF] text-[#2D6A52] py-3.5 rounded-xl font-semibold hover:bg-[#D4EDDF]` — Ação secundária (trial, alternativas). Amigável, sem peso.
- **Ghost Neutro:** `bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl` — Sobre fundos escuros (hero). Transparência discreta.

**Geometria:** Todos os botões usam `rounded-xl` — cantos generosamente arredondados. Consistente com a identidade acolhedora. Nenhum botão é pill (`rounded-full`) — mantém seriedade profissional.

### Cards / Containers

- **Card padrão:** `bg-white rounded-2xl border border-[#E8E3DB] shadow-sm` — Base do sistema. Fundo branco sobre creme cria contraste suave.
- **Card escuro (pricing Pro):** `bg-[#1B3A2F] rounded-2xl shadow-xl` — Destaque máximo, sombra pronunciada para flutuar.
- **Card de depoimento:** `bg-white/10 backdrop-blur rounded-2xl border border-white/10` — Glassmorphism leve sobre fundo Forest.
- **Container de seção:** `bg-white border-y border-[#E8E3DB]` — Alternância entre creme e branco para ritmo de scroll.

**Hover em cards:** `hover:shadow-md transition-shadow` — Eleva sutilmente ao hover, indica interatividade sem exagero.

### Inputs / Formulários

- **Input padrão:** `bg-white border border-[#D4CFC6] rounded-xl px-4 py-3 text-sm` 
- **Focus:** `focus:ring-2 focus:ring-[#5A9E7C] focus:border-transparent outline-none` — Anel verde sage, sem borda dupla.
- **Placeholder:** `placeholder:text-[#B0ABA3]` — Muted warm gray.
- **Label:** `text-sm font-medium text-[#3D5247] mb-1.5` — Secondary text, peso médio.
- **Erro:** `bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm` — Vermelho padrão fora do sistema verde, mas respeitando o arredondamento.

### Ícones / Icon Wrappers

Os ícones nunca aparecem soltos. São sempre envolvidos em um container colorido:
- `bg-[#EBF5EF] rounded-xl p-2.5` com ícone `text-[#2D6A52]` — padrão de feature card
- `bg-[#1B3A2F] rounded-xl p-2` com ícone `text-white` — header, sidebar, logo

**Strokewidth:** Todos os ícones Lucide usam `strokeWidth={1.75}` (suave) ou `strokeWidth={1.5}` (logo). Nunca 2 ou mais — mantém leveza.

### Badges / Tags

- `bg-[#5A9E7C]/30 text-[#A8D5BC] border border-[#5A9E7C]/40 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase` — sobre fundo escuro
- `bg-[#EBF5EF] text-[#2D6A52] rounded-full px-3 py-1.5 text-xs font-semibold` — sobre fundo claro

### Navegação (Sidebar)

- Fundo: `bg-[#1B3A2F]`
- Item ativo: `bg-[#5A9E7C] text-white rounded-xl`
- Item inativo: `text-[#A8D5BC] hover:bg-[#244D3F] hover:text-white rounded-xl`
- Separadores: `border-[#244D3F]`

---

## 5. Layout Principles

**Generosidade vertical.** Seções principais usam `py-24` — 96px de respiro acima e abaixo. Isso cria pausas limpas entre os blocos de conteúdo, permitindo que cada seção "respire" e se comunique de forma independente.

**Largura máxima:** `max-w-6xl` (72rem/1152px) com `px-6` — largura confortável para leitura em desktop sem esticar demais o layout.

**Grid responsivo:** Seções de features usam `grid sm:grid-cols-2 lg:grid-cols-3 gap-6`. Pricing usa `grid sm:grid-cols-2 max-w-2xl mx-auto` — centralizado para não parecer esparso.

**Alternância de fundo:** As seções alternam entre `bg-[#F7F5F0]` (creme), `bg-white` e `bg-[#1B3A2F]` (dark). Cria ritmo visual sem precisar de ilustrações ou imagens.

**Hierarquia por densidade:** Hero denso (texto + stats + CTAs) → seções de features abertas → CTA final concentrado. O scroll é uma jornada de persuasão.

**Sticky header:** `sticky top-0 z-50 bg-white/90 backdrop-blur-md` — Header semi-transparente com blur. Presente sem bloquear o conteúdo.

**Espaçamento interno de cards:** `p-5` a `p-8` dependendo da importância do card. Cards de pricing usam `p-8` para dar peso ao conteúdo.

---

## 6. Motion & Interaction

- Todas as transições usam `transition-colors duration-150` ou `transition-shadow`
- Sem animações de entrada ou parallax — não é um portfólio, é uma ferramenta
- Botões têm `active:scale-[0.98]` — feedback tátil sutil
- FAQ accordion usa `transition-transform duration-200` no chevron — suave e funcional
- Loading states: `animate-bounce` nos dots do chat (delay escalonado), `animate-spin` no Loader2

---

## 7. Design Principles (Resumo para Prompting)

Use estas frases ao promptr Stitch para novas telas:

> *"Calm, trustworthy SaaS interface. Deep forest green (#1B3A2F) brand color on warm cream (#F7F5F0) backgrounds. Generously rounded corners (rounded-xl to rounded-2xl). Sage green (#5A9E7C) for actions and positive states. White cards with warm gray borders (#E8E3DB) and whisper-soft shadows. Inter for UI, Lora serif for emotional moments. Generous vertical padding. Semi-transparent sticky header with blur. Professional but human — not clinical."*
