'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { RollText } from './Hud';

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
    'block h-12 w-full rounded-none border border-paragon-black bg-paragon-white px-4 font-sans text-[15px] text-paragon-black placeholder:text-paragon-grey-500 focus:bg-paragon-grey-100/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-paragon-blue';
  const label = 'mb-2 block font-kicker text-[13px] font-medium uppercase text-paragon-black';

  if (state.kind === 'sent') {
    return (
      <div
        role="status"
        className="w-full border border-paragon-black bg-paragon-blue-light p-8 text-left text-paragon-black"
      >
        <p className="text-paragon-h3">Recebi a sua mensagem.</p>
        <p className="text-paragon-body mt-2">Eu respondo pessoalmente no e-mail que você deixou.</p>
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setState({ kind: 'idle' });
          }}
          className="u-button u-button--white mt-6"
        >
          <RollText text="Enviar outra mensagem" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-6 text-left" noValidate={false}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="c-nome" className={label}>
            Nome *
          </label>
          <input
            id="c-nome"
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            placeholder="Seu nome"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="c-email" className={label}>
            E-mail *
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            placeholder="voce@suamarca.com.br"
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="c-msg" className={label}>
          Mensagem *
        </label>
        <textarea
          id="c-msg"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          placeholder="Conte do projeto: o que é, para quando e onde o vídeo vai rodar."
          className={`${field} h-[136px] resize-y py-3`}
        />
      </div>

      {/* Campo-armadilha: invisível para pessoas, robôs costumam preencher */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="c-site">Site</label>
        <input id="c-site" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={state.kind === 'sending'}
          className="u-button u-button--red h-12 px-8 disabled:opacity-60"
        >
          <RollText text={state.kind === 'sending' ? 'Enviando…' : 'Enviar mensagem'} />
        </button>

        <p className="font-sans text-[12px] leading-[1.4] text-paragon-grey-500">
          Ao enviar, você concorda com a{' '}
          <Link href="/privacidade" className="font-medium text-paragon-black underline underline-offset-2">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>

      <p aria-live="assertive" className="font-kicker text-[13px] text-paragon-red uppercase empty:hidden">
        {state.kind === 'error' ? state.message : ''}
      </p>
    </form>
  );
}
