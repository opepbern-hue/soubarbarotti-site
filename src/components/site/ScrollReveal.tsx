'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  as: Component = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'span' | 'p' | 'section' | 'li';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref as any}
      style={{ '--delay': `${delay}ms` } as React.CSSProperties}
      className={`reveal-box ${revealed ? 'is-revealed' : ''} ${className}`}
    >
      {children}
    </Component>
  );
}


export type SplitSpeed = 'hero' | 'slow' | 'medium' | 'fast';

const SPEED_CONFIGS: Record<SplitSpeed, { stagger: number; duration: number; mode: 'chars' | 'words' }> = {
  hero: { stagger: 25, duration: 800, mode: 'chars' },
  slow: { stagger: 35, duration: 750, mode: 'chars' },
  medium: { stagger: 20, duration: 650, mode: 'chars' },
  fast: { stagger: 30, duration: 550, mode: 'words' },
};

/**
 * Divisão de texto no estilo AnimeJS (splitText).
 * Recorta cada caractere/palavra em máscara `overflow: hidden`,
 * aplica animação de subida (`translateY(115% -> 0%)`) e desfoque (`filter: blur(12px -> 0px)`).
 * Revela uma única vez ao rolar a tela ("SEM OUT").
 */
export function SplitText({
  text,
  speed = 'medium',
  mode,
  delay = 0,
  stagger,
  duration,
  className = '',
}: {
  text: string;
  speed?: SplitSpeed;
  mode?: 'chars' | 'words';
  delay?: number;
  stagger?: number;
  duration?: number;
  className?: string;
}) {
  const config = SPEED_CONFIGS[speed];
  const splitMode = mode || config.mode;
  const staggerStep = stagger ?? config.stagger;
  const animDuration = duration ?? config.duration;

  // Palavras separadas por espaços de verdade: o texto quebra linha normalmente,
  // inclusive quando vem em pedaços (ex.: trecho em destaque no meio da frase)
  const parts = text.split(/(\s+)/);
  let charCounter = 0;
  let wordCounter = 0;

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^\s+$/.test(part)) return ' ';
        if (splitMode === 'words') {
          const d = delay + wordCounter++ * staggerStep;
          return (
            <span key={i} className="split-char-mask">
              <span className="split-char" style={{ '--delay': `${d}ms`, '--duration': `${animDuration}ms` } as React.CSSProperties}>
                {part}
              </span>
            </span>
          );
        }
        return (
          <span key={i} className="inline-block whitespace-nowrap">
            {[...part].map((ch, charIndex) => {
              const idx = charCounter++;
              return (
                <span key={charIndex} className="split-char-mask">
                  <span
                    className="split-char"
                    style={{ '--delay': `${delay + idx * staggerStep}ms`, '--duration': `${animDuration}ms` } as React.CSSProperties}
                  >
                    {ch}
                  </span>
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

/** Componente auxiliar simples mantido para compatibilidade */
export function MaskLineReveal({
  text,
  delay = 0,
  className = '',
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  return <SplitText text={text} speed="slow" mode="words" delay={delay} className={className} />;
}
