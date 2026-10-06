// Gera vídeos e imagens provisórios (luz quente sobre fundo escuro, com granulação)
// e coloca na fila do worker, que comprime tudo pelo mesmo caminho de um upload real.
// Aparecem no site com a marca [PREENCHER] até você subir as mídias de verdade.
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { PrismaClient } from '@prisma/client';
import { env } from '../src/lib/env';
import { runFfmpeg } from '../src/lib/processing';

type Spec = { name: string; kind: 'VIDEO' | 'IMAGE'; size: string; seconds: number; gradient: string; previewLength?: number };

const G = {
  brasaLeak: 'c0=0x1a120d:c1=0x5a2a10:c2=0xFF6A00:nb_colors=3:type=0:speed=0.03',
  goldenSweep: 'c0=0x241C16:c1=0xC24100:c2=0xFFA62B:c3=0x241C16:nb_colors=4:type=0:speed=0.02',
  ember: 'c0=0x120d0a:c1=0x7a2a00:c2=0xFF6A00:c3=0x241C16:nb_colors=4:type=0:speed=0.025',
  smoke: 'c0=0x241C16:c1=0x75685E:c2=0xFFA62B:c3=0xC24100:nb_colors=4:type=3:speed=0.015',
  dusk: 'c0=0x0f0b08:c1=0x3a2418:c2=0xFFA62B:nb_colors=3:type=0:speed=0.02',
};

export const PLACEHOLDER_SPECS: Spec[] = [
  { name: 'abertura', kind: 'VIDEO', size: '1280x720', seconds: 12, gradient: `${G.brasaLeak}:seed=5`, previewLength: 12 },
  { name: 'projeto-1', kind: 'VIDEO', size: '1280x720', seconds: 10, gradient: `${G.goldenSweep}:seed=11` },
  { name: 'projeto-2', kind: 'VIDEO', size: '1280x720', seconds: 10, gradient: `${G.smoke}:seed=9` },
  { name: 'projeto-3', kind: 'VIDEO', size: '1280x720', seconds: 10, gradient: `${G.ember}:seed=3` },
  { name: 'projeto-4', kind: 'VIDEO', size: '1280x720', seconds: 10, gradient: `${G.dusk}:seed=21` },
  { name: 'etapa-1', kind: 'VIDEO', size: '960x540', seconds: 6, gradient: `${G.dusk}:seed=31` },
  { name: 'etapa-2', kind: 'VIDEO', size: '960x540', seconds: 6, gradient: `${G.smoke}:seed=32` },
  { name: 'etapa-3', kind: 'VIDEO', size: '960x540', seconds: 6, gradient: `${G.brasaLeak}:seed=33` },
  { name: 'etapa-4', kind: 'VIDEO', size: '960x540', seconds: 6, gradient: `${G.goldenSweep}:seed=34` },
  { name: 'etapa-5', kind: 'VIDEO', size: '960x540', seconds: 6, gradient: `${G.ember}:seed=35` },
  { name: 'foto-sobre', kind: 'IMAGE', size: '960x1200', seconds: 3, gradient: `${G.smoke}:seed=41` },
  { name: 'frame-1', kind: 'IMAGE', size: '1280x720', seconds: 3, gradient: `${G.goldenSweep}:seed=51` },
  { name: 'frame-2', kind: 'IMAGE', size: '1280x720', seconds: 3, gradient: `${G.ember}:seed=52` },
  { name: 'bastidor-1', kind: 'IMAGE', size: '1280x720', seconds: 3, gradient: `${G.smoke}:seed=53` },
  { name: 'bastidor-2', kind: 'IMAGE', size: '1280x720', seconds: 3, gradient: `${G.dusk}:seed=54` },
];

async function render(spec: Spec, out: string) {
  const input = ['-f', 'lavfi', '-i', `gradients=s=${spec.size}:r=24:${spec.gradient}:d=${spec.seconds}`];
  const look = 'noise=alls=14:allf=t+u,vignette=PI/5,format=yuv420p';
  if (spec.kind === 'VIDEO') {
    await runFfmpeg(['-hide_banner', '-y', ...input, '-vf', look, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', out]);
  } else {
    await runFfmpeg(['-hide_banner', '-y', ...input, '-vf', `${look.replace(',format=yuv420p', '')},select=eq(n\\,48)`, '-frames:v', '1', out]);
  }
}

/** Cria as mídias provisórias e devolve os IDs por nome. */
export async function createPlaceholders(prisma: PrismaClient, log = console.log): Promise<Record<string, string>> {
  const work = path.join(os.tmpdir(), 'sb-placeholders');
  await fsp.mkdir(work, { recursive: true });
  await fsp.mkdir(env.uploadTmpDir, { recursive: true });
  const ids: Record<string, string> = {};
  for (const spec of PLACEHOLDER_SPECS) {
    const ext = spec.kind === 'VIDEO' ? '.mp4' : '.png';
    const src = path.join(work, `${spec.name}${ext}`);
    log(`[placeholder] gerando ${spec.name}${ext}`);
    await render(spec, src);
    const stat = await fsp.stat(src);
    const media = await prisma.media.create({
      data: {
        kind: spec.kind,
        status: 'UPLOADING',
        originalName: `placeholder-${spec.name}${ext}`,
        mimeType: spec.kind === 'VIDEO' ? 'video/mp4' : 'image/png',
        sizeBytes: stat.size,
        receivedBytes: stat.size,
        isPlaceholder: true,
        alt: '',
        previewLengthSec: spec.previewLength ?? 8,
      },
    });
    const tempPath = path.join(env.uploadTmpDir, `${media.id}${ext}`);
    await fsp.copyFile(src, tempPath);
    await prisma.media.update({ where: { id: media.id }, data: { status: 'PENDING', tempPath } });
    ids[spec.name] = media.id;
  }
  await fsp.rm(work, { recursive: true, force: true });
  return ids;
}
