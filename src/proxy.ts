// Proxy (o antigo "middleware"): roda antes de qualquer página ou API.
// 1) Área restrita: /admin e /api/admin só passam com cookie de sessão assinado e válido.
//    A checagem completa (sessão ativa no banco) acontece de novo em cada página e ação.
// 2) Proteção contra CSRF nas APIs do admin: alterações só vindas do próprio site.
// 3) Política de segurança de conteúdo (CSP) com nonce novo a cada visita.
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/session-token';

const OPEN_ADMIN_PAGES = new Set(['/admin/login']);
const NO_STORE = { 'Cache-Control': 'no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow' };

function contentSecurityPolicy(nonce: string, dev: boolean): string {
  const base = process.env.MEDIA_BASE_URL ?? '';
  const mediaOrigin = /^https?:\/\//.test(base) ? new URL(base).origin : '';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://i.ytimg.com ${mediaOrigin}`.trim(),
    `media-src 'self' blob: ${mediaOrigin}`.trim(),
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

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminApi = pathname.startsWith('/api/admin');
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');

  // 1) Área restrita
  if (isAdminApi || (isAdminPage && !OPEN_ADMIN_PAGES.has(pathname))) {
    const claims = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET);
    if (!claims) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Sessão expirada. Entre de novo.' }, { status: 401, headers: NO_STORE });
      }
      const login = req.nextUrl.clone();
      login.pathname = '/admin/login';
      login.search = pathname === '/admin' ? '' : `?volta=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(login, { headers: NO_STORE });
    }
  }

  // 2) CSRF: envio de arquivos e outras alterações só a partir do próprio site
  if (isAdminApi && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !sameOrigin(req)) {
    return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403, headers: NO_STORE });
  }

  if (pathname.startsWith('/api/')) {
    const res = NextResponse.next();
    if (isAdminApi) Object.entries(NO_STORE).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  // 3) CSP com nonce (o Next aplica o mesmo nonce nos próprios scripts)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = contentSecurityPolicy(nonce, process.env.NODE_ENV === 'development');
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('Content-Security-Policy', csp);
  if (isAdminPage) Object.entries(NO_STORE).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export const config = {
  matcher: [
    // Tudo, menos arquivos estáticos e mídia (que não precisam de sessão nem de CSP)
    '/((?!_next/static|_next/image|media/|favicon\\.ico|icon|apple-icon|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|mp4|webm|txt|xml)$).*)',
  ],
};
