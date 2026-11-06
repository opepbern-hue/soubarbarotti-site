'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { ProjectCard } from '@/lib/content';
import { isPortrait } from '@/lib/media-shared';
import { AutoVideo } from './AutoVideo';
import { Fill } from './Text';

export function timecode(sec: number): string {
  const s = Math.floor(sec);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/** Cursor flutuante com interpolação linear speed = 0.15 (SCRIPT 10 da Paragon) */
export function useCursorFollower(active: boolean, size: number) {
  const hostRef = useRef<HTMLElement | null>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const rectRef = useRef<{ left: number; top: number; time: number } | null>(null);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15;
      pos.current.y += (target.current.y - pos.current.y) * 0.15;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x - size / 2}px, ${pos.current.y - size / 2}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, size]);

  const track = (e: PointerEvent, jump: boolean) => {
    const host = hostRef.current;
    if (!host) return;
    const now = performance.now();
    if (!rectRef.current || now - rectRef.current.time > 400) {
      const r = host.getBoundingClientRect();
      rectRef.current = { left: r.left, top: r.top, time: now };
    }
    const r = rectRef.current;
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (jump) pos.current = { ...target.current };
  };

  return { hostRef, dotRef, track };
}

/** Card de projeto no formato arquitetônico da Paragon (featured-work_card) */
export function WorkCard({
  project,
  index = 0,
  className = '',
}: {
  project: ProjectCard;
  index?: number;
  className?: string;
}) {
  const [hovering, setHovering] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const { hostRef, dotRef, track } = useCursorFollower(hovering, 84);
  const portrait = isPortrait(project.media);

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    track(e, !hovering);
    if (!hovering) setHovering(true);
  };

  const subLabel =
    project.shortDescription && !/\[PREENCHER/i.test(project.shortDescription)
      ? project.shortDescription
      : project.category;

  return (
    <Link
      ref={(el) => {
        hostRef.current = el;
      }}
      href={`/portfolio/${project.slug}`}
      onPointerMove={onMove}
      onPointerLeave={() => setHovering(false)}
      className={`featured-work_card_content group relative flex flex-col justify-between bg-paragon-black p-4 text-paragon-white transition-colors duration-300 lg:p-6 ${className}`}
    >
      {/* Quadro do Vídeo / Capa com proporção cinematográfica e enquadramento preservando o sujeito */}
      <div className="featured-work_card_image relative aspect-[16/10] w-full overflow-hidden bg-paragon-grey-600">
        <AutoVideo
          media={project.media}
          mode="hover"
          hovering={hovering}
          onTime={setTime}
          onPlayingChange={setPlaying}
          sizes="(min-width: 1024px) 50vw, 100vw"
          fit={
            portrait
              ? 'object-cover object-[center_20%] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]'
              : 'object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]'
          }
        />

        {/* Timecode sutil no canto superior direito quando em reprodução */}
        <span
          aria-hidden
          className={`pointer-events-none absolute top-3 right-3 border border-paragon-white/25 bg-paragon-black/75 px-2 py-0.5 font-kicker text-[11px] text-paragon-white tabular-nums transition-opacity duration-300 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {timecode(time)}
        </span>

        {/* Índice numérico discreto no canto superior esquerdo */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-3 left-3 border border-paragon-white/25 bg-paragon-black/75 px-2 py-0.5 font-kicker text-[11px] text-paragon-white/80"
        >
          [{String(index + 1).padStart(2, '0')}]
        </span>

        {/* Cursor flutuante estilo Paragon (STYLE 10: .custom-cursor_icon) */}
        <span
          ref={dotRef}
          aria-hidden
          className={`pointer-events-none absolute top-0 left-0 z-20 hidden h-[36px] min-w-[84px] place-items-center border border-paragon-black bg-paragon-red px-3 font-kicker text-[12px] leading-none font-medium text-paragon-black uppercase transition-[opacity,transform] duration-300 [@media(hover:hover)]:grid ${
            hovering ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          <span>Assistir ↗</span>
        </span>
      </div>

      {/* Rodapé Arquitetônico do Card (Título 28px uppercase à esquerda, Categoria à direita, Cliente abaixo) */}
      <div className="mt-4 flex flex-col gap-1.5 pt-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-paragon-h5 text-paragon-white transition-colors duration-300 group-hover:text-paragon-red">
            <Fill text={project.title} />
          </h3>
          <span className="shrink-0 font-sans text-[14px] leading-[1.31] text-paragon-white/90 lg:text-[16px]">
            <Fill text={project.category} />
          </span>
        </div>

        <p className="line-clamp-1 font-sans text-[14px] leading-[1.31] text-paragon-grey-400 lg:text-[15px]">
          <Fill text={subLabel} />
        </p>
      </div>
    </Link>
  );
}
