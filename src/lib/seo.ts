import { env } from './env';
import type { ProjectDetail, SettingsView } from './content';

export function absolute(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `${env.siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Bloco global do plano de SEO: WebSite + Person (vai em todas as páginas) */
export function globalJsonLd(settings: SettingsView) {
  const site = env.siteUrl;
  const sameAs = [settings.instagramUrl, settings.linkedinUrl, settings.youtubeUrl].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${site}/#website`,
        url: `${site}/`,
        name: 'soubarbarotti',
        alternateName: settings.aboutName || 'Barbarotti',
        inLanguage: 'pt-BR',
        publisher: { '@id': `${site}/#pessoa` },
      },
      {
        '@type': 'Person',
        '@id': `${site}/#pessoa`,
        name: settings.aboutName || 'Barbarotti',
        alternateName: ['soubarbarotti'],
        jobTitle: 'Diretor de vídeo com IA',
        description: 'Diretor de vídeo cinematográfico com IA generativa para marcas e empreendedores, baseado em Palhoça, SC.',
        url: `${site}/#sobre`,
        ...(settings.aboutMedia?.img ? { image: absolute(settings.aboutMedia.img.src) } : {}),
        address: { '@type': 'PostalAddress', addressLocality: 'Palhoça', addressRegion: 'SC', addressCountry: 'BR' },
        knowsAbout: [
          'Vídeo com IA generativa',
          'Direção de vídeo',
          'Consistência de personagem',
          'Image-to-video',
          'Color grading',
          'Midjourney',
          'Kling',
          'Veo',
          'DaVinci Resolve',
        ],
        knowsLanguage: ['pt-BR'],
        ...(sameAs.length ? { sameAs } : {}),
      },
    ],
  };
}

export function projectJsonLd(p: ProjectDetail) {
  const site = env.siteUrl;
  const url = `${site}/portfolio/${p.slug}`;
  const video = p.fullVideo?.video?.full ?? p.media?.video?.full ?? null;
  const thumb = p.fullVideo?.img?.src ?? p.media?.img?.src ?? null;
  const graph: object[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${site}/` },
        { '@type': 'ListItem', position: 2, name: 'Portfólio', item: `${site}/portfolio` },
        { '@type': 'ListItem', position: 3, name: p.title, item: url },
      ],
    },
  ];
  // Só marca o vídeo quando é real (placeholder não entra no Google)
  if (video && thumb && !(p.fullVideo ?? p.media)?.placeholder) {
    const duration = p.fullVideo?.video?.duration ?? p.media?.video?.duration;
    graph.push({
      '@type': 'VideoObject',
      '@id': `${url}#video`,
      name: `${p.title}: ${p.category}`,
      description: p.seoDescription || p.shortDescription,
      thumbnailUrl: [absolute(thumb)],
      uploadDate: p.updatedAt,
      contentUrl: absolute(video),
      inLanguage: 'pt-BR',
      ...(duration ? { duration: `PT${Math.floor(duration / 60)}M${Math.round(duration % 60)}S` } : {}),
      director: { '@id': `${site}/#pessoa` },
      ...(p.client ? { about: { '@type': 'Organization', name: p.client } } : {}),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
