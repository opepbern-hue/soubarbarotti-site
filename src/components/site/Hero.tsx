import type { SettingsView } from '@/lib/content';
import { AutoVideo } from './AutoVideo';
import { ScrollReveal, SplitText } from './ScrollReveal';

export function Hero({ settings }: { settings: SettingsView }) {
  const media = settings.heroMedia;
  const location = settings.heroLocation?.trim() || 'Palhoça, SC & Remoto';
  const tagline = settings.heroTagline;
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
      className="relative isolate flex min-h-[100dvh] h-screen min-h-[750px] lg:min-h-[880px] xl:min-h-[920px] w-full flex-col justify-between overflow-hidden bg-black text-white"
    >
      {/* 1. VÍDEO CINEMATOGRÁFICO DE FUNDO (PORSCHE / HERO MEDIA) */}
      {media ? (
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <AutoVideo
            media={media}
            priority={true}
            sizes="100vw"
            className="h-full w-full object-cover opacity-80 scale-100 transition-transform duration-1000"
          />
          {/* Gradação cinematográfica equilibrada: contraste preciso mantendo visibilidade ampla da cena */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.65)_100%)]" />
        </div>
      ) : (
        <div aria-hidden className="absolute inset-0 -z-10 bg-zinc-950" />
      )}

      {/* 2. BARRA SUPERIOR: REC: LOCALIZAÇÃO */}
      <div className="relative z-10 mx-auto w-full max-w-[1536px] px-6 sm:px-10 lg:px-14 xl:px-16 pt-24 sm:pt-32 lg:pt-36">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2.5 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444]" />
          </span>
          <span className="font-mono text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-zinc-300 drop-shadow">
            REC: {location.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 3. CENTRO MONUMENTAL: NOME GIGANTE ESTILO RUSHES ("BARBAROTTI.") */}
      <div className="relative z-10 mx-auto my-auto flex w-full max-w-[1536px] flex-1 items-center justify-center px-4 sm:px-8 lg:px-12 py-4">
        <h1 className="w-full text-center font-display text-[17vw] sm:text-[15.5vw] md:text-[14.5vw] lg:text-[14vw] xl:text-[13.5vw] font-black uppercase tracking-[-0.04em] leading-[0.82] select-none text-[#edebe6] drop-shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
          BARBAROTTI.
        </h1>
      </div>

      {/* 4. BLOCO INFERIOR: TAGLINE À ESQUERDA E DEMANDAS NUMERADAS À DIREITA */}
      <div className="relative z-10 mx-auto w-full max-w-[1536px] px-6 sm:px-10 lg:px-14 xl:px-16 pb-8 sm:pb-12 lg:pb-14">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 sm:gap-10">
          {/* Lado Esquerdo: Tagline do Barbarotti */}
          <div className="max-w-sm sm:max-w-md lg:max-w-lg">
            <ScrollReveal delay={100}>
              <p className="font-sans text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed text-zinc-300/90 font-light drop-shadow">
                {tagline ? <SplitText text={tagline} speed="fast" mode="words" delay={80} /> : null}
              </p>
            </ScrollReveal>
          </div>

          {/* Lado Direito: Demandas / Especialidades numeradas (01/, 02/, 03/...) */}
          {list.length > 0 && (
            <div className="md:text-right shrink-0">
              <ScrollReveal delay={150}>
                <ol
                  aria-label="Demandas e especialidades"
                  className="space-y-1 sm:space-y-1.5 font-display text-[12px] sm:text-[13px] md:text-[14px] font-medium tracking-wider uppercase text-white drop-shadow"
                >
                  {list.map((item, i) => (
                    <li key={i} className="block text-zinc-200">
                      <span className="font-mono text-zinc-400 font-normal mr-2">
                        {String(i + 1).padStart(2, '0')}/
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </ScrollReveal>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
