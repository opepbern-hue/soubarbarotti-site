// Confere o tipo real do arquivo pelos primeiros bytes (não confia na extensão)
import fsp from 'node:fs/promises';

export type Sniffed = { kind: 'IMAGE' | 'VIDEO'; type: string } | { kind: null; reason: string };

export async function sniffFile(file: string): Promise<Sniffed> {
  const fh = await fsp.open(file, 'r');
  const buf = Buffer.alloc(32);
  await fh.read(buf, 0, 32, 0);
  await fh.close();
  const ascii = (a: number, b: number) => buf.subarray(a, b).toString('latin1');

  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { kind: 'IMAGE', type: 'image/jpeg' };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { kind: 'IMAGE', type: 'image/png' };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { kind: 'IMAGE', type: 'image/webp' };
  if (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a') return { kind: 'IMAGE', type: 'image/gif' };
  if (ascii(4, 8) === 'ftyp') {
    const brand = ascii(8, 12);
    if (brand === 'avif' || brand === 'avis') return { kind: 'IMAGE', type: 'image/avif' };
    if (['heic', 'heix', 'mif1', 'msf1', 'hevc'].includes(brand)) {
      return { kind: null, reason: 'Foto HEIC (iPhone) ainda não é aceita. Exporte como JPG ou PNG e envie de novo.' };
    }
    return { kind: 'VIDEO', type: brand.startsWith('qt') ? 'video/quicktime' : 'video/mp4' };
  }
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return { kind: 'VIDEO', type: 'video/webm' };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 11) === 'AVI') return { kind: 'VIDEO', type: 'video/x-msvideo' };
  return { kind: null, reason: 'Formato não reconhecido. Envie JPG, PNG, WebP, MP4, MOV ou WebM.' };
}
