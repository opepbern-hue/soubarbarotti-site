'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ProjectCard } from '@/lib/content';
import { isPortrait } from '@/lib/media-shared';
import { AutoVideo } from './AutoVideo';
import { RollText } from './Hud';
import { Fill } from './Text';
import { WorkCard } from './WorkCard';

/**
 * Portfólio completo no formato da página `/work` da Paragon:
 * - Palco Hero superior interativo com os 3 primeiros filmes em destaque ([1], [2], [3])
 * - Arquivo completo abaixo ("WORK BUILT ON TRUST") com filtro de categorias e alternância GRID | INDEX
 */
export function PortfolioGrid({
  projects,
  headingLine1 = 'Os filmes',
  headingLine2 = 'que eu dirigi',
  intro = '',
}: {
  projects: ProjectCard[];
  headingLine1?: string;
  headingLine2?: string;
  intro?: string;
}) {
  const [heroIdx, setHeroIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'index'>('grid');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const heroProjects = useMemo(() => projects.slice(0, 3), [projects]);
  const activeHero = heroProjects[heroIdx] ?? projects[0];

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const [activeCat, setActiveCat] = useState<string | null>(null);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('categoria');
    if (c && categories.some(([name]) => name === c)) setActiveCat(c);
  }, [categories]);

  const chooseCat = (c: string | null) => {
    setActiveCat(c);
    const url = new URL(window.location.href);
    if (c) url.searchParams.set('categoria', c);
    else url.searchParams.delete('categoria');
    window.history.replaceState(null, '', url);
  };

  const shown = activeCat ? projects.filter((p) => p.category === activeCat) : projects;

  return (
    <div className="bg-paragon-black text-paragon-white">
      {/* 1. PALCO HERO DE DESTAQUE (100svh com seletor [1] [2] [3] idêntico ao /work da Paragon) */}
      {activeHero ? (
        <section
          aria-label="Projetos em destaque"
          className="relative flex min-h-[88svh] w-full flex-col justify-end overflow-hidden border-b border-paragon-white/22 bg-paragon-black pt-28 pb-10 lg:min-h-[94svh] lg:pb-14"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <AutoVideo
              key={activeHero.id}
              media={activeHero.media}
              mode="visible"
              priority
              sizes="100vw"
              fit={
                isPortrait(activeHero.media)
                  ? 'object-cover object-[center_20%] opacity-75'
                  : 'object-cover object-center opacity-80'
              }
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/85" />
          </div>

          <div className="paragon-container relative z-10 flex flex-col items-center text-center">
            <p className="text-paragon-kicker mb-2 text-paragon-white/85">
              <Fill text={activeHero.category} />
            </p>
            <h2 className="text-paragon-h1 max-w-[980px] text-paragon-white">
              <Fill text={activeHero.title} />
            </h2>
            <div className="mt-6">
              <Link href={`/portfolio/${activeHero.slug}`} className="u-button u-button--red">
                <RollText text="Assistir projeto" />
              </Link>
            </div>
          </div>

          {/* Barra Inferior do Palco: Botões [1] [2] [3] + Indicadores de Progresso */}
          {heroProjects.length > 1 ? (
            <div className="paragon-container relative z-10 mt-12">
              <div className="flex flex-col gap-4 border-t border-paragon-white/25 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2" role="group" aria-label="Selecionar destaque">
                  {heroProjects.map((hp, i) => (
                    <button
                      key={hp.id}
                      type="button"
                      onClick={() => setHeroIdx(i)}
                      aria-pressed={heroIdx === i}
                      className={`h-9 border px-3 font-kicker text-[13px] transition-colors ${
                        heroIdx === i
                          ? 'border-paragon-white bg-paragon-white text-paragon-black'
                          : 'border-paragon-white/35 bg-paragon-black/60 text-paragon-white hover:border-paragon-white'
                      }`}
                    >
                      [{i + 1}]
                    </button>
                  ))}
                </div>

                <div className="grid flex-1 grid-cols-3 gap-3 sm:max-w-[540px]">
                  {heroProjects.map((hp, i) => (
                    <button
                      key={hp.id}
                      type="button"
                      onClick={() => setHeroIdx(i)}
                      className="text-left"
                    >
                      <span className="block truncate font-kicker text-[11px] text-paragon-white/80 uppercase">
                        0{i + 1} // {hp.title}
                      </span>
                      <span className="mt-1.5 block h-[2px] w-full bg-paragon-white/25">
                        <span
                          className={`block h-full bg-paragon-red transition-all duration-500 ${
                            heroIdx === i ? 'w-full' : 'w-0'
                          }`}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* 2. ARQUIVO COMPLETO ("WORK BUILT ON TRUST" da Paragon) */}
      <section aria-label="Arquivo de projetos" className="py-[72px] lg:py-[120px]">
        <div className="paragon-container">
          <div className="flex flex-col justify-between gap-8 pb-10 lg:flex-row lg:items-end lg:pb-14">
            <div>
              <p className="text-paragon-kicker mb-3 text-paragon-red">ARQUIVO COMPLETO ({projects.length})</p>
              <h1 className="text-paragon-h1 text-paragon-white">
                <span className="block">{headingLine1}</span>
                {headingLine2 ? <span className="block">{headingLine2}</span> : null}
              </h1>
              {intro ? <p className="text-paragon-body mt-4 max-w-[460px] text-paragon-grey-400">{intro}</p> : null}
            </div>

            {/* Alternador de Visualização (GRID | INDEX) idêntico ao /work da Paragon */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-stretch border border-paragon-white/35" role="group" aria-label="Modo de visualização">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  className={`px-4 py-2 font-kicker text-[13px] uppercase transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-paragon-white text-paragon-black'
                      : 'bg-transparent text-paragon-white hover:bg-paragon-white/10'
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('index')}
                  aria-pressed={viewMode === 'index'}
                  className={`border-l border-paragon-white/35 px-4 py-2 font-kicker text-[13px] uppercase transition-colors ${
                    viewMode === 'index'
                      ? 'bg-paragon-white text-paragon-black'
                      : 'bg-transparent text-paragon-white hover:bg-paragon-white/10'
                  }`}
                >
                  Index
                </button>
              </div>
            </div>
          </div>

          {/* Filtro de Categorias em Células Arquitetônicas */}
          {categories.length > 1 ? (
            <div
              role="group"
              aria-label="Filtrar por categoria"
              className="mb-10 flex flex-wrap items-center border-t border-l border-paragon-white/22"
            >
              <button
                type="button"
                aria-pressed={activeCat === null}
                onClick={() => chooseCat(null)}
                className={`border-r border-b border-paragon-white/22 px-4 py-2.5 font-kicker text-[13px] uppercase transition-colors ${
                  activeCat === null
                    ? 'bg-paragon-red text-paragon-black'
                    : 'bg-paragon-black text-paragon-white hover:bg-paragon-white/10'
                }`}
              >
                Todos [{projects.length}]
              </button>
              {categories.map(([name, n]) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={activeCat === name}
                  onClick={() => chooseCat(name)}
                  className={`border-r border-b border-paragon-white/22 px-4 py-2.5 font-kicker text-[13px] uppercase transition-colors ${
                    activeCat === name
                      ? 'bg-paragon-red text-paragon-black'
                      : 'bg-paragon-black text-paragon-white hover:bg-paragon-white/10'
                  }`}
                >
                  {name} [{n}]
                </button>
              ))}
            </div>
          ) : null}

          {/* MODO GRID: Grade Arquitetônica da Paragon (2 cards no topo + 3 cards por linha) */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 border-t border-l border-paragon-white/22 lg:grid-cols-6">
              {shown.map((project, idx) => {
                const mod = idx % 5;
                const spanClass = mod === 0 || mod === 1 ? 'lg:col-span-3' : 'lg:col-span-2';
                return (
                  <div key={project.id} className={`${spanClass} border-r border-b border-paragon-white/22`}>
                    <WorkCard project={project} index={idx} className="h-full" />
                  </div>
                );
              })}
            </div>
          ) : (
            /* MODO INDEX: Tabela de 3 Colunas da Paragon (PROJETO | CLIENTE | CATEGORIA) com preview no hover */
            <div className="border-t border-paragon-white/22">
              <div className="hidden grid-cols-12 border-b border-paragon-white/22 py-3 font-kicker text-[12px] text-paragon-grey-400 uppercase md:grid">
                <span className="col-span-4">Projeto</span>
                <span className="col-span-5">Sinopse</span>
                <span className="col-span-3 text-right">Categoria</span>
              </div>
              <ul>
                {shown.map((p, idx) => (
                  <li key={p.id} className="border-b border-paragon-white/22">
                    <Link
                      href={`/portfolio/${p.slug}`}
                      onPointerEnter={() => setHoveredRow(idx)}
                      onPointerLeave={() => setHoveredRow(null)}
                      className="group relative grid grid-cols-1 items-center gap-2 py-6 transition-colors hover:bg-paragon-white/5 md:grid-cols-12 md:gap-4 lg:py-7"
                    >
                      <div className="flex items-baseline gap-4 md:col-span-4">
                        <span className="font-kicker text-[12px] text-paragon-grey-400">
                          [{String(idx + 1).padStart(2, '0')}]
                        </span>
                        <span className="text-paragon-h5 text-paragon-white transition-colors group-hover:text-paragon-red">
                          <Fill text={p.title} />
                        </span>
                      </div>
                      <span className="line-clamp-1 font-sans text-[15px] text-paragon-white/85 md:col-span-5">
                        <Fill text={p.shortDescription || p.category} />
                      </span>
                      <span className="font-sans text-[15px] text-paragon-grey-400 md:col-span-3 md:text-right">
                        <Fill text={p.category} />
                      </span>

                      {hoveredRow === idx && p.media ? (
                        <div className="pointer-events-none absolute top-1/2 right-[28%] z-20 hidden aspect-[16/10] w-[260px] -translate-y-1/2 overflow-hidden border border-paragon-white bg-paragon-black shadow-2xl lg:block">
                          <AutoVideo
                            media={p.media}
                            mode="visible"
                            hovering={true}
                            sizes="260px"
                            fit={isPortrait(p.media) ? 'object-cover object-[center_20%]' : 'object-cover'}
                          />
                        </div>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
