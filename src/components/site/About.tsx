import Link from 'next/link';
import type { PhotoView, SectionView, SettingsView } from '@/lib/content';
import { RollText } from './Hud';
import { Picture } from './Picture';
import { ScrollReveal, SplitText } from './ScrollReveal';
import { Fill } from './Text';

export function About({
  section,
  settings,
  photos = [],
}: {
  section: SectionView;
  settings: SettingsView;
  photos?: PhotoView[];
}) {
  const bioParagraphs = (settings.aboutBio || '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\[PREENCHER[^\]]*\]/g, '').trim())
    .filter(Boolean);

  const pillarTitles =
    Array.isArray(settings.heroList) && settings.heroList.length >= 3
      ? settings.heroList.slice(0, 3)
      : ['Direção Cinematográfica', 'IA & Motion Design', 'Estética que Vende'];

  const pillars = [0, 1, 2].map((idx) => ({
    title: pillarTitles[idx] || `Pilar 0${idx + 1}`,
    body: bioParagraphs[idx] || '',
  })).filter((p) => p.body);

  const extraBio = bioParagraphs.slice(3).join(' ');
  const realPhotos = photos.filter((p) => p.media && !p.media.placeholder).slice(0, 5);
  const portraitMedia =
    settings.aboutMedia && !settings.aboutMedia.placeholder
      ? settings.aboutMedia
      : realPhotos[0]?.media ?? null;

  return (
    <section
      id="sobre"
      aria-label="Sobre Barbarotti"
      className="home-pillars_wrap relative scroll-mt-16 overflow-hidden bg-paragon-black py-[80px] text-paragon-white lg:py-[140px]"
    >
      {/* Fita Vetorial S-Curve em Teal (#508992) idêntica à seção Always in Pursuit da Paragon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-[-8%] z-0 w-[85%] max-w-[980px] opacity-90 lg:right-[-2%]"
      >
        <svg viewBox="0 0 1000 540" fill="none" className="h-auto w-full">
          <path
            d="M920 -40C720 40 520 90 540 185C560 280 860 220 840 340C820 460 420 460 80 520"
            stroke="#508992"
            strokeWidth="74"
            strokeLinecap="butt"
          />
          <path
            d="M920 -40C720 40 520 90 540 185C560 280 860 220 840 340C820 460 420 460 80 520"
            stroke="#100f0f"
            strokeWidth="2"
            strokeDasharray="12 12"
          />
        </svg>
      </div>

      <div className="paragon-container relative z-10">
        {/* Parte 1: Kicker + Título H1 (96px) + 3 Pilares Editoriais (home-pillars_wrap) */}
        <div className="max-w-[780px]">
          <p className="text-paragon-kicker mb-4 text-paragon-white/85">
            {(section.label || settings.aboutTag || 'DIREÇÃO & MOTION DESIGN').replace(/^\[|\]$/g, '')}
          </p>
          <h2 className="text-paragon-h1 text-paragon-white">
            <ScrollReveal as="span" delay={40}>
              <span className="block">
                <SplitText text={section.titleLine1 || 'Quem dirige'} speed="slow" mode="words" />
              </span>
              {section.titleLine2 ? (
                <span className="block">
                  <SplitText text={section.titleLine2} speed="slow" mode="words" delay={80} />
                </span>
              ) : null}
            </ScrollReveal>
          </h2>
        </div>

        {pillars.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-10 lg:mt-20 lg:grid-cols-3 lg:gap-8">
            {pillars.map((pillar, i) => (
              <ScrollReveal key={i} delay={80 + i * 70}>
                <article className="flex flex-col">
                  <h3 className="text-paragon-h4 text-paragon-white">
                    <Fill text={pillar.title} />
                  </h3>
                  <hr className="my-4 border-t border-paragon-white/30" />
                  <p className="text-paragon-body text-paragon-white/85">
                    <Fill text={pillar.body} />
                  </p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        ) : null}

        {/* Parte 2: Seção Polaroid Showcase (home-gallery_wrap da Paragon — STYLE 14) */}
        <div className="mt-24 border-t border-paragon-white/20 pt-20 lg:mt-36 lg:pt-28">
          <div className="mx-auto flex max-w-[820px] flex-col items-center text-center">
            <p className="text-paragon-kicker mb-3 text-paragon-red">
              <Fill text={settings.aboutRole || 'Diretor Criativo & Vídeos com IA'} />
            </p>
            <h3 className="text-paragon-h1 text-paragon-white">
              <ScrollReveal as="span" delay={40}>
                <SplitText
                  text={`${settings.aboutName || 'Barbarotti'} — Direção Criativa`}
                  speed="slow"
                  mode="words"
                />
              </ScrollReveal>
            </h3>
            {extraBio ? (
              <p className="text-paragon-body mt-5 max-w-[540px] text-paragon-white/80">
                <Fill text={extraBio} />
              </p>
            ) : null}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <Link href="/#contato" className="u-button u-button--red">
                <RollText text="Iniciar um projeto" />
              </Link>
              {settings.instagramUrl ? (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener"
                  className="u-button u-button--dark"
                >
                  <RollText text="Instagram @soubarbarotti" />
                </a>
              ) : null}
            </div>
          </div>

          {/* Mural de Molduras Polaroid Inclinadas (#f8f8f8) com Retrato do Diretor e Fotografias Reais */}
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-12">
            {/* Polaroid 1: Retrato Principal do Barbarotti */}
            <div className="paragon-polaroid-item mx-auto w-full max-w-[340px] border border-paragon-black bg-paragon-white p-3 pb-8 text-paragon-black shadow-2xl transition-transform duration-500 hover:rotate-0">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-paragon-grey-600">
                {portraitMedia ? (
                  <Picture
                    media={portraitMedia}
                    alt={`Foto de ${settings.aboutName}`}
                    sizes="(min-width: 1024px) 320px, 80vw"
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/barbarotti-about.jpg"
                    alt={`Foto de ${settings.aboutName}`}
                    className="h-full w-full object-cover object-top"
                  />
                )}
              </div>
              <div className="mt-3 flex items-center justify-between font-kicker text-[12px] text-paragon-black uppercase">
                <span>{settings.aboutName}</span>
                <span>{settings.heroLocation || 'Palhoça, SC'}</span>
              </div>
            </div>

            {/* Polaroids 2 e 3: Fotografias Autorais Reais do Acervo */}
            {realPhotos.slice(0, 2).map((item, idx) => (
              <Link
                key={item.id}
                href="/fotos"
                className="paragon-polaroid-item group mx-auto block w-full max-w-[340px] border border-paragon-black bg-paragon-white p-3 pb-8 text-paragon-black shadow-2xl transition-transform duration-500 hover:rotate-0"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-paragon-grey-600">
                  <Picture
                    media={item.media}
                    alt={item.title || `Fotografia autoral ${idx + 1} de Barbarotti`}
                    sizes="(min-width: 1024px) 320px, 80vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between font-kicker text-[12px] text-paragon-black uppercase">
                  <span>{item.title || `Acervo #0${idx + 1}`}</span>
                  <span>Ver fotos ↗</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
