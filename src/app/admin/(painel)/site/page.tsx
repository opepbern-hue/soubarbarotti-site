import { saveSettings } from '@/app/admin/actions';
import { Flash } from '@/components/admin/AutoRefresh';
import { MediaField } from '@/components/admin/MediaField';
import { btnPrimary, Card, Check, Field, inputCls, PageHead } from '@/components/admin/ui';
import { adminMediaSelect, mediaInitial, okMessage } from '@/lib/admin-data';
import { DEFAULT_SETTINGS } from '@/lib/content';
import { prisma } from '@/lib/db';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SiteSettingsPage({ searchParams }: Props) {
  const [ok, row] = await Promise.all([
    okMessage(searchParams),
    prisma.siteSettings.findUnique({
      where: { id: 1 },
      include: {
        heroMedia: { select: adminMediaSelect },
        aboutMedia: { select: adminMediaSelect },
        ogMedia: { select: adminMediaSelect },
      },
    }),
  ]);

  const s = row ?? {
    ...DEFAULT_SETTINGS,
    heroMedia: null,
    aboutMedia: null,
    ogMedia: null,
  };

  const area = (name: string, value: string, rows = 3) => (
    <textarea name={name} defaultValue={value} rows={rows} className={`${inputCls} resize-y`} />
  );

  return (
    <>
      <Flash message={ok} />
      <PageHead
        title="Abertura, Sobre, Contato e SEO"
        intro="Configure o vídeo principal da abertura, frase de destaque, foto e textos da seção Sobre, canais de contato e compartilhamento (SEO)."
      />

      <div className="flex flex-col gap-8">
        {/* 1. Abertura & Frase de Destaque */}
        <Card id="abertura">
          <h2 className="mb-4 font-display text-[20px] font-semibold">Abertura & Frase de Destaque</h2>
          <form action={saveSettings} className="grid gap-5">
            <input type="hidden" name="group" value="abertura" />
            <input type="hidden" name="numbersUseCountersPresent" value="1" />
            <MediaField
              name="heroMediaId"
              kind="VIDEO"
              initial={mediaInitial(s.heroMedia)}
              label="Vídeo de fundo da Abertura"
              hint="Vídeo que roda em loop com cara de cinema no topo do site."
            />
            <Field label="Localização" hint="Exemplo: Palhoça, SC & Remoto">
              <input name="heroLocation" defaultValue={s.heroLocation.replace(/^●?\s*REC:\s*/i, '')} className={inputCls} />
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

            <div className="border-t border-linha pt-5 grid gap-4">
              <h3 className="font-display text-[16px] font-semibold">Frase Grande / Números (logo abaixo da abertura)</h3>
              <Check
                name="numbersUseCounters"
                label="Usar texto com contador animado ({{120}})"
                defaultChecked={s.numbersUseCounters}
                hint="Se desmarcado, exibe a frase principal abaixo."
              />
              <Field label="Frase principal (use **trecho** para destacar em laranja)">
                {area('numbersPhrase', s.numbersPhrase, 2)}
              </Field>
              <Field label="Frase com contador (ex.: Mais de **{{120}}+ projetos** entregues)">
                {area('numbersCounterText', s.numbersCounterText, 2)}
              </Field>
            </div>

            <div>
              <button className={btnPrimary}>Salvar Abertura</button>
            </div>
          </form>
        </Card>

        {/* 2. Seção Sobre */}
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

        {/* 3. Contato e Redes Sociais */}
        <Card id="contato">
          <h2 className="mb-4 font-display text-[20px] font-semibold">Contato & Redes Sociais</h2>
          <form action={saveSettings} className="grid gap-5">
            <input type="hidden" name="group" value="contato" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="E-mail de contato">
                <input name="contactEmail" type="email" defaultValue={s.contactEmail} placeholder="contato@soubarbarotti.com.br" className={inputCls} />
              </Field>
              <Field label="WhatsApp (com DDD e DDI 55)" hint="Ex.: 5548999924405">
                <input name="whatsapp" defaultValue={s.whatsapp} placeholder="5548999924405" className={inputCls} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Link do Instagram">
                <input name="instagramUrl" type="url" defaultValue={s.instagramUrl} placeholder="https://www.instagram.com/soubarbarotti/" className={inputCls} />
              </Field>
              <Field label="Link do LinkedIn (opcional)">
                <input name="linkedinUrl" type="url" defaultValue={s.linkedinUrl} className={inputCls} />
              </Field>
              <Field label="Link do YouTube (opcional)">
                <input name="youtubeUrl" type="url" defaultValue={s.youtubeUrl} className={inputCls} />
              </Field>
            </div>
            <div>
              <button className={btnPrimary}>Salvar Contato</button>
            </div>
          </form>
        </Card>

        {/* 4. Rodapé & Imagem de Compartilhamento (SEO) */}
        <Card id="rodape">
          <h2 className="mb-4 font-display text-[20px] font-semibold">Rodapé & Compartilhamento (SEO)</h2>
          <form action={saveSettings} className="grid gap-5">
            <input type="hidden" name="group" value="rodape" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Rodapé — Linha 1">
                <input name="footerLine1" defaultValue={s.footerLine1} className={inputCls} />
              </Field>
              <Field label="Rodapé — Linha 2">
                <input name="footerLine2" defaultValue={s.footerLine2} className={inputCls} />
              </Field>
            </div>
            <Field label="Frase de Entidade (JSON-LD / Google / IA)">
              {area('entityPhrase', s.entityPhrase, 2)}
            </Field>
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
              <button className={btnPrimary}>Salvar Rodapé & SEO</button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
