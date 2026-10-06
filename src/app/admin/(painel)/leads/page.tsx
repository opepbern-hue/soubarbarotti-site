import React from 'react';
import { AutoRefresh, Flash } from '@/components/admin/AutoRefresh';
import { CentralLeadDashboard } from '@/components/admin/CentralLeadDashboard';
import { PageHead } from '@/components/admin/ui';
import { okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CentralLeadsPage({ searchParams }: Props) {
  const [ok, unread, leads] = await Promise.all([
    okMessage(searchParams),
    prisma.contactMessage.count({ where: { readAt: null, archived: false } }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <>
      <Flash message={ok} />
      <PageHead
        title="Mapa de Leads & Central de Prospecção"
        intro="Pesquisa e prospecção com dados públicos oficiais, consulta gratuita de CNPJ, nomes de sócios para cumprimento e foco em Prioridade 1 (amostra de 6 fotos IA)."
      />

      <div className="mt-4">
        <CentralLeadDashboard initialLeads={leads} unreadMessagesCount={unread} />
      </div>
    </>
  );
}
