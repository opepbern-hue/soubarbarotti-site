'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { RollText } from './Hud';

export type NavItem = { label: string; href: string; section?: string };

const TICKER_ITEMS = Array.from({ length: 6 }, () => 'SOUBARBAROTTI // DIREÇÃO & IA //');

export function Header({ items, ctaLabel }: { items: NavItem[]; ctaLabel: string }) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const lastScrollY = useRef(0);

  // Reação à direção do scroll (SCRIPT 9 da Paragon: initNavScrollHide)
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY <= 64) {
        setHidden(false);
      } else if (currentY > lastScrollY.current + 6) {
        setHidden(true);
      } else if (currentY < lastScrollY.current - 6) {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
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

  // No menu mobile incluímos também o link direto de Contato como na Paragon
  const mobileLinks: NavItem[] = [
    ...items,
    ...(items.some((i) => i.href === '/#contato') ? [] : [{ label: 'Contato', href: '/#contato', section: 'contato' }]),
  ];

  return (
    <div data-navigation-status={open ? 'active' : 'not-active'}>
      <header
        style={{
          transform: hidden && !open ? 'translate3d(0, -130%, 0)' : 'translate3d(0, 0, 0)',
          opacity: hidden && !open ? 0 : 1,
          transition:
            'transform 300ms cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 300ms cubic-bezier(0.55, 0.085, 0.68, 0.53)',
        }}
        className="fixed inset-x-0 top-[16px] z-50 lg:top-[24px]"
      >
        <div className="paragon-container">
          {/* Desktop Navbar (2 grupos arquitetônicos com borda 1px solid #16110d e altura 48px) */}
          <div className="hidden h-[48px] items-stretch justify-between lg:flex">
            {/* Grupo Esquerdo: Símbolo Barbarotti em Laranja #FF6A00 + Links em células #FFFFFF */}
            <div className="flex items-stretch border border-paragon-black bg-paragon-white text-paragon-black">
              <Link
                href="/"
                aria-label="Barbarotti: início"
                className="grid w-[52px] place-items-center border-r border-paragon-black bg-paragon-blue text-paragon-black transition-colors duration-300 hover:bg-paragon-blue-light"
              >
                <BarbarottiSymbol className="size-6" />
              </Link>
              <nav aria-label="Principal" className="flex items-stretch">
                <ul className="flex items-stretch">
                  {items.map((item, idx) => {
                    const current = isActive(item);
                    return (
                      <li
                        key={item.href}
                        className={`flex items-stretch ${
                          idx < items.length - 1 ? 'border-r border-paragon-black' : ''
                        }`}
                      >
                        <Link
                          href={item.href}
                          aria-current={current ? 'true' : undefined}
                          className={`nav_menu_link flex items-center px-4 font-kicker text-[14px] leading-none font-normal uppercase transition-colors duration-300 xl:px-5 xl:text-[15px] ${
                            current
                              ? 'bg-paragon-grey-300 font-medium text-paragon-black'
                              : 'bg-paragon-white text-paragon-black hover:bg-paragon-grey-300'
                          }`}
                        >
                          <RollText text={item.label} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Grupo Direito: Marquee Contínuo + Botão Laranja Barbarotti "Fale comigo ↳" */}
            <div className="flex items-stretch border border-paragon-black bg-paragon-white text-paragon-black">
              <div
                aria-hidden="true"
                className="flex w-[220px] items-center overflow-hidden border-r border-paragon-black bg-paragon-white text-paragon-black xl:w-[288px]"
              >
                <div className="flex shrink-0 items-center whitespace-nowrap" data-nav-marquee-list>
                  {TICKER_ITEMS.map((t, i) => (
                    <span key={i} className="px-2 font-sans text-[14px] leading-none font-normal uppercase">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex shrink-0 items-center whitespace-nowrap" data-nav-marquee-list>
                  {TICKER_ITEMS.map((t, i) => (
                    <span key={`dup-${i}`} className="px-2 font-sans text-[14px] leading-none font-normal uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href="/#contato"
                aria-label={ctaLabel}
                className="roll-host flex items-center gap-2.5 bg-paragon-blue px-4 font-kicker text-[14px] leading-none font-normal text-paragon-black uppercase transition-colors duration-300 hover:bg-paragon-blue-light xl:px-5 xl:text-[15px]"
              >
                <RollText text={ctaLabel} />
                <CornerArrowIcon className="size-3.5 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Mobile Navbar (Barra única de 3 células: Símbolo 48x48 | Marquee | Toggle 52x48) */}
          <div className="flex h-[48px] w-full items-stretch border border-paragon-black bg-paragon-white text-paragon-black lg:hidden">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              aria-label="Barbarotti: início"
              className="grid w-[48px] shrink-0 place-items-center border-r border-paragon-black bg-paragon-blue text-paragon-black"
            >
              <BarbarottiSymbol className="size-5.5" />
            </Link>

            <div aria-hidden="true" className="flex min-w-0 flex-1 items-center overflow-hidden bg-paragon-white px-1">
              <div className="flex shrink-0 items-center whitespace-nowrap" data-nav-marquee-list>
                {TICKER_ITEMS.map((t, i) => (
                  <span key={i} className="px-1.5 font-sans text-[13.5px] leading-none text-paragon-black uppercase">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex shrink-0 items-center whitespace-nowrap" data-nav-marquee-list>
                {TICKER_ITEMS.map((t, i) => (
                  <span
                    key={`mdup-${i}`}
                    className="px-1.5 font-sans text-[13.5px] leading-none text-paragon-black uppercase"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="menu-celular"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setOpen((o) => !o)}
              className={`grid w-[52px] shrink-0 place-items-center border-l border-paragon-black transition-colors duration-300 ${
                open ? 'bg-paragon-blue-light' : 'bg-paragon-blue'
              }`}
            >
              <span className="relative flex w-[22px] flex-col items-end gap-[5.5px]">
                <span
                  style={{
                    transform: open ? 'translateY(7.5px)' : 'translateY(0)',
                    transition: 'transform 350ms cubic-bezier(0.65, 0.05, 0, 1)',
                  }}
                  className="block h-[2px] w-full bg-paragon-black"
                />
                <span className="block h-[2px] w-full bg-paragon-black" />
                <span
                  style={{
                    transform: open ? 'translateY(-7.5px)' : 'translateY(0)',
                    width: open ? '100%' : '72%',
                    transition:
                      'transform 350ms cubic-bezier(0.65, 0.05, 0, 1), width 350ms cubic-bezier(0.65, 0.05, 0, 1)',
                  }}
                  className="block h-[2px] bg-paragon-black"
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile Full-Screen (#16110d, Links 50.125px uppercase, Rodapé com redes sublinhadas) */}
      <div
        id="menu-celular"
        ref={panelRef}
        aria-hidden={!open}
        style={{
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transition: open
            ? 'opacity 500ms cubic-bezier(0.5, 0.5, 0, 1), visibility 0ms'
            : 'opacity 450ms cubic-bezier(0.5, 0.5, 0, 1) 250ms, visibility 0ms 700ms',
        }}
        className="fixed inset-0 z-40 flex flex-col justify-between bg-paragon-black px-[var(--site-margin)] pt-[104px] pb-8 text-paragon-white lg:hidden"
      >
        <nav aria-label="Menu Mobile">
          <ul className="flex flex-col gap-1">
            {mobileLinks.map((item, idx) => {
              const activeItem = isActive(item);
              return (
                <li key={item.href} className="overflow-hidden">
                  <div
                    style={{
                      transform: open ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 120%, 0)',
                      transition: `transform 550ms cubic-bezier(0.65, 0, 0, 1) ${open ? 140 + idx * 50 : 0}ms`,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={activeItem ? 'true' : undefined}
                      className={`nav_mobile_link inline-block font-kicker text-[clamp(2.5rem,12.8vw,3.133rem)] leading-[1.1] font-normal uppercase transition-colors ${
                        activeItem ? 'text-paragon-red' : 'text-paragon-white hover:text-paragon-red'
                      }`}
                    >
                      <RollText text={item.label} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="overflow-hidden pt-6">
          <ul
            style={{
              transform: open ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 120%, 0)',
              transition: `transform 650ms cubic-bezier(0.65, 0, 0, 1) ${open ? 300 : 0}ms`,
            }}
            className="flex flex-wrap items-center gap-6"
          >
            <li>
              <a
                href="https://www.instagram.com/soubarbarotti/"
                target="_blank"
                rel="noreferrer"
                className="u-text-button text-paragon-kicker text-paragon-white"
              >
                <RollText text="Instagram" />
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/5548999924405"
                target="_blank"
                rel="noreferrer"
                className="u-text-button text-paragon-kicker text-paragon-white"
              >
                <RollText text="WhatsApp" />
              </a>
            </li>
            <li>
              <a
                href="mailto:contato@soubarbarotti.com.br"
                className="u-text-button text-paragon-kicker text-paragon-white"
              >
                <RollText text="E-mail" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Símbolo oficial @soubarbarotti (quadro arredondado de cinema com prisma Play interno) */
export function BarbarottiSymbol({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <rect x="2.75" y="2.75" width="22.5" height="22.5" rx="6" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M11.2 9.15c0-.62.68-1 1.21-.68l7.45 4.55c.51.31.51 1.05 0 1.36l-7.45 4.55c-.53.32-1.21-.06-1.21-.68V9.15Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Seta técnica em ângulo reto (↳) idêntica ao botão CONTACT US da Paragon */
export function CornerArrowIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={className} aria-hidden="true">
      <path
        d="M2.5 2v7.5h8.5M7.5 6l3.5 3.5L7.5 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}
