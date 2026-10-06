// Leitura do conteúdo do site, com cache. O admin limpa o cache (tag "site") a cada gravação,
// e o worker avisa quando uma mídia fica pronta.
import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from './db';
import { mediaSelect, toMediaView, type MediaView } from './media';

export const SITE_TAG = 'site';
const opts = { tags: [SITE_TAG], revalidate: 300 };

export type SectionKey =
  | 'marcas'
  | 'numeros'
  | 'trabalhos'
  | 'processo'
  | 'sobre'
  | 'planos'
  | 'depoimentos'
  | 'perguntas'
  | 'contato'
  | 'pagina_trabalhos'
  | 'pagina_fotos'
  | 'pagina_artes';

export type SectionView = { key: string; enabled: boolean; label: string; titleLine1: string; titleLine2: string; intro: string };

export type SettingsView = {
  heroMedia: MediaView | null;
  heroLocation: string;
  heroTagline: string;
  heroList: string[];
  numbersUseCounters: boolean;
  numbersPhrase: string;
  numbersCounterText: string;
  aboutMedia: MediaView | null;
  aboutTag: string;
  aboutName: string;
  aboutRole: string;
  aboutBio: string;
  contactEmail: string;
  whatsapp: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  footerLine1: string;
  footerLine2: string;
  entityPhrase: string;
  ogMedia: MediaView | null;
  seoTitle: string;
  seoDescription: string;
  privacyUpdatedAt: string;
};

export type ProjectCard = {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  media: MediaView | null;
};

export type ProjectDetail = ProjectCard & {
  client: string;
  deliverable: string;
  location: string;
  fullVideo: MediaView | null;
  fullVideoUrl: string;
  blocks: { key: string; label: string; title: string; text: string }[];
  credits: { stage: string; role: string; tools: string }[];
  gallery: { id: string; kind: 'FRAME' | 'BASTIDOR'; caption: string; media: MediaView | null }[];
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
};

export const getSettings = unstable_cache(
  async (): Promise<SettingsView> => {
    const s = await prisma.siteSettings.findUnique({
      where: { id: 1 },
      include: { heroMedia: { select: mediaSelect }, aboutMedia: { select: mediaSelect }, ogMedia: { select: mediaSelect } },
    });
    if (!s) throw new Error('Configurações do site não encontradas. Rode `npm run setup`.');
    return {
      heroMedia: toMediaView(s.heroMedia),
      heroLocation: s.heroLocation,
      heroTagline: s.heroTagline,
      heroList: Array.isArray(s.heroList) ? (s.heroList as string[]) : [],
      numbersUseCounters: s.numbersUseCounters,
      numbersPhrase: s.numbersPhrase,
      numbersCounterText: s.numbersCounterText,
      aboutMedia: toMediaView(s.aboutMedia),
      aboutTag: s.aboutTag,
      aboutName: s.aboutName,
      aboutRole: s.aboutRole,
      aboutBio: s.aboutBio,
      contactEmail: s.contactEmail,
      whatsapp: s.whatsapp,
      instagramUrl: s.instagramUrl,
      linkedinUrl: s.linkedinUrl,
      youtubeUrl: s.youtubeUrl,
      footerLine1: s.footerLine1,
      footerLine2: s.footerLine2,
      entityPhrase: s.entityPhrase,
      ogMedia: toMediaView(s.ogMedia),
      seoTitle: s.seoTitle,
      seoDescription: s.seoDescription,
      privacyUpdatedAt: s.privacyUpdatedAt.toISOString(),
    };
  },
  ['settings'],
  opts,
);

export const getSections = unstable_cache(
  async (): Promise<Record<string, SectionView>> => {
    const rows = await prisma.section.findMany();
    return Object.fromEntries(
      rows.map((r) => [r.key, { key: r.key, enabled: r.enabled, label: r.label, titleLine1: r.titleLine1, titleLine2: r.titleLine2, intro: r.intro }]),
    );
  },
  ['sections'],
  opts,
);

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  category: true,
  shortDescription: true,
  heroMedia: { select: mediaSelect },
  coverMedia: { select: mediaSelect },
} as const;

type CardRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  heroMedia: Parameters<typeof toMediaView>[0];
  coverMedia: Parameters<typeof toMediaView>[0];
};

function toCard(p: CardRow): ProjectCard {
  const hero = toMediaView(p.heroMedia);
  const cover = toMediaView(p.coverMedia);
  // A capa própria (se houver) substitui a capa gerada do vídeo
  const media = hero && cover?.img ? { ...hero, img: cover.img, blur: cover.blur } : hero ?? cover;
  return { id: p.id, slug: p.slug, title: p.title, category: p.category, shortDescription: p.shortDescription, media };
}

export const getProjects = unstable_cache(
  async (onlyFeatured: boolean): Promise<ProjectCard[]> => {
    const rows = await prisma.project.findMany({
      where: { published: true, ...(onlyFeatured ? { featured: true } : {}) },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: cardSelect,
    });
    return rows.map(toCard);
  },
  ['projects'],
  opts,
);

export const getProject = unstable_cache(
  async (slug: string): Promise<{ project: ProjectDetail; next: ProjectCard | null } | null> => {
    const p = await prisma.project.findFirst({
      where: { slug, published: true },
      include: {
        heroMedia: { select: mediaSelect },
        coverMedia: { select: mediaSelect },
        fullVideoMedia: { select: mediaSelect },
        credits: { orderBy: { order: 'asc' } },
        gallery: { orderBy: { order: 'asc' }, include: { media: { select: mediaSelect } } },
      },
    });
    if (!p) return null;
    const all = await prisma.project.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: cardSelect,
    });
    const idx = all.findIndex((x) => x.id === p.id);
    const nextRow = all.length > 1 ? all[(idx + 1) % all.length] : null;
    const project: ProjectDetail = {
      ...toCard(p),
      client: p.client,
      deliverable: p.deliverable,
      location: p.location,
      fullVideo: toMediaView(p.fullVideoMedia),
      fullVideoUrl: p.fullVideoUrl,
      blocks: [
        { key: 'briefing', label: 'O briefing', title: p.briefTitle, text: p.briefText },
        { key: 'direcao', label: 'A direção criativa', title: p.directionTitle, text: p.directionText },
        { key: 'producao', label: 'A produção com IA', title: p.productionTitle, text: p.productionText },
        { key: 'finalizacao', label: 'A finalização', title: p.finishingTitle, text: p.finishingText },
      ],
      credits: p.credits.map((c) => ({ stage: c.stage, role: c.role, tools: c.tools })),
      gallery: p.gallery.map((g) => ({ id: g.id, kind: g.kind, caption: g.caption, media: toMediaView(g.media) })),
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      updatedAt: p.updatedAt.toISOString(),
    };
    return { project, next: nextRow && nextRow.id !== p.id ? toCard(nextRow) : null };
  },
  ['project'],
  opts,
);

export const getProjectSlugs = unstable_cache(
  async () => prisma.project.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }).then((r) =>
    r.map((x) => ({ slug: x.slug, updatedAt: x.updatedAt.toISOString() })),
  ),
  ['project-slugs'],
  opts,
);

export const getBrands = unstable_cache(
  async () => {
    const rows = await prisma.brand.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
      include: { logoMedia: { select: mediaSelect } },
    });
    return rows.map((b) => ({ id: b.id, name: b.name, url: b.url, logo: toMediaView(b.logoMedia) }));
  },
  ['brands'],
  opts,
);

export const getProcessSteps = unstable_cache(
  async () => {
    const rows = await prisma.processStep.findMany({ orderBy: { number: 'asc' }, include: { media: { select: mediaSelect } } });
    return rows.map((s) => ({ id: s.id, number: s.number, title: s.title, description: s.description, tools: s.tools, media: toMediaView(s.media) }));
  },
  ['process'],
  opts,
);

export const getPlans = unstable_cache(
  async () =>
    prisma.plan.findMany({ where: { published: true }, orderBy: { order: 'asc' } }).then((rows) =>
      rows.map((p) => ({ id: p.id, name: p.name, description: p.description, price: p.price, onRequest: p.onRequest })),
    ),
  ['plans'],
  opts,
);

export const getTestimonials = unstable_cache(
  async () => {
    const rows = await prisma.testimonial.findMany({
      where: { published: true, confirmed: true },
      orderBy: { order: 'asc' },
      include: { avatarMedia: { select: mediaSelect } },
    });
    return rows.map((t) => ({
      id: t.id,
      quote: t.quote,
      authorName: t.authorName,
      authorRole: t.authorRole,
      company: t.company,
      avatar: toMediaView(t.avatarMedia),
    }));
  },
  ['testimonials'],
  opts,
);

export const getFaqs = unstable_cache(
  async () =>
    prisma.faq.findMany({ where: { published: true }, orderBy: { order: 'asc' } }).then((rows) =>
      rows.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    ),
  ['faqs'],
  opts,
);

export type GalleryCollection = 'FOTO' | 'ARTE';
export type PhotoView = { id: string; title: string; downloadable: boolean; media: MediaView };

/** Fotos (/fotos) ou artes (/artes) publicadas */
export const getPhotos = unstable_cache(
  async (collection: GalleryCollection = 'FOTO'): Promise<PhotoView[]> => {
    const rows = await prisma.photo.findMany({
      where: { collection, published: true, media: { status: 'READY' } },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: { media: { select: mediaSelect } },
    });
    return rows
      .map((p) => ({ id: p.id, title: p.title, downloadable: p.downloadable, media: toMediaView(p.media) }))
      .filter((p): p is PhotoView => !!p.media);
  },
  ['photos'],
  opts,
);

export type Brand = Awaited<ReturnType<typeof getBrands>>[number];
export type ProcessStepView = Awaited<ReturnType<typeof getProcessSteps>>[number];
export type PlanView = Awaited<ReturnType<typeof getPlans>>[number];
export type TestimonialView = Awaited<ReturnType<typeof getTestimonials>>[number];
export type FaqView = Awaited<ReturnType<typeof getFaqs>>[number];
