// Leitura e escrita do arquivo .env (sem dependências)
import fs from 'node:fs';
import path from 'node:path';

export const ENV_PATH = path.resolve(process.cwd(), '.env');

export function readEnvFile(file = ENV_PATH): Record<string, string> {
  if (!fs.existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

/** Troca (ou acrescenta) uma variável sem mexer no resto do arquivo. */
export function setEnvVar(key: string, value: string, file = ENV_PATH): void {
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const line = `${key}=${value}`;
  const re = new RegExp(`^\\s*${key}\\s*=.*$`, 'm');
  fs.writeFileSync(file, re.test(text) ? text.replace(re, line) : `${text.replace(/\s*$/, '\n')}${line}\n`, 'utf8');
}
