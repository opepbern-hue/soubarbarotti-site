'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from '../actions';
import { btnPrimary, inputCls } from '@/components/admin/ui';

export function LoginForm({ volta }: { volta: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="volta" value={volta} />
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-zinc-300">Senha de Acesso</span>
        <input name="senha" type="password" required autoComplete="current-password" autoFocus placeholder="Digite a senha" className={inputCls} />
      </label>
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full mt-2`}>
        {pending ? 'Entrando…' : 'Entrar no Painel'}
      </button>
      <p aria-live="assertive" className="min-h-5 text-center text-[13px] font-medium text-red-400">
        {state.error ?? ''}
      </p>
    </form>
  );
}
