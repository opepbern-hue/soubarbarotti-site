'use client';

import { useEffect, useState } from 'react';

export type Idea = { id: string; title: string; text: string };
export type IdeaGroup = { key: string; title: string; ideas: Idea[] };

const STORAGE_KEY = 'ideias-barbarotti-feitas';

/** Lista de ideias com checklist. As marcações ficam salvas só neste navegador. */
export function IdeasChecklist({ groups }: { groups: IdeaGroup[] }) {
  const [done, setDone] = useState<Record<string, true>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // sem armazenamento: a página funciona do mesmo jeito, sem lembrar as marcações
    }
  }, []);

  function toggle(id: string) {
    setDone((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // idem
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-12">
      {groups.map((g) => {
        const total = g.ideas.length;
        const count = g.ideas.filter((i) => done[i.id]).length;
        return (
          <section key={g.key} aria-labelledby={`g-${g.key}`}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
              <h2 id={`g-${g.key}`} className="font-display text-[22px] font-bold tracking-[-0.02em] text-carvao md:text-[26px]">
                {g.title}
              </h2>
              <span className="font-mono text-[13px] text-fumaca">
                {count} de {total} feitas
              </span>
            </div>
            <ul className="border-t border-linha">
              {g.ideas.map((idea) => {
                const checked = !!done[idea.id];
                return (
                  <li key={idea.id} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b border-linha py-5">
                    <input
                      id={idea.id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(idea.id)}
                      className="row-span-2 mt-1 size-5 accent-[#ff6a00]"
                    />
                    <label htmlFor={idea.id} className={`cursor-pointer font-display text-[17px] font-semibold leading-[1.3] ${checked ? 'text-fumaca line-through' : 'text-carvao'}`}>
                      <span className="mr-2 font-mono text-[13px] font-medium text-brasa no-underline">{idea.id.toUpperCase()}</span>
                      {idea.title}
                    </label>
                    <p className={`max-w-[68ch] text-[15px] leading-[1.45] text-fumaca ${checked ? 'opacity-60' : ''}`}>{idea.text}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
