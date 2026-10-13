import { logoutAction, revokeOthersAction } from '@/app/admin/actions';
import { Flash } from '@/components/admin/AutoRefresh';
import { btnDanger, btnGhost, Card, PageHead } from '@/components/admin/ui';
import { okMessage } from '@/lib/admin-data';
import { activeSessions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PasswordForm } from './PasswordForm';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function device(ua: string): string {
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navegador';
  const os = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : '';
  return os ? `${browser} no ${os}` : browser;
}

const fmt = (d: Date) => d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });

export default async function Seguranca({ searchParams }: Props) {
  const [ok, sessions, failures] = await Promise.all([
    okMessage(searchParams),
    activeSessions(),
    prisma.loginAttempt.count({ where: { ok: false, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
  ]);
  return (
    <>
      <Flash message={ok} />
      <PageHead
        title="Segurança"
        intro="O painel só abre com a senha. Cada login vira uma sessão guardada no banco: se você sair, trocar a senha ou encerrar as outras sessões, o acesso cai na hora."
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="mb-5 font-display text-[20px] font-semibold">Trocar a senha</h2>
          <PasswordForm />
        </Card>

        <Card>
          <h2 className="font-display text-[20px] font-semibold">Onde você está logado</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl bg-nevoa/50 px-4 py-3 ring-1 ring-linha">
                <div>
                  <p className="text-[14px] font-medium">
                    {device(s.userAgent)}
                    {s.current ? <span className="ml-2 rounded-full bg-brasa px-2 py-0.5 text-[11px] font-semibold uppercase text-white">este aparelho</span> : null}
                  </p>
                  <p className="text-[12px] text-fumaca">
                    Entrou em {fmt(s.createdAt)} · visto por último {fmt(s.lastSeenAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <form action={revokeOthersAction}>
              <button className={btnDanger}>Encerrar as outras sessões</button>
            </form>
            <form action={logoutAction}>
              <button className={btnGhost}>Sair deste aparelho</button>
            </form>
          </div>
          <p className="mt-5 text-[13px] text-fumaca">
            Tentativas de senha erradas nos últimos 7 dias: <strong className="text-carvao">{failures}</strong>. Depois de 5 erros em 15 minutos, o
            aparelho fica bloqueado por 15 minutos.
          </p>
        </Card>
      </div>
    </>
  );
}
