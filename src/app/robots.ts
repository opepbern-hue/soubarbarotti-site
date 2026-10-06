import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const disallow = ['/admin', '/api/'];
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      // Robôs de busca das IAs (plano de SEO): liberados para citar o site
      { userAgent: ['OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot', 'Google-Extended'], allow: '/', disallow },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
    host: env.siteUrl,
  };
}
