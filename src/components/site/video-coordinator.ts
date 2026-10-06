// Decide quais vídeos tocam: no celular, só o mais visível; no desktop, os visíveis
// (ou o que está sob o mouse). Com "reduzir movimento" ou pausa global, nenhum toca.
export type VideoMode = 'visible' | 'hover';

export type VideoEntry = {
  el: HTMLVideoElement;
  mode: VideoMode;
  ratio: number;
  hovering: boolean;
  ready: boolean;
};

const entries = new Set<VideoEntry>();
let globallyPaused = false;
const pauseListeners = new Set<(p: boolean) => void>();
let frame = 0;

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isTouch(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
}

function wants(e: VideoEntry, touch: boolean): boolean {
  if (!e.ready) return false;
  if (e.mode === 'hover' && !touch) return e.hovering;
  return true;
}

function update() {
  frame = 0;
  const blocked = globallyPaused || prefersReducedMotion() || document.hidden;
  const touch = isTouch();
  let best: VideoEntry | null = null;
  if (touch) {
    for (const e of entries) {
      if (wants(e, touch) && e.ratio >= 0.3 && (!best || e.ratio > best.ratio)) best = e;
    }
  }
  for (const e of entries) {
    const play = !blocked && wants(e, touch) && e.ratio > 0 && (!touch || e === best);
    if (play) {
      if (e.el.paused) e.el.play().catch(() => {});
    } else if (!e.el.paused) {
      e.el.pause();
    }
  }
}

export function scheduleUpdate() {
  if (typeof window === 'undefined' || frame) return;
  frame = window.requestAnimationFrame(update);
}

export function register(entry: VideoEntry): () => void {
  entries.add(entry);
  scheduleUpdate();
  return () => {
    entries.delete(entry);
    entry.el.pause();
  };
}

export function setGloballyPaused(p: boolean) {
  globallyPaused = p;
  pauseListeners.forEach((l) => l(p));
  scheduleUpdate();
}

export function isGloballyPaused() {
  return globallyPaused;
}

export function onPausedChange(l: (p: boolean) => void): () => void {
  pauseListeners.add(l);
  return () => pauseListeners.delete(l);
}

if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', scheduleUpdate);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', scheduleUpdate);
}
