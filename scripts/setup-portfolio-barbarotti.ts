// Setup completo do portfólio oficial de Barbarotti
// Importa os vídeos reais, remove Echo Labs / Descomplicando,
// configura o vídeo da Porsche na Hero, remove [PREENCHER] e aplica copy de alta conversão.
import fsp from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { loadEnv } from './load-env';
import { env } from '../src/lib/env';
import { processMedia } from '../src/lib/processing';

loadEnv();
const prisma = new PrismaClient();

const CLIENT_PROJECTS = [
  {
    slug: 'porsche-gt3-rs',
    title: 'Porsche GT3 RS',
    client: 'Porsche',
    category: 'Comercial Automotivo',
    file: '/tmp/check-videos/item_9.webm',
    featured: true,
    order: 0,
    mediaId: 'cmuwwgwv10000vyp501t9gm2y', // Já processado!
    location: 'Estúdio & CGI',
    deliverable: 'Filme 4K Widescreen',
    shortDescription: 'Direção cinematográfica automotiva com fumaça volumétrica, color grading dramático e motion design de alta intensidade.',
    briefTitle: 'Impacto visual absoluto e ritmo visceral',
    briefText: 'Desenvolver uma peça comercial de padrão internacional que transmita potência, elegância e precisão mecânica através de direção visual imersiva.',
    directionTitle: 'Estética de cinema com iluminação dramática',
    directionText: 'Enquadramentos em plano detalhe, transições dinâmicas e texturas de asfalto e borracha combinadas com atmosfera volumétrica.',
    productionTitle: 'Pipeline generativo e refinamento de texturas',
    productionText: 'Geração e aprimoramento de reflexos com Kling e Midjourney, upscaling 4K via Topaz Video AI e estabilização de tração.',
    finishingTitle: 'Color grade automotivo e masterização 4K',
    finishingText: 'Tratamento de cor no DaVinci Resolve para ressaltar os tons escuros e as linhas aerodinâmicas do GT3 RS.',
  },
  {
    slug: 'anderson-imoveis',
    title: 'Anderson',
    client: 'Anderson Empreendimentos',
    category: 'Imobiliário de Alto Padrão',
    file: '/tmp/check-videos/item_0.mp4',
    featured: true,
    order: 1,
    location: 'Santa Catarina',
    deliverable: 'Vídeo 9:16 para Meta Ads & Reels',
    shortDescription: 'Comercial imobiliário com inserção de mobília e acabamentos hiper-realistas por IA para alta captação de leads qualificados.',
    briefTitle: 'Vender a experiência antes da conclusão da obra',
    briefText: 'Apresentar a amplitude e o requinte da planta de 150m² antes da entrega das chaves, despertando o desejo imediato de compra.',
    directionTitle: 'Humanização e espacialidade imersiva',
    directionText: 'Apresentador no local real conectado com projeções fotorrealistas de decoração e luz natural.',
    productionTitle: 'Composição de ambientes com IA',
    productionText: 'Modelagem dos elementos decorativos com iluminação casada à cena gravada.',
    finishingTitle: 'Legendas de retenção e ritmo de conversão',
    finishingText: 'Edição ágil com cortes precisos e call-to-action direto para atendimento dos corretores.',
  },
  {
    slug: 'jessica-furst',
    title: 'Jéssica Fürst',
    client: 'Jéssica Fürst Imóveis',
    category: 'Imobiliário & Autoridade',
    file: '/tmp/check-videos/item_1.webm',
    featured: true,
    order: 2,
    location: 'Florianópolis / SC',
    deliverable: 'Vídeo Vertical 4K',
    shortDescription: 'Posicionamento audiovisual estratégico e sofisticado para corretora de imóveis de luxo.',
    briefTitle: 'Elevar a percepção de valor e exclusividade',
    briefText: 'Destacar o portfólio de imóveis premium e construir autoridade inquestionável no feed.',
    directionTitle: 'Elegância minimalista e narrativa fluida',
    directionText: 'Cores sóbrias, movimentos de câmera suaves e texto refinado.',
    productionTitle: 'Pipeline ágil com finalização no DaVinci',
    productionText: 'Tratamento de pele, correção de cor e sound design imersivo.',
    finishingTitle: 'Formato adaptado para tráfego pago',
    finishingText: 'Entrega otimizada para anúncios de alta conversão no Instagram.',
  },
  {
    slug: 'tati-boing',
    title: 'Tati Boing',
    client: 'Tatiane Boing',
    category: 'Neurociência & Saúde',
    file: '/tmp/check-videos/item_5.webm',
    featured: true,
    order: 3,
    location: 'São Paulo & Online',
    deliverable: 'Vídeo Vertical 9:16',
    shortDescription: 'Vídeo focado em alta retenção, autoridade científica e conversão para o público de fisioterapia e saúde.',
    briefTitle: 'Conectar ciência complexa com clareza magnética',
    briefText: 'Produzir conteúdo que prenda a atenção nos primeiros 3 segundos e gere autoridade imediata.',
    directionTitle: 'Dinamismo visual e ritmo de fala',
    directionText: 'Cortes nos pontos de respiração, grafismos explicativos e enquadramento direto.',
    productionTitle: 'Engenharia de retenção e legendagem dinâmica',
    productionText: 'Motion de apoio visual para ilustrar conceitos de neurociência do movimento.',
    finishingTitle: 'Mixagem vocal e color grading vibrante',
    finishingText: 'Áudio cristalino com realce de voz e cores acolhedoras.',
  },
  {
    slug: 'arthur-imoveis',
    title: 'Arthur',
    client: 'Arthur Empreendimentos',
    category: 'Imobiliário',
    file: '/tmp/check-videos/item_2.webm',
    featured: true,
    order: 4,
    location: 'Litoral Catarinense',
    deliverable: 'Vídeo 9:16',
    shortDescription: 'Apresentação comercial dinâmica conectando localização privilegiada e retorno sobre investimento.',
    briefTitle: 'Conversão acelerada de investidores',
    briefText: 'Gerar interesse de investidores para pré-lançamento imobiliário.',
    directionTitle: 'Linguagem comercial direta e profissional',
    directionText: 'Foco nos diferenciais construtivos e potencial de valorização.',
    productionTitle: 'Edição ritmada e color grade cinematográfico',
    productionText: 'Sincronização musical com cortes precisos e grafismos de metragem.',
    finishingTitle: 'Entrega multiformato para campanhas',
    finishingText: 'Versão pronta para Reels e anúncios no Meta Ads.',
  },
  {
    slug: 'edson-imoveis',
    title: 'Edson',
    client: 'Edson Imóveis',
    category: 'Imobiliário',
    file: '/tmp/check-videos/item_3.webm',
    featured: true,
    order: 5,
    location: 'Santa Catarina',
    deliverable: 'Vídeo Vertical',
    shortDescription: 'Apresentação imobiliária com narrativa focada em estilo de vida e conforto familiar.',
    briefTitle: 'Conexão emocional com compradores',
    briefText: 'Mostrar o imóvel como o cenário perfeito para a vida em família.',
    directionTitle: 'Fotografia acolhedora e ritmo calmo',
    directionText: 'Transições orgânicas e valorização da luz natural.',
    productionTitle: 'Pós-produção com DaVinci Resolve',
    productionText: 'Correção de gama, realce de contrastes e estabilização de câmera.',
    finishingTitle: 'Masterização 4K',
    finishingText: 'Nitidez extrema para visualização em telas móveis.',
  },
  {
    slug: 'miria-imoveis',
    title: 'Miria',
    client: 'Miria Negócios Imobiliários',
    category: 'Imobiliário',
    file: '/tmp/check-videos/item_7.webm',
    featured: true,
    order: 6,
    location: 'Grande Florianópolis',
    deliverable: 'Vídeo 9:16',
    shortDescription: 'Storytelling visual com foco em valorização patrimonial e sofisticação arquitetônica.',
    briefTitle: 'Destaque arquitetônico para público exigente',
    briefText: 'Atrair leads qualificados com alto poder aquisitivo.',
    directionTitle: 'Enquadramentos geométricos e elegância',
    directionText: 'Planos que valorizam o projeto e a nobreza dos materiais.',
    productionTitle: 'Ajuste fino de áudio e imagem',
    productionText: 'Tratamento sonoro espacial e coloração cinematográfica.',
    finishingTitle: 'Formatos otimizados',
    finishingText: 'Entrega com legendas dinâmicas de alta conversão.',
  },
  {
    slug: 'calebe',
    title: 'Calebe',
    client: 'Calebe',
    category: 'Marca Pessoal Internacional',
    file: '/tmp/check-videos/item_8.webm',
    featured: true,
    order: 7,
    location: 'Polinésia Francesa & Remoto',
    deliverable: 'Série de Vídeos Cinematográficos',
    shortDescription: 'Construção da marca pessoal do Calebe com produção de vídeos internacionais de alto padrão estético.',
    briefTitle: 'Construção de marca pessoal de prestígio global',
    briefText: 'Criar um ecossistema audiovisual que transmita liberdade, visão e alto nível de entrega.',
    directionTitle: 'Direção cinematográfica e narrativa autêntica',
    directionText: 'Roteiros envolventes combinados com captação remota e assets com IA.',
    productionTitle: 'Supervisão criativa integral',
    productionText: 'Do storyboard ao acabamento em 4K com look de cinema.',
    finishingTitle: 'Distribuição multiplataforma',
    finishingText: 'Consistência visual em todo o conteúdo de redes sociais.',
  },
];

async function getOrCreateMedia(p: (typeof CLIENT_PROJECTS)[0]): Promise<string> {
  if (p.mediaId) return p.mediaId;
  const existing = await prisma.media.findFirst({ where: { originalName: path.basename(p.file) } });
  if (existing && existing.status === 'READY') return existing.id;

  const stat = await fsp.stat(p.file);
  const media = await prisma.media.create({
    data: {
      kind: 'VIDEO',
      status: 'UPLOADING',
      originalName: path.basename(p.file),
      mimeType: p.file.endsWith('.mp4') ? 'video/mp4' : 'video/webm',
      sizeBytes: stat.size,
      receivedBytes: stat.size,
      alt: `${p.title} - ${p.category}`,
      previewStartSec: 0,
      previewLengthSec: 10,
    },
  });

  await fsp.mkdir(env.uploadTmpDir, { recursive: true });
  const ext = path.extname(p.file);
  const tempPath = path.join(env.uploadTmpDir, `${media.id}${ext}`);
  await fsp.copyFile(p.file, tempPath);
  await prisma.media.update({ where: { id: media.id }, data: { status: 'PENDING', tempPath } });

  const claimed = await prisma.media.update({
    where: { id: media.id },
    data: { status: 'PROCESSING', lockedAt: new Date(), attempts: 1 },
  });

  console.log(`Processando vídeo para ${p.title}...`);
  await processMedia(claimed);
  console.log(`Vídeo de ${p.title} pronto! ID: ${claimed.id}`);
  return claimed.id;
}

async function main() {
  console.log('Iniciando atualização completa do portfólio...');

  // 1. Remover projetos legados que não devem mais existir (Echo Labs, Descomplicando Varejo, Myskillzy)
  await prisma.project.deleteMany({
    where: {
      slug: { in: ['echo-labs', 'descomplicando-varejo', 'myskillzy'] },
    },
  });
  console.log('Projetos antigos (Echo Labs, Descomplicando Varejo, Myskillzy) removidos com sucesso.');

  // 2. Limpar marcas antigas
  await prisma.brand.deleteMany({});
  for (const [i, p] of CLIENT_PROJECTS.entries()) {
    await prisma.brand.create({
      data: {
        name: p.client,
        order: i,
      },
    });
  }
  console.log('Marcas / Clientes atualizados.');

  // 3. Processar mídias e atualizar / criar projetos
  let porscheMediaId = 'cmuwwgwv10000vyp501t9gm2y';
  for (const p of CLIENT_PROJECTS) {
    const mediaId = await getOrCreateMedia(p);
    if (p.slug === 'porsche-gt3-rs') porscheMediaId = mediaId;

    await prisma.project.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        client: p.client,
        category: p.category,
        location: p.location,
        deliverable: p.deliverable,
        shortDescription: p.shortDescription,
        featured: p.featured,
        published: true,
        order: p.order,
        heroMediaId: mediaId,
        fullVideoMediaId: mediaId,
        briefTitle: p.briefTitle,
        briefText: p.briefText,
        directionTitle: p.directionTitle,
        directionText: p.directionText,
        productionTitle: p.productionTitle,
        productionText: p.productionText,
        finishingTitle: p.finishingTitle,
        finishingText: p.finishingText,
      },
      update: {
        title: p.title,
        client: p.client,
        category: p.category,
        location: p.location,
        deliverable: p.deliverable,
        shortDescription: p.shortDescription,
        featured: p.featured,
        published: true,
        order: p.order,
        heroMediaId: mediaId,
        fullVideoMediaId: mediaId,
        briefTitle: p.briefTitle,
        briefText: p.briefText,
        directionTitle: p.directionTitle,
        directionText: p.directionText,
        productionTitle: p.productionTitle,
        productionText: p.productionText,
        finishingTitle: p.finishingTitle,
        finishingText: p.finishingText,
      },
    });
    console.log(`Projeto atualizado: ${p.title} (${p.client})`);
  }

  // 4. Atualizar SiteSettings com Porsche na Hero e Copy de Alta Conversão
  const bio = [
    'Sou o Barbarotti, diretor criativo audiovisual e especialista em IA generativa de Palhoça (SC).',
    'Eu uno a estética refinada do cinema tradicional à velocidade da inteligência artificial: crio comerciais, roteiros magnéticos e motion design de alto impacto visual sem a lentidão ou os custos proibitivos de uma produtora tradicional.',
    'Do roteiro e storyboard à engenharia de prompts, consistência de personagens, montagem e color grade cinematográfico no DaVinci Resolve — entrego o pipeline completo com foco obsessivo em autoridade e conversão de clientes.',
    'Se você quer colocar sua marca em outro patamar visual com vídeos que chamam atenção e vendem, eu cuido de cada detalhe.',
  ].join('\n\n');

  await prisma.siteSettings.update({
    where: { id: 1 },
    data: {
      heroMediaId: porscheMediaId,
      heroLocation: 'Palhoça, SC & Remoto',
      heroTagline: 'Direção cinematográfica e motion design com IA generativa para marcas e empreendedores que buscam alto padrão visual e conversão real.',
      heroList: [
        'Comerciais de Alto Padrão',
        'Vídeos com IA & Motion Design',
        'Audiovisual Imobiliário',
        'Posicionamento de Autoridade',
        'Copy & Funis de Conversão',
      ],
      numbersUseCounters: false,
      numbersPhrase: 'A IA gera as cenas. **Eu comando a direção, o motion design e a copy** para transformar a sua marca em um **filme que vende**.',
      numbersCounterText: 'Mais de **{{20}}+ projetos** dirigidos e entregues com padrão cinematográfico.',
      aboutName: 'Barbarotti',
      aboutRole: 'Diretor Criativo & Vídeos com IA',
      aboutTag: '[Direção & Motion Design]',
      aboutBio: bio,
      contactEmail: 'contato@soubarbarotti.com.br',
      whatsapp: '5548999924405',
      instagramUrl: 'https://www.instagram.com/soubarbarotti/',
      seoTitle: 'Barbarotti | Vídeos Cinematográficos com IA & Direção Criativa',
      seoDescription: 'Diretor audiovisual e motion designer com IA generativa. Comerciais, anúncios de alta conversão e produções cinematográficas para marcas.',
    },
  });
  console.log('SiteSettings atualizado com Porsche na Hero e Copy de Alta Conversão.');

  // 5. Atualizar FAQ sem [PREENCHER]
  const faqs = [
    {
      q: 'Quanto tempo leva do briefing à entrega final?',
      a: 'Em média de 5 a 10 dias úteis. Com o fluxo generativo ágil e direção solo de alta precisão, o prazo cai até 70% em relação a produtoras convencionais.',
    },
    {
      q: 'Preciso já ter um roteiro ou ideia pronta?',
      a: 'Não. Eu estruturo todo o conceito, copy de alta conversão, roteiro cena a cena e storyboard estratégico antes de gerar qualquer cena.',
    },
    {
      q: 'O que é gerado por inteligência artificial e o que é feito por você?',
      a: 'A IA gera as cenas, atores, ambientações ou renderizações hiper-realistas. A concepção, roteiro, direção artística, montagem, sound design e color grading cinematográfico no DaVinci Resolve são conduzidos artesanalmente por mim.',
    },
    {
      q: 'É possível manter o mesmo personagem ou o meu produto real em todas as cenas?',
      a: 'Sim. Utilizo técnicas avançadas de consistência de personagem e inserção de produtos com fidelidade de iluminação e perspectiva em todos os planos.',
    },
    {
      q: 'Posso utilizar os vídeos em campanhas de tráfego pago (Meta Ads, YouTube, TikTok)?',
      a: 'Com certeza. Os vídeos são entregues com todos os direitos de uso comercial liberados e formatados especificamente para obter a maior taxa de retenção e cliques.',
    },
    {
      q: 'Quantas rodadas de revisão estão incluídas?',
      a: 'Estão incluídas até 2 rodadas completas de ajustes finos após a apresentação da prévia.',
    },
    {
      q: 'Em quais formatos recebo os arquivos?',
      a: 'Receba em resolução 4K nos formatos ideais para cada canal: 9:16 (Reels/TikTok/Stories), 16:9 (YouTube/Site) e 1:1 (Feed).',
    },
    {
      q: 'De quem são os direitos sobre o vídeo final?',
      a: 'Seus. Concluída a entrega, a sua marca detém a propriedade integral e irrestrita do material final.',
    },
  ];

  await prisma.faq.deleteMany({});
  for (const [i, f] of faqs.entries()) {
    await prisma.faq.create({
      data: {
        order: i,
        question: f.q,
        answer: f.a,
      },
    });
  }
  console.log('FAQs atualizadas sem nenhum [PREENCHER].');

  // 6. Atualizar Etapas do Processo sem [PREENCHER]
  const steps = [
    {
      number: 1,
      title: 'Roteiro & Storyboard Estratégico',
      description: 'Planejo a narrativa, a copy de retenção e cada enquadramento antes de gerar qualquer elemento visual.',
      tools: 'Notion, Milanote, Claude & ChatGPT',
    },
    {
      number: 2,
      title: 'Consistência de Personagem & Estilo',
      description: 'Garantia do mesmo ator, iluminação coerente e identidade visual alinhada do primeiro ao último segundo.',
      tools: 'Midjourney (Omni Reference / --oref), ComfyUI',
    },
    {
      number: 3,
      title: 'Geração de Vídeo & Movimento',
      description: 'Transformação dos quadros-chave em planos com dinâmica de câmera cinematográfica e física realista.',
      tools: 'Kling, Runway Gen-4, Sora, Luma Dream Machine',
    },
    {
      number: 4,
      title: 'Upscaling 4K & Texturas',
      description: 'Elevo a resolução para 4K absoluto, restaurando microdetalhes de pele, tecido e iluminação.',
      tools: 'Topaz Video AI Studio',
    },
    {
      number: 5,
      title: 'Montagem, Sound Design & Color Grade',
      description: 'Unificação visual no DaVinci Resolve, curvas de cor personalizadas e sound design envolvente com look de cinema.',
      tools: 'DaVinci Resolve Studio, Adobe Premiere',
    },
  ];

  await prisma.processStep.deleteMany({});
  for (const s of steps) {
    await prisma.processStep.create({
      data: {
        number: s.number,
        title: s.title,
        description: s.description,
        tools: s.tools,
      },
    });
  }
  console.log('Etapas do Processo atualizadas sem nenhum [PREENCHER].');

  // 7. Desativar seção de Planos
  await prisma.section.upsert({
    where: { key: 'planos' },
    create: { key: 'planos', enabled: false, label: '', titleLine1: '', titleLine2: '', intro: '' },
    update: { enabled: false },
  });
  console.log('Seção de planos desativada.');

  console.log('Atualização concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro na atualização:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
