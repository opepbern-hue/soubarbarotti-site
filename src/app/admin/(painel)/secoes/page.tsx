import { saveSection } from '@/app/admin/actions';
import { Flash } from '@/components/admin/AutoRefresh';
import { btnPrimary, Card, Check, Field, inputCls, PageHead } from '@/components/admin/ui';
import { okMessage } from '@/lib/admin-data';
import { DEFAULT_SECTIONS } from '@/lib/content';
import { prisma } from '@/lib/db';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const SECTION_META: { key: string; name: string; hasText: boolean }[] = [
  { key: 'marcas', name: 'Faixa de Marcas / Clientes (Home)', hasText: false },
  { key: 'numeros', name: 'Frase de Destaque / Números (Home)', hasText: false },
  { key: 'trabalhos', name: 'Trabalhos em Destaque (Home)', hasText: true },
  { key: 'processo', name: 'Processo de Produção (Home)', hasText: true },
  { key: 'sobre', name: 'Sobre Mim (Home)', hasText: true },
  { key: 'planos', name: 'Planos / Formatos (Home)', hasText: true },
  { key: 'depoimentos', name: 'Depoimentos (Home)', hasText: true },
  { key: 'perguntas', name: 'Perguntas Frequentes / FAQ (Home)', hasText: true },
  { key: 'contato', name: 'Contato (Home e Rodapé de Páginas)', hasText: true },
  { key: 'pagina_trabalhos', name: 'Cabeçalho da Página /portfolio', hasText: true },
  { key: 'pagina_fotos', name: 'Cabeçalho da Página /fotos', hasText: true },
  { key: 'pagina_artes', name: 'Cabeçalho da Página /artes', hasText: true },
];

export default async function SecoesPage({ searchParams }: Props) {
  const [ok, rows] = await Promise.all([okMessage(searchParams), prisma.section.findMany()]);
  const byKey = new Map(rows.map((r) => [r.key, r]));

  return (
    <>
      <Flash message={ok} />
      <PageHead
        title="Seções & Títulos"
        intro="Ligue ou desligue qualquer seção do site e personalize os títulos e subtítulos."
      />

      <div className="grid gap-5">
        {SECTION_META.map((meta) => {
          const fallback = DEFAULT_SECTIONS[meta.key] ?? {
            key: meta.key,
            enabled: true,
            label: '',
            titleLine1: '',
            titleLine2: '',
            intro: '',
          };
          const row = byKey.get(meta.key);
          const s = {
            enabled: row ? row.enabled : fallback.enabled,
            label: (row ? row.label : fallback.label).replace(/^●?\s*REC:\s*/i, ''),
            titleLine1: row ? row.titleLine1 : fallback.titleLine1,
            titleLine2: row ? row.titleLine2 : fallback.titleLine2,
            intro: row ? row.intro : fallback.intro,
          };

          return (
            <Card key={meta.key} id={meta.key}>
              <form action={saveSection} className="grid gap-4">
                <input type="hidden" name="key" value={meta.key} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-[18px] font-semibold text-carvao">{meta.name}</h2>
                  <Check name="enabled" label="Seção ativa no site" defaultChecked={s.enabled} />
                </div>

                {meta.hasText ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Field label="Etiqueta superior (opcional)">
                        <input name="label" defaultValue={s.label} placeholder="Ex.: Processo" className={inputCls} />
                      </Field>
                      <Field label="Título — Linha 1">
                        <input name="titleLine1" defaultValue={s.titleLine1} className={inputCls} />
                      </Field>
                      <Field label="Título — Linha 2 (destaque suave)">
                        <input name="titleLine2" defaultValue={s.titleLine2} className={inputCls} />
                      </Field>
                    </div>
                    <Field label="Texto de introdução (opcional)">
                      <textarea name="intro" defaultValue={s.intro} rows={2} className={`${inputCls} resize-y`} />
                    </Field>
                  </>
                ) : null}

                <div>
                  <button type="submit" className={btnPrimary}>
                    Salvar seção
                  </button>
                </div>
              </form>
            </Card>
          );
        })}
      </div>
    </>
  );
}

