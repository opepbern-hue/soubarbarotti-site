'use client';

import { useState, type PointerEvent } from 'react';
import type { ProcessStepView } from '@/lib/content';
import { AutoVideo } from './AutoVideo';
import { ScrollReveal, SplitText } from './ScrollReveal';
import { useCursorFollower } from './WorkCard';

/**
 * Linhas numeradas do processo (layout da seção de serviços).
 * Mouse: as outras linhas suavizam e o vídeo da etapa flutua junto ao cursor.
 * Toque e clique: abre sanfona expandida com o vídeo em alta definição.
 */
export function ProcessList({ steps }: { steps: ProcessStepView[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const { hostRef, dotRef, track } = useCursorFollower(hovered !== null, 0);

  const onMove = (e: PointerEvent, i: number) => {
    if (e.pointerType !== 'mouse') return;
    track(e, hovered === null);
    if (hovered !== i) setHovered(i);
  };

  return (
    <div
      ref={(el) => {
        hostRef.current = el;
      }}
      className="relative mt-[70px] lg:mt-[110px]"
      onPointerLeave={() => setHovered(null)}
    >
      <ol>
        {steps.map((s, i) => {
          const dim = hovered !== null && hovered !== i;
          const isHovered = hovered === i;
          const isOpen = open === i;
          return (
            <li
              key={s.id}
              className="border-b border-linha/80 transition-colors hover:border-black/30"
              onPointerEnter={(e) => onMove(e, i)}
              onPointerMove={(e) => onMove(e, i)}
            >
              <ScrollReveal delay={i * 80}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`etapa-${s.number}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={`grid w-full grid-cols-1 gap-y-4 py-[46px] text-left transition-all duration-300 md:py-[52px] lg:grid-cols-[56px_1fr_360px] lg:items-center lg:py-[64px] ${
                    dim ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  <span className="font-display text-[15px] font-mono font-semibold text-zinc-500">
                    {String(s.number).padStart(2, '0')}
                  </span>
                  <span className="font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.01em] md:text-[32px] lg:text-[36px]">
                    <SplitText text={s.title} speed="medium" mode="chars" delay={0} />
                  </span>
                  <span className="flex flex-col gap-3 lg:items-end lg:text-right">
                    <span className="max-w-[360px] text-[17px] font-light leading-[1.35] text-fumaca lg:text-[15px]">
                      <SplitText text={s.description} speed="fast" mode="words" delay={100} />
                    </span>
                    <span className="font-display text-[12px] font-medium uppercase tracking-[0.06em]">
                      <span className="text-fumaca font-normal">Ferramentas · </span>
                      <span className="font-semibold text-black">{s.tools}</span>
                    </span>
                  </span>
                </button>
              </ScrollReveal>

              <div id={`etapa-${s.number}`} hidden={!isOpen} className="pb-10">
                {isOpen ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-black/10 bg-black shadow-2xl lg:ml-[56px] lg:w-[min(760px,calc(100%-56px))]">
                    <AutoVideo media={s.media} mode="visible" sizes="(min-width: 1200px) 760px, 100vw" />
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Prévia flutuante de vídeo em HOVER que acompanha o mouse */}
      <span
        ref={dotRef}
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 z-30 hidden [@media(hover:hover)]:block transition-all duration-200 ease-out ${
          hovered === null || open !== null ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        }`}
      >
        <span className="relative block h-[230px] w-[340px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/20 bg-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-200 ${
                hovered === i ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {s.media ? (
                <AutoVideo
                  media={s.media}
                  mode="hover"
                  hovering={hovered === i && open === null}
                  sizes="340px"
                  fit="object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="rounded-full border border-white/20 bg-black/70 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  Etapa {String(s.number).padStart(2, '0')} // Preview
                </span>
                <span className="font-mono text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">
                  PLAYING
                </span>
              </div>
            </span>
          ))}
        </span>
      </span>
    </div>
  );
}
