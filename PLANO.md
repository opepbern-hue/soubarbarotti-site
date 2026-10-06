# Plano · site soubarbarotti.com.br

Versão 1 · 26/09/2026 · aguardando OK

Gabarito visual: os prints do Rushes em 1440, 810 e 390 px estão em [referencia-rushes/](referencia-rushes/) (home, /work, página de projeto, menu do celular, 404, termos e as interações de hover). As folhas de contato em [referencia-rushes/interacoes/](referencia-rushes/interacoes/) mostram cada tamanho numa imagem só.

Fontes da verdade usadas: `quem-e-soubarbarotti.md` e `paleta-soubarbarotti.md`. A `paleta-soubarbarotti-previa.png` não está na pasta, então usei os HEX do MD. Também li o `Plano SEO + AEO` (PDF) e a `p_gina_de_vendas` (veja "O que fica de fora").

---

## 1. O que eu medi no Rushes

| Elemento | Rushes (1440 px) | Como vira no meu site |
|---|---|---|
| Título da abertura | Space Grotesk 700, ~302 px (≈21vw), espaçamento −3%, 1 linha | Mesma fonte e peso. "SOUBARBAROTTI" tem o dobro de letras: 144 px em 1 linha no desktop (seção 3) |
| Títulos de seção | 56 px, peso 600, espaçamento −4%, duas linhas: 1ª clara, 2ª cinza | 56 px, 1ª linha em Carvão, 2ª em Fumaça, sempre em minúsculas |
| Selo "REC:" | 14 px, peso 500, caixa alta, ponto vermelho que pisca | 14 px, texto em Carvão, ponto em Laranja Barbarotti piscando |
| Linhas de serviço/preço | nº 14 px · título 36 px/500 · texto Inter 16 px/300 | Igual, com a numeração em Brasa |
| Frase de números | 80 px/500, números 600 em laranja, contador sobe ao entrar na tela | 80 px, destaques em Brasa |
| Card de trabalho | 1400 × 778 px, cantos de visor, título 48 px, categoria 14 px | Igual, com HUD branco sobre o vídeo |
| Menu | 14 px/500 caixa alta, centralizado, botão laranja à direita | Igual, botão em Brasa com texto branco |
| Margens | 100 px nas laterais (1440), 20 px nos cards de trabalho, 16 px no celular | Iguais |

---

## 2. Home, seção por seção

Tablet (810 px): mesmo comportamento do Rushes, com menu hambúrguer, cards de trabalho mais altos e grades de 2 colunas. Só descrevo o tablet quando ele muda algo.

| # | Bloco do Rushes (print) | Meu conteúdo | Desktop 1440 | Celular 390 |
|---|---|---|---|---|
| 1 | **Menu** ([print](referencia-rushes/home-1440-00-fold.png), [celular aberto](referencia-rushes/interacoes/menu-390.png)) | Marca em texto "soubarbarotti" + ponto REC · Trabalhos · Processo · Planos · Contato · botão **Fale comigo** | Fixo no topo, transparente sobre o branco, links centralizados, botão à direita com as letras rolando no hover | Marca + hambúrguer; abre um painel de cima para baixo com os links e o botão |
| 2 | **Abertura** ([print](referencia-rushes/home-1440-00-fold.png), [sequência de carregamento](referencia-rushes/interacoes/sheet-load.png)) | Título "SOUBARBAROTTI" com **vídeo dentro das letras**, e o ponto final é o ponto REC laranja piscando. Selo: `REC: PALHOÇA, SC & REMOTO`. Frase: "Dirijo vídeos com cara de cinema feitos com IA generativa, para marcas e empreendedores. Sem set, sem câmera, sem elenco." Lista: `01/ FILMES DE MARCA` · `02/ COMERCIAIS E ANÚNCIOS` · `03/ MARCA PESSOAL EM VÍDEO` · `04/ CONTEÚDO PARA REDES` | Fundo branco com Light Leak. Selo em cima à esquerda, título ocupando a largura, frase embaixo à esquerda, lista alinhada à direita (mesma grade do Rushes) | Título em 2 linhas "SOU / BARBAROTTI" (seção 3). Selo, título, frase e lista empilhados, como no Rushes |
| 3 | **Faixa de logos** ([print](referencia-rushes/interacoes/sheet-scroll.png)) | Echo Labs · Calebe · Descomplicando Varejo · Myskillzy, em texto (troco por logo quando você subir pelo admin) | Letreiro rolando devagar na horizontal, texto em Fumaça, divisórias em Linha | Igual, menor |
| 4 | **Frase de números** ([print](referencia-rushes/home-1440-02.png)) | Sem número confirmado, uso uma frase no mesmo formato: "A IA gera as cenas. **Eu decido** o que entra, o que é refeito e como tudo vira **um filme só**." Os destaques ficam em Brasa. Quando você confirmar números, liga o modo contador no admin | 80 px, 4 linhas, alinhado à esquerda | ~40 px, 6 a 7 linhas |
| 5 | **REC: showcase** ([print](referencia-rushes/home-1440-03.png), [hover](referencia-rushes/interacoes/card-hover.png)) | `REC: TRABALHOS`. Os trabalhos marcados como destaque no admin, com título, categoria e link para a página do projeto | Cards de largura cheia, um embaixo do outro. Capa parada; no hover o vídeo toca mudo, aparece `● REC 00:00:07` (timecode real) e um círculo "ver projeto" segue o cursor. Cantos de visor em branco | Cards em pé (retrato). O vídeo toca sozinho quando o card chega ao centro da tela, um por vez. Timecode enquanto toca, seta fixa no canto |
| 6 | **REC: services** ([print](referencia-rushes/home-1440-06.png), [hover](referencia-rushes/interacoes/svc-hover.png)) | `REC: PROCESSO` · "do roteiro / ao color grade" · "Cinco etapas, cada uma com a sua ferramenta. Nenhuma cena é gerada antes de estar planejada." · 01 Roteiro e storyboard · 02 Consistência de personagem · 03 Image-to-video · 04 Upscaling · 05 Color grade, cada uma com descrição, ferramentas e vídeo | Linhas numeradas: título à esquerda, descrição e ferramentas à direita. No hover as outras linhas escurecem e o vídeo da etapa flutua junto ao cursor | Linhas empilhadas; tocar abre a linha como sanfona e mostra o vídeo da etapa (toca só enquanto está visível) |
| 7 | **REC: team** ([print](referencia-rushes/home-1440-07.png), [hover](referencia-rushes/interacoes/team-hover.png)) | `REC: SOBRE` · "quem dirige / cada cena" · "Uma pessoa só, do roteiro à entrega." · card com foto, `[DIREÇÃO]`, nome, `DIRETOR DE VÍDEO COM IA` e bio em primeira pessoa (rascunho abaixo) | Card do Rushes (foto com etiqueta, nome e função) na coluna da esquerda e a bio sempre visível na da direita. Com uma pessoa só, esconder a bio atrás do hover desperdiçaria o espaço | Card e bio empilhados |
| 8 | **REC: pricing** ([print](referencia-rushes/home-1440-09.png)) | `REC: PLANOS` · "três formas / de trabalhar comigo" · "Escolha o formato mais perto do seu projeto. Se nenhum servir, a gente monta um sob medida." · 01, 02, 03 com `[PREENCHER: nome]`, `[PREENCHER: descrição]`, `[PREENCHER: valor ou "sob consulta"]` | Número, nome, descrição no meio, valor à direita em Brasa | Empilhado: número, nome, descrição, valor |
| 9 | **REC: testimonials** ([print](referencia-rushes/home-1440-10.png)) | `REC: DEPOIMENTOS` · "quem já / trabalhou comigo". **Só aparece se houver depoimento publicado no admin** | Caixa em Névoa, citação centralizada em caixa alta, nome e cargo, avatares para trocar | Igual; também dá para deslizar |
| 10 | **REC: FAQ** ([print](referencia-rushes/home-1440-11.png), [aberto](referencia-rushes/interacoes/faq-open.png)) | `REC: PERGUNTAS` · "o que perguntam / antes de fechar" · "As dúvidas que aparecem antes de todo projeto." · perguntas sugeridas abaixo; **as respostas são suas** (`[PREENCHER]`) | Título à esquerda, sanfona à direita com + e − | Título em cima, sanfona embaixo |
| 11 | **REC: contact** ([print](referencia-rushes/home-1440-12.png)) | `REC: CONTATO` · "me conta / a sua ideia" · ícones: Instagram, LinkedIn, YouTube, e-mail, WhatsApp (`[PREENCHER]` nos que faltam) · formulário: Nome, E-mail, Mensagem · botão **Enviar** · linha "Ao enviar, você concorda com a Política de Privacidade" | Fundo Névoa, tudo centralizado, formulário com 600 px de largura | Largura cheia com margem de 16 px |
| 12 | **Rodapé** ([print](referencia-rushes/home-1440-13.png)) | "SOUBARBAROTTI" gigante com vídeo dentro das letras · "a sua ideia, / com cara de cinema." · links · Política de privacidade · "© 2026 soubarbarotti. Todos os direitos reservados." · frase-entidade do plano de SEO (a única em terceira pessoa, de propósito) | Nome centralizado, frase à esquerda, links em 2 colunas à direita | Nome, frase, ícones e links empilhados |

**Bio (rascunho, primeira pessoa, só com o que está no MD):**
"Sou o Pedro, tenho 21 anos e moro em Palhoça (SC). Dirijo vídeos com IA generativa para marcas e empreendedores. Antes de gerar qualquer imagem, eu planejo cada cena. Depois cuido do acabamento até o vídeo ter cara de cinema. Estou construindo isso do zero e mostro o processo no Instagram, erros incluídos. `[PREENCHER: como e quando você começou]`"

**Perguntas sugeridas** (respostas suas):
1. Quanto tempo leva do briefing à entrega?
2. Preciso chegar com roteiro pronto?
3. O que é gerado por IA e o que é real no vídeo?
4. Dá para manter o mesmo personagem (ou o meu produto) em todas as cenas?
5. Posso usar o vídeo em anúncio pago?
6. Quantas rodadas de ajuste estão incluídas?
7. Em quais formatos eu recebo (16:9, 9:16, 1:1)?
8. De quem são os direitos do vídeo final?

**Etapas do processo** (texto do MD; você revisa no admin):

| # | Etapa | Descrição | Ferramentas |
|---|---|---|---|
| 01 | Roteiro e storyboard | Planejo o vídeo inteiro antes de gerar qualquer imagem. | `[PREENCHER: ferramentas, se houver]` |
| 02 | Consistência de personagem | O mesmo "ator" em todas as cenas, do primeiro ao último frame. | Midjourney (Omni Reference / `--oref`) |
| 03 | Image-to-video | Cada imagem-chave vira um clipe animado. | Kling, Runway Gen-4, Veo, Sora, Luma |
| 04 | Upscaling | Levo a resolução final para 4K. | Topaz |
| 05 | Color grade | Unifico os clipes gerados. É aqui que nasce o look de cinema. | DaVinci Resolve, Premiere |

---

## 3. O título da abertura

Medi na Space Grotesk 700 (a mesma do Rushes) quanto cada versão pode crescer até encostar nas margens:

| Largura | "RUSHES." (referência) | SOUBARBAROTTI em 1 linha | SOU / BARBAROTTI (2 linhas) | SOUBAR / BAROTTI (2 linhas) |
|---|---|---|---|---|
| 1440 | 302 px | **144 px** | 186 px | 268 px |
| 810 | 180 px | **85 px** | 110 px | 158 px |
| 390 | 88 px | 42 px | **54 px** | 77 px |
| 360 | 81 px | 38 px | **49 px** | 71 px |

**Recomendo:** 1 linha no desktop e no tablet (mantém a composição do Rushes, com o título entre o selo e o rodapé da abertura) e "SOU / BARBAROTTI" no celular, que é a quebra natural ("sou Barbarotti").
**Alternativa:** "SOUBAR / BAROTTI" no celular deixa as letras 40% maiores, com mais vídeo aparecendo, mas lê pior.

Como o vídeo entra nas letras: uma camada branca com as letras vazadas em cima do vídeo (`mix-blend-mode: screen`), e o Light Leak por cima de tudo (`multiply`). Funciona no iPhone, não gasta processamento extra e o título continua texto de verdade para o Google e para leitor de tela. Antes do vídeo carregar, e com "reduzir movimento" ligado, as letras mostram a capa parada.

---

## 4. Outras páginas

**/trabalhos** ([print desktop](referencia-rushes/work-1440-01.png), [celular](referencia-rushes/interacoes/sheet-wp-390.png))
`REC: TRABALHOS` · "os filmes / que eu dirigi" · uma linha por trabalho: categoria, título e descrição curta à esquerda, prévia à direita (a capa vira vídeo no hover ou quando entra na tela no celular) · contato · rodapé. No celular: texto em cima, prévia embaixo.

**/trabalhos/[slug]** ([prints](referencia-rushes/interacoes/sheet-project-1440.png)). Tudo vem do admin:
1. Vídeo de abertura em tela cheia (prévia muda em loop) com categoria e título embaixo à esquerda, e uma trilha no formato `INÍCIO / TRABALHOS / ECHO LABS` no estilo HUD. O plano de SEO pede breadcrumb visível.
2. Faixa de créditos rolando: cada etapa com o que eu fiz e as ferramentas (ex.: `COLOR GRADE · DaVinci Resolve`).
3. Ficha em 4 colunas: CATEGORIA · CLIENTE · ENTREGA · LOCAL (no celular, empilhada).
4. Quatro blocos: O BRIEFING · A DIREÇÃO CRIATIVA · A PRODUÇÃO COM IA · A FINALIZAÇÃO. Rótulo à esquerda, título e texto à direita.
5. Vídeo completo: arquivo meu com controles e som (carrega só no play) ou link do YouTube/Vimeo, que só carrega o player no clique.
6. Galeria de frames e bastidores em 2 colunas (1 no celular), com etiqueta `FRAME` / `BASTIDOR`.
7. `REC: PRÓXIMO PROJETO` no mesmo formato de linha da /trabalhos · contato · rodapé.

**/privacidade**: "política / de privacidade", `ÚLTIMA ATUALIZAÇÃO: [data]`. Texto simples de LGPD para você revisar: o que coleto (nome, e-mail, mensagem), para quê (responder), onde fica guardado, por quanto tempo (`[PREENCHER: prazo; sugestão: 12 meses]`), seus direitos e como pedir exclusão (`[PREENCHER: e-mail]`). Informa também que o site não usa cookies de rastreamento, só o cookie de login do admin.

**404** ([print](referencia-rushes/interacoes/404-1440.png)): `● ERRO 404` · "cena / não encontrada" · "Essa página não existe ou mudou de lugar." · botão **Voltar ao início** · rodapé.

---

## 5. Paleta: do escuro do Rushes para o claro

| No Rushes | No meu site |
|---|---|
| Fundo preto | Branco Tela. Seções alternadas em **Amanhecer** (Processo e Perguntas); caixas e contato em **Névoa** |
| Texto creme | Carvão |
| 2ª linha dos títulos e textos de apoio em cinza | Fumaça (5,4:1) |
| Selo REC (texto cinza, ponto vermelho) | Texto em Carvão, ponto em Laranja Barbarotti (forma, não texto) |
| Números, preços e hover do menu em laranja | Brasa |
| Botão laranja com texto branco | Brasa com texto branco (5,2:1) |
| Divisórias cinza-escuro | Linha |
| HUD sobre vídeo (cantos, título, timecode) | Branco, com uma sombra suave embaixo para garantir leitura |
| Topo da página | **Light Leak** só na abertura |
| — | **Golden Hour** em 2 detalhes, longe da abertura: o círculo "ver projeto" que segue o cursor (seta em Carvão) e a barra de progresso do upload no admin |

Nunca: texto branco sobre Laranja ou Âmbar, texto pequeno em Laranja ou Âmbar, Golden Hour e Light Leak na mesma tela.

---

## 6. Fonte

**Space Grotesk** (títulos, menu, HUD, botões) + **Inter** (textos). São as mesmas do Rushes e as duas são gratuitas para web (licença SIL Open Font). Carrego pelo `next/font`: os arquivos ficam no meu próprio domínio (nenhuma chamada ao Google), sem pulo de layout, só com os pesos usados (Space Grotesk 500/600/700, Inter 300/400/500) e com acentos (latin-ext). O timecode usa números de largura fixa da própria Space Grotesk, sem terceira fonte.

---

## 7. Interações: hover no desktop e o equivalente no toque

| Interação | Desktop | Toque |
|---|---|---|
| Botão "Fale comigo" | As letras sobem uma a uma e voltam (como no Rushes) | A animação roda ao tocar |
| Links do menu | Ficam em Brasa no hover | A seção em que você está fica marcada em Brasa |
| Card de trabalho | Vídeo toca, timecode REC, círculo que segue o cursor | Vídeo toca quando o card está no centro da tela (um por vez), seta fixa |
| Linhas do processo | Prévia flutuante segue o cursor; as outras linhas escurecem | Toque abre a linha e mostra o vídeo |
| Frase de números | Contador sobe ao entrar na tela (modo contador) | Igual |
| Depoimentos | Clique nos avatares | Toque nos avatares ou deslize |
| Perguntas | Sanfona (clique ou teclado) | Igual |

Com **reduzir movimento** ligado no sistema: nenhum vídeo toca sozinho nem em loop (só capa), o letreiro de logos fica parado, os contadores já aparecem no valor final, as letras não animam e as sanfonas abrem sem transição. Vídeos que tocam sozinhos têm um botão de pausa no HUD (exigência de acessibilidade para movimento com mais de 5 s).

---

## 8. Arquitetura

```
 Navegador (site público e /admin)
   │  recebe HTML pronto do servidor, com todo o texto (bom para Google e IAs)
   ▼
 Next.js (App Router, Node.js) ─────────────────────────────►  PostgreSQL
   · páginas públicas em cache, atualizadas quando você salva no admin     ▲
   · /admin protegido por senha (cookie de sessão assinado)                │
   · rotas de API: cadastros, upload em partes, formulário de contato      │
   · salva o arquivo original em disco temporário e cria a                 │
     mídia com status PENDENTE                                             │
   ▼                                                                       │
 Worker de mídia (Node.js + FFmpeg + sharp, mesmo projeto) ────────────────┘
   · pega o próximo item da fila (a própria tabela no Postgres, sem Redis)
   · comprime, envia para o armazenamento e marca PRONTO
   ▼
 Armazenamento de mídia: pasta local (no seu computador) · Cloudflare R2 (produção), servido por CDN
```

**Por que um worker separado, e não só rotas de API:** comprimir um vídeo leva de 1 a 5 minutos com o processador a 100%. Dentro de uma requisição, isso estoura o tempo limite (o Cloudflare corta em 100 s) e deixa o site lento para quem está visitando. Rodando à parte, o site continua rápido, uma falha do FFmpeg não derruba nada e dá para tentar de novo. Continua sendo Node.js, no mesmo projeto, com o mesmo banco: é só um segundo comando (`npm run worker`), sem serviço novo para manter.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS v4 com os tokens definidos por `@theme` a partir das variáveis do `paleta-soubarbarotti.md` (`bg-nevoa`, `text-carvao`, `text-brasa`, `bg-golden-hour`, `bg-light-leak`…) · Prisma + PostgreSQL · sharp · FFmpeg · jose (sessão) · argon2 (senha). Não uso biblioteca de animação: tudo é CSS mais um pouco de JavaScript meu.

---

## 9. Modelo do banco (PostgreSQL · Prisma)

| Tabela | Campos principais |
|---|---|
| **Media** | id · tipo (IMAGEM/VÍDEO) · status (PENDENTE/PROCESSANDO/PRONTO/ERRO) · nome original · tamanho · largura · altura · duração · segundo da capa · início da prévia · variantes (JSON com as URLs de cada versão) · blur (miniatura borrada para carregamento) · texto alternativo · erro · tentativas · datas |
| **Project** (trabalho) | id · slug · título · categoria · cliente · entrega · local · descrição curta · destaque (sim/não) · publicado (sim/não) · ordem · vídeo de abertura (Media) · capa opcional (Media) · vídeo completo (Media) **ou** link YouTube/Vimeo · briefing (título + texto) · direção criativa (título + texto) · produção com IA (título + texto) · finalização (título + texto) · título e descrição de SEO · datas |
| **ProjectCredit** | projeto · etapa · o que eu fiz · ferramentas · ordem |
| **ProjectGalleryItem** | projeto · mídia · tipo (FRAME/BASTIDOR) · legenda · ordem |
| **ProcessStep** | número (01–05) · título · descrição · ferramentas · vídeo (Media) · ordem |
| **Plan** | ordem · nome · descrição · valor (texto) · "sob consulta" (sim/não) |
| **Testimonial** | citação · nome · cargo · empresa · foto (Media) · publicado · ordem · "confirmo que é real e autorizado" (obrigatório para publicar) |
| **Faq** | pergunta · resposta · publicada · ordem |
| **Brand** (faixa de marcas) | nome · logo opcional (Media) · link · ordem · publicada |
| **ContactMessage** | nome · e-mail · mensagem · lida em · arquivada · data. Sem guardar IP (LGPD: só o necessário) |
| **Section** | chave (marcas, números, trabalhos, processo, sobre, planos, depoimentos, perguntas, contato) · **ligada/desligada** · selo REC · título linha 1 · título linha 2 · texto de apoio |
| **SiteSettings** (uma linha) | vídeo da abertura · selo de localização · frase da abertura · lista numerada · frase de números (trechos de texto e contadores com valor e sufixo) · sobre (foto, etiqueta, nome, função, bio) · e-mail · WhatsApp · Instagram · LinkedIn · YouTube · frase do rodapé · imagem de compartilhamento · título e descrição de SEO |
| **LoginAttempt** | data · resultado (para bloquear tentativa em massa de senha) |

**Admin (/admin):** Painel (mensagens novas, mídias processando e uma lista de todo `[PREENCHER]` que ainda aparece no site) · Trabalhos (criar, editar, reordenar arrastando, destaque, publicar) · Processo · Sobre · Planos · Depoimentos · Perguntas · Marcas · Mensagens (ler, marcar como lida, arquivar, responder por e-mail) · Seções (liga/desliga e edita os títulos) · Configurações · Mídias (biblioteca com status). Cada item tem "ver no site".

---

## 10. Upload e compressão

1. **Envio:** no admin, você escolhe o arquivo (vídeo até ~2 GB, imagem até 30 MB). O navegador envia em partes de 8 MB, com barra de progresso. Se a conexão cair, retoma de onde parou, e o limite de 100 MB por requisição do Cloudflare deixa de ser problema.
2. **Recebimento:** o servidor junta as partes em disco temporário, confere o tipo real do arquivo (pelo conteúdo, não pela extensão), cria a Media como PENDENTE e responde na hora. Você pode continuar editando.
3. **Processamento (worker):**
   - **Imagem → sharp:** corrige a rotação, remove a localização GPS e gera **AVIF + WebP** em 480, 960, 1600 e 2400 px, mais uma miniatura borrada para o carregamento. O site serve com `<picture>` e o navegador baixa só o tamanho necessário.
   - **Vídeo → FFmpeg:**
     - `completo.mp4`: **H.264** até 1080p (CRF 22), áudio AAC 128 kbps, `+faststart` (começa a tocar antes de baixar tudo). Usado na página do projeto.
     - `previa-720.mp4` e `previa-480.mp4`: **sem áudio**, 8 s a partir do segundo que você escolher, mais comprimidas (≈1–2 MB). Usadas nos loops mudos; o celular recebe a de 480.
     - **Capa gerada do próprio vídeo:** frame no segundo que você escolher (se não escolher, o FFmpeg pega um frame representativo), convertido em AVIF + WebP em 3 tamanhos.
     - Lê duração, largura e altura com o ffprobe.
   - Envia tudo com nome único (cache de 1 ano na CDN), apaga os temporários e marca PRONTO. Se der erro, marca ERRO com a mensagem e tenta de novo até 3 vezes.
4. **No admin:** a mídia aparece como "Processando…" e se atualiza sozinha. Quando fica pronta, você usa em trabalho, processo, sobre ou abertura. Ao salvar, só as páginas afetadas são atualizadas.
5. **YouTube/Vimeo:** você cola o link. O site mostra a capa (a sua ou a do YouTube) e só carrega o player quando alguém clica. Para a prévia em loop nos cards, o trabalho precisa de um vídeo seu (pode ser um trecho curto); sem ele, o card mostra só a capa.
6. **Original:** apagado depois de processado, para não pagar armazenamento em dobro. Guarde o master no seu computador ou Drive.

**Regras de carregamento:** todo vídeo tem capa, `preload="none"`, começa mudo e só carrega quando chega perto da tela. No celular, um único vídeo toca por vez, o mais visível; os outros ficam parados na capa. A abertura usa a prévia de 480 no celular.

---

## 11. Desempenho, acessibilidade e SEO

- **4G:** sem bibliotecas pesadas. A maior parte das páginas é HTML pronto do servidor; o JavaScript só entra nas partes interativas. Meta: título da abertura visível em menos de 2,5 s no 4G. A abertura carrega uma capa AVIF de ~40 KB antes do vídeo.
- **360 px:** teste automático (Playwright) em todas as páginas confere que nada passa da largura da tela em 360, 390, 810 e 1440.
- **Teclado:** contorno de foco em Brasa, visível em tudo; link "pular para o conteúdo"; sanfonas e menu com teclado e leitor de tela.
- **SEO:** title e description por página (os do plano de SEO) · imagem de compartilhamento 1200×630 gerada automaticamente (fundo branco, Light Leak, nome), e cada projeto usa a própria capa · favicon com o ponto REC (troco pelo logo quando você mandar) · JSON-LD do plano de SEO (Person + WebSite no site todo; VideoObject + BreadcrumbList nos projetos) · sitemap.xml · robots.txt liberando os robôs de busca das IAs (OAI-SearchBot, PerplexityBot, Claude-SearchBot, Google-Extended).
- **Segurança:** senha do admin guardada só como hash; bloqueio após tentativas erradas; cookie de sessão `httpOnly` + `secure`; formulário de contato com campo-armadilha anti-spam e limite de envios, sem captcha.

---

## 12. Hospedagem

| Opção | O que fica onde | Custo aproximado | Prós | Contras |
|---|---|---|---|---|
| **A · Railway + Cloudflare R2 (recomendo)** | Site, worker e Postgres no Railway; vídeos e fotos no R2; DNS e CDN no Cloudflare | Railway: US$ 5 de assinatura com US$ 5 de uso incluídos; no uso real, **US$ 8–15/mês**. R2: grátis até 10 GB, depois US$ 0,015/GB, **sem cobrança por visualização**. Total ≈ **R$ 45–85/mês** | Publica com um `git push`; FFmpeg sem limite de tempo; backup do banco; quase nada para manter | Servidores nos EUA. A CDN do Cloudflare entrega a mídia do Brasil, então no uso real a diferença é pequena. Cobrança por uso |
| **B · VPS em São Paulo + Coolify** | Tudo numa máquina (site, worker, Postgres, mídia em disco), com Cloudflare na frente | VPS com 2 vCPU e 4–8 GB: **≈ R$ 35–70/mês** | Mais barata por recurso, servidor no Brasil, preço fixo | Você cuida do servidor (atualizações, backups, disco). Configuração inicial maior |
| **C · Vercel + Neon + R2 + worker à parte** | Site na Vercel, banco no Neon, mídia no R2, FFmpeg em outro serviço | Vercel Pro **US$ 20/mês** (o plano grátis proíbe uso comercial) + worker **US$ 5+** ≈ **R$ 140+/mês** | Site muito rápido | O FFmpeg não roda na Vercel; são 4 serviços para gerenciar e é a mais cara |

Para as três: domínio .com.br no Registro.br ≈ R$ 40/ano (se ainda não for seu). O e-mail de aviso de mensagem nova é opcional (Resend, grátis até 3.000 por mês). Os preços são de referência; confirme na hora de assinar, porque mudam e dependem do dólar (considerei ~R$ 5,50).

**No seu computador:** a máquina não tem PostgreSQL nem Docker. Vou usar um Postgres embutido que o próprio `npm` instala (`embedded-postgres`) e o FFmpeg que já vem pelo pacote `ffmpeg-static`. Resultado: você instala só o Node.js (já tem) e roda `npm run dev`, sem instalar mais nada.

---

## 13. O que fica de fora (e por quê)

- **Números da página de vendas** (`p_gina_de_vendas_soubarbarotti.md`): "+340 leads" (Grand Life Residence Pagani), "+1.200 seguidores" (HOF Clinic), "custos reduzidos em até 80%", "entregas em dias". Não estão no `quem-e` e a regra é só dado confirmado. Ficam fora até você confirmar.
- **Páginas extras do plano de SEO** (/sobre, /servicos/…, /quanto-custa-video-com-ia, /processo como página própria): fora deste escopo. A estrutura aceita adicionar depois. As URLs seguem o seu pedido (`/trabalhos`); o PDF sugeria `/portfolio`.
- **Versão anterior nesta pasta** (Next 14 + SQLite + fonte Syne, de uma tentativa anterior): não atende à stack pedida. Movo para `_versao-anterior/` (sem apagar) e começo limpo. Mantenho a senha do admin que está no seu `.env`.
- **Prints do Rushes** (`referencia-rushes/`): ficam fora do Git e do deploy. Servem só de gabarito.

---

## 14. Perguntas antes de começar

Se você responder só "OK", sigo com o que está marcado como recomendado.

1. **Nome na página:** "Pedro Berben" (como no pedido) ou "Pedro Barbarotti Berben"? O plano de SEO recomenda este como nome oficial, igual ao Contra. *Recomendo o nome completo no card "sobre" e nos dados para o Google, e "Pedro" no texto corrido.*
2. **Título no celular:** "SOU / BARBAROTTI" (*recomendado*) ou "SOUBAR / BAROTTI" (letras maiores)?
3. **Tipos de vídeo da abertura:** confirma os 4? Entra "vídeo imobiliário"? O plano de SEO cita um trabalho para corretor que não está no `quem-e`.
4. **Números da página de vendas:** confirmados? Se sim, viram contadores na frase de números.
5. **Hospedagem:** A (*recomendada*), B ou C?
6. **Aviso por e-mail quando chegar mensagem:** quer? Se sim, em qual e-mail?
7. **Versão anterior:** posso mover para `_versao-anterior/`?
