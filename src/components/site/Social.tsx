import type { SettingsView } from '@/lib/content';
import { InstagramIcon, LinkedinIcon, MailIcon, WhatsappIcon, YoutubeIcon } from './icons';

export function whatsappLink(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}`;
}

/** Ícones das redes. Os canais que ainda não foram informados aparecem como [PREENCHER]. */
export function Social({ settings, className = '', showMissing = true }: { settings: SettingsView; className?: string; showMissing?: boolean }) {
  const links = [
    { key: 'Instagram', href: settings.instagramUrl, Icon: InstagramIcon },
    { key: 'WhatsApp', href: settings.whatsapp ? whatsappLink(settings.whatsapp) : '', Icon: WhatsappIcon },
    { key: 'E-mail', href: settings.contactEmail ? `mailto:${settings.contactEmail}` : '', Icon: MailIcon },
    { key: 'LinkedIn', href: settings.linkedinUrl, Icon: LinkedinIcon },
    { key: 'YouTube', href: settings.youtubeUrl, Icon: YoutubeIcon },
  ];
  const present = links.filter((l) => l.href);
  const missing = links.filter((l) => !l.href).map((l) => l.key);
  return (
    <div className={className}>
      <ul className="flex flex-wrap items-center gap-3">
        {present.map(({ key, href, Icon }) => (
          <li key={key}>
            <a
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener"
              aria-label={key}
              className="grid size-10 place-items-center rounded-full bg-branco-tela text-carvao ring-1 ring-linha transition-colors hover:text-brasa"
            >
              <Icon className="size-[18px]" />
            </a>
          </li>
        ))}
      </ul>
      {showMissing && missing.length ? (
        <p className="mt-3 text-[12px]">
          <mark className="preencher">[PREENCHER: {missing.join(', ')}]</mark>
        </p>
      ) : null}
    </div>
  );
}
