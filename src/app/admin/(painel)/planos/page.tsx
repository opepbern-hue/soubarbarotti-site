import { deleteListItem, moveItem, saveListItem } from '@/app/admin/actions';
import { Flash } from '@/components/admin/AutoRefresh';
import { ConfirmButton } from '@/components/admin/ConfirmButton';
import { btnDanger, btnGhost, btnPrimary, Card, Check, Field, inputCls, PageHead } from '@/components/admin/ui';
import { okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PlanosPage({ searchParams }: Props) {
  const [ok, plans] = await Promise.all([
    okMessage(searchParams),
    prisma.plan.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] }),
  ]);

  return (
    <>
      <Flash message={ok} />
      <PageHead
        title="Planos & Formatos"
        intro="Configure formatos e valores de contratação. Se excluir todos ou despublicar, a seção não aparece na Home."
      />

      <Card className="mb-8">
        <h2 className="font-display text-[20px] font-semibold">Novo plano</h2>
        <form key={ok ?? 'novo-plano'} action={saveListItem} className="mt-4 grid gap-4">
          <input type="hidden" name="model" value="plan" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome do plano *">
              <input name="name" required placeholder="Ex.: Filme Único" className={inputCls} />
            </Field>
            <Field label="Valor / Preço">
              <input name="price" placeholder="Ex.: A partir de R$ 2.500 ou Sob consulta" className={inputCls} />
            </Field>
          </div>
          <Field label="Descrição">
            <textarea name="description" rows={2} placeholder="Para quem é e o que inclui…" className={`${inputCls} resize-y`} />
          </Field>
          <div className="flex flex-wrap gap-6">
            <Check name="onRequest" label="Exibir como 'sob consulta'" />
            <Check name="published" label="Publicado no site" defaultChecked={true} />
          </div>
          <div>
            <button type="submit" className={btnPrimary}>
              Adicionar plano
            </button>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {plans.map((p, i) => (
          <Card key={p.id}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-[15px] font-semibold">
                <span className="text-brasa mr-2">{String(i + 1).padStart(2, '0')}</span>
                {p.name}
              </span>
              <div className="flex items-center gap-1.5">
                {(['up', 'down'] as const).map((dir) => (
                  <form key={dir} action={moveItem}>
                    <input type="hidden" name="model" value="plan" />
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="dir" value={dir} />
                    <input type="hidden" name="back" value="/admin/planos" />
                    <button className={btnGhost} aria-label={dir === 'up' ? 'Subir' : 'Descer'}>
                      {dir === 'up' ? '↑' : '↓'}
                    </button>
                  </form>
                ))}
                <form action={deleteListItem}>
                  <input type="hidden" name="model" value="plan" />
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton className={btnDanger} message={`Excluir o plano "${p.name}" permanentemente?`}>
                    Excluir
                  </ConfirmButton>
                </form>
              </div>
            </div>
            <form action={saveListItem} className="grid gap-4">
              <input type="hidden" name="model" value="plan" />
              <input type="hidden" name="id" value={p.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome *">
                  <input name="name" required defaultValue={p.name} className={inputCls} />
                </Field>
                <Field label="Valor / Preço">
                  <input name="price" defaultValue={p.price} className={inputCls} />
                </Field>
              </div>
              <Field label="Descrição">
                <textarea name="description" defaultValue={p.description} rows={2} className={`${inputCls} resize-y`} />
              </Field>
              <div className="flex flex-wrap gap-6">
                <Check name="onRequest" label="Exibir como 'sob consulta'" defaultChecked={p.onRequest} />
                <Check name="published" label="Publicado no site" defaultChecked={p.published} />
              </div>
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

