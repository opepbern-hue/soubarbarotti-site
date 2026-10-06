import { prisma } from '../src/lib/db';
import { gerarPrimeiraMensagem } from '../src/lib/lead-messaging';

// Leads fiéis à pesquisa e regras do "Mapa de Leads — pesquisa e prompt validado" de Pedro Barbarotti:
// Negócios locais visuais (docerias, hamburguerias, confeitarias, barbearias, lojas de roupa)
// Com nomes de sócios para cumprimento ("Oi, [Nome]"), canal público divulgado, prioridade 1 a 3 e mensagem de até 5 linhas.

const SEED_LEADS = [
  {
    nome: 'Doce Encanto Confeitaria',
    bairro: 'Centro',
    cidade: 'Florianópolis',
    estado: 'SC',
    horario: 'Seg-Sáb 11h-19h',
    lat: -27.5969,
    lng: -48.5495,
    nicho: 'Doceria & Bolos Artesanais',
    nomeSocio: 'Daniela Alcantara',
    porte: 'MEI',
    dataAbertura: '14/03/2023',
    cnpj: '45.182.910/0001-44',
    situacaoCnpj: 'Ativa',
    prioridade: 1,
    motivoPrioridade: 'Pequeno, de dono, produto visual incrível, fotos do feed atuais com baixa iluminação.',
    instagram: 'doceencantofloripa',
    whatsapp: '48991234567',
    siteUrl: 'https://instagram.com/doceencantofloripa',
    etapa: 'novo',
    origem: 'claude_mapa',
    primeiraMensagem: [
      'Oi, Daniela!',
      'Sou o Pedro Barbarotti, aqui da região. Vi os doces e o cardápio da Doce Encanto Confeitaria no Instagram, o visual dos produtos é incrível.',
      'Tô com uma condição especial de 6 fotos de produto com IA para os 5 primeiros negócios da região (entrega em 48h).',
      'Se fizer sentido pra vocês, preparo uma amostra rápida sem compromisso.',
      'Se não fizer sentido agora, é só me avisar que não mando mais nada!',
    ].join('\n'),
    notas: 'Prioridade 1: preparar amostra visual antes da DM no Instagram.',
  },
  {
    nome: 'Bulls Artesanal Burger',
    bairro: 'Lagoa da Conceição',
    cidade: 'Florianópolis',
    estado: 'SC',
    horario: 'Ter-Dom 18h-23h30',
    lat: -27.6042,
    lng: -48.4674,
    nicho: 'Hamburgueria Artesanal',
    nomeSocio: 'Marcos Vinicius',
    porte: 'ME',
    dataAbertura: '10/08/2021',
    cnpj: '38.921.405/0001-82',
    situacaoCnpj: 'Ativa',
    prioridade: 1,
    motivoPrioridade: 'Hambúrgueres com visual artesanal forte, pouca atualização de fotos recentes no iFood.',
    instagram: 'bullsburgers.lagoa',
    whatsapp: '48998882233',
    siteUrl: 'https://ifood.com.br/delivery/florianopolis-sc/bulls-burger',
    etapa: 'chamado',
    origem: 'claude_mapa',
    primeiraMensagem: [
      'Oi, Marcos!',
      'Sou o Pedro Barbarotti, aqui da região. Vi as fotos e os pratos da Bulls Artesanal Burger, o cardápio de vocês dá água na boca.',
      'Tô com uma condição especial de 6 fotos de produto com IA para os 5 primeiros negócios da região (entrega em 48h).',
      'Se fizer sentido pra vocês, preparo uma amostra rápida sem compromisso.',
      'Se não fizer sentido agora, é só me avisar que não mando mais nada!',
    ].join('\n'),
    notas: 'Primeiro contato enviado por DM no Instagram. Aguardando retorno.',
  },
  {
    nome: 'Corte Nobre Barbearia',
    bairro: 'Itacorubi',
    cidade: 'Florianópolis',
    estado: 'SC',
    horario: 'Seg-Sáb 09h-20h',
    lat: -27.5855,
    lng: -48.5088,
    nicho: 'Barbearia & Estilo Masculino',
    nomeSocio: 'Lucas Ferreira',
    porte: 'MEI',
    dataAbertura: '05/01/2024',
    cnpj: '51.340.892/0001-19',
    situacaoCnpj: 'Ativa',
    prioridade: 1,
    motivoPrioridade: 'Aberto há menos de 1 ano, dono na operação diária, precisa reforçar presença de marca.',
    instagram: 'nobrecortebarbearia',
    whatsapp: '48996541122',
    siteUrl: 'https://instagram.com/nobrecortebarbearia',
    etapa: 'respondeu',
    origem: 'claude_mapa',
    primeiraMensagem: [
      'Oi, Lucas!',
      'Sou o Pedro Barbarotti, aqui da região. Vi o espaço e o estilo de atendimento da Corte Nobre Barbearia, visual muito forte.',
      'Tô com uma condição especial de 6 fotos de produto com IA para os 5 primeiros negócios da região (entrega em 48h).',
      'Se fizer sentido pra vocês, preparo uma amostra rápida sem compromisso.',
      'Se não fizer sentido agora, é só me avisar que não mando mais nada!',
    ].join('\n'),
    notas: 'Respondeu na DM elogiando a amostra! Quer entender formato de vídeo.',
  },
  {
    nome: 'Boutique Linho & Mar',
    bairro: 'Santa Mônica',
    cidade: 'Florianópolis',
    estado: 'SC',
    horario: 'Seg-Sáb 10h-19h',
    lat: -27.5912,
    lng: -48.5135,
    nicho: 'Moda Feminina Autoral',
    nomeSocio: 'Renata Bastos',
    porte: 'ME',
    dataAbertura: '22/09/2022',
    cnpj: '42.710.334/0001-50',
    situacaoCnpj: 'Ativa',
    prioridade: 1,
    motivoPrioridade: 'Coleção própria, fotos de peças em cabide que ficariam espetaculares com modelos IA.',
    instagram: 'linhoemarboutique',
    whatsapp: '48997773344',
    siteUrl: 'https://linhoemar.com.br',
    etapa: 'proposta',
    origem: 'claude_mapa',
    primeiraMensagem: [
      'Oi, Renata!',
      'Sou o Pedro Barbarotti, aqui da região. Vi a coleção e as peças da Boutique Linho & Mar no perfil de vocês, curti muito a curadoria.',
      'Tô com uma condição especial de 6 fotos de produto com IA para os 5 primeiros negócios da região (entrega em 48h).',
      'Se fizer sentido pra vocês, preparo uma amostra rápida sem compromisso.',
      'Se não fizer sentido agora, é só me avisar que não mando mais nada!',
    ].join('\n'),
    notas: 'Enviada proposta para 12 imagens IA de coleção.',
  },
  {
    nome: 'Empório & Café Campeche',
    bairro: 'Campeche',
    cidade: 'Florianópolis',
    estado: 'SC',
    horario: 'Ter-Dom 08h-20h',
    lat: -27.6833,
    lng: -48.4892,
    nicho: 'Cafés Especiais & Brunch',
    nomeSocio: 'Felipe Santos',
    porte: 'ME',
    dataAbertura: '19/11/2020',
    cnpj: '35.602.119/0001-71',
    situacaoCnpj: 'Ativa',
    prioridade: 2,
    motivoPrioridade: 'Negócio consolidado com equipe maior, bom ticket, fotos já profissionais.',
    instagram: 'emporiocafe.campeche',
    whatsapp: '48993335566',
    siteUrl: 'https://instagram.com/emporiocafe.campeche',
    etapa: 'novo',
    origem: 'claude_mapa',
    primeiraMensagem: [
      'Oi, Felipe!',
      'Sou o Pedro Barbarotti, aqui da região. Vi os cafés e os pratos do Empório & Café Campeche, espaço de muito bom gosto.',
      'Tô com uma condição especial de 6 fotos de produto com IA para os 5 primeiros negócios da região (entrega em 48h).',
      'Se fizer sentido pra vocês, preparo uma amostra rápida sem compromisso.',
      'Se não fizer sentido agora, é só me avisar que não mando mais nada!',
    ].join('\n'),
    notas: 'Bom encaixe para pacote de mídias de café especial.',
  },
  {
    nome: 'Gelateria & Sorvetes da Ilha',
    bairro: 'Coqueiros',
    cidade: 'Florianópolis',
    estado: 'SC',
    horario: 'Seg-Dom 12h-22h',
    lat: -27.6089,
    lng: -48.5714,
    nicho: 'Gelateria Artesanal',
    nomeSocio: 'Camila Zanin',
    porte: 'MEI',
    dataAbertura: '10/12/2023',
    cnpj: '49.882.301/0001-92',
    situacaoCnpj: 'Ativa',
    prioridade: 1,
    motivoPrioridade: 'Gelato artesanal super fotogênico, aberto há menos de 1 ano, foco em Instagram.',
    instagram: 'gelatodailha.floripa',
    whatsapp: '48994448899',
    siteUrl: 'https://instagram.com/gelatodailha.floripa',
    etapa: 'fechado',
    origem: 'claude_mapa',
    primeiraMensagem: [
      'Oi, Camila!',
      'Sou o Pedro Barbarotti, aqui da região. Vi os sorvetes artesanais da Gelateria & Sorvetes da Ilha, o visual é incrível.',
      'Tô com uma condição especial de 6 fotos de produto com IA para os 5 primeiros negócios da região (entrega em 48h).',
      'Se fizer sentido pra vocês, preparo uma amostra rápida sem compromisso.',
      'Se não fizer sentido agora, é só me avisar que não mando mais nada!',
    ].join('\n'),
    notas: 'Cliente fechado! Pacote de 6 fotos entregue e aprovado com sinal no PIX.',
  },
];

async function main() {
  console.log('[seed-leads] Verificando tabela Lead...');
  const count = await prisma.lead.count();

  // Limpar dados anteriores de teste se existirem para evitar duplicatas
  if (count > 0) {
    console.log(`[seed-leads] Encontrados ${count} leads existentes. Atualizando e garantindo integridade...`);
  }

  for (const leadData of SEED_LEADS) {
    const existing = await prisma.lead.findFirst({
      where: {
        OR: [
          { cnpj: leadData.cnpj },
          { nome: leadData.nome },
        ],
      },
    });

    if (existing) {
      console.log(`[seed-leads] Atualizando lead existente: ${leadData.nome}`);
      await prisma.lead.update({
        where: { id: existing.id },
        data: leadData,
      });
    } else {
      console.log(`[seed-leads] Criando novo lead validado: ${leadData.nome}`);
      await prisma.lead.create({ data: leadData });
    }
  }

  console.log(`✓ ${SEED_LEADS.length} leads validados sincronizados com sucesso sem duplicatas!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
