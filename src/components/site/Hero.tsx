import type { SettingsView } from '@/lib/content';
import { AutoVideo } from './AutoVideo';
import { ScrollReveal, SplitText } from './ScrollReveal';

export function Hero({ settings }: { settings: SettingsView }) {
  const media = settings.heroMedia;

  return (
    <section
      aria-label="Abertura"
      className="relative isolate flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-black text-white"
    >
      {/* 1. VÍDEO CINEMATOGRÁFICO DE FUNDO (PORSCHE / HERO MEDIA) */}
      {media ? (
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <AutoVideo
            media={media}
            priority={true}
            sizes="100vw"
            className="h-full w-full object-cover opacity-60 scale-105 transition-transform duration-1000"
          />
          {/* Gradação de contraste escuro para legibilidade de alto impacto */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.75)_100%)]" />
        </div>
      ) : null}

      {/* Espaçador superior para compensar o header */}
      <div className="h-24 sm:h-32" />

      {/* 2. CENTRO ELEVADO: SELOS QUE ESTAVAM EMBAIXO SUBIRAM + NOME MONUMENTAL + BOTÃO VER TRABALHOS */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 py-6 sm:px-10 lg:px-14">
        {/* Monograma e Selos de Habilidades (Subiram do rodapé para o centro) */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <div
            className="flex size-7 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md font-display text-[11px] font-bold text-white/80 shadow-md select-none"
            title="Barbarotti"
          >
            B
          </div>
          <span className="rounded border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] sm:text-[11px] text-zinc-300 uppercase tracking-wider">
            VÍDEOS COM IA
          </span>
          <span className="rounded border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] sm:text-[11px] text-zinc-300 uppercase tracking-wider">
            MOTION DESIGN
          </span>
          <span className="rounded border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-2.5 py-1 font-mono text-[10px] sm:text-[11px] text-[#ff6a00] font-semibold uppercase tracking-wider">
            ALTA CONVERSÃO
          </span>
        </div>

        {/* NOME GIGANTE CENTRAL: SOMENTE BARBAROTTI */}
        <div className="text-center w-full">
          <h1 className="font-display text-[16vw] sm:text-[13vw] lg:text-[11vw] font-black uppercase tracking-[-0.04em] leading-[0.88] select-none text-white drop-shadow-2xl">
            BARBAROTTI
          </h1>
        </div>

        {/* BOTÃO CENTRAL VIEW FINDER "VER TRABALHOS ↓" */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <a
            href="#trabalhos"
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 font-display text-[12px] sm:text-[13px] font-medium uppercase tracking-wider text-zinc-200 transition-all hover:text-white active:scale-95"
          >
            <span className="pointer-events-none absolute top-0 left-0 size-2.5 border-t border-l border-white/50 transition-colors group-hover:border-white" />
            <span className="pointer-events-none absolute top-0 right-0 size-2.5 border-t border-r border-white/50 transition-colors group-hover:border-white" />
            <span className="pointer-events-none absolute bottom-0 left-0 size-2.5 border-b border-l border-white/50 transition-colors group-hover:border-white" />
            <span className="pointer-events-none absolute bottom-0 right-0 size-2.5 border-b border-r border-white/50 transition-colors group-hover:border-white" />

            <span>Ver trabalhos</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-y-0.5">
              ↓
            </span>
          </a>
        </div>
      </div>

      {/* 3. BLOCO INFERIOR (POE EMBAIXO): A LINHA FICA BEM EM CIMA (SEPARADORA), SEM CORTAR NENHUM TEXTO */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-8 pt-4 sm:px-10 sm:pb-12 lg:px-14">
        {/* Linha técnica divisória colocada em local próprio (acima do bloco), com leitura 100% livre */}
        <div className="w-full border-t border-white/20 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-10">
            {/* Lado Esquerdo: Localização + Tagline mantendo rigorosamente a mesma fonte, peso e altura */}
            <div className="sm:max-w-md space-y-1.5">
              <p className="font-display text-[13px] sm:text-[14px] font-semibold uppercase tracking-wider text-white">
                {settings.heroLocation}
              </p>
              <ScrollReveal delay={100}>
                <p className="font-display text-[14px] sm:text-[15px] text-zinc-300 font-light leading-relaxed max-w-md">
                  <SplitText text={settings.heroTagline} speed="fast" mode="words" delay={80} />
                </p>
              </ScrollReveal>
            </div>

            {/* Lado Direito: Especialidades numeradas mantendo rigorosamente a mesma fonte, peso e altura */}
            {settings.heroList.length ? (
              <div className="sm:max-w-md sm:text-right">
                <ScrollReveal delay={150}>
                  <ol
                    aria-label="Especialidades e formatos"
                    className="font-display text-[13px] sm:text-[14px] uppercase tracking-wider leading-[1.4] space-y-1 text-white"
                  >
                    {settings.heroList.map((item, i) => (
                      <li key={i} className="block text-white/90">
                        <span className="text-zinc-400 font-mono font-medium">
                          {String(i + 1).padStart(2, '0')}/
                        </span>{' '}
                        <SplitText text={item} speed="medium" mode="chars" delay={100 + i * 60} />
                      </li>
                    ))}
                  </ol>
                </ScrollReveal>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
