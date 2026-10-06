import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  // Em produção, o navegador passa a usar só HTTPS neste domínio
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // As imagens já saem otimizadas do worker (AVIF/WebP em vários tamanhos),
  // então o otimizador do Next não é usado.
  images: { unoptimized: true },
  // O portfólio mora em /portfolio. Endereços antigos continuam funcionando.
  async redirects() {
    return [
      { source: '/trabalhos', destination: '/portfolio', permanent: true },
      { source: '/trabalhos/:slug', destination: '/portfolio/:slug', permanent: true },
      // página de projetos do site antigo (link da bio do Instagram)
      { source: '/projeto', destination: '/portfolio', permanent: true },
      { source: '/projeto/:path*', destination: '/portfolio', permanent: true },
      // painel: os dois endereços levam ao mesmo lugar
      { source: '/dashboard', destination: '/admin', permanent: false },
      { source: '/dashboard/:path*', destination: '/admin/:path*', permanent: false },
    ];
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;
