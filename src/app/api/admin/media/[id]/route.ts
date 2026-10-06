// Status de uma mídia (o admin consulta enquanto o worker comprime)
import { adminGuard } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { mediaSelect, toMediaView } from '@/lib/media';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { id } = await params;
  const m = await prisma.media.findUnique({ where: { id }, select: { ...mediaSelect, error: true, originalName: true } });
  if (!m) return Response.json({ error: 'Mídia não encontrada.' }, { status: 404 });
  return Response.json({ id: m.id, status: m.status, kind: m.kind, error: m.error, name: m.originalName, view: toMediaView(m) });
}
