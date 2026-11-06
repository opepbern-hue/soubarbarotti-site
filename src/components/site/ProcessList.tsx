'use client';

import { useState } from 'react';
import type { ProcessStepView } from '@/lib/content';
import { isPortrait } from '@/lib/media-shared';
import { AutoVideo } from './AutoVideo';
import { Fill } from './Text';

const PANEL_SWATCHES = [
  'bg-paragon-blue-light text-paragon-black',
  'bg-paragon-red text-paragon-black',
  'bg-paragon-teal text-paragon-black',
  'bg-paragon-white text-paragon-black',
  'bg-paragon-grey-300 text-paragon-black',
];

function splitTools(tools: string): string[] {
  if (!tools) return [];
  return tools
    .split(/[,·•|/]/)
    .map((t) => t.replace(/\[PREENCHER[^\]]*\]/g, '').trim())
    .filter(Boolean);
}

/**
 * Painéis horizontais expansíveis no desktop e empilhados no mobile,
 * reproduzindo fielmente o componente `home-services_cards_wrap` da Paragon (STYLE 11).
 */
export function ProcessList({ steps }: { steps: ProcessStepView[] }) {
  const [active, setActive] = useState<number>(0);

  if (!steps.length) return null;

  return (
    <div className="mt-10 lg:mt-14">
      {/* DESKTOP: Acordeão Horizontal Expansível (CREATIVE / PRODUCTION / POST da Paragon) */}
      <div className="hidden h-[620px] w-full items-stretch border border-paragon-black lg:flex">
        {steps.map((step, i) => {
          const isActive = active === i;
          const swatch = PANEL_SWATCHES[i % PANEL_SWATCHES.length];
          const toolItems = splitTools(step.tools);
          const portrait = isPortrait(step.media);
          const marqueeItems = Array.from({ length: 6 }, () => `${step.title}`);

          return (
            <div
              key={step.id}
              style={{
                flex: isActive ? '1 1 0%' : '0 0 auto',
                width: isActive ? 'auto' : '92px',
                transition:
                  'flex 550ms cubic-bezier(0.65, 0.05, 0, 1), width 550ms cubic-bezier(0.65, 0.05, 0, 1)',
              }}
              className={`home-services_cards_item relative flex h-full min-w-0 overflow-hidden ${swatch} ${
                i < steps.length - 1 ? 'border-r border-paragon-black' : ''
              } ${isActive ? 'is-active' : 'hover:!w-[108px]'}`}
            >
              {/* Aba Vertical Colapsada (visível quando não está ativa) */}
              {!isActive ? (
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-expanded={false}
                  aria-label={`Expandir etapa ${step.number}: ${step.title}`}
                  className="flex h-full w-full flex-col items-center justify-between py-6 text-paragon-black"
                >
                  <span className="font-kicker text-[13px] font-medium">
                    {String(step.number).padStart(2, '0')}
                  </span>

                  <span className="relative flex flex-1 items-center justify-center">
                    <span className="-rotate-90 font-display text-[28px] leading-none font-medium tracking-tight whitespace-nowrap uppercase">
                      {step.title}
                    </span>
                  </span>

                  <span aria-hidden="true" className="text-[18px] leading-none">
                    ✦
                  </span>
                </button>
              ) : (
                /* Conteúdo do Painel Ativo Expandido */
                <div className="flex h-full w-full min-w-[560px] flex-col justify-between overflow-hidden">
                  {/* Faixa Superior: Marquee Gigante Condensado (data-service-marquee-list) */}
                  <div className="relative flex items-center overflow-hidden border-b border-paragon-black py-3">
                    <div className="flex shrink-0 items-center whitespace-nowrap" data-service-marquee-list>
                      {marqueeItems.map((title, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-5 px-4 font-display text-[clamp(3rem,5vw,5.25rem)] leading-[0.92] font-medium text-paragon-black uppercase"
                        >
                          <span>{title}</span>
                          <span aria-hidden="true" className="text-[0.55em]">
                            ✦
                          </span>
                        </span>
                      ))}
                    </div>
                    <div
                      aria-hidden="true"
                      className="flex shrink-0 items-center whitespace-nowrap"
                      data-service-marquee-list
                    >
                      {marqueeItems.map((title, idx) => (
                        <span
                          key={`dup-${idx}`}
                          className="flex items-center gap-5 px-4 font-display text-[clamp(3rem,5vw,5.25rem)] leading-[0.92] font-medium text-paragon-black uppercase"
                        >
                          <span>{title}</span>
                          <span aria-hidden="true" className="text-[0.55em]">
                            ✦
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Corpo do Painel: Vídeo à esquerda + Descrição e Lista de Entregas à direita */}
                  <div className="grid flex-1 grid-cols-12 items-end gap-8 p-7 xl:p-9">
                    <div className="col-span-5 flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between font-kicker text-[13px] text-paragon-black uppercase">
                        <span>Etapa {String(step.number).padStart(2, '0')}</span>
                        <span aria-hidden="true">✦</span>
                      </div>

                      <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden border border-paragon-black bg-paragon-black">
                        <AutoVideo
                          media={step.media}
                          mode="visible"
                          hovering={true}
                          sizes="420px"
                          fit={portrait ? 'object-cover object-[center_20%]' : 'object-cover object-center'}
                        />
                      </div>
                    </div>

                    <div className="col-span-7 flex h-full flex-col justify-between">
                      <p className="text-paragon-body max-w-[460px] text-paragon-black">
                        <Fill text={step.description} />
                      </p>

                      {toolItems.length > 0 ? (
                        <ul aria-label="Entregas e ferramentas da etapa" className="mt-6 border-t border-paragon-black">
                          {toolItems.map((tool, tIdx) => (
                            <li
                              key={tIdx}
                              className="flex items-center justify-between border-b border-paragon-black py-2.5 font-kicker text-[14px] text-paragon-black uppercase"
                            >
                              <span>{tool}</span>
                              <span aria-hidden="true" className="text-[12px]">
                                ✦
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE: Painéis Empilhados com Borda 1px solid #100f0f (mobile-home-fold2.png da Paragon) */}
      <ol className="flex flex-col border-t border-x border-paragon-black lg:hidden">
        {steps.map((step, i) => {
          const swatch = PANEL_SWATCHES[i % PANEL_SWATCHES.length];
          const toolItems = splitTools(step.tools);
          const portrait = isPortrait(step.media);

          return (
            <li key={step.id} className={`border-b border-paragon-black p-5 ${swatch}`}>
              <div className="flex items-center justify-between border-b border-paragon-black pb-3">
                <h3 className="text-paragon-h3 text-paragon-black">
                  <Fill text={step.title} />
                </h3>
                <span className="font-kicker text-[13px] text-paragon-black">
                  [{String(step.number).padStart(2, '0')}] ✦
                </span>
              </div>

              {step.media ? (
                <div className="relative my-4 aspect-[16/10] w-full overflow-hidden border border-paragon-black bg-paragon-black">
                  <AutoVideo
                    media={step.media}
                    mode="visible"
                    sizes="100vw"
                    fit={portrait ? 'object-cover object-[center_20%]' : 'object-cover object-center'}
                  />
                </div>
              ) : null}

              <p className="text-paragon-body text-paragon-black">
                <Fill text={step.description} />
              </p>

              {toolItems.length > 0 ? (
                <ul className="mt-4 border-t border-paragon-black">
                  {toolItems.map((tool, tIdx) => (
                    <li
                      key={tIdx}
                      className="flex items-center justify-between border-b border-paragon-black py-2 font-kicker text-[13px] text-paragon-black uppercase"
                    >
                      <span>{tool}</span>
                      <span aria-hidden="true">✦</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
