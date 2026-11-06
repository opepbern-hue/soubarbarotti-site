'use client';

import { useState } from 'react';
import { RecLabel } from './Hud';
import { ScrollReveal, SplitText } from './ScrollReveal';

export type ActivityItem = {
  id: string;
  number: string;
  title: string;
  badge?: string;
  description: string;
  details: { label: string; text: string }[];
  deliverables?: string;
};

export const IFSC_ACTIVITIES: ActivityItem[] = [
  {
    id: 'ativ-1',
    number: 'ATIVIDADE 01',
    title: 'IFSC Invisível — 5 Fotos Noturnas',
    badge: 'Noturna // Curadoria',
    description: 'Registro do campus do IFSC durante a noite explorando ângulos despercebidos, silêncio e luzes artificiais.',
    details: [
      { label: 'Exigência', text: '5 fotos noturnas capturadas no campus do IFSC + seleção da foto favorita devidamente justificada.' },
      { label: 'Composição', text: 'Enquadramento consciente da escuridão, fontes pontuais de luz e texturas arquitetônicas à noite.' },
    ],
    deliverables: '5 Fotos + Favorita Justificada',
  },
  {
    id: 'ativ-2',
    number: 'ATIVIDADE 02',
    title: 'Tema Livre — 5 Fotos Diurnas',
    badge: 'Diurna // Autoral',
    description: 'Exploração autoral com luz natural diurna com tema de livre escolha, investigando ritmo e narrativa visual.',
    details: [
      { label: 'Exigência', text: '5 fotos diurnas com tema livre + seleção da foto favorita com justificativa estética/técnica.' },
      { label: 'Iluminação', text: 'Domínio da luz solar (direta, difusa ou contraluz) e contraste na cena.' },
    ],
    deliverables: '5 Fotos + Favorita Justificada',
  },
  {
    id: 'ativ-3',
    number: 'ATIVIDADE 03',
    title: '"Por Aí" — 5 Fotos com 5 Regras de Composição',
    badge: 'Linguagem Visual',
    description: 'Exercício prático de aplicação rigorosa das principais convenções de linguagem e composição visual fotográfica.',
    details: [
      { label: 'As 5 Regras', text: '1 foto para cada: Regra dos Terços, Simetria, Contraste de Cor, Contraste de Luz e Linhas-guia.' },
      { label: 'Análise Crítica', text: 'Indicação da foto favorita justificada e também da foto que menos gostou, com autocrítica construtiva.' },
    ],
    deliverables: '5 Fotos (5 Regras) + Favorita + Menos Gostou',
  },
  {
    id: 'ativ-4',
    number: 'ATIVIDADE 04',
    title: 'Curadoria: 1 Modalidade, 2 Fotógrafos, 6 Fotos',
    badge: 'Pesquisa & Referência',
    description: 'Estudo de referências consagradas em uma modalidade específica com análise crítica minuciosa de linguagem.',
    details: [
      { label: 'Seleção', text: '1 modalidade fotográfica escolhida + 2 fotógrafos consagrados de referência.' },
      { label: 'Análise de Composição', text: '3 fotos marcantes de cada fotógrafo (total de 6 fotos) acompanhadas de comentário detalhado de composição.' },
    ],
    deliverables: '6 Fotos analisadas (3 de cada fotógrafo)',
  },
  {
    id: 'ativ-5-7',
    number: 'ATIVIDADES 05 A 07',
    title: 'Triângulo de Exposição & Comentários Técnicos',
    badge: 'Técnica Manual & Câmera',
    description: 'Demonstração de domínio técnico do triângulo de exposição (Velocidade, Abertura e ISO) com parâmetros documentados.',
    details: [
      { label: 'Exercícios 5 e 6', text: 'Light painting, Movimento congelado, Profundidade de campo (DOF raso), Cores, Retrato e Produto.' },
      { label: 'Comentários (Ativ. 7)', text: 'Comentário técnico de cada foto incluindo configuração exata da câmera (ISO, Shutter, f/stop), composição e opinião pessoal.' },
    ],
    deliverables: '6 Fotos (1 por exercício) + Metadados e Comentários',
  },
  {
    id: 'ativ-8',
    number: 'ATIVIDADE 08',
    title: 'Vídeo "Fotografia em Movimento"',
    badge: 'Audiovisual // 1 Minuto',
    description: 'Produção audiovisual experimental unindo fotografia estática, decupagem e ritmo cinematográfico.',
    details: [
      { label: 'Formato & Regras', text: 'Exatamente 1 minuto de duração, estruturado em torno de 1 palavra-tema condutora, contendo entre 6 e 12 takes.' },
      { label: 'Identificação', text: 'Título e nome do autor inseridos no próprio vídeo, com link incorporado e ativo no portfólio.' },
    ],
    deliverables: 'Vídeo 1 min (6-12 takes, 1 palavra) + Link no Portfólio',
  },
];

export function IFSCActivitiesSection() {
  const [activeTab, setActiveTab] = useState<'all' | 'riscos' | 'atividades' | 'checklist' | 'datas'>('all');

  const tabClass = (tab: typeof activeTab) =>
    `border-r border-b border-paragon-white/25 px-4 py-2.5 font-kicker text-[12px] uppercase transition-colors ${
      activeTab === tab
        ? 'bg-paragon-red text-paragon-black'
        : 'bg-paragon-black text-paragon-white hover:bg-paragon-white/10'
    }`;

  return (
    <section className="relative mt-20 border-t border-paragon-white/22 pt-16 lg:mt-28 lg:pt-24" id="atividades-ifsc">
      <div className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <RecLabel className="text-paragon-red">FOTOGRAFIA // IFSC — VALIDAÇÃO COMPLETA</RecLabel>
            <h2 className="text-paragon-h1 mt-3 text-paragon-white">
              <SplitText text="Portfólio & Atividades" speed="slow" mode="words" />
              <span className="block text-paragon-grey-400">
                <SplitText text="Diretrizes, Prazos & Entregas" speed="slow" mode="words" delay={80} />
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap border-t border-l border-paragon-white/25" role="group" aria-label="Filtrar visão">
            <button type="button" onClick={() => setActiveTab('all')} className={tabClass('all')}>
              Visão Geral
            </button>
            <button type="button" onClick={() => setActiveTab('riscos')} className={tabClass('riscos')}>
              Alertas &amp; Notas
            </button>
            <button type="button" onClick={() => setActiveTab('atividades')} className={tabClass('atividades')}>
              Atividades (1 a 8)
            </button>
            <button type="button" onClick={() => setActiveTab('checklist')} className={tabClass('checklist')}>
              Checklist
            </button>
            <button type="button" onClick={() => setActiveTab('datas')} className={tabClass('datas')}>
              Datas &amp; SIGAA
            </button>
          </div>
        </div>

        {/* ALERTA DE RISCOS / NOTAS */}
        {(activeTab === 'all' || activeTab === 'riscos') && (
          <ScrollReveal delay={40}>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="border border-paragon-red bg-paragon-red/10 p-6 text-paragon-white">
                <div className="flex items-center justify-between">
                  <span className="font-kicker text-[11px] text-paragon-red uppercase tracking-wider">
                    🔴 ALERTA CRÍTICO // FREQUÊNCIA
                  </span>
                  <span className="border border-paragon-red px-2 py-0.5 font-kicker text-[11px] text-paragon-red uppercase">
                    12 Faltas (Limite: 10)
                  </span>
                </div>
                <h3 className="text-paragon-h4 mt-3 text-paragon-white">Risco 1: Reprovação por Falta</h3>
                <p className="text-paragon-body mt-2 text-paragon-grey-300">
                  Cada aula computa 4 faltas. Avisos da professora em 28/08 e 14/09 confirmam que a 3ª falta ultrapassa o limite.
                </p>
                <div className="mt-4 border-t border-paragon-white/20 pt-3">
                  <p className="font-sans text-[13px] text-paragon-white">
                    <strong className="text-paragon-red">Ação Necessária:</strong> A falta de 23/10 pode ser abonada caso o vídeo da Tarefa 5 tenha sido entregue até 30/10 (reduzindo para 8 faltas). <em>Alinhar com a professora na aula de hoje (06/11).</em>
                  </p>
                </div>
              </div>

              <div className="border border-paragon-white/25 bg-paragon-black p-6 text-paragon-white">
                <div className="flex items-center justify-between">
                  <span className="font-kicker text-[11px] text-paragon-blue uppercase tracking-wider">
                    🔴 AVALIAÇÕES // COMPOSIÇÃO DE MÉDIA
                  </span>
                  <span className="border border-paragon-white/25 px-2 py-0.5 font-kicker text-[11px] text-paragon-grey-300 uppercase">
                    Nota 1 = 2,0
                  </span>
                </div>
                <h3 className="text-paragon-h4 mt-3 text-paragon-white">Risco 2: Compensação nas Notas 2 e 3</h3>
                <p className="text-paragon-body mt-2 text-paragon-grey-300">
                  Com a Nota 1 fechada em 2,0, as Notas 2 e 3 precisam de pontuação alta para garantir aprovação.
                </p>
                <ul className="mt-3 space-y-1.5 font-sans text-[12.5px] text-paragon-grey-300">
                  <li>• <strong>Nota 2:</strong> Atividades 5 (triângulo da exposição), 6 (cores, retrato, produto), 7 (comentários) e 8 (vídeo 1 min).</li>
                  <li>• <strong>Nota 3:</strong> Portfólio completo entregue e avaliado na banca final de <strong>04/12</strong>.</li>
                </ul>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* GRADE DE ATIVIDADES 1 A 8 */}
        {(activeTab === 'all' || activeTab === 'atividades') && (
          <div className="mt-8">
            <div className="flex items-center justify-between border-b border-paragon-white/22 pb-3">
              <h3 className="font-kicker text-[13px] text-paragon-white uppercase tracking-wider">
                Estrutura das Atividades do Portfólio (Adicione fotos para cada etapa)
              </h3>
              <span className="font-kicker text-[12px] text-paragon-grey-400 uppercase">8 Atividades</span>
            </div>

            <div className="mt-4 grid grid-cols-1 border-t border-l border-paragon-white/22 md:grid-cols-2 lg:grid-cols-3">
              {IFSC_ACTIVITIES.map((ativ) => (
                <div key={ativ.id} className="flex flex-col justify-between border-r border-b border-paragon-white/22 bg-paragon-black p-5 lg:p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-kicker text-[11px] text-paragon-red uppercase tracking-wider">
                        {ativ.number}
                      </span>
                      {ativ.badge && (
                        <span className="border border-paragon-white/25 px-2 py-0.5 font-kicker text-[10px] text-paragon-grey-300 uppercase">
                          {ativ.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="text-paragon-h5 mt-3 text-paragon-white">{ativ.title}</h4>
                    <p className="text-paragon-small mt-2 text-paragon-grey-300">{ativ.description}</p>

                    <div className="mt-4 space-y-2 border-t border-paragon-white/15 pt-3">
                      {ativ.details.map((d, idx) => (
                        <div key={idx} className="font-sans text-[12px]">
                          <strong className="text-paragon-white">{d.label}: </strong>
                          <span className="text-paragon-grey-400">{d.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {ativ.deliverables && (
                    <div className="mt-5 border-t border-paragon-white/20 pt-3">
                      <span className="block font-kicker text-[10px] text-paragon-blue uppercase tracking-wider">
                        Entrega Obrigatória
                      </span>
                      <span className="font-kicker text-[12px] text-paragon-white uppercase">
                        {ativ.deliverables}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHECKLIST GERAL */}
        {(activeTab === 'all' || activeTab === 'checklist') && (
          <div className="mt-8 border border-paragon-white/22 bg-paragon-black p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-paragon-white/20 pb-4">
              <div>
                <span className="font-kicker text-[11px] text-paragon-red uppercase tracking-wider">
                  ✦ CHECKLIST DO PORTFÓLIO
                </span>
                <h3 className="text-paragon-h3 mt-1 text-paragon-white">Conferência de Itens Obrigatórios</h3>
              </div>
              <span className="hidden sm:inline border border-paragon-white/25 px-3 py-1 font-kicker text-[11px] text-paragon-white uppercase">
                Avaliação: 04/12
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Ativ. 1: IFSC Invisível', desc: '5 fotos noturnas + favorita justificada' },
                { title: 'Ativ. 2: Tema Livre', desc: '5 fotos diurnas + favorita justificada' },
                { title: 'Ativ. 3: "Por aí"', desc: '5 fotos (terços, simetria, contraste cor, luz, linhas) + favorita e menos gostou' },
                { title: 'Ativ. 4: Curadoria Consagrada', desc: '1 modalidade, 2 fotógrafos, 3 fotos de cada com análise de composição' },
                { title: 'Ativ. 5 a 7: Triângulo & Parâmetros', desc: '6 fotos (1 por exercício) com comentários técnicos (ISO, Shutter, f/stop)' },
                { title: 'Ativ. 8: Vídeo Fotografia em Movimento', desc: '1 min, 1 palavra, 6-12 takes, título e nome no vídeo, link ativo no portfólio' },
                { title: 'Envio por E-mail Oficial', desc: 'Link do portfólio enviado para alessandra.collaco@ifsc.edu.br' },
                { title: 'Envio via SIGAA', desc: 'Submissão do link em: Portfólio, Tarefa 4 e Tarefa 5' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 border border-paragon-white/20 p-4">
                  <div className="mt-0.5 grid size-5 shrink-0 place-items-center border border-paragon-red bg-paragon-red/10 text-[11px] text-paragon-red font-bold">
                    ✓
                  </div>
                  <div>
                    <h5 className="font-kicker text-[13px] text-paragon-white uppercase">{item.title}</h5>
                    <p className="mt-1 font-sans text-[12px] text-paragon-grey-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DATAS & STATUS NO SIGAA */}
        {(activeTab === 'all' || activeTab === 'datas') && (
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="border border-paragon-white/22 bg-paragon-black p-6 lg:col-span-7">
              <span className="font-kicker text-[11px] text-paragon-red uppercase tracking-wider">
                STATUS NO SIGAA &amp; MATERIAIS
              </span>
              <h4 className="text-paragon-h4 mt-2 text-paragon-white">Pendências no Sistema Acadêmico</h4>
              <ul className="mt-4 space-y-2.5 font-sans text-[13px] text-paragon-grey-300">
                <li className="flex items-start gap-2">
                  <span className="text-paragon-red font-bold">!</span>
                  <span>Nenhum envio registrado até o momento em nenhuma tarefa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-paragon-blue font-bold">→</span>
                  <span>O botão <strong>&ldquo;Enviar&rdquo; continua aberto</strong> em: <strong>Portfólio</strong>, <strong>Tarefa 4</strong> e <strong>Tarefa 5</strong>. Submeter o link deste portfólio diretamente por lá.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-paragon-white/50">•</span>
                  <span><strong>Materiais de Apoio:</strong> As fotos de aula estão no Drive da turma (link na Tarefa 4). Bibliografia recomendada: 3 livros (Kingslake/King, Sontag, Ang).</span>
                </li>
              </ul>
            </div>

            <div className="border border-paragon-white/22 bg-paragon-black p-6 lg:col-span-5">
              <span className="font-kicker text-[11px] text-paragon-blue uppercase tracking-wider">
                CRONOGRAMA &amp; DATAS CRÍTICAS
              </span>
              <h4 className="text-paragon-h4 mt-2 text-paragon-white">Datas Decisivas</h4>
              <dl className="mt-4 divide-y divide-paragon-white/15">
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="font-kicker text-[12px] text-paragon-red uppercase">06/11 (Hoje)</dt>
                  <dd className="font-sans text-[12.5px] text-paragon-white text-right">Apresentação dos vídeos e portfólios em aula</dd>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="font-kicker text-[12px] text-paragon-white uppercase">04/12</dt>
                  <dd className="font-sans text-[12.5px] text-paragon-grey-300 text-right">Apresentação final do portfólio completo</dd>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <dt className="font-kicker text-[12px] text-paragon-white uppercase">12/12</dt>
                  <dd className="font-sans text-[12.5px] text-paragon-grey-300 text-right">Recuperação (EAD)</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
