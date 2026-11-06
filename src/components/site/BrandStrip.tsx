import type { Brand } from '@/lib/content';

const FALLBACK_SKILLS = [
  'VÍDEOS COM IA',
  'DIREÇÃO CINEMATOGRÁFICA',
  'MOTION DESIGN',
  'VFX & ANIMAÇÃO',
  'COPY DE ALTA CONVERSÃO',
  'COLOR GRADE 4K',
  'ESTRATÉGIA AUDIOVISUAL',
  'STORYBOARD & ROTEIRO',
];

export function BrandStrip({ brands }: { brands?: Brand[] }) {
  const cleanBrands = (brands ?? [])
    .map((b) => b.name.trim())
    .filter((name) => name && !/\[PREENCHER/i.test(name));

  const items = cleanBrands.length > 0 ? cleanBrands : FALLBACK_SKILLS;
  const seq = [...items, ...items, ...items];

  const list = (dup: boolean) => (
    <ul
      data-dup={dup ? '' : undefined}
      aria-hidden={dup || undefined}
      className="flex shrink-0 items-center"
      data-css-marquee-list
    >
      {seq.map((text, i) => {
        const repeated = !dup && i >= items.length;
        return (
          <li
            key={`${text}-${i}`}
            aria-hidden={repeated || undefined}
            data-dup={repeated ? '' : undefined}
            className="flex items-center gap-4 px-5 font-kicker text-[14px] leading-none font-normal text-paragon-black uppercase md:px-7 md:text-[15px]"
          >
            <span aria-hidden="true" className="text-paragon-red">
              ✦
            </span>
            <span className="whitespace-nowrap">{text}</span>
            <span aria-hidden="true" className="text-paragon-black/40">
              //
            </span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section
      aria-label="Marcas e clientes atendidos"
      className="marquee-host relative overflow-hidden border-y border-paragon-black bg-paragon-white py-3.5 text-paragon-black"
    >
      <div className="flex w-max items-center">
        {list(false)}
        {list(true)}
      </div>
    </section>
  );
}
