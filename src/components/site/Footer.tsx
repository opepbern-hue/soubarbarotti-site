import Link from 'next/link';
import type { SettingsView } from '@/lib/content';
import { CornerArrowIcon, type NavItem } from './Header';
import { RollText } from './Hud';
import { Social, whatsappLink } from './Social';
import { Fill } from './Text';

export function Footer({ settings, items }: { settings: SettingsView; items: NavItem[] }) {
  const year = new Date().getFullYear();
  const waHref = settings.whatsapp ? whatsappLink(settings.whatsapp) : '';

  return (
    <footer className="footer_wrap border-t border-paragon-white/22 bg-paragon-black pt-[72px] pb-10 text-paragon-white lg:pt-[104px]">
      <div className="paragon-container">
        {/* Topo de 4 Colunas estilo Paragon (desktop-home-fold9.png) */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Coluna 1: Frase de assinatura + CTA Coral Red */}
          <div className="lg:col-span-5">
            <p className="text-paragon-h3 max-w-[420px] text-paragon-white">
              <Fill text={settings.footerLine1 || 'a sua ideia,'} />{' '}
              <span className="text-paragon-red">
                <Fill text={settings.footerLine2 || 'com cara de cinema.'} />
              </span>
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/#contato" className="u-button u-button--red">
                <RollText text="Iniciar um projeto" />
                <CornerArrowIcon className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <nav aria-label="Navegação do rodapé" className="lg:col-span-2">
            <p className="font-kicker text-[12px] text-paragon-grey-400 uppercase">Navegação</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="nav_menu_link font-kicker text-[15px] text-paragon-white uppercase transition-colors hover:text-paragon-red"
                  >
                    <RollText text={item.label} />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/privacidade"
                  className="nav_menu_link font-kicker text-[15px] text-paragon-white uppercase transition-colors hover:text-paragon-red"
                >
                  <RollText text="Privacidade" />
                </Link>
              </li>
            </ul>
          </nav>

          {/* Coluna 3: Contato & Redes */}
          <div className="lg:col-span-3">
            <p className="font-kicker text-[12px] text-paragon-grey-400 uppercase">Contato &amp; Redes</p>
            <ul className="mt-4 flex flex-col gap-2.5 font-kicker text-[15px] uppercase">
              {settings.instagramUrl ? (
                <li>
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener"
                    className="nav_menu_link text-paragon-white transition-colors hover:text-paragon-red"
                  >
                    <RollText text="Instagram ↗" />
                  </a>
                </li>
              ) : null}
              {waHref ? (
                <li>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener"
                    className="nav_menu_link text-paragon-white transition-colors hover:text-paragon-red"
                  >
                    <RollText text="WhatsApp ↗" />
                  </a>
                </li>
              ) : null}
              {settings.contactEmail ? (
                <li>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="nav_menu_link text-paragon-white lowercase transition-colors hover:text-paragon-red"
                  >
                    {settings.contactEmail}
                  </a>
                </li>
              ) : null}
            </ul>
            <Social settings={settings} className="mt-5" showMissing={false} />
          </div>

          {/* Coluna 4: Localização */}
          <div className="lg:col-span-2">
            <p className="font-kicker text-[12px] text-paragon-grey-400 uppercase">Localização</p>
            <p className="mt-4 font-kicker text-[15px] text-paragon-white uppercase">
              <Fill text={settings.heroLocation || 'Palhoça, SC & Remoto'} />
            </p>
          </div>
        </div>

        {/* Emblema Gigante em Pílula de Largura Total (Assinatura Visual do Footer da Paragon) */}
        <div className="my-12 lg:my-16">
          <div className="flex w-full flex-col items-center justify-center rounded-[999px] border-2 border-paragon-white px-6 py-8 text-center lg:px-16 lg:py-12">
            <span className="font-display text-[clamp(2.6rem,10.5vw,9rem)] leading-[0.86] font-medium tracking-tight text-paragon-white uppercase select-none">
              SOUBARBAROTTI
            </span>
            <span className="mt-2 font-kicker text-[clamp(0.75rem,1.4vw,1.125rem)] tracking-[0.18em] text-paragon-white/85 uppercase">
              DIREÇÃO CINEMATOGRÁFICA &amp; VÍDEOS COM IA
            </span>
          </div>
        </div>

        {/* Barra Inferior de Direitos e Entidade */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-paragon-white/20 pt-6 text-paragon-small text-paragon-grey-400 md:flex-row md:items-center">
          <p className="max-w-[640px]">
            <Fill text={settings.entityPhrase} />
          </p>
          <p className="shrink-0 font-kicker text-[12px] text-paragon-white/80 uppercase">
            © {year} SOUBARBAROTTI. TODOS OS DIREITOS RESERVADOS.
          </p>
        </div>
      </div>
    </footer>
  );
}
