import { deletePhoto, moveItem, updatePhoto } from '@/app/admin/actions';
import { prisma } from '@/lib/db';
import { adminMediaSelect } from '@/lib/admin-data';
import { toMediaView } from '@/lib/media';
import { AutoRefresh, Flash } from './AutoRefresh';
import { ConfirmButton } from './ConfirmButton';
import { Thumb } from './MediaField';
import { PhotoUploader } from './PhotoUploader';
import { btnDanger, btnGhost, btnPrimary, Check, inputCls, PageHead, StatusBadge } from './ui';

/** Painel de Fotos ou de Artes: arrastar para adicionar, editar, ordenar e excluir */
export async function GalleryAdmin({ collection, ok }: { collection: 'FOTO' | 'ARTE'; ok?: string }) {
  const art = collection === 'ARTE';
  const back = art ? '/admin/artes' : '/admin/fotos';
  const publicPath = art ? '/artes' : '/fotos';
  const items = await prisma.photo.findMany({
    where: { collection },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { media: { select: adminMediaSelect } },
  });
  const busy = items.some((p) => p.media.status !== 'READY' && p.media.status !== 'ERROR');

  return (
    <>
      <Flash message={ok} />
      <AutoRefresh active={busy} />
      <PageHead
        title={art ? 'Artes' : 'Fotos'}
        intro={
          <>
            Aparecem em{' '}
            <a href={publicPath} target="_blank" rel="noopener" className="text-brasa underline">
              soubarbarotti.com.br{publicPath}
            </a>
            , com os botões Baixar (JPG em alta) e Copiar. As novas entram no começo da lista.
          </>
        }
      />
      <PhotoUploader collection={collection} />

      {items.length ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <li key={p.id} className="rounded-2xl bg-branco-tela p-3 ring-1 ring-linha">
              <Thumb view={toMediaView(p.media)} className="aspect-[4/3] w-full rounded-lg" />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <StatusBadge status={p.media.status} />
                  {!p.published ? <span className="rounded-full bg-linha px-2 py-0.5 text-[11px] font-semibold uppercase">fora do ar</span> : null}
                </span>
                <div className="flex gap-1">
                  {(['up', 'down'] as const).map((dir) => (
                    <form key={dir} action={moveItem}>
                      <input type="hidden" name="model" value="photo" />
                      <input type="hidden" name="scope" value={collection} />
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="dir" value={dir} />
                      <input type="hidden" name="back" value={back} />
                      <button className={btnGhost} aria-label={dir === 'up' ? 'Mover para antes' : 'Mover para depois'}>
                        {dir === 'up' ? '←' : '→'}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
              {p.media.status === 'ERROR' && p.media.error ? <p className="mt-1 text-[12px] text-[#a3261a]">{p.media.error}</p> : null}
              <form action={updatePhoto} className="mt-3 flex flex-col gap-2">
                <input type="hidden" name="id" value={p.id} />
                <input name="title" defaultValue={p.title} placeholder="Título (opcional)" className={inputCls} />
                <input name="alt" defaultValue={p.media.alt} placeholder="Descrição para leitor de tela (opcional)" className={inputCls} />
                <Check name="published" label="Aparece no site" defaultChecked={p.published} />
                <Check name="downloadable" label="Mostrar Baixar e Copiar" defaultChecked={p.downloadable} />
                <div>
                  <button className={btnPrimary}>Salvar</button>
                </div>
              </form>
              <form action={deletePhoto} className="mt-2">
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton className={btnDanger} message={art ? 'Excluir esta arte do site?' : 'Excluir esta foto do site?'}>
                  Excluir
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-[14px] text-fumaca">{art ? 'Nenhuma arte ainda.' : 'Nenhuma foto ainda.'}</p>
      )}
    </>
  );
}
