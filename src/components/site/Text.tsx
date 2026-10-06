import { Fragment, type ReactNode } from 'react';

const FILL_SPLIT = /(\[PREENCHER[^\]]*\])/g;
const FILL_ONLY = /^\[PREENCHER[^\]]*\]$/;

/** Mostra o texto destacando cada `[PREENCHER: …]` para ficar visível até ser preenchido. */
export function Fill({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(FILL_SPLIT);
  return (
    <>
      {parts.map((part, i) =>
        FILL_ONLY.test(part) ? (
          <mark key={i} className="preencher">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** `**trecho**` vira destaque em Brasa (usado na frase grande). */
export function Highlight({ text, render }: { text: string; render?: (chunk: string, key: number) => ReactNode }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\*\*([^*]+)\*\*$/);
        if (m) {
          return (
            <span key={i} className="font-semibold text-brasa">
              {render ? render(m[1], i) : <Fill text={m[1]} />}
            </span>
          );
        }
        return <Fragment key={i}>{render ? render(part, i) : <Fill text={part} />}</Fragment>;
      })}
    </>
  );
}

/** Texto com parágrafos separados por linha em branco. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} className={className}>
          <Fill text={p} />
        </p>
      ))}
    </>
  );
}

export function hasFill(text: string | null | undefined): boolean {
  return !!text && /\[PREENCHER/.test(text);
}
