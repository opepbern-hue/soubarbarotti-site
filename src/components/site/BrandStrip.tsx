import type { Brand } from '@/lib/content';

const SKILLS = [
  'VÍDEOS COM IA',
  'DIREÇÃO CINEMATOGRÁFICA',
  'MOTION DESIGNER',
  'VFX & ANIMAÇÃO',
  'COPY DE ALTA CONVERSÃO',
  'COLOR GRADE 4K',
  'ESTRATÉGIA AUDIOVISUAL',
  'STORYBOARD & ROTEIRO',
];

export function BrandStrip({ brands }: { brands?: Brand[] }) {
  const items = SKILLS;
  // Repete para marquee contínuo e suave
  const seq = [...items, ...items, ...items];

  const list = (dup: boolean) => (
    <ul data-dup={dup ? '' : undefined} aria-hidden={dup || undefined} className="flex shrink-0 items-center">
      {seq.map((text, i) => {
        const repeated = !dup && i >= items.length;
        return (
          <li
            key={`${text}-${i}`}
            aria-hidden={repeated || undefined}
            data-dup={repeated ? '' : undefined}
            className="flex items-center gap-3.5 px-6 font-display text-[15px] font-semibold uppercase tracking-[0.08em] text-white/85 transition-colors hover:text-white md:px-10 md:text-[16px]"
          >
            <span aria-hidden className="inline-block size-1.5 rotate-45 bg-zinc-400/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            <span className="whitespace-nowrap">
              {text}
            </span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section aria-label="Especialidades e Direção" className="marquee-host overflow-hidden border-y border-white/10 bg-[#0c0c0e] py-[22px] shadow-2xl relative">
      {/* Textura sutil de fundo preto profundo */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(to_right,#000_0%,transparent_15%,transparent_85%,#000_100%)] z-10" />
      <div className="marquee" style={{ ['--marquee-duration' as string]: '32s' }}>
        {list(false)}
        {list(true)}
      </div>
    </section>
  );
}
