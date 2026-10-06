import type { ReactNode } from 'react';

export const inputCls =
  'block w-full rounded-lg bg-branco-tela px-3 py-2.5 text-[15px] text-carvao ring-1 ring-linha placeholder:text-fumaca/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brasa';
export const btnPrimary =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brasa px-5 font-display text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition-opacity hover:opacity-90 disabled:opacity-50';
export const btnGhost =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-branco-tela px-4 font-display text-[12px] font-semibold uppercase tracking-[0.03em] text-carvao ring-1 ring-linha transition-colors hover:text-brasa disabled:opacity-40';
export const btnDanger =
  'inline-flex h-9 items-center justify-center rounded-full px-4 font-display text-[12px] font-semibold uppercase tracking-[0.03em] text-brasa ring-1 ring-brasa/40 transition-colors hover:bg-brasa hover:text-white';

export function Field({ label, hint, children, className = '' }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-medium text-carvao">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-[12px] leading-[1.4] text-fumaca">{hint}</span> : null}
    </label>
  );
}

export function Check({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-2.5 text-[14px]">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-[var(--brasa)]" />
      <span>
        {label}
        {hint ? <span className="block text-[12px] text-fumaca">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Card({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`rounded-2xl bg-branco-tela p-5 ring-1 ring-linha md:p-7 ${className}`}>
      {children}
    </section>
  );
}

export function PageHead({ title, intro, children }: { title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[32px] font-semibold leading-none tracking-[-0.03em] md:text-[40px]">{title}</h1>
        {intro ? <p className="mt-3 max-w-[640px] text-[15px] leading-[1.45] text-fumaca">{intro}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    READY: ['Pronto', 'bg-[#e7f5ea] text-[#1f6b35]'],
    PENDING: ['Na fila', 'bg-nevoa text-brasa'],
    PROCESSING: ['Comprimindo…', 'bg-nevoa text-brasa'],
    UPLOADING: ['Enviando…', 'bg-nevoa text-brasa'],
    ERROR: ['Erro', 'bg-[#fde8e4] text-[#a3261a]'],
  };
  const [label, cls] = map[status] ?? [status, 'bg-linha'];
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] ${cls}`}>{label}</span>;
}
