'use client';

import React, { useState } from 'react';
import type { Lead } from '@prisma/client';
import {
  createLeadAction,
  deduplicateLeadsAction,
  deleteLeadAction,
  importBatchLeadsAction,
  updateLeadAction,
  updateLeadStageAction,
} from '@/app/admin/lead-actions';
import { ETAPAS_CONFIG, LeadCaptureMap, PRIORIDADES_CONFIG } from './LeadCaptureMap';
import { gerarLembrete48h, gerarPrimeiraMensagem } from '@/lib/lead-messaging';

type Props = {
  initialLeads: Lead[];
  unreadMessagesCount?: number;
};

export function CentralLeadDashboard({ initialLeads, unreadMessagesCount = 0 }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeTab, setActiveTab] = useState<'mapa' | 'tabela' | 'prompt' | 'novo'>('mapa');
  const [selectedEtapa, setSelectedEtapa] = useState<string>('todos');
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal de Edição de Lead
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Estado da busca rápida de CNPJ no formulário manual
  const [isConsultingCnpj, setIsConsultingCnpj] = useState(false);
  const [cnpjFeedback, setCnpjFeedback] = useState<string | null>(null);
  const [formCnpj, setFormCnpj] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formBairro, setFormBairro] = useState('');
  const [formCidade, setFormCidade] = useState('Florianópolis');
  const [formSocio, setFormSocio] = useState('');
  const [formPorte, setFormPorte] = useState('MEI');
  const [formDataAbertura, setFormDataAbertura] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formSiteUrl, setFormSiteUrl] = useState('');
  const [formHorario, setFormHorario] = useState('');
  const [formPrioridade, setFormPrioridade] = useState('1');
  const [formMotivo, setFormMotivo] = useState('');
  const [formMensagem, setFormMensagem] = useState('');

  // Atualizar quando props mudarem
  React.useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  // Estatísticas do Funil e Prioridades
  const totalLeads = leads.length;
  const p1Count = leads.filter((l) => l.prioridade === 1).length;
  const contatadosCount = leads.filter((l) => ['chamado', 'respondeu', 'call', 'proposta'].includes(l.etapa)).length;
  const fechadosCount = leads.filter((l) => l.etapa === 'fechado').length;

  const leadsFiltrados = leads.filter((l) => {
    if (selectedEtapa !== 'todos' && l.etapa !== selectedEtapa) return false;
    if (selectedPrioridade !== 'todas' && String(l.prioridade) !== selectedPrioridade) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        l.nome.toLowerCase().includes(q) ||
        (l.bairro || '').toLowerCase().includes(q) ||
        (l.cidade || '').toLowerCase().includes(q) ||
        (l.nomeSocio || '').toLowerCase().includes(q) ||
        (l.cnpj || '').toLowerCase().includes(q) ||
        (l.instagram || '').toLowerCase().includes(q) ||
        (l.whatsapp || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Copiar para clipboard com feedback
  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  // Consulta gratuita de CNPJ no form manual
  async function handleConsultarCnpjManual() {
    const raw = formCnpj.replace(/\D/g, '');
    if (raw.length !== 14) {
      setCnpjFeedback('Digite um CNPJ válido com 14 dígitos.');
      return;
    }

    setIsConsultingCnpj(true);
    setCnpjFeedback('Consultando base pública...');
    try {
      const res = await fetch(`/api/admin/cnpj/${raw}`);
      if (!res.ok) throw new Error('Não encontrado');
      const info = await res.json();

      const socio = info.socioPrincipal || formSocio;
      const empresa = info.nomeFantasia || info.razaoSocial || formNome;
      setFormNome(empresa);
      setFormBairro(info.bairro || formBairro);
      setFormCidade(info.cidade || formCidade);
      setFormSocio(socio || '');
      setFormPorte(info.porte || formPorte);
      setFormDataAbertura(info.dataAbertura || formDataAbertura);
      if (info.telefoneDivulgado) setFormWhatsapp(info.telefoneDivulgado);

      const msg = gerarPrimeiraMensagem({
        nome: empresa,
        nomeSocio: socio,
        cidade: info.cidade,
      });
      setFormMensagem(msg);

      setCnpjFeedback(
        `✓ Sucesso! ${info.isMei ? 'MEI detectado.' : `Porte: ${info.porte}.`} ${socio ? `Sócio: ${socio}.` : ''}`
      );
    } catch {
      setCnpjFeedback('Não foi possível obter dados automáticos da API. Consulte em https://open.cnpja.com/office/' + raw);
    } finally {
      setIsConsultingCnpj(false);
    }
  }

  const promptTexto = `Você é o assistente de prospecção do Pedro Barbarotti (soubarbarotti.com.br). Monte um mapa de leads só com dados públicos e verificados.

ENTRADA
- Região: Florianópolis e região (ou defina os bairros: ex.: Centro, Lagoa, Itacorubi, Santa Mônica, Campeche)
- Setores: [docerias, hamburguerias, barbearias, confeitarias, marcas locais de roupa]
- Quantidade: 10 leads
- Oferta: 6 fotos de produto com IA por R$ 390, entrega em 48h, 50% de sinal no PIX, preço de portfólio para os 5 primeiros
- Quem eu sou: Pedro Barbarotti, da região
- Já contatados, não repetir: [lista]

RODADA 1
1. Busque negócios dos setores na região (Google Maps ou busca web). Prefira negócios pequenos, ativos, tocados pelo dono, que vendem produto visual. Pule redes e franquias, clínicas estéticas/médicas, e negócios fechados.
2. Para cada lead, colete só o que o próprio negócio publica: nome, bairro, horário, telefone ou WhatsApp divulgado, Instagram, site, Linktree ou iFood.
3. Procure o CNPJ (rodapé do site, página do iFood, busca "nome + cidade + CNPJ"). Se achar, escreva o link https://open.cnpja.com/office/ seguido dos 14 números. Se não achar, escreva "CNPJ não encontrado". Nunca invente um CNPJ.
4. Dê prioridade de 1 a 3 e explique em uma linha. 1 = pequeno, de dono, produto visual, fotos fracas ou aberto há menos de 2 anos. 2 = bom encaixe, negócio maior. 3 = encaixe fraco.
5. Termine a rodada 1 com a lista de links da CNPJá, um por linha, e peça para eu colar esses links de volta na conversa.

RODADA 2 (quando eu colar os links)
6. Abra cada link e registre: situação, porte, se é MEI, data de abertura e o nome do sócio ou administrador.
7. Escreva a primeira mensagem de cada lead, em até 5 linhas: cumprimente o dono pelo primeiro nome (se ele constar como sócio), diga quem eu sou, cite algo real do perfil do negócio, apresente a oferta, ofereça uma amostra e termine com uma saída fácil ("se não fizer sentido, é só avisar que não mando mais nada").

REGRAS
- Nunca busque nem registre telefone, e-mail ou perfil pessoal de sócio. O nome serve só para o cumprimento ("Oi, [Nome]").
- Se o negócio for MEI, ignore telefone e e-mail do cadastro da Receita e use só o contato que o negócio divulga.
- Canal sugerido: DM no Instagram primeiro. WhatsApp só se a marca divulga o número para contato. Nada de disparo em massa.
- No máximo um lembrete depois de 48 horas. Quem disser não sai da lista.

SAÍDA
1. Tabela: # | Negócio | Bairro | Contato divulgado | Instagram ou site | CNPJ | Porte/MEI | Abertura | Nome do sócio | Prioridade | Motivo
2. Abaixo, a mensagem de cada lead, numerada igual à tabela.`;

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards Header */}
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <div className="rounded-2xl bg-branco-tela p-5 ring-1 ring-linha shadow-sm">
          <p className="font-display text-3xl font-bold tracking-tight text-carvao">{totalLeads}</p>
          <p className="mt-1 text-xs font-semibold text-fumaca">Total no Mapa de Leads</p>
        </div>
        <div className="rounded-2xl bg-amber-500/10 p-5 ring-1 ring-amber-400/40 shadow-sm">
          <p className="font-display text-3xl font-bold tracking-tight text-amber-600">{p1Count}</p>
          <p className="mt-1 text-xs font-bold text-amber-800">★ Prioridade 1 (Fazer Amostra)</p>
        </div>
        <div className="rounded-2xl bg-blue-50/70 p-5 ring-1 ring-blue-200 shadow-sm">
          <p className="font-display text-3xl font-bold tracking-tight text-blue-600">{contatadosCount}</p>
          <p className="mt-1 text-xs font-semibold text-blue-800">Em Contato / Negociação</p>
        </div>
        <div className="rounded-2xl bg-emerald-50/70 p-5 ring-1 ring-emerald-200 shadow-sm">
          <p className="font-display text-3xl font-bold tracking-tight text-emerald-600">{fechadosCount}</p>
          <p className="mt-1 text-xs font-semibold text-emerald-800">Clientes Fechados</p>
        </div>
      </div>

      {/* Control Bar & Toggle View */}
      <div className="flex flex-col gap-3 rounded-2xl bg-branco-tela p-4 ring-1 ring-linha md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('mapa')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'mapa' ? 'bg-carvao text-white shadow-md' : 'bg-cinza-claro text-carvao hover:bg-cinza-medio'
            }`}
          >
            <span>🗺️ Mapa Interativo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tabela')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'tabela' ? 'bg-carvao text-white shadow-md' : 'bg-cinza-claro text-carvao hover:bg-cinza-medio'
            }`}
          >
            <span>📋 Tabela Validada ({leadsFiltrados.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'prompt' ? 'bg-carvao text-white shadow-md' : 'bg-cinza-claro text-carvao hover:bg-cinza-medio'
            }`}
          >
            <span>🤖 Prompt do Claude & Importar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('novo')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'novo' ? 'bg-brasa text-white shadow-md' : 'bg-brasa/10 text-brasa hover:bg-brasa/20'
            }`}
          >
            <span>+ Novo Lead Manual</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Limpeza de Duplicatas */}
          <form action={deduplicateLeadsAction}>
            <input type="hidden" name="returnUrl" value="/admin/leads" />
            <button
              type="submit"
              onClick={(e) => {
                if (!confirm('Deseja analisar e limpar automaticamente leads repetidos (mesmo CNPJ, Instagram ou nome)?')) {
                  e.preventDefault();
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-linha bg-white px-3 py-1.5 text-xs font-semibold text-fumaca hover:text-carvao hover:bg-cinza-claro"
              title="Detecta e remove duplicatas com segurança"
            >
              <span>🧹 Limpar Repetidos</span>
            </button>
          </form>

          {unreadMessagesCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
              <span>📩</span>
              <span>{unreadMessagesCount} mensagem(ns) do site</span>
            </div>
          )}
        </div>
      </div>

      {/* Aba 1: Mapa Interativo */}
      {activeTab === 'mapa' && <LeadCaptureMap initialLeads={leads} />}

      {/* Aba 2: Tabela Validada conforme especificação */}
      {activeTab === 'tabela' && (
        <div className="rounded-2xl bg-branco-tela p-5 ring-1 ring-linha shadow-sm">
          {/* Barra de Busca e Filtros da Tabela */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-carvao">
                Tabela de Leads — Pesquisa & Contato
              </h3>
              <p className="text-xs text-fumaca">Dados públicos validados, sem telefone pessoal de sócio (conforme LGPD)</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Buscar por negócio, sócio, bairro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl border border-linha bg-white px-3 py-1.5 text-xs text-carvao focus:outline-none focus:ring-2 focus:ring-brasa w-64"
              />

              <select
                value={selectedPrioridade}
                onChange={(e) => setSelectedPrioridade(e.target.value)}
                className="rounded-xl border border-linha bg-white px-3 py-1.5 text-xs font-bold text-carvao focus:outline-none focus:ring-2 focus:ring-brasa"
              >
                <option value="todas">Todas as Prioridades</option>
                <option value="1">★ Prioridade 1 (Amostra)</option>
                <option value="2">Prioridade 2 (Médio)</option>
                <option value="3">Prioridade 3 (Fraco)</option>
              </select>

              <select
                value={selectedEtapa}
                onChange={(e) => setSelectedEtapa(e.target.value)}
                className="rounded-xl border border-linha bg-white px-3 py-1.5 text-xs font-medium text-carvao focus:outline-none focus:ring-2 focus:ring-brasa"
              >
                <option value="todos">Todos os Estágios</option>
                {Object.entries(ETAPAS_CONFIG).map(([key, conf]) => (
                  <option key={key} value={key}>
                    {conf.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {leadsFiltrados.length === 0 ? (
            <div className="py-14 text-center text-sm text-fumaca">
              Nenhum lead encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-linha bg-cinza-claro/60 text-fumaca uppercase text-[11px] tracking-wider font-semibold">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Negócio</th>
                    <th className="py-3 px-3">Bairro / Cidade</th>
                    <th className="py-3 px-3">Sócio / Dono</th>
                    <th className="py-3 px-3">Contato Divulgado</th>
                    <th className="py-3 px-3">CNPJ / Porte</th>
                    <th className="py-3 px-3">Prioridade</th>
                    <th className="py-3 px-3">Abordagem & Mensagem</th>
                    <th className="py-3 px-3">Estágio</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linha">
                  {leadsFiltrados.map((lead, idx) => {
                    const conf = ETAPAS_CONFIG[lead.etapa] || ETAPAS_CONFIG.novo;
                    const isP1 = lead.prioridade === 1;
                    const waClean = lead.whatsapp ? lead.whatsapp.replace(/\D/g, '') : null;
                    const waLink = waClean
                      ? `https://wa.me/55${waClean}?text=${encodeURIComponent(
                          lead.primeiraMensagem || `Oi, tudo bem? Sou o Pedro Barbarotti!`
                        )}`
                      : null;
                    const cnpjaUrl = lead.cnpj
                      ? `https://open.cnpja.com/office/${lead.cnpj.replace(/\D/g, '')}`
                      : null;

                    const msg5linhas =
                      lead.primeiraMensagem ||
                      gerarPrimeiraMensagem({
                        nome: lead.nome,
                        nomeSocio: lead.nomeSocio,
                        cidade: lead.cidade,
                      });

                    const lembrete48h = gerarLembrete48h({
                      nome: lead.nome,
                      nomeSocio: lead.nomeSocio,
                    });

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-cinza-claro/40 transition-colors ${
                          isP1 ? 'bg-amber-500/[0.03]' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono text-[11px] text-fumaca">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-sm text-carvao">{lead.nome}</p>
                          {lead.nicho && <p className="text-[11px] text-fumaca">{lead.nicho}</p>}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-carvao">{lead.bairro || 'Centro'}</p>
                          <p className="text-[11px] text-fumaca">{lead.cidade || 'Florianópolis'}</p>
                        </td>
                        <td className="py-3 px-3">
                          {lead.nomeSocio ? (
                            <div>
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md ring-1 ring-emerald-200">
                                👤 {lead.nomeSocio}
                              </span>
                              <p className="text-[10px] text-fumaca mt-0.5">Cumprimento: "Oi, {lead.nomeSocio.split(' ')[0]}"</p>
                            </div>
                          ) : (
                            <span className="text-fumaca italic">Não identificado</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            {lead.instagram && (
                              <a
                                href={`https://instagram.com/${lead.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 font-semibold hover:underline flex items-center gap-1"
                              >
                                <span>📸</span> @{lead.instagram.replace('@', '')}
                              </a>
                            )}
                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                              >
                                <span>💬</span> {lead.whatsapp}
                              </a>
                            )}
                            {lead.siteUrl && (
                              <a
                                href={lead.siteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate max-w-[130px]"
                              >
                                🔗 {lead.siteUrl.replace(/^https?:\/\//, '')}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {lead.cnpj ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono text-[11px] font-semibold text-carvao">{lead.cnpj}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 font-bold">
                                  {lead.porte || 'ME'}
                                </span>
                                {cnpjaUrl && (
                                  <a
                                    href={cnpjaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-blue-600 hover:underline font-semibold"
                                  >
                                    CNPJá ↗
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-fumaca text-[11px]">CNPJ não informado</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                              isP1
                                ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                                : lead.prioridade === 2
                                ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            {isP1 ? '★ P1' : `P${lead.prioridade || 1}`}
                          </span>
                          {lead.motivoPrioridade && (
                            <p className="mt-1 text-[10px] text-fumaca italic max-w-[150px] leading-tight">
                              {lead.motivoPrioridade}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(msg5linhas, `msg-${lead.id}`)}
                              className="inline-flex items-center gap-1 rounded-lg bg-carvao px-2.5 py-1 text-[11px] font-bold text-white hover:bg-carvao/80 transition-all shadow-sm"
                            >
                              <span>{copiedId === `msg-${lead.id}` ? '✓ Copiado!' : '📋 Copiar 1ª Mensagem'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(lembrete48h, `rem-${lead.id}`)}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-fumaca hover:text-carvao underline"
                            >
                              <span>{copiedId === `rem-${lead.id}` ? '✓ Copiado!' : 'Copiar Lembrete 48h'}</span>
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <form action={updateLeadStageAction} className="inline-block">
                            <input type="hidden" name="id" value={lead.id} />
                            <input type="hidden" name="returnUrl" value="/admin/leads" />
                            <select
                              name="etapa"
                              defaultValue={lead.etapa}
                              onChange={(e) => e.target.form?.requestSubmit()}
                              className={`rounded-lg px-2 py-1 font-bold text-[11px] border-0 ring-1 ring-inset ${conf.bg} ${conf.text} cursor-pointer focus:outline-none`}
                            >
                              {Object.entries(ETAPAS_CONFIG).map(([k, c]) => (
                                <option key={k} value={k} className="bg-white text-carvao">
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </form>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingLead(lead)}
                              className="text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 hover:bg-blue-50 rounded-lg"
                            >
                              Editar
                            </button>
                            <form action={deleteLeadAction} className="inline-block">
                              <input type="hidden" name="id" value={lead.id} />
                              <input type="hidden" name="returnUrl" value="/admin/leads" />
                              <button
                                type="submit"
                                onClick={(e) => {
                                  if (!confirm(`Excluir o lead "${lead.nome}"?`)) e.preventDefault();
                                }}
                                className="text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 hover:bg-rose-50 rounded-lg"
                              >
                                Apagar
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Aba 3: Prompt do Claude & Importador */}
      {activeTab === 'prompt' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Caixa do Prompt Oficial */}
          <div className="rounded-2xl bg-branco-tela p-6 ring-1 ring-linha shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <h3 className="font-display text-lg font-bold text-carvao">Prompt Validado do Claude</h3>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(promptTexto, 'prompt-full')}
                  className="rounded-xl bg-brasa px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
                >
                  {copiedId === 'prompt-full' ? '✓ Prompt Copiado!' : 'Copiar Prompt Completo'}
                </button>
              </div>
              <p className="text-xs text-fumaca mb-4">
                Cole este texto numa conversa nova do Claude com busca na web ligada. Ele roda a Rodada 1 para achar os negócios e a Rodada 2 com os links de CNPJ.
              </p>
              <pre className="p-4 rounded-xl bg-carvao text-white/90 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-[380px] leading-relaxed border border-white/10">
                {promptTexto}
              </pre>
            </div>
            <div className="mt-4 pt-3 border-t border-linha text-xs text-fumaca flex items-center justify-between">
              <span>Fonte: Pesquisa & Prompt validado por Pedro Barbarotti</span>
              <a
                href="https://open.cnpja.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brasa font-bold hover:underline"
              >
                Abrir CNPJá Grátis ↗
              </a>
            </div>
          </div>

          {/* Importador de Tabela / Lote */}
          <div className="rounded-2xl bg-branco-tela p-6 ring-1 ring-linha shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📥</span>
                <h3 className="font-display text-lg font-bold text-carvao">Importar Tabela do Claude</h3>
              </div>
              <p className="text-xs text-fumaca mb-4">
                Cole aqui a tabela gerada na Rodada 2 do Claude. O sistema detectará colunas de Negócio, Bairro, WhatsApp, Instagram, CNPJ, Sócio, Porte e Prioridade, salvando todos os leads automaticamente no mapa!
              </p>

              <form action={importBatchLeadsAction} className="flex flex-col gap-3">
                <input type="hidden" name="returnUrl" value="/admin/leads" />
                <textarea
                  name="batchText"
                  rows={13}
                  required
                  placeholder={`Cole aqui a tabela Markdown. Exemplo:\n| # | Negócio | Bairro | Contato divulgado | Instagram ou site | CNPJ | Porte/MEI | Abertura | Nome do sócio | Prioridade | Motivo |\n| 1 | Doce Encanto | Centro | (48) 99123-4567 | @doceencanto | 12.345.678/0001-90 | MEI | 15/02/2023 | Daniela | 1 | Pequeno, produto visual, fotos antigas |`}
                  className="w-full rounded-xl border border-linha bg-white p-3 text-xs font-mono text-carvao placeholder-fumaca/50 focus:outline-none focus:ring-2 focus:ring-brasa"
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-fumaca">Duplicatas por CNPJ serão ignoradas automaticamente</span>
                  <button
                    type="submit"
                    className="rounded-xl bg-carvao px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-carvao/80 transition-all"
                  >
                    Importar Leads para o Mapa
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Aba 4: Novo Lead Manual com Busca de CNPJ */}
      {activeTab === 'novo' && (
        <div className="rounded-2xl bg-branco-tela p-6 ring-1 ring-linha shadow-sm max-w-3xl">
          <h3 className="font-display text-xl font-bold text-carvao mb-1">Cadastrar Lead com Dados Oficiais</h3>
          <p className="text-xs text-fumaca mb-5">
            Use a busca gratuita de CNPJ para puxar sócios e porte automaticamente sem custos de API.
          </p>

          {/* Consulta Rápida de CNPJ */}
          <div className="mb-6 rounded-2xl bg-blue-50/70 p-4 border border-blue-200">
            <label className="block text-xs font-bold text-blue-900 mb-1">
              🔍 Auto-Preenchimento por CNPJ Grátis
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite os 14 números do CNPJ..."
                value={formCnpj}
                onChange={(e) => setFormCnpj(e.target.value)}
                className="flex-1 rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs text-carvao focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleConsultarCnpjManual}
                disabled={isConsultingCnpj}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
              >
                {isConsultingCnpj ? 'Consultando...' : 'Puxar Dados Grátis'}
              </button>
            </div>
            {cnpjFeedback && <p className="mt-2 text-xs text-blue-800 font-medium">{cnpjFeedback}</p>}
          </div>

          <form action={createLeadAction} className="flex flex-col gap-4">
            <input type="hidden" name="returnUrl" value="/admin/leads" />
            <input type="hidden" name="origem" value="manual" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-carvao mb-1">Nome do Negócio *</label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: Confeitaria Doce Arte"
                  className="w-full rounded-xl border border-linha bg-white px-3 py-2 text-sm text-carvao focus:outline-none focus:ring-2 focus:ring-brasa"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-carvao mb-1">Bairro *</label>
                <input
                  type="text"
                  name="bairro"
                  value={formBairro}
                  onChange={(e) => setFormBairro(e.target.value)}
                  placeholder="Ex: Lagoa da Conceição"
                  className="w-full rounded-xl border border-linha bg-white px-3 py-2 text-sm text-carvao focus:outline-none focus:ring-2 focus:ring-brasa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  Nome do Sócio / Dono (para cumprimento)
                </label>
                <input
                  type="text"
                  name="nomeSocio"
                  value={formSocio}
                  onChange={(e) => setFormSocio(e.target.value)}
                  placeholder="Ex: Daniela"
                  className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-sm text-emerald-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-800 mb-1">Prioridade (1 a 3)</label>
                <select
                  name="prioridade"
                  value={formPrioridade}
                  onChange={(e) => setFormPrioridade(e.target.value)}
                  className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3 py-2 text-sm text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="1">1 - Alta (Fazer Amostra - Pequeno/Dono)</option>
                  <option value="2">2 - Média (Bom encaixe / Maior)</option>
                  <option value="3">3 - Fraca (Encaixe difícil)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-carvao mb-1">Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  value={formCidade}
                  onChange={(e) => setFormCidade(e.target.value)}
                  className="w-full rounded-xl border border-linha bg-white px-3 py-2 text-sm text-carvao focus:outline-none focus:ring-2 focus:ring-brasa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-carvao mb-1">Instagram (@da_marca)</label>
                <input
                  type="text"
                  name="instagram"
                  value={formInstagram}
                  onChange={(e) => setFormInstagram(e.target.value)}
                  placeholder="@marca"
                  className="w-full rounded-xl border border-linha bg-white px-3 py-2 text-sm text-carvao focus:outline-none focus:ring-2 focus:ring-brasa"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-carvao mb-1">WhatsApp divulgado pela marca</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formWhatsapp}
                  onChange={(e) => setFormWhatsapp(e.target.value)}
                  placeholder="48999999999"
                  className="w-full rounded-xl border border-linha bg-white px-3 py-2 text-sm text-carvao focus:outline-none focus:ring-2 focus:ring-brasa"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-carvao mb-1">Site / Linktree / iFood</label>
                <input
                  type="url"
                  name="siteUrl"
                  value={formSiteUrl}
                  onChange={(e) => setFormSiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-linha bg-white px-3 py-2 text-sm text-carvao focus:outline-none focus:ring-2 focus:ring-brasa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-carvao mb-1">CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formCnpj}
                  onChange={(e) => setFormCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full rounded-xl border border-linha bg-white px-3 py-2 text-xs font-mono text-carvao focus:outline-none focus:ring-2 focus:ring-brasa"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-carvao mb-1">Porte / Tipo</label>
                <input
                  type="text"
                  name="porte"
                  value={formPorte}
                  onChange={(e) => setFormPorte(e.target.value)}
                  placeholder="MEI, ME, EPP"
                  className="w-full rounded-xl border border-linha bg-white px-3 py-2 text-xs text-carvao focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-carvao mb-1">Data de Abertura</label>
                <input
                  type="text"
                  name="dataAbertura"
                  value={formDataAbertura}
                  onChange={(e) => setFormDataAbertura(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-full rounded-xl border border-linha bg-white px-3 py-2 text-xs text-carvao focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-carvao mb-1">Motivo da Prioridade (1 linha)</label>
              <input
                type="text"
                name="motivoPrioridade"
                value={formMotivo}
                onChange={(e) => setFormMotivo(e.target.value)}
                placeholder="Ex: Pequeno, fotos fracas no Instagram, produto visual com alto ticket"
                className="w-full rounded-xl border border-linha bg-white px-3 py-2 text-sm text-carvao focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-carvao mb-1">
                1ª Mensagem Personalizada (até 5 linhas com saída fácil)
              </label>
              <textarea
                name="primeiraMensagem"
                rows={5}
                value={formMensagem}
                onChange={(e) => setFormMensagem(e.target.value)}
                placeholder="Oi, Daniela! Sou o Pedro Barbarotti, aqui da região..."
                className="w-full rounded-xl border border-linha bg-white p-3 text-xs font-mono text-carvao focus:outline-none focus:ring-2 focus:ring-brasa"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-xl bg-brasa px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 transition-transform active:scale-95"
              >
                Cadastrar Lead no Mapa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Edição de Lead */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-linha">
            <div className="flex items-center justify-between border-b border-linha pb-3 mb-4">
              <h3 className="font-display text-lg font-bold text-carvao">
                Editar Lead — {editingLead.nome}
              </h3>
              <button
                onClick={() => setEditingLead(null)}
                type="button"
                className="text-fumaca hover:text-carvao text-lg"
              >
                ✕
              </button>
            </div>

            <form action={updateLeadAction} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={editingLead.id} />
              <input type="hidden" name="returnUrl" value="/admin/leads" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-carvao mb-1">Nome do Negócio *</label>
                  <input
                    type="text"
                    name="nome"
                    defaultValue={editingLead.nome}
                    required
                    className="w-full rounded-xl border border-linha p-2 text-sm text-carvao"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-carvao mb-1">Bairro</label>
                  <input
                    type="text"
                    name="bairro"
                    defaultValue={editingLead.bairro || ''}
                    className="w-full rounded-xl border border-linha p-2 text-sm text-carvao"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-800 mb-1">Sócio / Dono</label>
                  <input
                    type="text"
                    name="nomeSocio"
                    defaultValue={editingLead.nomeSocio || ''}
                    className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 p-2 text-sm text-emerald-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Prioridade</label>
                  <select
                    name="prioridade"
                    defaultValue={editingLead.prioridade || 1}
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/40 p-2 text-sm text-amber-900 font-bold"
                  >
                    <option value="1">1 - Alta (Amostra)</option>
                    <option value="2">2 - Média</option>
                    <option value="3">3 - Fraca</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-carvao mb-1">WhatsApp</label>
                  <input
                    type="text"
                    name="whatsapp"
                    defaultValue={editingLead.whatsapp || ''}
                    className="w-full rounded-xl border border-linha p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-carvao mb-1">Instagram</label>
                  <input
                    type="text"
                    name="instagram"
                    defaultValue={editingLead.instagram || ''}
                    className="w-full rounded-xl border border-linha p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-carvao mb-1">CNPJ</label>
                  <input
                    type="text"
                    name="cnpj"
                    defaultValue={editingLead.cnpj || ''}
                    className="w-full rounded-xl border border-linha p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-carvao mb-1">1ª Mensagem Personalizada</label>
                <textarea
                  name="primeiraMensagem"
                  rows={4}
                  defaultValue={editingLead.primeiraMensagem || ''}
                  className="w-full rounded-xl border border-linha p-2.5 text-xs font-mono text-carvao"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-linha">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="rounded-xl bg-cinza-claro px-4 py-2 text-xs font-semibold text-carvao"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-carvao px-5 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
