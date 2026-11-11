'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollReveal, SplitText } from './ScrollReveal';
import { prefersReducedMotion } from './video-coordinator';

type Token = { type: 'text'; text: string; strong: boolean } | { type: 'count'; value: number };

/** `**trecho**` vira destaque em Brasa · `{{120}}` vira contador que sobe ao entrar na tela */
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
  // Se a frase não tiver quebras de linha explícitas (\n), aplicamos o diagrama exato da imagem de referência
  const formattedText = text.includes('\n')
    ? text
    : text.replace(
        'A IA gera as cenas. **Eu decido** o que entra, o que é refeito e como tudo vira **um filme só**.',
        'A IA gera as cenas. **Eu**\n**decido** o que entra, o que é\nrefeito e como tudo vira **um**\n**filme só.**',
      );

  const lines = formattedText.split('\n');
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
    <ScrollReveal delay={100}>
      <p
        ref={ref}
        className="font-display text-[38px] font-medium leading-[1.08] tracking-[-0.03em] md:text-[60px] md:leading-[0.98] md:tracking-[-0.04em] lg:text-[76px]"
      >
        {lines.map((line, lineIdx) => {
          const tokens = tokenize(line);
          return (
            <span key={lineIdx} className="block">
              {tokens.map((t, i) =>
                t.type === 'count' ? (
                  <span key={i} className="font-semibold tabular-nums text-brasa">
                    {Math.round(t.value * progress).toLocaleString('pt-BR')}
                  </span>
                ) : t.strong ? (
                  <span key={i} className="font-semibold text-brasa">
                    <SplitText text={t.text} speed="slow" mode="chars" delay={(lineIdx * 4 + i) * 40} />
                  </span>
                ) : (
                  <SplitText key={i} text={t.text} speed="slow" mode="chars" delay={(lineIdx * 4 + i) * 40} />
                ),
              )}
            </span>
          );
        })}
      </p>
    </ScrollReveal>
  );
}

