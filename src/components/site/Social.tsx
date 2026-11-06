import type { SettingsView } from '@/lib/content';
import { InstagramIcon, LinkedinIcon, MailIcon, WhatsappIcon, YoutubeIcon } from './icons';

export function whatsappLink(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}`;
}

/** Links de redes sociais e canais diretos no estilo arquitetônico da Paragon (nunca exibe [PREENCHER]). */
export function Social({
  settings,
  className = '',
  variant = 'boxes',
}: {
  settings: SettingsView;
  className?: string;
  showMissing?: boolean;
  variant?: 'boxes' | 'text';
}) {
  const links = [
    { key: 'Instagram', href: settings.instagramUrl, Icon: InstagramIcon },
    { key: 'WhatsApp', href: settings.whatsapp ? whatsappLink(settings.whatsapp) : '', Icon: WhatsappIcon },
    { key: 'E-mail', href: settings.contactEmail ? `mailto:${settings.contactEmail}` : '', Icon: MailIcon },
    { key: 'LinkedIn', href: settings.linkedinUrl, Icon: LinkedinIcon },
    { key: 'YouTube', href: settings.youtubeUrl, Icon: YoutubeIcon },
  ];
  const present = links.filter((l) => l.href && !/\[PREENCHER/i.test(l.href));

  if (variant === 'text') {
    return (
      <div className={className}>
        <ul className="flex flex-wrap items-center gap-6">
          {present.map(({ key, href }) => (
            <li key={key}>
              <a
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener"
                className="u-text-button text-paragon-kicker"
              >
                <span data-button-animate-chars>
                  <span>{key}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={className}>
      <ul className="flex flex-wrap items-center">
        {present.map(({ key, href, Icon }, idx) => (
          <li key={key} className={idx > 0 ? '-ml-px' : ''}>
            <a
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener"
              aria-label={key}
              className="grid size-11 place-items-center border border-current bg-transparent transition-colors duration-300 hover:bg-paragon-red hover:text-paragon-black"
            >
              <Icon className="size-[18px]" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
