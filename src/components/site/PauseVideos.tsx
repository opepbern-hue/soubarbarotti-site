'use client';

import { useEffect, useState } from 'react';
import { PauseIcon, PlayIcon } from './icons';
import { isGloballyPaused, onPausedChange, prefersReducedMotion, setGloballyPaused } from './video-coordinator';

/** Botão de pausa exigido para vídeo que se move sozinho por mais de 5 s (acessibilidade). */
export function PauseVideos({ className = '' }: { className?: string }) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setPaused(isGloballyPaused());
    setReduced(prefersReducedMotion());
    return onPausedChange(setPaused);
  }, []);
  if (reduced) return null;
  return (
    <button
      type="button"
      onClick={() => setGloballyPaused(!paused)}
      aria-pressed={paused}
      className={`inline-flex items-center gap-2 font-display text-[12px] font-medium uppercase tracking-[0.04em] text-carvao/80 transition-colors hover:text-brasa ${className}`}
    >
      {paused ? <PlayIcon className="size-3.5" /> : <PauseIcon className="size-3.5" />}
      {paused ? 'Tocar vídeos' : 'Pausar vídeos'}
    </button>
  );
}
