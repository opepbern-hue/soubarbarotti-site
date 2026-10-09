// Proxy (middleware): roda antes de qualquer página ou API.
// Aplica a Política de Segurança de Conteúdo (CSP) com nonce para scripts e proteção de mídia.
import { NextResponse, type NextRequest } from 'next/server';

function contentSecurityPolicy(nonce: string, dev: boolean): string {
  const base = process.env.MEDIA_BASE_URL ?? '';
  const mediaOrigin = /^https?:\/\//.test(base) ? new URL(base).origin : '';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://i.ytimg.com https://*.supabase.co https://*.r2.cloudflarestorage.com ${mediaOrigin}`.trim(),
    `media-src 'self' blob: https://*.supabase.co https://*.r2.cloudflarestorage.com ${mediaOrigin}`.trim(),
    "font-src 'self'",
    `connect-src 'self'${dev ? ' ws: wss:' : ''}`,
    'frame-src https://www.youtube-nocookie.com https://player.vimeo.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // CSP com nonce para scripts Next.js
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = contentSecurityPolicy(nonce, process.env.NODE_ENV === 'development');
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('Content-Security-Policy', csp);
  return res;
}

export const config = {
  matcher: [
    // Tudo, menos arquivos estáticos e mídia (que não precisam de CSP)
    '/((?!_next/static|_next/image|media/|favicon\\.ico|icon|apple-icon|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|mp4|webm|txt|xml)$).*)',
  ],
};
