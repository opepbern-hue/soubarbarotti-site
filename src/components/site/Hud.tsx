import type { ReactNode } from 'react';
import { ScrollReveal, SplitText } from './ScrollReveal';

/** Kicker técnico de seção no estilo Simplon Norm da Paragon (16px desktop / 14.125px mobile, uppercase) */
export function RecLabel({ children, className = '' }: { children: string; className?: string }) {
  const clean = children
    .replace(/^●?\s*REC:\s*/i, '')
    .replace(/^\[|\]$/g, '')
    .trim();
  if (!clean) return null;
  return (
    <p className={`text-paragon-kicker flex items-center gap-2 ${className}`}>
      <ScrollReveal as="span">
        <SplitText text={clean} speed="fast" mode="words" />
      </ScrollReveal>
    </p>
  );
}

/** Cabeçalho de seção na escala monumental da Paragon (Review Condensed / Barlow Condensed) */
export function SectionHeading({
  label,
  line1,
  line2,
  intro,
  align = 'left',
  as: Tag = 'h2',
  size = 'section',
  className = '',
}: {
  label?: string;
  line1: string;
  line2?: string;
  intro?: string;
  align?: 'left' | 'center' | 'tablet-center';
  as?: 'h1' | 'h2';
  size?: 'section' | 'page';
  className?: string;
}) {
  const center = align === 'center';
  const tab = align === 'tablet-center';
  const sizes = size === 'page' ? 'text-paragon-display' : 'text-paragon-h1';

  return (
    <div
      className={`${center ? 'flex flex-col items-center text-center' : ''} ${
        tab ? 'md:text-center lg:text-left' : ''
      } ${className}`}
    >
      {label ? (
        <div className="mb-4">
          <RecLabel className={center ? 'justify-center' : tab ? 'md:justify-center lg:justify-start' : ''}>
            {label}
          </RecLabel>
        </div>
      ) : null}
      <Tag className={`${sizes}`}>
        <ScrollReveal as="span" delay={40}>
          <span className="block">
            <SplitText text={line1} speed="slow" mode="words" delay={0} />
          </span>
          {line2 ? (
            <span className="block">
              <SplitText text={line2} speed="slow" mode="words" delay={90} />
            </span>
          ) : null}
        </ScrollReveal>
      </Tag>
      {intro ? (
        <ScrollReveal as="div" delay={140}>
          <p
            className={`text-paragon-body mt-6 max-w-[380px] opacity-80 ${
              center ? 'mx-auto' : tab ? 'md:mx-auto lg:mx-0' : ''
            }`}
          >
            <SplitText text={intro} speed="fast" mode="words" delay={80} />
          </p>
        </ScrollReveal>
      ) : null}
    </div>
  );
}

/** Texto com efeito de slide vertical da Paragon ([data-button-animate-chars]) */
export function RollText({ text }: { text: string }) {
  return (
    <span data-button-animate-chars>
      <span>{text}</span>
    </span>
  );
}

/** Container principal alinhado ao grid da Paragon (--site-margin: 48px desktop / 18px mobile) */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`paragon-container ${className}`}>{children}</div>;
}

/** Cantos arquitetônicos discretos (mantido para compatibilidade) */
export function Viewfinder({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute inset-0 border border-current/20 ${className}`} />
  );
}
