import Image from 'next/image';
import Link from 'next/link';
import type { SettingsView } from '@/lib/content';
import { AutoVideo } from './AutoVideo';
import { BarbarottiSymbol } from './Header';
import { RollText } from './Hud';
import { ScrollReveal, SplitText } from './ScrollReveal';

export function Hero({ settings }: { settings: SettingsView }) {
  const media = settings.heroMedia;

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
      {/* 1. Vídeo full-bleed contínuo de fundo (visível pelas letras vazadas no topo e no palco inferior) */}
      {media ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <AutoVideo
            media={media}
            priority={true}
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/60" />
        </div>
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-paragon-black" />
      )}

      {/* 2. Banner Superior Monumental estilo Paragon:
             - Topo sólido #FFFFFF cobrindo a área atrás da navbar fixa
             - Wordmark BARBAROTTI em knockout transparente recortado na base do banner */}
      <div className="relative z-10 flex w-full flex-col overflow-hidden select-none h-[42vh] sm:h-[46vh] lg:h-[50vh]">
        {/* Espaço branco flexível que garante a faixa branca limpa desde o topo até a base das letras */}
        <div className="w-full flex-1 bg-paragon-white" />

        {/* Wordmark Monumental BARBAROTTI vazado (4320x960 lossless WebP knockout) */}
        <div className="relative w-[101vw] -left-[0.5vw] flex-none -mb-2 sm:-mb-3 lg:-mb-4 leading-none">
          <h1 className="sr-only">Barbarotti — {tagline}</h1>
          <Image
            src="/barbarotti-banner.webp"
            alt="BARBAROTTI"
            width={4320}
            height={960}
            priority
            fetchPriority="high"
            className="block h-auto w-full object-contain pointer-events-none select-none"
          />
        </div>
      </div>

      {/* 3. Rodapé Clean do Hero (Emblema à esquerda + Headline e Botão Laranja ao centro + Selo @soubarbarotti à direita) */}
      <div className="paragon-container relative z-10 mt-auto flex flex-1 flex-col justify-end pt-12 pb-6 lg:pb-8">
        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
          {/* Canto Inferior Esquerdo: Símbolo / Emblema Clean do Barbarotti */}
          <div className="order-2 hidden items-end lg:order-1 lg:col-span-3 lg:flex">
            <div className="inline-flex flex-col items-center gap-1.5 text-paragon-white/90">
              <div className="flex h-[32px] w-[64px] items-center justify-center rounded-full border border-paragon-white/80 bg-black/35 backdrop-blur-[2px]">
                <BarbarottiSymbol className="size-4 text-paragon-blue" />
              </div>
              <span className="font-kicker text-[8.5px] tracking-[0.2em] text-paragon-white/80 uppercase">
                DIREÇÃO &amp; IA
              </span>
            </div>
          </div>

          {/* Centro: Frase de Impacto + Botão Retangular Laranja Barbarotti (#FF6A00) */}
          <div className="order-1 flex flex-col items-center text-center lg:order-2 lg:col-span-6">
            <ScrollReveal delay={50}>
              <p className="font-display text-[clamp(1.65rem,2.5vw,2.5rem)] leading-[1.02] font-bold tracking-[0.015em] text-paragon-white uppercase drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)]">
                <SplitText text={headline.toUpperCase()} speed="fast" mode="words" delay={30} />
              </p>
            </ScrollReveal>

            <ScrollReveal delay={120} className="mt-4">
              <Link href="/#trabalhos" className="u-button u-button--red">
                <RollText text="Ver trabalhos selecionados" />
              </Link>
            </ScrollReveal>
          </div>

          {/* Canto Inferior Direito: Emblema Assinatura em Pílula (idêntico ao canto inferior direito da Paragon) */}
          <div className="order-3 flex items-end justify-between lg:col-span-3 lg:justify-end">
            <div className="inline-flex items-center gap-2 lg:hidden">
              <div className="flex h-[28px] w-[56px] items-center justify-center rounded-full border border-paragon-white/75 bg-black/30">
                <BarbarottiSymbol className="size-3.5 text-paragon-blue" />
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
              className="group inline-flex flex-col items-end gap-1 text-paragon-white transition-opacity hover:opacity-90"
            >
              <span className="font-kicker text-[7.5px] tracking-[0.2em] text-paragon-white/75 uppercase">
                CREATIVE DIRECTION
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-paragon-white/85 bg-black/35 px-4 py-1.5 backdrop-blur-[2px] transition-colors group-hover:border-paragon-blue">
                <BarbarottiSymbol className="size-3.5 text-paragon-blue" />
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
