import { deleteStep, saveStep } from '@/app/admin/actions';
import { Flash } from '@/components/admin/AutoRefresh';
import { ConfirmButton } from '@/components/admin/ConfirmButton';
import { MediaField } from '@/components/admin/MediaField';
import { btnDanger, btnPrimary, Card, Field, inputCls, PageHead } from '@/components/admin/ui';
import { adminMediaSelect, mediaInitial, okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProcessoPage({ searchParams }: Props) {
  const [ok, steps] = await Promise.all([
    okMessage(searchParams),
    prisma.processStep.findMany({
      orderBy: { number: 'asc' },
      include: { media: { select: adminMediaSelect } },
    }),
  ]);

  return (
    <>
      <Flash message={ok} />
      <PageHead
        title="Processo"
        intro="Edite, adicione ou exclua as etapas do seu fluxo de direção e produção com IA exibidas na Home."
      />

      <Card className="mb-8">
        <h2 className="font-display text-[20px] font-semibold">Nova etapa do processo</h2>
        <form key={ok ?? 'nova-etapa'} action={saveStep} className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Título da etapa *">
              <input name="title" required placeholder="Ex.: Roteiro & Storyboard" className={inputCls} />
            </Field>
            <Field label="Ferramentas utilizadas">
              <input name="tools" placeholder="Ex.: Midjourney, Kling, DaVinci Resolve" className={inputCls} />
            </Field>
          </div>
          <Field label="Descrição">
            <textarea name="description" rows={2} className={`${inputCls} resize-y`} />
          </Field>
          <MediaField name="mediaId" kind="IMAGE" initial={null} label="Imagem ou frame ilustrativo (opcional)" />
          <div>
            <button type="submit" className={btnPrimary}>
              Adicionar etapa
            </button>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {steps.map((s) => (
          <Card key={s.id}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-[15px] font-bold text-brasa">
                Etapa {String(s.number).padStart(2, '0')}
              </span>
              <form action={deleteStep}>
                <input type="hidden" name="id" value={s.id} />
                <ConfirmButton className={btnDanger} message={`Excluir a etapa "${s.title}" permanentemente?`}>
                  Excluir etapa
                </ConfirmButton>
              </form>
            </div>
            <form action={saveStep} className="grid gap-4">
              <input type="hidden" name="id" value={s.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Título *">
                  <input name="title" required defaultValue={s.title} className={inputCls} />
                </Field>
                <Field label="Ferramentas">
                  <input name="tools" defaultValue={s.tools} className={inputCls} />
                </Field>
              </div>
              <Field label="Descrição">
                <textarea name="description" defaultValue={s.description} rows={2} className={`${inputCls} resize-y`} />
              </Field>
              <MediaField name="mediaId" kind="IMAGE" initial={mediaInitial(s.media)} label="Imagem ilustrativa (opcional)" />
              <div>
                <button type="submit" className={btnPrimary}>
                  Salvar etapa
                </button>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}

