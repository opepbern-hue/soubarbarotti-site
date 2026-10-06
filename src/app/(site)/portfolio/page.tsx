import type { Metadata } from 'next';
import { Contact } from '@/components/site/Contact';
import { Container, SectionHeading } from '@/components/site/Hud';
import { PortfolioGrid } from '@/components/site/PortfolioGrid';
import { getProjects, getSections, getSettings } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Portfólio: vídeos com IA que eu dirigi',
  description: 'Vídeos com IA generativa que eu dirigi para corretores de imóveis, marcas e projetos autorais. Assista a cada um.',
  alternates: { canonical: '/portfolio' },
};

export default async function PortfolioPage() {
  const [projects, sections, settings] = await Promise.all([getProjects(false), getSections(), getSettings()]);
  const head = sections['pagina_trabalhos'];
  const contact = sections['contato'];
  return (
    <>
      <section className="pb-[70px] pt-[130px] md:pt-[170px] lg:pb-[100px] lg:pt-[190px]">
        <Container>
          <SectionHeading
            as="h1"
            size="page"
            label={head?.label || 'REC: Portfólio'}
            line1={head?.titleLine1 || 'os filmes'}
            line2={head?.titleLine2 || 'que eu dirigi'}
            intro={head?.intro}
          />
          <div className="mt-[60px] md:mt-[90px]">
            {projects.length ? (
              <PortfolioGrid projects={projects} />
            ) : (
              <p className="text-fumaca">
                <mark className="preencher">[PREENCHER: cadastre os projetos no admin]</mark>
              </p>
            )}
          </div>
        </Container>
      </section>
      {contact && contact.enabled ? <Contact section={contact} settings={settings} /> : null}
    </>
  );
}
