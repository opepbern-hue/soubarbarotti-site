'use client';

import Link from 'next/link';
import { useState, type PointerEvent } from 'react';
import type { ProjectCard, SectionView } from '@/lib/content';
import { isPortrait } from '@/lib/media-shared';
import { AutoVideo } from './AutoVideo';
import { Container, RecLabel, Viewfinder } from './Hud';
import { ArrowUpRight } from './icons';
import { Fill } from './Text';
import { timecode, useCursorFollower } from './WorkCard';

function ProjectStackCard({
  project,
  index,
  total,
}: {
  project: ProjectCard;
  index: number;
  total: number;
}) {
  const [hovering, setHovering] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const portrait = isPortrait(project.media);
  const { hostRef, dotRef, track } = useCursorFollower(hovering, 80);

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    track(e, !hovering);
    if (!hovering) setHovering(true);
  };

  const posterBg = project.media?.img?.src || project.media?.blur;

  return (
    <div
      className="sticky top-20 sm:top-24 lg:top-28 pb-10 sm:pb-14 lg:pb-16 transition-transform"
      style={{ zIndex: index + 10 }}
    >
      <Link
        ref={(el) => {
          hostRef.current = el;
        }}
        href={`/portfolio/${project.slug}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHovering(false)}
        className="on-video group relative block h-[70vh] sm:h-[74vh] lg:h-[78vh] min-h-[500px] max-h-[760px] w-full overflow-hidden rounded-3xl border border-white/20 bg-[#0a0a0d] text-white shadow-[0_-20px_60px_rgba(0,0,0,0.9)] transition-all duration-500 hover:border-white/40"
      >
        {/* 1. MÍDIA: TRATAMENTO DIFERENCIADO WIDESCREEN vs VERTICAL */}
        {portrait ? (
          <>
            {/* Ambient blurred glow no fundo do card */}
            {posterBg ? (
              <span
                aria-hidden
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-125 pointer-events-none transition-opacity duration-700"
                style={{ backgroundImage: `url(${posterBg})` }}
              />
            ) : null}
            <span aria-hidden className="absolute inset-0 bg-black/60 pointer-events-none" />

            {/* Layout para vídeos em pé (9:16): Desktop split / Mobile centrado */}
            <div className="relative z-10 flex h-full w-full flex-col lg:flex-row items-center justify-between p-6 sm:p-10 lg:p-14 gap-6">
              {/* Informações à esquerda em telas grandes */}
              <div className="flex flex-1 flex-col justify-between h-full py-2 z-10">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-zinc-400 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                      {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                    </span>
                    <span className="font-display text-[12px] font-semibold uppercase tracking-wider text-zinc-300">
                      <Fill text={project.category} />
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white drop-shadow-md">
                    <Fill text={project.title} />
                  </h3>

                  {project.shortDescription && (
                    <p className="mt-4 max-w-md font-sans text-sm sm:text-base leading-relaxed text-zinc-300/90 font-light hidden sm:block">
                      {project.shortDescription}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-display text-[12px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                    <span>9:16 Vertical</span>
                  </span>

                  <span className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-[13px] font-bold uppercase tracking-wider text-black transition-all group-hover:bg-zinc-200 group-hover:scale-105 shadow-xl">
                    Ver Case <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </div>

              {/* Moldura elegante do vídeo 9:16 */}
              <div className="relative shrink-0 aspect-[9/16] h-[75%] sm:h-[82%] lg:h-[92%] max-h-[620px] rounded-2xl overflow-hidden border border-white/25 bg-black shadow-[0_25px_60px_rgba(0,0,0,0.95)] group-hover:border-white/50 transition-all duration-300">
                <AutoVideo
                  media={project.media}
                  mode="visible"
                  hovering={true}
                  onTime={setTime}
                  onPlayingChange={setPlaying}
                  sizes="(min-width: 1024px) 35vw, 75vw"
                  fit="object-cover"
                />
                <Viewfinder className="inset-4 opacity-40 group-hover:opacity-80 transition-opacity" />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"
                />

                {/* Live timecode no topo da moldura */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-white pointer-events-none">
                  <span className="bg-black/70 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">
                    ● REC
                  </span>
                  <span className="bg-black/70 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">
                    {timecode(time)}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Layout para vídeos widescreen (16:9) */}
            <AutoVideo
              media={project.media}
              mode="visible"
              hovering={true}
              onTime={setTime}
              onPlayingChange={setPlaying}
              sizes="100vw"
              fit="object-cover"
            />

            {/* Gradients de alto contraste para leitura perfeita */}
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/20 to-black/90 pointer-events-none"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)] pointer-events-none"
            />

            {/* Viewfinder da câmera */}
            <Viewfinder className="inset-5 sm:inset-8 lg:inset-12 opacity-35 group-hover:opacity-80 transition-opacity" />

            {/* Barra superior do Card */}
            <div className="absolute top-6 left-6 right-6 sm:top-8 sm:left-8 sm:right-8 lg:top-10 lg:left-10 lg:right-10 flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-zinc-300 bg-black/75 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                  {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
                <span className="font-display text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-zinc-300 bg-black/75 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md">
                  <Fill text={project.category} />
                </span>
              </div>

              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-white bg-black/75 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md">
                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                {timecode(time)}
              </span>
            </div>

            {/* Barra inferior do Card */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 lg:bottom-10 lg:left-10 lg:right-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none z-10">
              <div className="max-w-xl">
                <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white drop-shadow-lg">
                  <Fill text={project.title} />
                </h3>
                {project.shortDescription && (
                  <p className="mt-2 line-clamp-2 max-w-lg font-sans text-xs sm:text-sm leading-relaxed text-zinc-300 font-light drop-shadow">
                    {project.shortDescription}
                  </p>
                )}
              </div>

              <span className="pointer-events-auto self-start sm:self-end flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-[13px] font-bold uppercase tracking-wider text-black transition-all group-hover:bg-zinc-200 group-hover:scale-105 shadow-2xl">
                Ver Case <ArrowUpRight className="size-4" />
              </span>
            </div>
          </>
        )}

        {/* Cursor Magnético com "Ver Case ↗" no hover em desktop */}
        <span
          ref={dotRef}
          aria-hidden
          className={`pointer-events-none absolute left-0 top-0 z-30 hidden lg:grid size-20 place-items-center rounded-full bg-[#ff6a00] font-display text-[11px] font-bold uppercase tracking-wider text-black shadow-2xl transition-opacity duration-200 ${
            hovering ? 'opacity-90' : 'opacity-0'
          }`}
        >
          <span className="flex items-center gap-1">
            Ver <ArrowUpRight className="size-3.5" />
          </span>
        </span>
      </Link>
    </div>
  );
}

export function WorksSection({
  projects,
  section,
}: {
  projects: ProjectCard[];
  section: SectionView;
}) {
  if (!projects.length) return null;

  return (
    <section
      id="trabalhos"
      aria-label="Trabalhos em destaque"
      className="scroll-mt-16 bg-[#070709] text-white py-[90px] lg:py-[130px] border-y border-white/10 relative overflow-visible shadow-2xl"
    >
      {/* Textura sutil e vinheta escura de alto contraste */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06)_0%,transparent_70%)]" />

      {/* Título da Seção */}
      <Container className="relative z-10 mb-12 sm:mb-16 lg:mb-20">
        <div className="flex items-end justify-between">
          <div>
            <RecLabel className="text-zinc-400">{section.label || 'REC: TRABALHOS'}</RecLabel>
            <h2 className="mt-2 font-display text-[32px] sm:text-[40px] lg:text-[48px] font-bold leading-tight tracking-[-0.02em] text-white">
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
            Portfólio completo ({projects.length}) <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </Container>

      {/* CONTAINER DE CARTÕES EMPILHADOS (STICKY STACKING CARDS ON SCROLL) */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="relative flex flex-col gap-6 sm:gap-10 lg:gap-14">
          {projects.map((project, idx) => (
            <ProjectStackCard
              key={project.id}
              project={project}
              index={idx}
              total={projects.length}
            />
          ))}
        </div>
      </div>

      {/* Botão Inferior para Portfólio Completo */}
      <div className="mt-16 sm:mt-20 flex justify-center relative z-10 px-5">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 font-display text-[14px] font-semibold uppercase tracking-[0.05em] text-white hover:bg-white hover:text-black transition-all border border-white/20 rounded-full px-7 py-3.5 bg-black/80 backdrop-blur-md shadow-2xl hover:scale-105 active:scale-95"
        >
          Ver o portfólio completo ({projects.length}) <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
