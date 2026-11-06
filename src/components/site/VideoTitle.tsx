import type { ReactNode } from 'react';
import type { MediaView } from '@/lib/media';

export function VideoTitle({
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
      <span className="fit-title relative isolate block font-bold tracking-tight text-paragon-white uppercase">
        {word(<span className="text-paragon-red">.</span>)}
      </span>
    </span>
  );
}
