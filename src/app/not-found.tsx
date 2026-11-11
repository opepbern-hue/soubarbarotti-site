import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeading } from '@/components/site/Hud';
import { SiteChrome } from '@/components/site/SiteChrome';

export const metadata: Metadata = { title: 'Página não encontrada', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="flex min-h-[70svh] flex-col items-center justify-center px-5 pb-[60px] pt-[150px] text-center">
        <SectionHeading as="h1" label="Erro 404" line1="cena" line2="não encontrada" align="center" />
        <p className="mt-6 max-w-[330px] text-[16px] leading-[1.35] text-fumaca">Essa página não existe ou mudou de lugar. Volte para o início ou use o menu.</p>
        <Link href="/" className="mt-8 inline-flex h-10 items-center rounded-full bg-brasa px-6 font-display text-[13px] font-semibold uppercase text-white">
          Voltar ao início
        </Link>
      </section>
    </SiteChrome>
  );
}
