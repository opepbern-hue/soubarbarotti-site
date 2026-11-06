import type { Metadata } from 'next';
import { Contact } from '@/components/site/Contact';
import { PortfolioGrid } from '@/components/site/PortfolioGrid';
import { getProjects, getSections, getSettings } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Portfólio: vídeos com IA que eu dirigi',
  description:
    'Vídeos com IA generativa que eu dirigi para corretores de imóveis, marcas e projetos autorais. Assista a cada um.',
  alternates: { canonical: '/portfolio' },
};

export default async function PortfolioPage() {
  const [projects, sections, settings] = await Promise.all([getProjects(false), getSections(), getSettings()]);
  const head = sections['pagina_trabalhos'];
  const contact = sections['contato'];

  return (
    <>
      {projects.length ? (
        <PortfolioGrid
          projects={projects}
          headingLine1={head?.titleLine1 || 'Os filmes'}
          headingLine2={head?.titleLine2 || 'que eu dirigi'}
          intro={
            head?.intro ||
            'Projetos comerciais e filmes dirigidos com direção cinematográfica, IA generativa e pós-produção de alto padrão.'
          }
        />
      ) : (
        <section className="bg-paragon-black pt-36 pb-24 text-paragon-white">
          <div className="paragon-container">
            <p className="text-paragon-body text-paragon-grey-400">
              Nenhum projeto publicado no momento. Em breve novos trabalhos estarão disponíveis.
            </p>
          </div>
        </section>
      )}
      {contact && contact.enabled ? <Contact section={contact} settings={settings} /> : null}
    </>
  );
}
