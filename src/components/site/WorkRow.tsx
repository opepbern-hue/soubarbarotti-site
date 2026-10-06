'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ProjectCard } from '@/lib/content';
import { isPortrait } from '@/lib/media-shared';
import { AutoVideo } from './AutoVideo';
import { ArrowUpRight } from './icons';
import { Fill } from './Text';

/** Linha do "próximo projeto": texto à esquerda, prévia à direita. */
export function WorkRow({ project, as: H = 'h2' }: { project: ProjectCard; as?: 'h2' | 'h3' }) {
  const [hovering, setHovering] = useState(false);
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      className="group grid gap-7 border-b border-linha py-10 md:grid-cols-[minmax(0,300px)_1fr] md:items-center md:gap-10 lg:grid-cols-[400px_1fr] lg:gap-[80px] lg:py-[40px]"
    >
      <div>
        <p className="font-display text-[14px] font-medium uppercase tracking-[0.04em] text-fumaca">
          <Fill text={project.category} />
        </p>
        <H className="mt-3 font-display text-[28px] font-medium leading-[1.1] tracking-[-0.01em] transition-colors group-hover:text-brasa lg:text-[36px]">
          <Fill text={project.title} />
        </H>
        <p className="mt-4 max-w-[400px] text-[16px] leading-[1.3] text-fumaca">
          <Fill text={project.shortDescription} />
        </p>
      </div>
      <div className="on-video relative aspect-[7/6] overflow-hidden bg-carvao md:aspect-[760/300]">
        <AutoVideo
          media={project.media}
          mode="hover"
          hovering={hovering}
          sizes="(min-width: 810px) 60vw, 100vw"
          fit={isPortrait(project.media) ? 'object-contain' : 'object-cover'}
          backdrop={isPortrait(project.media) ? 'block' : undefined}
        />
        {!project.media || project.media.placeholder ? (
          <mark className="preencher absolute left-4 top-4 font-display text-[11px] uppercase">[PREENCHER: vídeo do projeto]</mark>
        ) : null}
        <span
          aria-hidden
          className="absolute bottom-4 right-4 grid size-12 place-items-center rounded-full bg-branco-tela text-carvao transition-transform duration-300 group-hover:scale-110"
        >
          <ArrowUpRight className="size-5" />
        </span>
      </div>
    </Link>
  );
}
