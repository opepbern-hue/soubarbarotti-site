'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollReveal, SplitText } from './ScrollReveal';
import { prefersReducedMotion } from './video-coordinator';

type Token = { type: 'text'; text: string; strong: boolean } | { type: 'count'; value: number };

/** `**trecho**` vira destaque em Coral Red (#ff5b4b) · `{{120}}` vira contador que sobe ao entrar na tela */
function tokenize(src: string): Token[] {
  const out: Token[] = [];
  for (const chunk of src.split(/(\*\*[^*]+\*\*)/g)) {
    const m = chunk.match(/^\*\*([^*]+)\*\*$/);
    const strong = !!m;
    const body = m ? m[1] : chunk;
    for (const piece of body.split(/(\{\{\s*[\d.,]+\s*\}\})/g)) {
      const c = piece.match(/^\{\{\s*([\d.,]+)\s*\}\}$/);
      if (c) out.push({ type: 'count', value: Number(c[1].replace(/\./g, '').replace(',', '.')) || 0 });
      else if (piece) out.push({ type: 'text', text: piece, strong });
    }
  }
  return out;
}

export function NumbersPhrase({ text }: { text: string }) {
  const lines = text.split('\n');
  const hasCounters = lines.some((l) => tokenize(l).some((t) => t.type === 'count'));
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasCounters || prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    setProgress(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1600);
          setProgress(1 - Math.pow(1 - t, 3));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [hasCounters]);

  return (
    <div className="grid grid-cols-1 items-start gap-8 border-b border-paragon-black pb-12 lg:grid-cols-12 lg:pb-16">
      <div className="lg:col-span-3">
        <span className="text-paragon-kicker inline-flex items-center gap-2 text-paragon-black">
          <span aria-hidden="true" className="text-paragon-red">
            ✦
          </span>
          <span>O que eu faço</span>
        </span>
      </div>

      <div className="lg:col-span-9">
        <ScrollReveal delay={60}>
          <p
            ref={ref}
            className="font-display text-[clamp(2.35rem,4.6vw,4.5rem)] leading-[0.98] font-medium tracking-normal text-paragon-black uppercase"
          >
            {lines.map((line, lineIdx) => {
              const tokens = tokenize(line);
              return (
                <span key={lineIdx} className="block">
                  {tokens.map((t, i) =>
                    t.type === 'count' ? (
                      <span key={i} className="font-semibold text-paragon-red tabular-nums">
                        {Math.round(t.value * progress).toLocaleString('pt-BR')}
                      </span>
                    ) : t.strong ? (
                      <span key={i} className="text-paragon-red">
                        <SplitText text={t.text} speed="slow" mode="words" delay={(lineIdx * 4 + i) * 30} />
                      </span>
                    ) : (
                      <SplitText key={i} text={t.text} speed="slow" mode="words" delay={(lineIdx * 4 + i) * 30} />
                    ),
                  )}
                </span>
              );
            })}
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}
