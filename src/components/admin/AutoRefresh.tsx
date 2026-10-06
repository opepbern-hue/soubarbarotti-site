'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Atualiza a página a cada poucos segundos enquanto há mídia sendo comprimida. */
export function AutoRefresh({ active, every = 4000 }: { active: boolean; every?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => router.refresh(), every);
    return () => window.clearInterval(t);
  }, [active, every, router]);
  return null;
}

/** Aviso de "Salvo." que some sozinho */
export function Flash({ message }: { message?: string }) {
  const router = useRouter();
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete('ok');
      router.replace(url.pathname + url.search + url.hash, { scroll: false });
    }, 3500);
    return () => window.clearTimeout(t);
  }, [message, router]);
  if (!message) return null;
  return (
    <p role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-carvao px-5 py-2.5 text-[14px] font-medium text-white shadow-xl">
      {message}
    </p>
  );
}
