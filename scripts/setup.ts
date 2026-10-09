// Prepara tudo na primeira vez: .env, banco local, tabelas, conteúdo inicial e mídias provisórias.
// Uso: npm run setup
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { LOCAL_DATABASE_URL, startLocalDb } from './db-local';
import { ENV_PATH, readEnvFile } from './env-file';
import { loadEnv } from './load-env';

async function ensureEnv(): Promise<void> {
  const current = readEnvFile();
  if (current.SESSION_SECRET) return;

  const keep = (k: string, fallback: string) => current[k] || fallback;
  const dbUrl = current.DATABASE_URL?.startsWith('postgres') ? current.DATABASE_URL : LOCAL_DATABASE_URL;

  const content = `# Configuração do site soubarbarotti.com.br

# Banco de dados. No computador, o Postgres embutido liga sozinho com "npm run dev" (LOCAL_DB=1).
DATABASE_URL="${dbUrl}"
LOCAL_DB=${keep('LOCAL_DB', '1')}

# Endereço público do site (em produção: https://soubarbarotti.com.br)
SITE_URL=${keep('SITE_URL', 'http://localhost:3000')}

# Chave interna de sessão
SESSION_SECRET=${keep('SESSION_SECRET', randomBytes(48).toString('base64url'))}

# Mídia: "local" guarda no disco (pasta STORAGE_DIR); "r2" usa o Cloudflare R2
STORAGE_DRIVER=${keep('STORAGE_DRIVER', 'local')}
STORAGE_DIR=${keep('STORAGE_DIR', './storage')}
UPLOAD_TMP_DIR=${keep('UPLOAD_TMP_DIR', './.data/uploads')}
MEDIA_BASE_URL=${keep('MEDIA_BASE_URL', '/media')}

# Cloudflare R2 (só em produção, com STORAGE_DRIVER=r2)
R2_ACCOUNT_ID=${keep('R2_ACCOUNT_ID', '')}
R2_ACCESS_KEY_ID=${keep('R2_ACCESS_KEY_ID', '')}
R2_SECRET_ACCESS_KEY=${keep('R2_SECRET_ACCESS_KEY', '')}
R2_BUCKET=${keep('R2_BUCKET', '')}

# Aviso de mensagem nova no seu WhatsApp (CallMeBot). Número com DDI e DDD, só dígitos: 5548999999999
WHATSAPP_NOTIFY_PHONE=${keep('WHATSAPP_NOTIFY_PHONE', '')}
CALLMEBOT_APIKEY=${keep('CALLMEBOT_APIKEY', '')}
`;
  fs.writeFileSync(ENV_PATH, content, 'utf8');
  console.log('[setup] arquivo .env criado.');
}

function prisma(args: string[]) {
  const bin = path.resolve('node_modules/prisma/build/index.js');
  const r = spawnSync(process.execPath, [bin, ...args], { stdio: 'inherit', env: process.env });
  if (r.status !== 0) throw new Error(`prisma ${args.join(' ')} falhou`);
}

async function main() {
  await ensureEnv();
  loadEnv();

  const db = process.env.LOCAL_DB === '1' ? await startLocalDb() : null;
  try {
    console.log('[setup] criando as tabelas…');
    prisma(['db', 'push', '--skip-generate']);
    prisma(['generate']);

    const { PrismaClient } = await import('@prisma/client');
    const client = new PrismaClient();
    const { seed } = await import('../prisma/seed');
    await seed(client);

    console.log('[setup] comprimindo as mídias provisórias…');
    const { drainQueue } = await import('./worker');
    await drainQueue();
    await client.$disconnect();
  } finally {
    await db?.stop();
  }

  console.log('\n[setup] pronto! Agora rode:  npm run dev  e abra http://localhost:3000');
}

main().catch((e) => {
  console.error('[setup] erro:', e instanceof Error ? e.message : e);
  process.exit(1);
});
