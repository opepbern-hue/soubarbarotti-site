'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RollText } from '@/components/site/Hud';

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
    <div className="flex min-h-screen items-center justify-center bg-paragon-black px-[var(--site-margin)] text-paragon-white">
      <div className="w-full max-w-lg border border-paragon-white/25 bg-paragon-black p-8 text-center lg:p-12">
        <span className="inline-block border border-paragon-black bg-paragon-red px-3 py-1 font-kicker text-[12px] text-paragon-black uppercase">
          ✦ ERRO DE EXECUÇÃO
        </span>

        <h1 className="text-paragon-h2 mt-5 text-paragon-white">Instabilidade momentânea</h1>
        <p className="text-paragon-body mt-3 text-paragon-grey-400">
          O servidor está sincronizando os dados. Você pode recarregar a página ou voltar para a tela inicial.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => reset()} className="u-button u-button--red w-full sm:w-auto">
            <RollText text="Tentar novamente" />
          </button>
          <Link href="/" className="u-button u-button--dark w-full sm:w-auto">
            <RollText text="Ir para a home" />
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-6 font-kicker text-[11px] text-paragon-grey-500 uppercase">
            Código do evento: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
