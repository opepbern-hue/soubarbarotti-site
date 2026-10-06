import type { SectionView, SettingsView } from '@/lib/content';
import { Container, SectionHeading } from './Hud';
import { ArrowUpRight } from './icons';
import { Picture } from './Picture';
import { ScrollReveal, SplitText } from './ScrollReveal';
import { Paragraphs } from './Text';

/** Layout da seção de equipe do Rushes, adaptado para uma pessoa só. */
export function About({ section, settings }: { section: SectionView; settings: SettingsView }) {
  const photo = settings.aboutMedia;
  return (
    <section id="sobre" className="scroll-mt-16 py-[80px] lg:py-[75px]">
      <Container>
        <SectionHeading label={section.label} line1={section.titleLine1} line2={section.titleLine2} intro={section.intro} />
        <div className="mt-[50px] grid gap-[30px] md:mt-[60px] md:grid-cols-2">
          <ScrollReveal delay={100}>
            <article className="on-video relative aspect-[350/410] overflow-hidden rounded-2xl border border-white/15 bg-black text-white shadow-2xl md:aspect-[370/410] lg:aspect-[605/400]">
              {photo && !photo.placeholder ? (
                // Foto enviada pelo admin
                <Picture
                  media={photo}
                  alt={`Foto de ${settings.aboutName}`}
                  sizes="(min-width: 810px) 50vw, 100vw"
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/barbarotti-about.jpg"
                  alt={`Foto de ${settings.aboutName}`}
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                />
              )}
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.35)_0%,rgba(0,0,0,0)_35%,rgba(0,0,0,0)_55%,rgba(0,0,0,.75)_100%)]" />
              <p className="absolute left-5 top-6 font-display text-[14px] font-medium uppercase tracking-[0.04em] text-white/90 md:left-10 md:top-10">
                <SplitText text={settings.aboutTag || '[Direção & IA]'} speed="medium" mode="chars" />
              </p>

              {settings.instagramUrl ? (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram @soubarbarotti (abre em nova aba)"
                  className="absolute right-5 top-5 grid size-12 place-items-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105 md:right-10 md:top-10"
                >
                  <ArrowUpRight className="size-5" />
                </a>
              ) : null}
              <div className="absolute bottom-6 left-5 right-5 md:bottom-10 md:left-10">
                <h3 className="font-display text-[24px] font-medium leading-[1.2] tracking-[-0.01em]">
                  <SplitText text={settings.aboutName} speed="slow" mode="chars" delay={50} />
                </h3>
                <p className="mt-1 font-display text-[14px] font-medium uppercase tracking-[0.04em]">
                  <SplitText text={settings.aboutRole} speed="medium" mode="chars" delay={120} />
                </p>
              </div>
            </article>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-col justify-center gap-5 text-[18px] leading-[1.45] md:pl-4 lg:pl-10 lg:text-[19px]">
              <Paragraphs text={settings.aboutBio} />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}

