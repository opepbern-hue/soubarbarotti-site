import Link from 'next/link';
import type { SettingsView } from '@/lib/content';
import type { NavItem } from './Header';
import { Social } from './Social';
import { Fill } from './Text';
import { VideoTitle } from './VideoTitle';

export function Footer({ settings, items }: { settings: SettingsView; items: NavItem[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-branco-tela pb-10 pt-[90px] lg:pt-[120px]">
      <div className="px-5 lg:px-[140px]">
        <div className="mx-auto w-full md:max-w-[640px] lg:max-w-[1070px]">
          <VideoTitle media={settings.heroMedia} barbarottiClassName="text-[#ff6a00]" />
        </div>

        <div className="mt-[70px] grid gap-12 md:grid-cols-[1fr_auto] lg:mt-[90px]">
          <div>
            <p className="font-display text-[21px] leading-[1.3] tracking-[-0.02em] md:text-[19px] lg:text-[28px]">
              <Fill text={settings.footerLine1} />
              <br />
              <Fill text={settings.footerLine2} />
            </p>
            <Social settings={settings} className="mt-7" showMissing={false} />
            <p className="mt-10 max-w-[520px] text-[13px] leading-[1.45] text-fumaca">
              <Fill text={settings.entityPhrase} />
            </p>
            <p className="mt-3 font-display text-[14px] font-medium lowercase tracking-[-0.01em] text-fumaca">
              © {year} sou<span className="text-[#ff6a00] font-semibold">barbarotti</span>. todos os direitos reservados.
            </p>
          </div>
          <nav aria-label="Rodapé" className="grid grid-cols-2 gap-x-16 gap-y-[18px] self-start md:gap-x-[100px]">
            <ul className="flex flex-col gap-[30px]">
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-display text-[14px] font-medium uppercase transition-colors hover:text-black">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-[30px]">
              <li>
                <Link href="/privacidade" className="font-display text-[14px] font-medium uppercase transition-colors hover:text-black">
                  Privacidade
                </Link>
              </li>
              {settings.instagramUrl ? (
                <li>
                  <a href={settings.instagramUrl} target="_blank" rel="noopener" className="font-display text-[14px] font-medium uppercase transition-colors hover:text-black">
                    Instagram
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
