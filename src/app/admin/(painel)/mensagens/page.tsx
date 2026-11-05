import Link from 'next/link';
import { markMessage } from '@/app/admin/actions';
import { convertMessageToLeadAction } from '@/app/admin/lead-actions';
import { Flash } from '@/components/admin/AutoRefresh';
import { ConfirmButton } from '@/components/admin/ConfirmButton';
import { btnDanger, btnGhost, btnPrimary, Card, PageHead } from '@/components/admin/ui';
import { okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const fmt = (d: Date) => d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });

export default async function MensagensPage({ searchParams }: Props) {
  const sp = await searchParams;
  const view = typeof sp.ver === 'string' ? sp.ver : '';
  const showArchived = view === 'arquivadas';

  const [ok, messages] = await Promise.all([
    okMessage(searchParams),
    prisma.contactMessage.findMany({
      where: { archived: showArchived },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <>
      <Flash message={ok} />
      <PageHead
        title="Mensagens de Contato"
        intro="Mensagens enviadas pelo formulário do site. Você pode responder, arquivar, transformar em Lead no Mapa ou apagar permanentemente."
      >
        <div className="flex gap-2">
          <Link href="/admin/mensagens" className={showArchived ? btnGhost : btnPrimary}>
            Caixa de Entrada
          </Link>
          <Link href="/admin/mensagens?ver=arquivadas" className={showArchived ? btnPrimary : btnGhost}>
            Arquivadas
          </Link>
        </div>
      </PageHead>

      {messages.length ? (
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <Card key={m.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[18px] font-semibold text-carvao">
                    {!m.readAt ? <span className="mr-2 inline-block size-2.5 rounded-full bg-brasa" title="Não lida" /> : null}
                    {m.name}
                  </p>
                  <p className="mt-0.5 text-[13px] text-fumaca">
                    <a href={`mailto:${m.email}`} className="text-brasa underline">
                      {m.email}
                    </a>{' '}
                    · {fmt(m.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form action={convertMessageToLeadAction}>
                    <input type="hidden" name="messageId" value={m.id} />
                    <button type="submit" className={btnGhost}>
                      📍 Converter em Lead
                    </button>
                  </form>

                  <form action={markMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="view" value={view} />
                    <input type="hidden" name="action" value={m.readAt ? 'unread' : 'read'} />
                    <button type="submit" className={btnGhost}>
                      {m.readAt ? 'Marcar não lida' : 'Marcar como lida'}
                    </button>
                  </form>

                  <form action={markMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="view" value={view} />
                    <input type="hidden" name="action" value={m.archived ? 'unarchive' : 'archive'} />
                    <button type="submit" className={btnGhost}>
                      {m.archived ? 'Desarquivar' : 'Arquivar'}
                    </button>
                  </form>

                  <form action={markMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="view" value={view} />
                    <input type="hidden" name="action" value="delete" />
                    <ConfirmButton className={btnDanger} message={`Apagar a mensagem de "${m.name}" permanentemente?`}>
                      Apagar
                    </ConfirmButton>
                  </form>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-nevoa/50 p-4 text-[15px] leading-relaxed text-carvao ring-1 ring-linha">
                {m.message}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-fumaca">
          {showArchived ? 'Nenhuma mensagem arquivada.' : 'Nenhuma mensagem na caixa de entrada.'}
        </p>
      )}
    </>
  );
}

