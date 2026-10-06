import { notFound } from 'next/navigation';
import { getPhotos, getSections, type GalleryCollection } from '@/lib/content';
import { Container, SectionHeading } from './Hud';
import { PhotoGallery } from './PhotoGallery';
import { IFSCActivitiesSection } from './IFSCActivitiesSection';

const CONFIG: Record<GalleryCollection, { key: string; path: string; noun: 'foto' | 'arte'; label: string; line1: string; empty: string }> = {
  FOTO: { key: 'pagina_fotos', path: '/fotos', noun: 'foto', label: 'REC: Fotos', line1: 'as fotos', empty: '[PREENCHER: suba as fotos no admin, em Fotos]' },
  ARTE: { key: 'pagina_artes', path: '/artes', noun: 'arte', label: 'REC: Artes', line1: 'as artes', empty: '[PREENCHER: suba as artes no admin, em Artes]' },
};

/** Página pública de galeria (Fotos ou Artes): baixar, copiar e compartilhar o link */
export async function GalleryPage({ collection }: { collection: GalleryCollection }) {
  const c = CONFIG[collection];
  const [items, sections] = await Promise.all([getPhotos(collection), getSections()]);
  const head = sections[c.key];
  if (head && !head.enabled) notFound();
  return (
    <section className="pb-[90px] pt-[130px] md:pt-[170px] lg:pb-[130px] lg:pt-[190px]">
      <Container>
        <SectionHeading
          as="h1"
          size="page"
          label={head?.label || c.label}
          line1={head?.titleLine1 || c.line1}
          line2={head?.titleLine2 || 'pode baixar'}
          intro={head?.intro || 'Baixe em alta ou copie e cole direto onde quiser.'}
        />
        <div className="mt-[60px] md:mt-[90px]">
          {items.length ? (
            <PhotoGallery photos={items} basePath={c.path} noun={c.noun} />
          ) : (
            <p className="text-fumaca">
              <mark className="preencher">{c.empty}</mark>
            </p>
          )}
        </div>

        {collection === 'FOTO' && <IFSCActivitiesSection />}
      </Container>
    </section>
  );
}
