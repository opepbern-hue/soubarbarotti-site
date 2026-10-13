'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { addPhotos } from '@/app/admin/actions';
import { Progress } from './MediaField';
import { uploadFile } from './upload';

type Job = { name: string; progress: number; error?: string; done?: boolean };

/** Arraste várias imagens (ou clique): cada uma vira um item da página /fotos ou /artes. */
export function PhotoUploader({ collection = 'FOTO' }: { collection?: 'FOTO' | 'ARTE' }) {
  const noun = collection === 'ARTE' ? 'artes' : 'fotos';
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function send(files: File[]) {
    const images = files.filter((f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|gif)$/i.test(f.name));
    const start = jobs.length;
    setJobs((j) => [...j, ...images.map((f) => ({ name: f.name, progress: 0 }))]);
    for (const [k, file] of images.entries()) {
      const idx = start + k;
      const update = (patch: Partial<Job>) => setJobs((j) => j.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
      try {
        const id = await uploadFile(file, (p) => update({ progress: p }));
        await addPhotos([id], collection);
        update({ progress: 1, done: true });
        router.refresh();
      } catch (e) {
        update({ error: e instanceof Error ? e.message : 'Falha no envio.' });
      }
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          send([...e.dataTransfer.files]);
        }}
        className={`grid place-items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          over ? 'border-brasa bg-nevoa' : 'border-linha bg-branco-tela'
        }`}
      >
        <p className="font-display text-[18px] font-semibold">Arraste as {noun} aqui</p>
        <p className="mt-1 text-[14px] text-fumaca">JPG, PNG ou WebP. Pode mandar várias de uma vez.</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 inline-flex h-10 items-center rounded-full bg-brasa px-5 font-display text-[13px] font-semibold uppercase text-white">
          Escolher {noun}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            send([...(e.target.files ?? [])]);
            e.target.value = '';
          }}
        />
      </div>
      {jobs.length ? (
        <ul className="mt-4 flex flex-col gap-2">
          {jobs.map((j, i) => (
            <li key={i} className="rounded-lg bg-branco-tela p-3 ring-1 ring-linha">
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="truncate">{j.name}</span>
                <span className={j.error ? 'text-[#a3261a]' : 'text-fumaca'}>
                  {j.error ? j.error : j.done ? 'Enviada: comprimindo…' : `${Math.round(j.progress * 100)}%`}
                </span>
              </div>
              {!j.error && !j.done ? (
                <div className="mt-2">
                  <Progress value={j.progress} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
