'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { soundEngine } from './ambient-audio';

// Preview rápido dos trabalhos que Barbarotti realiza
const PREVIEW_WORKS = [
  {
    tag: 'VÍDEOS COM IA',
    title: 'Porsche GT3 RS Commercial',
    image: '/previews/frame_9.jpg',
  },
  {
    tag: 'FOTORREALISMO 3D',
    title: 'Anderson Empreendimentos',
    image: '/previews/frame_0.jpg',
  },
  {
    tag: 'ALTA CONVERSÃO',
    title: 'Jéssica Fürst Imóveis',
    image: '/previews/frame_1.jpg',
  },
  {
    tag: 'MOTION & VFX',
    title: 'DaVinci 4K Color Grade',
    image: '/previews/frame_6.jpg',
  },
];

export function Preloader() {
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);
  const [activePreview, setActivePreview] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Dispara a subida do chão com blur a 60 fps imediatamente
    const tMount = setTimeout(() => {
      setMounted(true);
    }, 70);

    // Rotação sutil do preview dos trabalhos
    const previewInterval = setInterval(() => {
      setActivePreview((prev) => (prev + 1) % PREVIEW_WORKS.length);
    }, 450);

    // Tempo de exibição e saída suave
    const tExit = setTimeout(() => handleExit(), 3000);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') handleExit();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearTimeout(tMount);
      clearTimeout(tExit);
      clearInterval(previewInterval);
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

  const currentWork = PREVIEW_WORKS[activePreview];

  return (
    <aside
      aria-label="Carregando portfólio de Barbarotti"
      onClick={handleExit}
      className={`fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden bg-white text-[#111114] cursor-pointer select-none transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] p-6 sm:p-10 md:p-14 ${
        exiting ? 'opacity-0 scale-98 filter blur-lg pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 1. TOPO LIMPO: IDENTIFICAÇÃO E STATUS MINIMALISTA (SEM QUALQUER ELEMENTO DE CÂMERA) */}
      <div
        style={{
          willChange: 'transform, opacity',
          transform: mounted ? 'translate3d(0, 0, 0)' : 'translate3d(0, -10px, 0)',
          opacity: mounted ? 1 : 0,
          transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="relative z-10 flex items-center justify-between font-mono text-[11px] sm:text-[12px] uppercase tracking-wider text-black/70"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-black tracking-tight">BARBAROTTI</span>
          <span className="text-black/30">—</span>
          <span className="text-black/60 hidden sm:inline">ESTÚDIO AUDIOVISUAL & IA</span>
        </div>

        <div className="text-black/50 text-[11px]">
          <span>FLORIANÓPOLIS, BR</span>
        </div>
      </div>

      {/* 2. CENTRO: SOUBARBAROTTI COM BLUR PROGRESSIVO SURGINDO DO CHÃO */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4 w-full">
        {/* MINI PREVIEW GRÁFICO DOS TRABALHOS */}
        <div
          style={{
            willChange: 'transform, opacity',
            transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1) 150ms',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translate3d(0, 0, 0)' : 'translate3d(0, 20px, 0)',
          }}
          className="mb-4 sm:mb-6 flex flex-col items-center"
        >
          <div className="flex items-center gap-3 rounded-full border border-black/10 bg-black/[0.03] px-3.5 py-1.5 backdrop-blur-md shadow-sm">
            <div className="relative size-7 overflow-hidden rounded-full border border-black/20 bg-black">
              <Image
                src={currentWork.image}
                alt={currentWork.title}
                fill
                sizes="32px"
                className="object-cover transition-opacity duration-300"
                priority
              />
            </div>
            <div className="text-left font-mono">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[#ff6a00]">
                {currentWork.tag}
              </span>
              <span className="block text-[11px] font-semibold text-black leading-tight">
                {currentWork.title}
              </span>
            </div>
          </div>
        </div>

        {/* CONTAINER DO CHÃO */}
        <div className="relative overflow-hidden w-full pb-3">
          {/* NOME PRINCIPAL: SURGINDO DO CHÃO COM BLUR ANTES DE ESTAR NORMAL */}
          <h1
            style={{
              willChange: 'transform, filter, opacity',
              transform: mounted ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 100%, 0)',
              filter: mounted ? 'blur(0px)' : 'blur(32px)',
              opacity: mounted ? 1 : 0,
              transition:
                'transform 1150ms cubic-bezier(0.16, 1, 0.3, 1), filter 1150ms cubic-bezier(0.16, 1, 0.3, 1), opacity 850ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="font-display text-[15vw] sm:text-[13vw] lg:text-[11vw] font-black uppercase tracking-[-0.04em] leading-[0.88] select-none text-black origin-bottom"
          >
            <span>SOU</span>
            <span className="text-[#ff6a00]">BARBAROTTI</span>
          </h1>

          {/* LINHA DO CHÃO */}
          <div
            style={{
              willChange: 'transform, opacity',
              transform: mounted ? 'scaleX(1)' : 'scaleX(0)',
              opacity: mounted ? 1 : 0,
              transition: 'transform 1000ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, opacity 600ms ease',
            }}
            className="mx-auto mt-2 h-px max-w-4xl bg-gradient-to-r from-transparent via-black/30 to-transparent"
          />
        </div>

        {/* ELEMENTOS GRÁFICOS: ESPECIALIDADES */}
        <div
          style={{
            willChange: 'transform, opacity',
            transition: 'all 750ms cubic-bezier(0.16, 1, 0.3, 1) 250ms',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translate3d(0, 0, 0)' : 'translate3d(0, 15px, 0)',
          }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-[12px] font-semibold uppercase text-black/75"
        >
          <span className="rounded-md border border-black/10 bg-black/5 px-2.5 py-1">DIREÇÃO COM IA</span>
          <span className="rounded-md border border-black/10 bg-black/5 px-2.5 py-1">3D MOTION & VFX</span>
          <span className="rounded-md border border-black/10 bg-black/5 px-2.5 py-1">DAVINCI COLOR</span>
          <span className="rounded-md border border-black/10 bg-black/5 px-2.5 py-1">ALTA CONVERSÃO</span>
        </div>
      </div>

      {/* 3. RODAPÉ LIMPO E MINIMALISTA */}
      <div
        style={{
          willChange: 'transform, opacity',
          transform: mounted ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
          opacity: mounted ? 1 : 0,
          transition: 'all 900ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] sm:text-[12px] text-black/70"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-black/15 bg-black/5 px-3 py-1.5 font-semibold text-black">
            <span className="size-2 rounded-full bg-[#ff6a00]" />
            <span>PORTFÓLIO & DIREÇÃO CRIATIVA</span>
          </div>
          <span className="hidden sm:inline text-black/40">|</span>
          <span className="hidden sm:inline text-black/60">CLIQUE PARA ENTRAR</span>
        </div>

        {/* Barra de progresso */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-black/50">CARREGANDO</span>
          <div className="h-1.5 w-24 sm:w-32 overflow-hidden rounded-full bg-black/10">
            <div
              className={`h-full bg-black transition-all duration-[2600ms] ease-out ${
                mounted ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <span className="font-bold text-black">100%</span>
        </div>
      </div>
    </aside>
  );
}
