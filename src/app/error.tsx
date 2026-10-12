'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0705] text-[#f7efe6] flex items-center justify-center px-6 selection:bg-[#ff5500] selection:text-white">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff5500] font-mono text-sm">
          REC
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight">
            Instabilidade momentânea
          </h1>
          <p className="text-sm text-[#b8a898] leading-relaxed">
            O servidor está sincronizando os dados. Você pode recarregar a página ou voltar para a tela inicial.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#ff5500] text-black font-medium text-xs tracking-wider uppercase hover:bg-[#ff6f26] transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-white/10 text-xs tracking-wider uppercase hover:bg-white/5 transition-colors"
          >
            Ir para a home
          </Link>
        </div>

        {error.digest ? (
          <p className="text-[11px] font-mono text-white/30 pt-4">
            Código do evento: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
