'use client';

import { useEffect, useState } from 'react';
import { soundEngine } from './ambient-audio';

// Palavras que emergem do chão de forma sequencial e elegante
const WORDS = [
  { text: 'SOU', highlight: false, delay: 60 },
  { text: 'BARBAROTTI', highlight: true, delay: 220 },
];

export function Preloader() {
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Dispara a subida do chão com curva suave
    const tMount = setTimeout(() => {
      setMounted(true);
    }, 70);

    // Tempo de exibição e saída suave
    const tExit = setTimeout(() => handleExit(), 2400);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') handleExit();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearTimeout(tMount);
      clearTimeout(tExit);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);

  const handleExit = () => {
    if (exiting) return;
    setExiting(true);

    if (soundEngine) {
      soundEngine.playSubtleAreaSfx();
    }

    setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = '';
    }, 600);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Carregando portfólio de Barbarotti"
      onClick={handleExit}
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-white text-[#111114] cursor-pointer select-none transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] p-6 sm:p-10 ${
        exiting ? 'opacity-0 scale-[0.98] filter blur-lg pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center justify-center text-center px-4 w-full">
        {/* Cada palavra surge individualmente debaixo do chão com máscara de recorte */}
        <h1 className="font-display text-[16vw] sm:text-[13vw] lg:text-[11vw] font-black uppercase tracking-[-0.04em] leading-[0.9] select-none text-black flex flex-wrap items-baseline justify-center gap-x-[0.25em]">
          {WORDS.map((word) => (
            <span key={word.text} className="inline-block overflow-hidden pb-[0.08em]">
              <span
                style={{
                  willChange: 'transform, filter, opacity',
                  transform: mounted ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 115%, 0)',
                  filter: mounted ? 'blur(0px)' : 'blur(16px)',
                  opacity: mounted ? 1 : 0,
                  transition: `transform 1050ms cubic-bezier(0.16, 1, 0.3, 1) ${word.delay}ms, filter 900ms cubic-bezier(0.16, 1, 0.3, 1) ${word.delay}ms, opacity 750ms ease ${word.delay}ms`,
                }}
                className={`inline-block origin-bottom ${word.highlight ? 'text-[#ff6a00]' : 'text-black'}`}
              >
                {word.text}
              </span>
            </span>
          ))}
        </h1>
      </div>
    </aside>
  );
}

