import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'Entrar' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const volta = typeof sp.volta === 'string' ? sp.volta : '';
  if (await isLoggedIn()) redirect('/admin');
  return (
    <main className="grid min-h-[100svh] place-items-center bg-light-leak px-5">
      <div className="w-full max-w-[380px]">
        <p className="flex items-center gap-2 font-display text-[14px] font-medium uppercase">
          <span className="rec-dot" aria-hidden /> REC: Admin
        </p>
        <h1 className="mt-4 font-display text-[44px] font-semibold leading-none tracking-[-0.04em]">
          soubarbarotti<span className="text-laranja">.</span>
        </h1>
        <LoginForm volta={volta} />
      </div>
    </main>
  );
}
