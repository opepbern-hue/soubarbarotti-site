import type { Metadata } from 'next';
import { About } from '@/components/site/About';
import { BrandStrip } from '@/components/site/BrandStrip';
import { Contact } from '@/components/site/Contact';
import { Faq } from '@/components/site/Faq';
import { Hero } from '@/components/site/Hero';
import { Container } from '@/components/site/Hud';
import { NumbersPhrase } from '@/components/site/NumbersPhrase';
import { Plans } from '@/components/site/Plans';
import { ProcessList } from '@/components/site/ProcessList';
import { ScrollReveal, SplitText } from '@/components/site/ScrollReveal';
import { Testimonials } from '@/components/site/Testimonials';
import { WorksSection } from '@/components/site/WorksSection';
import {
  getBrands,
  getFaqs,
  getPhotos,
  getPlans,
  getProcessSteps,
  getProjects,
  getSections,
  getSettings,
  getTestimonials,
  type SectionView,
} from '@/lib/content';
import { absolute } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const image = s.ogMedia?.img?.src ? absolute(s.ogMedia.img.src) : absolute('/og.png');
  return {
    title: { absolute: s.seoTitle || 'soubarbarotti' },
    description: s.seoDescription,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: '/',
      siteName: 'soubarbarotti',
      title: s.seoTitle,
      description: s.seoDescription,
      images: [{ url: image, width: 1200, height: 630, alt: 'soubarbarotti' }],
    },
    twitter: { card: 'summary_large_image', title: s.seoTitle, description: s.seoDescription, images: [image] },
  };
}

const empty: SectionView = { key: '', enabled: true, label: '', titleLine1: '', titleLine2: '', intro: '' };

export default async function HomePage() {
  const [settings, sections, brands, featured, steps, plans, testimonials, faqs, photos] = await Promise.all([
    getSettings(),
    getSections(),
    getBrands(),
    getProjects(true),
    getProcessSteps(),
    getPlans(),
    getTestimonials(),
    getFaqs(),
    getPhotos('FOTO'),
  ]);
  const sec = (k: string) => sections[k] ?? { ...empty, key: k };
  const on = (k: string) => sec(k).enabled;

  return (
    <>
      <Hero settings={settings} />

      {on('marcas') ? <BrandStrip brands={brands} /> : null}

      {on('numeros') ? (
        <section
          aria-label="Como eu trabalho"
          className="bg-paragon-white pt-[64px] pb-[48px] text-paragon-black lg:pt-[96px] lg:pb-[72px]"
        >
          <Container>
            <NumbersPhrase text={settings.numbersUseCounters ? settings.numbersCounterText : settings.numbersPhrase} />
          </Container>
        </section>
      ) : null}

      {on('trabalhos') && featured.length ? (
        <WorksSection projects={featured} section={sec('trabalhos')} />
      ) : null}

      {on('processo') ? (
        <section
          id="processo"
          aria-label="Processo de produção"
          className="scroll-mt-16 border-t border-paragon-black bg-paragon-white py-[72px] text-paragon-black lg:py-[110px]"
        >
          <Container>
            {/* Cabeçalho de 3 colunas estilo WHAT WE DO / BUILT FOR THE CHASE da Paragon */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="text-paragon-kicker text-paragon-black">
                  {(sec('processo').label || '02 — MÉTODO').replace(/^\[|\]$/g, '')}
                </p>
              </div>
              <div className="lg:col-span-6">
                <h2 className="text-paragon-h2 text-paragon-black">
                  <ScrollReveal as="span" delay={40}>
                    <SplitText
                      text={
                        sec('processo').intro ||
                        [sec('processo').titleLine1, sec('processo').titleLine2].filter(Boolean).join(' ')
                      }
                      speed="fast"
                      mode="words"
                    />
                  </ScrollReveal>
                </h2>
              </div>
              <div className="lg:col-span-3 lg:text-right">
                <p className="text-paragon-kicker text-paragon-black">
                  {[sec('processo').titleLine1, sec('processo').titleLine2].filter(Boolean).join(' ')}
                </p>
              </div>
            </div>

            <ProcessList steps={steps} />
          </Container>
        </section>
      ) : null}

      {on('sobre') ? <About section={sec('sobre')} settings={settings} photos={photos} /> : null}

      {on('planos') ? <Plans section={sec('planos')} plans={plans} /> : null}

      {on('depoimentos') ? <Testimonials section={sec('depoimentos')} items={testimonials} /> : null}

      {on('perguntas') ? <Faq section={sec('perguntas')} faqs={faqs} /> : null}

      {on('contato') ? <Contact section={sec('contato')} settings={settings} /> : null}
    </>
  );
}
