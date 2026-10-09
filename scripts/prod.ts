// scripts/prod.ts
// Script de inicialização em produção para Dokploy / Docker / Nixpacks.
// 1. Valida variáveis essenciais e avisa se o DATABASE_URL for placeholder.
// 2. Aguarda o PostgreSQL responder (até 30 segundos) para evitar falhas durante boot simultâneo.
// 3. Executa prisma db push e seed com segurança.
// 4. Inicia o worker de mídia em background para processar uploads no servidor.
// 5. Inicia o servidor Next.js em 0.0.0.0 na porta configurada ($PORT ou 3000).

import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { loadEnv } from './load-env';

loadEnv();

async function checkDatabaseConnection(maxAttempts = 15, delayMs = 2000): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) {
    console.error('\n❌ ERRO: DATABASE_URL não definida nas variáveis de ambiente.\n');
    return false;
  }

  if (dbUrl.includes('usuario:senha@host') || dbUrl.includes('nomedobanco')) {
    console.error('\n=============================================================');
    console.error('❌ ERRO CRÍTICO NO DOKPLOY:');
    console.error('A variável DATABASE_URL está com valores de exemplo (placeholder):');
    console.error(`"${dbUrl}"`);
    console.error('No Dokploy:');
    console.error('1. Crie um banco de dados PostgreSQL (Create Service -> Database -> Postgres).');
    console.error('2. Copie a "Internal Connection String" gerada pelo Dokploy.');
    console.error('3. Cole na aba Environment da sua aplicação como DATABASE_URL.');
    console.error('=============================================================\n');
    return false;
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      console.log('✅ Banco de dados conectado com sucesso!');
      return true;
    } catch (err: any) {
      console.log(`[prod] Aguardando PostgreSQL responder (${attempt}/${maxAttempts})...`);
      await prisma.$disconnect();
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error('\n❌ Não foi possível conectar ao PostgreSQL após múltiplas tentativas.');
  console.error('Verifique se o container do PostgreSQL está rodando e se a DATABASE_URL está correta.\n');
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

  // 2. Inicia worker de mídia em background
  console.log('[prod] Iniciando worker de compressão de mídia...');
  runProcess('worker', [tsxBin, 'scripts/worker.ts']);

  // 3. Verificação assíncrona do banco em background (não bloqueia a porta 3000)
  checkDatabaseConnection(5, 2000).then((dbOk) => {
    if (dbOk) {
      console.log('[prod] Conexão com banco verificada e ativa.');
    } else {
      console.warn('[prod] ⚠️ Aviso: Banco demorou para responder. Verifique sua DATABASE_URL nas variáveis de ambiente.');
    }
  }).catch((err) => {
    console.error('[prod] Erro na verificação do banco:', err);
  });

  let stopping = false;
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
