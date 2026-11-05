// Decide quais vídeos tocam: só um vídeo automático por vez (o mais visível; no empate,
// o que vem depois na página, que é o card de cima numa pilha). No desktop, o vídeo
// sob o mouse também toca. Com "reduzir movimento" ou pausa global, nenhum toca.
// Menos vídeos decodificando ao mesmo tempo = rolagem sem engasgo.
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

/** `a` está mais visível que `b`? No empate, ganha o que vem depois no documento. */
function beats(a: VideoEntry, b: VideoEntry | null): boolean {
  if (!b) return true;
  if (Math.abs(a.ratio - b.ratio) > 0.02) return a.ratio > b.ratio;
  return !!(b.el.compareDocumentPosition(a.el) & Node.DOCUMENT_POSITION_FOLLOWING);
}

function update() {
  frame = 0;
  const blocked = globallyPaused || prefersReducedMotion() || document.hidden;
  const touch = isTouch();
  let best: VideoEntry | null = null;
  for (const e of entries) {
    // No desktop, vídeos "hover" só tocam com o mouse em cima: não entram na disputa
    const auto = touch || e.mode === 'visible';
    if (auto && wants(e, touch) && e.ratio >= (touch ? 0.3 : 0.15) && beats(e, best)) best = e;
  }
  for (const e of entries) {
    const hovered = !touch && e.mode === 'hover' && e.hovering;
    const play = !blocked && wants(e, touch) && e.ratio > 0 && (e === best || hovered);
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
