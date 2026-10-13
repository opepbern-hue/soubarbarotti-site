import { GalleryAdmin } from '@/components/admin/GalleryAdmin';
import { okMessage } from '@/lib/admin-data';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminArtes({ searchParams }: Props) {
  return <GalleryAdmin collection="ARTE" ok={await okMessage(searchParams)} />;
}
