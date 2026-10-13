// Recebe uma parte do arquivo. ?offset= tem que bater com o que já chegou (permite retomar).
import fsp from 'node:fs/promises';
import { adminGuard } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media || media.status !== 'UPLOADING' || !media.tempPath) {
    return Response.json({ error: 'Upload não encontrado.' }, { status: 404 });
  }

  const offset = Number(new URL(req.url).searchParams.get('offset'));
  const current = (await fsp.stat(media.tempPath).catch(() => null))?.size ?? 0;
  if (offset !== current) return Response.json({ error: 'Posição fora de ordem.', received: current }, { status: 409 });

  const chunk = Buffer.from(await req.arrayBuffer());
  if (current + chunk.length > media.sizeBytes) return Response.json({ error: 'Arquivo maior do que o informado.' }, { status: 400 });
  await fsp.appendFile(media.tempPath, chunk);
  const received = current + chunk.length;
  await prisma.media.update({ where: { id }, data: { receivedBytes: received } });
  return Response.json({ received });
}

// Quanto já chegou (para retomar depois de uma queda)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media?.tempPath) return Response.json({ error: 'Upload não encontrado.' }, { status: 404 });
  const received = (await fsp.stat(media.tempPath).catch(() => null))?.size ?? 0;
  return Response.json({ received });
}
