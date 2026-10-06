import type { MediaView } from '@/lib/media';

/** Imagem responsiva (AVIF → WebP) com miniatura borrada enquanto carrega. */
export function Picture({
  media,
  sizes = '100vw',
  alt,
  className = '',
  priority = false,
  blurPlaceholder = true,
}: {
  media: MediaView | null;
  sizes?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  /** Miniatura borrada atrás da imagem enquanto carrega */
  blurPlaceholder?: boolean;
}) {
  if (!media?.img) return <span aria-hidden className={`block bg-carvao ${className}`} />;
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={media.img.avif} sizes={sizes} />
      <source type="image/webp" srcSet={media.img.webp} sizes={sizes} />
      <img
        src={media.img.src}
        alt={alt ?? media.alt}
        width={media.width}
        height={media.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={className}
        style={blurPlaceholder && media.blur ? { backgroundImage: `url(${media.blur})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      />
    </picture>
  );
}
