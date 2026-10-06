import type { Metadata } from 'next';
import { GalleryPage } from '@/components/site/GalleryPage';

export const metadata: Metadata = {
  title: 'Artes',
  description: 'Artes do @soubarbarotti em alta resolução. Pode baixar e copiar.',
  alternates: { canonical: '/artes' },
};

export default function ArtesPage() {
  return <GalleryPage collection="ARTE" />;
}
