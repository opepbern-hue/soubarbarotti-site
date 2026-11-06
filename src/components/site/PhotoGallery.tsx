'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PhotoView } from '@/lib/content';
import { CloseIcon } from './icons';
import { Picture } from './Picture';

type Feedback = { id: string; action: 'copy' | 'link'; text: string } | null;

const fileUrl = (id: string, inline = false) => `/api/fotos/${id}${inline ? '?inline=1' : ''}`;

/** Converte a foto para PNG (o formato que todo navegador aceita na área de transferência). */
async function toPng(blob: Blob, maxSide = 2560): Promise<Blob> {
  const bmp = await createImageBitmap(blob);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('png'))), 'image/png'));
}

async function copyImage(id: string): Promise<void> {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) throw new Error('sem suporte');
  const png = fetch(fileUrl(id, true))
    .then((r) => {
      if (!r.ok) throw new Error('download');
      return r.blob();
    })
    .then((b) => toPng(b));
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
}

function Actions({
  photo,
  feedback,
  onFeedback,
  basePath,
  noun,
}: {
  photo: PhotoView;
  feedback: Feedback;
  onFeedback: (f: Feedback) => void;
  basePath: string;
  noun: string;
}) {
  const say = (action: 'copy' | 'link', text: string) => {
    onFeedback({ id: photo.id, action, text });
    window.setTimeout(() => onFeedback(null), 2200);
  };
  const link = () => `${window.location.origin}${basePath}#foto-${photo.id}`;
  const btn =
    'inline-flex h-8 items-center border border-paragon-black px-3 font-kicker text-[12px] font-normal uppercase transition-colors';
  const msg = feedback?.id === photo.id ? feedback : null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {photo.downloadable ? (
        <>
          <a
            href={fileUrl(photo.id)}
            download
            className={`${btn} bg-paragon-red text-paragon-black hover:bg-paragon-grey-300`}
          >
            Baixar
          </a>
          <button
            type="button"
            className={`${btn} bg-paragon-white text-paragon-black hover:bg-paragon-blue`}
            onClick={async () => {
              try {
                await copyImage(photo.id);
                say('copy', `${noun[0].toUpperCase()}${noun.slice(1)} copiada`);
              } catch {
                try {
                  await navigator.clipboard.writeText(link());
                  say('copy', 'Link copiado');
                } catch {
                  say('copy', 'Use Baixar');
                }
              }
            }}
          >
            Copiar
          </button>
        </>
      ) : null}
      <button
        type="button"
        className={`${btn} bg-paragon-white text-paragon-black hover:bg-paragon-grey-300`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link());
            say('link', 'Link copiado');
          } catch {
            say('link', 'Erro ao copiar');
          }
        }}
      >
        Link
      </button>
      <span role="status" aria-live="polite" className="font-kicker text-[11px] text-paragon-red uppercase">
        {msg?.text ?? ''}
      </span>
    </div>
  );
}

export function PhotoGallery({
  photos,
  basePath = '/fotos',
  noun = 'foto',
}: {
  photos: PhotoView[];
  basePath?: string;
  noun?: 'foto' | 'arte';
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const show = useCallback(
    (i: number | null) => {
      setOpen(i);
      const url = new URL(window.location.href);
      url.hash = i === null ? '' : `foto-${photos[i].id}`;
      window.history.replaceState(null, '', url);
    },
    [photos],
  );

  useEffect(() => {
    const m = window.location.hash.match(/^#foto-(.+)$/);
    if (!m) return;
    const i = photos.findIndex((p) => p.id === m[1]);
    if (i >= 0) setOpen(i);
  }, [photos]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') show((open + 1) % photos.length);
      if (e.key === 'ArrowLeft') show((open - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, photos.length, show]);

  const current = open !== null ? photos[open] : null;

  return (
    <>
      <ul className="grid grid-cols-1 border-t border-l border-paragon-white/22 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p, i) => (
          <li
            key={p.id}
            id={`foto-${p.id}`}
            className="flex flex-col justify-between border-r border-b border-paragon-white/22 bg-paragon-black p-4 lg:p-6"
          >
            <figure className="flex h-full flex-col justify-between">
              <button
                type="button"
                onClick={() => show(i)}
                className="group relative block aspect-[4/5] w-full overflow-hidden bg-paragon-grey-600"
                aria-label={`Ampliar ${p.title || `${noun} ${i + 1}`}`}
              >
                <Picture
                  media={p.media}
                  alt={p.media.alt || p.title || `${noun} ${i + 1}`}
                  sizes="(min-width: 1200px) 33vw, (min-width: 810px) 50vw, 100vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="pointer-events-none absolute top-3 left-3 border border-paragon-white/25 bg-paragon-black/75 px-2 py-0.5 font-kicker text-[11px] text-paragon-white">
                  [{String(i + 1).padStart(2, '0')}]
                </span>
              </button>

              <figcaption className="mt-4 flex flex-col gap-3 pt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-paragon-h6 text-paragon-white">
                    {p.title || `${noun} #${String(i + 1).padStart(2, '0')}`}
                  </span>
                </div>
                <Actions photo={p} feedback={feedback} onFeedback={setFeedback} basePath={basePath} noun={noun} />
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        data-lenis-prevent
        onClose={() => open !== null && show(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) show(null);
        }}
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-paragon-black/95 p-0 text-paragon-white backdrop:bg-paragon-black/85"
        aria-label={current?.title || `${noun} ampliada`}
      >
        {current ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-paragon-white/20 px-5 py-4 lg:px-12">
              <p className="font-kicker text-[13px] text-paragon-white uppercase">
                [{String((open ?? 0) + 1).padStart(2, '0')}/{String(photos.length).padStart(2, '0')}]
                {current.title ? ` // ${current.title}` : ''}
              </p>
              <button
                type="button"
                onClick={() => show(null)}
                aria-label="Fechar"
                className="grid size-10 place-items-center border border-paragon-black bg-paragon-red text-paragon-black transition-colors hover:bg-paragon-grey-300"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 px-5 py-6 lg:px-24">
              <Picture
                media={current.media}
                alt={current.media.alt || current.title}
                sizes="100vw"
                className="h-full w-full object-contain"
              />
              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => show(((open ?? 0) - 1 + photos.length) % photos.length)}
                    aria-label="Foto anterior"
                    className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center border border-paragon-black bg-paragon-white text-[20px] text-paragon-black hover:bg-paragon-red lg:left-8"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => show(((open ?? 0) + 1) % photos.length)}
                    aria-label="Próxima foto"
                    className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center border border-paragon-black bg-paragon-white text-[20px] text-paragon-black hover:bg-paragon-red lg:right-8"
                  >
                    →
                  </button>
                </>
              ) : null}
            </div>
            <div className="flex justify-center border-t border-paragon-white/20 px-5 py-4">
              <Actions photo={current} feedback={feedback} onFeedback={setFeedback} basePath={basePath} noun={noun} />
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
