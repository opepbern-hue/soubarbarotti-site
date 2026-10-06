import { createHash } from 'node:crypto';

/** Token que o worker usa para avisar o site de que uma mídia ficou pronta. */
export function revalidateToken(secret: string): string {
  return createHash('sha256').update(`${secret}:revalidate`).digest('hex');
}
