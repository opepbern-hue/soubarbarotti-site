'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { gerarPrimeiraMensagem } from '@/lib/lead-messaging';

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const opt = (fd: FormData, k: string) => (str(fd, k) ? str(fd, k) : null);
const num = (fd: FormData, k: string): number | null => {
  const val = str(fd, k);
  if (!val) return null;
  const n = Number(val.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const intNum = (fd: FormData, k: string, fallback = 1): number => {
  const val = str(fd, k);
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
};

function back(path: string, msg = 'Salvo.'): never {
  redirect(`${path}${path.includes('?') ? '&' : '?'}ok=${encodeURIComponent(msg)}`);
}

export async function createLeadAction(fd: FormData) {
  await requireAdmin();
  const nome = str(fd, 'nome');
  if (!nome) back('/admin/leads', 'O nome do lead é obrigatório.');

  const lat = num(fd, 'lat');
  const lng = num(fd, 'lng');
  const cidade = opt(fd, 'cidade');
  const estado = opt(fd, 'estado');
  const bairro = opt(fd, 'bairro');
  const horario = opt(fd, 'horario');
  const instagram = opt(fd, 'instagram');
  const whatsapp = opt(fd, 'whatsapp');
  const email = opt(fd, 'email');
  const siteUrl = opt(fd, 'siteUrl');
  const nicho = opt(fd, 'nicho');
  const etapa = str(fd, 'etapa') || 'novo';
  const valor = opt(fd, 'valor');
  const notas = opt(fd, 'notas');
  const origem = str(fd, 'origem') || 'mapa';

  // Campos específicos do documento Mapa de Leads
  const cnpj = opt(fd, 'cnpj')?.replace(/\D/g, '') || null;
  const situacaoCnpj = opt(fd, 'situacaoCnpj') || (cnpj ? 'Ativa' : null);
  const porte = opt(fd, 'porte');
  const dataAbertura = opt(fd, 'dataAbertura');
  const nomeSocio = opt(fd, 'nomeSocio');
  const prioridade = intNum(fd, 'prioridade', 1);
  const motivoPrioridade = opt(fd, 'motivoPrioridade');
  const proximoPasso = opt(fd, 'proximoPasso');
  const naoVerificado = opt(fd, 'naoVerificado');

  // Gerar primeira mensagem automaticamente se não informada
  let primeiraMensagem = opt(fd, 'primeiraMensagem');
  if (!primeiraMensagem) {
    primeiraMensagem = gerarPrimeiraMensagem({
      nome,
      nomeSocio,
      nicho,
      cidade,
    });
  }

  // Prevenir duplicatas se CNPJ ou Instagram já existirem
  if (cnpj) {
    const existingCnpj = await prisma.lead.findFirst({ where: { cnpj } });
    if (existingCnpj) {
      back(str(fd, 'returnUrl') || '/admin/leads', `Atenção: Já existe um lead cadastrado com este CNPJ ("${existingCnpj.nome}").`);
    }
  }

  await prisma.lead.create({
    data: {
      nome,
      bairro,
      horario,
      email,
      whatsapp,
      instagram,
      siteUrl,
      nicho,
      cidade,
      estado,
      lat,
      lng,
      cnpj,
      situacaoCnpj,
      porte,
      dataAbertura,
      nomeSocio,
      prioridade,
      motivoPrioridade,
      primeiraMensagem,
      proximoPasso,
      naoVerificado,
      etapa,
      valor,
      origem,
      notas,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  back(str(fd, 'returnUrl') || '/admin/leads', `Lead "${nome}" cadastrado com sucesso!`);
}

export async function updateLeadStageAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  const etapa = str(fd, 'etapa');
  const returnUrl = str(fd, 'returnUrl') || '/admin/leads';

  if (!id || !etapa) back(returnUrl, 'Dados inválidos.');

  const lead = await prisma.lead.update({
    where: { id },
    data: { etapa },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  back(returnUrl, `Lead "${lead.nome}" movido para ${etapa}.`);
}

export async function updateLeadAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  const returnUrl = str(fd, 'returnUrl') || '/admin/leads';

  if (!id) back(returnUrl, 'Lead não encontrado.');

  const nome = str(fd, 'nome');
  if (!nome) back(returnUrl, 'O nome é obrigatório.');

  const cnpj = opt(fd, 'cnpj')?.replace(/\D/g, '') || null;

  await prisma.lead.update({
    where: { id },
    data: {
      nome,
      bairro: opt(fd, 'bairro'),
      horario: opt(fd, 'horario'),
      email: opt(fd, 'email'),
      whatsapp: opt(fd, 'whatsapp'),
      instagram: opt(fd, 'instagram'),
      siteUrl: opt(fd, 'siteUrl'),
      nicho: opt(fd, 'nicho'),
      cidade: opt(fd, 'cidade'),
      estado: opt(fd, 'estado'),
      lat: num(fd, 'lat'),
      lng: num(fd, 'lng'),
      cnpj,
      situacaoCnpj: opt(fd, 'situacaoCnpj'),
      porte: opt(fd, 'porte'),
      dataAbertura: opt(fd, 'dataAbertura'),
      nomeSocio: opt(fd, 'nomeSocio'),
      prioridade: intNum(fd, 'prioridade', 1),
      motivoPrioridade: opt(fd, 'motivoPrioridade'),
      primeiraMensagem: opt(fd, 'primeiraMensagem'),
      proximoPasso: opt(fd, 'proximoPasso'),
      naoVerificado: opt(fd, 'naoVerificado'),
      etapa: str(fd, 'etapa') || 'novo',
      valor: opt(fd, 'valor'),
      notas: opt(fd, 'notas'),
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  back(returnUrl, `Lead "${nome}" atualizado.`);
}

export async function deleteLeadAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'id');
  const returnUrl = str(fd, 'returnUrl') || '/admin/leads';

  if (!id) back(returnUrl, 'Lead não encontrado.');

  const lead = await prisma.lead.delete({ where: { id } });

  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  back(returnUrl, `Lead "${lead.nome}" excluído.`);
}

export async function convertMessageToLeadAction(fd: FormData) {
  await requireAdmin();
  const messageId = str(fd, 'messageId');
  if (!messageId) back('/admin/mensagens', 'Mensagem não encontrada.');

  const msg = await prisma.contactMessage.findUnique({ where: { id: messageId } });
  if (!msg) back('/admin/mensagens', 'Mensagem não encontrada.');

  const lat = num(fd, 'lat');
  const lng = num(fd, 'lng');
  const cidade = str(fd, 'cidade') || 'Florianópolis';
  const estado = str(fd, 'estado') || 'SC';

  const lead = await prisma.lead.create({
    data: {
      nome: msg.name,
      email: msg.email,
      notas: `Convertido de Mensagem de Contato:\n"${msg.message}"`,
      cidade,
      estado,
      lat: lat ?? -27.5948,
      lng: lng ?? -48.5482,
      origem: 'site_contato',
      etapa: 'novo',
      prioridade: 1,
      motivoPrioridade: 'Mensagem enviada voluntariamente pelo formulário do site',
      primeiraMensagem: `Olá ${msg.name}! Vi sua mensagem enviada pelo site soubarbarotti.com.br. Muito obrigado pelo contato!`,
      contactMessageId: msg.id,
    },
  });

  await prisma.contactMessage.update({
    where: { id: messageId },
    data: { archived: true, readAt: new Date() },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/mensagens');
  revalidatePath('/admin/leads');
  back('/admin/leads', `Mensagem de "${lead.nome}" convertida em Lead no Mapa!`);
}

/**
 * Limpeza de Leads Repetidos (Deduplicação)
 * Remove registros duplicados que compartilham o mesmo CNPJ, mesmo Instagram ou mesmo nome na mesma cidade.
 */
export async function deduplicateLeadsAction(fd: FormData) {
  await requireAdmin();
  const returnUrl = str(fd, 'returnUrl') || '/admin/leads';

  const allLeads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  const seenCnpj = new Set<string>();
  const seenIg = new Set<string>();
  const seenNameCity = new Set<string>();
  const idsToDelete: string[] = [];

  for (const lead of allLeads) {
    let isDupe = false;

    if (lead.cnpj) {
      const c = lead.cnpj.replace(/\D/g, '');
      if (seenCnpj.has(c)) isDupe = true;
      else seenCnpj.add(c);
    }

    if (!isDupe && lead.instagram) {
      const ig = lead.instagram.replace(/[@\s]/g, '').toLowerCase();
      if (ig.length > 2) {
        if (seenIg.has(ig)) isDupe = true;
        else seenIg.add(ig);
      }
    }

    if (!isDupe && lead.nome && lead.cidade) {
      const key = `${lead.nome.trim().toLowerCase()}__${lead.cidade.trim().toLowerCase()}`;
      if (seenNameCity.has(key)) isDupe = true;
      else seenNameCity.add(key);
    }

    if (isDupe) {
      idsToDelete.push(lead.id);
    }
  }

  if (idsToDelete.length > 0) {
    await prisma.lead.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }

  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  back(
    returnUrl,
    idsToDelete.length > 0
      ? `Limpeza concluída! ${idsToDelete.length} lead(s) repetido(s) foram removidos.`
      : 'Nenhum lead repetido encontrado. A base está 100% limpa!'
  );
}

/**
 * Importação em lote da tabela gerada pelo Claude (Prompt do Mapa de Leads)
 */
export async function importBatchLeadsAction(fd: FormData) {
  await requireAdmin();
  const rawText = str(fd, 'batchText');
  const returnUrl = str(fd, 'returnUrl') || '/admin/leads';

  if (!rawText) back(returnUrl, 'Nenhum conteúdo para importar.');

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  let importedCount = 0;

  for (const line of lines) {
    // Detectar linhas de tabela Markdown: | # | Negócio | Bairro | ...
    if (line.includes('|')) {
      const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
      // Ignorar cabeçalho ou separadores
      if (cols.length < 3 || cols[0].toLowerCase().includes('negócio') || cols[0].startsWith('---')) {
        continue;
      }

      // Ordem padrão do prompt:
      // # | Negócio | Bairro | Contato divulgado | Instagram ou site | CNPJ | Porte/MEI | Abertura | Nome do sócio | Prioridade | Motivo
      const nome = cols[1] || cols[0];
      if (!nome || nome === '#') continue;

      const bairro = cols[2] || null;
      const contato = cols[3] || null;
      const igOrSite = cols[4] || null;
      const rawCnpj = cols[5] || null;
      const porte = cols[6] || null;
      const abertura = cols[7] || null;
      const socio = cols[8] || null;
      const prioRaw = parseInt(cols[9] || '1', 10);
      const prioridade = [1, 2, 3].includes(prioRaw) ? prioRaw : 1;
      const motivo = cols[10] || null;

      // Sanitizar CNPJ
      const cnpj = rawCnpj && rawCnpj.length >= 14 ? rawCnpj.replace(/\D/g, '') : null;
      if (cnpj) {
        const exists = await prisma.lead.findFirst({ where: { cnpj } });
        if (exists) continue; // Pular duplicado
      }

      const cleanWa = contato ? contato.replace(/\D/g, '') : null;
      const cleanIg = igOrSite && igOrSite.includes('@') ? igOrSite.replace('@', '').trim() : null;

      const msg = gerarPrimeiraMensagem({
        nome,
        nomeSocio: socio,
        nicho: motivo,
      });

      await prisma.lead.create({
        data: {
          nome,
          bairro,
          whatsapp: cleanWa,
          instagram: cleanIg,
          siteUrl: igOrSite && igOrSite.startsWith('http') ? igOrSite : null,
          cnpj,
          porte: porte && !porte.includes('-') ? porte : null,
          dataAbertura: abertura && !abertura.includes('-') ? abertura : null,
          nomeSocio: socio && !socio.includes('-') ? socio : null,
          prioridade,
          motivoPrioridade: motivo,
          primeiraMensagem: msg,
          origem: 'claude_mapa',
          etapa: 'novo',
        },
      });

      importedCount++;
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  back(
    returnUrl,
    importedCount > 0
      ? `Sucesso! ${importedCount} lead(s) importados da saída do Claude.`
      : 'Não foi possível detectar linhas de tabela válidas. Verifique o formato e tente novamente.'
  );
}
