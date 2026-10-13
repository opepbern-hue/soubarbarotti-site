'use client';

import { useRef, useState } from 'react';
import type { MediaView } from '@/lib/media';
import { Progress, Thumb } from './MediaField';
import { btnGhost, inputCls } from './ui';
import { uploadFile } from './upload';

export type GalleryItemInit = { mediaId: string; kind: 'FRAME' | 'BASTIDOR'; caption: string; view: MediaView | null; name: string };

/** Frames e bastidores do projeto (opcional). Salvo junto com o formulário. */
export function GalleryEditor({ initial }: { initial: GalleryItemInit[] }) {
  const [items, setItems] = useState(initial);
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const set = (i: number, patch: Partial<GalleryItemInit>) => setItems((xs) => xs.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) =>
    setItems((xs) => {
      const j = i + d;
      if (j < 0 || j >= xs.length) return xs;
      const c = [...xs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  async function add(files: File[]) {
    for (const f of files) {
      setProgress(0);
      try {
        const id = await uploadFile(f, setProgress);
        setItems((xs) => [...xs, { mediaId: id, kind: 'FRAME', caption: '', view: null, name: f.name }]);
      } finally {
        setProgress(null);
      }
    }
  }

  return (
    <div>
      <input type="hidden" name="gallery" value={JSON.stringify(items.map(({ mediaId, kind, caption }) => ({ mediaId, kind, caption })))} />
      {items.length ? (
        <ul className="flex flex-col gap-2">
          {items.map((it, i) => (
            <li key={`${it.mediaId}-${i}`} className="flex flex-wrap items-center gap-3 rounded-xl bg-branco-tela p-2 ring-1 ring-linha">
              <Thumb view={it.view} className="h-14 w-20 rounded-md" />
              <select value={it.kind} onChange={(e) => set(i, { kind: e.target.value as 'FRAME' | 'BASTIDOR' })} className={`${inputCls} w-auto py-2`}>
                <option value="FRAME">Frame</option>
                <option value="BASTIDOR">Bastidor</option>
              </select>
              <input value={it.caption} onChange={(e) => set(i, { caption: e.target.value })} placeholder="Legenda (opcional)" className={`${inputCls} min-w-0 flex-1 py-2`} />
              <div className="flex gap-1">
                <button type="button" className={btnGhost} onClick={() => move(i, -1)} aria-label="Subir">
                  ↑
                </button>
                <button type="button" className={btnGhost} onClick={() => move(i, 1)} aria-label="Descer">
                  ↓
                </button>
                <button type="button" className={btnGhost} onClick={() => setItems((xs) => xs.filter((_, k) => k !== i))}>
                  Tirar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[14px] text-fumaca">Sem frames ou bastidores.</p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button type="button" className={btnGhost} onClick={() => inputRef.current?.click()} disabled={progress !== null}>
          Adicionar imagens
        </button>
        {progress !== null ? (
          <span className="w-40">
            <Progress value={progress} />
          </span>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            add([...(e.target.files ?? [])]);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
