# Paleta de cores do @soubarbarotti

> Branco como tela, laranja como luz.

Documento de referência visual da marca, atualizado em setembro de 2026. Complementa o `quem-e-soubarbarotti.md`. A prévia com todas as cores está em `paleta-soubarbarotti-previa.png`.

---

## A ideia

O branco é a tela: fundo limpo, com muito respiro, para o trabalho ser o protagonista. O laranja é a luz, aquela luz quente de fim de tarde que o cinema usa para criar clima, e aparece só onde a atenção precisa ir.

O gradiente é essa luz em movimento, do âmbar à brasa. Por isso os gradientes têm nomes de luz: Golden Hour, Amanhecer e Light Leak.

## Cores principais

| Cor | HEX | RGB | Papel |
|---|---|---|---|
| **Branco Tela** | `#FFFFFF` | 255, 255, 255 | Fundo principal. Domina todas as peças |
| **Névoa** | `#FFF2E8` | 255, 242, 232 | Fundo secundário: seções alternadas, caixas de destaque, cards |
| **Carvão** | `#241C16` | 36, 28, 22 | Texto principal e títulos |
| **Âmbar** | `#FFA62B` | 255, 166, 43 | Brilho: início do gradiente, reflexos e detalhes de luz |
| **Laranja Barbarotti** | `#FF6A00` | 255, 106, 0 | A cor-assinatura: formas, faixas, ícones e fundos de destaque |
| **Brasa** | `#C24100` | 194, 65, 0 | O laranja para texto: links, palavras em laranja e botões com texto branco |

## Cores de apoio

| Cor | HEX | RGB | Papel |
|---|---|---|---|
| **Fumaça** | `#75685E` | 117, 104, 94 | Texto secundário: legendas, datas, informações de apoio |
| **Linha** | `#EFE5DC` | 239, 229, 220 | Bordas e divisórias |

## Gradientes

### Golden Hour (o principal)

```css
linear-gradient(135deg, #FFA62B 0%, #FF6A00 50%, #C24100 100%)
```

O gesto visual mais forte da marca: âmbar no canto superior esquerdo, brasa no inferior direito. Use em faixas, formas, capas, molduras e fundos de destaque. Se precisar de texto em cima, use Carvão e coloque na metade clara (âmbar e laranja).

### Amanhecer (fundo suave)

```css
linear-gradient(180deg, #FFFFFF 0%, #FFF2E8 100%)
```

Branco que esquenta de leve de cima para baixo. Serve de fundo para seções grandes, slides de carrossel e topo do site sem tirar o branco do comando. Aceita qualquer texto em Carvão.

### Light Leak (brilho de canto)

```css
background:
  radial-gradient(ellipse 75% 100% at 85% 0%,
    rgba(255, 106, 0, 0.28) 0%,
    rgba(255, 166, 43, 0.12) 45%,
    rgba(255, 166, 43, 0) 100%),
  #FFFFFF;
```

Um brilho quente saindo do canto superior direito, como o vazamento de luz de uma lente. É a referência mais direta ao cinema dentro da paleta. Use em capas, thumbnails e no topo da página inicial do site, sempre por cima do branco.

## Proporção

| Quanto | Cores | Onde |
|---|---|---|
| 70% | Branco Tela e Névoa | Fundos e respiro |
| 20% | Carvão e Fumaça | Texto |
| 10% | Âmbar, Laranja Barbarotti, Brasa e gradientes | Destaques |

O laranja só funciona como destaque se aparecer pouco. Quando tudo é laranja, nada chama atenção.

## Contraste: o que dá para ler

Laranja vivo com branco é uma combinação que engana: fica bonita, mas o texto não lê bem. A referência aqui é a WCAG, o padrão internacional de acessibilidade: 4,5:1 é o mínimo para texto normal e 3:1 para texto grande (a partir de uns 24 px, ou 19 px em negrito).

| Texto | Fundo | Contraste | Resultado |
|---|---|---|---|
| Carvão | Branco Tela | 16,8:1 | Qualquer texto |
| Fumaça | Branco Tela | 5,4:1 | Texto secundário |
| Brasa | Branco Tela | 5,2:1 | Texto e links em laranja |
| Branco Tela | Brasa | 5,2:1 | Botão com texto branco |
| Carvão | Laranja Barbarotti | 5,8:1 | Botão ou etiqueta laranja |
| Carvão | Âmbar | 8,6:1 | Etiqueta e texto na parte clara do Golden Hour |
| Carvão | Brasa | 3,2:1 | Só título grande |
| Laranja Barbarotti | Branco Tela | 2,9:1 | Evitar em texto; só formas e grafismos |
| Branco Tela | Laranja Barbarotti | 2,9:1 | Evitar |
| Âmbar | Branco Tela | 2,0:1 | Evitar em texto; só brilho e detalhe |

Sobre a Névoa os números caem um pouco, mas as combinações aprovadas acima continuam passando (Brasa fica em 4,7:1 e Fumaça em 4,9:1).

## Regras rápidas

| Faça | Evite |
|---|---|
| Deixar o branco dominar e usar laranja só nos destaques | Encher a peça de laranja |
| Usar Brasa quando o texto precisar ser laranja | Texto pequeno em Laranja Barbarotti ou Âmbar |
| Usar Carvão para texto sobre o laranja vivo | Texto branco sobre Laranja Barbarotti ou Âmbar |
| Um gradiente de destaque por peça (Golden Hour ou Light Leak) | Golden Hour e Light Leak juntos na mesma tela |
| Ficar nos tons quentes da paleta | Somar azul, verde, roxo ou outras cores saturadas |
| Gradiente em fundos, faixas, formas e molduras | Gradiente em texto corrido |

## Aplicações

| Onde | Como aplicar |
|---|---|
| Site | Fundo Branco Tela, seções alternadas em Névoa, botões em Brasa com texto branco e Light Leak no topo da página inicial |
| Carrossel e posts | Fundo branco ou Amanhecer, títulos em Carvão e o Golden Hour numa faixa ou forma de destaque |
| Capas e thumbnails | Frame do vídeo com Light Leak ou moldura em Golden Hour; texto em branco ou Carvão, o que contrastar melhor com a imagem |

## Código pronto (CSS)

```css
:root {
  /* Base */
  --branco-tela: #FFFFFF;
  --nevoa: #FFF2E8;
  --carvao: #241C16;
  --fumaca: #75685E;
  --linha: #EFE5DC;

  /* Laranjas */
  --ambar: #FFA62B;
  --laranja-barbarotti: #FF6A00;
  --brasa: #C24100;

  /* Gradientes */
  --grad-golden-hour: linear-gradient(135deg, #FFA62B 0%, #FF6A00 50%, #C24100 100%);
  --grad-amanhecer: linear-gradient(180deg, #FFFFFF 0%, #FFF2E8 100%);
  --grad-light-leak: radial-gradient(ellipse 75% 100% at 85% 0%, rgba(255, 106, 0, 0.28) 0%, rgba(255, 166, 43, 0.12) 45%, rgba(255, 166, 43, 0) 100%);
}

/* O Light Leak vai sempre por cima do branco */
.fundo-light-leak {
  background: var(--grad-light-leak), var(--branco-tela);
}
```

## Para prompts de IA (imagem e vídeo)

No formato do campo HEX VALUES dos prompts de foto:

```
HEX VALUES: ["#ffffff", "#fff2e8", "#ff6a00", "#ffa62b", "#c24100", "#241c16"]
```

Descrição da paleta em inglês, para colar em qualquer prompt:

```
Brand palette: pure white (#FFFFFF) as the dominant background with plenty of negative space, vivid orange (#FF6A00) as the accent color, warm golden hour gradient from amber (#FFA62B) to orange (#FF6A00) to deep ember (#C24100), charcoal (#241C16) for text and deep shadows. Clean, bright, warm and cinematic, with orange only on key accents.
```
