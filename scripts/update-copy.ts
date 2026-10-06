import { PrismaClient } from '@prisma/client';
import { loadEnv } from './load-env';

loadEnv();
const prisma = new PrismaClient();

async function main() {
  console.log('Atualizando o banco de dados com a nova copy de alta conversão...');

  // 1. Atualizar SiteSettings
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      heroTagline:
        'Diretor de Vídeo com IA Generativa. Há mais de 2 anos criando comerciais e filmes de alta conversão para marcas e empresas.',
      numbersPhrase:
        'Há **mais de 2 anos** criando vídeos cinematográficos com **Inteligência Artificial Generativa**. Sem set, sem câmera e sem elenco: apenas **resultado visual de alto impacto** para a sua marca.',
      numbersCounterText:
        'São **{{0}}+ vídeos gerados** no meu portfólio para **{{0}}** marcas e empreendedores.',
      aboutTag: '[Especialista em IA]',
      aboutName: 'Barbarotti',
      aboutRole: 'Diretor de Vídeo com IA Generativa',
      aboutBio: [
        'Há **mais de 2 anos** atuando exclusivamente na criação e direção de **vídeos cinematográficos com Inteligência Artificial Generativa** para marcas e empresas.',
        'Minha produção elimina os custos exorbitantes de gravação tradicional — como locação de estúdios, transporte de equipe e contratação de atores — mantendo um padrão de estética visual de cinema.',
        'Cada comercial e filme de marca é construído com foco em **alta conversão, retenção visual e posicionamento de mercado premium**.',
      ].join('\n\n'),
      footerLine1: 'a sua marca,',
      footerLine2: 'com cara de cinema.',
      entityPhrase:
        'Barbarotti é diretor especialista em vídeos cinematográficos com IA generativa para marcas e empresas, acumulando mais de 2 anos de experiência no mercado.',
      seoTitle: 'Vídeo cinematográfico com IA para marcas | soubarbarotti',
      seoDescription:
        'Mais de 2 anos criando comerciais e filmes de alta conversão com Inteligência Artificial Generativa para marcas e empresas.',
    },
    create: {
      id: 1,
      heroLocation: 'Brasil & Atendimento Global',
      heroTagline:
        'Diretor de Vídeo com IA Generativa. Há mais de 2 anos criando comerciais e filmes de alta conversão para marcas e empresas.',
      heroList: JSON.stringify(['Comerciais de Alta Conversão', 'Filmes de Marca', 'Vídeos de Produto', 'Posicionamento de Autoridade', 'Campanhas em Vídeo']),
      numbersUseCounters: false,
      numbersPhrase:
        'Há **mais de 2 anos** criando vídeos cinematográficos com **Inteligência Artificial Generativa**. Sem set, sem câmera e sem elenco: apenas **resultado visual de alto impacto** para a sua marca.',
      numbersCounterText:
        'São **{{0}}+ vídeos gerados** no meu portfólio para **{{0}}** marcas e empreendedores.',
      aboutTag: '[Especialista em IA]',
      aboutName: 'Barbarotti',
      aboutRole: 'Diretor de Vídeo com IA Generativa',
      aboutBio: [
        'Há **mais de 2 anos** atuando exclusivamente na criação e direção de **vídeos cinematográficos com Inteligência Artificial Generativa** para marcas e empresas.',
        'Minha produção elimina os custos exorbitantes de gravação tradicional — como locação de estúdios, transporte de equipe e contratação de atores — mantendo um padrão de estética visual de cinema.',
        'Cada comercial e filme de marca é construído com foco em **alta conversão, retenção visual e posicionamento de mercado premium**.',
      ].join('\n\n'),
      footerLine1: 'a sua marca,',
      footerLine2: 'com cara de cinema.',
      entityPhrase:
        'Barbarotti é diretor especialista em vídeos cinematográficos com IA generativa para marcas e empresas, acumulando mais de 2 anos de experiência no mercado.',
      seoTitle: 'Vídeo cinematográfico com IA para marcas | soubarbarotti',
      seoDescription:
        'Mais de 2 anos criando comerciais e filmes de alta conversão com Inteligência Artificial Generativa para marcas e empresas.',
    },
  });

  // 2. Atualizar Seções
  const sections = [
    { key: 'trabalhos', label: 'REC: Portfólio', titleLine1: 'filmes & comerciais', titleLine2: 'com inteligência artificial', intro: 'Produções cinematográficas de alta conversão desenvolvidas para marcas, produtos e campanhas de grande impacto.' },
    { key: 'processo', label: 'REC: Processo', titleLine1: 'do briefing', titleLine2: 'ao comercial 4K', intro: 'Engenharia visual ágil e previsível. Transformamos ideias em anúncios e filmes cinematográficos por uma fração do custo tradicional.' },
    { key: 'sobre', label: 'REC: Autoridade', titleLine1: 'direção de vídeo', titleLine2: 'com inteligência artificial', intro: 'Mais de 2 anos na vanguarda da produção audiovisual generativa.' },
    { key: 'perguntas', label: 'REC: Perguntas', titleLine1: 'dúvidas frequentes', titleLine2: 'antes de contratar', intro: 'Tudo o que você precisa saber para transformar a presença visual da sua empresa.' },
    { key: 'contato', label: 'REC: Contato', titleLine1: 'vamos criar o seu', titleLine2: 'próximo filme', intro: 'Fale direto comigo para apresentar sua necessidade e receber uma proposta sob medida.' },
  ];

  for (const s of sections) {
    await prisma.section.upsert({
      where: { key: s.key },
      update: s,
      create: s,
    });
  }

  // 3. Atualizar Etapas do Processo
  const steps = [
    { number: 1, title: 'Roteiro & Direção Estratégica', description: 'Planejamento focado em retenção de atenção, narrativa envolvente e conversão do público-alvo.', tools: 'Claude, ChatGPT, Storyboarding' },
    { number: 2, title: 'Consistência Visual & Atatores', description: 'Técnicas avançadas (LoRA/OmniRef) para manter o mesmo personagem ou produto idêntico em cada cena.', tools: 'Midjourney (v6 / --oref), Flux' },
    { number: 3, title: 'Geração & Animação IA', description: 'Imagens hiper-realistas transformadas em tomadas dinâmicas através dos melhores modelos de vídeo do mundo.', tools: 'Kling, Runway Gen-3, Sora, Luma, Veo' },
    { number: 4, title: 'Renderização & Nitidez 4K', description: 'Upscaling e aprimoramento de textura para clareza máxima em telas grandes, TV e anúncios.', tools: 'Topaz Video AI' },
    { number: 5, title: 'Color Grading & Master Cinema', description: 'Tratamento de cor profissional, montagem e edição no DaVinci Resolve para o acabamento cinematográfico impecável.', tools: 'DaVinci Resolve, Premiere Pro' },
  ];

  for (const st of steps) {
    await prisma.processStep.upsert({
      where: { number: st.number },
      update: st,
      create: st,
    });
  }

  // 4. Atualizar FAQs
  await prisma.faq.deleteMany({});
  const faqs = [
    {
      order: 0,
      question: 'Quais os benefícios de um vídeo com IA comparado à produção tradicional?',
      answer: 'Agilidade extrema e economia financeira. Um comercial com estética de cinema que exigiria semanas de gravação, equipes gigantescas e orçamento de dezenas de milhares de reais é produzido em poucos dias com qualidade 4K fotorrealista.',
    },
    {
      order: 1,
      question: 'Quanto tempo leva do briefing até a entrega do vídeo final?',
      answer: 'Dependendo da complexidade e duração, a entrega do projeto final é feita entre 3 a 7 dias úteis após a aprovação do roteiro.',
    },
    {
      order: 2,
      question: 'O vídeo fica com cara de inteligência artificial ou de cinema real?',
      answer: 'Nossa produção combina engenharia de prompt avançada com pós-produção profissional (Color Grading no DaVinci Resolve e Upscaling 4K). O resultado final é fotorrealista e indistinguível de uma produção de cinema tradicional.',
    },
    {
      order: 3,
      question: 'É possível manter o mesmo ator/personagem ou produto em todas as cenas?',
      answer: 'Sim! Utilizamos modelos avançados de consistência visual para garantir que o seu produto ou o personagem principal permaneça idêntico do primeiro ao último segundo do vídeo.',
    },
    {
      order: 4,
      question: 'Posso utilizar o vídeo para campanhas de anúncios pagos (tráfego pago)?',
      answer: 'Com certeza. Entregamos os vídeos em todos os formatos necessários (16:9 horizontal, 9:16 vertical para Reels/TikTok, 1:1 quadrado) otimizados para atrair a atenção e gerar conversão em anúncios.',
    },
  ];

  for (const f of faqs) {
    await prisma.faq.create({ data: { ...f, published: true } });
  }

  console.log('Nova copy de alta conversão aplicada com sucesso no banco de dados!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
