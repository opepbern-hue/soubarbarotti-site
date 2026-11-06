'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { MediaView } from '@/lib/media';
import { isPortrait, parseEmbed } from '@/lib/media-shared';
import { AutoVideo } from './AutoVideo';
import { RollText } from './Hud';
import { PlayIcon } from './icons';
import { Fill } from './Text';

/**
 * Palco de abertura da página de projeto (`/portfolio/[slug]`) no estilo `/works/[slug]` da Paragon:
 * A prévia muda roda em loop e, ao clicar em "ASSISTIR COM SOM", o mesmo espaço vira o player com som.
 */
export function ProjectStage({
  media,
  fullVideo,
  url,
  title,
  category,
  client,
}: {
  media: MediaView | null;
  fullVideo: MediaView | null;
  url: string;
  title: string;
  category: string;
  client?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const full = fullVideo?.video?.full ?? media?.video?.full ?? null;
  const embed = !full ? parseEmbed(url) : null;
  const canPlay = !!full || !!embed;
  const portrait = isPortrait(fullVideo ?? media);

  return (
    <header className="on-video relative flex min-h-[92svh] flex-col justify-between overflow-hidden border-b border-paragon-white/22 bg-paragon-black pt-[100px] pb-10 text-paragon-white lg:min-h-[100svh] lg:pt-[116px] lg:pb-14">
      {playing && full ? (
        <video
          ref={videoRef}
          src={full}
          controls
          autoPlay
          playsInline
          poster={(fullVideo ?? media)?.img?.src}
          className="absolute inset-0 z-20 h-full w-full bg-paragon-black object-contain"
          aria-label={`Vídeo: ${title}`}
        />
      ) : playing && embed ? (
        <iframe
          className="absolute inset-0 z-20 h-full w-full bg-paragon-black"
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
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/85"
          />
        </>
      )}

      {/* Trilha de Navegação Superior */}
      <div className={`paragon-container relative z-30 transition-opacity ${playing ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
        <nav aria-label="Trilha" className="font-kicker text-[12px] text-paragon-white/80 uppercase">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-paragon-red">
                Início
              </Link>
            </li>
            <li aria-hidden>//</li>
            <li>
              <Link href="/portfolio" className="hover:text-paragon-red">
                Portfólio
              </Link>
            </li>
            <li aria-hidden>//</li>
            <li aria-current="page" className="text-paragon-white">
              <Fill text={title} />
            </li>
          </ol>
        </nav>
      </div>

      {/* Centro / Base do Palco: Título Monumental + Botão Coral Red "Assistir com som" */}
      <div
        className={`paragon-container relative z-10 mt-auto transition-opacity ${
          playing ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-[920px]">
            {category ? (
              <p className="text-paragon-kicker mb-3 text-paragon-red">
                <Fill text={category} />
                {client ? ` // CLIENTE: ${client}` : ''}
              </p>
            ) : null}
            <h1 className="text-paragon-h1 text-paragon-white">
              <Fill text={title} />
            </h1>
          </div>

          {canPlay ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Assistir com som: ${title}`}
              className="u-button u-button--red shrink-0"
            >
              <PlayIcon className="size-4" />
              <RollText text="Assistir filme com som" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
