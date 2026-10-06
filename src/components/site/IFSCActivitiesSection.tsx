'use client';

import { useState } from 'react';
import { ScrollReveal, SplitText } from './ScrollReveal';
import { RecLabel, Viewfinder } from './Hud';

export function IFSCActivitiesSection() {
  const [activeTab, setActiveTab] = useState<'all' | 'atividade1' | 'atividade2' | 'dicas'>('all');

  return (
    <section className="relative mt-16 border-t border-white/10 pt-16 lg:mt-24 lg:pt-24">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-brasa/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]" />

      <div className="relative">
        {/* Section Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <RecLabel className="text-brasa font-bold">IFSC · MÓDULO PRÁTICO</RecLabel>
            <h2 className="mt-3 font-display text-[36px] font-semibold leading-none tracking-tight text-white md:text-[48px] lg:text-[56px]">
              <SplitText text="Atividades & Práticas" speed="slow" mode="chars" />
              <span className="block text-white/70">
                <SplitText text="Diretrizes das Aulas" speed="slow" mode="chars" delay={120} />
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/80 p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('atividade1')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'atividade1'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Atividade 1
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('atividade2')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'atividade2'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Atividade 2
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dicas')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'dicas'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Avisos
            </button>
          </div>
        </div>

        {/* theoretical notice banner */}
        <ScrollReveal delay={50}>
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/20 bg-black/80 p-6 backdrop-blur-xl md:p-8 shadow-2xl">
            <Viewfinder className="inset-2 opacity-40" />
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brasa/20 text-brasa border border-brasa/40">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">Transição Teoria → Prática</h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-200">
                    Esta foi a <strong className="text-white">última aula teórica</strong> do módulo. A partir da próxima aula, todo o conteúdo será <strong className="text-white">100% focado na prática fotográfica</strong> em campo e estúdio.
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs text-white font-medium">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  Próxima Aula: 100% Prática
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Main Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Card: Atividade 1 */}
          {(activeTab === 'all' || activeTab === 'atividade1') && (
            <ScrollReveal delay={100} className="h-full">
              <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-black/85 p-8 transition-all hover:border-white/30 hover:bg-black/95 shadow-2xl">
                <Viewfinder className="inset-3 opacity-30 transition-opacity group-hover:opacity-60" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold uppercase tracking-widest text-brasa">
                      ATIVIDADE 01
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                      Pesquisa & Portfólio
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-bold text-white">
                    Nicho, Referências & Curadoria
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-neutral-200">
                    Desenvolvimento de pesquisa de mercado e repertório visual para estruturação de portfólio autoral.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-xl border border-white/15 bg-white/[0.06] p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 font-display text-xs text-white font-bold">
                          1
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-white">Escolha do Nicho</h4>
                          <p className="mt-1 text-xs leading-normal text-neutral-300">
                            Selecione um tema ou nicho fotográfico com base nas opções apresentadas no slide da professora.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/15 bg-white/[0.06] p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 font-display text-xs text-white font-bold">
                          2
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-white">Seleção de Fotógrafos</h4>
                          <p className="mt-1 text-xs leading-normal text-neutral-300">
                            Escolha <strong className="text-white">2 fotógrafos de referência</strong> com atuação consagrada no nicho selecionado.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/15 bg-white/[0.06] p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 font-display text-xs text-white font-bold">
                          3
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-white">Curadoria de Imagens</h4>
                          <p className="mt-1 text-xs leading-normal text-neutral-300">
                            Selecione <strong className="text-white">3 fotos marcantes de cada fotógrafo</strong> (total de 6 imagens) para compor a análise visual do portfólio.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/15 text-xs text-white/90 flex items-center justify-between font-medium">
                  <span>Status: <strong className="text-white font-semibold">Em andamento</strong></span>
                  <span className="text-white/90 font-mono">Consulte slide docente</span>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Card: Atividade 2 */}
          {(activeTab === 'all' || activeTab === 'atividade2') && (
            <ScrollReveal delay={150} className="h-full">
              <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-black/85 p-8 transition-all hover:border-white/30 hover:bg-black/95 shadow-2xl">
                <Viewfinder className="inset-3 opacity-30 transition-opacity group-hover:opacity-60" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold uppercase tracking-widest text-sky-400">
                      ATIVIDADE 02
                    </span>
                    <span className="rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-200">
                      Prática Fotográfica
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-bold text-white">
                    Controle Manual & Modalidades
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-neutral-200">
                    Domínio do triângulo de exposição (Velocidade do obturador, Abertura do diafragma e ISO).
                  </p>

                  <div className="mt-6 space-y-4">
                    {/* Técnica 1 */}
                    <div className="group/item rounded-xl border border-white/15 bg-white/[0.06] p-4 transition-colors hover:bg-white/[0.10]">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/30 text-sky-300">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            Light Painting
                            <span className="text-[10px] font-bold text-sky-300 bg-sky-400/20 px-2 py-0.5 rounded border border-sky-400/30">Longa Exposição</span>
                          </h4>
                          <p className="mt-1 text-xs leading-normal text-neutral-300">
                            Desenho com fontes de luz no escuro utilizando obturador em baixa velocidade (ex: 2s a 10s).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Técnica 2 */}
                    <div className="group/item rounded-xl border border-white/15 bg-white/[0.06] p-4 transition-colors hover:bg-white/[0.10]">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brasa/30 text-brasa">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            Efeito Retrato (DOF Raso)
                            <span className="text-[10px] font-bold text-brasa bg-brasa/20 px-2 py-0.5 rounded border border-brasa/30">Abertura Grande</span>
                          </h4>
                          <p className="mt-1 text-xs leading-normal text-neutral-300">
                            Foco cravado no assunto principal mantendo o fundo suavemente desfocado (pequena profundidade de campo, ex: f/1.8 - f/2.8).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Técnica 3 */}
                    <div className="group/item rounded-xl border border-white/15 bg-white/[0.06] p-4 transition-colors hover:bg-white/[0.10]">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/30 text-emerald-300">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            Congelamento de Movimento
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-400/20 px-2 py-0.5 rounded border border-emerald-400/30">Obturador Rápido</span>
                          </h4>
                          <p className="mt-1 text-xs leading-normal text-neutral-300">
                            Congelar a ação instantânea (ex: salto no ar ou gotas d'água da torneira) mantendo nitidez absoluta sem borrão de movimento (ex: 1/1000s).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/15 text-xs text-white/90 flex items-center justify-between font-medium">
                  <span>Triângulo: <strong className="text-white font-semibold">ISO + Abertura + Velocidade</strong></span>
                  <span className="text-white/90 font-mono">3 Fotos Obrigatórias</span>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>

        {/* Recomendações e Dicas Adicionais */}
        {(activeTab === 'all' || activeTab === 'dicas') && (
          <ScrollReveal delay={200}>
            <div className="mt-8 rounded-2xl border border-white/20 bg-black/90 p-6 backdrop-blur-md md:p-8 shadow-2xl">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-3">
                  <span className="font-display text-xs font-bold uppercase tracking-widest text-white/70">
                    INFORMAÇÕES DE EQUIPAMENTO & RECOMENDAÇÕES
                  </span>
                  <h3 className="font-display text-xl font-bold text-white">
                    Equipamentos Fotográficos no IFSC
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-200">
                    A professora recomenda fortemente que os alunos utilizem <strong className="text-white">suas próprias câmeras ou smartphones com modo manual</strong> nas próximas aulas. O IFSC dispõe de apenas <strong className="text-white">3 câmeras compartilhadas</strong>, que com frequência são entregues descarregadas pelos turnos anteriores.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-96 shrink-0">
                  <div className="rounded-xl border border-white/20 bg-white/[0.06] p-4 text-left">
                    <span className="block font-mono text-xs font-bold text-brasa">● CÂMERAS IFSC</span>
                    <span className="mt-1 block text-sm font-bold text-white">Apenas 3 Unidades</span>
                    <span className="mt-0.5 block text-xs text-neutral-300">Podem estar descarregadas</span>
                  </div>
                  <div className="rounded-xl border border-sky-400/40 bg-sky-500/20 p-4 text-left">
                    <span className="block font-mono text-xs font-bold text-sky-300">● RECOMENDADO</span>
                    <span className="mt-1 block text-sm font-bold text-white">Equipamento Próprio</span>
                    <span className="mt-0.5 block text-xs text-sky-200">Câmera DSLR/Mirrorless ou App Manual</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
