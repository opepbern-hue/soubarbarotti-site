# Inventário de Conteúdo, Mídias e Especificação Técnica da Referência (Paragon Productions)

> Documento gerado na etapa **0. Antes de editar** do redesign para a branch `redesign-paragon` (tag base `pre-redesign-paragon`).
> Registra:
> 1. Associação completa entre rotas, componentes, textos e mídias do banco de dados (`src/lib/content.ts` / Prisma).
> 2. Medições reais computadas via Playwright em desktop (`1440×900`) e mobile (`390×844`) de todas as páginas de `https://www.paragonproductions.co/`.

---

## Parte 1 — Inventário do Site (`soubarbarotti.com.br`)

### 1.1. Rotas Públicas e Componentes Associados

| Rota | Arquivo de Página | Componentes e Dados (`src/lib/content.ts`) | Comportamento / Regras Preservadas |
| :--- | :--- | :--- | :--- |
| `/` | `src/app/(site)/page.tsx` | `getSettings()`, `getSections()`, `getProjects(true)`, `getProcessSteps()`, `getBrands()`, `getTestimonials()`, `getPlans()`, `getFaqs()`, `getPhotos('FOTO')` → Renderiza `Header`, `Main` (`Hero`, `BrandStrip`, `NumbersPhrase`, `WorksSection`, `ProcessList`, `About`, `Plans`*, `Testimonials`*, `Faq`*, `Contact`), `Footer`, `JsonLd` | Ordem dinâmica das seções controlada por `SectionConfig` (`order`, `enabled`), mantendo `BrandStrip` e `NumbersPhrase` logo após `Hero`. Seções sem itens reais (`Plans`, `Testimonials`) ficam ocultas. |
| `/portfolio` | `src/app/(site)/portfolio/page.tsx` | `getSettings()`, `getSection('trabalhos')`, `getProjects(true)` → Renderiza `Header`, `PortfolioGrid` (com `WorkCard`), `Footer`, `JsonLd` | Lista todos os 8 projetos publicados com filtro por categoria, alternância de visualização (`INDEX` / `GRID`), destaque de vídeo no topo e navegação para `/portfolio/[slug]`. |
| `/portfolio/[slug]` | `src/app/(site)/portfolio/[slug]/page.tsx` | `getSettings()`, `getProjectBySlug(slug)`, `getAdjacentProjects(slug)` → Renderiza `Header`, `ProjectStage`, `FullVideo`, blocos de texto (`brief`, `direction`, `production`, `finishing`), galeria (`FRAME` / `BASTIDOR`), créditos (`ProjectCredit`), projeto seguinte (`WorkRow`), `Footer`, `JsonLd` | `generateStaticParams` pré-gera os slugs publicados; mídias com `placeholder: true` e textos/créditos contendo `[PREENCHER` são filtrados e nunca exibidos no front. |
| `/fotos` | `src/app/(site)/fotos/page.tsx` | `getSettings()`, `getPhotos('FOTO')` → Renderiza `Header`, `PhotoGallery`, `Footer`, `JsonLd` | Exibe as 20 fotografias autorais reais em alta resolução (`isPlaceholder: false`), com lightbox, navegação por teclado (`Escape`, `ArrowLeft`, `ArrowRight`) e download quando `downloadable: true`. |
| `/artes` | `src/app/(site)/artes/page.tsx` | `getSettings()`, `getPhotos('ARTE')` → Renderiza `Header`, `PhotoGallery`, `Footer`, `JsonLd` | Exibe o acervo de direção de arte (`collection: 'ARTE'`). Atualmente possui 0 itens no banco (exibe estado vazio limpo sem placeholder). |
| `/privacidade` | `src/app/(site)/privacidade/page.tsx` | `getSettings()` → Renderiza `Header`, conteúdo integral de LGPD / Política de Privacidade, `Footer` | Preserva integralmente os direitos do titular, finalidade de coleta do formulário de contato, armazenamento local e canal do controlador (`settings.contactEmail`). |
| `not-found` | `src/app/not-found.tsx` | Página 404 global | Links de retorno para `/` e `/portfolio`. |
| `error` | `src/app/error.tsx` | Boundary de erro global (`'use client'`) | Botão `reset()` ("Tentar novamente") e link para `/`. |
| **Redirects (`next.config.ts`)** | `next.config.ts` | `/work` → `/portfolio`, `/work/:slug` → `/portfolio/:slug`, `/projects` → `/portfolio`, `/projects/:slug` → `/portfolio/:slug`, `/trabalhos` → `/portfolio`, `/trabalhos/:slug` → `/portfolio/:slug`, `/sobre` → `/#sobre`, `/about` → `/#sobre`, `/processo` → `/#processo`, `/process` → `/#processo`, `/contato` → `/#contato`, `/contact` → `/#contato`, `/servicos` → `/#processo`, `/services` → `/#processo`, `/faq` → `/#faq`, `/depoimentos` → `/#depoimentos`, `/planos` → `/#planos`, `/pricing` → `/#planos`, `/fotos-e-artes` → `/fotos`, `/galeria` → `/fotos`, `/gallery` → `/fotos`, `/privacy` → `/privacidade`, `/termos` → `/privacidade` | 100% preservados com `permanent: true`. |

---

### 1.2. Seções da Home na Ordem Atual e Associação com `SiteSettings` / `SectionConfig`

1. **Hero (`Hero.tsx` — `SectionConfig.id = "hero"`, `order = 1`, `enabled = true`)**
   - **Mídia de fundo (`settings.heroMedia`):** ID `cmuwwgwv10000vyp501t9gm2y` (`VIDEO`, `READY`, `1920×1080`, `33.1s`, arquivo `/media/cmuwwgwv10000vyp501t9gm2y/porsche-gt3-rs.webm`, variantes `720p_mp4`, `720p_webm`, `1080p_mp4`, `1080p_webm`, `poster`).
   - **Textos (`SiteSettings`):**
     - `heroLocation`: `"Palhoça, SC & Remoto"`
     - `heroTagline`: `"Direção cinematográfica e motion design com IA generativa para marcas e empreendedores que buscam alto padrão visual e conversão real."`
     - `heroList`: `["Comerciais de Alto Padrão", "Vídeos com IA & Motion Design", "Audiovisual Imobiliário", "Posicionamento de Autoridade", "Copy & Funis de Conversão"]`
   - **Equivalente na Referência (Paragon):** `section.home-hero_wrap` — faixa superior `#f8f8f8` com título gigante em máscara vazada (*knockout text*) revelando o vídeo em movimento, vídeo full-bleed (`100svh`), subtítulo condensado centralizado na base, botão retangular Coral Red (`#ff5b4b`) com borda `1px solid #100f0f` e metadados nos cantos inferiores.

2. **BrandStrip (`BrandStrip.tsx` — sempre após o Hero)**
   - **Dados (`getBrands()`):** 8 marcas cadastradas no banco:
     1. `Porsche` (`cmvgp6cc7001dll1dr3n11991`)
     2. `Anderson Empreendimentos` (`cmvgp6cd9001ell1d3f4a1994`)
     3. `Jéssica Fürst Imóveis` (`cmvgp6ce2001fll1ds7u18482`)
     4. `Tatiane Boing` (`cmvgp6ceu001gll1d8n928371`)
     5. `Arthur Empreendimentos` (`cmvgp6cfn001hll1dy5w19283`)
     6. `Edson Imóveis` (`cmvgp6cgf001ill1d4m192837`)
     7. `Miria Negócios Imobiliários` (`cmvgp6ch7001jll1d9k182736`)
     8. `Calebe` (`cmvgp6ci0001kll1d7h182735`)
   - **Equivalente na Referência (Paragon):** Marquee contínuo (`animation: translateX 20s linear infinite`) com tipografia técnica em caixa alta separada por `//` e `✦`.

3. **NumbersPhrase (`NumbersPhrase.tsx` — sempre após BrandStrip)**
   - **Dados (`SiteSettings`):**
     - `numbersUseCounters`: `false`
     - `numbersPhrase`: `"A IA gera as cenas. **Eu comando a direção, o motion design e a copy** para transformar a sua marca em um **filme que vende**."`
     - `numbersCounterText`: `"Mais de **{{20}}+ projetos** dirigidos e entregues com padrão cinematográfico."`
   - **Equivalente na Referência (Paragon):** Bloco editorial `WHAT WE DO` / `BUILT FOR THE CHASE` (fundo claro `#f8f8f8` com grid de 12 colunas, kicker técnico à esquerda e manifesto em tipografia condensada `H1`/`H2` + destaques em Coral Red `#ff5b4b`).

4. **Trabalhos Selecionados (`WorksSection.tsx` — `SectionConfig.id = "trabalhos"`, `order = 2`, `enabled = true`)**
   - **Textos (`SectionConfig`):**
     - `kicker`: `"[01 — Portfólio]"`
     - `titleLine1`: `"Trabalhos"`, `titleLine2`: `"Selecionados"`
     - `subtitle`: `"Projetos comerciais e filmes dirigidos com IA generativa, motion design e finalização cinematográfica."`
     - `ctaLabel`: `"Ver arquivo completo"`
   - **Dados (`getProjects(true)`):** 8 projetos publicados (detalhados na seção 1.3 abaixo).
   - **Equivalente na Referência (Paragon):** `section.featured-work_wrap` — fundo escuro `#100f0f`, título `FEATURED WORK` em escala Display (`156px` desktop / `60px` mobile), subtítulo alinhado à direita, grid de cards com bordas `1px solid rgba(248, 248, 248, 0.22)` (linha superior com 2 cards largos `span 3` de 6 colunas; linhas seguintes com 3 cards `span 2` de 6 colunas), vídeo tocando no hover com cursor flutuante, rodapé do card com título `28px` à esquerda, categoria à direita e `Cliente: ...` abaixo, mais barra inferior de largura total com link sublinhado e `✦` nas extremidades.

5. **Processo (`ProcessList.tsx` — `SectionConfig.id = "processo"`, `order = 3`, `enabled = true`)**
   - **Textos (`SectionConfig`):**
     - `kicker`: `"[02 — Método]"`
     - `titleLine1`: `"Do conceito"`, `titleLine2`: `"ao corte final"`
     - `subtitle`: `"Cada etapa combina direção criativa humana com ferramentas de IA de última geração."`
   - **Dados (`getProcessSteps()`):** 5 etapas:
     | Ordem | Número | Título | Ferramentas (`tools`) | Mídia (`mediaId`) | Dimensões / Duração |
     | :---: | :---: | :--- | :--- | :--- | :--- |
     | 1 | `01` | `Roteiro & Storyboard` | `["Direção Criativa", "Roteiro Comercial", "Storyboard Visual"]` | `cmuwwnvgi000svys4kzq9uiau` (`calebe.webm`) | `1920×1080` (`68.55s`) |
     | 2 | `02` | `Consistência de Personagem` | `["Direção de Arte", "Consistência Visual", "Treinamento de Modelo"]` | `cmuwwm1pi000gvys47zmd5vix` (`tati-boing.webm`) | `720×1280` (`49.04s`) |
     | 3 | `03` | `Geração de Vídeo & Movimento` | `["Direção de Cena", "Cinematografia Digital", "Física & Movimento"]` | `cmuwwl175000avys49q9mod9l` (`anderson-imoveis.webm`) | `720×1280` (`50.94s`) |
     | 4 | `04` | `Upscaling 4K` | `["Upscaling 4K", "Textura de Pele & Luz", "Nitidez Cinematográfica"]` | `cmuwwmre8000mvys46zlog1w9` (`edson-imoveis.webm`) | `720×1280` (`62.04s`) |
     | 5 | `05` | `Montagem, Sound Design & Color Grade` | `["Edição & Ritmo", "Sound Design & Mix", "Color Grading"]` | `cmuwwgwv10000vyp501t9gm2y` (`porsche-gt3-rs.webm`) | `1920×1080` (`33.1s`) |
   - **Equivalente na Referência (Paragon):** `div.home-services_cards_wrap` — painéis horizontais expansíveis em desktop (abas verticais rotacionadas `-90deg` com `✦` no rodapé; painel ativo expande revelando marquee gigante no topo, vídeo `AutoVideo`, descrição e lista de entregas/ferramentas com divisor `1px solid #100f0f`) nas cores da Paragon (`#88d4f5` Sky Blue Light, `#ff5b4b` Coral Red, `#508992` Teal, `#f8f8f8` Off-White, `#c8c8c8` Grey-300). No mobile, painéis empilhados verticalmente com borda `1px solid #100f0f`.

6. **Sobre (`About.tsx` — `SectionConfig.id = "sobre"`, `order = 4`, `enabled = true`)**
   - **Textos (`SectionConfig` & `SiteSettings`):**
     - `section.kicker`: `"[03 — Direção]"`, `titleLine1`: `"Quem dirige"`, `titleLine2`: `"a cena"`
     - `settings.aboutTag`: `"[Direção & Motion Design]"`
     - `settings.aboutName`: `"Barbarotti"`
     - `settings.aboutRole`: `"Diretor Criativo & Vídeos com IA"`
     - `settings.aboutBio`:
       1. `"Sou diretor criativo especializado em produzir filmes comerciais, vídeos de posicionamento e criativos de alta conversão unindo cinema, motion design e inteligência artificial generativa."`
       2. `"Enquanto o mercado usa IA no piloto automático gerando vídeos genéricos, meu trabalho é aplicar direção de cena, psicologia de vendas, ritmo de montagem, sound design e color grading profissional em cada frame."`
       3. `"De comerciais automotivos e lançamentos imobiliários de alto padrão a vídeos de autoridade para especialistas: entrego estética de grande produtora com a agilidade que o digital exige."`
       4. `"Baseado em Palhoça, SC — atendendo marcas, construtoras, incorporadoras e empreendedores em todo o Brasil e no exterior."`
   - **Mídia (`About.tsx`):** `settings.aboutMedia` no banco aponta para `cmussdhch000avycuh2n31m9j` (`placeholder: true`), porém o componente utiliza `photos[0]?.media ?? settings.aboutMedia` (foto real `cmvgp6ciy001nll1ddhblo46l` — `DSC00637.jpg`, `3934×4918`) e mais fotos reais do acervo `FOTO` para o mural estilo Polaroid da Paragon.
   - **Equivalente na Referência (Paragon):** `section.home-pillars_wrap` + `section.home-gallery_wrap` — fundo escuro `#100f0f`, fita vetorial S-curve em Teal `#508992` atravessando a seção, título `96px` (`QUEM DIRIGE A CENA`), 3 colunas de pilares editoriais com divisor horizontal e vitrine de retratos em molduras Polaroid (`#f8f8f8`) inclinadas com parallax no scroll e CTA Coral Red (`#ff5b4b`).

7. **Planos (`Plans.tsx` — `SectionConfig.id = "planos"`, `order = 5`, `enabled = false`)**
   - Desabilitado no banco (`enabled: false`) e seus 3 registros contêm `[PREENCHER`. Permanece oculto conforme regra da Etapa 1.

8. **Depoimentos (`Testimonials.tsx` — `SectionConfig.id = "depoimentos"`, `order = 6`, `enabled = true`)**
   - Possui `0` registros no banco (`testimonials.length === 0`). O componente retorna `null` quando vazio; quando houver depoimentos cadastrados no `/admin`, renderiza na estética exata de `section.testimonial_wrap` da Paragon (fundo Coral Red `#ff5b4b`, cards `#f8f8f8` com borda `1px solid #100f0f` e slider).

9. **FAQ (`Faq.tsx` — `SectionConfig.id = "faq"`, `order = 7`, `enabled = true`)**
   - **Textos (`SectionConfig`):** `kicker`: `"[06 — Dúvidas]"`, `titleLine1`: `"Perguntas"`, `titleLine2`: `"Frequentes"`, `subtitle`: `"Tudo o que você precisa saber antes de iniciarmos o seu projeto."`
   - **Dados (`getFaqs()`):** 8 perguntas e respostas reais completas (sobre funcionamento da produção com IA, prazos, formatos 9:16 e 16:9, roteiro/locução, direitos de uso comercial, atendimento remoto, valores e diferenciais).
   - **Equivalente na Referência (Paragon):** Seção editorial em tom `#c8c8c8` / `#f8f8f8` (`STUDIO UPDATES` / `THE PARAGON STANDARD`) com grid de 12 colunas: coluna esquerda fixa com título `96px` e subtítulo; coluna direita com acordeão de bordas `1px solid #100f0f`, numeração técnica `01`–`08` e expansão suave.

10. **Contato (`Contact.tsx` & `ContactForm.tsx` — `SectionConfig.id = "contato"`, `order = 8`, `enabled = true`)**
    - **Textos (`SectionConfig` & `SiteSettings`):**
      - `kicker`: `"[07 — Contato]"`, `titleLine1`: `"Vamos criar"`, `titleLine2`: `"algo único?"`, `subtitle`: `"Conte sobre a sua marca ou projeto. Respondo pessoalmente em até 24 horas úteis."`, `ctaLabel`: `"Chamar no WhatsApp"`
      - `contactEmail`: `"contato@soubarbarotti.com.br"`, `whatsapp`: `"5548999924405"`, `instagramUrl`: `"https://www.instagram.com/soubarbarotti/"`
    - **Equivalente na Referência (Paragon):** Combina o banner de impacto Coral Red `#ff5b4b` (`section.home-cta_wrap` — título Display `156px` centralizado, badges arrastáveis/interativos ao redor) com a estrutura de formulário e canais diretos de `/contact` (`#f8f8f8` / `#100f0f`, inputs com borda arquitetônica `1px solid`, preservando `/api/contato`, honeypot `website`, `elapsedMs`, link de WhatsApp e link para `/privacidade`).

---

### 1.3. Inventário Completo dos 8 Projetos Publicados (`Project`)

| # | Slug | Título & Subtítulo | Categoria / Cliente / Entrega / Local / Ano | Vídeo Hero / Cover / FullVideo (`mediaId`) | Variantes Geradas (`/media/...`) | Blocos de Texto (`brief`, `direction`, `production`, `finishing`) | Galeria (`ProjectGalleryItem`) | Créditos (`ProjectCredit`) |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `porsche-gt3-rs` | **Porsche GT3 RS** — *Filme comercial conceito com direção cinematográfica e IA* | `Comercial Automotivo` · Cliente: `Porsche` · Entrega: `Filme 4K Widescreen` · Local: `Estúdio & CGI` · `2026` (`featured: true`) | `cmuwwgwv10000vyp501t9gm2y` (`VIDEO`, `1920×1080`, `33.1s`) — usado em `heroMedia`, `coverMedia` e `fullVideoMedia` | `720p_mp4`, `720p_webm`, `1080p_mp4`, `1080p_webm`, `poster` | 4 blocos reais preenchidos (sem `[PREENCHER]`) | 0 itens | 0 itens |
| 2 | `anderson-imoveis` | **Anderson** — *Posicionamento e filme comercial para o mercado imobiliário de alto padrão* | `Imobiliário de Alto Padrão` · Cliente: `Anderson Empreendimentos` · Entrega: `Vídeo 9:16 para Meta Ads & Reels` · Local: `Santa Catarina` · `2026` (`featured: true`) | `cmuwwl175000avys49q9mod9l` (`VIDEO`, `720×1280`, `50.94s`) — usado em `heroMedia`, `coverMedia` e `fullVideoMedia` | `720p_mp4`, `720p_webm`, `poster` | 4 blocos reais preenchidos | 0 itens | 0 itens |
| 3 | `jessica-furst` | **Jéssica Fürst** — *Filme de posicionamento e autoridade para o mercado imobiliário* | `Imobiliário & Autoridade` · Cliente: `Jéssica Fürst Imóveis` · Entrega: `Vídeo Vertical 4K` · Local: `Florianópolis / SC` · `2026` (`featured: true`) | `cmuwwlja9000dvys40wfpphlc` (`VIDEO`, `720×1280`, `54.73s`) — usado em `heroMedia`, `coverMedia` e `fullVideoMedia` | `720p_mp4`, `720p_webm`, `poster` | 4 blocos reais preenchidos | 0 itens | 0 itens |
| 4 | `tati-boing` | **Tati Boing** — *Direção criativa e narrativa visual para posicionamento na área de saúde e neurociência* | `Neurociência & Saúde` · Cliente: `Tatiane Boing` · Entrega: `Vídeo Vertical 9:16` · Local: `São Paulo & Online` · `2026` (`featured: true`) | `cmuwwm1pi000gvys47zmd5vix` (`VIDEO`, `720×1280`, `49.04s`) — usado em `heroMedia`, `coverMedia` e `fullVideoMedia` | `720p_mp4`, `720p_webm`, `poster` | 4 blocos reais preenchidos | 0 itens | 0 itens |
| 5 | `arthur-imoveis` | **Arthur** — *Criativo cinematográfico de alta retenção para captação e vendas imobiliárias* | `Imobiliário` · Cliente: `Arthur Empreendimentos` · Entrega: `Vídeo 9:16` · Local: `Litoral Catarinense` · `2026` (`featured: false`) | `cmuwwmely000jvys46l11m333` (`VIDEO`, `720×1280`, `42.26s`) — usado em `heroMedia`, `coverMedia` e `fullVideoMedia` | `720p_mp4`, `720p_webm`, `poster` | 4 blocos reais preenchidos | 0 itens | 0 itens |
| 6 | `edson-imoveis` | **Edson** — *Campanha em vídeo com direção de cena e acabamento de cinema* | `Imobiliário` · Cliente: `Edson Imóveis` · Entrega: `Vídeo Vertical` · Local: `Santa Catarina` · `2026` (`featured: false`) | `cmuwwmre8000mvys46zlog1w9` (`VIDEO`, `720×1280`, `62.04s`) — usado em `heroMedia`, `coverMedia` e `fullVideoMedia` | `720p_mp4`, `720p_webm`, `poster` | 4 blocos reais preenchidos | 0 itens | 0 itens |
| 7 | `miria-imoveis` | **Miria** — *Posicionamento digital e vídeo comercial para o setor imobiliário* | `Imobiliário` · Cliente: `Miria Negócios Imobiliários` · Entrega: `Vídeo 9:16` · Local: `Grande Florianópolis` · `2026` (`featured: false`) | `cmuwwn6ga000pvys4huuijemb` (`VIDEO`, `1072×1920`, `53.2s`) — usado em `heroMedia`, `coverMedia` e `fullVideoMedia` | `720p_mp4`, `720p_webm`, `1080p_mp4`, `1080p_webm`, `poster` | 4 blocos reais preenchidos | 0 itens | 0 itens |
| 8 | `calebe` | **Calebe** — *Direção visual e storytelling cinematográfico em cenário internacional* | `Marca Pessoal Internacional` · Cliente: `Calebe` · Entrega: `Série de Vídeos Cinematográficos` · Local: `Polinésia Francesa & Remoto` · `2026` (`featured: true`) | `cmuwwnvgi000svys4kzq9uiau` (`VIDEO`, `1920×1080`, `68.55s`) — usado em `heroMedia`, `coverMedia` e `fullVideoMedia` | `720p_mp4`, `720p_webm`, `1080p_mp4`, `1080p_webm`, `poster` | 4 blocos reais preenchidos | 4 itens no banco (`2 FRAME`, `2 BASTIDOR`), porém **todos com `media.isPlaceholder = true`** → filtrados e ocultos no front | 5 créditos no banco, porém `tools` contém `"[PREENCHER: ferramentas usadas neste projeto]"` → texto `[PREENCHER...]` filtrado no front |

---

## Parte 2 — Medições Reais da Referência (`https://www.paragonproductions.co/`)

Inspecionado via Playwright em **Desktop (`1440×900`)** e **Mobile (`390×844`)** nas páginas:
- Home (`/`)
- Work (`/work`)
- Work Detail (`/works/i-am-ready-karts-to-cars`)
- Directors (`/directors`) e Director Detail (`/directors/zack-grant`)
- Why Paragon (`/why-paragon`)
- News (`/news`)
- Contact (`/contact`)

### 2.1. Tipografia e Equivalentes Livres (`next/font/google`)

A Paragon utiliza três famílias comerciais hospedadas no Webflow. Abaixo estão as medições exatas e as equivalentes livres carregadas via `next/font/google`:

| Papel Tipográfico | Fonte na Paragon (Comercial) | Equivalente Livre (`next/font/google`) | Pesos Usados | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Display / Headings (`--font-display`)** | `"Review Condensed"`, Impact, sans-serif | **`Barlow Condensed`** (`Barlow_Condensed`) | `500`, `600`, `700` | Títulos Display, H1–H6, títulos de cards de projetos, marquees de serviços, knockout hero title. |
| **Kicker / Nav / Buttons (`--font-mono` / `--font-kicker`)** | `"Simplon Norm"`, Arial, sans-serif | **`Space Grotesk`** (`Space_Grotesk`) | `400`, `500`, `600`, `700` | Links da navbar, botões (`CONTACT US`, `MEET OUR DIRECTORS`), kickers de seção (`WHAT WE DO`), links do menu mobile (`50.125px`), filtros (`INDEX`, `GRID`). |
| **Body / UI (`--font-sans`)** | `"Roobert"`, Arial, sans-serif | **`Plus Jakarta Sans`** (`Plus_Jakarta_Sans`) | `400`, `500`, `600`, `700` | Parágrafos de corpo (`16px` desktop / `14.125px` mobile), descrições, metadados de cliente/categoria, ticker da navbar (`ALWAYS IN PURSUIT //`). |

#### Escala Tipográfica Computada (Desktop `1440px` × Mobile `390px`)

| Token / Nível | Tamanho Desktop (`1440px`) | Line-Height Desktop | Tamanho Mobile (`390px`) | Line-Height Mobile | Letter-Spacing | Peso / Transform | Onde Aparece na Referência |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`display`** | `156px` (`9.75rem`) | `148.2px` (`95%`) | `60px` (`3.75rem`) | `57px` (`95%`) | `0px` (`0em`) | `500` · `uppercase` | `FEATURED WORK`, `GOT SOMETHING WORTH CHASING?` |
| **`h1-large`** | `112px` (`7rem`) | `112px` (`100%`) | `48px` (`3rem`) | `48px` (`100%`) | `0px` | `400`/`500` · `uppercase` | Roster de diretores (`ZACK GRANT`), `LETS GET IN TOUCH` (`/contact`) |
| **`h1`** | `96px` (`6rem`) | `91.2px` (`95%`) | `43.5px` (`2.718rem`) | `41.325px` (`95%`) | `0px` | `500` · `uppercase` | `ALWAYS IN PURSUIT`, `FUEL FOR TOMORROW'S BRANDS`, `STUDIO UPDATES`, `TESTIMONIALS`, `WORK BUILT ON TRUST`, H1 de `/works/[slug]` |
| **`h2`** | `48px` (`3rem`) | `52.8px` (`110%`) | `36px` (`2.25rem`) | `39.6px` (`110%`) | `0px` | `500` · `uppercase` | `A FEW PROJECTS THAT MAKE US PROUD.`, `THE ASK` / `APPROACH` / `HOW IT HAPPENED` em `/works/[slug]` |
| **`h3`** | `40px` (`2.5rem`) | `44px` (`110%`) | `32px` (`2rem`) | `35.2px` (`110%`) | `0px` | `500` · `uppercase` | Subtítulos de destaque |
| **`h4`** | `32px` (`2rem`) | `35.2px` (`110%`) | `28.25px` (`1.765rem`) | `31.075px` (`110%`) | `0px` | `500` · `uppercase` | Subtítulo do Hero (`ALWAYS IN PURSUIT`), intro de serviços (`WE PARTNER WITH BRANDS...`), pilares (`PEOPLE FIRST`), títulos de depoimento e heading do Footer |
| **`h5`** | `28px` (`1.75rem`) | `26.6px`–`30.8px` (`95%`–`110%`) | `24px` (`1.5rem`) | `22.8px` (`95%`) | `0px` | `500` · `uppercase` | Títulos dos cards de projeto (`I AM READY: KARTS TO CARS`), títulos na tabela de `/work` |
| **`h6`** | `24px` (`1.5rem`) | `31.44px` (`131%`) | `20px` (`1.25rem`) | `26.2px` (`131%`) | `0px` | `500` · `uppercase` | Títulos de cards secundários (`STUDIO UPDATES`) |
| **Mobile Menu Link** | — | — | `50.125px` | `55.1375px` (`110%`) | `0px` | `400` · `uppercase` | Links do menu mobile aberto (`DIRECTORS`, `WORK`, `WHO WE ARE`, `NEWS`, `CONTACT`) |
| **Kicker / Button** | `16px` (`1rem`) | `20.96px` (`131%`) | `14.125px` (`0.883rem`) | `18.50px` (`131%`) | `0px` | `400` · `uppercase` | Kickers (`WHAT WE DO`, `BUILT FOR THE CHASE`), botões (`MEET OUR DIRECTORS`), links da navbar |
| **Body Main (`text-main`)** | `16px` (`1rem`) | `20.96px` (`131.5%`) | `14.125px` (`0.883rem`) | `18.50px` (`131.5%`) | `0px` | `400` · `normal` | Parágrafos de texto, metadados de cards, marquee da navbar |
| **Body Small (`text-small`)** | `14px` (`0.875rem`) | `18.34px` (`131%`) | `12px` (`0.75rem`) | `15.72px` (`131%`) | `0px` | `400` | Datas, créditos secundários, copyright |
| **Body Extra Small** | `12px` (`0.75rem`) | `15.72px` (`131%`) | `12px` (`0.75rem`) | `15.72px` (`131%`) | `0px` | `400` | Labels técnicos compactos |

---

### 2.2. Cores e Tokens de Superfície (`:root` da Paragon)

| Token na Paragon | Hex / RGB Exato | Papel Visual na Paragon | Token Equivalente em `globals.css` |
| :--- | :--- | :--- | :--- |
| `--_color---swatch--black` | `#100f0f` (`rgb(16, 15, 15)`) | Fundo principal escuro (`Featured Work`, `Directors Roster`, `Pillars`, `Gallery`, `Work`, `Footer`, `Mobile Menu`), cor de texto e bordas (`1px solid #100f0f`) sobre fundos claros/coloridos | `--carvao: #100f0f` / `--paragon-black: #100f0f` |
| `--_color---swatch--white` | `#f8f8f8` (`rgb(248, 248, 248)`) | Fundo claro principal (faixa superior do Hero, seção `What We Do`, cards da navbar, molduras Polaroid, cards de depoimentos, página `/contact`) e texto primário sobre fundo `#100f0f` | `--amanhecer: #f8f8f8` / `--paragon-white: #f8f8f8` |
| `--_color---swatch--red` | `#ff5b4b` (`rgb(255, 91, 75)`) | Coral Red — Botões CTA primários (`MEET OUR DIRECTORS`, `HEAR OUR HEART`, `DROP US A LINE`), 2º painel de serviços (`PRODUCTION`), fundo de `Testimonials` e fundo da seção `Home CTA` (`GOT SOMETHING WORTH CHASING?`) | `--brasa: #ff5b4b` / `--paragon-red: #ff5b4b` |
| `--_color---swatch--blue` | `#44b6fd` (`rgb(68, 182, 253)`) | Sky Blue — Caixa do logo na navbar (`52×48px` desktop / `48×48px` mobile), botão `CONTACT US ↳` da navbar e botão hambúrguer mobile fechado | `--paragon-blue: #44b6fd` |
| `--_color---swatch--blue-light` | `#88d4f5` (`rgb(136, 212, 245)`) | Sky Blue Light — 1º painel de serviços (`CREATIVE`) e botão do menu mobile aberto | `--paragon-blue-light: #88d4f5` |
| `--_color---swatch--teal` | `#508992` (`rgb(80, 137, 146)`) | Teal — 3º painel de serviços (`POST`) e fita vetorial S-curve (`illustration_wrap`) na seção `Always in Pursuit` | `--paragon-teal: #508992` |
| `--_color---swatch--grey-300` | `#c8c8c8` (`rgb(200, 200, 200)`) | Fundo da seção `Studio Updates`, hover dos botões/links da navbar e superfícies neutras | `--paragon-grey-300: #c8c8c8` |
| `--_color---swatch--grey-400` | `#9b9b9b` (`rgb(155, 155, 155)`) | Estado ativo de botão de navegação (`.u-button:has(.w--current)`) e textos terciários | `--fumaca: #9b9b9b` / `--paragon-grey-400: #9b9b9b` |
| `--_color---swatch--grey-500` | `#6d6c6c` (`rgb(109, 108, 108)`) | Texto secundário / legendas | `--nevoa: #c8c8c8` / `--paragon-grey-500: #6d6c6c` |
| `--_color---swatch--grey-600` | `#2c2c2c` (`rgb(44, 44, 44)`) | Divisores escuros e bordas sutis em modo escuro (`rgba(248, 248, 248, 0.22)`) | `--linha: rgba(248, 248, 248, 0.22)` |
| `--border-width--main` | `0.063rem` (`1px`) | Todas as bordas de navbar, botões, cards de projetos, tabelas e inputs usam `1px solid` e **`border-radius: 0px`** (exceto o emblema gigante em formato pílula no rodapé) | `--border-main: 1px` |

---

### 2.3. Grid, Container e Espaçamentos

- **Largura de Referência (`--site--viewport-max`):** `90rem` (`1440px`), mínimo `20rem` (`320px`).
- **Margem Lateral (`--site--margin`):**
  - Desktop (`1440px`): **`48px`** (`3rem`)
  - Mobile (`390px`): **`18px`** (`1.125rem`)
- **Gutter do Grid (`--site--gutter`):**
  - Desktop (`1440px`): **`24px`** (`1.5rem`)
  - Mobile (`390px`): **`16px`** (`1rem`)
- **Colunas (`--site--column-count`):** `12` colunas no desktop (`minmax(0, 1fr)`).
- **Espaçamentos Verticais de Seção:**
  - `--_spacing---padding-vertical--small`: `24px` mobile → `40px` desktop
  - `--_spacing---padding-vertical--main`: `40px` mobile → `80px` desktop
  - `--_spacing---padding-vertical--large`: `64px` mobile → `120px` desktop
  - `--_spacing---padding-vertical--extra-large`: `80px` mobile → `160px` desktop

---

### 2.4. Animações, Gatilhos, Durações e Easings

| Elemento / Interação | Gatilho | Duração e Easing Exatos | Comportamento Medido |
| :--- | :--- | :--- | :--- |
| **Transição Base (`--animation-default`)** | Hover / estado UI | `0.5s cubic-bezier(0.65, 0.05, 0, 1)` | Usado na expansão de painéis, trocas de cor e revelar de elementos. |
| **Revelação de Textos por Linha (`[data-text-reveal="true"]`)** | Scroll (`IntersectionObserver` / `ScrollTrigger` quando o topo do elemento entra em `80%`–`100%` da viewport) | `duration: 0.6s`, `delay: 0.05s`, `stagger: 0.1s` total, `ease: power4.out` (`cubic-bezier(0.16, 1, 0.3, 1)`) | Cada linha é envolvida em máscara (`overflow: clip`, `padding-block: 0.125em; margin-block: -0.125em`) e sobe de `yPercent: 110, opacity: 0` para `0, opacity: 1`. |
| **Hover de Botões e Links da Navbar (`[data-button-animate-chars]`)** | `:hover` / `:focus-visible` | `transform 0.6s cubic-bezier(0.625, 0.05, 0, 1)` | O texto interno tem `text-shadow: 0px 1.3em currentColor` dentro de um container `overflow: hidden` e translada `translateY(-1.3em)` no hover. |
| **Sublinhado Duplo Animado (`.u-text-button`)** | `:hover` em dispositivos `pointer: fine` | `transform 0.735s cubic-bezier(0.625, 0.05, 0, 1)`, `delay: 0.3s` | `::before` encolhe para a direita (`scaleX(0)`, `delay: 0s`) enquanto `::after` cresce da esquerda (`scaleX(1)`, `delay: 0.3s`). |
| **Marquee Contínuo (`[data-nav-marquee-list]`, `[data-css-marquee-list]`)** | Contínuo (`infinite`) | `30s linear infinite` (navbar e painéis de serviço) / `20s linear infinite` (faixas gerais) | `@keyframes translateX { to { transform: translateX(-100%); } }`. |
| **Header Reativo à Direção do Scroll (`initNavScrollHide`)** | Scroll vertical (`window.scrollY`) | `duration: 0.3s`, `ease: power2.in` (`cubic-bezier(0.55, 0.085, 0.68, 0.53)`) | Ao rolar para baixo (`direction === 1`), `.nav_container` recolhe com `translateY(-100%)` e `opacity: 0`. Ao rolar para cima (`direction === -1`), reaparece imediatamente. |
| **Menu Mobile (`[data-navigation-status="active"]`)** | Clique no botão hambúrguer (`52×48px`) ou tecla `Escape` | Painel: `0.7s cubic-bezier(0.5, 0.5, 0, 1)`. Links: `0.5s cubic-bezier(0.65, 0, 0, 1)` com `delay: 200ms + index * 50ms`. Redes sociais: `0.7s cubic-bezier(0.65, 0, 0, 1)` com `delay: 300ms`. | Trava o scroll do `body`, converte as 3 linhas do hambúrguer em 1 traço central (`—`) em fundo `#88d4f5`, abre painel `#100f0f` de `100dvh` e desliza os links de `translateY(120%)` para `0%`. |
| **Painéis Expansíveis de Serviços / Processo (`.home-services_cards_item`)** | Clique na aba vertical (desktop) | Painel: `0.5s cubic-bezier(0.65, 0.05, 0, 1)`. Conteúdo interno escalonado: marquee (`400ms`), vídeo (`500ms`), descrição (`560ms`), itens da lista (`620ms`, `650ms`, `670ms`, `680ms`). | No hover da aba fechada, ela alarga `+1rem`. Ao ativar, expande para `100%` da largura restante e revela o marquee superior, vídeo e lista de entregas. |
| **Cards de Projeto e Vídeo no Hover (`featured-work_card_image`)** | `:hover` / `:focus-visible` no desktop; visibilidade na viewport no mobile | `opacity 0.4s ease` | O poster/placeholder desaparece (`opacity: 0`) revelando o vídeo em reprodução; o cursor customizado flutuante segue o ponteiro com interpolação linear (`speed = 0.15`). |
| **Galeria Polaroid com Parallax (`.home-gallery_list_item`)** | Scroll contínuo na seção | rotações fixas (`8.78deg`, `-13.98deg`, `6.58deg`, `-5.97deg`, `16.22deg`, `-8.2deg`) + parallax vertical por coluna (`-30%`, `-50%`, `-70%`) | Molduras Polaroid brancas (`#f8f8f8`) se deslocam em velocidades diferentes conforme o usuário rola a página. |
| **Preloader (`loading_wrap`)** | Carregamento inicial da sessão (`sessionStorage`) | Ciclo de logo: `1.4s`; inversão `#100f0f` → `#f8f8f8`: `0.6s`; colapso da cortina superior (`height: 0%`): `1.2s ease power2.out` | Na primeira visita exibe a sequência completa e recolhe para o topo; nas visitas seguintes ou com `prefers-reduced-motion` recolhe rapidamente sem bloquear a leitura. |

---

### 2.5. O Que Pôde e o Que Não Pôde Ser Inspecionado na Referência

- **Inspecionado integralmente:**
  - Todas as 7 páginas públicas da Paragon (`/`, `/work`, `/works/[slug]`, `/directors`, `/directors/[slug]`, `/why-paragon`, `/news`, `/contact`) em `1440×900` e `390×844`.
  - Todos os 18 blocos `<style>` inline e 18 blocos `<script>` inline do Webflow (incluindo código-fonte exato do SplitText, Lenis, ScrollTrigger, menu mobile, cursor flutuante, acordeão horizontal de serviços, galeria Polaroid e preloader).
  - Todas as variáveis CSS de `:root` (cores, tipografia fluida, grid e espaçamentos).
- **Limitações / Adaptações Documentadas:**
  1. **Arquivos binários das fontes comerciais (`Review Condensed`, `Simplon Norm`, `Roobert`):** São fontes proprietárias licenciadas exclusivamente para o domínio da Paragon. Conforme instrução da Etapa 2, foram substituídas pelas equivalentes livres mais próximas no Google Fonts via `next/font/google`: **`Barlow Condensed`** (para `Review Condensed`), **`Space Grotesk`** (para `Simplon Norm`) e **`Plus Jakarta Sans`** (para `Roobert`).
  2. **Páginas de conteúdo sem equivalente direto na Paragon (`/fotos`, `/artes`, `/privacidade`, `FAQ`):** A Paragon não possui páginas dedicadas de galeria fotográfica com download, política de privacidade LGPD brasileira nem seção de FAQ. Essas páginas e seções foram desenhadas aplicando rigorosamente os mesmos tokens, tipografia, bordas arquitetônicas `1px solid`, cabeçalhos monumentais e interações das páginas `/work`, `/news` e `/why-paragon` da Paragon.

