import Link from 'next/link';
import { AutoRefresh, Flash } from '@/components/admin/AutoRefresh';
import { PageHead, btnPrimary, btnGhost, StatusBadge } from '@/components/admin/ui';
import { okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Painel({ searchParams }: Props) {
  const [ok, projectsCount, photosCount, artsCount, mediaCount, processing, errors, recentProjects] =
    await Promise.all([
      okMessage(searchParams),
      prisma.project.count({ where: { published: true } }),
      prisma.photo.count({ where: { published: true, collection: 'FOTO' } }),
      prisma.photo.count({ where: { published: true, collection: 'ARTE' } }),
      prisma.media.count(),
      prisma.media.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
      prisma.media.count({ where: { status: 'ERROR' } }),
      prisma.project.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        take: 6,
        select: { id: true, title: true, category: true, published: true, featured: true },
      }),
    ]);

  const tiles = [
    { label: 'Projetos no Portfólio', value: projectsCount, href: '/admin/portfolio' },
    { label: 'Vídeos & Mídias', value: mediaCount, href: '/admin/midias' },
    { label: 'Fotos Publicadas', value: photosCount, href: '/admin/fotos' },
    { label: 'Artes Publicadas', value: artsCount, href: '/admin/artes' },
  ];

  return (
    <>
      <Flash message={ok} />
      <AutoRefresh active={processing > 0} every={6000} />
      <PageHead
        title="Painel do Site"
        intro="Gerencie seus filmes, vídeos, fotos e o conteúdo visual do portfólio."
      >
        <Link href="/admin/portfolio" className={btnPrimary}>
          + Adicionar Projeto
        </Link>
      </PageHead>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="rounded-2xl bg-branco-tela p-5 ring-1 ring-linha transition-colors hover:ring-brasa"
          >
            <p className="font-display text-[36px] font-semibold leading-none tracking-[-0.03em]">{t.value}</p>
            <p className="mt-2 text-[13px] text-fumaca">{t.label}</p>
          </Link>
        ))}
      </div>

      {/* Notificação de Processamento ou Erro */}
      {processing > 0 ? (
        <p className="mt-4 rounded-xl bg-nevoa px-4 py-3 text-[14px] text-carvao ring-1 ring-linha">
          ⚙️ {processing} mídia(s) sendo comprimida(s) em segundo plano. Atualizando automaticamente...
        </p>
      ) : null}

      {errors > 0 ? (
        <p className="mt-4 rounded-xl bg-[#fde8e4] px-4 py-3 text-[14px] text-[#a3261a]">
          ⚠️ {errors} mídia(s) com erro.{' '}
          <Link href="/admin/midias" className="underline font-semibold">
            Ver em Mídias
          </Link>
        </p>
      ) : null}

      {/* Atalhos Rápidos */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/portfolio"
          className="rounded-2xl bg-branco-tela p-6 ring-1 ring-linha transition-all hover:shadow-md hover:ring-brasa"
        >
          <h3 className="font-display text-[18px] font-semibold">Portfólio & Filmes</h3>
          <p className="mt-1 text-[13px] text-fumaca">Crie projetos, vincule vídeos, galerias de bastidores e créditos.</p>
          <span className="mt-4 inline-block text-[13px] font-semibold text-brasa">Gerenciar trabalhos →</span>
        </Link>

        <Link
          href="/admin/midias"
          className="rounded-2xl bg-branco-tela p-6 ring-1 ring-linha transition-all hover:shadow-md hover:ring-brasa"
        >
          <h3 className="font-display text-[18px] font-semibold">Mídias & Vídeos</h3>
          <p className="mt-1 text-[13px] text-fumaca">Faça upload de vídeos pesados e ajuste os frames das capas.</p>
          <span className="mt-4 inline-block text-[13px] font-semibold text-brasa">Abrir biblioteca →</span>
        </Link>

        <Link
          href="/admin/site"
          className="rounded-2xl bg-branco-tela p-6 ring-1 ring-linha transition-all hover:shadow-md hover:ring-brasa"
        >
          <h3 className="font-display text-[18px] font-semibold">Abertura & Sobre</h3>
          <p className="mt-1 text-[13px] text-fumaca">Troque o vídeo de fundo da abertura e sua foto de perfil.</p>
          <span className="mt-4 inline-block text-[13px] font-semibold text-brasa">Editar visual →</span>
        </Link>
      </div>

      {/* Projetos Recentes */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[20px] font-bold text-carvao">Projetos no Site</h2>
          <Link href="/admin/portfolio" className="text-[13px] font-semibold text-brasa hover:underline">
            Ver todos ({projectsCount}) →
          </Link>
        </div>

        <div className="divide-y divide-linha rounded-2xl bg-branco-tela ring-1 ring-linha overflow-hidden">
          {recentProjects.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 transition-colors hover:bg-nevoa/40">
              <div>
                <p className="font-medium text-[15px] text-carvao">{p.title}</p>
                <p className="text-[12px] text-fumaca">
                  {p.category || 'Sem categoria'} · {p.featured ? '⭐ Destaque na Home' : 'No Portfólio'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.published ? 'READY' : 'PENDING'} />
                <Link href={`/admin/portfolio/${p.id}`} className={btnGhost}>
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
