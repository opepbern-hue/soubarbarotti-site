import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function PainelLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr]">
      <AdminNav />
      <main className="min-w-0 px-4 pb-24 pt-6 md:px-8 lg:px-12 lg:pt-10">{children}</main>
    </div>
  );
}
