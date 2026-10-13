'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { logoutAction } from '@/app/admin/actions';

const LINKS = [
  { href: '/admin', label: 'Painel' },
  { href: '/admin/portfolio', label: 'Portfólio' },
  { href: '/admin/midias', label: 'Mídias & Vídeos' },
  { href: '/admin/fotos', label: 'Fotos' },
  { href: '/admin/artes', label: 'Artes' },
  { href: '/admin/site', label: 'Abertura & Sobre' },
  { href: '/admin/seguranca', label: 'Segurança' },
];

export function AdminNav({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <aside className="sticky top-0 z-40 border-b border-linha bg-[#0d0d12]/95 backdrop-blur-md lg:h-[100svh] lg:border-b-0 lg:border-r">
      <div className="flex h-14 items-center justify-between px-4 lg:h-auto lg:flex-col lg:items-start lg:gap-1 lg:px-6 lg:pt-8">
        <Link href="/admin" className="font-display text-[18px] font-semibold tracking-[-0.03em] text-white">
          soubarbarotti<span className="text-[#ff6a00]">.</span> <span className="text-[12px] font-medium uppercase text-fumaca">admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="rounded-full px-3 py-1.5 text-[13px] font-semibold uppercase ring-1 ring-linha text-carvao bg-nevoa lg:hidden"
        >
          {open ? 'Fechar' : 'Menu'}
        </button>
      </div>
      <nav className={`${open ? 'block' : 'hidden'} px-3 pb-4 lg:block lg:px-4 lg:pt-6`} aria-label="Admin">
        <ul className="flex flex-col gap-1">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active(l.href) ? 'page' : undefined}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-[14px] transition-all ${
                  active(l.href)
                    ? 'bg-nevoa font-semibold text-brasa border border-white/10 shadow-sm'
                    : 'text-fumaca hover:bg-nevoa/70 hover:text-carvao'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-2 border-t border-linha px-3 pt-4 text-[13px]">
          <a href="/" target="_blank" rel="noopener" className="text-fumaca hover:text-brasa transition-colors">
            Ver o site ↗
          </a>
          <form action={logoutAction}>
            <button type="submit" className="text-fumaca hover:text-red-400 transition-colors">
              Sair
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
