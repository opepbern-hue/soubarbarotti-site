import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateProject } from '@/app/admin/actions';
import { Flash } from '@/components/admin/AutoRefresh';
import { GalleryEditor } from '@/components/admin/GalleryEditor';
import { MediaField } from '@/components/admin/MediaField';
import { btnGhost, btnPrimary, Card, Check, Field, inputCls, PageHead } from '@/components/admin/ui';
import { adminMediaSelect, mediaInitial, okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';
import { toMediaView } from '@/lib/media';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function EditProject({ params, searchParams }: Props) {
  const { id } = await params;
  const [ok, p, all] = await Promise.all([
    okMessage(searchParams),
    prisma.project.findUnique({
      where: { id },
      include: {
        heroMedia: { select: adminMediaSelect },
        coverMedia: { select: adminMediaSelect },
        fullVideoMedia: { select: adminMediaSelect },
        credits: { orderBy: { order: 'asc' } },
        gallery: { orderBy: { order: 'asc' }, include: { media: { select: adminMediaSelect } } },
      },
    }),
    prisma.project.findMany({ select: { category: true } }),
  ]);
  if (!p) notFound();
  const categories = [...new Set(all.map((x) => x.category).filter((c) => c && !c.includes('[PREENCHER')))];
  const separateFull = p.fullVideoMediaId && p.fullVideoMediaId !== p.heroMediaId ? p.fullVideoMedia : null;
  const text = (name: string, value: string, rows = 3, placeholder = '') => (
    <textarea name={name} defaultValue={value} rows={rows} placeholder={placeholder} className={`${inputCls} resize-y`} />
  );

  return (
    <>
      <Flash message={ok} />
      <PageHead title={p.title}>
        <div className="flex gap-2">
          <Link href="/admin/portfolio" className={btnGhost}>
            ← Voltar
          </Link>
          <a href={`/portfolio/${p.slug}`} target="_blank" rel="noopener" className={btnGhost}>
            Ver no site ↗
          </a>
        </div>
      </PageHead>

      <form action={updateProject} className="flex flex-col gap-5">
        <input type="hidden" name="id" value={p.id} />
        <Card>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nome *">
              <input name="title" required defaultValue={p.title} className={inputCls} />
            </Field>
            <Field label="Categoria">
              <input name="category" list="categorias" defaultValue={p.category} className={inputCls} />
              <datalist id="categorias">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
          </div>
          <div className="mt-5">
            <MediaField name="heroMediaId" kind="VIDEO" initial={mediaInitial(p.heroMedia)} label="Vídeo" hint="Capa e prévia são tiradas dele. Para escolher o trecho da prévia ou o frame da capa, vá em Mídias." />
          </div>
          <div className="mt-5 flex flex-wrap gap-6">
            <Check name="featured" label="★ Mostrar nos cards grandes da home" defaultChecked={p.featured} />
            <Check name="published" label="Publicado no site" defaultChecked={p.published} />
          </div>
        </Card>

        <details className="group rounded-2xl bg-branco-tela ring-1 ring-linha">
          <summary className="cursor-pointer list-none p-5 font-display text-[18px] font-semibold md:p-7">
            Mais detalhes (opcional) <span className="text-[13px] font-normal text-fumaca">— só aparece no site o que você preencher</span>
          </summary>
          <div className="grid gap-5 px-5 pb-7 md:px-7">
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Cliente">
                <input name="client" defaultValue={p.client} className={inputCls} />
              </Field>
              <Field label="Entrega" hint="Ex.: Reel 9:16 + versão 16:9">
                <input name="deliverable" defaultValue={p.deliverable} className={inputCls} />
              </Field>
              <Field label="Local">
                <input name="location" defaultValue={p.location} className={inputCls} />
              </Field>
            </div>
            <Field label="Descrição curta" hint="Uma ou duas frases.">
              {text('shortDescription', p.shortDescription, 2)}
            </Field>
            <Field label="Link do YouTube/Vimeo" hint="Usado quando não houver vídeo próprio.">
              <input name="fullVideoUrl" type="url" defaultValue={p.fullVideoUrl} className={inputCls} />
            </Field>
            <MediaField name="fullVideoMediaId" kind="VIDEO" initial={mediaInitial(separateFull)} label="Vídeo completo separado" hint="Só se a versão com som for diferente do vídeo acima." />
            <MediaField name="coverMediaId" kind="IMAGE" initial={mediaInitial(p.coverMedia)} label="Capa própria" hint="Se vazio, a capa sai do próprio vídeo." />

            <div className="grid gap-5 md:grid-cols-2">
              {(
                [
                  ['brief', 'O briefing', p.briefTitle, p.briefText],
                  ['direction', 'A direção criativa', p.directionTitle, p.directionText],
                  ['production', 'A produção com IA', p.productionTitle, p.productionText],
                  ['finishing', 'A finalização', p.finishingTitle, p.finishingText],
                ] as const
              ).map(([key, label, title, body]) => (
                <fieldset key={key} className="rounded-xl bg-nevoa/40 p-4 ring-1 ring-linha">
                  <legend className="px-1 text-[13px] font-semibold uppercase tracking-[0.04em] text-fumaca">{label}</legend>
                  <input name={`${key}Title`} defaultValue={title} placeholder="Título" className={inputCls} />
                  <div className="mt-2">{text(`${key}Text`, body, 4, 'Texto')}</div>
                </fieldset>
              ))}
            </div>

            <Field label="Créditos (uma etapa por linha)" hint="Formato: Etapa | Ferramentas | O que eu fiz. Ex.: Color grade | DaVinci Resolve">
              {text(
                'credits',
                p.credits.map((c) => [c.stage, c.tools, c.role].filter((x, i) => i < 2 || x).join(' | ')).join('\n'),
                5,
              )}
            </Field>

            <div>
              <span className="mb-1.5 block text-[13px] font-medium">Frames e bastidores</span>
              <GalleryEditor
                initial={p.gallery.map((g) => ({ mediaId: g.mediaId, kind: g.kind, caption: g.caption, view: toMediaView(g.media), name: g.media.originalName }))}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Endereço (slug)" hint={`soubarbarotti.com.br/portfolio/${p.slug}`}>
                <input name="slug" defaultValue={p.slug} className={inputCls} />
              </Field>
              <Field label="Título para o Google">
                <input name="seoTitle" defaultValue={p.seoTitle} maxLength={70} className={inputCls} />
              </Field>
            </div>
            <Field label="Descrição para o Google">{text('seoDescription', p.seoDescription, 2)}</Field>
          </div>
        </details>

        <div className="sticky bottom-4 z-10">
          <button type="submit" className={`${btnPrimary} shadow-xl`}>
            Salvar
          </button>
        </div>
      </form>
    </>
  );
}
