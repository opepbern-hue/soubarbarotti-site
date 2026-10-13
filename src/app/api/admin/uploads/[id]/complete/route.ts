// Fim do upload: confere o arquivo e coloca na fila do worker
import fsp from 'node:fs/promises';
import { adminGuard } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sniffFile } from '@/lib/sniff';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media || media.status !== 'UPLOADING' || !media.tempPath) {
    return Response.json({ error: 'Upload não encontrado.' }, { status: 404 });
  }

  const size = (await fsp.stat(media.tempPath).catch(() => null))?.size ?? 0;
  if (size !== media.sizeBytes) return Response.json({ error: 'O arquivo não chegou inteiro. Tente de novo.' }, { status: 400 });

  const sniffed = await sniffFile(media.tempPath);
  if (!sniffed.kind) {
    await fsp.rm(media.tempPath, { force: true });
    await prisma.media.delete({ where: { id } });
    return Response.json({ error: sniffed.reason }, { status: 415 });
  }
  await prisma.media.update({
    where: { id },
    data: { status: 'PENDING', kind: sniffed.kind, mimeType: sniffed.type, receivedBytes: size },
  });
  return Response.json({ id, kind: sniffed.kind, status: 'PENDING' });
}
