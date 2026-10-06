import type { MetadataRoute } from 'next';
import { getProjectSlugs } from '@/lib/content';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = env.siteUrl;
  const projects = await getProjectSlugs().catch(() => []);
  return [
    { url: `${site}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${site}/portfolio`, changeFrequency: 'weekly', priority: 0.9 },
    ...projects.map((p) => ({ url: `${site}/portfolio/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: `${site}/fotos`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${site}/artes`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${site}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
