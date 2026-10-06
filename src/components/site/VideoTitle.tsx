import type { ReactNode } from 'react';
import type { MediaView } from '@/lib/media';
import { AutoVideo } from './AutoVideo';

/**
 * "SOUBARBAROTTI." com o vídeo dentro das letras.
 * Camada 1: vídeo · Camada 2: branco com letras pretas em `screen` (o preto vira janela para o vídeo)
 * Camada 3: letras transparentes e o ponto final laranja piscando (o ponto do REC).
 * No celular quebra em "SOU / BARBAROTTI."
 */
export function VideoTitle({
  media,
  priority = false,
  className = '',
  barbarottiClassName = '',
}: {
  media: MediaView | null;
  priority?: boolean;
  className?: string;
  barbarottiClassName?: string;
}) {
  const word = (dot: ReactNode) => (
    <>
      SOU
      <br className="md:hidden" />
      <span className={barbarottiClassName}>BARBAROTTI</span>
      {dot}
    </>
  );
  return (
    <span aria-hidden className={`fit-host block select-none ${className}`}>
      <span className="fit-title relative isolate block text-white font-bold tracking-tight">
        {word(<span className="rec-blink text-red-500">.</span>)}
      </span>
    </span>
  );
}
