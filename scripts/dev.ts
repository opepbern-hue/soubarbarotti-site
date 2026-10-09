// Liga tudo para trabalhar no computador: banco local + site (Next) + worker de mídia.
// Uso: npm run dev  (Ctrl+C desliga tudo)
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { startLocalDb, type LocalDb } from './db-local';
import { loadEnv } from './load-env';

loadEnv();

async function main() {
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = 'soubarbarotti-default-session-secret-key-32chars';
  }
  let db: LocalDb = null;
  if (process.env.LOCAL_DB === '1') db = await startLocalDb();

  // Aplica mudanças do schema no banco (rápido quando não há nada novo)
  spawnSync(process.execPath, [path.resolve('node_modules/prisma/build/index.js'), 'db', 'push', '--skip-generate'], {
    stdio: 'inherit',
    env: process.env,
  });

  const children: ChildProcess[] = [];
  const run = (name: string, args: string[]) => {
    const child = spawn(process.execPath, args, { stdio: 'inherit', env: process.env });
    child.on('exit', (code) => {
      if (!stopping) console.log(`[${name}] parou (código ${code}).`);
    });
    children.push(child);
  };
  run('site', [path.resolve('node_modules/next/dist/bin/next'), 'dev', ...process.argv.slice(2)]);
  run('worker', [path.resolve('node_modules/tsx/dist/cli.mjs'), 'scripts/worker.ts']);

  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    for (const c of children) c.kill('SIGINT');
    await new Promise((r) => setTimeout(r, 1500));
    await db?.stop().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main();
