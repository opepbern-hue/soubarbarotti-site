import Link from 'next/link';
import { preload } from 'react-dom';
import type { SettingsView } from '@/lib/content';
import { AutoVideo } from './AutoVideo';
import { BarbarottiSymbol } from './Header';
import { RollText } from './Hud';
import { ScrollReveal, SplitText } from './ScrollReveal';

export function Hero({ settings }: { settings: SettingsView }) {
  const media = settings.heroMedia;
  if (media?.img) {
    preload(media.img.src, {
      as: 'image',
      fetchPriority: 'high',
      imageSrcSet: media.img.avif,
      imageSizes: '100vw',
      type: 'image/avif',
    });
  }

  const tagline =
    settings.heroTagline?.trim() ||
    'Direção cinematográfica e motion design com IA generativa para marcas e empreendedores que buscam alto padrão visual e conversão real.';

  const headline =
    settings.footerLine1 && settings.footerLine2
      ? `${settings.footerLine1.replace(/[.,;]+$/, '')} ${settings.footerLine2.replace(/\.$/, '')}`
      : 'A SUA IDEIA COM CARA DE CINEMA';

  return (
    <section
      aria-label="Abertura"
      className="relative isolate flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-paragon-black text-paragon-white"
    >
      {/* 1. Vídeo full-bleed de fundo contínuo (visível dentro das letras vazadas no topo e no palco abaixo) */}
      {media ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <AutoVideo
            media={media}
            priority={true}
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/65" />
        </div>
      ) : (
        <div aria-hidden className=" -z-10 bg-paragon-black" />
      )}

      {/* 2. Faixa Superior #FFFFFF com Wordmark Monumental em Máscara Vazada (Knockout Mask estilo Paragon) */}
      <div className="relative z-10 w-full select-none">
        {/* Espaço sólido branco (#FFFFFF) atrás da navbar fixa */}
        <div className="h-[76px] w-full bg-paragon-white lg:h-[90px]" />

        {/* Máscara SVG onde o fundo é #FFFFFF e as letras "BARBAROTTI" são janelas transparentes para o vídeo */}
        <div className="relative w-full overflow-hidden leading-none">
          <h1 className="sr-only">Barbarotti — {tagline}</h1>
          <svg
            viewBox="0 0 1440 248"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="block h-[18.5vw] min-h-[84px] max-h-[252px] w-full"
          >
            <defs>
              <mask id="barbarotti-hero-knockout" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="1440" height="248" fill="white" />
                <text
                  x="720"
                  y="208"
                  textAnchor="middle"
                  textLength="1344"
                  lengthAdjust="spacingAndGlyphs"
                  fill="black"
                  style={{
                    fontFamily: 'var(--font-display), Impact, sans-serif',
                    fontWeight: 800,
                    fontSize: '236px',
                    letterSpacing: '-0.015em',
                    textTransform: 'uppercase',
                  }}
                >
                  BARBAROTTI
                </text>
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="1440"
              height="248"
              fill="#ffffff"
              mask="url(#barbarotti-hero-knockout)"
            />
          </svg>
        </div>
      </div>

      {/* 3. Rodapé Clean do Hero (Emblema à esquerda + Frase e Botão Laranja ao centro + Selo @soubarbarotti à direita) */}
      <div className="paragon-container relative z-10 mt-auto pt-24 pb-6 lg:pb-8">
        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
          {/* Canto Inferior Esquerdo: Símbolo / Emblema Clean do Barbarotti */}
          <div className="order-2 hidden items-end lg:order-1 lg:col-span-3 lg:flex">
            <div className="inline-flex flex-col items-center gap-1 text-paragon-white/90">
              <div className="flex h-[30px] w-[62px] items-center justify-center rounded-full border border-paragon-white/80 bg-black/25 backdrop-blur-[2px]">
                <BarbarottiSymbol className="size-4 text-paragon-red" />
              </div>
              <span className="font-kicker text-[8.5px] tracking-[0.18em] text-paragon-white/75 uppercase">
                DIREÇÃO &amp; IA
              </span>
            </div>
          </div>

          {/* Centro: Frase Condensada Clean + Botão Retangular Laranja Barbarotti (#FF6A00) */}
          <div className="order-1 flex flex-col items-center text-center lg:order-2 lg:col-span-6">
            <ScrollReveal delay={60}>
              <p className="font-display text-[clamp(1.6rem,2.4vw,2.35rem)] leading-[1.02] font-bold tracking-[0.01em] text-paragon-white uppercase drop-shadow-[0_2px_16px_rgba(0,0,0,0.65)]">
                <SplitText text={headline.toUpperCase()} speed="fast" mode="words" delay={40} />
              </p>
            </ScrollReveal>

            <ScrollReveal delay={130} className="mt-3.5">
              <Link href="/#trabalhos" className="u-button u-button--red">
                <RollText text="Ver trabalhos selecionados" />
              </Link>
            </ScrollReveal>
          </div>

          {/* Canto Inferior Direito: Emblema Assinatura em Pílula (idêntico ao canto inferior direito da Paragon) */}
          <div className="order-3 flex items-end justify-between lg:col-span-3 lg:justify-end">
            <div className="inline-flex items-center gap-2 lg:hidden">
              <div className="flex h-[26px] w-[50px] items-center justify-center rounded-full border border-paragon-white/75 bg-black/25">
                <BarbarottiSymbol className="size-3.5 text-paragon-red" />
              </div>
              <span className="font-kicker text-[9px] tracking-[0.16em] text-paragon-white/75 uppercase">
                DIREÇÃO &amp; IA
              </span>
            </div>

            <a
              href={settings.instagramUrl || 'https://www.instagram.com/soubarbarotti/'}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram @soubarbarotti"
              className="group inline-flex flex-col items-end gap-0.5 text-paragon-white transition-opacity hover:opacity-90"
            >
              <span className="font-kicker text-[7.5px] tracking-[0.2em] text-paragon-white/75 uppercase">
                CREATIVE DIRECTION
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-paragon-white/85 bg-black/25 px-3.5 py-1 backdrop-blur-[2px] transition-colors group-hover:border-paragon-red">
                <BarbarottiSymbol className="size-3.5 text-paragon-red" />
                <span className="font-display text-[17px] leading-none font-semibold tracking-tight text-paragon-white uppercase">
                  Barbarotti
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
