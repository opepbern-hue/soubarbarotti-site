import Link from 'next/link';
import { preload } from 'react-dom';
import type { SettingsView } from '@/lib/content';
import { AutoVideo } from './AutoVideo';
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

  const location = (settings.heroLocation?.trim() || 'Palhoça, SC & Remoto').replace(/^●?\s*REC:\s*/i, '');
  const tagline =
    settings.heroTagline?.trim() ||
    'Direção cinematográfica e motion design com IA generativa para marcas e empreendedores que buscam alto padrão visual e conversão real.';
  const list =
    Array.isArray(settings.heroList) && settings.heroList.length > 0
      ? settings.heroList
      : [
          'Comerciais de Alto Padrão',
          'Vídeos com IA & Motion Design',
          'Audiovisual Imobiliário',
          'Posicionamento de Autoridade',
        ];

  return (
    <section
      aria-label="Abertura"
      className="relative isolate flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-paragon-black text-paragon-white"
    >
      {/* 1. Vídeo full-bleed de fundo (visível tanto através das letras vazadas no topo quanto no palco abaixo) */}
      {media ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <AutoVideo
            media={media}
            priority={true}
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/75" />
        </div>
      ) : (
        <div aria-hidden className=" absolute inset-0 -z-10 bg-paragon-black" />
      )}

      {/* 2. Faixa Superior #f8f8f8 com Título Gigante em Máscara Vazada (Knockout Mask idêntica à Paragon) */}
      <div className="relative z-10 w-full select-none">
        {/* Espaço sólido #f8f8f8 atrás da navbar fixa */}
        <div className="h-[74px] w-full bg-paragon-white lg:h-[86px]" />

        {/* Máscara SVG onde o fundo é #f8f8f8 e as letras "BARBAROTTI" são janelas transparentes para o vídeo */}
        <div className="relative w-full overflow-hidden leading-none">
          <h1 className="sr-only">Barbarotti — {tagline}</h1>
          <svg
            viewBox="0 0 1440 235"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            className="block h-[19vw] min-h-[82px] max-h-[245px] w-full"
          >
            <defs>
              <mask id="paragon-hero-knockout" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="1440" height="235" fill="white" />
                <text
                  x="720"
                  y="206"
                  textAnchor="middle"
                  fill="black"
                  style={{
                    fontFamily: 'var(--font-display), Impact, sans-serif',
                    fontWeight: 700,
                    fontSize: '258px',
                    letterSpacing: '-0.01em',
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
              height="235"
              fill="#f8f8f8"
              mask="url(#paragon-hero-knockout)"
            />
          </svg>
        </div>
      </div>

      {/* 3. Rodapé do Hero (Subtítulo condensado centralizado + CTA Coral Red #ff5b4b + Metadados laterais) */}
      <div className="paragon-container relative z-10 mt-auto pt-24 pb-7 lg:pb-10">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          {/* Canto Inferior Esquerdo: Especialidades e Localização (como o selo circular/técnico da Paragon) */}
          <div className="order-2 lg:order-1 lg:col-span-3">
            <div className="inline-flex flex-col gap-1.5 border border-paragon-white/30 bg-paragon-black/55 px-3.5 py-2.5 backdrop-blur-xs">
              <span className="font-kicker text-[11px] tracking-[0.06em] text-paragon-red uppercase">
                {location}
              </span>
              <ul aria-label="Especialidades" className="flex flex-wrap gap-x-2 gap-y-0.5 font-sans text-[12px] leading-snug text-paragon-white/85">
                {list.slice(0, 3).map((item, i) => (
                  <li key={i} className="inline-flex items-center gap-1.5">
                    {i > 0 && <span aria-hidden="true" className="text-paragon-white/40">//</span>}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Centro: Frase de impacto condensada + Botão Coral Red (#ff5b4b) */}
          <div className="order-1 flex flex-col items-center text-center lg:order-2 lg:col-span-6">
            <ScrollReveal delay={60}>
              <p className="text-paragon-h4 mx-auto max-w-[680px] text-paragon-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.65)]">
                <SplitText text={tagline} speed="fast" mode="words" delay={40} />
              </p>
            </ScrollReveal>

            <ScrollReveal delay={140} className="mt-5">
              <Link href="/#trabalhos" className="u-button u-button--red">
                <RollText text="Ver trabalhos selecionados" />
              </Link>
            </ScrollReveal>
          </div>

          {/* Canto Inferior Direito: Assinatura & Demandas complementares */}
          <div className="order-3 flex items-end justify-between lg:col-span-3 lg:justify-end">
            <div className="text-left lg:text-right">
              <p className="font-display text-[22px] leading-none font-medium tracking-tight text-paragon-white uppercase">
                @soubarbarotti
              </p>
              {list.length > 3 ? (
                <p className="mt-1 font-kicker text-[11px] text-paragon-white/75 uppercase">
                  {list.slice(3).join(' // ')}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
