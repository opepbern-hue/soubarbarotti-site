import { loadEnv } from './load-env';

loadEnv();

const SUPABASE_URL = 'https://xvabghgvrhpnyywpmodb.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YWJnaGd2cmhwbnl5d3Btb2RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NTgwNTEsImV4cCI6MjEwNzMzNDA1MX0.d0CNiaTYEnpsCY4N9qS6HNIxa3u7DYtzAOErvZHzC0w';

type VideoRow = {
  id: string;
  filename: string;
  url: string;
  title: string;
  size: number;
};

async function main() {
  console.log('[copy-to-ssss] Buscando lista de vídeos do Supabase...');

  const res = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_videos?select=id,filename,url,title,size&order=position.asc,id.asc`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ao buscar vídeos: ${res.status} ${await res.text()}`);
  }

  const videos = (await res.json()) as VideoRow[];
  console.log(`[copy-to-ssss] Total de vídeos encontrados: ${videos.length}`);

  let successCount = 0;
  let errorCount = 0;

  // Processa em lotes com concorrência moderada
  const CONCURRENCY = 4;
  const queue = [...videos];

  async function worker(workerId: number) {
    while (queue.length > 0) {
      const v = queue.shift();
      if (!v) break;

      const filename = v.filename || v.url.split('/').pop() || `${v.id}.webm`;
      const targetUrl = `${SUPABASE_URL}/storage/v1/object/public/SSSS/${filename}`;
      const uploadEndpoint = `${SUPABASE_URL}/storage/v1/object/SSSS/${encodeURIComponent(filename)}`;

      try {
        console.log(`[W${workerId}] Copiando: ${v.title} (${filename})...`);

        // 1. Baixa o vídeo da URL atual
        const getRes = await fetch(v.url);
        if (!getRes.ok) {
          throw new Error(`Falha no download da URL antiga: HTTP ${getRes.status}`);
        }
        const buffer = await getRes.arrayBuffer();

        // 2. Faz upload para o bucket SSSS
        const contentType = getRes.headers.get('content-type') || (filename.endsWith('.mp4') ? 'video/mp4' : 'video/webm');
        const putRes = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${ANON_KEY}`,
            'Content-Type': contentType,
            'x-upsert': 'true',
          },
          body: buffer,
        });

        if (!putRes.ok) {
          throw new Error(`Falha no upload para SSSS: HTTP ${putRes.status} ${await putRes.text()}`);
        }

        // 3. Atualiza na tabela public.portfolio_videos
        const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_videos?id=eq.${encodeURIComponent(v.id)}`, {
          method: 'PATCH',
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ url: targetUrl }),
        });

        if (!patchRes.ok) {
          console.warn(`[W${workerId}] Aviso ao atualizar URL na tabela para ${v.id}: HTTP ${patchRes.status}`);
        }

        successCount++;
        console.log(`[W${workerId}] OK (${successCount}/${videos.length}): ${filename} -> SSSS`);
      } catch (err) {
        errorCount++;
        console.error(`[W${workerId}] ERRO em ${v.id} (${v.title}):`, err instanceof Error ? err.message : err);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  console.log(`\n========================================`);
  console.log(`[copy-to-ssss] Concluído! Sucessos: ${successCount}, Erros: ${errorCount}`);
  console.log(`========================================\n`);
}

main().catch((e) => {
  console.error('[copy-to-ssss] Erro fatal:', e);
  process.exit(1);
});
