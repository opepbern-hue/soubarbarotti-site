// Entrega a foto em alta (JPG) para baixar ou copiar.
// ?inline=1 abre no navegador (usado pelo botão Copiar); sem ele, força o download.
import { prisma } from '@/lib/db';
import type { MediaVariants } from '@/lib/media';
import { slugify } from '@/lib/slug';
import { storage } from '@/lib/storage';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Só entrega o que está publicado e liberado para baixar
  const photo = await prisma.photo.findFirst({ where: { id, published: true, downloadable: true }, include: { media: true } });
  const v = photo?.media.variants as MediaVariants | null | undefined;
  if (!photo || photo.media.status !== 'READY' || !v) return new Response('Foto não encontrada', { status: 404 });

  const largestWebp = [...(v.image?.webp ?? [])].sort((a, b) => b.w - a.w)[0]?.key;
  const key = v.download ?? largestWebp;
  if (!key) return new Response('Foto não encontrada', { status: 404 });
  const file = await storage().read(key);
  if (!file) return new Response('Arquivo não encontrado', { status: 404 });

  const ext = key.endsWith('.jpg') ? 'jpg' : 'webp';
  const name = `soubarbarotti-${slugify(photo.title || photo.id)}.${ext}`;
  const inline = new URL(req.url).searchParams.has('inline');
  return new Response(file.stream, {
    headers: {
      'Content-Type': ext === 'jpg' ? 'image/jpeg' : 'image/webp',
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${name}"`,
      'Cache-Control': 'public, max-age=86400',
      ...(file.size ? { 'Content-Length': String(file.size) } : {}),
    },
  });
}
