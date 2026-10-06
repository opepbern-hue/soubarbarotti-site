// Início de um upload: cria a mídia e diz o tamanho de cada parte
import fsp from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { adminGuard } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

const CHUNK_SIZE = 8 * 1024 * 1024;

const schema = z.object({ name: z.string().min(1).max(300), size: z.number().int().positive(), type: z.string().max(100) });

export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Arquivo inválido.' }, { status: 400 });
  const { name, size, type } = parsed.data;

  const kind = type.startsWith('video/') || /\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(name) ? 'VIDEO' : 'IMAGE';
  const limitMb = kind === 'VIDEO' ? env.maxVideoMb : env.maxImageMb;
  if (size > limitMb * 1024 * 1024) {
    return Response.json(
      { error: `Arquivo grande demais (limite de ${limitMb} MB para ${kind === 'VIDEO' ? 'vídeo' : 'imagem'}).` },
      { status: 413 },
    );
  }

  await fsp.mkdir(env.uploadTmpDir, { recursive: true });
  const media = await prisma.media.create({
    data: { kind, status: 'UPLOADING', originalName: name, mimeType: type, sizeBytes: size, alt: '' },
  });
  const ext = path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 6);
  const tempPath = path.join(env.uploadTmpDir, `${media.id}${ext}`);
  await fsp.writeFile(tempPath, Buffer.alloc(0));
  await prisma.media.update({ where: { id: media.id }, data: { tempPath } });
  return Response.json({ id: media.id, chunkSize: CHUNK_SIZE, kind });
}
