// Envio em partes de 8 MB: mostra progresso, tenta de novo se a conexão cair
// e passa pelo limite de 100 MB por requisição do Cloudflare.
import type { MediaView } from '@/lib/media';

export type MediaStatusResponse = {
  id: string;
  status: 'UPLOADING' | 'PENDING' | 'PROCESSING' | 'READY' | 'ERROR';
  kind: 'IMAGE' | 'VIDEO';
  error: string | null;
  name: string;
  view: MediaView | null;
};

async function json<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

export async function uploadFile(file: File, onProgress: (fraction: number) => void): Promise<string> {
  const start = await json<{ id: string; chunkSize: number }>(
    await fetch('/api/admin/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name, size: file.size, type: file.type }),
    }),
  );
  let offset = 0;
  let failures = 0;
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + start.chunkSize);
    try {
      const res = await fetch(`/api/admin/uploads/${start.id}?offset=${offset}`, { method: 'PUT', body: chunk });
      if (res.status === 409) {
        offset = ((await res.json()) as { received: number }).received;
        continue;
      }
      offset = (await json<{ received: number }>(res)).received;
      failures = 0;
      onProgress(offset / file.size);
    } catch (err) {
      if (++failures > 5) throw err;
      await new Promise((r) => setTimeout(r, 1500 * failures));
      // Descobre quanto chegou antes de continuar
      const status = await fetch(`/api/admin/uploads/${start.id}`).then((r) => r.json()).catch(() => null);
      if (status && typeof status.received === 'number') offset = status.received;
    }
  }
  await json(await fetch(`/api/admin/uploads/${start.id}/complete`, { method: 'POST' }));
  return start.id;
}

export async function mediaStatus(id: string): Promise<MediaStatusResponse> {
  return json<MediaStatusResponse>(await fetch(`/api/admin/media/${id}`, { cache: 'no-store' }));
}

/** Espera o worker terminar de comprimir (atualiza a cada 3 s). */
export async function waitReady(id: string, onUpdate: (s: MediaStatusResponse) => void, signal?: AbortSignal) {
  while (!signal?.aborted) {
    const s = await mediaStatus(id).catch(() => null);
    if (s) {
      onUpdate(s);
      if (s.status === 'READY' || s.status === 'ERROR') return s;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return null;
}
