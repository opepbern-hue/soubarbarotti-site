// scripts/validate-admin.ts
// Automação de validação, auto-correção (self-healing) e testes ponta a ponta do Admin e Banco de Dados.
// Uso: npm run validate:admin

import fs from 'node:fs';
import path from 'node:path';
import { loadEnv } from './load-env';

loadEnv();

import { prisma } from '../src/lib/db';
import { SECTIONS } from '../prisma/seed';

const DEFAULT_PLANS = [
  { name: 'Filme Único', description: 'Um comercial ou vídeo conceito de alta intensidade visual.', price: 'Sob consulta', onRequest: true },
  { name: 'Campanha Completa', description: 'Pacote de criativos e formatos adaptados para múltiplas plataformas.', price: 'Sob consulta', onRequest: true },
  { name: 'Direção Contínua', description: 'Acompanhamento mensal para marcas que produzem conteúdo constante.', price: 'Sob consulta', onRequest: true },
];

type CheckResult = { name: string; ok: boolean; detail: string };
const results: CheckResult[] = [];

function record(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} ${name}: ${detail}`);
}

async function run() {
  console.log('==============================================================');
  console.log('🔍 INICIANDO AUDITORIA E AUTOMAÇÃO DE BUGS DO PAINEL ADMIN');
  console.log('==============================================================\n');

  // 1. Conexão com o Banco de Dados
  try {
    await prisma.$queryRaw`SELECT 1`;
    record('Conexão PostgreSQL/Supabase', true, 'Conectado e respondendo normalmente');
  } catch (err) {
    record('Conexão PostgreSQL/Supabase', false, String(err));
    process.exit(1);
  }

  // 2. Auto-correção de "REC:" no banco de dados (Seções e Configurações)
  const sections = await prisma.section.findMany();
  let fixedRecs = 0;
  for (const s of sections) {
    if (/^●?\s*REC:\s*/i.test(s.label)) {
      const cleanLabel = s.label.replace(/^●?\s*REC:\s*/i, '').trim();
      await prisma.section.update({ where: { key: s.key }, data: { label: cleanLabel } });
      fixedRecs++;
    }
  }
  // Garantir que todas as 12 seções existam no banco sem prefixo REC
  for (const def of SECTIONS) {
    const exists = sections.some((s) => s.key === def.key);
    if (!exists) {
      await prisma.section.create({
        data: {
          key: def.key,
          enabled: true,
          label: def.label.replace(/^●?\s*REC:\s*/i, ''),
          titleLine1: def.titleLine1,
          titleLine2: def.titleLine2,
          intro: def.intro,
        },
      });
    }
  }
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (settings && /^●?\s*REC:\s*/i.test(settings.heroLocation)) {
    await prisma.siteSettings.update({
      where: { id: 1 },
      data: { heroLocation: settings.heroLocation.replace(/^●?\s*REC:\s*/i, '').trim() },
    });
    fixedRecs++;
  }
  record(
    'Remoção de selos REC no banco',
    true,
    fixedRecs > 0 ? `${fixedRecs} registro(s) com 'REC:' limpos automaticamente no banco` : 'Nenhum registro com REC restante no banco',
  );

  // 3. Auto-correção de Planos com [PREENCHER] no banco
  const dbPlans = await prisma.plan.findMany({ orderBy: { order: 'asc' } });
  let fixedPlans = 0;
  for (let i = 0; i < dbPlans.length; i++) {
    const p = dbPlans[i];
    if (p.name.includes('[PREENCHER') || p.description.includes('[PREENCHER') || p.price.includes('[PREENCHER')) {
      const fallback = DEFAULT_PLANS[i] ?? DEFAULT_PLANS[0];
      await prisma.plan.update({
        where: { id: p.id },
        data: {
          name: fallback.name,
          description: fallback.description,
          price: fallback.price,
          onRequest: fallback.onRequest,
        },
      });
      fixedPlans++;
    }
  }
  record(
    'Limpeza de placeholders [PREENCHER] em Planos',
    true,
    fixedPlans > 0 ? `${fixedPlans} plano(s) atualizados com textos padrão limpos` : 'Planos sem [PREENCHER] pendente',
  );

  // 4. Verificação de Rotas Admin (Todas as páginas referenciadas existem em disco)
  const requiredPages = [
    'src/app/admin/login/page.tsx',
    'src/app/admin/(painel)/page.tsx',
    'src/app/admin/(painel)/portfolio/page.tsx',
    'src/app/admin/(painel)/portfolio/[id]/page.tsx',
    'src/app/admin/(painel)/midias/page.tsx',
    'src/app/admin/(painel)/fotos/page.tsx',
    'src/app/admin/(painel)/artes/page.tsx',
    'src/app/admin/(painel)/site/page.tsx',
    'src/app/admin/(painel)/secoes/page.tsx',
    'src/app/admin/(painel)/processo/page.tsx',
    'src/app/admin/(painel)/marcas/page.tsx',
    'src/app/admin/(painel)/perguntas/page.tsx',
    'src/app/admin/(painel)/depoimentos/page.tsx',
    'src/app/admin/(painel)/planos/page.tsx',
    'src/app/admin/(painel)/leads/page.tsx',
    'src/app/admin/(painel)/mensagens/page.tsx',
    'src/app/admin/(painel)/ideias/page.tsx',
    'src/app/admin/(painel)/seguranca/page.tsx',
  ];
  const missingPages = requiredPages.filter((p) => !fs.existsSync(path.resolve(p)));
  record(
    'Rotas de páginas do Admin',
    missingPages.length === 0,
    missingPages.length === 0
      ? `Todas as ${requiredPages.length} páginas do Admin existem e estão conectadas`
      : `Faltando: ${missingPages.join(', ')}`,
  );

  // 5. Verificação de Rotas de API do Admin
  const requiredApis = [
    'src/app/api/admin/uploads/route.ts',
    'src/app/api/admin/uploads/[id]/route.ts',
    'src/app/api/admin/uploads/[id]/complete/route.ts',
    'src/app/api/admin/media/route.ts',
    'src/app/api/admin/media/[id]/route.ts',
    'src/app/api/admin/cnpj/[cnpj]/route.ts',
  ];
  const missingApis = requiredApis.filter((p) => !fs.existsSync(path.resolve(p)));
  record(
    'Rotas de API do Admin (Uploads, Mídia, CNPJ)',
    missingApis.length === 0,
    missingApis.length === 0 ? `Todas as ${requiredApis.length} rotas de API presentes` : `Faltando: ${missingApis.join(', ')}`,
  );

  // 6. Teste E2E de Exclusão Permanente (Garante que excluir um item o apaga para sempre e não ressuscita)
  // 6.1 Projeto
  const tempProj = await prisma.project.create({
    data: {
      title: '__TEST_DELETE_PROJECT__',
      slug: `test-delete-${Date.now()}`,
      published: true,
      credits: { create: [{ stage: 'Teste', role: 'Dir', tools: 'IA', order: 0 }] },
    },
  });
  await prisma.project.delete({ where: { id: tempProj.id } });
  const checkProj = await prisma.project.findUnique({ where: { id: tempProj.id } });
  const checkCredits = await prisma.projectCredit.count({ where: { projectId: tempProj.id } });
  record(
    'Exclusão permanente: Projeto + Créditos (Cascade)',
    checkProj === null && checkCredits === 0,
    'Projeto criado e excluído sem deixar resíduos no banco',
  );

  // 6.2 Marca, FAQ, Plano, Depoimento, Lead, Mensagem, Mídia
  const tempBrand = await prisma.brand.create({ data: { name: '__TEST_BRAND__' } });
  await prisma.brand.delete({ where: { id: tempBrand.id } });
  const checkBrand = await prisma.brand.findUnique({ where: { id: tempBrand.id } });

  const tempFaq = await prisma.faq.create({ data: { question: '__TEST_FAQ__', answer: 'Resp' } });
  await prisma.faq.delete({ where: { id: tempFaq.id } });
  const checkFaq = await prisma.faq.findUnique({ where: { id: tempFaq.id } });

  const tempPlan = await prisma.plan.create({ data: { name: '__TEST_PLAN__' } });
  await prisma.plan.delete({ where: { id: tempPlan.id } });
  const checkPlan = await prisma.plan.findUnique({ where: { id: tempPlan.id } });

  const tempTesti = await prisma.testimonial.create({ data: { quote: 'Teste', authorName: 'Autor' } });
  await prisma.testimonial.delete({ where: { id: tempTesti.id } });
  const checkTesti = await prisma.testimonial.findUnique({ where: { id: tempTesti.id } });

  const tempLead = await prisma.lead.create({ data: { nome: '__TEST_LEAD__' } });
  await prisma.lead.delete({ where: { id: tempLead.id } });
  const checkLead = await prisma.lead.findUnique({ where: { id: tempLead.id } });

  const tempMsg = await prisma.contactMessage.create({ data: { name: 'Teste', email: 'a@b.com', message: 'Oi' } });
  await prisma.contactMessage.delete({ where: { id: tempMsg.id } });
  const checkMsg = await prisma.contactMessage.findUnique({ where: { id: tempMsg.id } });

  const tempMedia = await prisma.media.create({
    data: { kind: 'IMAGE', status: 'READY', originalName: '__test__.jpg' },
  });
  const tempPhoto = await prisma.photo.create({ data: { mediaId: tempMedia.id, collection: 'FOTO' } });
  // Ao apagar a Media, Photo vinculada deve apagar em Cascade e não travar
  await prisma.media.delete({ where: { id: tempMedia.id } });
  const checkMedia = await prisma.media.findUnique({ where: { id: tempMedia.id } });
  const checkPhoto = await prisma.photo.findUnique({ where: { id: tempPhoto.id } });

  const allDeleted =
    !checkBrand && !checkFaq && !checkPlan && !checkTesti && !checkLead && !checkMsg && !checkMedia && !checkPhoto;
  record(
    'Exclusão permanente: Marca, FAQ, Plano, Depoimento, Lead, Mensagem, Foto e Mídia',
    allDeleted,
    'Todos os modelos excluem permanentemente no banco (com Cascade/SetNull funcionando)',
  );

  // 7. Verificar que nenhum componente do site/admin contém "REC:" visível
  const filesToScan = [
    'src/components/site/Hud.tsx',
    'src/components/site/Hero.tsx',
    'src/components/site/WorksSection.tsx',
    'src/components/site/WorkCard.tsx',
    'src/components/site/PortfolioGrid.tsx',
    'src/components/site/GalleryPage.tsx',
    'src/app/(site)/portfolio/page.tsx',
    'src/app/(site)/portfolio/[slug]/page.tsx',
    'src/app/admin/login/page.tsx',
    'src/lib/content.ts',
  ];
  const filesWithRec: string[] = [];
  for (const rel of filesToScan) {
    const content = fs.readFileSync(path.resolve(rel), 'utf8');
    // Ignora regex de limpeza `.replace(/^●?\s*REC:\s*/i, '')`
    const lines = content.split('\n').filter((l) => !l.includes('.replace(') && !l.trim().startsWith('//'));
    if (lines.some((l) => /REC:|● REC|<span className="rec-dot/.test(l))) {
      filesWithRec.push(rel);
    }
  }
  record(
    'Verificação de ausência de "REC" na interface',
    filesWithRec.length === 0,
    filesWithRec.length === 0 ? 'Nenhum selo ou ponto REC encontrado nos componentes' : `Encontrado em: ${filesWithRec.join(', ')}`,
  );

  console.log('\n==============================================================');
  const failed = results.filter((r) => !r.ok);
  if (failed.length === 0) {
    console.log(`🎉 TUDO VALIDADO COM SUCESSO! (${results.length}/${results.length} testes passaram)`);
  } else {
    console.error(`⚠️ ${failed.length} verificação(ões) falharam.`);
    process.exitCode = 1;
  }
  console.log('==============================================================');
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error('Erro fatal na validação:', err);
  process.exit(1);
});
