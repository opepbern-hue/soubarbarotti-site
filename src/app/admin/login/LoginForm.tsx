'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from '../actions';
import { btnPrimary, inputCls } from '@/components/admin/ui';

export function LoginForm({ volta }: { volta: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="volta" value={volta} />
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium">Senha</span>
        <input name="senha" type="password" required autoComplete="current-password" autoFocus className={inputCls} />
      </label>
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
      <p aria-live="assertive" className="min-h-5 text-[14px] text-brasa">
        {state.error ?? ''}
      </p>
    </form>
  );
}
