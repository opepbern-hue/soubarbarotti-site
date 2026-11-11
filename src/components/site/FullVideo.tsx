'use client';

import { useRef, useState } from 'react';
import type { MediaView } from '@/lib/media';
import { parseEmbed } from '@/lib/media-shared';
import { PlayIcon } from './icons';
import { Picture } from './Picture';

/**
 * Vídeo completo do projeto. Nada é baixado até o clique:
 * - arquivo próprio: <video> com capa e controles, com som
 * - YouTube/Vimeo: mostra só a capa e carrega o player no clique
 */
export function FullVideo({ media, url, cover, title }: { media: MediaView | null; url: string; cover: MediaView | null; title: string }) {
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const embed = !media?.video?.full ? parseEmbed(url) : null;
  const poster = media?.img ? media : cover;

  if (!media?.video?.full && !embed) {
    return (
      <div className="grid aspect-video w-full place-items-center bg-nevoa ring-1 ring-linha">
        <mark className="preencher font-display text-[12px] uppercase">[PREENCHER: vídeo completo (arquivo ou link do YouTube/Vimeo)]</mark>
      </div>
    );
  }

  const start = () => {
    setStarted(true);
    if (media?.video?.full) requestAnimationFrame(() => videoRef.current?.play().catch(() => {}));
  };

  return (
    <div className="on-video relative aspect-video w-full overflow-hidden bg-carvao">
      {media?.video?.full ? (
        <video
          ref={videoRef}
          controls={started}
          preload="none"
          playsInline
          poster={poster?.img?.src}
          className="absolute inset-0 h-full w-full object-contain"
          aria-label={`Vídeo completo: ${title}`}
        >
          <source src={media.video.full} type="video/mp4" />
        </video>
      ) : started && embed ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={
            embed.provider === 'youtube'
              ? `https://www.youtube-nocookie.com/embed/${embed.id}?autoplay=1&rel=0`
              : `https://player.vimeo.com/video/${embed.id}?autoplay=1&dnt=1`
          }
          title={`Vídeo completo: ${title}`}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      ) : poster?.img ? (
        <Picture media={poster} alt="" sizes="(min-width: 1200px) 1160px, 100vw" className="absolute inset-0 h-full w-full object-cover" />
      ) : embed?.provider === 'youtube' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://i.ytimg.com/vi/${embed.id}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}

      {!started ? (
        <button
          type="button"
          onClick={start}
          className="absolute inset-0 grid place-items-center bg-carvao/10 transition-colors hover:bg-carvao/0"
          aria-label={`Assistir ao vídeo completo: ${title}`}
        >
          <span className="grid size-[76px] place-items-center rounded-full bg-branco-tela text-carvao shadow-lg transition-transform duration-300 hover:scale-105 md:size-[88px]">
            <PlayIcon className="ml-1 size-7" />
          </span>
        </button>
      ) : null}
    </div>
  );
}
