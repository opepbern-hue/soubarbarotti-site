'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { MediaView } from '@/lib/media';
import { isPortrait, parseEmbed } from '@/lib/media-shared';
import { AutoVideo } from './AutoVideo';
import { PlayIcon } from './icons';
import { Fill } from './Text';

/**
 * Abertura da página do projeto: a prévia muda roda em loop e, ao clicar,
 * o mesmo espaço vira o player com som (arquivo próprio ou YouTube/Vimeo).
 */
export function ProjectStage({
  media,
  fullVideo,
  url,
  title,
  category,
}: {
  media: MediaView | null;
  fullVideo: MediaView | null;
  url: string;
  title: string;
  category: string;
}) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const full = fullVideo?.video?.full ?? media?.video?.full ?? null;
  const embed = !full ? parseEmbed(url) : null;
  const canPlay = !!full || !!embed;
  const portrait = isPortrait(fullVideo ?? media);

  return (
    <header className="on-video relative flex h-[100svh] min-h-[560px] flex-col justify-end overflow-hidden bg-carvao text-white">
      {playing && full ? (
        <video
          ref={videoRef}
          src={full}
          controls
          autoPlay
          playsInline
          poster={(fullVideo ?? media)?.img?.src}
          className="absolute inset-0 z-20 h-full w-full bg-black object-contain"
          aria-label={`Vídeo: ${title}`}
        />
      ) : playing && embed ? (
        <iframe
          className="absolute inset-0 z-20 h-full w-full bg-black"
          src={
            embed.provider === 'youtube'
              ? `https://www.youtube-nocookie.com/embed/${embed.id}?autoplay=1&rel=0`
              : `https://player.vimeo.com/video/${embed.id}?autoplay=1&dnt=1`
          }
          title={`Vídeo: ${title}`}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      ) : (
        <>
          <AutoVideo
            media={media}
            mode="visible"
            priority
            sizes="100vw"
            fit={portrait ? 'object-cover md:object-contain' : 'object-contain md:object-cover'}
            backdrop={portrait ? 'hidden md:block' : 'md:hidden'}
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,14,10,.55)_0%,rgba(20,14,10,0)_25%,rgba(20,14,10,0)_55%,rgba(20,14,10,.7)_100%)]"
          />
          {canPlay ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 z-10 grid place-items-center"
              aria-label={`Assistir com som: ${title}`}
            >
              <span className="flex items-center gap-3 rounded-full bg-branco-tela/95 py-2 pl-2 pr-5 text-carvao shadow-xl transition-transform duration-300 group-hover:scale-105">
                <span className="grid size-11 place-items-center rounded-full bg-brasa text-white">
                  <PlayIcon className="ml-0.5 size-5" />
                </span>
                <span className="font-display text-[13px] font-semibold uppercase tracking-[0.04em]">Assistir com som</span>
              </span>
            </button>
          ) : null}
        </>
      )}

      <nav
        aria-label="Trilha"
        className="pointer-events-auto absolute left-5 top-[96px] z-30 font-display text-[12px] font-medium uppercase tracking-[0.06em] text-white/85 lg:left-[140px]"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-white">
              Início
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/portfolio" className="hover:text-white">
              Portfólio
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-white">
            <Fill text={title} />
          </li>
        </ol>
      </nav>

      <div className={`pointer-events-none relative z-10 px-5 pb-12 transition-opacity lg:px-[140px] lg:pb-[70px] ${playing ? 'opacity-0' : 'opacity-100'}`}>
        {category ? (
          <p className="font-display text-[14px] font-medium uppercase tracking-[0.04em]">
            <Fill text={category} />
          </p>
        ) : null}
        <h1 className="mt-3 max-w-[1160px] font-display text-[51px] font-medium leading-[0.9] tracking-[-0.03em] md:text-[64px] lg:text-[80px]">
          <Fill text={title} />
        </h1>
      </div>
    </header>
  );
}
