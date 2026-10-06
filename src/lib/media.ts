// Formato das versões geradas pelo worker e conversão para o que as páginas usam.
import type { Media } from '@prisma/client';
import { publicUrl } from './storage';

export type SizedKey = { w: number; key: string };
export type ImageSet = { avif: SizedKey[]; webp: SizedKey[] };

export type MediaVariants = {
  version: string;
  image?: ImageSet;
  poster?: ImageSet;
  full?: string;
  p720?: string;
  p480?: string;
  hasAudio?: boolean;
  /** JPG em alta para download (só imagens) */
  download?: string;
};

export type ImgView = {
  avif: string;
  webp: string;
  /** Uma única URL (WebP ~1280 px) para `poster` de vídeo e para quem não usa srcset */
  src: string;
};

export type MediaView = {
  id: string;
  kind: 'IMAGE' | 'VIDEO';
  alt: string;
  width: number;
  height: number;
  blur: string | null;
  placeholder: boolean;
  img: ImgView | null;
  video: { full: string | null; p720: string | null; p480: string | null; duration: number | null; hasAudio: boolean } | null;
};

function srcset(list: SizedKey[]): string {
  return list.map((s) => `${publicUrl(s.key)} ${s.w}w`).join(', ');
}

function pick(list: SizedKey[], target: number): string {
  const sorted = [...list].sort((a, b) => a.w - b.w);
  const hit = sorted.find((s) => s.w >= target) ?? sorted[sorted.length - 1];
  return hit ? publicUrl(hit.key) : '';
}

function imgView(set: ImageSet | undefined): ImgView | null {
  if (!set || !set.webp.length) return null;
  return { avif: srcset(set.avif), webp: srcset(set.webp), src: pick(set.webp, 1280) };
}

type MediaLike = Pick<
  Media,
  'id' | 'kind' | 'status' | 'alt' | 'width' | 'height' | 'blurDataUrl' | 'isPlaceholder' | 'variants' | 'durationSec'
>;

/** Converte uma mídia do banco para o formato das páginas. Mídia que não está pronta vira `null`. */
export function toMediaView(m: MediaLike | null | undefined): MediaView | null {
  if (!m || m.status !== 'READY' || !m.variants) return null;
  const v = m.variants as unknown as MediaVariants;
  const isVideo = m.kind === 'VIDEO';
  return {
    id: m.id,
    kind: m.kind,
    alt: m.alt,
    width: m.width ?? 1920,
    height: m.height ?? 1080,
    blur: m.blurDataUrl,
    placeholder: m.isPlaceholder,
    img: imgView(isVideo ? v.poster : v.image),
    video: isVideo
      ? {
          full: v.full ? publicUrl(v.full) : null,
          p720: v.p720 ? publicUrl(v.p720) : null,
          p480: v.p480 ? publicUrl(v.p480) : null,
          duration: m.durationSec,
          hasAudio: Boolean(v.hasAudio),
        }
      : null,
  };
}

/** Campos a selecionar do banco sempre que uma mídia for exibida. */
export const mediaSelect = {
  id: true,
  kind: true,
  status: true,
  alt: true,
  width: true,
  height: true,
  blurDataUrl: true,
  isPlaceholder: true,
  variants: true,
  durationSec: true,
} as const;

export { isPortrait, parseEmbed } from './media-shared';
