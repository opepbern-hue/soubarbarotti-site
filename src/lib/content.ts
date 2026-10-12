// Leitura do conteúdo do site, com cache e resiliência total a falhas de banco.
// O admin limpa o cache (tag "site") a cada gravação, e o worker avisa quando uma mídia fica pronta.
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

export const DEFAULT_SETTINGS: SettingsView = {
  heroMedia: null,
  heroLocation: 'Palhoça, SC & remoto',
  heroTagline: 'Dirijo vídeos com cara de cinema feitos com IA generativa, para marcas e empreendedores. Sem set, sem câmera, sem elenco.',
  heroList: ['Filmes de marca', 'Comerciais e anúncios', 'Vídeo imobiliário', 'Marca pessoal em vídeo', 'Conteúdo para redes'],
  numbersUseCounters: false,
  numbersPhrase: 'A IA gera as cenas. **Eu decido** o que entra, o que é refeito e como tudo vira **um filme só**.',
  numbersCounterText: 'São **0+ projetos** no meu portfólio.',
  aboutMedia: null,
  aboutTag: '[Direção]',
  aboutName: 'Barbarotti',
  aboutRole: 'Diretor de vídeo com IA',
  aboutBio:
    'Tenho 21 anos e moro em Palhoça (SC). Dirijo vídeos com IA generativa para marcas e empreendedores.\n\nAntes de gerar qualquer imagem, eu planejo cada cena. Depois cuido do acabamento até o vídeo ter cara de cinema.\n\nEstou construindo isso do zero e mostro o processo no Instagram, erros incluídos.',
  contactEmail: 'contato@soubarbarotti.com.br',
  whatsapp: '',
  instagramUrl: 'https://www.instagram.com/soubarbarotti/',
  linkedinUrl: '',
  youtubeUrl: '',
  footerLine1: 'a sua ideia,',
  footerLine2: 'com cara de cinema.',
  entityPhrase:
    'Barbarotti (@soubarbarotti) é diretor de vídeo cinematográfico com IA generativa para marcas e empreendedores, baseado em Palhoça, SC.',
  ogMedia: null,
  seoTitle: 'Vídeo cinematográfico com IA para marcas | soubarbarotti',
  seoDescription:
    'Sou o Barbarotti, diretor de vídeo com IA em Palhoça (SC). Filmes de marca, comerciais e vídeos imobiliários sem set, câmera ou elenco.',
  privacyUpdatedAt: '2026-01-01T00:00:00.000Z',
};

export const DEFAULT_SECTIONS: Record<string, SectionView> = {
  marcas: { key: 'marcas', enabled: true, label: '', titleLine1: '', titleLine2: '', intro: '' },
  numeros: { key: 'numeros', enabled: true, label: '', titleLine1: '', titleLine2: '', intro: '' },
  trabalhos: { key: 'trabalhos', enabled: true, label: 'REC: Trabalhos', titleLine1: '', titleLine2: '', intro: '' },
  processo: {
    key: 'processo',
    enabled: true,
    label: 'REC: Processo',
    titleLine1: 'do roteiro',
    titleLine2: 'ao color grade',
    intro: 'Cinco etapas, cada uma com a sua ferramenta. Nenhuma cena é gerada antes de estar planejada.',
  },
  sobre: {
    key: 'sobre',
    enabled: true,
    label: 'REC: Sobre',
    titleLine1: 'quem dirige',
    titleLine2: 'cada cena',
    intro: 'Uma pessoa só, do roteiro à entrega.',
  },
  planos: {
    key: 'planos',
    enabled: true,
    label: 'REC: Planos',
    titleLine1: 'três formas',
    titleLine2: 'de trabalhar comigo',
    intro: 'Escolha o formato mais perto do seu projeto. Se nenhum servir, a gente monta um sob medida.',
  },
  depoimentos: { key: 'depoimentos', enabled: true, label: 'REC: Depoimentos', titleLine1: 'quem já', titleLine2: 'trabalhou comigo', intro: '' },
  perguntas: {
    key: 'perguntas',
    enabled: true,
    label: 'REC: Perguntas',
    titleLine1: 'o que perguntam',
    titleLine2: 'antes de fechar',
    intro: 'As dúvidas que aparecem antes de todo projeto.',
  },
  contato: { key: 'contato', enabled: true, label: 'REC: Contato', titleLine1: 'me conta', titleLine2: 'a sua ideia', intro: '' },
  pagina_trabalhos: { key: 'pagina_trabalhos', enabled: true, label: 'REC: Portfólio', titleLine1: 'os filmes', titleLine2: 'que eu dirigi', intro: '' },
  pagina_fotos: {
    key: 'pagina_fotos',
    enabled: true,
    label: 'REC: Fotos',
    titleLine1: 'as fotos',
    titleLine2: 'pode baixar',
    intro: 'Baixe em alta ou copie e cole direto onde quiser.',
  },
  pagina_artes: {
    key: 'pagina_artes',
    enabled: true,
    label: 'REC: Artes',
    titleLine1: 'as artes',
    titleLine2: 'pode baixar',
    intro: 'Baixe em alta ou copie e cole direto onde quiser.',
  },
};

export const DEFAULT_PROCESS_STEPS = [
  { id: '1', number: 1, title: 'Roteiro e storyboard', description: 'Planejo o vídeo inteiro antes de gerar qualquer imagem: cena por cena, plano por plano.', tools: '', media: null },
  { id: '2', number: 2, title: 'Consistência de personagem', description: 'O mesmo "ator" em todas as cenas, do primeiro ao último frame.', tools: 'Midjourney (Omni Reference / --oref)', media: null },
  { id: '3', number: 3, title: 'Image-to-video', description: 'Cada imagem-chave vira um clipe animado.', tools: 'Kling, Runway Gen-4, Veo, Sora, Luma', media: null },
  { id: '4', number: 4, title: 'Upscaling', description: 'Levo a resolução final para 4K.', tools: 'Topaz', media: null },
  { id: '5', number: 5, title: 'Color grade', description: 'Unifico os clipes gerados num visual só. É aqui que nasce o look de cinema.', tools: 'DaVinci Resolve, Premiere', media: null },
];

export const DEFAULT_PLANS = [
  { id: '1', name: 'Filme Único', description: 'Um comercial ou vídeo conceito de alta intensidade visual.', price: 'Sob consulta', onRequest: true },
  { id: '2', name: 'Campanha Completa', description: 'Pacote de criativos e formatos adaptados para múltiplas plataformas.', price: 'Sob consulta', onRequest: true },
  { id: '3', name: 'Direção Contínua', description: 'Acompanhamento mensal para marcas que produzem conteúdo constante.', price: 'Sob consulta', onRequest: true },
];

export const DEFAULT_FAQS = [
  { id: '1', question: 'Quanto tempo leva do briefing à entrega?', answer: 'Normalmente entre 5 e 15 dias úteis, dependendo da complexidade do projeto e da quantidade de cenas.' },
  { id: '2', question: 'Preciso chegar com roteiro pronto?', answer: 'Não. Eu posso construir o roteiro e storyboard do zero a partir do seu briefing e objetivo.' },
  { id: '3', question: 'O que é gerado por IA e o que é real no vídeo?', answer: 'As imagens e movimentos de cena são gerados por IA avançada. A direção, roteiro, consistência, edição e color grading são feitos por mim.' },
  { id: '4', question: 'Dá para manter o mesmo personagem ou produto?', answer: 'Sim! Utilizamos técnicas de referência e consistência para manter personagens e produtos fiéis ao longo do vídeo.' },
  { id: '5', question: 'Posso usar o vídeo em anúncio pago?', answer: 'Sim, os vídeos são entregues com direitos de uso para campanhas e anúncios comerciais.' },
  { id: '6', question: 'Quantas rodadas de ajuste estão incluídas?', answer: 'Incluímos rodadas de revisão de storyboard e de pós-produção antes da entrega final.' },
  { id: '7', question: 'Em quais formatos eu recebo (16:9, 9:16, 1:1)?', answer: 'Entregamos em 4K e Full HD nos formatos que você precisar (Reels/TikTok 9:16, YouTube 16:9 ou Feed 1:1 e 4:5).' },
  { id: '8', question: 'De quem são os direitos do vídeo final?', answer: 'Os direitos comerciais de exibição são 100% seus após a aprovação e entrega final.' },
];

export type Brand = { id: string; name: string; url: string; logo: MediaView | null };

export const DEFAULT_BRANDS: Brand[] = [
  { id: '1', name: 'Echo Labs', url: '', logo: null },
  { id: '2', name: 'Calebe', url: '', logo: null },
  { id: '3', name: 'Descomplicando Varejo', url: '', logo: null },
  { id: '4', name: 'Myskillzy', url: '', logo: null },
];

export const getSettings = unstable_cache(
  async (): Promise<SettingsView> => {
    try {
      const s = await prisma.siteSettings.findUnique({
        where: { id: 1 },
        include: { heroMedia: { select: mediaSelect }, aboutMedia: { select: mediaSelect }, ogMedia: { select: mediaSelect } },
      });
      if (!s) return DEFAULT_SETTINGS;
      return {
        heroMedia: toMediaView(s.heroMedia),
        heroLocation: s.heroLocation || DEFAULT_SETTINGS.heroLocation,
        heroTagline: s.heroTagline || DEFAULT_SETTINGS.heroTagline,
        heroList: Array.isArray(s.heroList) && s.heroList.length > 0 ? (s.heroList as string[]) : DEFAULT_SETTINGS.heroList,
        numbersUseCounters: s.numbersUseCounters,
        numbersPhrase: s.numbersPhrase || DEFAULT_SETTINGS.numbersPhrase,
        numbersCounterText: s.numbersCounterText || DEFAULT_SETTINGS.numbersCounterText,
        aboutMedia: toMediaView(s.aboutMedia),
        aboutTag: s.aboutTag || DEFAULT_SETTINGS.aboutTag,
        aboutName: s.aboutName || DEFAULT_SETTINGS.aboutName,
        aboutRole: s.aboutRole || DEFAULT_SETTINGS.aboutRole,
        aboutBio: s.aboutBio || DEFAULT_SETTINGS.aboutBio,
        contactEmail: s.contactEmail || DEFAULT_SETTINGS.contactEmail,
        whatsapp: s.whatsapp || DEFAULT_SETTINGS.whatsapp,
        instagramUrl: s.instagramUrl || DEFAULT_SETTINGS.instagramUrl,
        linkedinUrl: s.linkedinUrl,
        youtubeUrl: s.youtubeUrl,
        footerLine1: s.footerLine1 || DEFAULT_SETTINGS.footerLine1,
        footerLine2: s.footerLine2 || DEFAULT_SETTINGS.footerLine2,
        entityPhrase: s.entityPhrase || DEFAULT_SETTINGS.entityPhrase,
        ogMedia: toMediaView(s.ogMedia),
        seoTitle: s.seoTitle || DEFAULT_SETTINGS.seoTitle,
        seoDescription: s.seoDescription || DEFAULT_SETTINGS.seoDescription,
        privacyUpdatedAt: s.privacyUpdatedAt ? s.privacyUpdatedAt.toISOString() : DEFAULT_SETTINGS.privacyUpdatedAt,
      };
    } catch (err) {
      console.warn('[content] Aviso: Usando configurações padrão (banco temporariamente indisponível):', err);
      return DEFAULT_SETTINGS;
    }
  },
  ['settings'],
  opts,
);

export const getSections = unstable_cache(
  async (): Promise<Record<string, SectionView>> => {
    try {
      const rows = await prisma.section.findMany();
      if (!rows || rows.length === 0) return DEFAULT_SECTIONS;
      const map: Record<string, SectionView> = { ...DEFAULT_SECTIONS };
      for (const r of rows) {
        map[r.key] = {
          key: r.key,
          enabled: r.enabled,
          label: r.label || map[r.key]?.label || '',
          titleLine1: r.titleLine1 || map[r.key]?.titleLine1 || '',
          titleLine2: r.titleLine2 || map[r.key]?.titleLine2 || '',
          intro: r.intro || map[r.key]?.intro || '',
        };
      }
      return map;
    } catch (err) {
      console.warn('[content] Aviso: Usando seções padrão:', err);
      return DEFAULT_SECTIONS;
    }
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
  const media = hero && cover?.img ? { ...hero, img: cover.img, blur: cover.blur } : hero ?? cover;
  return { id: p.id, slug: p.slug, title: p.title, category: p.category, shortDescription: p.shortDescription, media };
}

export const getProjects = unstable_cache(
  async (onlyFeatured: boolean): Promise<ProjectCard[]> => {
    try {
      const rows = await prisma.project.findMany({
        where: { published: true, ...(onlyFeatured ? { featured: true } : {}) },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: cardSelect,
      });
      return rows.map(toCard);
    } catch (err) {
      console.warn('[content] Aviso: Erro ao buscar projetos:', err);
      return [];
    }
  },
  ['projects'],
  opts,
);

export const getProject = unstable_cache(
  async (slug: string): Promise<{ project: ProjectDetail; next: ProjectCard | null } | null> => {
    try {
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
    } catch (err) {
      console.warn('[content] Aviso: Erro ao buscar projeto detalhado:', err);
      return null;
    }
  },
  ['project'],
  opts,
);

export const getProjectSlugs = unstable_cache(
  async () => {
    try {
      const r = await prisma.project.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
      return r.map((x) => ({ slug: x.slug, updatedAt: x.updatedAt.toISOString() }));
    } catch {
      return [];
    }
  },
  ['project-slugs'],
  opts,
);

export const getBrands = unstable_cache(
  async () => {
    try {
      const rows = await prisma.brand.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
        include: { logoMedia: { select: mediaSelect } },
      });
      if (!rows || rows.length === 0) return DEFAULT_BRANDS;
      return rows.map((b) => ({ id: b.id, name: b.name, url: b.url, logo: toMediaView(b.logoMedia) }));
    } catch {
      return DEFAULT_BRANDS;
    }
  },
  ['brands'],
  opts,
);

export const getProcessSteps = unstable_cache(
  async () => {
    try {
      const rows = await prisma.processStep.findMany({ orderBy: { number: 'asc' }, include: { media: { select: mediaSelect } } });
      if (!rows || rows.length === 0) return DEFAULT_PROCESS_STEPS;
      return rows.map((s) => ({ id: s.id, number: s.number, title: s.title, description: s.description, tools: s.tools, media: toMediaView(s.media) }));
    } catch {
      return DEFAULT_PROCESS_STEPS;
    }
  },
  ['process'],
  opts,
);

export const getPlans = unstable_cache(
  async () => {
    try {
      const rows = await prisma.plan.findMany({ where: { published: true }, orderBy: { order: 'asc' } });
      if (!rows || rows.length === 0) return DEFAULT_PLANS;
      return rows.map((p) => ({ id: p.id, name: p.name, description: p.description, price: p.price, onRequest: p.onRequest }));
    } catch {
      return DEFAULT_PLANS;
    }
  },
  ['plans'],
  opts,
);

export const getTestimonials = unstable_cache(
  async () => {
    try {
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
    } catch {
      return [];
    }
  },
  ['testimonials'],
  opts,
);

export const getFaqs = unstable_cache(
  async () => {
    try {
      const rows = await prisma.faq.findMany({ where: { published: true }, orderBy: { order: 'asc' } });
      if (!rows || rows.length === 0) return DEFAULT_FAQS;
      return rows.map((f) => ({ id: f.id, question: f.question, answer: f.answer }));
    } catch {
      return DEFAULT_FAQS;
    }
  },
  ['faqs'],
  opts,
);

export type GalleryCollection = 'FOTO' | 'ARTE';
export type PhotoView = { id: string; title: string; downloadable: boolean; media: MediaView };

/** Fotos (/fotos) ou artes (/artes) publicadas */
export const getPhotos = unstable_cache(
  async (collection: GalleryCollection = 'FOTO'): Promise<PhotoView[]> => {
    try {
      const rows = await prisma.photo.findMany({
        where: { collection, published: true, media: { status: 'READY' } },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: { media: { select: mediaSelect } },
      });
      return rows
        .map((p) => ({ id: p.id, title: p.title, downloadable: p.downloadable, media: toMediaView(p.media) }))
        .filter((p): p is PhotoView => !!p.media);
    } catch {
      return [];
    }
  },
  ['photos'],
  opts,
);

export type ProcessStepView = Awaited<ReturnType<typeof getProcessSteps>>[number];
export type PlanView = Awaited<ReturnType<typeof getPlans>>[number];
export type TestimonialView = Awaited<ReturnType<typeof getTestimonials>>[number];
export type FaqView = Awaited<ReturnType<typeof getFaqs>>[number];
