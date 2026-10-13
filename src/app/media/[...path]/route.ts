// Serve as mídias guardadas no disco (STORAGE_DRIVER=local), com suporte a Range
// (necessário para o Safari/iPhone tocar vídeo e para avançar o vídeo).
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { localPathFor } from '@/lib/storage';

const TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const relPath = parts.join('/');

  // 1. Tenta servir do disco local se o arquivo existir fisicamente
  try {
    const file = localPathFor(relPath);
    const stat = await fsp.stat(file).catch(() => null);
    if (stat?.isFile()) {
      const type = TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
      const headers: Record<string, string> = {
        'Content-Type': type,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      };

      const range = req.headers.get('range');
      const m = range?.match(/bytes=(\d*)-(\d*)/);
      if (m && (m[1] || m[2])) {
        let start = m[1] ? Number(m[1]) : stat.size - Number(m[2]);
        let end = m[1] && m[2] ? Number(m[2]) : stat.size - 1;
        if (!m[1]) end = stat.size - 1;
        start = Math.max(0, start);
        end = Math.min(end, stat.size - 1);
        if (start > end) {
          return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } });
        }
        const stream = Readable.toWeb(fs.createReadStream(file, { start, end })) as ReadableStream;
        return new Response(stream, {
          status: 206,
          headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': String(end - start + 1) },
        });
      }
      const stream = Readable.toWeb(fs.createReadStream(file)) as ReadableStream;
      return new Response(stream, { headers: { ...headers, 'Content-Length': String(stat.size) } });
    }
  } catch {
    // Segue para o Supabase Storage se não estiver local
  }

  // 2. Busca no Supabase Storage sob o próprio domínio do site
  const SUPABASE_STORAGE_URL = 'https://xvabghgvrhpnyywpmodb.supabase.co/storage/v1/object/public/media';
  try {
    const supabaseUrl = `${SUPABASE_STORAGE_URL}/${relPath.split('/').map(encodeURIComponent).join('/')}`;
    const fetchHeaders: HeadersInit = {};
    const clientRange = req.headers.get('range');
    if (clientRange) {
      fetchHeaders['range'] = clientRange;
    }

    const res = await fetch(supabaseUrl, {
      headers: fetchHeaders,
      cache: 'force-cache',
    });

    if (!res.ok && res.status !== 206) {
      return new Response('Não encontrado', { status: 404 });
    }

    const responseHeaders = new Headers();
    const contentType =
      res.headers.get('content-type') || TYPES[path.extname(relPath).toLowerCase()] || 'application/octet-stream';
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');

    if (res.headers.has('content-range')) {
      responseHeaders.set('Content-Range', res.headers.get('content-range')!);
    }
    if (res.headers.has('content-length')) {
      responseHeaders.set('Content-Length', res.headers.get('content-length')!);
    }

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[media] Erro ao buscar mídia no Supabase:', err);
    return new Response('Erro ao carregar mídia', { status: 500 });
  }
}
