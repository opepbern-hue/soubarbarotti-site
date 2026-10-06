import type { Metadata } from 'next';
import Link from 'next/link';
import { About } from '@/components/site/About';
import { BrandStrip } from '@/components/site/BrandStrip';
import { Contact } from '@/components/site/Contact';
import { Faq } from '@/components/site/Faq';
import { Hero } from '@/components/site/Hero';
import { Container, RecLabel, SectionHeading } from '@/components/site/Hud';
import { ArrowUpRight } from '@/components/site/icons';
import { NumbersPhrase } from '@/components/site/NumbersPhrase';
import { Plans } from '@/components/site/Plans';
import { ProcessList } from '@/components/site/ProcessList';
import { Testimonials } from '@/components/site/Testimonials';
import { WorksSection } from '@/components/site/WorksSection';
import {
  getBrands,
  getFaqs,
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
  const [settings, sections, brands, featured, steps, plans, testimonials, faqs] = await Promise.all([
    getSettings(),
    getSections(),
    getBrands(),
    getProjects(true),
    getProcessSteps(),
    getPlans(),
    getTestimonials(),
    getFaqs(),
  ]);
  const sec = (k: string) => sections[k] ?? { ...empty, key: k };
  const on = (k: string) => sec(k).enabled;

  return (
    <>
      <Hero settings={settings} />

      {on('marcas') ? <BrandStrip brands={brands} /> : null}

      {on('numeros') ? (
        <section aria-label="Como eu trabalho" className="px-5 pb-[90px] pt-[110px] md:pt-[150px] lg:px-[100px] lg:pb-[150px] lg:pt-[175px]">
          <NumbersPhrase text={settings.numbersUseCounters ? settings.numbersCounterText : settings.numbersPhrase} />
        </section>
      ) : null}

      {on('trabalhos') && featured.length ? (
        <WorksSection projects={featured} section={sec('trabalhos')} />
      ) : null}

      {on('processo') ? (
        <section id="processo" className="scroll-mt-16 bg-amanhecer py-[80px] lg:py-[120px]">
          <Container>
            <SectionHeading label={sec('processo').label} line1={sec('processo').titleLine1} line2={sec('processo').titleLine2} intro={sec('processo').intro} />
            <ProcessList steps={steps} />
          </Container>
        </section>
      ) : null}

      {on('sobre') ? <About section={sec('sobre')} settings={settings} /> : null}


      {on('depoimentos') ? <Testimonials section={sec('depoimentos')} items={testimonials} /> : null}

      {on('perguntas') ? <Faq section={sec('perguntas')} faqs={faqs} /> : null}

      {on('contato') ? <Contact section={sec('contato')} settings={settings} /> : null}
    </>
  );
}
