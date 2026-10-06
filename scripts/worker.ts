// Worker de mídia: pega a próxima mídia da fila (tabela Media no Postgres),
// comprime com FFmpeg/sharp e marca como pronta. Rode com: npm run worker
import fsp from 'node:fs/promises';
import { loadEnv } from './load-env';

loadEnv();

let stopping = false;

async function deps() {
  const { prisma } = await import('../src/lib/db');
  const { processMedia } = await import('../src/lib/processing');
  return { prisma, processMedia };
}

/** Avisa o site (Next) para limpar o cache e mostrar a mídia nova. */
async function pingSite() {
  const { revalidateToken } = await import('../src/lib/revalidate-token');
  const secret = process.env.SESSION_SECRET;
  if (!secret) return;
  const base = process.env.INTERNAL_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
  await fetch(`${base}/api/revalidate`, {
    method: 'POST',
    headers: { 'x-revalidate-token': revalidateToken(secret) },
    signal: AbortSignal.timeout(5000),
  }).catch(() => {
    /* site fora do ar (ex.: durante o setup): o cache expira sozinho em 5 min */
  });
}

async function claimNext() {
  const { prisma } = await deps();
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    UPDATE "Media"
       SET status = 'PROCESSING', "lockedAt" = now(), attempts = attempts + 1, "updatedAt" = now()
     WHERE id = (
       SELECT id FROM "Media"
        WHERE status = 'PENDING'
        ORDER BY "createdAt"
        LIMIT 1
        FOR UPDATE SKIP LOCKED
     )
     RETURNING id`;
  if (!rows.length) return null;
  return prisma.media.findUnique({ where: { id: rows[0].id } });
}

async function housekeeping() {
  const { prisma } = await deps();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Processamento travado (worker reiniciou no meio): volta para a fila
  await prisma.media.updateMany({ where: { status: 'PROCESSING', lockedAt: { lt: hourAgo } }, data: { status: 'PENDING', lockedAt: null } });

  // Upload abandonado há mais de 24 h: apaga o arquivo parcial
  const stale = await prisma.media.findMany({ where: { status: 'UPLOADING', updatedAt: { lt: dayAgo } } });
  for (const m of stale) {
    if (m.tempPath) await fsp.rm(m.tempPath, { force: true });
    await prisma.media.update({ where: { id: m.id }, data: { status: 'ERROR', error: 'Upload não terminou.', tempPath: null } });
  }

  // Registros de tentativa (anti-spam e login) só precisam de alguns dias
  await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: weekAgo } } });
  await prisma.contactAttempt.deleteMany({ where: { createdAt: { lt: weekAgo } } });
}

/** Processa uma mídia. Devolve false quando a fila está vazia. */
export async function processOne(log = console.log): Promise<boolean> {
  const { prisma, processMedia } = await deps();
  const media = await claimNext();
  if (!media) return false;
  const started = Date.now();
  log(`[worker] processando ${media.kind === 'VIDEO' ? 'vídeo' : 'imagem'} "${media.originalName}" (${media.id})`);
  try {
    await processMedia(media);
    log(`[worker] pronto em ${((Date.now() - started) / 1000).toFixed(1)} s: ${media.originalName}`);
    await pingSite();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const giveUp = media.attempts >= 3;
    await prisma.media.update({
      where: { id: media.id },
      data: { status: giveUp ? 'ERROR' : 'PENDING', error: message.slice(0, 2000), lockedAt: null },
    });
    console.error(`[worker] erro (${giveUp ? 'desisti após 3 tentativas' : 'vou tentar de novo'}): ${message}`);
  }
  return true;
}

/** Processa tudo o que estiver na fila e termina (usado pelo `npm run setup`). */
export async function drainQueue(log = console.log): Promise<void> {
  while (await processOne(log)) {
    /* continua */
  }
}

async function main() {
  const { prisma } = await deps();
  console.log('[worker] aguardando mídias na fila…');
  let lastHousekeeping = 0;
  const onStop = () => {
    stopping = true;
    console.log('[worker] encerrando depois do item atual…');
  };
  process.on('SIGINT', onStop);
  process.on('SIGTERM', onStop);

  while (!stopping) {
    try {
      if (Date.now() - lastHousekeeping > 5 * 60 * 1000) {
        await housekeeping();
        lastHousekeeping = Date.now();
      }
      const worked = await processOne();
      if (!worked) await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error('[worker] falha inesperada:', err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  await prisma.$disconnect();
}

if (process.argv[1] && /worker\.ts$/.test(process.argv[1])) {
  main();
}
