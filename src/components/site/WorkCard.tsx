'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { ProjectCard } from '@/lib/content';
import { isPortrait } from '@/lib/media-shared';
import { AutoVideo } from './AutoVideo';
import { Viewfinder } from './Hud';
import { ArrowUpRight } from './icons';
import { Fill } from './Text';

export function timecode(sec: number): string {
  const s = Math.floor(sec);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/** Círculo "ver projeto" que segue o cursor com um pouco de atraso. */
export function useCursorFollower(active: boolean, size: number) {
  const hostRef = useRef<HTMLElement | null>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;
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
    const r = host.getBoundingClientRect();
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (jump) pos.current = { ...target.current };
  };

  return { hostRef, dotRef, track };
}

/** Card de trabalho em tela cheia com HUD de câmera (home) */
export function WorkCard({ project }: { project: ProjectCard }) {
  const [hovering, setHovering] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const { hostRef, dotRef, track } = useCursorFollower(hovering, 72);

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    track(e, !hovering);
    if (!hovering) setHovering(true);
  };

  return (
    <Link
      ref={(el) => {
        hostRef.current = el;
      }}
      href={`/portfolio/${project.slug}`}
      className="on-video group relative block aspect-[350/620] overflow-hidden bg-carvao text-white md:aspect-[770/1060] lg:aspect-[1400/880]"
      onPointerMove={onMove}
      onPointerLeave={() => setHovering(false)}
    >
      <AutoVideo
        media={project.media}
        mode="hover"
        hovering={hovering}
        onTime={setTime}
        onPlayingChange={setPlaying}
        sizes="100vw"
        // Card em pé no celular/tablet e deitado no desktop: o vídeo aparece inteiro quando o formato não bate
        fit={isPortrait(project.media) ? 'object-cover lg:object-contain' : 'object-contain lg:object-cover'}
        backdrop={isPortrait(project.media) ? 'hidden lg:block' : 'lg:hidden'}
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,14,10,.55)_0%,rgba(20,14,10,0)_32%,rgba(20,14,10,0)_68%,rgba(20,14,10,.45)_100%)]"
      />
      <Viewfinder className="inset-5 md:inset-[60px] lg:inset-20" />

      <span className="absolute left-10 right-10 top-10 md:left-[100px] md:top-[100px] lg:left-[124px] lg:top-[104px]">
        <h3 className="font-display text-[31px] font-semibold leading-none tracking-[-0.02em] md:text-[38px] lg:text-[48px]">
          <Fill text={project.title} />
        </h3>
        <span className="mt-3 block font-display text-[14px] font-medium uppercase tracking-[0.05em] text-white/85">
          <Fill text={project.category} />
        </span>
      </span>

      {project.media?.placeholder || !project.media ? (
        <mark className="preencher absolute bottom-24 left-10 font-display text-[11px] uppercase md:bottom-auto md:left-auto md:right-[100px] md:top-[100px]">
          [PREENCHER: vídeo do projeto]
        </mark>
      ) : null}

      <span
        aria-hidden
        className={`absolute bottom-9 left-10 flex items-center gap-2 font-display text-[13px] font-medium tabular-nums tracking-[0.08em] transition-opacity duration-300 md:left-1/2 md:-translate-x-1/2 lg:bottom-[92px] ${
          playing ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="rec-dot !size-2" />
        REC <span className="ml-1">{timecode(time)}</span>
      </span>

      {/* Toque: seta fixa no canto · Mouse: círculo que segue o cursor */}
      <span
        aria-hidden
        className="absolute bottom-7 right-7 grid size-14 place-items-center rounded-full bg-white text-black shadow-xl [@media(hover:hover)]:hidden"
      >
        <ArrowUpRight className="size-6" />
      </span>
      <span
        ref={dotRef}
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 hidden size-[72px] place-items-center rounded-full bg-white text-black shadow-xl transition-[opacity,scale] duration-300 [@media(hover:hover)]:grid ${
          hovering ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <ArrowUpRight className="size-7" />
      </span>
      <span className="sr-only">: ver projeto</span>
    </Link>
  );
}
