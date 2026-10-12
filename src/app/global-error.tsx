'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#0a0705] text-[#f7efe6] flex items-center justify-center px-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff5500] font-mono text-sm">
            REC
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-medium tracking-tight">
              Instabilidade momentânea
            </h1>
            <p className="text-sm text-[#b8a898] leading-relaxed">
              O site está sincronizando os dados. Clique abaixo para recarregar a página.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="px-6 py-3 rounded-full bg-[#ff5500] text-black font-medium text-xs tracking-wider uppercase hover:bg-[#ff6f26] transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
