import type { PlanView, SectionView } from '@/lib/content';
import { Container, SectionHeading } from './Hud';
import { Fill } from './Text';

export function Plans({ section, plans }: { section: SectionView; plans: PlanView[] }) {
  const valid = plans.filter(
    (p) => p.name && !p.name.includes('[PREENCHER') && !p.description?.includes('[PREENCHER'),
  );
  if (!valid.length) return null;

  return (
    <section
      id="planos"
      className="scroll-mt-16 border-t border-paragon-black bg-paragon-white py-[80px] text-paragon-black lg:py-[120px]"
    >
      <Container>
        <SectionHeading
          label={section.label}
          line1={section.titleLine1}
          line2={section.titleLine2}
          intro={section.intro}
        />
        <ol className="mt-12 border-t border-paragon-black lg:mt-20">
          {valid.map((p, i) => {
            const price = p.onRequest ? 'Sob consulta' : p.price || 'Sob consulta';
            return (
              <li
                key={p.id}
                className="grid grid-cols-1 gap-y-3 border-b border-paragon-black py-8 md:grid-cols-[48px_1fr_minmax(0,260px)] md:gap-x-6 lg:grid-cols-[56px_minmax(0,420px)_1fr_minmax(0,280px)] lg:items-center lg:py-12"
              >
                <span className="font-kicker text-[14px] text-paragon-red">
                  [{String(i + 1).padStart(2, '0')}]
                </span>
                <h3 className="text-paragon-h3 text-paragon-black">
                  <Fill text={p.name} />
                </h3>
                <p className="text-paragon-body max-w-[360px] text-paragon-grey-500">
                  <Fill text={p.description} />
                </p>
                <p className="text-paragon-h4 text-paragon-black md:text-right">
                  <Fill text={price} />
                </p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
