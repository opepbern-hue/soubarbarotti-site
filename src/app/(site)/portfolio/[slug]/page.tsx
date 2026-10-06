import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AutoVideo } from '@/components/site/AutoVideo';
import { Contact } from '@/components/site/Contact';
import { RecLabel } from '@/components/site/Hud';
import { JsonLd } from '@/components/site/JsonLd';
import { Picture } from '@/components/site/Picture';
import { ProjectStage } from '@/components/site/ProjectStage';
import { Fill, Paragraphs } from '@/components/site/Text';
import { WorkRow } from '@/components/site/WorkRow';
import { getProject, getSections, getSettings } from '@/lib/content';
import { absolute, projectJsonLd } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

// Campo "vazio" = sem texto ou só com a marca [PREENCHER]: a seção não aparece
const filled = (v: string | null | undefined) => !!v && !/^\s*\[PREENCHER[^\]]*\]\s*$/.test(v);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) return { title: 'Projeto não encontrado' };
  const p = data.project;
  const title = p.seoTitle || (filled(p.category) ? `${p.title}: ${p.category}` : p.title);
  const description =
    p.seoDescription || (filled(p.shortDescription) ? p.shortDescription : `Vídeo com IA generativa dirigido por Barbarotti (@soubarbarotti): ${p.title}.`);
  const image = p.media?.img?.src ? absolute(p.media.img.src) : absolute('/og.png');
  return {
    title,
    description,
    alternates: { canonical: `/portfolio/${p.slug}` },
    openGraph: { type: 'video.other', url: `/portfolio/${p.slug}`, title, description, images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [data, sections, settings] = await Promise.all([getProject(slug), getSections(), getSettings()]);
  if (!data) notFound();
  const { project: p, next } = data;
  const contact = sections['contato'];

  const credits = p.credits.filter((c) => filled(c.tools) || filled(c.role));
  const facts = (
    [
      ['Categoria', p.category],
      ['Cliente', p.client],
      ['Entrega', p.deliverable],
      ['Local', p.location],
    ] as const
  ).filter(([, v]) => filled(v));
  const blocks = p.blocks.filter((b) => filled(b.title) || filled(b.text));
  const gallery = p.gallery.filter((g) => g.media && !g.media.placeholder);
  const hasDetails = credits.length || facts.length > 1 || blocks.length || gallery.length || filled(p.shortDescription);

  return (
    <article>
      <JsonLd data={projectJsonLd(p)} />

      <ProjectStage media={p.media} fullVideo={p.fullVideo} url={p.fullVideoUrl} title={p.title} category={filled(p.category) ? p.category : ''} />

      {credits.length ? (
        <section aria-label="Créditos" className="marquee-host overflow-hidden border-b border-linha py-5">
          <div className="marquee" style={{ ['--marquee-duration' as string]: `${Math.max(30, credits.length * 9)}s` }}>
            {[false, true].map((dup) => (
              <ul key={String(dup)} data-dup={dup ? '' : undefined} aria-hidden={dup || undefined} className="flex shrink-0 items-center">
                {credits.map((c, i) => (
                  <li key={i} className="flex items-center gap-3 whitespace-nowrap px-6">
                    <span className="font-display text-[13px] font-medium uppercase tracking-[0.04em] text-fumaca">
                      <Fill text={c.stage} />
                    </span>
                    {filled(c.role) ? <span className="text-[16px] font-medium">{c.role}</span> : null}
                    {filled(c.tools) ? <span className="text-[16px]">{c.tools}</span> : null}
                    <span aria-hidden className="ml-6 inline-block size-[5px] rotate-45 bg-laranja" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </section>
      ) : null}

      <div className="px-5 lg:px-[140px]">
        {hasDetails ? (
          <>
            {filled(p.shortDescription) ? (
              <p className="max-w-[760px] pt-[60px] font-display text-[24px] leading-[1.25] tracking-[-0.01em] md:text-[30px] lg:pt-[100px]">{p.shortDescription}</p>
            ) : null}

            {facts.length ? (
              <dl className="grid gap-8 py-[50px] md:grid-cols-4 md:gap-6 lg:py-[90px]">
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-display text-[14px] font-medium uppercase tracking-[0.04em] text-fumaca">{k}</dt>
                    <dd className="mt-3 text-[18px] leading-[1.3]">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {blocks.length ? (
              <div className="flex flex-col gap-[60px] pb-[70px] lg:gap-[90px] lg:pb-[110px]">
                {blocks.map((b) => (
                  <section key={b.key} className="grid gap-4 md:grid-cols-[1fr_minmax(0,500px)] md:gap-10">
                    <h2 className="font-display text-[14px] font-medium uppercase tracking-[0.04em] text-fumaca">{b.label}</h2>
                    <div>
                      {filled(b.title) ? <p className="text-[18px] font-medium leading-[1.3]">{b.title}</p> : null}
                      {filled(b.text) ? (
                        <div className="mt-3 flex flex-col gap-3 text-[16px] leading-[1.5] text-fumaca">
                          <Paragraphs text={b.text} />
                        </div>
                      ) : null}
                    </div>
                  </section>
                ))}
              </div>
            ) : null}

            {gallery.length ? (
              <section aria-label="Frames e bastidores" className="pb-[60px] lg:pb-[110px]">
                <ul className="grid gap-5 md:grid-cols-2 lg:gap-[30px]">
                  {gallery.map((g) => (
                    <li key={g.id}>
                      <figure>
                        <div className="on-video relative aspect-square overflow-hidden bg-carvao">
                          {g.media?.kind === 'VIDEO' ? (
                            <AutoVideo media={g.media} mode="visible" sizes="(min-width: 810px) 50vw, 100vw" />
                          ) : (
                            <Picture
                              media={g.media}
                              alt={g.caption || g.media?.alt || ''}
                              sizes="(min-width: 810px) 50vw, 100vw"
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                          <span className="absolute left-4 top-4 rounded-full bg-carvao/55 px-3 py-1 font-display text-[11px] font-medium uppercase tracking-[0.08em] text-white backdrop-blur-sm">
                            {g.kind === 'FRAME' ? 'Frame' : 'Bastidor'}
                          </span>
                        </div>
                        {g.caption ? <figcaption className="mt-3 text-[14px] text-fumaca">{g.caption}</figcaption> : null}
                      </figure>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : null}

        {next ? (
          <section aria-label="Próximo projeto" className="pb-[80px] pt-[60px] lg:pb-[120px] lg:pt-[90px]">
            <RecLabel>REC: Próximo projeto</RecLabel>
            <div className="mt-6 border-t border-linha">
              <WorkRow project={next} as="h2" />
            </div>
          </section>
        ) : null}
      </div>

      {contact && contact.enabled ? <Contact section={contact} settings={settings} /> : null}
    </article>
  );
}
