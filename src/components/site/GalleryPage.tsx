import { notFound } from 'next/navigation';
import { getPhotos, getSections, type GalleryCollection } from '@/lib/content';
import { Container, SectionHeading } from './Hud';
import { IFSCActivitiesSection } from './IFSCActivitiesSection';
import { PhotoGallery } from './PhotoGallery';

const CONFIG: Record<
  GalleryCollection,
  { key: string; path: string; noun: 'foto' | 'arte'; label: string; line1: string; empty: string }
> = {
  FOTO: {
    key: 'pagina_fotos',
    path: '/fotos',
    noun: 'foto',
    label: 'Acervo Fotográfico',
    line1: 'As fotos',
    empty: 'Nenhuma fotografia publicada no momento.',
  },
  ARTE: {
    key: 'pagina_artes',
    path: '/artes',
    noun: 'arte',
    label: 'Direção de Arte',
    line1: 'As artes',
    empty: 'Nenhuma arte publicada no momento.',
  },
};

/** Página pública de galeria (Fotos ou Artes): baixar, copiar e compartilhar o link */
export async function GalleryPage({ collection }: { collection: GalleryCollection }) {
  const c = CONFIG[collection];
  const [items, sections] = await Promise.all([getPhotos(collection), getSections()]);
  const head = sections[c.key];

  // Sempre exibe a galeria se houver itens ou se for Fotos/Artes
  const realItems = items.filter((item) => item.media && !item.media.placeholder);

  return (
    <section className="bg-paragon-black pt-[124px] pb-[90px] text-paragon-white md:pt-[148px] lg:pt-[164px] lg:pb-[130px]">
      <Container>
        <div className="border-b border-paragon-white/22 pb-10 lg:pb-14">
          <SectionHeading
            as="h1"
            size="page"
            label={head?.label || c.label}
            line1={head?.titleLine1 || c.line1}
            line2={head?.titleLine2 || 'pode baixar'}
            intro={head?.intro || 'Baixe em alta resolução ou copie e cole direto onde quiser.'}
          />
        </div>

        <div className="mt-10 lg:mt-14">
          {realItems.length ? (
            <PhotoGallery photos={realItems} basePath={c.path} noun={c.noun} />
          ) : (
            <div className="border border-paragon-white/22 bg-paragon-black p-10 text-paragon-grey-400">
              <p className="text-paragon-body">{c.empty}</p>
            </div>
          )}
        </div>

        {collection === 'FOTO' && <IFSCActivitiesSection />}
      </Container>
    </section>
  );
}
