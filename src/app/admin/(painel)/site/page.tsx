import { saveSettings } from '@/app/admin/actions';
import { Flash } from '@/components/admin/AutoRefresh';
import { MediaField } from '@/components/admin/MediaField';
import { btnPrimary, Card, Field, inputCls, PageHead } from '@/components/admin/ui';
import { adminMediaSelect, mediaInitial, okMessage } from '@/lib/admin-data';
import { prisma } from '@/lib/db';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SiteSettingsPage({ searchParams }: Props) {
  const [ok, s] = await Promise.all([
    okMessage(searchParams),
    prisma.siteSettings.findUniqueOrThrow({
      where: { id: 1 },
      include: {
        heroMedia: { select: adminMediaSelect },
        aboutMedia: { select: adminMediaSelect },
        ogMedia: { select: adminMediaSelect },
      },
    }),
  ]);

  const area = (name: string, value: string, rows = 3) => (
    <textarea name={name} defaultValue={value} rows={rows} className={`${inputCls} resize-y`} />
  );

  return (
    <>
      <Flash message={ok} />
      <PageHead
        title="Abertura e Sobre"
        intro="Configure o vídeo principal que roda na abertura e a foto de destaque da seção Sobre."
      />

      <div className="flex flex-col gap-8">
        {/* Vídeo da Abertura */}
        <Card id="abertura">
          <h2 className="mb-4 font-display text-[20px] font-semibold">Vídeo da Abertura</h2>
          <form action={saveSettings} className="grid gap-5">
            <input type="hidden" name="group" value="abertura" />
            <MediaField
              name="heroMediaId"
              kind="VIDEO"
              initial={mediaInitial(s.heroMedia)}
              label="Vídeo de fundo da Abertura"
              hint="Vídeo que roda em loop com cara de cinema no topo do site."
            />
            <Field label="Localização / Selo REC" hint="Exemplo: Palhoça, SC & remoto">
              <input name="heroLocation" defaultValue={s.heroLocation} className={inputCls} />
            </Field>
            <Field label="Frase da abertura">
              {area('heroTagline', s.heroTagline, 2)}
            </Field>
            <Field label="Especialidades / Tipos de vídeo (um por linha)">
              {area(
                'heroList',
                (Array.isArray(s.heroList) ? (s.heroList as string[]) : []).join('\n'),
                4,
              )}
            </Field>
            <div>
              <button className={btnPrimary}>Salvar Abertura</button>
            </div>
          </form>
        </Card>

        {/* Foto do Sobre */}
        <Card id="sobre">
          <h2 className="mb-4 font-display text-[20px] font-semibold">Seção Sobre</h2>
          <form action={saveSettings} className="grid gap-5">
            <input type="hidden" name="group" value="sobre" />
            <MediaField
              name="aboutMediaId"
              kind="IMAGE"
              initial={mediaInitial(s.aboutMedia)}
              label="Foto de perfil / retrato"
              hint="Sua foto que aparece no card Sobre."
            />
            <Field label="Etiqueta do card">
              <input name="aboutTag" defaultValue={s.aboutTag} className={inputCls} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome">
                <input name="aboutName" defaultValue={s.aboutName} className={inputCls} />
              </Field>
              <Field label="Função / Cargo">
                <input name="aboutRole" defaultValue={s.aboutRole} className={inputCls} />
              </Field>
            </div>
            <Field label="Biografia / Apresentação">
              {area('aboutBio', s.aboutBio, 5)}
            </Field>
            <div>
              <button className={btnPrimary}>Salvar Sobre</button>
            </div>
          </form>
        </Card>

        {/* Imagem de Compartilhamento (Redes / WhatsApp) */}
        <Card id="rodape">
          <h2 className="mb-4 font-display text-[20px] font-semibold">Imagem de Compartilhamento (SEO)</h2>
          <form action={saveSettings} className="grid gap-5">
            <input type="hidden" name="group" value="rodape" />
            <MediaField
              name="ogMediaId"
              kind="IMAGE"
              initial={mediaInitial(s.ogMedia)}
              label="Imagem ao enviar o link (WhatsApp, Twitter, LinkedIn)"
              hint="Tamanho recomendado: 1200 × 630 px."
            />
            <Field label="Título de SEO">
              <input name="seoTitle" defaultValue={s.seoTitle} className={inputCls} />
            </Field>
            <Field label="Descrição de SEO">
              {area('seoDescription', s.seoDescription, 2)}
            </Field>
            <div>
              <button className={btnPrimary}>Salvar SEO</button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
