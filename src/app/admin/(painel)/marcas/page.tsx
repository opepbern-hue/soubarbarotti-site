import { deleteListItem, moveItem, saveListItem } from '@/app/admin/actions';
import { Flash } from '@/components/admin/AutoRefresh';
import { ConfirmButton } from '@/components/admin/ConfirmButton';
import { MediaField } from '@/components/admin/MediaField';
import { btnDanger, btnGhost, btnPrimary, Card, Check, Field, inputCls, PageHead } from '@/components/admin/ui';
import { adminMediaSelect, mediaInitial, okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function MarcasPage({ searchParams }: Props) {
  const [ok, brands] = await Promise.all([
    okMessage(searchParams),
    prisma.brand.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: { logoMedia: { select: adminMediaSelect } },
    }),
  ]);

  return (
    <>
      <Flash message={ok} />
      <PageHead
        title="Marcas & Clientes"
        intro="Gerencie as marcas que aparecem na faixa em movimento da Home. Se excluir uma marca, ela sai permanentemente do site."
      />

      <Card className="mb-8">
        <h2 className="font-display text-[20px] font-semibold">Adicionar marca</h2>
        <form key={ok ?? 'nova-marca'} action={saveListItem} className="mt-4 grid gap-4">
          <input type="hidden" name="model" value="brand" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome da marca / cliente *">
              <input name="name" required placeholder="Ex.: Jéssica Fürst Imóveis" className={inputCls} />
            </Field>
            <Field label="Link / Site (opcional)">
              <input name="url" type="url" placeholder="https://…" className={inputCls} />
            </Field>
          </div>
          <MediaField name="logoMediaId" kind="IMAGE" initial={null} label="Logo (opcional — se vazio, exibe o nome tipográfico)" />
          <Check name="published" label="Publicada no site" defaultChecked={true} />
          <div>
            <button type="submit" className={btnPrimary}>
              Adicionar marca
            </button>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {brands.map((b, i) => (
          <Card key={b.id}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-[15px] font-semibold">
                <span className="text-brasa mr-2">{String(i + 1).padStart(2, '0')}</span>
                {b.name}
              </span>
              <div className="flex items-center gap-1.5">
                {(['up', 'down'] as const).map((dir) => (
                  <form key={dir} action={moveItem}>
                    <input type="hidden" name="model" value="brand" />
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="dir" value={dir} />
                    <input type="hidden" name="back" value="/admin/marcas" />
                    <button className={btnGhost} aria-label={dir === 'up' ? 'Subir' : 'Descer'}>
                      {dir === 'up' ? '↑' : '↓'}
                    </button>
                  </form>
                ))}
                <form action={deleteListItem}>
                  <input type="hidden" name="model" value="brand" />
                  <input type="hidden" name="id" value={b.id} />
                  <ConfirmButton className={btnDanger} message={`Excluir a marca "${b.name}" permanentemente?`}>
                    Excluir
                  </ConfirmButton>
                </form>
              </div>
            </div>
            <form action={saveListItem} className="grid gap-4">
              <input type="hidden" name="model" value="brand" />
              <input type="hidden" name="id" value={b.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome *">
                  <input name="name" required defaultValue={b.name} className={inputCls} />
                </Field>
                <Field label="Link (opcional)">
                  <input name="url" type="url" defaultValue={b.url} className={inputCls} />
                </Field>
              </div>
              <MediaField name="logoMediaId" kind="IMAGE" initial={mediaInitial(b.logoMedia)} label="Logo (opcional)" />
              <Check name="published" label="Publicada no site" defaultChecked={b.published} />
              <div>
                <button type="submit" className={btnPrimary}>
                  Salvar
                </button>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}

