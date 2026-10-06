// Funções puras de mídia que também rodam no navegador (sem acesso a disco ou R2)
import type { MediaView } from './media';

/** Vídeo/imagem em pé (ex.: Reels 9:16) */
export function isPortrait(m: Pick<MediaView, 'width' | 'height'> | null | undefined): boolean {
  return !!m && m.height > m.width * 1.05;
}

/** Extrai o ID de um link do YouTube ou Vimeo. */
export function parseEmbed(url: string): { provider: 'youtube' | 'vimeo'; id: string } | null {
  const u = url.trim();
  if (!u) return null;
  const yt = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt) return { provider: 'youtube', id: yt[1] };
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vm) return { provider: 'vimeo', id: vm[1] };
  return null;
}
