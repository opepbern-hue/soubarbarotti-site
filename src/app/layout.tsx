import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import { env } from '@/lib/env';
import './globals.css';

// Equivalentes livres (SIL Open Font License) via next/font para a tríade tipográfica da Paragon:
// - Barlow Condensed → equivalente a "Review Condensed" (Display / Títulos condensados uppercase)
// - Space Grotesk    → equivalente a "Simplon Norm" (Navbar, Kickers técnicos, Botões, Menu Mobile)
// - Plus Jakarta Sans → equivalente a "Roobert" (Corpo de texto geométrico-humanista)
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: 'soubarbarotti', template: '%s | soubarbarotti' },
  applicationName: 'soubarbarotti',
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#100f0f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${barlowCondensed.variable} ${spaceGrotesk.variable} ${plusJakarta.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

