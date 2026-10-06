import type { ReactNode } from 'react';
import { getSections, getSettings } from '@/lib/content';
import { globalJsonLd } from '@/lib/seo';
import { Footer } from './Footer';
import { Header, type NavItem } from './Header';
import { JsonLd } from './JsonLd';
import { Preloader } from './Preloader';
import { AmbientSoundWidget } from './AmbientSoundWidget';

export async function navItems(): Promise<NavItem[]> {
  const sections = await getSections();
  const on = (k: string) => sections[k]?.enabled !== false;
  const items: NavItem[] = [{ label: 'Portfólio', href: '/portfolio' }];
  if (on('processo')) items.push({ label: 'Processo', href: '/#processo', section: 'processo' });
  if (on('sobre')) items.push({ label: 'Sobre', href: '/#sobre', section: 'sobre' });
  if (on('contato')) items.push({ label: 'Contato', href: '/#contato', section: 'contato' });
  return items;
}

/** Menu + conteúdo + rodapé (páginas públicas e 404) */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [settings, items] = await Promise.all([getSettings(), navItems()]);
  return (
    <>
      <Preloader />
      <AmbientSoundWidget />
      <JsonLd data={globalJsonLd(settings)} />
      <Header items={items} ctaLabel="Fale comigo" />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} items={items} />
    </>
  );
}
