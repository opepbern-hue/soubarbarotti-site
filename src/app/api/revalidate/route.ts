import { revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';
import { SITE_TAG } from '@/lib/content';
import { env } from '@/lib/env';
import { revalidateToken } from '@/lib/revalidate-token';

// Chamado pelo worker quando uma mídia termina de processar
export async function POST(req: Request) {
  const got = Buffer.from(req.headers.get('x-revalidate-token') ?? '');
  const expected = Buffer.from(revalidateToken(env.sessionSecret));
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag(SITE_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
