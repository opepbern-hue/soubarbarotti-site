// PostgreSQL embutido para rodar no seu computador sem instalar nada.
// Usa os binários do pacote embedded-postgres, mas liga pelo pg_ctl oficial
// (no Windows, ele funciona mesmo em conta de administrador).
// Os dados ficam em .data/postgres. Porta 5433, para não brigar com outro Postgres.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { loadEnv } from './load-env';

export const LOCAL_DB = { port: 5433, user: 'postgres', password: 'postgres', database: 'soubarbarotti' };
export const LOCAL_DATABASE_URL = `postgresql://${LOCAL_DB.user}:${LOCAL_DB.password}@localhost:${LOCAL_DB.port}/${LOCAL_DB.database}`;

const DATA_DIR = path.resolve('.data/postgres');

function binDir(): string {
  const platform = { win32: 'windows', darwin: 'darwin', linux: 'linux' }[process.platform as string];
  const dir = path.resolve('node_modules/@embedded-postgres', `${platform}-${os.arch()}`, 'native/bin');
  if (!fs.existsSync(dir)) throw new Error(`Binários do Postgres não encontrados em ${dir}. Rode npm install.`);
  return dir;
}

function bin(name: string) {
  return path.join(binDir(), process.platform === 'win32' ? `${name}.exe` : name);
}

function run(name: string, args: string[]) {
  const r = spawnSync(bin(name), args, { encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) {
    throw new Error(`${name} falhou: ${(r.stderr || r.stdout || '').trim().split('\n').slice(-4).join(' ')}`);
  }
  return r.stdout;
}

function portOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

export type LocalDb = { stop: () => Promise<void> } | null;

/** Liga o Postgres local. Se já estiver ligado (outra janela), só reaproveita. */
export async function startLocalDb(): Promise<LocalDb> {
  if (await portOpen(LOCAL_DB.port)) {
    console.log(`[banco] Postgres local já está rodando na porta ${LOCAL_DB.port}.`);
    return null;
  }
  if (!fs.existsSync(path.join(DATA_DIR, 'PG_VERSION'))) {
    console.log('[banco] criando o banco local pela primeira vez…');
    fs.mkdirSync(path.dirname(DATA_DIR), { recursive: true });
    const pwfile = path.join(os.tmpdir(), `sb-pg-${process.pid}.txt`);
    fs.writeFileSync(pwfile, LOCAL_DB.password);
    try {
      run('initdb', ['-D', DATA_DIR, '-U', LOCAL_DB.user, `--pwfile=${pwfile}`, '-A', 'scram-sha-256', '-E', 'UTF8', '--locale=C']);
    } finally {
      fs.rmSync(pwfile, { force: true });
    }
  }
  // Se o computador desligou com o banco aberto, sobra um arquivo de trava
  fs.rmSync(path.join(DATA_DIR, 'postmaster.pid'), { force: true });
  run('pg_ctl', ['-D', DATA_DIR, '-l', path.join(DATA_DIR, 'log.txt'), '-o', `-p ${LOCAL_DB.port} -c listen_addresses=localhost`, '-w', 'start']);
  console.log(`[banco] Postgres local ligado na porta ${LOCAL_DB.port}.`);
  return {
    stop: async () => {
      try {
        run('pg_ctl', ['-D', DATA_DIR, '-m', 'fast', '-w', 'stop']);
        console.log('[banco] Postgres local desligado.');
      } catch (e) {
        console.error('[banco]', e instanceof Error ? e.message : e);
      }
    },
  };
}

// `npm run db:local`: deixa o banco ligado até apertar Ctrl+C
if (process.argv[1] && /db-local\.ts$/.test(process.argv[1])) {
  loadEnv();
  startLocalDb().then((db) => {
    if (!db) return;
    const stop = async () => {
      await db.stop();
      process.exit(0);
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
    console.log('[banco] aperte Ctrl+C para desligar.');
    setInterval(() => {}, 1 << 30);
  });
}
