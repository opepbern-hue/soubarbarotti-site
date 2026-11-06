import type { FaqView, SectionView } from '@/lib/content';
import { Container, SectionHeading } from './Hud';
import { Fill, Paragraphs } from './Text';

export function Faq({ section, faqs }: { section: SectionView; faqs: FaqView[] }) {
  const valid = faqs.filter(
    (f) => f.question && !f.question.includes('[PREENCHER') && f.answer && !f.answer.includes('[PREENCHER'),
  );
  if (!valid.length) return null;

  return (
    <section
      id="perguntas"
      aria-label="Perguntas frequentes"
      className="relative scroll-mt-16 border-t border-paragon-black bg-paragon-grey-300 py-[80px] text-paragon-black lg:py-[130px]"
    >
      <span id="faq" className="absolute -top-16" aria-hidden="true" />
      <Container>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:sticky lg:top-28 lg:col-span-5">
            <SectionHeading
              label={section.label || '06 — DÚVIDAS'}
              line1={section.titleLine1 || 'Perguntas'}
              line2={section.titleLine2 || 'Frequentes'}
              intro={section.intro}
            />
          </div>

          <div className="border-t border-x border-paragon-black bg-paragon-white lg:col-span-7">
            {valid.map((f, idx) => (
              <details
                key={f.id}
                name="perguntas"
                className="group border-b border-paragon-black transition-colors open:bg-paragon-grey-100/60"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-paragon-black transition-colors hover:bg-paragon-grey-100 lg:p-7">
                  <div className="flex items-baseline gap-4">
                    <span className="font-kicker text-[13px] text-paragon-grey-500">
                      [{String(idx + 1).padStart(2, '0')}]
                    </span>
                    <span className="text-paragon-h5 text-paragon-black">
                      <Fill text={f.question} />
                    </span>
                  </div>
                  <span
                    aria-hidden
                    className="faq-icon relative size-9 flex-none border border-paragon-black bg-paragon-blue text-paragon-black transition-colors group-open:bg-paragon-red"
                  />
                </summary>
                <div className="flex flex-col gap-3 border-t border-paragon-black/15 px-5 pt-4 pb-6 text-paragon-body text-paragon-black/85 lg:px-7 lg:pb-8 lg:pl-[68px]">
                  <Paragraphs text={f.answer} />
                </div>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
