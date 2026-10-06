import { deleteMedia, reprocessMedia } from '@/app/admin/actions';
import { AutoRefresh, Flash } from '@/components/admin/AutoRefresh';
import { ConfirmButton } from '@/components/admin/ConfirmButton';
import { Thumb } from '@/components/admin/MediaField';
import { btnDanger, btnGhost, Field, inputCls, PageHead, StatusBadge } from '@/components/admin/ui';
import { okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';
import { toMediaView } from '@/lib/media';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(b > 100 * 1024 * 1024 ? 0 : 1)} MB`;
const sec = (s: number | null) => (s == null ? '' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`);

export default async function Midias({ searchParams }: Props) {
  const [ok, media] = await Promise.all([okMessage(searchParams), prisma.media.findMany({ orderBy: { createdAt: 'desc' }, take: 300 })]);
  const busy = media.some((m) => m.status === 'PENDING' || m.status === 'PROCESSING');
  return (
    <>
      <Flash message={ok} />
      <AutoRefresh active={busy} />
      <PageHead
        title="Mídias"
        intro="Tudo o que foi enviado. Nos vídeos, dá para escolher o frame da capa e o trecho da prévia muda em loop."
      />
      <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {media.map((m) => {
          const view = toMediaView(m);
          return (
            <li key={m.id} className="rounded-2xl bg-branco-tela p-4 ring-1 ring-linha">
              <div className="flex gap-3">
                <Thumb view={view} className="h-24 w-24 flex-none rounded-lg" />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium" title={m.originalName}>
                    {m.isPlaceholder ? '[provisório] ' : ''}
                    {m.originalName}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-fumaca">
                    <StatusBadge status={m.status} />
                    {m.kind === 'VIDEO' ? 'Vídeo' : 'Imagem'} · {mb(m.sizeBytes)}
                    {m.durationSec ? ` · ${sec(m.durationSec)}` : ''}
                    {m.width ? ` · ${m.width}×${m.height}` : ''}
                  </p>
                  {m.error ? <p className="mt-1 text-[12px] text-[#a3261a]">{m.error}</p> : null}
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-[13px] font-semibold text-brasa">Ajustar</summary>
                <form action={reprocessMedia} className="mt-3 grid gap-3">
                  <input type="hidden" name="id" value={m.id} />
                  <Field label="Descrição (texto alternativo)">
                    <input name="alt" defaultValue={m.alt} className={inputCls} />
                  </Field>
                  {m.kind === 'VIDEO' ? (
                    <div className="grid grid-cols-3 gap-2">
                      <Field label="Capa no segundo" hint="Vazio = automático">
                        <input name="posterAtSec" inputMode="decimal" defaultValue={m.posterAtSec ?? ''} className={inputCls} />
                      </Field>
                      <Field label="Prévia começa em (s)">
                        <input name="previewStartSec" inputMode="decimal" defaultValue={m.previewStartSec} className={inputCls} />
                      </Field>
                      <Field label="Duração da prévia (s)">
                        <input name="previewLengthSec" inputMode="decimal" defaultValue={m.previewLengthSec} className={inputCls} />
                      </Field>
                    </div>
                  ) : null}
                  <div>
                    <button className={btnGhost}>{m.kind === 'VIDEO' || m.status === 'ERROR' ? 'Salvar e refazer' : 'Salvar'}</button>
                  </div>
                </form>
                <form action={deleteMedia} className="mt-2">
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmButton className={btnDanger} message="Apagar esta mídia? Só funciona se ela não estiver em uso.">
                    Apagar
                  </ConfirmButton>
                </form>
              </details>
            </li>
          );
        })}
      </ul>
    </>
  );
}
