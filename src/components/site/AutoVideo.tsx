'use client';

import { useEffect, useRef, useState } from 'react';
import type { MediaView } from '@/lib/media';
import { Picture } from './Picture';
import { prefersReducedMotion, register, scheduleUpdate, type VideoEntry, type VideoMode } from './video-coordinator';

type Props = {
  media: MediaView | null;
  /** visible: toca quando aparece na tela · hover: no desktop toca com o mouse em cima (no toque, quando está na tela) */
  mode?: VideoMode;
  hovering?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  onTime?: (seconds: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  /** Classes de enquadramento do vídeo e da capa (ex.: "object-cover lg:object-contain") */
  fit?: string;
  /** Quando o vídeo não preenche o quadro: fundo com o próprio quadro desfocado (classes de visibilidade) */
  backdrop?: string;
};

/** Prévia muda em loop: mostra a capa, só baixa o vídeo quando chega perto da tela. */
export function AutoVideo({
  media,
  mode = 'visible',
  hovering = false,
  sizes,
  priority,
  className = '',
  onTime,
  onPlayingChange,
  fit = 'object-cover',
  backdrop,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const entry = useRef<VideoEntry | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const video = media?.video;

  useEffect(() => {
    const el = ref.current;
    if (!el || !video) return;
    const e: VideoEntry = { el, mode, ratio: 0, hovering: false, ready: false };
    entry.current = e;
    const unregister = register(e);

    const pickSrc = () => {
      if (prefersReducedMotion()) return;
      const small =
        window.matchMedia('(max-width: 809px)').matches ||
        (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      setSrc((small ? video.p480 : video.p720) ?? video.p720 ?? video.p480);
    };

    if (priority) pickSrc();
    const near = new IntersectionObserver(
      ([i]) => {
        if (i.isIntersecting) {
          pickSrc();
          near.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    near.observe(el);
    const seen = new IntersectionObserver(
      ([i]) => {
        e.ratio = i.isIntersecting ? i.intersectionRatio : 0;
        scheduleUpdate();
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] },
    );
    seen.observe(el);
    return () => {
      near.disconnect();
      seen.disconnect();
      unregister();
    };
  }, [video, mode, priority]);

  useEffect(() => {
    if (!entry.current) return;
    entry.current.hovering = hovering;
    scheduleUpdate();
  }, [hovering]);

  useEffect(() => {
    if (!entry.current) return;
    entry.current.ready = !!src;
    scheduleUpdate();
  }, [src]);

  return (
    <span className={`absolute inset-0 block overflow-hidden ${className}`}>
      {backdrop && media?.blur ? (
        <span
          aria-hidden
          className={`absolute -inset-8 bg-cover bg-center blur-2xl brightness-[.55] saturate-125 ${backdrop}`}
          style={{ backgroundImage: `url(${media.img?.src ?? media.blur})` }}
        />
      ) : null}
      <Picture media={media} sizes={sizes} priority={priority} alt="" blurPlaceholder={!backdrop} className={`absolute inset-0 h-full w-full ${fit}`} />
      {video ? (
        <video
          ref={ref}
          src={src ?? undefined}
          muted
          playsInline
          loop
          preload="none"
          aria-hidden
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={() => {
            setVisible(true);
            onPlayingChange?.(true);
          }}
          onPause={() => onPlayingChange?.(false)}
          onTimeUpdate={onTime ? (ev) => onTime(ev.currentTarget.currentTime) : undefined}
          className={`absolute inset-0 h-full w-full ${fit} transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : null}
    </span>
  );
}
