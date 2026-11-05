import { deleteListItem, moveItem, saveListItem } from '@/app/admin/actions';
import { Flash } from '@/components/admin/AutoRefresh';
import { ConfirmButton } from '@/components/admin/ConfirmButton';
import { btnDanger, btnGhost, btnPrimary, Card, Check, Field, inputCls, PageHead } from '@/components/admin/ui';
import { okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PerguntasPage({ searchParams }: Props) {
  const [ok, faqs] = await Promise.all([
    okMessage(searchParams),
    prisma.faq.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] }),
  ]);

  return (
    <>
      <Flash message={ok} />
      <PageHead
        title="Perguntas Frequentes (FAQ)"
        intro="Adicione, edite, reordene ou exclua as dúvidas respondidas na Home."
      />

      <Card className="mb-8">
        <h2 className="font-display text-[20px] font-semibold">Nova pergunta</h2>
        <form key={ok ?? 'nova-faq'} action={saveListItem} className="mt-4 grid gap-4">
          <input type="hidden" name="model" value="faq" />
          <Field label="Pergunta *">
            <input name="question" required placeholder="Ex.: Quanto tempo leva do briefing à entrega?" className={inputCls} />
          </Field>
          <Field label="Resposta *">
            <textarea name="answer" required rows={3} className={`${inputCls} resize-y`} />
          </Field>
          <Check name="published" label="Publicada no site" defaultChecked={true} />
          <div>
            <button type="submit" className={btnPrimary}>
              Adicionar pergunta
            </button>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {faqs.map((f, i) => (
          <Card key={f.id}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-[15px] font-semibold">
                <span className="text-brasa mr-2">{String(i + 1).padStart(2, '0')}</span>
                {f.question}
              </span>
              <div className="flex items-center gap-1.5">
                {(['up', 'down'] as const).map((dir) => (
                  <form key={dir} action={moveItem}>
                    <input type="hidden" name="model" value="faq" />
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="dir" value={dir} />
                    <input type="hidden" name="back" value="/admin/perguntas" />
                    <button className={btnGhost} aria-label={dir === 'up' ? 'Subir' : 'Descer'}>
                      {dir === 'up' ? '↑' : '↓'}
                    </button>
                  </form>
                ))}
                <form action={deleteListItem}>
                  <input type="hidden" name="model" value="faq" />
                  <input type="hidden" name="id" value={f.id} />
                  <ConfirmButton className={btnDanger} message={`Excluir a pergunta "${f.question}" permanentemente?`}>
                    Excluir
                  </ConfirmButton>
                </form>
              </div>
            </div>
            <form action={saveListItem} className="grid gap-4">
              <input type="hidden" name="model" value="faq" />
              <input type="hidden" name="id" value={f.id} />
              <Field label="Pergunta *">
                <input name="question" required defaultValue={f.question} className={inputCls} />
              </Field>
              <Field label="Resposta">
                <textarea name="answer" defaultValue={f.answer} rows={3} className={`${inputCls} resize-y`} />
              </Field>
              <Check name="published" label="Publicada no site" defaultChecked={f.published} />
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

