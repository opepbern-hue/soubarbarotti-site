import type { ReactNode } from 'react';
import { SiteChrome } from '@/components/site/SiteChrome';

// As páginas leem o banco a cada visita (com cache); nada depende do banco na hora do build
export const dynamic = 'force-dynamic';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
