import fs from 'node:fs';
import path from 'node:path';

/** Carrega o .env da raiz do projeto nos scripts que rodam fora do Next. */
export function loadEnv(): void {
  const file = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(file)) process.loadEnvFile(file);
}
