// Copia todas as fotos e vídeos dos buckets antigos para um bucket novo, no mesmo projeto Supabase.
// Não apaga nem move nada: os buckets de origem ficam como estão.
//
// Uso (no Terminal):
//   SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role" npx tsx scripts/copiar-bucket.ts
// A chave fica em: Supabase > Project Settings > API Keys > service_role (secreta, não comite).

const URL_BASE = process.env.SUPABASE_URL ?? 'https://xvabghgvrhpnyywpmodb.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const DESTINO = process.env.BUCKET_DESTINO ?? 'soubarbarotti';
// Cada origem vira uma pasta no destino: soubarbarotti/media/..., soubarbarotti/videos-portifolio/...
const ORIGENS = (process.env.BUCKETS_ORIGEM ?? 'media,videos-portifolio').split(',').map((s) => s.trim());

if (!KEY) {
  console.error('Faltou SUPABASE_SERVICE_ROLE_KEY. Veja o uso no topo do arquivo.');
  process.exit(1);
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

async function api(path: string, body?: unknown, method = 'POST') {
  const res = await fetch(`${URL_BASE}/storage/v1${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
}

/** Lista todos os arquivos de um bucket, entrando nas pastas. */
async function listAll(bucket: string, prefix = ''): Promise<string[]> {
  const files: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { ok, data, status } = await api(`/object/list/${bucket}`, { prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
    if (!ok) throw new Error(`Não consegui listar ${bucket}/${prefix} (${status}): ${JSON.stringify(data)}`);
    const items = data as { name: string; id: string | null }[];
    for (const it of items) {
      const full = prefix ? `${prefix}/${it.name}` : it.name;
      if (it.id === null) files.push(...(await listAll(bucket, full))); // é pasta
      else if (it.name !== '.emptyFolderPlaceholder') files.push(full);
    }
    if (items.length < 1000) break;
  }
  return files;
}

async function main() {
  // 1. Cria o bucket público (se já existir, segue)
  const created = await api('/bucket', { id: DESTINO, name: DESTINO, public: true });
  if (created.ok) console.log(`Bucket "${DESTINO}" criado.`);
  else if (JSON.stringify(created.data).match(/already exists|Duplicate/i)) console.log(`Bucket "${DESTINO}" já existia.`);
  else throw new Error(`Não consegui criar o bucket (${created.status}): ${JSON.stringify(created.data)}`);

  let copiados = 0, pulados = 0, erros = 0;
  for (const origem of ORIGENS) {
    const files = await listAll(origem);
    console.log(`\n${origem}: ${files.length} arquivos`);
    for (const key of files) {
      const destKey = `${origem}/${key}`;
      const r = await api('/object/copy', { bucketId: origem, sourceKey: key, destinationBucket: DESTINO, destinationKey: destKey });
      if (r.ok) copiados++;
      else if (JSON.stringify(r.data).match(/already exists|Duplicate/i)) pulados++;
      else {
        erros++;
        console.warn(`  erro em ${origem}/${key}: ${r.status} ${JSON.stringify(r.data)}`);
      }
      if ((copiados + pulados + erros) % 50 === 0) console.log(`  ... ${copiados} copiados, ${pulados} já existiam, ${erros} erros`);
    }
  }
  console.log(`\nPronto: ${copiados} copiados, ${pulados} já existiam, ${erros} erros. Nada foi apagado.`);
  if (erros) process.exit(2);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
