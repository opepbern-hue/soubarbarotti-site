import type { Metadata } from 'next';
import { GalleryPage } from '@/components/site/GalleryPage';

export const metadata: Metadata = {
  title: 'Fotos para baixar',
  description: 'Fotos do @soubarbarotti em alta resolução. Pode baixar e copiar.',
  alternates: { canonical: '/fotos' },
};

export default function FotosPage() {
  return <GalleryPage collection="FOTO" />;
}
