'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ProjectCard } from '@/lib/content';
import { isPortrait } from '@/lib/media-shared';
import { AutoVideo } from './AutoVideo';
import { ArrowUpRight } from './icons';
import { Fill } from './Text';
import { timecode } from './WorkCard';

function PortfolioCard({ project, index }: { project: ProjectCard; index: number }) {
  const [hovering, setHovering] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const portrait = isPortrait(project.media) || !project.media;
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      className="on-video group relative block aspect-[9/16] overflow-hidden bg-carvao text-white"
    >
      <AutoVideo
        media={project.media}
        mode="hover"
        hovering={hovering}
        onTime={setTime}
        onPlayingChange={setPlaying}
        sizes="(min-width: 1200px) 25vw, (min-width: 810px) 33vw, 50vw"
        fit={portrait ? 'object-cover' : 'object-contain'}
        backdrop={portrait ? undefined : 'block'}
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,14,10,.5)_0%,rgba(20,14,10,0)_28%,rgba(20,14,10,0)_60%,rgba(20,14,10,.7)_100%)]"
      />
      {/* Cantos de visor */}
      <span aria-hidden className="pointer-events-none absolute inset-3 md:inset-4">
        <i className="absolute left-0 top-0 size-5 border-l border-t border-white/60 md:size-7" />
        <i className="absolute right-0 top-0 size-5 border-r border-t border-white/60 md:size-7" />
        <i className="absolute bottom-0 left-0 size-5 border-b border-l border-white/60 md:size-7" />
        <i className="absolute bottom-0 right-0 size-5 border-b border-r border-white/60 md:size-7" />
      </span>

      <span className="absolute left-5 right-5 top-5 flex items-center justify-between font-display text-[10px] font-medium uppercase tracking-[0.08em] md:left-7 md:right-7 md:top-7 md:text-[11px]">
        <span>
          {String(index + 1).padStart(2, '0')} · <Fill text={project.category} />
        </span>
        <span className={`flex items-center gap-1.5 tabular-nums transition-opacity duration-300 ${playing ? 'opacity-100' : 'opacity-0'}`} aria-hidden>
          <span className="rec-dot !size-1.5" />
          {timecode(time)}
        </span>
      </span>

      <span className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 md:bottom-7 md:left-7 md:right-7">
        <h2 className="font-display text-[18px] font-semibold leading-[1.05] tracking-[-0.02em] md:text-[22px] lg:text-[24px]">
          <Fill text={project.title} />
        </h2>
        <span
          aria-hidden
          className="grid size-9 flex-none place-items-center rounded-full bg-white/90 text-carvao transition-transform duration-300 group-hover:scale-110 md:size-10"
        >
          <ArrowUpRight className="size-4" />
        </span>
      </span>
    </Link>
  );
}

/** Portfólio completo: grade de vídeos com filtro por categoria */
export function PortfolioGrid({ projects }: { projects: ProjectCard[] }) {
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('categoria');
    if (c && categories.some(([name]) => name === c)) setActive(c);
  }, [categories]);

  const choose = (c: string | null) => {
    setActive(c);
    const url = new URL(window.location.href);
    if (c) url.searchParams.set('categoria', c);
    else url.searchParams.delete('categoria');
    window.history.replaceState(null, '', url);
  };

  const shown = active ? projects.filter((p) => p.category === active) : projects;
  const chip = (on: boolean) =>
    `h-9 rounded-full px-4 font-display text-[13px] font-medium uppercase tracking-[0.02em] transition-colors ${
      on ? 'bg-carvao text-white' : 'bg-branco-tela text-carvao ring-1 ring-linha hover:text-brasa'
    }`;

  return (
    <>
      {categories.length > 1 ? (
        <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={active === null} onClick={() => choose(null)} className={chip(active === null)}>
            Todos <span className="opacity-60">{projects.length}</span>
          </button>
          {categories.map(([name, n]) => (
            <button key={name} type="button" aria-pressed={active === name} onClick={() => choose(name)} className={chip(active === name)}>
              {name} <span className="opacity-60">{n}</span>
            </button>
          ))}
        </div>
      ) : null}
      <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {shown.map((p) => (
          <li key={p.id}>
            <PortfolioCard project={p} index={projects.indexOf(p)} />
          </li>
        ))}
      </ul>
    </>
  );
}
