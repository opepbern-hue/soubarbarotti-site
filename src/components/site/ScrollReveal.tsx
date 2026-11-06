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
      { threshold: 0.05, rootMargin: '80px 0px 0px 0px' },
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

// Timings baseados no SplitText da Paragon: duration 600ms, ease power4.out (cubic-bezier(0.16, 1, 0.3, 1)), stagger ~100ms total
const SPEED_CONFIGS: Record<SplitSpeed, { stagger: number; duration: number; mode: 'chars' | 'words' }> = {
  hero: { stagger: 22, duration: 650, mode: 'chars' },
  slow: { stagger: 28, duration: 600, mode: 'words' },
  medium: { stagger: 18, duration: 600, mode: 'words' },
  fast: { stagger: 16, duration: 550, mode: 'words' },
};

/**
 * Revelação de texto com máscara por linha/palavra no estilo SplitText da Paragon:
 * padding-block: 0.125em; margin-block: -0.125em; overflow: clip;
 * translateY(110% -> 0%), duration: 0.6s, ease: cubic-bezier(0.16, 1, 0.3, 1).
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

  const parts = text.split(/(\s+)/);
  let charCounter = 0;
  let wordCounter = 0;

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^\s+$/.test(part)) return ' ';
        if (splitMode === 'words') {
          const d = delay + Math.min(wordCounter++ * staggerStep, 180);
          return (
            <span key={i} className="line-mask">
              <span
                className="split-char"
                style={{ '--delay': `${d}ms`, '--duration': `${animDuration}ms` } as React.CSSProperties}
              >
                {part}
              </span>
            </span>
          );
        }
        return (
          <span key={i} className="inline-block whitespace-nowrap">
            {[...part].map((ch, charIndex) => {
              const idx = charCounter++;
              const d = delay + Math.min(idx * staggerStep, 220);
              return (
                <span key={charIndex} className="char-mask">
                  <span
                    className="split-char"
                    style={{ '--delay': `${d}ms`, '--duration': `${animDuration}ms` } as React.CSSProperties}
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
