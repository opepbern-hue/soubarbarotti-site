'use client';

import { useRef, useState } from 'react';
import type { SectionView, TestimonialView } from '@/lib/content';
import { Container, SectionHeading } from './Hud';
import { Picture } from './Picture';
import { Fill } from './Text';

/** Só aparece quando há depoimento real, confirmado e publicado no admin. */
export function Testimonials({ section, items }: { section: SectionView; items: TestimonialView[] }) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  if (!items.length) return null;
  const t = items[Math.min(index, items.length - 1)];
  const go = (d: number) => setIndex((i) => (i + d + items.length) % items.length);

  return (
    <section id="depoimentos" className="scroll-mt-16 py-[80px] lg:py-[75px]">
      <Container>
        <SectionHeading label={section.label} line1={section.titleLine1} line2={section.titleLine2} intro={section.intro} />
        <div
          className="mt-[50px] flex flex-col items-center bg-nevoa px-5 py-16 text-center md:px-16 lg:mt-[60px] lg:py-[120px]"
          onPointerDown={(e) => (startX.current = e.clientX)}
          onPointerUp={(e) => {
            if (startX.current === null) return;
            const dx = e.clientX - startX.current;
            startX.current = null;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          }}
        >
          <p className="font-display text-[12px] font-medium uppercase tracking-[0.08em] text-brasa" aria-live="polite">
            Depoimento {String(index + 1).padStart(2, '0')}/{String(items.length).padStart(2, '0')}
          </p>
          <blockquote className="mt-6 max-w-[600px] font-display text-[18px] uppercase leading-[1.4] tracking-[0.05em] md:text-[20px]">
            “<Fill text={t.quote} />”
          </blockquote>
          <p className="mt-8 font-display text-[16px] tracking-[0.01em] text-carvao">
            <Fill text={t.authorName} />
          </p>
          {t.authorRole || t.company ? (
            <p className="mt-1 font-display text-[14px] uppercase text-fumaca">
              <Fill text={[t.authorRole, t.company].filter(Boolean).join(', ')} />
            </p>
          ) : null}
          {items.length > 1 ? (
            <div className="mt-8 flex items-center gap-3" role="group" aria-label="Escolher depoimento">
              {items.map((it, i) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Depoimento de ${it.authorName}`}
                  aria-current={i === index ? 'true' : undefined}
                  className={`relative overflow-hidden rounded-full bg-linha transition-all duration-300 ${
                    i === index ? 'size-[60px]' : 'size-10 opacity-60 grayscale hover:opacity-100'
                  }`}
                >
                  {it.avatar ? (
                    <Picture media={it.avatar} alt="" sizes="60px" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-[14px] font-semibold text-fumaca">{it.authorName.slice(0, 1)}</span>
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
