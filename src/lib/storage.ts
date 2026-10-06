// Onde as mídias processadas ficam guardadas.
// - local: pasta STORAGE_DIR, servida pela rota /media (bom para rodar no computador)
// - r2: Cloudflare R2 (compatível com S3), servida pelo domínio de MEDIA_BASE_URL
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { env } from './env';

export interface StorageDriver {
  put(key: string, filePath: string, contentType: string): Promise<void>;
  /** Baixa um arquivo guardado para um caminho local (usado para recortar capa/prévia de novo). */
  download(key: string, destPath: string): Promise<void>;
  deletePrefix(prefix: string): Promise<void>;
  /** Abre o arquivo para enviar ao navegador (download de fotos). */
  read(key: string): Promise<{ stream: ReadableStream; size: number | null } | null>;
}

const CACHE_CONTROL = 'public, max-age=31536000, immutable';

function safeKey(key: string): string {
  const normalized = path.posix.normalize(key).replace(/^\/+/, '');
  if (normalized.startsWith('..') || normalized.includes('\0')) throw new Error(`Chave inválida: ${key}`);
  return normalized;
}

export function localPathFor(key: string): string {
  const full = path.join(env.storageDir, safeKey(key));
  if (!full.startsWith(env.storageDir)) throw new Error(`Chave inválida: ${key}`);
  return full;
}

const localDriver: StorageDriver = {
  async put(key, filePath) {
    const dest = localPathFor(key);
    await fsp.mkdir(path.dirname(dest), { recursive: true });
    await fsp.copyFile(filePath, dest);
  },
  async download(key, destPath) {
    await fsp.mkdir(path.dirname(destPath), { recursive: true });
    await fsp.copyFile(localPathFor(key), destPath);
  },
  async deletePrefix(prefix) {
    await fsp.rm(localPathFor(prefix), { recursive: true, force: true });
  },
  async read(key) {
    const file = localPathFor(key);
    const stat = await fsp.stat(file).catch(() => null);
    if (!stat?.isFile()) return null;
    const { Readable } = await import('node:stream');
    return { stream: Readable.toWeb(fs.createReadStream(file)) as ReadableStream, size: stat.size };
  },
};

async function r2Client() {
  const { S3Client } = await import('@aws-sdk/client-s3');
  return new S3Client({
    region: 'auto',
    endpoint: env.r2.endpoint,
    credentials: { accessKeyId: env.r2.accessKeyId, secretAccessKey: env.r2.secretAccessKey },
  });
}

const r2Driver: StorageDriver = {
  async put(key, filePath, contentType) {
    const { Upload } = await import('@aws-sdk/lib-storage');
    const upload = new Upload({
      client: await r2Client(),
      params: {
        Bucket: env.r2.bucket,
        Key: safeKey(key),
        Body: fs.createReadStream(filePath),
        ContentType: contentType,
        CacheControl: CACHE_CONTROL,
      },
    });
    await upload.done();
  },
  async download(key, destPath) {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const res = await (await r2Client()).send(new GetObjectCommand({ Bucket: env.r2.bucket, Key: safeKey(key) }));
    if (!res.Body) throw new Error(`Arquivo não encontrado no R2: ${key}`);
    await fsp.mkdir(path.dirname(destPath), { recursive: true });
    const { pipeline } = await import('node:stream/promises');
    await pipeline(res.Body as NodeJS.ReadableStream, fs.createWriteStream(destPath));
  },
  async deletePrefix(prefix) {
    const { ListObjectsV2Command, DeleteObjectsCommand } = await import('@aws-sdk/client-s3');
    const client = await r2Client();
    let token: string | undefined;
    do {
      const list = await client.send(
        new ListObjectsV2Command({ Bucket: env.r2.bucket, Prefix: safeKey(prefix), ContinuationToken: token }),
      );
      const objects = (list.Contents ?? []).map((o) => ({ Key: o.Key! }));
      if (objects.length) {
        await client.send(new DeleteObjectsCommand({ Bucket: env.r2.bucket, Delete: { Objects: objects } }));
      }
      token = list.IsTruncated ? list.NextContinuationToken : undefined;
    } while (token);
  },
  async read(key) {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    try {
      const res = await (await r2Client()).send(new GetObjectCommand({ Bucket: env.r2.bucket, Key: safeKey(key) }));
      if (!res.Body) return null;
      return { stream: res.Body.transformToWebStream() as ReadableStream, size: res.ContentLength ?? null };
    } catch {
      return null;
    }
  },
};

export function storage(): StorageDriver {
  return env.storageDriver === 'r2' ? r2Driver : localDriver;
}

export function publicUrl(key: string): string {
  return `${env.mediaBaseUrl}/${key}`;
}
