import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = 'https://xvabghgvrhpnyywpmodb.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YWJnaGd2cmhwbnl5d3Btb2RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NTgwNTEsImV4cCI6MjEwNzMzNDA1MX0.d0CNiaTYEnpsCY4N9qS6HNIxa3u7DYtzAOErvZHzC0w';

const BUCKET = 'media';

const MIME_MAP: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

function getAllFiles(dir: string, baseDir: string = dir): { absPath: string; key: string }[] {
  let results: { absPath: string; key: string }[] = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(full, baseDir));
    } else if (stat.isFile() && !item.startsWith('.')) {
      const rel = path.relative(baseDir, full).replace(/\\/g, '/');
      results.push({ absPath: full, key: rel });
    }
  }
  return results;
}

async function main() {
  const storageDir = path.resolve('./storage');
  if (!fs.existsSync(storageDir)) {
    throw new Error('Pasta storage não encontrada.');
  }

  const files = getAllFiles(storageDir);
  console.log(`[supabase-upload] Total de arquivos encontrados em storage/: ${files.length}`);

  let completed = 0;
  let failed = 0;
  const queue = [...files];
  const CONCURRENCY = 6;

  async function worker(id: number) {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const ext = path.extname(item.absPath).toLowerCase();
      const contentType = MIME_MAP[ext] || 'application/octet-stream';
      const fileBuffer = fs.readFileSync(item.absPath);

      const targetUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${item.key}`;

      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${ANON_KEY}`,
            'Content-Type': contentType,
            'x-upsert': 'true',
          },
          body: fileBuffer,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }

        completed++;
        if (completed % 10 === 0 || completed === files.length) {
          console.log(`[W${id}] Progresso: ${completed}/${files.length} (${item.key})`);
        }
      } catch (err) {
        failed++;
        console.error(`[W${id}] ERRO ao enviar ${item.key}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  console.log(`\n======================================================`);
  console.log(`[supabase-upload] Concluído! Enviados: ${completed}, Falhas: ${failed}`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error('[supabase-upload] Erro fatal:', err);
  process.exit(1);
});
