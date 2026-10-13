import { PrismaClient } from '@prisma/client';

const LOCAL_URL = 'postgresql://postgres:postgres@localhost:5433/soubarbarotti';
const SUPABASE_DB_URL =
  'postgresql://soubarbarotti.xvabghgvrhpnyywpmodb:SouBarbarotti_DB_2026_Secure@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';

const local = new PrismaClient({ datasources: { db: { url: LOCAL_URL } } });
const supabase = new PrismaClient({ datasources: { db: { url: SUPABASE_DB_URL } } });

async function main() {
  console.log('[sync-db] Iniciando migração de todos os dados para o Supabase...');

  // 1. Mídias
  const medias = await local.media.findMany();
  console.log(`[sync-db] Migrando ${medias.length} mídias...`);
  for (const m of medias) {
    await supabase.media.upsert({ where: { id: m.id }, create: m as any, update: m as any });
  }

  // 2. Configurações gerais
  const settings = await local.siteSettings.findMany();
  console.log(`[sync-db] Migrando ${settings.length} configurações do site...`);
  for (const s of settings) {
    await supabase.siteSettings.upsert({ where: { id: s.id }, create: s as any, update: s as any });
  }

  // 3. Seções
  const sections = await local.section.findMany();
  console.log(`[sync-db] Migrando ${sections.length} seções...`);
  for (const sec of sections) {
    await supabase.section.upsert({ where: { key: sec.key }, create: sec, update: sec });
  }

  // 4. Projetos
  const projects = await local.project.findMany();
  console.log(`[sync-db] Migrando ${projects.length} projetos...`);
  for (const p of projects) {
    await supabase.project.upsert({ where: { id: p.id }, create: p, update: p });
  }

  // 5. Créditos dos projetos
  const credits = await local.projectCredit.findMany();
  console.log(`[sync-db] Migrando ${credits.length} créditos...`);
  for (const c of credits) {
    await supabase.projectCredit.upsert({ where: { id: c.id }, create: c, update: c });
  }

  // 6. Galeria dos projetos
  const gallery = await local.projectGalleryItem.findMany();
  console.log(`[sync-db] Migrando ${gallery.length} itens da galeria de projetos...`);
  for (const g of gallery) {
    await supabase.projectGalleryItem.upsert({ where: { id: g.id }, create: g, update: g });
  }

  // 7. Etapas do processo
  const steps = await local.processStep.findMany();
  console.log(`[sync-db] Migrando ${steps.length} etapas do processo...`);
  for (const st of steps) {
    await supabase.processStep.upsert({ where: { id: st.id }, create: st, update: st });
  }

  // 8. Marcas
  const brands = await local.brand.findMany();
  console.log(`[sync-db] Migrando ${brands.length} marcas...`);
  for (const b of brands) {
    await supabase.brand.upsert({ where: { id: b.id }, create: b, update: b });
  }

  // 9. Planos
  const plans = await local.plan.findMany();
  console.log(`[sync-db] Migrando ${plans.length} planos...`);
  for (const pl of plans) {
    await supabase.plan.upsert({ where: { id: pl.id }, create: pl, update: pl });
  }

  // 10. FAQs
  const faqs = await local.faq.findMany();
  console.log(`[sync-db] Migrando ${faqs.length} FAQs...`);
  for (const f of faqs) {
    await supabase.faq.upsert({ where: { id: f.id }, create: f, update: f });
  }

  // 11. Leads
  const leads = await local.lead.findMany();
  console.log(`[sync-db] Migrando ${leads.length} leads...`);
  for (const l of leads) {
    await supabase.lead.upsert({ where: { id: l.id }, create: l, update: l });
  }

  // 12. Conta Admin
  const admin = await local.adminAccount.findFirst();
  if (admin) {
    console.log('[sync-db] Migrando conta admin...');
    await supabase.adminAccount.upsert({ where: { id: admin.id }, create: admin, update: admin });
  }

  console.log('\n======================================================');
  console.log('✅ Todos os dados foram migrados para o Supabase com sucesso!');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('[sync-db] Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await local.$disconnect();
    await supabase.$disconnect();
  });
