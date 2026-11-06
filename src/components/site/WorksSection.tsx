'use client';

import Link from 'next/link';
import type { ProjectCard, SectionView } from '@/lib/content';
import { RollText } from './Hud';
import { ScrollReveal, SplitText } from './ScrollReveal';
import { WorkCard } from './WorkCard';

export function WorksSection({
  projects,
  section,
}: {
  projects: ProjectCard[];
  section: SectionView;
}) {
  if (!projects.length) return null;

  const headingText = [section.titleLine1 || 'Trabalhos', section.titleLine2 || 'Selecionados']
    .filter(Boolean)
    .join(' ');
  const introText =
    section.intro ||
    'Projetos comerciais e filmes dirigidos com IA generativa, motion design e finalização cinematográfica.';

  return (
    <section
      id="trabalhos"
      aria-label="Trabalhos selecionados"
      className="featured-work_wrap scroll-mt-16 bg-paragon-black py-[64px] text-paragon-white lg:py-[120px]"
    >
      <div className="paragon-container">
        {/* Cabeçalho Monumental da Paragon: Display 156px à esquerda + H2 48px alinhado à direita */}
        <div className="mb-10 flex flex-col justify-between gap-6 lg:mb-14 lg:flex-row lg:items-end">
          <div className="lg:max-w-[62%]">
            {section.label ? (
              <p className="text-paragon-kicker mb-3 text-paragon-red">
                {section.label.replace(/^\[|\]$/g, '')}
              </p>
            ) : null}
            <h2 className="text-paragon-display text-paragon-white">
              <ScrollReveal as="span" delay={40}>
                <SplitText text={headingText} speed="slow" mode="words" />
              </ScrollReveal>
            </h2>
          </div>

          <div className="lg:max-w-[420px] lg:text-right">
            <ScrollReveal delay={120}>
              <p className="text-paragon-h3 text-paragon-white">
                <SplitText text={introText} speed="fast" mode="words" delay={60} />
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* Grid Arquitetônico da Paragon (STYLE 13: 5n+1 e 5n+2 ocupam 3/6 colunas; demais ocupam 2/6 colunas) */}
        <div className="grid grid-cols-1 border-t border-l border-paragon-white/22 lg:grid-cols-6">
          {projects.map((project, idx) => {
            const mod = idx % 5;
            const spanClass = mod === 0 || mod === 1 ? 'lg:col-span-3' : 'lg:col-span-2';
            return (
              <div
                key={project.id}
                className={`${spanClass} border-r border-b border-paragon-white/22`}
              >
                <WorkCard project={project} index={idx} className="h-full" />
              </div>
            );
          })}
        </div>

        {/* Barra Inferior de Largura Total com ✦ nas extremidades e link sublinhado no centro */}
        <div className="flex items-center justify-between border-x border-b border-paragon-white/22 px-5 py-5 lg:px-8 lg:py-6">
          <span aria-hidden="true" className="text-[14px] text-paragon-white">
            ✦
          </span>

          <Link
            href="/portfolio"
            className="u-text-button text-paragon-kicker text-paragon-white hover:text-paragon-red"
          >
            <RollText text="Ver arquivo completo de projetos" />
          </Link>

          <span aria-hidden="true" className="text-[14px] text-paragon-white">
            ✦
          </span>
        </div>
      </div>
    </section>
  );
}
