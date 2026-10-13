import Link from 'next/link';
import { createProject, deleteProject, moveItem, toggleProject } from '@/app/admin/actions';
import { AutoRefresh, Flash } from '@/components/admin/AutoRefresh';
import { ConfirmButton } from '@/components/admin/ConfirmButton';
import { MediaField, Thumb } from '@/components/admin/MediaField';
import { btnDanger, btnGhost, btnPrimary, Card, Check, Field, inputCls, PageHead, StatusBadge } from '@/components/admin/ui';
import { adminMediaSelect, okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';
import { toMediaView } from '@/lib/media';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminPortfolio({ searchParams }: Props) {
  const [ok, projects] = await Promise.all([
    okMessage(searchParams),
    prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: { heroMedia: { select: adminMediaSelect } },
    }),
  ]);
  const categories = [...new Set(projects.map((p) => p.category).filter((c) => c && !c.includes('[PREENCHER')))];
  const busy = projects.some((p) => p.heroMedia && p.heroMedia.status !== 'READY' && p.heroMedia.status !== 'ERROR');

  return (
    <>
      <Flash message={ok} />
      <AutoRefresh active={busy} />
      <PageHead
        title="Portfólio"
        intro="Para adicionar, basta o nome e o vídeo. O resto é opcional e fica em “Editar”. Os marcados com ★ aparecem nos cards grandes da home."
      />

      <Card className="mb-8">
        <h2 className="font-display text-[20px] font-semibold">Novo projeto</h2>
        <form key={ok ?? 'novo'} action={createProject} className="mt-5 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nome *">
              <input name="title" required maxLength={120} placeholder="Ex.: Jéssica Fürst" className={inputCls} />
            </Field>
            <Field label="Categoria" hint="Vira o filtro da página de portfólio.">
              <input name="category" list="categorias" maxLength={60} placeholder="Ex.: Imobiliário" className={inputCls} />
              <datalist id="categorias">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
          </div>
          <MediaField name="heroMediaId" kind="VIDEO" initial={null} label="Vídeo" hint="MP4, MOV ou WebM. O sistema comprime sozinho e tira a capa do próprio vídeo." />
          <Field label="Ou link do YouTube/Vimeo (opcional)">
            <input name="fullVideoUrl" type="url" placeholder="https://youtu.be/…" className={inputCls} />
          </Field>
          <Check name="featured" label="★ Mostrar nos cards grandes da home" />
          <div>
            <button type="submit" className={btnPrimary}>
              Adicionar ao portfólio
            </button>
          </div>
        </form>
      </Card>

      <ul className="flex flex-col gap-3">
        {projects.map((p, i) => {
          const view = toMediaView(p.heroMedia);
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-branco-tela p-3 ring-1 ring-linha md:flex-nowrap">
              <span className="w-8 text-center font-display text-[13px] font-semibold text-brasa">{String(i + 1).padStart(2, '0')}</span>
              <Thumb view={view} className="h-20 w-14 flex-none rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[17px] font-semibold">
                  {p.featured ? <span className="text-brasa">★ </span> : null}
                  {p.title}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px] text-fumaca">
                  {p.category || 'Sem categoria'}
                  {p.heroMedia ? <StatusBadge status={p.heroMedia.status} /> : <span className="text-brasa">sem vídeo</span>}
                  {!p.published ? <span className="rounded-full bg-linha px-2 py-0.5 text-[11px] font-semibold uppercase">Fora do ar</span> : null}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <form action={moveItem}>
                  <input type="hidden" name="model" value="project" />
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="dir" value="up" />
                  <input type="hidden" name="back" value="/admin/portfolio" />
                  <button className={btnGhost} aria-label="Subir">
                    ↑
                  </button>
                </form>
                <form action={moveItem}>
                  <input type="hidden" name="model" value="project" />
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="dir" value="down" />
                  <input type="hidden" name="back" value="/admin/portfolio" />
                  <button className={btnGhost} aria-label="Descer">
                    ↓
                  </button>
                </form>
                <form action={toggleProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="field" value="featured" />
                  <button className={btnGhost}>{p.featured ? 'Tirar da home' : '★ Na home'}</button>
                </form>
                <form action={toggleProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="field" value="published" />
                  <button className={btnGhost}>{p.published ? 'Despublicar' : 'Publicar'}</button>
                </form>
                <Link href={`/admin/portfolio/${p.id}`} className={btnGhost}>
                  Editar
                </Link>
                {p.published ? (
                  <a href={`/portfolio/${p.slug}`} target="_blank" rel="noopener" className={btnGhost}>
                    Ver ↗
                  </a>
                ) : null}
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton className={btnDanger} message={`Excluir “${p.title}” do portfólio?`}>
                    Excluir
                  </ConfirmButton>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
