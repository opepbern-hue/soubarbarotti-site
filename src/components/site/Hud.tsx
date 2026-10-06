import type { ReactNode } from 'react';
import { ScrollReveal, SplitText } from './ScrollReveal';
import { Fill } from './Text';

/** Selo "● REC: …" */
export function RecLabel({ children, className = '' }: { children: string; className?: string }) {
  return (
    <p className={`flex items-center gap-2.5 font-display text-[14px] leading-[1.3] font-medium uppercase ${className}`}>
      <span className="rec-dot" aria-hidden />
      {/* Revela sozinho quando aparece na tela (também fora de um SectionHeading) */}
      <ScrollReveal as="span">
        <SplitText text={children} speed="medium" mode="chars" />
      </ScrollReveal>
    </p>
  );
}

/** Título de seção em duas linhas com SplitText e Blur no estilo AnimeJS */
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
  const sizes =
    size === 'page'
      ? 'text-[51px] leading-[0.9] tracking-[-0.03em] font-medium md:text-[64px] lg:text-[80px]'
      : 'text-[48px] leading-none tracking-[-0.04em] font-semibold lg:text-[56px]';
  return (
    <div className={`${center ? 'flex flex-col items-center text-center' : ''} ${tab ? 'md:text-center lg:text-left' : ''} ${className}`}>
      {label ? (
        <ScrollReveal as="span" delay={0}>
          <RecLabel className={center ? 'justify-center' : tab ? 'md:justify-center lg:justify-start' : ''}>{label}</RecLabel>
        </ScrollReveal>
      ) : null}
      <Tag className={`font-display ${sizes} ${label ? 'mt-[30px]' : ''}`}>
        <ScrollReveal as="span" delay={60}>
          <span className="block">
            <SplitText text={line1} speed="slow" mode="chars" delay={0} />
          </span>
          {line2 ? (
            <span className="block text-fumaca mt-1">
              <SplitText text={line2} speed="slow" mode="chars" delay={150} />
            </span>
          ) : null}
        </ScrollReveal>
      </Tag>
      {intro ? (
        <ScrollReveal as="div" delay={180}>
          <p className={`mt-[30px] max-w-[320px] text-[16px] leading-[1.3] text-fumaca ${center ? 'mx-auto' : tab ? 'md:mx-auto lg:mx-0' : ''}`}>
            <SplitText text={intro} speed="fast" mode="words" delay={100} />
          </p>
        </ScrollReveal>
      ) : null}
    </div>
  );
}




/** Texto com letras que rolam no hover (acessível: o texto real vai no aria-label do link/botão) */
export function RollText({ text }: { text: string }) {
  return (
    <span className="roll" aria-hidden>
      {[...text].map((ch, i) => {
        const c = ch === ' ' ? ' ' : ch;
        return (
          <span key={i} className="roll-ch" style={{ ['--i' as string]: i }}>
            <span>{c}</span>
            <span>{c}</span>
          </span>
        );
      })}
    </span>
  );
}

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 lg:px-[100px] ${className}`}>{children}</div>;
}

/** Cantos de visor */
export function Viewfinder({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`viewfinder pointer-events-none absolute ${className}`}>
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
