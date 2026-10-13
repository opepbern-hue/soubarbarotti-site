// Biblioteca de mídias prontas (para escolher uma já enviada)
import { adminGuard } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { mediaSelect, toMediaView } from '@/lib/media';

export async function GET(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;
  const kind = new URL(req.url).searchParams.get('kind');
  const rows = await prisma.media.findMany({
    where: { status: 'READY', ...(kind === 'IMAGE' || kind === 'VIDEO' ? { kind } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: { ...mediaSelect, originalName: true },
  });
  return Response.json(rows.map((m) => ({ id: m.id, name: m.originalName, status: m.status, view: toMediaView(m) })));
}
