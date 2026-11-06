'use client';

import { useEffect, useState } from 'react';
import { soundEngine } from './ambient-audio';

const STORAGE_KEY = 'hasPageLoaded';

export function Preloader() {
  const [phase, setPhase] = useState<'dark' | 'light' | 'collapse' | 'done'>('dark');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('done');
      return;
    }

    const alreadyLoaded = sessionStorage.getItem(STORAGE_KEY) === 'true';
    document.body.style.overflow = 'hidden';

    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;

    if (alreadyLoaded) {
      setPhase('light');
      t2 = setTimeout(() => setPhase('collapse'), 200);
      t3 = setTimeout(() => {
        setPhase('done');
        document.body.style.overflow = '';
      }, 850);
    } else {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      t1 = setTimeout(() => setPhase('light'), 950);
      t2 = setTimeout(() => {
        setPhase('collapse');
        soundEngine?.playSubtleAreaSfx();
      }, 1450);
      t3 = setTimeout(() => {
        setPhase('done');
        document.body.style.overflow = '';
      }, 2350);
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        setPhase('collapse');
        setTimeout(() => {
          setPhase('done');
          document.body.style.overflow = '';
        }, 650);
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);

  if (phase === 'done') return null;

  const isLight = phase === 'light' || phase === 'collapse';
  const isCollapsing = phase === 'collapse';

  return (
    <aside
      aria-label="Carregando portfólio de Barbarotti"
      onClick={() => {
        setPhase('collapse');
        setTimeout(() => {
          setPhase('done');
          document.body.style.overflow = '';
        }, 650);
      }}
      style={{
        backgroundColor: isLight ? '#f8f8f8' : '#100f0f',
        color: isLight ? '#100f0f' : '#f8f8f8',
        transform: isCollapsing ? 'scaleY(0)' : 'scaleY(1)',
        transformOrigin: 'top top',
        transition:
          'background-color 600ms cubic-bezier(0.55, 0.085, 0.68, 0.53), color 600ms cubic-bezier(0.55, 0.085, 0.68, 0.53), transform 850ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className="fixed inset-0 z-[99999] flex cursor-pointer items-center justify-center overflow-hidden select-none"
    >
      <div
        style={{
          opacity: isCollapsing ? 0 : 1,
          transform: isCollapsing ? 'translateY(-20%)' : 'translateY(0%)',
          transition: 'opacity 450ms ease, transform 500ms cubic-bezier(0.55, 0.085, 0.68, 0.53)',
        }}
        className="flex flex-col items-center gap-3 px-6 text-center"
      >
        <div className="flex items-center border border-current">
          <span className="bg-paragon-blue px-3 py-1.5 font-display text-[20px] font-bold tracking-tight text-paragon-black uppercase">
            SB
          </span>
          <span className="px-4 py-1.5 font-kicker text-[13px] tracking-[0.04em] uppercase">
            SOUBARBAROTTI // DIREÇÃO &amp; IA
          </span>
        </div>
        <p className="font-display text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.92] font-medium uppercase">
          SOUBARBAROTTI
        </p>
      </div>
    </aside>
  );
}
