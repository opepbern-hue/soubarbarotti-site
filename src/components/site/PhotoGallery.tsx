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
  // O Safari exige que o ClipboardItem seja criado na hora do clique, com a imagem como promessa
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
    'inline-flex h-9 items-center rounded-full px-4 font-display text-[12px] font-semibold uppercase tracking-[0.04em] transition-colors';
  const msg = feedback?.id === photo.id ? feedback : null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {photo.downloadable ? (
        <>
      <a href={fileUrl(photo.id)} download className={`${btn} bg-brasa text-white hover:bg-brasa/90`}>
        Baixar
      </a>
      <button
        type="button"
        className={`${btn} bg-branco-tela text-carvao ring-1 ring-linha hover:text-brasa`}
        onClick={async () => {
          try {
            await copyImage(photo.id);
            say('copy', `${noun[0].toUpperCase()}${noun.slice(1)} copiada`);
          } catch {
            try {
              await navigator.clipboard.writeText(link());
              say('copy', 'Este navegador não copia imagem: copiei o link');
            } catch {
              say('copy', 'Não deu para copiar. Use Baixar.');
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
        className={`${btn} bg-branco-tela text-carvao ring-1 ring-linha hover:text-brasa`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link());
            say('link', 'Link copiado');
          } catch {
            say('link', 'Não deu para copiar o link');
          }
        }}
      >
        Link
      </button>
      <span role="status" aria-live="polite" className="text-[12px] font-medium text-brasa">
        {msg?.text ?? ''}
      </span>
    </div>
  );
}

export function PhotoGallery({ photos, basePath = '/fotos', noun = 'foto' }: { photos: PhotoView[]; basePath?: string; noun?: 'foto' | 'arte' }) {
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

  // Link direto para uma foto: /fotos#foto-ID abre ampliada
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
      <ul className="columns-1 gap-5 md:columns-2 lg:columns-3 lg:gap-[30px]">
        {photos.map((p, i) => (
          <li key={p.id} id={`foto-${p.id}`} className="mb-8 break-inside-avoid lg:mb-10">
            <figure>
              <button
                type="button"
                onClick={() => show(i)}
                className="group relative block w-full overflow-hidden bg-nevoa"
                aria-label={`Ampliar ${p.title || noun}`}
              >
                <Picture
                  media={p.media}
                  alt={p.media.alt || p.title}
                  sizes="(min-width: 1200px) 33vw, (min-width: 810px) 50vw, 100vw"
                  className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </button>
              <figcaption className="mt-3 flex flex-col gap-3">
                {p.title ? <span className="font-display text-[15px] font-medium tracking-[-0.01em]">{p.title}</span> : null}
                <Actions photo={p} feedback={feedback} onFeedback={setFeedback} basePath={basePath} noun={noun} />
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => open !== null && show(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) show(null);
        }}
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-carvao/95 p-0 text-white backdrop:bg-carvao/80"
        aria-label={current?.title || `${noun} ampliada`}
      >
        {current ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 py-4 lg:px-10">
              <p className="font-display text-[13px] font-medium uppercase tracking-[0.06em] text-white/80">
                {String((open ?? 0) + 1).padStart(2, '0')}/{String(photos.length).padStart(2, '0')}
                {current.title ? ` · ${current.title}` : ''}
              </p>
              <button type="button" onClick={() => show(null)} aria-label="Fechar" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <CloseIcon className="size-5" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 px-5 lg:px-24">
              <Picture media={current.media} alt={current.media.alt || current.title} sizes="100vw" className="h-full w-full object-contain" />
              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => show(((open ?? 0) - 1 + photos.length) % photos.length)}
                    aria-label="Foto anterior"
                    className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-[20px] hover:bg-white/20 lg:left-8"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => show(((open ?? 0) + 1) % photos.length)}
                    aria-label="Próxima foto"
                    className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-[20px] hover:bg-white/20 lg:right-8"
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>
            <div className="flex justify-center px-5 py-5 [&_span[role=status]]:text-ambar">
              <Actions photo={current} feedback={feedback} onFeedback={setFeedback} basePath={basePath} noun={noun} />
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
