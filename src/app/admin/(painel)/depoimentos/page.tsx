import { deleteListItem, moveItem, saveListItem } from '@/app/admin/actions';
import { Flash } from '@/components/admin/AutoRefresh';
import { ConfirmButton } from '@/components/admin/ConfirmButton';
import { MediaField } from '@/components/admin/MediaField';
import { btnDanger, btnGhost, btnPrimary, Card, Check, Field, inputCls, PageHead } from '@/components/admin/ui';
import { adminMediaSelect, mediaInitial, okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DepoimentosPage({ searchParams }: Props) {
  const [ok, items] = await Promise.all([
    okMessage(searchParams),
    prisma.testimonial.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: { avatarMedia: { select: adminMediaSelect } },
    }),
  ]);

  return (
    <>
      <Flash message={ok} />
      <PageHead
        title="Depoimentos"
        intro="Adicione depoimentos reais de clientes. Só aparecem na Home quando marcados como confirmados e publicados."
      />

      <Card className="mb-8">
        <h2 className="font-display text-[20px] font-semibold">Novo depoimento</h2>
        <form key={ok ?? 'novo-depoimento'} action={saveListItem} className="mt-4 grid gap-4">
          <input type="hidden" name="model" value="testimonial" />
          <Field label="Depoimento *">
            <textarea name="quote" required rows={3} placeholder="O que o cliente disse…" className={`${inputCls} resize-y`} />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Nome do autor *">
              <input name="authorName" required placeholder="Ex.: Calebe" className={inputCls} />
            </Field>
            <Field label="Cargo / Papel (opcional)">
              <input name="authorRole" placeholder="Ex.: Fundador" className={inputCls} />
            </Field>
            <Field label="Empresa / Projeto (opcional)">
              <input name="company" placeholder="Ex.: Echo Labs" className={inputCls} />
            </Field>
          </div>
          <MediaField name="avatarMediaId" kind="IMAGE" initial={null} label="Foto do cliente (opcional)" />
          <div className="flex flex-wrap gap-6">
            <Check name="confirmed" label="Confirmo que este depoimento é real e autorizado" defaultChecked={true} />
            <Check name="published" label="Publicado no site" defaultChecked={true} />
          </div>
          <div>
            <button type="submit" className={btnPrimary}>
              Adicionar depoimento
            </button>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {items.map((t, i) => (
          <Card key={t.id}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-[15px] font-semibold">
                <span className="text-brasa mr-2">{String(i + 1).padStart(2, '0')}</span>
                {t.authorName} {t.company ? `· ${t.company}` : ''}
              </span>
              <div className="flex items-center gap-1.5">
                {(['up', 'down'] as const).map((dir) => (
                  <form key={dir} action={moveItem}>
                    <input type="hidden" name="model" value="testimonial" />
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="dir" value={dir} />
                    <input type="hidden" name="back" value="/admin/depoimentos" />
                    <button className={btnGhost} aria-label={dir === 'up' ? 'Subir' : 'Descer'}>
                      {dir === 'up' ? '↑' : '↓'}
                    </button>
                  </form>
                ))}
                <form action={deleteListItem}>
                  <input type="hidden" name="model" value="testimonial" />
                  <input type="hidden" name="id" value={t.id} />
                  <ConfirmButton className={btnDanger} message={`Excluir o depoimento de "${t.authorName}" permanentemente?`}>
                    Excluir
                  </ConfirmButton>
                </form>
              </div>
            </div>
            <form action={saveListItem} className="grid gap-4">
              <input type="hidden" name="model" value="testimonial" />
              <input type="hidden" name="id" value={t.id} />
              <Field label="Depoimento *">
                <textarea name="quote" required defaultValue={t.quote} rows={3} className={`${inputCls} resize-y`} />
              </Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Nome do autor *">
                  <input name="authorName" required defaultValue={t.authorName} className={inputCls} />
                </Field>
                <Field label="Cargo / Papel">
                  <input name="authorRole" defaultValue={t.authorRole} className={inputCls} />
                </Field>
                <Field label="Empresa / Projeto">
                  <input name="company" defaultValue={t.company} className={inputCls} />
                </Field>
              </div>
              <MediaField name="avatarMediaId" kind="IMAGE" initial={mediaInitial(t.avatarMedia)} label="Foto do cliente (opcional)" />
              <div className="flex flex-wrap gap-6">
                <Check name="confirmed" label="Confirmo que este depoimento é real e autorizado" defaultChecked={t.confirmed} />
                <Check name="published" label="Publicado no site" defaultChecked={t.published} />
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

