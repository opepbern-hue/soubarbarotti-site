// scripts/prod.ts
// Script de inicialização em produção para Dokploy / Docker / Nixpacks.
// 1. Valida variáveis essenciais e avisa se o DATABASE_URL for placeholder.
// 2. Inicia Next.js escutando em 0.0.0.0 IMEDIATAMENTE (porta 3000 aberta em <100ms).
//    Isso garante que o Traefik/Dokploy nunca receba "502 Bad Gateway".
// 3. Aguarda o PostgreSQL responder (até 30s) em background.
// 4. Executa prisma db push e seed inicial com segurança.
// 5. Inicia o worker de mídia em background para processar uploads no servidor.

import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { loadEnv } from './load-env';

loadEnv();

async function checkDatabaseConnection(maxAttempts = 15, delayMs = 2000): Promise<boolean> {
  const defaultSupabase =
    'postgresql://soubarbarotti.xvabghgvrhpnyywpmodb:SouBarbarotti_DB_2026_Secure@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';
  let dbUrl = process.env.DATABASE_URL || '';
  if (
    !dbUrl ||
    dbUrl.includes('@host') ||
    dbUrl.includes('host:5432') ||
    dbUrl.includes('nomedobanco') ||
    dbUrl.includes('usuario:senha')
  ) {
    console.warn('[prod] Usando banco de dados Supabase padrão de produção...');
    process.env.DATABASE_URL = defaultSupabase;
    dbUrl = defaultSupabase;
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      console.log('✅ Banco de dados conectado com sucesso!');
      return true;
    } catch {
      console.log(`[prod] Aguardando PostgreSQL responder (${attempt}/${maxAttempts})...`);
      await prisma.$disconnect();
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error('\n❌ Não foi possível conectar ao PostgreSQL após múltiplas tentativas.');
  console.error('Verifique se o container do PostgreSQL está rodando e se a DATABASE_URL está correta no Dokploy.\n');
  return false;
}

async function main() {
  console.log('[prod] Iniciando soubarbarotti em produção...');

  // Garantir SESSION_SECRET válido para não quebrar rotas autenticadas
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    process.env.SESSION_SECRET = 'rfJ3RYEO41NPzq0PLZ-IrEgKjppCa-TuwFZcQG-P26GP7DnwoYSTxt5OJBEUQHuf';
    console.warn('[prod] AVISO: SESSION_SECRET não configurado ou muito curto. Usando chave de sessão segura padrão.');
  }

  process.env.HOSTNAME = '0.0.0.0';

  const prismaBin = require.resolve('prisma/build/index.js');
  const tsxBin = require.resolve('tsx/cli');
  const nextBin = require.resolve('next/dist/bin/next');

  let stopping = false;
  const children: ChildProcess[] = [];
  const runProcess = (name: string, args: string[]) => {
    const child = spawn(process.execPath, args, { stdio: 'inherit', env: process.env });
    child.on('exit', (code) => {
      if (!stopping) console.log(`[${name}] encerrou com código ${code}.`);
    });
    children.push(child);
    return child;
  };

  // 1. Inicia Next.js escutando em 0.0.0.0 IMEDIATAMENTE (porta aberta em <100ms)
  // Isso garante que o Traefik/Dokploy nunca receba "Connection Refused" (502 Bad Gateway)
  const port = process.env.PORT || '3000';
  console.log(`[prod] Iniciando servidor Next.js na porta ${port} (0.0.0.0)...`);
  runProcess('next-server', [nextBin, 'start', '-H', '0.0.0.0', '-p', port]);

  // 2. Verificação assíncrona do banco em background (não bloqueia a porta 3000)
  checkDatabaseConnection(15, 2000)
    .then(async (dbOk) => {
      if (dbOk) {
        console.log('[prod] Sincronizando tabelas com prisma db push...');
        const pushResult = spawnSync(process.execPath, [prismaBin, 'db', 'push', '--skip-generate'], {
          stdio: 'inherit',
          env: process.env,
        });

        if (pushResult.status === 0) {
          console.log('[prod] ✅ Tabelas do PostgreSQL sincronizadas com sucesso!');
          try {
            const { PrismaClient } = await import('@prisma/client');
            const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
            const hasSettings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
            if (!hasSettings) {
              console.log('[prod] Banco novo detectado: inserindo conteúdo inicial (seed)...');
              const { seed } = await import('../prisma/seed');
              await seed(prisma, console.log, false);
              console.log('[prod] ✅ Conteúdo inicial inserido com sucesso!');
            }
            await prisma.$disconnect();
          } catch (seedErr) {
            console.error('[prod] Aviso no seed inicial:', seedErr);
          }
        } else {
          console.warn(`[prod] ⚠️ prisma db push encerrou com status ${pushResult.status}`);
        }

        // 3. Inicia worker de mídia em background após o banco estar pronto
        console.log('[prod] Iniciando worker de compressão de mídia...');
        runProcess('worker', [tsxBin, 'scripts/worker.ts']);
      } else {
        console.warn('[prod] ⚠️ Banco não respondeu a tempo. O site continuará no ar, mas recursos do banco podem falhar até a DATABASE_URL estar correta.');
      }
    })
    .catch((err) => {
      console.error('[prod] Erro na inicialização do banco:', err);
    });

  const stop = () => {
    if (stopping) return;
    stopping = true;
    console.log('[prod] Encerrando processos...');
    for (const c of children) c.kill('SIGINT');
    setTimeout(() => process.exit(0), 1000);
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((err) => {
  console.error('[prod] Erro fatal:', err);
  process.exit(1);
});
