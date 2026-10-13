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
    <main className="grid min-h-[100svh] place-items-center bg-[#09090b] px-5 text-white">
      <div className="w-full max-w-[400px] rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-md">
        <p className="flex items-center gap-2 font-display text-[13px] font-semibold tracking-wider uppercase text-zinc-400">
          <span className="size-2 rounded-full bg-red-500 animate-pulse" aria-hidden /> REC: Admin
        </p>
        <h1 className="mt-3 font-display text-[38px] font-black leading-none tracking-tight text-white">
          soubarbarotti<span className="text-[#ff6a00]">.</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400">Acesso restrito ao painel de controle</p>
        <LoginForm volta={volta} />
      </div>
    </main>
  );
}
