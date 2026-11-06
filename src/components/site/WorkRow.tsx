'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ProjectCard } from '@/lib/content';
import { isPortrait } from '@/lib/media-shared';
import { AutoVideo } from './AutoVideo';
import { RollText } from './Hud';
import { Fill } from './Text';

/** Banner "Próximo Projeto" em tela larga no estilo DISCOVER NEXT PROJECT da Paragon (`/works/[slug]`). */
export function WorkRow({ project, as: H = 'h2' }: { project: ProjectCard; as?: 'h2' | 'h3' }) {
  const [hovering, setHovering] = useState(false);
  const portrait = isPortrait(project.media);

  return (
    <Link
      href={`/portfolio/${project.slug}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      className="group relative flex min-h-[420px] w-full flex-col items-center justify-center overflow-hidden border border-paragon-white/25 bg-paragon-black px-6 py-16 text-center text-paragon-white lg:min-h-[520px] lg:py-24"
    >
      {project.media && !project.media.placeholder ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <AutoVideo
            media={project.media}
            mode="hover"
            hovering={hovering}
            sizes="100vw"
            fit={
              portrait
                ? 'object-cover object-[center_20%] opacity-55 transition-transform duration-700 group-hover:scale-105'
                : 'object-cover object-center opacity-60 transition-transform duration-700 group-hover:scale-105'
            }
          />
          <div className="absolute inset-0 bg-paragon-black/55 transition-colors duration-500 group-hover:bg-paragon-black/40" />
        </div>
      ) : null}

      <div className="relative z-10 flex max-w-[780px] flex-col items-center">
        <p className="text-paragon-kicker mb-3 text-paragon-red">
          PRÓXIMO PROJETO // <Fill text={project.category} />
        </p>
        <H className="text-paragon-h1 text-paragon-white">
          <Fill text={project.title} />
        </H>
        {project.shortDescription ? (
          <p className="text-paragon-body mt-4 max-w-[520px] text-paragon-white/85">
            <Fill text={project.shortDescription} />
          </p>
        ) : null}
        <span className="u-button u-button--red mt-7">
          <RollText text="Descobrir próximo projeto" />
        </span>
      </div>
    </Link>
  );
}
