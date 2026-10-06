import type { PlanView, SectionView } from '@/lib/content';
import { Container, SectionHeading } from './Hud';
import { Fill } from './Text';

export function Plans({ section, plans }: { section: SectionView; plans: PlanView[] }) {
  return (
    <section id="planos" className="scroll-mt-16 py-[80px] lg:py-[75px]">
      <Container>
        <SectionHeading label={section.label} line1={section.titleLine1} line2={section.titleLine2} intro={section.intro} />
        <ol className="mt-[60px] lg:mt-[110px]">
          {plans.map((p, i) => {
            const price = p.onRequest ? 'sob consulta' : p.price || '[PREENCHER: valor ou "sob consulta"]';
            return (
              <li
                key={p.id}
                className="grid grid-cols-[1fr] gap-y-3 border-b border-linha py-10 last:border-b-0 md:grid-cols-[36px_1fr_minmax(0,280px)] md:gap-x-6 md:py-12 lg:grid-cols-[36px_minmax(0,430px)_1fr_minmax(0,320px)] lg:py-[58px]"
              >
                <span className="font-display text-[14px] font-medium text-brasa md:pt-1">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display text-[28px] font-medium leading-[1.1] tracking-[-0.01em] md:text-[32px] lg:text-[36px]">
                  <Fill text={p.name} />
                </h3>
                <p className="max-w-[300px] text-[18px] leading-[1.3] text-fumaca md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1 lg:text-[16px]">
                  <Fill text={p.description} />
                </p>
                <p className="font-display text-[28px] font-medium leading-[1.1] text-brasa md:col-start-3 md:row-start-1 md:text-right md:text-[32px] lg:col-start-4 lg:text-[36px]">
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
