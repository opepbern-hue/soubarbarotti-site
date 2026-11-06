'use client';

import { useState } from 'react';
import { RecLabel } from './Hud';
import { ScrollReveal, SplitText } from './ScrollReveal';

export function IFSCActivitiesSection() {
  const [activeTab, setActiveTab] = useState<'all' | 'atividade1' | 'atividade2' | 'dicas'>('all');

  const tabClass = (tab: typeof activeTab) =>
    `border-r border-b border-paragon-white/25 px-4 py-2.5 font-kicker text-[12px] uppercase transition-colors ${
      activeTab === tab
        ? 'bg-paragon-red text-paragon-black'
        : 'bg-paragon-black text-paragon-white hover:bg-paragon-white/10'
    }`;

  return (
    <section className="relative mt-20 border-t border-paragon-white/22 pt-16 lg:mt-28 lg:pt-24">
      <div className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <RecLabel className="text-paragon-red">IFSC // MÓDULO PRÁTICO</RecLabel>
            <h2 className="text-paragon-h1 mt-3 text-paragon-white">
              <SplitText text="Atividades & Práticas" speed="slow" mode="words" />
              <span className="block text-paragon-grey-400">
                <SplitText text="Diretrizes das Aulas" speed="slow" mode="words" delay={80} />
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap border-t border-l border-paragon-white/25" role="group" aria-label="Filtrar atividades">
            <button type="button" onClick={() => setActiveTab('all')} className={tabClass('all')}>
              Todas
            </button>
            <button type="button" onClick={() => setActiveTab('atividade1')} className={tabClass('atividade1')}>
              Atividade 01
            </button>
            <button type="button" onClick={() => setActiveTab('atividade2')} className={tabClass('atividade2')}>
              Atividade 02
            </button>
            <button type="button" onClick={() => setActiveTab('dicas')} className={tabClass('dicas')}>
              Avisos
            </button>
          </div>
        </div>

        <ScrollReveal delay={50}>
          <div className="mt-8 border border-paragon-black bg-paragon-blue-light p-6 text-paragon-black md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-paragon-h4 text-paragon-black">Transição Teoria → Prática</h3>
                <p className="text-paragon-body mt-1 text-paragon-black/85">
                  Esta foi a <strong>última aula teórica</strong> do módulo. A partir da próxima aula, todo o conteúdo será{' '}
                  <strong>100% focado na prática fotográfica</strong> em campo e estúdio.
                </p>
              </div>
              <span className="shrink-0 border border-paragon-black bg-paragon-white px-3 py-1.5 font-kicker text-[12px] text-paragon-black uppercase">
                ✦ Próxima Aula: 100% Prática
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-8 grid grid-cols-1 border-t border-l border-paragon-white/22 lg:grid-cols-2">
          {(activeTab === 'all' || activeTab === 'atividade1') && (
            <div className="flex flex-col justify-between border-r border-b border-paragon-white/22 bg-paragon-black p-6 lg:p-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-kicker text-[12px] text-paragon-red uppercase">[ATIVIDADE 01]</span>
                  <span className="border border-paragon-white/25 px-2.5 py-1 font-kicker text-[11px] text-paragon-white uppercase">
                    Pesquisa &amp; Portfólio
                  </span>
                </div>

                <h3 className="text-paragon-h3 mt-4 text-paragon-white">Nicho, Referências &amp; Curadoria</h3>
                <p className="text-paragon-body mt-2 text-paragon-grey-300">
                  Desenvolvimento de pesquisa de mercado e repertório visual para estruturação de portfólio autoral.
                </p>

                <div className="mt-6 space-y-3 border-t border-paragon-white/20 pt-5">
                  <div className="border border-paragon-white/20 p-4">
                    <h4 className="font-kicker text-[13px] text-paragon-white uppercase">01 // Escolha do Nicho</h4>
                    <p className="mt-1 font-sans text-[13px] text-paragon-grey-300">
                      Selecione um tema ou nicho fotográfico com base nas opções apresentadas no slide da professora.
                    </p>
                  </div>
                  <div className="border border-paragon-white/20 p-4">
                    <h4 className="font-kicker text-[13px] text-paragon-white uppercase">02 // Seleção de Fotógrafos</h4>
                    <p className="mt-1 font-sans text-[13px] text-paragon-grey-300">
                      Escolha <strong className="text-paragon-white">2 fotógrafos de referência</strong> com atuação consagrada no nicho selecionado.
                    </p>
                  </div>
                  <div className="border border-paragon-white/20 p-4">
                    <h4 className="font-kicker text-[13px] text-paragon-white uppercase">03 // Curadoria de Imagens</h4>
                    <p className="mt-1 font-sans text-[13px] text-paragon-grey-300">
                      Selecione <strong className="text-paragon-white">3 fotos marcantes de cada fotógrafo</strong> (total de 6 imagens) para compor a análise visual do portfólio.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-paragon-white/20 pt-4 font-kicker text-[12px] text-paragon-grey-400 uppercase">
                <span>Status: Em andamento</span>
                <span>Consulte slide docente</span>
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'atividade2') && (
            <div className="flex flex-col justify-between border-r border-b border-paragon-white/22 bg-paragon-black p-6 lg:p-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-kicker text-[12px] text-paragon-blue uppercase">[ATIVIDADE 02]</span>
                  <span className="border border-paragon-white/25 px-2.5 py-1 font-kicker text-[11px] text-paragon-white uppercase">
                    Prática Fotográfica
                  </span>
                </div>

                <h3 className="text-paragon-h3 mt-4 text-paragon-white">Controle Manual &amp; Modalidades</h3>
                <p className="text-paragon-body mt-2 text-paragon-grey-300">
                  Domínio do triângulo de exposição (Velocidade do obturador, Abertura do diafragma e ISO).
                </p>

                <div className="mt-6 space-y-3 border-t border-paragon-white/20 pt-5">
                  <div className="border border-paragon-white/20 p-4">
                    <h4 className="font-kicker text-[13px] text-paragon-blue uppercase">
                      Light Painting // Longa Exposição
                    </h4>
                    <p className="mt-1 font-sans text-[13px] text-paragon-grey-300">
                      Desenho com fontes de luz no escuro utilizando obturador em baixa velocidade (ex: 2s a 10s).
                    </p>
                  </div>
                  <div className="border border-paragon-white/20 p-4">
                    <h4 className="font-kicker text-[13px] text-paragon-red uppercase">
                      Efeito Retrato (DOF Raso) // Abertura Grande
                    </h4>
                    <p className="mt-1 font-sans text-[13px] text-paragon-grey-300">
                      Foco cravado no assunto principal mantendo o fundo suavemente desfocado (ex: f/1.8 - f/2.8).
                    </p>
                  </div>
                  <div className="border border-paragon-white/20 p-4">
                    <h4 className="font-kicker text-[13px] text-paragon-teal uppercase">
                      Congelamento de Movimento // Obturador Rápido
                    </h4>
                    <p className="mt-1 font-sans text-[13px] text-paragon-grey-300">
                      Congelar a ação instantânea mantendo nitidez absoluta sem borrão de movimento (ex: 1/1000s).
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-paragon-white/20 pt-4 font-kicker text-[12px] text-paragon-grey-400 uppercase">
                <span>Triângulo: ISO + Abertura + Velocidade</span>
                <span>3 Fotos Obrigatórias</span>
              </div>
            </div>
          )}
        </div>

        {(activeTab === 'all' || activeTab === 'dicas') && (
          <div className="mt-8 border border-paragon-white/22 bg-paragon-black p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <span className="font-kicker text-[12px] text-paragon-red uppercase">
                  INFORMAÇÕES DE EQUIPAMENTO &amp; RECOMENDAÇÕES
                </span>
                <h3 className="text-paragon-h4 text-paragon-white">Equipamentos Fotográficos no IFSC</h3>
                <p className="text-paragon-body text-paragon-grey-300">
                  A professora recomenda fortemente que os alunos utilizem{' '}
                  <strong className="text-paragon-white">suas próprias câmeras ou smartphones com modo manual</strong>{' '}
                  nas próximas aulas. O IFSC dispõe de apenas{' '}
                  <strong className="text-paragon-white">3 câmeras compartilhadas</strong>.
                </p>
              </div>

              <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:w-96">
                <div className="border border-paragon-white/22 p-4">
                  <span className="block font-kicker text-[11px] text-paragon-red uppercase">✦ CÂMERAS IFSC</span>
                  <span className="mt-1 block font-display text-[20px] font-medium text-paragon-white uppercase">
                    Apenas 3 Unidades
                  </span>
                  <span className="mt-0.5 block font-sans text-[12px] text-paragon-grey-400">
                    Uso compartilhado em aula
                  </span>
                </div>
                <div className="border border-paragon-white/22 p-4">
                  <span className="block font-kicker text-[11px] text-paragon-blue uppercase">✦ RECOMENDADO</span>
                  <span className="mt-1 block font-display text-[20px] font-medium text-paragon-white uppercase">
                    Equipamento Próprio
                  </span>
                  <span className="mt-0.5 block font-sans text-[12px] text-paragon-grey-400">
                    Câmera ou Smartphone Manual
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
