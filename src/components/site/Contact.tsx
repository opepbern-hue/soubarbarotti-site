import type { SectionView, SettingsView } from '@/lib/content';
import { ContactForm } from './ContactForm';
import { Container, SectionHeading } from './Hud';
import { Social } from './Social';

export function Contact({ section, settings }: { section: SectionView; settings: SettingsView }) {
  return (
    <section id="contato" className="relative scroll-mt-16 bg-nevoa py-[90px] lg:py-[130px]">
      <Container className="flex flex-col items-center text-center">
        <SectionHeading label={section.label} line1={section.titleLine1} line2={section.titleLine2} intro={section.intro} align="center" />
        <Social settings={settings} className="mt-8 flex flex-col items-center [&_ul]:justify-center" />
        <ContactForm />
      </Container>
    </section>
  );
}
