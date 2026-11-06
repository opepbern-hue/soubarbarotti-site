import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AutoVideo } from '@/components/site/AutoVideo';
import { Contact } from '@/components/site/Contact';
import { Container } from '@/components/site/Hud';
import { JsonLd } from '@/components/site/JsonLd';
import { Picture } from '@/components/site/Picture';
import { ProjectStage } from '@/components/site/ProjectStage';
import { Fill, Paragraphs } from '@/components/site/Text';
import { WorkRow } from '@/components/site/WorkRow';
import { getProject, getSections, getSettings } from '@/lib/content';
import { absolute, projectJsonLd } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

// Filtra qualquer campo vazio ou que contenha marcador interno [PREENCHER...]
const filled = (v: string | null | undefined) => !!v && v.trim().length > 0 && !/\[PREENCHER/i.test(v);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) return { title: 'Projeto não encontrado' };
  const p = data.project;
  const title = p.seoTitle || (filled(p.category) ? `${p.title}: ${p.category}` : p.title);
  const description =
    p.seoDescription ||
    (filled(p.shortDescription)
      ? p.shortDescription
      : `Vídeo com IA generativa dirigido por Barbarotti (@soubarbarotti): ${p.title}.`);
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
  const hasDetails = credits.length || facts.length > 0 || blocks.length || gallery.length || filled(p.shortDescription);

  return (
    <article className="bg-paragon-black text-paragon-white">
      <JsonLd data={projectJsonLd(p)} />

      <ProjectStage
        media={p.media}
        fullVideo={p.fullVideo}
        url={p.fullVideoUrl}
        title={p.title}
        category={filled(p.category) ? p.category : ''}
        client={filled(p.client) ? p.client : undefined}
      />

      <Container className="py-[64px] lg:py-[110px]">
        {hasDetails ? (
          <>
            {/* Resumo Executivo e Ficha Técnica Arquitetônica (4 colunas com borda 1px solid) */}
            {filled(p.shortDescription) ? (
              <div className="mb-12 max-w-[880px] lg:mb-16">
                <p className="text-paragon-kicker mb-3 text-paragon-red">SINOPSE DO PROJETO</p>
                <p className="text-paragon-h3 text-paragon-white">{p.shortDescription}</p>
              </div>
            ) : null}

            {facts.length ? (
              <dl className="mb-16 grid grid-cols-1 border-t border-l border-paragon-white/22 sm:grid-cols-2 lg:mb-24 lg:grid-cols-4">
                {facts.map(([k, v]) => (
                  <div key={k} className="border-r border-b border-paragon-white/22 p-5 lg:p-7">
                    <dt className="font-kicker text-[12px] text-paragon-grey-400 uppercase">{k}</dt>
                    <dd className="text-paragon-h5 mt-2 text-paragon-white">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {/* Blocos de Estudo de Caso (THE ASK / APPROACH / HOW IT HAPPENED da Paragon) */}
            {blocks.length ? (
              <div className="border-t border-paragon-white/22">
                {blocks.map((b, idx) => (
                  <section
                    key={b.key}
                    className="grid grid-cols-1 gap-6 border-b border-paragon-white/22 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16"
                  >
                    <div className="lg:col-span-5">
                      <span className="font-kicker text-[12px] text-paragon-red uppercase">
                        [0{idx + 1}]
                      </span>
                      <h2 className="text-paragon-h2 mt-1 text-paragon-white">{b.label}</h2>
                    </div>
                    <div className="lg:col-span-7">
                      {filled(b.title) ? (
                        <p className="text-paragon-h4 mb-4 text-paragon-white">{b.title}</p>
                      ) : null}
                      {filled(b.text) ? (
                        <div className="text-paragon-body flex flex-col gap-4 text-paragon-white/85">
                          <Paragraphs text={b.text} />
                        </div>
                      ) : null}
                    </div>
                  </section>
                ))}
              </div>
            ) : null}

            {/* Galeria de Frames e Bastidores (STILLS & BTS da Paragon — apenas mídias reais) */}
            {gallery.length ? (
              <section aria-label="Frames e bastidores" className="mt-20 lg:mt-28">
                <div className="mb-8 flex items-end justify-between">
                  <h2 className="text-paragon-h1 text-paragon-white">Frames &amp; Bastidores</h2>
                  <span className="font-kicker text-[13px] text-paragon-grey-400 uppercase">
                    [{gallery.length} ITENS]
                  </span>
                </div>
                <ul className="grid grid-cols-1 border-t border-l border-paragon-white/22 md:grid-cols-2">
                  {gallery.map((g) => (
                    <li key={g.id} className="border-r border-b border-paragon-white/22 p-4 lg:p-6">
                      <figure>
                        <div className="on-video relative aspect-[16/10] overflow-hidden bg-paragon-grey-600">
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
                          <span className="absolute top-3 left-3 border border-paragon-white/30 bg-paragon-black/80 px-2.5 py-1 font-kicker text-[11px] text-paragon-white uppercase">
                            {g.kind === 'FRAME' ? 'Still / Frame' : 'Bastidor / BTS'}
                          </span>
                        </div>
                        {filled(g.caption) ? (
                          <figcaption className="mt-3 font-sans text-[14px] text-paragon-grey-400">
                            {g.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Créditos Técnicos (CREDITS da Paragon — exibido apenas quando houver créditos reais preenchidos) */}
            {credits.length ? (
              <section aria-label="Créditos" className="mt-20 border-t border-paragon-white/22 pt-14 lg:mt-28">
                <h2 className="text-paragon-h2 mb-8 text-paragon-white">Créditos</h2>
                <dl className="grid grid-cols-1 border-t border-l border-paragon-white/22 sm:grid-cols-2 lg:grid-cols-3">
                  {credits.map((c, i) => (
                    <div key={i} className="border-r border-b border-paragon-white/22 p-5">
                      <dt className="font-kicker text-[12px] text-paragon-red uppercase">
                        <Fill text={c.stage} />
                      </dt>
                      {filled(c.role) ? (
                        <dd className="text-paragon-h5 mt-1 text-paragon-white">{c.role}</dd>
                      ) : null}
                      {filled(c.tools) ? (
                        <dd className="mt-1 font-sans text-[14px] text-paragon-grey-400">{c.tools}</dd>
                      ) : null}
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </>
        ) : null}

        {/* Próximo Projeto (DISCOVER NEXT PROJECT da Paragon) */}
        {next ? (
          <section aria-label="Próximo projeto" className="mt-20 lg:mt-28">
            <WorkRow project={next} as="h2" />
          </section>
        ) : null}
      </Container>

      {contact && contact.enabled ? <Contact section={contact} settings={settings} /> : null}
    </article>
  );
}
