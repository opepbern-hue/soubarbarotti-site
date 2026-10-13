// Gerador de mensagens e lembretes para prospecção no Mapa de Leads
// Baseado estritamente no prompt validado e nas regras de LGPD do Pedro Barbarotti.

export type LeadMessagingInput = {
  nome: string;
  nomeSocio?: string | null;
  nicho?: string | null;
  cidade?: string | null;
  ofertaPersonalizada?: string | null;
};

/**
 * Gera a primeira mensagem em até 5 linhas com saudação personalizada pelo nome do sócio,
 * menção contextual ao perfil, oferta e saída fácil.
 */
export function gerarPrimeiraMensagem(input: LeadMessagingInput): string {
  const socio = input.nomeSocio?.trim();
  const primeiroNome = socio ? socio.split(' ')[0] : null;
  const saudacao = primeiroNome ? `Oi, ${primeiroNome}!` : 'Olá, tudo bem?';

  const nicho = (input.nicho || '').toLowerCase();
  let gancho = `Vi o perfil da ${input.nome} e curti muito o posicionamento de vocês.`;
  if (nicho.includes('doce') || nicho.includes('confeitaria') || nicho.includes('bolo')) {
    gancho = `Vi os doces e o cardápio da ${input.nome} no Instagram, o visual dos produtos é incrível.`;
  } else if (nicho.includes('hamburguer') || nicho.includes('burger') || nicho.includes('comida')) {
    gancho = `Vi as fotos e os pratos da ${input.nome}, o cardápio de vocês dá água na boca.`;
  } else if (nicho.includes('moda') || nicho.includes('roupa') || nicho.includes('vestuário')) {
    gancho = `Vi a coleção e as peças da ${input.nome} no perfil de vocês, curti muito a curadoria.`;
  } else if (nicho.includes('barbearia') || nicho.includes('beleza') || nicho.includes('estética')) {
    gancho = `Vi o espaço e o estilo de atendimento da ${input.nome}, visual muito forte.`;
  }

  const oferta =
    input.ofertaPersonalizada ||
    'Tô com uma condição especial de 6 fotos de produto com IA para os 5 primeiros negócios da região (entrega em 48h).';

  return [
    saudacao,
    `Sou o Pedro Barbarotti, aqui da região. ${gancho}`,
    oferta,
    'Se fizer sentido pra vocês, preparo uma amostra rápida sem compromisso.',
    'Se não fizer sentido agora, é só me avisar que não mando mais nada!',
  ].join('\n');
}

/**
 * Gera o lembrete respeitoso de 48h para leads que ainda não responderam ao primeiro contato.
 * Regra: no máximo 1 lembrete após 48h. Se não responder, encerra.
 */
export function gerarLembrete48h(input: LeadMessagingInput): string {
  const socio = input.nomeSocio?.trim();
  const primeiroNome = socio ? socio.split(' ')[0] : null;
  const saudacao = primeiroNome ? `Oi, ${primeiroNome}!` : 'Olá!';

  return [
    saudacao,
    `Passando só pra saber se conseguiu dar uma olhada na mensagem anterior sobre as fotos da ${input.nome}.`,
    'Se a rotina estiver corrida ou não fizer sentido no momento, sem problema nenhum!',
  ].join('\n');
}
