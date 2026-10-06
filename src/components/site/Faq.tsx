import type { FaqView, SectionView } from '@/lib/content';
import { Container, SectionHeading } from './Hud';
import { Fill, Paragraphs } from './Text';

export function Faq({ section, faqs }: { section: SectionView; faqs: FaqView[] }) {
  if (!faqs.length) return null;
  return (
    <section id="perguntas" className="scroll-mt-16 bg-amanhecer py-[80px] lg:py-[140px]">
      <Container className="grid gap-[50px] lg:grid-cols-2 lg:gap-[60px]">
        <SectionHeading
          label={section.label}
          line1={section.titleLine1}
          line2={section.titleLine2}
          intro={section.intro}
          align="tablet-center"
        />
        <div>
          {faqs.map((f) => (
            <details key={f.id} name="perguntas" className="group border-b border-linha">
              <summary className="flex cursor-pointer items-start justify-between gap-6 py-6 text-[18px] leading-[1.3] transition-colors hover:text-brasa lg:py-[30px]">
                <span>
                  <Fill text={f.question} />
                </span>
                <span aria-hidden className="faq-icon relative mt-0.5 size-6 flex-none rounded-full bg-nevoa text-carvao ring-1 ring-linha" />
              </summary>
              <div className="flex flex-col gap-3 pb-7 pr-10 text-[16px] leading-[1.45] text-fumaca">
                <Paragraphs text={f.answer || '[PREENCHER: sua resposta]'} />
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
