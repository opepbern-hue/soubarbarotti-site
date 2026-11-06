'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PhotoView } from '@/lib/content';
import { CloseIcon } from './icons';
import { Picture } from './Picture';

type Feedback = { id: string; action: 'copy' | 'link'; text: string } | null;

const fileUrl = (id: string, inline = false) => `/api/fotos/${id}${inline ? '?inline=1' : ''}`;

/** Converte a foto para PNG (formato amplamente aceito na área de transferência). */
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
  variant = 'card',
}: {
  photo: PhotoView;
  feedback: Feedback;
  onFeedback: (f: Feedback) => void;
  basePath: string;
  noun: string;
  variant?: 'card' | 'overlay' | 'modal';
}) {
  const say = (action: 'copy' | 'link', text: string) => {
    onFeedback({ id: photo.id, action, text });
    window.setTimeout(() => onFeedback(null), 2400);
  };
  const link = () => `${window.location.origin}${basePath}#foto-${photo.id}`;
  const btnBase =
    'inline-flex items-center justify-center font-kicker text-[11px] font-normal uppercase transition-colors';
  const btnSize = variant === 'overlay' ? 'h-7 px-2.5' : 'h-8 px-3.5';
  const msg = feedback?.id === photo.id ? feedback : null;

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      {photo.downloadable ? (
        <>
          <a
            href={fileUrl(photo.id)}
            download
            className={`${btnBase} ${btnSize} border border-paragon-black bg-paragon-red text-paragon-black hover:bg-paragon-grey-300`}
            title={`Baixar ${noun}`}
          >
            Baixar
          </a>
          <button
            type="button"
            className={`${btnBase} ${btnSize} border border-paragon-black bg-paragon-white text-paragon-black hover:bg-paragon-blue`}
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await copyImage(photo.id);
                say('copy', `${noun[0].toUpperCase()}${noun.slice(1)} copiada!`);
              } catch {
                try {
                  await navigator.clipboard.writeText(link());
                  say('copy', 'Link copiado!');
                } catch {
                  say('copy', 'Use Baixar');
                }
              }
            }}
            title={`Copiar imagem de ${noun}`}
          >
            Copiar
          </button>
        </>
      ) : null}
      <button
        type="button"
        className={`${btnBase} ${btnSize} border border-paragon-black bg-paragon-white text-paragon-black hover:bg-paragon-grey-300`}
        onClick={async (e) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(link());
            say('link', 'Link copiado!');
          } catch {
            say('link', 'Erro ao copiar');
          }
        }}
        title="Copiar link direto"
      >
        Link
      </button>
      {msg?.text && (
        <span
          role="status"
          aria-live="polite"
          className="border border-paragon-red/40 bg-paragon-black/90 px-2 py-0.5 font-kicker text-[10px] text-paragon-red uppercase tracking-wider shadow"
        >
          {msg.text}
        </span>
      )}
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
            className="group flex flex-col justify-between border-r border-b border-paragon-white/22 bg-paragon-black p-4 lg:p-6"
          >
            <figure className="flex h-full flex-col justify-between">
              {/* ÁREA DA FOTO COM BOTÕES EMBUTIDOS NA PRÓPRIA FOTO */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => show(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    show(i);
                  }
                }}
                className="relative block aspect-[4/5] w-full cursor-pointer overflow-hidden bg-paragon-grey-600 focus:outline-none focus:ring-2 focus:ring-paragon-blue"
                aria-label={`Ampliar ${p.title || `${noun} ${i + 1}`}`}
              >
                <Picture
                  media={p.media}
                  alt={p.media.alt || p.title || `${noun} ${i + 1}`}
                  sizes="(min-width: 1200px) 33vw, (min-width: 810px) 50vw, 100vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />

                {/* Número do índice no topo esquerdo */}
                <span className="pointer-events-none absolute top-3 left-3 border border-paragon-white/25 bg-paragon-black/75 px-2 py-0.5 font-kicker text-[11px] text-paragon-white">
                  [{String(i + 1).padStart(2, '0')}]
                </span>

                {/* BARRA DE AÇÕES FIXA DIRETAMENTE SOBRE A FOTO (BAIXAR / COPIAR / LINK) */}
                <div
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 pt-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-kicker text-[10px] text-paragon-white/80 uppercase">
                      Clique para ampliar
                    </span>
                    <Actions
                      photo={p}
                      feedback={feedback}
                      onFeedback={setFeedback}
                      basePath={basePath}
                      noun={noun}
                      variant="overlay"
                    />
                  </div>
                </div>
              </div>

              {/* LEGENDA E INFORMAÇÕES ABAIXO DO CARD */}
              <figcaption className="mt-4 flex flex-col gap-2 pt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-paragon-h6 text-paragon-white">
                    {p.title || `${noun} #${String(i + 1).padStart(2, '0')}`}
                  </span>
                  <span className="font-kicker text-[11px] text-paragon-grey-400 uppercase">
                    HD // 4K
                  </span>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {/* MODAL LIGHTBOX EM TELA CHEIA */}
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
            {/* TOPO DO MODAL COM CONTROLE DE FECHAR */}
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

            {/* FOTO AMPLIADA COM BOTÕES DIRETO SOBRE A TELA */}
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

            {/* BARRA INFERIOR DE CONTROLES NO MODAL (BAIXAR / COPIAR / LINK) */}
            <div className="flex items-center justify-center border-t border-paragon-white/20 bg-paragon-black px-5 py-4">
              <Actions
                photo={current}
                feedback={feedback}
                onFeedback={setFeedback}
                basePath={basePath}
                noun={noun}
                variant="modal"
              />
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
