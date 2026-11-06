'use client';

import { useRef, useState } from 'react';
import type { SectionView, TestimonialView } from '@/lib/content';
import { Container, SectionHeading } from './Hud';
import { Picture } from './Picture';
import { Fill } from './Text';

/** Só aparece quando há depoimento real, confirmado e publicado no admin (estilo section.testimonial_wrap da Paragon). */
export function Testimonials({ section, items }: { section: SectionView; items: TestimonialView[] }) {
  const valid = items.filter((it) => it.quote && !it.quote.includes('[PREENCHER'));
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);

  if (!valid.length) return null;

  const go = (d: number) => setIndex((i) => (i + d + valid.length) % valid.length);

  return (
    <section
      id="depoimentos"
      className="testimonial_wrap scroll-mt-16 border-t border-paragon-black bg-paragon-red py-[80px] text-paragon-black lg:py-[120px]"
    >
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            label={section.label || 'DEPOIMENTOS'}
            line1={section.titleLine1 || 'Depoimentos'}
            line2={section.titleLine2}
            intro={section.intro}
          />

          {valid.length > 1 ? (
            <div className="flex items-center" role="group" aria-label="Controles de depoimentos">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Depoimento anterior"
                className="grid size-12 place-items-center border border-paragon-black bg-paragon-white text-paragon-black transition-colors hover:bg-paragon-grey-300"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Próximo depoimento"
                className="-ml-px grid size-12 place-items-center border border-paragon-black bg-paragon-white text-paragon-black transition-colors hover:bg-paragon-grey-300"
              >
                →
              </button>
            </div>
          ) : null}
        </div>

        <div
          className="mt-10 grid grid-cols-1 border-t border-l border-paragon-black lg:mt-14 lg:grid-cols-3"
          onPointerDown={(e) => (startX.current = e.clientX)}
          onPointerUp={(e) => {
            if (startX.current === null) return;
            const dx = e.clientX - startX.current;
            startX.current = null;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          }}
        >
          {valid.slice(index, index + 3).map((t, idx) => (
            <article
              key={t.id}
              className="testimonial_card flex min-h-[340px] flex-col justify-between border-r border-b border-paragon-black bg-paragon-white p-7 text-paragon-black lg:p-9"
            >
              <div>
                <span className="font-kicker text-[12px] text-paragon-grey-500 uppercase">
                  [{String(index + idx + 1).padStart(2, '0')}]
                </span>
                <blockquote className="text-paragon-body mt-4 text-paragon-black">
                  “<Fill text={t.quote} />”
                </blockquote>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-paragon-black/15 pt-4">
                {t.avatar && !t.avatar.placeholder ? (
                  <div className="relative size-11 shrink-0 overflow-hidden border border-paragon-black">
                    <Picture
                      media={t.avatar}
                      alt=""
                      sizes="44px"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div>
                  <p className="font-kicker text-[14px] font-medium text-paragon-black uppercase">
                    <Fill text={t.authorName} />
                  </p>
                  {t.authorRole || t.company ? (
                    <p className="font-sans text-[12px] text-paragon-grey-500">
                      <Fill text={[t.authorRole, t.company].filter(Boolean).join(', ')} />
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
