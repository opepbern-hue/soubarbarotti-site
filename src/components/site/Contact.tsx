'use client';

import { useState, type PointerEvent } from 'react';
import type { SectionView, SettingsView } from '@/lib/content';
import { ContactForm } from './ContactForm';
import { CornerArrowIcon } from './Header';
import { Container, RollText } from './Hud';
import { ScrollReveal, SplitText } from './ScrollReveal';
import { Social, whatsappLink } from './Social';
import { Fill } from './Text';

type Sticker = { id: string; label: string; sub: string; bg: string; posClass: string; rot: number };

const STICKERS: Sticker[] = [
  {
    id: 's1',
    label: 'DIREÇÃO 4K',
    sub: 'CINEMA & IA',
    bg: 'bg-paragon-blue text-paragon-black',
    posClass: 'top-8 left-[6%]',
    rot: -8,
  },
  {
    id: 's2',
    label: 'MOTION DESIGN',
    sub: 'ALTA CONVERSÃO',
    bg: 'bg-paragon-white text-paragon-black',
    posClass: 'top-10 right-[7%]',
    rot: 9,
  },
  {
    id: 's3',
    label: 'PALHOÇA, SC',
    sub: 'BRASIL & REMOTO',
    bg: 'bg-paragon-teal text-paragon-black',
    posClass: 'bottom-10 left-[9%]',
    rot: 6,
  },
  {
    id: 's4',
    label: '@SOUBARBAROTTI',
    sub: 'PRODUÇÃO AUTORAL',
    bg: 'bg-paragon-blue-light text-paragon-black',
    posClass: 'bottom-8 right-[8%]',
    rot: -7,
  },
];

function DraggableBadge({ sticker }: { sticker: Sticker }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - start.x, y: e.clientY - start.y });
  };

  const onUp = () => {
    setDragging(false);
  };

  return (
    <div
      data-sticker="item"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${
          dragging ? sticker.rot * -1.4 : sticker.rot
        }deg) scale(${dragging ? 1.15 : 1})`,
        transition: dragging ? 'none' : 'transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      className={` absolute z-20 hidden cursor-grab border border-paragon-black px-3.5 py-2 shadow-xl select-none active:cursor-grabbing lg:block ${sticker.bg} ${sticker.posClass}`}
    >
      <p className="font-display text-[18px] leading-none font-bold uppercase">{sticker.label}</p>
      <p className="mt-0.5 font-kicker text-[10px] tracking-[0.06em] uppercase opacity-80">{sticker.sub}</p>
    </div>
  );
}

export function Contact({ section, settings }: { section: SectionView; settings: SettingsView }) {
  const waHref = settings.whatsapp ? whatsappLink(settings.whatsapp) : '';
  const headingLine1 = section.titleLine1 || 'Vamos criar';
  const headingLine2 = section.titleLine2 || 'algo único?';

  return (
    <section id="contato" aria-label="Contato" className="scroll-mt-16">
      {/* Parte 1: Banner Monumental Laranja Barbarotti (#ff6a00) com Badges Arrastáveis (section.home-cta_wrap da Paragon) */}
      <div
        data-sticker="wrap"
        className="home-cta_wrap relative overflow-hidden border-t border-paragon-black bg-paragon-red py-[84px] text-paragon-black lg:py-[140px]"
      >
        {STICKERS.map((s) => (
          <DraggableBadge key={s.id} sticker={s} />
        ))}

        <Container className="relative z-10 flex flex-col items-center text-center">
          <p className="text-paragon-kicker mb-4 text-paragon-black">
            {(section.label || '07 — CONTATO').replace(/^\[|\]$/g, '')}
          </p>

          <h2 className="text-paragon-display max-w-[1120px] text-paragon-black">
            <ScrollReveal as="span" delay={40}>
              <span className="block">
                <SplitText text={headingLine1} speed="slow" mode="words" />
              </span>
              {headingLine2 ? (
                <span className="block">
                  <SplitText text={headingLine2} speed="slow" mode="words" delay={80} />
                </span>
              ) : null}
            </ScrollReveal>
          </h2>

          {section.intro ? (
            <p className="text-paragon-h4 mt-6 max-w-[640px] text-paragon-black">
              <Fill text={section.intro} />
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener"
                className="u-button u-button--white"
              >
                <RollText text="Chamar no WhatsApp" />
                <CornerArrowIcon className="size-3.5" />
              </a>
            ) : null}
            {settings.contactEmail ? (
              <a href={`mailto:${settings.contactEmail}`} className="u-button u-button--blue">
                <RollText text={settings.contactEmail} />
              </a>
            ) : null}
          </div>
        </Container>
      </div>

      {/* Parte 2: Seção Arquitetônica de Formulário e Canais Diretos (estilo /contact da Paragon) */}
      <div className="border-t border-paragon-black bg-paragon-white py-[72px] text-paragon-black lg:py-[110px]">
        <Container>
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            {/* Coluna Esquerda: Informações Diretas e Redes */}
            <div className="flex flex-col justify-between border border-paragon-black bg-paragon-grey-100 p-6 lg:col-span-5 lg:p-9">
              <div>
                <p className="text-paragon-kicker text-paragon-red">ATENDIMENTO DIRETO</p>
                <h3 className="text-paragon-h2 mt-2 text-paragon-black">Fale diretamente comigo</h3>
                <p className="text-paragon-body mt-3 text-paragon-grey-500">
                  Conte sobre a sua marca, lançamento ou campanha. Respondo pessoalmente em até 24 horas úteis.
                </p>

                <dl className="mt-8 space-y-4 border-t border-paragon-black pt-6">
                  {settings.contactEmail ? (
                    <div>
                      <dt className="font-kicker text-[12px] text-paragon-grey-500 uppercase">E-mail</dt>
                      <dd className="mt-0.5 font-kicker text-[15px] text-paragon-black">
                        <a href={`mailto:${settings.contactEmail}`} className="u-text-button">
                          <RollText text={settings.contactEmail} />
                        </a>
                      </dd>
                    </div>
                  ) : null}

                  {waHref ? (
                    <div>
                      <dt className="font-kicker text-[12px] text-paragon-grey-500 uppercase">WhatsApp</dt>
                      <dd className="mt-0.5 font-kicker text-[15px] text-paragon-black">
                        <a href={waHref} target="_blank" rel="noopener" className="u-text-button">
                          <RollText text="Iniciar conversa no WhatsApp ↗" />
                        </a>
                      </dd>
                    </div>
                  ) : null}

                  <div>
                    <dt className="font-kicker text-[12px] text-paragon-grey-500 uppercase">Base</dt>
                    <dd className="mt-0.5 font-sans text-[15px] text-paragon-black">
                      <Fill text={settings.heroLocation || 'Palhoça, SC & Remoto'} />
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8 border-t border-paragon-black pt-6">
                <p className="mb-3 font-kicker text-[12px] text-paragon-grey-500 uppercase">Canais oficiais</p>
                <Social settings={settings} showMissing={false} />
              </div>
            </div>

            {/* Coluna Direita: Formulário de Contato (/api/contato) */}
            <div className="border border-paragon-black bg-paragon-white p-6 lg:col-span-7 lg:p-10">
              <p className="text-paragon-kicker mb-2 text-paragon-grey-500">BRIEFING RÁPIDO</p>
              <h3 className="text-paragon-h3 mb-6 text-paragon-black">Envie uma mensagem</h3>
              <ContactForm />
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
