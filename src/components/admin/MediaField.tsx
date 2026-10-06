'use client';

import { useEffect, useRef, useState } from 'react';
import type { MediaView } from '@/lib/media';
import { btnGhost, StatusBadge } from './ui';
import { uploadFile, waitReady, type MediaStatusResponse } from './upload';

export type MediaInitial = { id: string; status: string; name: string; view: MediaView | null; error?: string | null } | null;

type LibraryItem = { id: string; name: string; view: MediaView | null };

export function Thumb({ view, className = '' }: { view: MediaView | null; className?: string }) {
  if (!view?.img) return <span className={`block bg-carvao/90 ${className}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={view.img.src} alt="" className={`block object-cover ${className}`} loading="lazy" />;
}

/** Barra de progresso do upload (um dos dois detalhes em Golden Hour fora da abertura) */
export function Progress({ value }: { value: number }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-linha" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <span className="block h-full rounded-full bg-golden-hour transition-[width] duration-300" style={{ width: `${Math.max(3, value * 100)}%` }} />
    </span>
  );
}

/** Campo de mídia: envia arquivo novo ou escolhe um já enviado. Guarda o ID num input escondido. */
export function MediaField({
  name,
  kind,
  initial,
  label,
  hint,
}: {
  name: string;
  kind: 'IMAGE' | 'VIDEO';
  initial: MediaInitial;
  label: string;
  hint?: string;
}) {
  const [media, setMedia] = useState<MediaInitial>(initial);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<LibraryItem[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!media || media.status === 'READY' || media.status === 'ERROR') return;
    const ctrl = new AbortController();
    abort.current = ctrl;
    waitReady(
      media.id,
      (s: MediaStatusResponse) => setMedia((m) => (m && m.id === s.id ? { ...m, status: s.status, view: s.view, error: s.error } : m)),
      ctrl.signal,
    );
    return () => ctrl.abort();
  }, [media?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onFile(file: File) {
    setError(null);
    setProgress(0);
    try {
      const id = await uploadFile(file, setProgress);
      setMedia({ id, status: 'PENDING', name: file.name, view: null });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no envio.');
    } finally {
      setProgress(null);
    }
  }

  async function openLibrary() {
    const res = await fetch(`/api/admin/media?kind=${kind}`, { cache: 'no-store' });
    setLibrary(res.ok ? await res.json() : []);
  }

  const noun = kind === 'VIDEO' ? 'vídeo' : 'imagem';

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <input type="hidden" name={name} value={media?.id ?? ''} />
      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-nevoa/50 p-3 ring-1 ring-linha">
        <Thumb view={media?.view ?? null} className="h-20 w-32 flex-none rounded-lg" />
        <div className="min-w-0 flex-1">
          {media ? (
            <>
              <p className="truncate text-[14px] font-medium">{media.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={media.status} />
                {media.status !== 'READY' && media.status !== 'ERROR' ? (
                  <span className="text-[12px] text-fumaca">Pode salvar agora: aparece no site quando terminar.</span>
                ) : null}
                {media.status === 'ERROR' && media.error ? <span className="text-[12px] text-[#a3261a]">{media.error}</span> : null}
              </div>
            </>
          ) : (
            <p className="text-[14px] text-fumaca">Nenhum {noun}.</p>
          )}
          {progress !== null ? (
            <div className="mt-2">
              <Progress value={progress} />
              <p className="mt-1 text-[12px] text-fumaca">Enviando… {Math.round(progress * 100)}%</p>
            </div>
          ) : null}
          {error ? <p className="mt-1 text-[12px] text-[#a3261a]">{error}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={kind === 'VIDEO' ? 'video/*' : 'image/*'}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = '';
            }}
          />
          <button type="button" className={btnGhost} disabled={progress !== null} onClick={() => inputRef.current?.click()}>
            Enviar {noun}
          </button>
          <button type="button" className={btnGhost} onClick={openLibrary}>
            Biblioteca
          </button>
          {media ? (
            <button type="button" className={btnGhost} onClick={() => setMedia(null)}>
              Remover
            </button>
          ) : null}
        </div>
      </div>
      {hint ? <p className="mt-1.5 text-[12px] text-fumaca">{hint}</p> : null}

      {library ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-carvao/50 p-4" onClick={() => setLibrary(null)}>
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-2xl bg-branco-tela p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-[18px] font-semibold">Escolher {noun}</p>
              <button type="button" className={btnGhost} onClick={() => setLibrary(null)}>
                Fechar
              </button>
            </div>
            {library.length ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {library.map((it) => (
                  <li key={it.id}>
                    <button
                      type="button"
                      className="block w-full text-left"
                      onClick={() => {
                        setMedia({ id: it.id, status: 'READY', name: it.name, view: it.view });
                        setLibrary(null);
                      }}
                    >
                      <Thumb view={it.view} className="aspect-video w-full rounded-lg" />
                      <span className="mt-1 block truncate text-[12px]">{it.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-fumaca">Nada pronto ainda.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
