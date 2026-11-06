import type { Metadata } from 'next';
import Link from 'next/link';
import { RollText, SectionHeading } from '@/components/site/Hud';
import { SiteChrome } from '@/components/site/SiteChrome';

export const metadata: Metadata = { title: 'Página não encontrada', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="flex min-h-[82svh] flex-col items-center justify-center bg-paragon-black px-[var(--site-margin)] pt-[130px] pb-[80px] text-center text-paragon-white">
        <SectionHeading
          as="h1"
          size="page"
          label="ERRO 404"
          line1="Cena não"
          line2="encontrada"
          align="center"
        />
        <p className="text-paragon-body mt-6 max-w-[380px] text-paragon-grey-400">
          Essa página não existe ou mudou de lugar. Volte para o início ou acesse o portfólio completo.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="u-button u-button--red">
            <RollText text="Voltar ao início" />
          </Link>
          <Link href="/portfolio" className="u-button u-button--dark">
            <RollText text="Ver portfólio" />
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
