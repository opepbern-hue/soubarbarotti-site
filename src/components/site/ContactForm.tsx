'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

export function ContactForm() {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const startedAt = useRef(Date.now());

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, elapsedMs: Date.now() - startedAt.current }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'Não consegui enviar agora. Tente de novo em instantes.');
      form.reset();
      setState({ kind: 'sent' });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : 'Erro ao enviar.' });
    }
  }

  const field =
    'block h-10 w-full rounded-[2px] bg-branco-tela px-3 text-[14px] text-carvao ring-1 ring-linha placeholder:text-fumaca/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brasa';
  const label = 'mb-2 block text-[12px] font-medium';

  if (state.kind === 'sent') {
    return (
      <div role="status" className="mx-auto mt-12 w-full max-w-[600px] bg-branco-tela px-6 py-10 text-center ring-1 ring-linha">
        <p className="font-display text-[22px] font-medium tracking-[-0.01em]">Recebi a sua mensagem.</p>
        <p className="mt-2 text-[16px] text-fumaca">Eu respondo no e-mail que você deixou.</p>
        <button type="button" onClick={() => setState({ kind: 'idle' })} className="mt-6 text-[14px] font-medium text-brasa underline underline-offset-4">
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-12 flex w-full max-w-[600px] flex-col gap-[25px] text-left" noValidate={false}>
      <div>
        <label htmlFor="c-nome" className={label}>
          Nome*
        </label>
        <input id="c-nome" name="name" required maxLength={120} autoComplete="name" placeholder="Seu nome" className={field} />
      </div>
      <div>
        <label htmlFor="c-email" className={label}>
          E-mail*
        </label>
        <input id="c-email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder="voce@suamarca.com.br" className={field} />
      </div>
      <div>
        <label htmlFor="c-msg" className={label}>
          Mensagem*
        </label>
        <textarea
          id="c-msg"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          placeholder="Conte do projeto: o que é, para quando e onde o vídeo vai rodar."
          className={`${field} h-[110px] resize-y py-2.5`}
        />
      </div>
      {/* Campo-armadilha: invisível para pessoas, robôs costumam preencher */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="c-site">Site</label>
        <input id="c-site" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button
        type="submit"
        disabled={state.kind === 'sending'}
        className="h-11 w-full rounded-full bg-black hover:bg-zinc-800 font-display text-[14px] font-semibold uppercase text-white shadow-lg transition-all active:scale-[0.99] disabled:opacity-60"
      >
        {state.kind === 'sending' ? 'Enviando…' : 'Enviar Mensagem'}
      </button>
      <p className="text-center text-[12px] leading-[1.4] text-fumaca">
        Ao enviar, você concorda com a{' '}
        <Link href="/privacidade" className="text-black font-semibold underline underline-offset-2">
          Política de Privacidade
        </Link>
        .
      </p>
      <p aria-live="assertive" className="text-center text-[14px] text-brasa empty:hidden">
        {state.kind === 'error' ? state.message : ''}
      </p>
    </form>
  );
}
