'use client';

import { useActionState } from 'react';
import { changePasswordAction, type PasswordState } from '@/app/admin/actions';
import { btnPrimary, Field, inputCls } from '@/components/admin/ui';

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="grid max-w-[420px] gap-4">
      <Field label="Senha atual">
        <input name="atual" type="password" required autoComplete="current-password" className={inputCls} />
      </Field>
      <Field label="Senha nova" hint="Pelo menos 10 caracteres. Uma frase comprida é mais segura que uma palavra com símbolos.">
        <input name="nova" type="password" required minLength={10} autoComplete="new-password" className={inputCls} />
      </Field>
      <Field label="Repita a senha nova">
        <input name="confirma" type="password" required minLength={10} autoComplete="new-password" className={inputCls} />
      </Field>
      <div>
        <button className={btnPrimary} disabled={pending}>
          {pending ? 'Trocando…' : 'Trocar senha'}
        </button>
      </div>
      <p aria-live="polite" className={`text-[14px] ${state.ok ? 'text-[#1f6b35]' : 'text-brasa'}`}>
        {state.ok ? 'Senha trocada. Os outros aparelhos foram desconectados.' : (state.error ?? '')}
      </p>
    </form>
  );
}
