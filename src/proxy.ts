// Proxy (middleware): roda antes de qualquer página ou API.
// Aplica headers de segurança e proteção de rotas.
import { NextResponse, type NextRequest } from 'next/server';

function contentSecurityPolicy(dev: boolean): string {
  const base = process.env.MEDIA_BASE_URL ?? '';
  const mediaOrigin = /^https?:\/\//.test(base) ? new URL(base).origin : '';
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "style-src 'self' 'unsafe-inline' https:",
    `img-src 'self' data: blob: https: ${mediaOrigin}`.trim(),
    `media-src 'self' blob: https: ${mediaOrigin}`.trim(),
    "font-src 'self' data: https:",
    `connect-src 'self' https:${dev ? ' ws: wss:' : ''}`,
    'frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.youtube.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const csp = contentSecurityPolicy(process.env.NODE_ENV === 'development');
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('Content-Security-Policy', csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('Content-Security-Policy', csp);
  return res;
}

export const config = {
  matcher: [
    // Tudo, menos arquivos estáticos e mídia
    '/((?!_next/static|_next/image|media/|favicon\\.ico|icon|apple-icon|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|mp4|webm|txt|xml)$).*)',
  ],
};
