import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function PainelLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const unread = await prisma.contactMessage.count({ where: { readAt: null, archived: false } }).catch(() => 0);
  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr]">
      <AdminNav unread={unread} />
      <main className="min-w-0 px-4 pb-24 pt-6 md:px-8 lg:px-12 lg:pt-10">{children}</main>
    </div>
  );
}
