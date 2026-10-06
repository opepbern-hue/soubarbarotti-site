// Importa as filmagens do site antigo (soubarbarotti.com.br/projeto/) para o portfólio novo.
// Baixa cada vídeo, cria o projeto só com nome e categoria e comprime pelo worker.
// Pode rodar de novo: projetos que já existem são pulados.
// Uso: npm run importar
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { loadEnv } from './load-env';

loadEnv();

type Item = { title: string; category: string; featured: boolean; url: string; order: number };

async function main() {
  const dataFile = path.resolve('.data/importar-site-antigo.json');
  if (!fs.existsSync(dataFile)) throw new Error(`Arquivo ${dataFile} não encontrado.`);
  const { heroIndex, items } = JSON.parse(fs.readFileSync(dataFile, 'utf8')) as { heroIndex: number; items: Item[] };

  const { startLocalDb } = await import('./db-local');
  const db = process.env.LOCAL_DB === '1' ? await startLocalDb() : null;
  const { prisma } = await import('../src/lib/db');
  const { env } = await import('../src/lib/env');
  const { slugify } = await import('../src/lib/slug');
  await fsp.mkdir(env.uploadTmpDir, { recursive: true });

  const mediaIds: (string | null)[] = [];
  for (const it of items) {
    const slug = slugify(it.title);
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      console.log(`[importar] já existe, pulando: ${it.title}`);
      mediaIds.push(existing.heroMediaId);
      continue;
    }
    const name = decodeURIComponent(new URL(it.url).pathname.split('/').pop() ?? 'video');
    const ext = path.extname(name) || '.mp4';
    console.log(`[importar] baixando ${it.title} (${name})`);
    const res = await fetch(it.url);
    if (!res.ok || !res.body) throw new Error(`Falha ao baixar ${it.title}: HTTP ${res.status}`);
    const media = await prisma.media.create({
      data: {
        kind: 'VIDEO',
        status: 'UPLOADING',
        originalName: name,
        mimeType: res.headers.get('content-type') ?? '',
        alt: `Vídeo: ${it.title}`,
        previewStartSec: 1,
        previewLengthSec: items.indexOf(it) === heroIndex ? 14 : 8,
      },
    });
    const tempPath = path.join(env.uploadTmpDir, `${media.id}${ext}`);
    await pipeline(Readable.fromWeb(res.body as never), fs.createWriteStream(tempPath));
    const size = (await fsp.stat(tempPath)).size;
    await prisma.media.update({ where: { id: media.id }, data: { status: 'PENDING', tempPath, sizeBytes: size, receivedBytes: size } });
    await prisma.project.create({
      data: {
        slug,
        title: it.title,
        category: it.category,
        client: it.category === 'Autoral' ? '' : it.title,
        featured: it.featured,
        published: true,
        order: it.order,
        heroMediaId: media.id,
        fullVideoMediaId: media.id,
      },
    });
    mediaIds.push(media.id);
  }

  // Vídeo dentro das letras da abertura e do rodapé
  const heroId = mediaIds[heroIndex];
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (heroId && settings) {
    await prisma.siteSettings.update({
      where: { id: 1 },
      data: { heroMediaId: heroId, ...(settings.whatsapp ? {} : { whatsapp: '5548999924405' }) },
    });
    console.log('[importar] vídeo da abertura trocado');
  }

  // Os trabalhos provisórios (sem vídeo real) saem do ar; não são apagados
  const hidden = await prisma.project.updateMany({
    where: { published: true, heroMedia: { isPlaceholder: true } },
    data: { published: false, featured: false },
  });
  if (hidden.count) console.log(`[importar] ${hidden.count} trabalhos provisórios despublicados (continuam no admin)`);

  if (!process.argv.includes('--sem-processar')) {
    console.log('[importar] comprimindo os vídeos (alguns minutos)…');
    const { drainQueue } = await import('./worker');
    await drainQueue();
  }
  await prisma.$disconnect();
  await db?.stop();
  console.log('[importar] pronto.');
}

main().catch((e) => {
  console.error('[importar] erro:', e instanceof Error ? e.message : e);
  process.exit(1);
});
