import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin soubarbarotti' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="admin-theme min-h-[100svh] bg-[#09090b] text-carvao selection:bg-[#ff6a00] selection:text-black">{children}</div>;
}
