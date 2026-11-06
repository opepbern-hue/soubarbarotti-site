'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Rolagem com inércia no desktop (roda do mouse / trackpad).
 * No toque fica a rolagem nativa do aparelho, que já é suave.
 * Com "reduzir movimento" ligado, nada muda.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      wheelMultiplier: 1,
      anchors: { offset: -64 },
      // Não rouba a rolagem de menus/modais com overflow próprio
      allowNestedScroll: true,
    });
    return () => lenis.destroy();
  }, []);
  return null;
}
