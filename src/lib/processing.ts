// Compressão de mídia. Roda só no worker (scripts/worker.ts), nunca dentro de uma requisição.
import { spawn } from 'node:child_process';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import ffmpegStatic from 'ffmpeg-static';
import type { Media } from '@prisma/client';
import { prisma } from './db';
import { env } from './env';
import { storage } from './storage';
import type { ImageSet, MediaVariants, SizedKey } from './media';

const PRESET = process.env.FFMPEG_PRESET || 'medium';
const THREADS = process.env.FFMPEG_THREADS || '2';

function ffmpegBin(): string {
  return env.ffmpegPath || (ffmpegStatic as unknown as string | null) || 'ffmpeg';
}

type RunResult = { code: number | null; stderr: string };

/** Roda o FFmpeg com prioridade baixa (no Linux), para o site continuar rápido enquanto comprime. */
function runFfmpeg(args: string[], { allowFail = false, timeoutMs = 45 * 60 * 1000 } = {}): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const bin = ffmpegBin();
    const [cmd, cmdArgs] = process.platform === 'linux' ? ['nice', ['-n', '15', bin, ...args]] : [bin, args];
    const child = spawn(cmd, cmdArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (d: Buffer) => {
      stderr = (stderr + d.toString()).slice(-20000);
    });
    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0 && !allowFail) {
        reject(new Error(`FFmpeg falhou (código ${code}): ${stderr.split('\n').slice(-6).join(' ').trim()}`));
      } else resolve({ code, stderr });
    });
  });
}

type Probe = { duration: number | null; width: number | null; height: number | null; hasAudio: boolean };

async function probe(file: string): Promise<Probe> {
  const { stderr } = await runFfmpeg(['-hide_banner', '-i', file], { allowFail: true });
  const d = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const duration = d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : null;
  const videoLine = stderr.split('\n').find((l) => /Stream #\d+:\d+.*Video:/.test(l)) ?? '';
  const dims = videoLine.match(/(\d{2,5})x(\d{2,5})/);
  if (!videoLine) throw new Error('O arquivo não tem uma faixa de vídeo que o FFmpeg consiga ler.');
  return {
    duration,
    width: dims ? Number(dims[1]) : null,
    height: dims ? Number(dims[2]) : null,
    hasAudio: /Stream #\d+:\d+.*Audio:/.test(stderr),
  };
}

/** Limita o lado maior do vídeo, mantendo proporção e dimensões pares (exigência do H.264). */
function longSide(n: number): string {
  return (
    `scale=w='if(gte(iw,ih),trunc(min(${n},iw)/2)*2,-2)':` +
    `h='if(gte(iw,ih),-2,trunc(min(${n},ih)/2)*2)',setsar=1`
  );
}

const x264 = (crf: number, profile = 'high') => [
  '-c:v', 'libx264', '-preset', PRESET, '-crf', String(crf), '-profile:v', profile,
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-threads', THREADS,
];

async function imageSet(
  src: string,
  outDir: string,
  prefix: string,
  keyPrefix: string,
  targetWidths: number[],
  sourceWidth: number,
): Promise<{ set: ImageSet; files: { file: string; key: string; type: string }[] }> {
  const widths = [...new Set([...targetWidths.filter((w) => w < sourceWidth), Math.min(sourceWidth, Math.max(...targetWidths))])].sort(
    (a, b) => a - b,
  );
  const set: ImageSet = { avif: [], webp: [] };
  const files: { file: string; key: string; type: string }[] = [];
  for (const w of widths) {
    const base = sharp(src, { failOn: 'none' }).rotate().resize({ width: w, withoutEnlargement: true }).keepXmp();
    const avif = path.join(outDir, `${prefix}-${w}.avif`);
    const webp = path.join(outDir, `${prefix}-${w}.webp`);
    await base.clone().avif({ quality: 52, effort: 4 }).toFile(avif);
    await base.clone().webp({ quality: 80 }).toFile(webp);
    const avifKey: SizedKey = { w, key: `${keyPrefix}/${prefix}-${w}.avif` };
    const webpKey: SizedKey = { w, key: `${keyPrefix}/${prefix}-${w}.webp` };
    set.avif.push(avifKey);
    set.webp.push(webpKey);
    files.push({ file: avif, key: avifKey.key, type: 'image/avif' }, { file: webp, key: webpKey.key, type: 'image/webp' });
  }
  return { set, files };
}

async function blurDataUrl(src: string): Promise<string> {
  const buf = await sharp(src, { failOn: 'none' }).rotate().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

async function uploadAll(files: { file: string; key: string; type: string }[]) {
  for (const f of files) await storage().put(f.key, f.file, f.type);
}

async function processImage(media: Media, src: string, work: string, keyPrefix: string, version: string) {
  const meta = await sharp(src, { failOn: 'none' }).metadata();
  if (!meta.width || !meta.height) throw new Error('Não consegui ler as dimensões da imagem.');
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;
  const { set, files } = await imageSet(src, work, 'img', keyPrefix, [480, 960, 1600, 2400], width);
  // Versão para download (JPG em alta, até 4096 px no lado maior)
  const dl = path.join(work, 'download.jpg');
  await sharp(src, { failOn: 'none' })
    .rotate()
    .resize({ width: 4096, height: 4096, fit: 'inside', withoutEnlargement: true })
    .keepXmp()
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(dl);
  files.push({ file: dl, key: `${keyPrefix}/download.jpg`, type: 'image/jpeg' });
  await uploadAll(files);
  const variants: MediaVariants = { version, image: set, download: `${keyPrefix}/download.jpg` };
  return { variants, width, height, durationSec: null, blur: await blurDataUrl(src) };
}

async function processVideo(media: Media, src: string, work: string, keyPrefix: string, version: string, recut: boolean) {
  const files: { file: string; key: string; type: string }[] = [];
  const full = path.join(work, 'full.mp4');

  if (recut) {
    await fsp.copyFile(src, full);
  } else {
    // 1. Vídeo completo para a web: H.264 até 1080p, som AAC, começa a tocar antes de baixar tudo
    await runFfmpeg([
      '-hide_banner', '-y', '-i', src,
      '-map', '0:v:0', '-map', '0:a:0?',
      '-vf', longSide(1920), '-fpsmax', '60',
      ...x264(22),
      '-c:a', 'aac', '-b:a', '128k', '-ac', '2',
      full,
    ]);
  }
  files.push({ file: full, key: `${keyPrefix}/full.mp4`, type: 'video/mp4' });

  const info = await probe(full);
  const duration = info.duration ?? 0;

  // 2. Prévias mudas para os loops (720 no desktop, 480 no celular)
  const start = Math.max(0, Math.min(media.previewStartSec, Math.max(0, duration - 1)));
  const length = Math.max(1, Math.min(media.previewLengthSec, duration - start || media.previewLengthSec));
  for (const [name, side, crf] of [
    ['p720', 1280, 26],
    ['p480', 854, 28],
  ] as const) {
    const out = path.join(work, `${name}.mp4`);
    await runFfmpeg([
      '-hide_banner', '-y', '-ss', start.toFixed(2), '-t', length.toFixed(2), '-i', full,
      '-an', '-vf', longSide(side), '-fpsmax', '30',
      ...x264(crf, 'main'),
      out,
    ]);
    files.push({ file: out, key: `${keyPrefix}/${name}.mp4`, type: 'video/mp4' });
  }

  // 3. Capa tirada do próprio vídeo
  const posterPng = path.join(work, 'poster.png');
  if (media.posterAtSec != null) {
    const t = Math.max(0, Math.min(media.posterAtSec, Math.max(0, duration - 0.1)));
    await runFfmpeg(['-hide_banner', '-y', '-ss', t.toFixed(2), '-i', full, '-frames:v', '1', '-update', '1', posterPng]);
  } else {
    const from = Math.min(1, duration * 0.1);
    await runFfmpeg([
      '-hide_banner', '-y', '-ss', from.toFixed(2), '-t', '12', '-i', full,
      '-vf', 'thumbnail=90', '-frames:v', '1', '-update', '1', posterPng,
    ]);
  }
  const width = info.width ?? 1920;
  const height = info.height ?? 1080;
  const poster = await imageSet(posterPng, work, 'poster', keyPrefix, [640, 1280, 1920], width);
  files.push(...poster.files);

  await uploadAll(files);
  const variants: MediaVariants = {
    version,
    full: `${keyPrefix}/full.mp4`,
    p720: `${keyPrefix}/p720.mp4`,
    p480: `${keyPrefix}/p480.mp4`,
    poster: poster.set,
    hasAudio: info.hasAudio,
  };
  return { variants, width, height, durationSec: info.duration, blur: await blurDataUrl(posterPng) };
}

/** Processa uma mídia da fila. Lança erro se falhar (o worker registra e tenta de novo). */
export async function processMedia(media: Media): Promise<void> {
  const version = Date.now().toString(36);
  const keyPrefix = `m/${media.id}/${version}`;
  const work = path.join(os.tmpdir(), 'sb-media', `${media.id}-${version}`);
  await fsp.mkdir(work, { recursive: true });
  const previous = media.variants as unknown as MediaVariants | null;

  try {
    let src = media.tempPath;
    let recut = false;
    if (!src || !(await fsp.stat(src).catch(() => null))) {
      // Sem original: recorta capa e prévia a partir do vídeo completo já guardado
      if (media.kind !== 'VIDEO' || !previous?.full) throw new Error('Arquivo original não encontrado.');
      src = path.join(work, 'source.mp4');
      await storage().download(previous.full, src);
      recut = true;
    }

    const result =
      media.kind === 'IMAGE'
        ? await processImage(media, src, work, keyPrefix, version)
        : await processVideo(media, src, work, keyPrefix, version, recut);

    await prisma.media.update({
      where: { id: media.id },
      data: {
        status: 'READY',
        variants: result.variants as object,
        width: result.width,
        height: result.height,
        durationSec: result.durationSec,
        blurDataUrl: result.blur,
        error: null,
        lockedAt: null,
        tempPath: null,
      },
    });

    // Limpa o original e a versão anterior
    if (media.tempPath) await fsp.rm(media.tempPath, { force: true });
    if (previous?.version && previous.version !== version) {
      await storage().deletePrefix(`m/${media.id}/${previous.version}`).catch(() => {});
    }
  } finally {
    await fsp.rm(work, { recursive: true, force: true }).catch(() => {});
  }
}

export { probe, runFfmpeg, ffmpegBin };
