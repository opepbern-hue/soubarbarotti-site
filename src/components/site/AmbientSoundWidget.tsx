'use client';

import { useEffect } from 'react';
import { soundEngine } from './ambient-audio';

/**
 * Gerenciador de Áudio Ambiente Generativo (Boutique Lounge & Micro-SFX nos botões principais).
 * 100% invisível na tela ("some com o elevador lounge: on, só deixa rodando").
 */
export function AmbientSoundWidget() {
  useEffect(() => {
    if (!soundEngine) return;

    // 1. Destrava e inicia no primeiro clique / toque (exigência dos navegadores)
    const unlockAndStart = () => {
      soundEngine?.unlockAndStart();
    };

    window.addEventListener('click', unlockAndStart, { passive: true });
    window.addEventListener('touchstart', unlockAndStart, { passive: true });
    window.addEventListener('keydown', unlockAndStart, { passive: true });

    // Tenta iniciar se o contexto já estiver disponível
    soundEngine.unlockAndStart().catch(() => {});

    // 2. Quando um vídeo COM ÁUDIO tocar, pausa a música de fundo automaticamente
    const handleVideoPlay = (e: Event) => {
      const video = e.target;
      if (video instanceof HTMLVideoElement && !video.muted && video.volume > 0) {
        soundEngine?.onVideoPlay();
      }
    };

    const handleVideoPause = (e: Event) => {
      const video = e.target;
      if (video instanceof HTMLVideoElement) {
        soundEngine?.onVideoPause();
      }
    };

    document.addEventListener('play', handleVideoPlay, true);
    document.addEventListener('pause', handleVideoPause, true);
    document.addEventListener('ended', handleVideoPause, true);

    // 3. Micro-SFX somente ao entrar em grandes seções da página
    const sectionElements = document.querySelectorAll(
      '#trabalhos, #processo, #sobre, #contato, footer',
    );
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            soundEngine?.playSubtleAreaSfx();
          }
        }
      },
      { threshold: 0.45 },
    );
    sectionElements.forEach((el) => sectionObserver.observe(el));

    // 4. Micro-SFX SOMENTE nos botões principais (não em todos os botões/links)
    // Alvo: links do menu de navegação, CTA "Fale comigo", botões de envio
    let lastSfx = 0;
    const handleMainButtonHover = (e: MouseEvent) => {
      const target =
        e.target instanceof Element
          ? e.target.closest('header nav a, .roll-host, button[type="submit"], #menu-celular a')
          : null;
      const now = performance.now();
      if (target && now - lastSfx > 350) {
        lastSfx = now;
        soundEngine?.playSubtleAreaSfx();
      }
    };
    document.addEventListener('mouseenter', handleMainButtonHover, true);

    return () => {
      window.removeEventListener('click', unlockAndStart);
      window.removeEventListener('touchstart', unlockAndStart);
      window.removeEventListener('keydown', unlockAndStart);
      document.removeEventListener('play', handleVideoPlay, true);
      document.removeEventListener('pause', handleVideoPause, true);
      document.removeEventListener('ended', handleVideoPause, true);
      document.removeEventListener('mouseenter', handleMainButtonHover, true);
      sectionObserver.disconnect();
    };
  }, []);

  return null;
}
