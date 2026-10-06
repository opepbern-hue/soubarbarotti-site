'use server';

import fsp from 'node:fs/promises';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { changePassword, login, logout, requireAdmin, revokeOtherSessions } from '@/lib/auth';
import { SITE_TAG } from '@/lib/content';
import { prisma } from '@/lib/db';
import type { MediaVariants } from '@/lib/media';
import { slugify } from '@/lib/slug';
import { storage } from '@/lib/storage';

// ---------- utilidades ----------

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const opt = (fd: FormData, k: string) => (str(fd, k) ? str(fd, k) : null);
const bool = (fd: FormData, k: string) => fd.get(k) === 'on' || fd.get(k) === 'true';
const num = (fd: FormData, k: string, fallback = 0) => {
  const n = Number(String(fd.get(k) ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
};

function refresh(...paths: string[]) {
  revalidateTag(SITE_TAG, { expire: 0 });
  for (const p of paths) revalidatePath(p);
}

function back(path: string, msg = 'Salvo.'): never {
  redirect(`${path}${path.includes('?') ? '&' : '?'}ok=${encodeURIComponent(msg)}`);
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base);
  let slug = root;
  for (let i = 2; ; i++) {
    const hit = await prisma.project.findUnique({ where: { slug } });
    if (!hit || hit.id === ignoreId) return slug;
    slug = `${root}-${i}`;
  }
}

// ---------- login ----------

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const result = await login(str(fd, 'senha'));
  if (!result.ok) return { error: result.error };
  // Volta para onde estava, mas só dentro do admin (evita redirecionar para outro site)
  const volta = str(fd, 'volta');
  redirect(/^\/admin(\/[\w\-/]*)?$/.test(volta) ? volta : '/admin');
}

export async function logoutAction() {
  await logout();
  redirect('/admin/login');
}

// ---------- segurança ----------

export type PasswordState = { error?: string; ok?: boolean };

export async function changePasswordAction(_prev: PasswordState, fd: FormData): Promise<PasswordState> {
  if (str(fd, 'nova') !== str(fd, 'confirma')) return { error: 'A confirmação não bate com a senha nova.' };
  const result = await changePassword(str(fd, 'atual'), str(fd, 'nova'));
  return result.ok ? { ok: true } : { error: result.error };
}

export async function revokeOthersAction() {
  const n = await revokeOtherSessions();
  back('/admin/seguranca', n ? `${n} sessão(ões) encerrada(s).` : 'Não havia outras sessões.');
}

// ---------- portfólio ----------

export async function createProject(fd: FormData) {
  await requireAdmin();
  const title = str(fd, 'title');
  if (!title) back('/admin/portfolio', 'Escreva o nome do projeto.');
  const mediaId = opt(fd, 'heroMediaId');
  const last = await prisma.project.aggregate({ _max: { order: true } });
  await prisma.project.create({
    data: {
      title,
      slug: await uniqueSlug(title),
      category: str(fd, 'category'),
      client: '',
      published: true,
      featured: bool(fd, 'featured'),
      order: (last._max.order ?? -1) + 1,
      heroMediaId: mediaId,
      fullVideoMediaId: mediaId,
      fullVideoUrl: str(fd, 'fullVideoUrl'),
    },
  });
  refresh('/admin/portfolio');
  back('/admin/portfolio', `“${title}” adicionado.`);
}

export async function updateProject(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  const title = str(fd, 'title');
  if (!title) back(`/admin/portfolio/${id}`, 'O nome não pode ficar vazio.');
  const heroMediaId = opt(fd, 'heroMediaId');
  const credits = str(fd, 'credits')
    .split('\n')
    .map((l) => l.split('|').map((x) => x.trim()))
    .filter((parts) => parts[0]);
  let gallery: { mediaId: string; kind: 'FRAME' | 'BASTIDOR'; caption: string }[] = [];
  try {
    gallery = JSON.parse(str(fd, 'gallery') || '[]');
  } catch {
    /* mantém vazio */
  }

  await prisma.$transaction([
    prisma.project.update({
      where: { id },
      data: {
        title,
        slug: await uniqueSlug(str(fd, 'slug') || title, id),
        category: str(fd, 'category'),
        client: str(fd, 'client'),
        deliverable: str(fd, 'deliverable'),
        location: str(fd, 'location'),
        shortDescription: str(fd, 'shortDescription'),
        featured: bool(fd, 'featured'),
        published: bool(fd, 'published'),
        heroMediaId,
        fullVideoMediaId: opt(fd, 'fullVideoMediaId') ?? heroMediaId,
        coverMediaId: opt(fd, 'coverMediaId'),
        fullVideoUrl: str(fd, 'fullVideoUrl'),
        briefTitle: str(fd, 'briefTitle'),
        briefText: str(fd, 'briefText'),
        directionTitle: str(fd, 'directionTitle'),
        directionText: str(fd, 'directionText'),
        productionTitle: str(fd, 'productionTitle'),
        productionText: str(fd, 'productionText'),
        finishingTitle: str(fd, 'finishingTitle'),
        finishingText: str(fd, 'finishingText'),
        seoTitle: str(fd, 'seoTitle'),
        seoDescription: str(fd, 'seoDescription'),
      },
    }),
    prisma.projectCredit.deleteMany({ where: { projectId: id } }),
    prisma.projectCredit.createMany({
      data: credits.map(([stage, tools = '', role = ''], order) => ({ projectId: id, stage, tools, role, order })),
    }),
    prisma.projectGalleryItem.deleteMany({ where: { projectId: id } }),
    prisma.projectGalleryItem.createMany({
      data: gallery
        .filter((g) => g.mediaId)
        .map((g, order) => ({ projectId: id, mediaId: g.mediaId, kind: g.kind === 'BASTIDOR' ? 'BASTIDOR' : 'FRAME', caption: g.caption ?? '', order })),
    }),
  ]);
  refresh('/admin/portfolio');
  back(`/admin/portfolio/${id}`);
}

export async function toggleProject(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  const field = str(fd, 'field') === 'featured' ? 'featured' : 'published';
  const p = await prisma.project.findUniqueOrThrow({ where: { id } });
  await prisma.project.update({ where: { id }, data: { [field]: !p[field] } });
  refresh('/admin/portfolio');
  back('/admin/portfolio', field === 'featured' ? (p.featured ? 'Saiu da home.' : 'Agora aparece na home.') : p.published ? 'Despublicado.' : 'Publicado.');
}

export async function deleteProject(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  const p = await prisma.project.delete({ where: { id } });
  refresh('/admin/portfolio');
  back('/admin/portfolio', `“${p.title}” excluído. O vídeo continua em Mídias.`);
}

// ---------- ordem genérica (↑ ↓) ----------

const ORDERABLE = {
  project: prisma.project,
  photo: prisma.photo,
  plan: prisma.plan,
  faq: prisma.faq,
  testimonial: prisma.testimonial,
  brand: prisma.brand,
} as const;
type Orderable = keyof typeof ORDERABLE;

export async function moveItem(fd: FormData) {
  await requireAdmin();
  const model = str(fd, 'model') as Orderable;
  const id = str(fd, 'id');
  const dir = str(fd, 'dir') === 'up' ? -1 : 1;
  const back_ = str(fd, 'back') || '/admin';
  const delegate = ORDERABLE[model] as unknown as {
    findMany: (a: object) => Promise<{ id: string; order: number }[]>;
    update: (a: object) => Promise<unknown>;
  };
  if (!delegate) back(back_, 'Item inválido.');
  const scope = str(fd, 'scope');
  const where = model === 'photo' && (scope === 'FOTO' || scope === 'ARTE') ? { collection: scope } : {};
  const rows = await delegate.findMany({ where, orderBy: [{ order: 'asc' }, { id: 'asc' }], select: { id: true, order: true } });
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) back(back_, 'Já está na ponta.');
  [rows[i], rows[j]] = [rows[j], rows[i]];
  await prisma.$transaction(rows.map((r, order) => delegate.update({ where: { id: r.id }, data: { order } }) as never));
  refresh(back_);
  back(back_, 'Ordem atualizada.');
}

// ---------- fotos e artes ----------

type Collection = 'FOTO' | 'ARTE';
const COLLECTION_PATHS: Record<Collection, { admin: string; site: string }> = {
  FOTO: { admin: '/admin/fotos', site: '/fotos' },
  ARTE: { admin: '/admin/artes', site: '/artes' },
};
const asCollection = (v: string): Collection => (v === 'ARTE' ? 'ARTE' : 'FOTO');

export async function addPhotos(mediaIds: string[], collection: Collection = 'FOTO') {
  await requireAdmin();
  const c = asCollection(collection);
  const min = await prisma.photo.aggregate({ where: { collection: c }, _min: { order: true } });
  let order = (min._min.order ?? 1) - mediaIds.length;
  for (const mediaId of mediaIds) {
    await prisma.photo.create({ data: { mediaId, collection: c, order: order++ } });
  }
  refresh(COLLECTION_PATHS[c].admin, COLLECTION_PATHS[c].site);
}

export async function updatePhoto(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  const title = str(fd, 'title');
  const photo = await prisma.photo.update({
    where: { id },
    data: { title, published: bool(fd, 'published'), downloadable: bool(fd, 'downloadable') },
  });
  await prisma.media.update({ where: { id: photo.mediaId }, data: { alt: str(fd, 'alt') || title } });
  const paths = COLLECTION_PATHS[photo.collection];
  refresh(paths.admin, paths.site);
  back(paths.admin);
}

export async function deletePhoto(fd: FormData) {
  await requireAdmin();
  const photo = await prisma.photo.delete({ where: { id: str(fd, 'id') } });
  await deleteMediaIfUnused(photo.mediaId);
  const paths = COLLECTION_PATHS[photo.collection];
  refresh(paths.admin, paths.site);
  back(paths.admin, photo.collection === 'ARTE' ? 'Arte excluída.' : 'Foto excluída.');
}

// ---------- mensagens ----------

export async function markMessage(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  const action = str(fd, 'action');
  if (action === 'read') await prisma.contactMessage.update({ where: { id }, data: { readAt: new Date() } });
  if (action === 'unread') await prisma.contactMessage.update({ where: { id }, data: { readAt: null } });
  if (action === 'archive') await prisma.contactMessage.update({ where: { id }, data: { archived: true, readAt: new Date() } });
  if (action === 'unarchive') await prisma.contactMessage.update({ where: { id }, data: { archived: false } });
  if (action === 'delete') await prisma.contactMessage.delete({ where: { id } });
  revalidatePath('/admin/mensagens');
  back(`/admin/mensagens${str(fd, 'view') ? `?ver=${str(fd, 'view')}` : ''}`, action === 'delete' ? 'Mensagem apagada.' : 'Pronto.');
}

// ---------- listas simples: planos, perguntas, depoimentos, marcas ----------

type ListModel = 'plan' | 'faq' | 'testimonial' | 'brand';
const LIST_PATH: Record<ListModel, string> = {
  plan: '/admin/planos',
  faq: '/admin/perguntas',
  testimonial: '/admin/depoimentos',
  brand: '/admin/marcas',
};

function listData(model: ListModel, fd: FormData) {
  switch (model) {
    case 'plan':
      return { name: str(fd, 'name'), description: str(fd, 'description'), price: str(fd, 'price'), onRequest: bool(fd, 'onRequest'), published: bool(fd, 'published') };
    case 'faq':
      return { question: str(fd, 'question'), answer: str(fd, 'answer'), published: bool(fd, 'published') };
    case 'testimonial': {
      const confirmed = bool(fd, 'confirmed');
      return {
        quote: str(fd, 'quote'),
        authorName: str(fd, 'authorName'),
        authorRole: str(fd, 'authorRole'),
        company: str(fd, 'company'),
        avatarMediaId: opt(fd, 'avatarMediaId'),
        confirmed,
        // Sem a confirmação de que é real e autorizado, não vai para o site
        published: confirmed && bool(fd, 'published'),
      };
    }
    case 'brand':
      return { name: str(fd, 'name'), url: str(fd, 'url'), logoMediaId: opt(fd, 'logoMediaId'), published: bool(fd, 'published') };
  }
}

export async function saveListItem(fd: FormData) {
  await requireAdmin();
  const model = str(fd, 'model') as ListModel;
  const path = LIST_PATH[model];
  if (!path) redirect('/admin');
  const id = str(fd, 'id');
  const data = listData(model, fd) as Record<string, unknown>;
  const delegate = (prisma as unknown as Record<string, { create: (a: object) => Promise<unknown>; update: (a: object) => Promise<unknown>; aggregate: (a: object) => Promise<{ _max: { order: number | null } }> }>)[model];
  if (id) {
    await delegate.update({ where: { id }, data });
  } else {
    const last = await delegate.aggregate({ _max: { order: true } });
    await delegate.create({ data: { ...data, order: (last._max.order ?? -1) + 1 } });
  }
  refresh(path);
  back(path, id ? 'Salvo.' : 'Adicionado.');
}

export async function deleteListItem(fd: FormData) {
  await requireAdmin();
  const model = str(fd, 'model') as ListModel;
  const path = LIST_PATH[model];
  if (!path) redirect('/admin');
  const delegate = (prisma as unknown as Record<string, { delete: (a: object) => Promise<unknown> }>)[model];
  await delegate.delete({ where: { id: str(fd, 'id') } });
  refresh(path);
  back(path, 'Excluído.');
}

// ---------- processo ----------

export async function saveStep(fd: FormData) {
  await requireAdmin();
  await prisma.processStep.update({
    where: { id: str(fd, 'id') },
    data: { title: str(fd, 'title'), description: str(fd, 'description'), tools: str(fd, 'tools'), mediaId: opt(fd, 'mediaId') },
  });
  refresh('/admin/processo');
  back('/admin/processo');
}

// ---------- seções ----------

export async function saveSection(fd: FormData) {
  await requireAdmin();
  await prisma.section.update({
    where: { key: str(fd, 'key') },
    data: {
      enabled: bool(fd, 'enabled'),
      label: str(fd, 'label'),
      titleLine1: str(fd, 'titleLine1'),
      titleLine2: str(fd, 'titleLine2'),
      intro: str(fd, 'intro'),
    },
  });
  refresh('/admin/secoes');
  back('/admin/secoes');
}

// ---------- configurações do site ----------

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  const group = str(fd, 'group');
  const data: Record<string, unknown> = {};
  const text = (k: string) => (data[k] = str(fd, k));
  if (group === 'abertura') {
    data.heroMediaId = opt(fd, 'heroMediaId');
    text('heroLocation');
    text('heroTagline');
    data.heroList = str(fd, 'heroList')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    data.numbersUseCounters = bool(fd, 'numbersUseCounters');
    text('numbersPhrase');
    text('numbersCounterText');
  }
  if (group === 'sobre') {
    data.aboutMediaId = opt(fd, 'aboutMediaId');
    ['aboutTag', 'aboutName', 'aboutRole', 'aboutBio'].forEach(text);
  }
  if (group === 'contato') {
    ['contactEmail', 'instagramUrl', 'linkedinUrl', 'youtubeUrl'].forEach(text);
    data.whatsapp = str(fd, 'whatsapp').replace(/\D/g, '');
  }
  if (group === 'rodape') {
    ['footerLine1', 'footerLine2', 'entityPhrase', 'seoTitle', 'seoDescription'].forEach(text);
    data.ogMediaId = opt(fd, 'ogMediaId');
  }
  await prisma.siteSettings.update({ where: { id: 1 }, data });
  refresh('/admin/site');
  back(`/admin/site#${group}`);
}

// ---------- mídias ----------

async function deleteMediaIfUnused(id: string) {
  const m = await prisma.media.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          projectHero: true,
          projectCover: true,
          projectFullVideo: true,
          galleryItems: true,
          processSteps: true,
          testimonials: true,
          brands: true,
          siteHero: true,
          siteAbout: true,
          siteOg: true,
          photos: true,
        },
      },
    },
  });
  if (!m) return false;
  const uses = Object.values(m._count).reduce((a, b) => a + b, 0);
  if (uses > 0) return false;
  const v = m.variants as MediaVariants | null;
  if (v?.version) await storage().deletePrefix(`m/${m.id}/${v.version}`).catch(() => {});
  if (m.tempPath) await fsp.rm(m.tempPath, { force: true }).catch(() => {});
  await prisma.media.delete({ where: { id } });
  return true;
}

export async function deleteMedia(fd: FormData) {
  await requireAdmin();
  const ok = await deleteMediaIfUnused(str(fd, 'id'));
  back('/admin/midias', ok ? 'Mídia apagada.' : 'Essa mídia ainda está em uso. Tire de onde ela aparece antes de apagar.');
}

/** Refaz capa e prévia (ou tenta de novo depois de um erro) */
export async function reprocessMedia(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  const media = await prisma.media.findUniqueOrThrow({ where: { id } });
  if (media.kind === 'IMAGE' && !media.tempPath) {
    // Imagem já processada: o original não é guardado, então só dá para trocar o texto alternativo
    await prisma.media.update({ where: { id }, data: { alt: str(fd, 'alt') } });
    back('/admin/midias');
  }
  const poster = str(fd, 'posterAtSec');
  await prisma.media.update({
    where: { id },
    data: {
      status: 'PENDING',
      attempts: 0,
      error: null,
      alt: str(fd, 'alt'),
      posterAtSec: poster === '' ? null : num(fd, 'posterAtSec'),
      previewStartSec: Math.max(0, num(fd, 'previewStartSec', 0)),
      previewLengthSec: Math.min(30, Math.max(2, num(fd, 'previewLengthSec', 8))),
    },
  });
  back('/admin/midias', 'Na fila: a capa e a prévia novas aparecem em alguns minutos.');
}

export async function saveMediaAlt(fd: FormData) {
  await requireAdmin();
  await prisma.media.update({ where: { id: str(fd, 'id') }, data: { alt: str(fd, 'alt') } });
  refresh('/admin/midias');
  back('/admin/midias');
}
