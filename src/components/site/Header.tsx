'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { RollText } from './Hud';
import { CloseIcon, InstagramIcon, MenuIcon } from './icons';

export type NavItem = { label: string; href: string; section?: string };

export function Header({ items, ctaLabel }: { items: NavItem[]; ctaLabel: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Trava a rolagem do fundo quando o menu mobile está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Marca a seção visível
  useEffect(() => {
    if (pathname !== '/') {
      setActive(items.find((i) => !i.section && pathname.startsWith(i.href))?.href ?? null);
      return;
    }
    const ids = items.map((i) => i.section).filter(Boolean) as string[];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    const onTop = () => {
      if (window.scrollY < 200) setActive(null);
    };
    window.addEventListener('scroll', onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onTop);
    };
  }, [pathname, items]);

  // Fechar com ESC e foco acessível
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector('a')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (item: NavItem) =>
    item.section
      ? active === `#${item.section}`
      : active === item.href || (item.href !== '/' && pathname.startsWith(item.href));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || open
            ? 'bg-black/85 backdrop-blur-xl border-b border-white/10 py-4 shadow-2xl'
            : 'bg-transparent py-6 sm:py-8'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-12">
          {/* Logo Estilo Minimalista / Moderno */}
          <Link
            href="/"
            className="font-display text-[18px] sm:text-[20px] font-bold tracking-tight uppercase text-white transition-opacity hover:opacity-85"
            aria-label="Barbarotti: início"
          >
            BARBAROTTI
          </Link>

          {/* Navegação Central Desktop */}
          <nav aria-label="Principal" className="hidden lg:block absolute left-1/2 -translate-x-1/2">
            <ul className="flex items-center gap-8">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item) ? 'true' : undefined}
                    className={`font-display text-[13px] font-medium tracking-wide transition-colors hover:text-white ${
                      isActive(item) ? 'text-white font-semibold' : 'text-zinc-400'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Container de Botões no Menu (Instagram + Fale comigo) */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 p-1 backdrop-blur-xl shadow-lg">
            <a
              href="https://instagram.com/soubarbarotti"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram @soubarbarotti"
              className="group flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 font-display text-[12px] font-semibold uppercase tracking-wider text-white transition-all hover:bg-white/20 hover:border-white/30"
            >
              <InstagramIcon className="size-3.5 text-white transition-transform group-hover:scale-110" />
              <span>Instagram</span>
            </a>
            <Link
              href="/#contato"
              aria-label="Fale comigo"
              className="roll-host flex h-9 items-center rounded-full bg-white px-5 font-display text-[12px] font-bold uppercase text-black shadow-md transition-all hover:bg-zinc-200 active:scale-95"
            >
              <RollText text="Fale comigo" />
            </Link>
          </div>

          {/* Botão Hambúrguer Mobile */}
          <button
            ref={toggleRef}
            type="button"
            className="grid size-10 place-items-center rounded-lg border border-white/20 bg-black/60 text-white transition-all hover:bg-zinc-900 active:scale-95 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-celular"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon className="size-5 text-white" /> : <MenuIcon className="size-5 text-white" />}
          </button>
        </div>

        {/* Menu Suspenso Mobile */}
        <div
          id="menu-celular"
          ref={panelRef}
          className={`relative overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
            open
              ? 'max-h-[calc(100vh-5rem)] border-t border-white/10 bg-black/95 backdrop-blur-2xl opacity-100 shadow-2xl'
              : 'max-h-0 border-t-0 opacity-0'
          }`}
        >
          <div className="relative z-10 space-y-6 px-6 pt-5 pb-8 text-white">
            <nav aria-label="Menu Mobile">
              <ul className="flex flex-col space-y-2">
                {items.map((item) => {
                  const activeItem = isActive(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={activeItem ? 'true' : undefined}
                        className={`flex h-12 items-center justify-between rounded-xl px-4 font-display text-[15px] font-semibold uppercase tracking-tight transition-all ${
                          activeItem
                            ? 'border border-white/20 bg-zinc-900 text-white'
                            : 'text-zinc-400 hover:bg-zinc-900/60 active:bg-zinc-800'
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* CTA Mobile: Container com Instagram e Fale Comigo */}
            <div className="pt-2 flex flex-col gap-2 rounded-2xl border border-white/10 bg-zinc-950 p-2">
              <a
                href="https://instagram.com/soubarbarotti"
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 font-display text-[13px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/20"
              >
                <InstagramIcon className="size-4 text-white" />
                <span>Instagram (@soubarbarotti)</span>
              </a>
              <Link
                href="/#contato"
                onClick={() => setOpen(false)}
                aria-label="Fale comigo"
                className="roll-host flex h-11 w-full items-center justify-center rounded-xl bg-white font-display text-[13px] font-bold uppercase text-black shadow-lg transition-transform active:scale-[0.98]"
              >
                <RollText text="Fale comigo" />
              </Link>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-400">
              <span className="font-medium">@soubarbarotti</span>
              <a
                href="https://instagram.com/soubarbarotti"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-white transition-colors hover:text-zinc-300"
              >
                Instagram ↗
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay escuro ao abrir o menu mobile */}
      {open && (
        <div
          className="fixed inset-0 top-20 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
