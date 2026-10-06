'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { ProjectCard, SectionView } from '@/lib/content';
import { isPortrait } from '@/lib/media-shared';
import { AutoVideo } from './AutoVideo';
import { Container, RecLabel, Viewfinder } from './Hud';
import { ArrowUpRight } from './icons';
import { Fill } from './Text';
import { timecode } from './WorkCard';

export function WorksSection({
  projects,
  section,
}: {
  projects: ProjectCard[];
  section: SectionView;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [hoveringIndex, setHoveringIndex] = useState<number | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);

  // Sync scroll on mobile carousel
  const scrollToSlide = (index: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const items = container.querySelectorAll<HTMLElement>('[data-carousel-item]');
    if (items[index]) {
      items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setActiveIndex(index);
    }
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-carousel-item]'));
    const containerCenter = container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    items.forEach((item, idx) => {
      const itemCenter = item.offsetLeft + item.clientWidth / 2;
      const distance = Math.abs(containerCenter - itemCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  const activeProject = projects[activeIndex] || projects[0];
  if (!projects.length) return null;

  const activePortrait = isPortrait(activeProject.media);

  return (
    <section
      id="trabalhos"
      aria-label="Trabalhos em destaque"
      className="scroll-mt-16 bg-[#09090c] text-white py-[90px] lg:py-[120px] border-y border-white/10 relative overflow-hidden shadow-2xl"
    >
      {/* Textura sutil e vinheta escura de alto contraste */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06)_0%,transparent_70%)]" />

      <Container className="relative z-10">
        <div className="flex items-end justify-between">
          <div>
            <RecLabel className="text-zinc-400">{section.label || 'REC: Trabalhos'}</RecLabel>
            <h2 className="mt-2 font-display text-[30px] font-bold leading-tight tracking-[-0.02em] text-white md:text-[38px] lg:text-[46px]">
              {section.titleLine1 || 'Projetos em Destaque'}
              {section.titleLine2 && (
                <span className="block text-zinc-400 font-normal">{section.titleLine2}</span>
              )}
            </h2>
          </div>

          <Link
            href="/portfolio"
            className="hidden items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-white/90 border border-white/20 bg-white/5 hover:bg-white hover:text-black rounded-full px-5 py-2.5 transition-all duration-300 md:flex shadow-lg"
          >
            Portfólio completo <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </Container>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET VIEW: ADAPTIVE 9:16 / 16:9 CAROUSEL (< lg) */}
      {/* ========================================================================= */}
      <div className="mt-8 lg:hidden relative z-10">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto gap-5 px-5 pb-4 scrollbar-none items-center"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {projects.map((project, idx) => {
            const isSelected = activeIndex === idx;
            const portrait = isPortrait(project.media);
            return (
              <div
                key={project.id}
                data-carousel-item
                className={`shrink-0 snap-center transition-all duration-300 ${
                  portrait ? 'w-[78vw] max-w-[330px]' : 'w-[88vw] max-w-[520px]'
                }`}
              >
                <Link
                  href={`/portfolio/${project.slug}`}
                  className={`on-video group relative block overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isSelected ? 'border-white/50 shadow-[0_15px_35px_rgba(0,0,0,0.8)] scale-[1.01]' : 'border-white/15 opacity-80'
                  } bg-black text-white ${portrait ? 'aspect-[9/16]' : 'aspect-[16/9]'}`}
                >
                  <AutoVideo
                    media={project.media}
                    mode="hover"
                    hovering={isSelected}
                    onTime={(t) => isSelected && setTime(t)}
                    onPlayingChange={(p) => isSelected && setPlaying(p)}
                    sizes="85vw"
                    fit="object-cover"
                  />

                  {/* Dark gradient overlay for text readability */}
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/60 pointer-events-none"
                  />

                  {/* Viewfinder Corners */}
                  <Viewfinder className="inset-4 opacity-40 group-hover:opacity-80" />

                  {/* Top Bar: Index + Category & Live REC */}
                  <span className="absolute left-4 right-4 top-4 flex items-center justify-between font-display text-[11px] font-semibold uppercase tracking-wider text-white">
                    <span className="rounded-full border border-white/20 bg-black/75 px-3 py-1 backdrop-blur-md">
                      {String(idx + 1).padStart(2, '0')} · <Fill text={project.category} />
                    </span>
                    {isSelected && playing && (
                      <span className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-300 font-bold bg-black/75 px-2.5 py-1 rounded-full border border-white/20">
                        <span className="rec-dot !size-1.5" />
                        {timecode(time)}
                      </span>
                    )}
                  </span>

                  {/* Bottom Info: Title & Arrow */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="font-display text-[19px] font-bold leading-tight tracking-tight text-white drop-shadow-md">
                        <Fill text={project.title} />
                      </h3>
                      <span className="mt-1 flex items-center gap-1 text-[12px] font-medium text-white/80">
                        Ver case <ArrowUpRight className="size-3.5" />
                      </span>
                    </div>

                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-black transition-transform duration-300 group-hover:scale-110 shadow-xl">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Carousel Controls: Indicators & Arrows */}
        <div className="mt-4 flex items-center justify-between px-5">
          <div className="flex items-center gap-1.5">
            {projects.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToSlide(idx)}
                aria-label={`Ir para o trabalho ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToSlide(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              aria-label="Trabalho anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur-md transition-all disabled:opacity-30 disabled:pointer-events-none hover:border-white hover:bg-black"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollToSlide(Math.min(projects.length - 1, activeIndex + 1))}
              disabled={activeIndex === projects.length - 1}
              aria-label="Próximo trabalho"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur-md transition-all disabled:opacity-30 disabled:pointer-events-none hover:border-white hover:bg-black"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW: ADAPTIVE ASPECT-RATIO CINEMATIC SHOWCASE (>= lg) */}
      {/* ========================================================================= */}
      <div className="mt-10 hidden px-5 lg:block lg:px-[100px] relative z-10">
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Main Stage Video Player (Col 8) */}
          <div className="col-span-8 flex flex-col justify-between overflow-hidden rounded-3xl border border-white/20 bg-black relative group shadow-[0_30px_90px_rgba(0,0,0,0.9)] transition-all duration-500">
            {/* Ambient blurred backdrop for portrait vertical videos */}
            {activePortrait && (
              <div className="absolute inset-0 -z-10 overflow-hidden opacity-30 blur-3xl scale-125 pointer-events-none">
                <AutoVideo
                  media={activeProject.media}
                  mode="hover"
                  hovering={true}
                  sizes="100vw"
                  fit="object-cover"
                />
              </div>
            )}

            <Link
              href={`/portfolio/${activeProject.slug}`}
              className={`on-video relative block w-full overflow-hidden transition-all duration-500 ${
                activePortrait
                  ? 'aspect-[9/16] max-h-[660px] max-w-[370px] mx-auto my-5 rounded-2xl border border-white/25 shadow-2xl'
                  : 'aspect-[16/9] w-full'
              }`}
              onPointerEnter={() => setHoveringIndex(activeIndex)}
              onPointerLeave={() => setHoveringIndex(null)}
            >
              <AutoVideo
                media={activeProject.media}
                mode="hover"
                hovering={true}
                onTime={setTime}
                onPlayingChange={setPlaying}
                sizes="(min-width: 1200px) 65vw, 100vw"
                fit="object-cover"
              />

              {/* Dark overlay gradients */}
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/60 pointer-events-none"
              />

              {/* Viewfinder Corners */}
              <Viewfinder className="inset-6 opacity-40 group-hover:opacity-80 transition-opacity" />

              {/* Stage Top Bar */}
              <div className="absolute left-6 right-6 top-6 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-3.5 py-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  PROJETO {String(activeIndex + 1).padStart(2, '0')} // {activePortrait ? '9:16' : '16:9'}
                </span>

                <span className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-3.5 py-1.5 font-mono text-[11px] font-bold text-white backdrop-blur-md transition-opacity duration-300 ${playing ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="rec-dot !size-1.5" />
                  {timecode(time)}
                </span>
              </div>

              {/* Stage Bottom Info */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
                <div className="max-w-xl">
                  <span className="font-display text-[11px] font-semibold uppercase tracking-widest text-zinc-300">
                    <Fill text={activeProject.category} />
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl drop-shadow-md">
                    <Fill text={activeProject.title} />
                  </h3>
                </div>

                <span className="pointer-events-auto flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-[13px] font-bold uppercase tracking-wider text-black transition-all duration-300 group-hover:scale-105 group-hover:bg-zinc-200 shadow-xl">
                  Ver Case <ArrowUpRight className="size-4" />
                </span>
              </div>
            </Link>
          </div>

          {/* Interactive Project Filmstrip List (Col 4) */}
          <div className="col-span-4 flex flex-col gap-3 justify-between">
            {projects.map((project, idx) => {
              const isActive = activeIndex === idx;
              const isItemPortrait = isPortrait(project.media);
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`group relative flex items-center gap-4 rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                    isActive
                      ? 'border-white/50 bg-zinc-900/95 shadow-2xl scale-[1.02] ring-1 ring-white/30'
                      : 'border-white/10 bg-black/60 hover:border-white/30 hover:bg-zinc-900/60'
                  }`}
                >
                  {/* Thumbnail Box matching video aspect ratio */}
                  <div className={`relative shrink-0 overflow-hidden rounded-xl border border-white/20 bg-black ${
                    isItemPortrait ? 'h-16 w-12' : 'h-16 w-24'
                  }`}>
                    <AutoVideo
                      media={project.media}
                      mode="hover"
                      hovering={isActive || hoveringIndex === idx}
                      sizes="150px"
                      fit="object-cover"
                    />
                    {isActive && (
                      <span className="absolute inset-0 bg-white/10 ring-1 ring-white/40 pointer-events-none" />
                    )}
                  </div>

                  {/* Project Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate font-display text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        <Fill text={project.category} />
                      </span>
                    </div>

                    <h4 className={`mt-0.5 truncate font-display text-base font-bold transition-colors ${isActive ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                      <Fill text={project.title} />
                    </h4>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {isItemPortrait ? '9:16 Vertical' : '16:9 Widescreen'}
                    </span>
                  </div>

                  {/* Active Indicator Arrow */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                    isActive ? 'bg-white text-black shadow-lg scale-105' : 'bg-white/5 text-zinc-400 group-hover:text-white group-hover:bg-white/10'
                  }`}>
                    <ArrowUpRight className="size-4" />
                  </div>
                </button>
              );
            })}

            <div className="mt-3 text-right">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
              >
                Ver todos os {projects.length} trabalhos <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Container className="mt-8 flex justify-center lg:hidden relative z-10">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 font-display text-[14px] font-semibold uppercase tracking-[0.05em] text-white hover:bg-white hover:text-black transition-colors border border-white/20 rounded-full px-6 py-3 bg-black/80 backdrop-blur-md shadow-lg"
        >
          Ver o portfólio completo ({projects.length}) <ArrowUpRight className="size-4" />
        </Link>
      </Container>
    </section>
  );
}
