import 'server-only';
import type { Media } from '@prisma/client';
import type { MediaInitial } from '@/components/admin/MediaField';
import { prisma } from './db';
import { mediaSelect, toMediaView } from './media';

export const adminMediaSelect = { ...mediaSelect, originalName: true, error: true } as const;

type AdminMediaRow = Pick<
  Media,
  'id' | 'kind' | 'status' | 'alt' | 'width' | 'height' | 'blurDataUrl' | 'isPlaceholder' | 'variants' | 'durationSec' | 'originalName' | 'error'
>;

export function mediaInitial(m: AdminMediaRow | null | undefined): MediaInitial {
  if (!m) return null;
  return { id: m.id, status: m.status, name: m.originalName, view: toMediaView(m), error: m.error };
}

export async function okMessage(searchParams: Promise<Record<string, string | string[] | undefined>>): Promise<string | undefined> {
  const sp = await searchParams;
  return typeof sp.ok === 'string' ? sp.ok : undefined;
}

/** Onde ainda tem [PREENCHER] no que está publicado */
export async function pendingFills(): Promise<{ where: string; href: string; text: string }[]> {
  const out: { where: string; href: string; text: string }[] = [];
  const has = (t: string | null | undefined) => !!t && t.includes('[PREENCHER');
  const add = (where: string, href: string, t: string | null | undefined) => {
    if (has(t)) for (const m of t!.match(/\[PREENCHER[^\]]*\]/g) ?? []) out.push({ where, href, text: m });
  };
  const s = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (s) {
    for (const [k, v] of Object.entries(s)) if (typeof v === 'string') add('Abertura, sobre e contato', '/admin/site', v);
    if (!s.contactEmail) out.push({ where: 'Contato', href: '/admin/site#contato', text: '[PREENCHER: e-mail de contato]' });
  }
  for (const sec of await prisma.section.findMany({ where: { enabled: true } })) {
    [sec.label, sec.titleLine1, sec.titleLine2, sec.intro].forEach((t) => add(`Seção ${sec.key}`, '/admin/secoes', t));
  }
  for (const p of await prisma.plan.findMany({ where: { published: true } })) [p.name, p.description, p.price].forEach((t) => add('Planos', '/admin/planos', t));
  for (const f of await prisma.faq.findMany({ where: { published: true } })) add(`Pergunta: ${f.question}`, '/admin/perguntas', f.answer);
  for (const st of await prisma.processStep.findMany()) [st.title, st.description, st.tools].forEach((t) => add(`Processo ${st.number}`, '/admin/processo', t));
  return out;
}
