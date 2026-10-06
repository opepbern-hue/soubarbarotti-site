// Conteúdo inicial do site. Só cria o que ainda não existe: rodar de novo não apaga nada seu.
// Fonte: quem-e-soubarbarotti.md. Onde falta informação: [PREENCHER: …].
import { PrismaClient } from '@prisma/client';
import { loadEnv } from '../scripts/load-env';

const P = (o: string) => `[PREENCHER: ${o}]`;

export const SECTIONS = [
  { key: 'marcas', label: '', titleLine1: '', titleLine2: '', intro: '' },
  { key: 'numeros', label: '', titleLine1: '', titleLine2: '', intro: '' },
  { key: 'trabalhos', label: 'REC: Trabalhos', titleLine1: '', titleLine2: '', intro: '' },
  {
    key: 'processo',
    label: 'REC: Processo',
    titleLine1: 'do roteiro',
    titleLine2: 'ao color grade',
    intro: 'Cinco etapas, cada uma com a sua ferramenta. Nenhuma cena é gerada antes de estar planejada.',
  },
  { key: 'sobre', label: 'REC: Sobre', titleLine1: 'quem dirige', titleLine2: 'cada cena', intro: 'Uma pessoa só, do roteiro à entrega.' },
  {
    key: 'planos',
    label: 'REC: Planos',
    titleLine1: 'três formas',
    titleLine2: 'de trabalhar comigo',
    intro: 'Escolha o formato mais perto do seu projeto. Se nenhum servir, a gente monta um sob medida.',
  },
  { key: 'depoimentos', label: 'REC: Depoimentos', titleLine1: 'quem já', titleLine2: 'trabalhou comigo', intro: '' },
  {
    key: 'perguntas',
    label: 'REC: Perguntas',
    titleLine1: 'o que perguntam',
    titleLine2: 'antes de fechar',
    intro: 'As dúvidas que aparecem antes de todo projeto.',
  },
  { key: 'contato', label: 'REC: Contato', titleLine1: 'me conta', titleLine2: 'a sua ideia', intro: '' },
  { key: 'pagina_trabalhos', label: 'REC: Portfólio', titleLine1: 'os filmes', titleLine2: 'que eu dirigi', intro: '' },
  {
    key: 'pagina_fotos',
    label: 'REC: Fotos',
    titleLine1: 'as fotos',
    titleLine2: 'pode baixar',
    intro: 'Baixe em alta ou copie e cole direto onde quiser.',
  },
  {
    key: 'pagina_artes',
    label: 'REC: Artes',
    titleLine1: 'as artes',
    titleLine2: 'pode baixar',
    intro: 'Baixe em alta ou copie e cole direto onde quiser.',
  },
];

const STEPS = [
  { number: 1, title: 'Roteiro e storyboard', description: 'Planejo o vídeo inteiro antes de gerar qualquer imagem: cena por cena, plano por plano.', tools: P('ferramentas, se houver') },
  { number: 2, title: 'Consistência de personagem', description: 'O mesmo "ator" em todas as cenas, do primeiro ao último frame.', tools: 'Midjourney (Omni Reference / --oref)' },
  { number: 3, title: 'Image-to-video', description: 'Cada imagem-chave vira um clipe animado.', tools: 'Kling, Runway Gen-4, Veo, Sora, Luma' },
  { number: 4, title: 'Upscaling', description: 'Levo a resolução final para 4K.', tools: 'Topaz' },
  { number: 5, title: 'Color grade', description: 'Unifico os clipes gerados num visual só. É aqui que nasce o look de cinema.', tools: 'DaVinci Resolve, Premiere' },
];

const FAQS = [
  'Quanto tempo leva do briefing à entrega?',
  'Preciso chegar com roteiro pronto?',
  'O que é gerado por IA e o que é real no vídeo?',
  'Dá para manter o mesmo personagem (ou o meu produto) em todas as cenas?',
  'Posso usar o vídeo em anúncio pago?',
  'Quantas rodadas de ajuste estão incluídas?',
  'Em quais formatos eu recebo (16:9, 9:16, 1:1)?',
  'De quem são os direitos do vídeo final?',
];

const credits = () =>
  STEPS.map((s, i) => ({ stage: s.title, role: '', tools: P('ferramentas usadas neste projeto'), order: i }));

const blocks = {
  briefTitle: P('o que o cliente precisava, em uma frase'),
  briefText: P('o briefing: objetivo, público e onde o vídeo ia rodar'),
  directionTitle: P('a ideia central da direção'),
  directionText: P('como você traduziu o briefing em direção criativa'),
  productionTitle: P('o desafio da produção'),
  productionText: P('como foi a produção com IA: ferramentas, decisões e o que deu errado'),
  finishingTitle: P('o acabamento'),
  finishingText: P('montagem, upscaling, color grade e formatos de entrega'),
};

export async function seed(prisma: PrismaClient, log = console.log, withPlaceholders = true): Promise<void> {
  for (const s of SECTIONS) {
    await prisma.section.upsert({ where: { key: s.key }, create: s, update: {} });
  }

  const hasSettings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const firstRun = (await prisma.project.count()) === 0 && !hasSettings;

  let media: Record<string, string> = {};
  if (firstRun && withPlaceholders) {
    const { createPlaceholders } = await import('../scripts/placeholders');
    media = await createPlaceholders(prisma, log);
  }

  if (!hasSettings) {
    await prisma.siteSettings.create({
      data: {
        id: 1,
        heroMediaId: media['abertura'],
        heroLocation: 'Palhoça, SC & remoto',
        heroTagline: 'Dirijo vídeos com cara de cinema feitos com IA generativa, para marcas e empreendedores. Sem set, sem câmera, sem elenco.',
        heroList: ['Filmes de marca', 'Comerciais e anúncios', 'Vídeo imobiliário', 'Marca pessoal em vídeo', 'Conteúdo para redes'],
        numbersUseCounters: false,
        numbersPhrase: 'A IA gera as cenas. **Eu decido** o que entra, o que é refeito e como tudo vira **um filme só**.',
        numbersCounterText: `São **{{0}}+ projetos** no meu portfólio e **{{0}}** ${P('o que o segundo número mede')}.`,
        aboutMediaId: media['foto-sobre'],
        aboutTag: '[Direção]',
        aboutName: 'Barbarotti',
        aboutRole: 'Diretor de vídeo com IA',
        aboutBio: [
          'Tenho 21 anos e moro em Palhoça (SC). Dirijo vídeos com IA generativa para marcas e empreendedores.',
          'Antes de gerar qualquer imagem, eu planejo cada cena. Depois cuido do acabamento até o vídeo ter cara de cinema.',
          'Estou construindo isso do zero e mostro o processo no Instagram, erros incluídos.',
          P('como e quando você começou com vídeo e IA'),
        ].join('\n\n'),
        instagramUrl: 'https://www.instagram.com/soubarbarotti/',
        footerLine1: 'a sua ideia,',
        footerLine2: 'com cara de cinema.',
        entityPhrase:
          'Barbarotti (@soubarbarotti) é diretor de vídeo cinematográfico com IA generativa para marcas e empreendedores, baseado em Palhoça, SC.',
        seoTitle: 'Vídeo cinematográfico com IA para marcas | soubarbarotti',
        seoDescription:
          'Sou o Barbarotti, diretor de vídeo com IA em Palhoça (SC). Filmes de marca, comerciais e vídeos imobiliários sem set, câmera ou elenco.',
      },
    });
    log('[seed] configurações do site criadas');
  }

  if (firstRun) {
    const projects = [
      {
        slug: 'echo-labs',
        title: 'Echo Labs',
        category: P('categoria'),
        client: 'Echo Labs',
        shortDescription: `Produção de vídeos com IA para a Echo Labs. ${P('o projeto em uma frase')}`,
        hero: 'projeto-1',
      },
      {
        slug: 'calebe',
        title: 'Calebe',
        category: 'Marca pessoal em vídeo',
        client: 'Calebe',
        location: 'Polinésia Francesa',
        shortDescription: 'Ajudo a construir a marca pessoal do Calebe e produzo os vídeos do negócio dele, na Polinésia Francesa.',
        hero: 'projeto-2',
      },
      {
        slug: 'descomplicando-varejo',
        title: 'Descomplicando Varejo',
        category: P('categoria'),
        client: 'Descomplicando Varejo',
        shortDescription: `Startup que eu construí em dupla. ${P('o que eu fiz em vídeo')}`,
        hero: 'projeto-3',
      },
      {
        slug: 'myskillzy',
        title: 'Myskillzy',
        category: P('categoria'),
        client: 'Myskillzy',
        shortDescription: P('o que é o Myskillzy e qual foi o meu papel'),
        hero: 'projeto-4',
      },
    ];
    for (const [i, p] of projects.entries()) {
      await prisma.project.create({
        data: {
          slug: p.slug,
          title: p.title,
          category: p.category,
          client: p.client,
          deliverable: P('formato de entrega'),
          location: p.location ?? P('local'),
          shortDescription: p.shortDescription,
          featured: true,
          published: true,
          order: i,
          heroMediaId: media[p.hero],
          ...blocks,
          credits: { create: credits() },
          gallery: media['frame-1']
            ? {
                create: [
                  { mediaId: media['frame-1'], kind: 'FRAME', order: 0 },
                  { mediaId: media['frame-2'], kind: 'FRAME', order: 1 },
                  { mediaId: media['bastidor-1'], kind: 'BASTIDOR', order: 2 },
                  { mediaId: media['bastidor-2'], kind: 'BASTIDOR', order: 3 },
                ],
              }
            : undefined,
        },
      });
    }
    log('[seed] 4 trabalhos criados (Echo Labs, Calebe, Descomplicando Varejo, Myskillzy)');
  }

  if ((await prisma.processStep.count()) === 0) {
    for (const s of STEPS) {
      await prisma.processStep.create({ data: { ...s, mediaId: media[`etapa-${s.number}`] } });
    }
    log('[seed] 5 etapas do processo criadas');
  }

  if ((await prisma.plan.count()) === 0) {
    for (let i = 0; i < 3; i++) {
      await prisma.plan.create({
        data: { order: i, name: P(`nome do plano ${i + 1}`), description: P('para quem é e o que inclui'), price: P('valor ou "sob consulta"') },
      });
    }
    log('[seed] 3 planos criados');
  }

  if ((await prisma.faq.count()) === 0) {
    for (const [i, q] of FAQS.entries()) {
      await prisma.faq.create({ data: { order: i, question: q, answer: P('sua resposta') } });
    }
    log('[seed] 8 perguntas criadas (respostas em branco)');
  }

  if ((await prisma.brand.count()) === 0) {
    for (const [i, name] of ['Echo Labs', 'Calebe', 'Descomplicando Varejo', 'Myskillzy'].entries()) {
      await prisma.brand.create({ data: { name, order: i } });
    }
    log('[seed] faixa de marcas criada');
  }
}

if (process.argv[1] && /seed\.ts$/.test(process.argv[1])) {
  loadEnv();
  const prisma = new PrismaClient();
  seed(prisma)
    .then(() => console.log('[seed] pronto. Rode o worker (npm run dev) para processar as mídias provisórias.'))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
