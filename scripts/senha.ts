// Troca (ou recupera) a senha do admin pelo terminal.
// Uso: npm run senha -- "minha nova senha"
// Grava no .env e no banco (a senha do banco vale mais) e derruba todas as sessões abertas.
// Para o site publicado: rode com o DATABASE_URL de produção, ou troque pelo painel em Segurança.
import { hashPassword } from '../src/lib/password';
import { setEnvVar } from './env-file';
import { loadEnv } from './load-env';

loadEnv();

async function main() {
  const password = process.argv.slice(2).join(' ').trim();
  if (password.length < 10) {
    console.log('Uso: npm run senha -- "sua nova senha"   (mínimo de 10 caracteres)');
    process.exit(1);
  }
  const hash = await hashPassword(password);
  setEnvVar('ADMIN_PASSWORD_HASH', hash);
  console.log('Senha gravada no .env.');

  try {
    const { prisma } = await import('../src/lib/db');
    await prisma.adminAccount.upsert({ where: { id: 1 }, create: { id: 1, passwordHash: hash }, update: { passwordHash: hash } });
    const { count } = await prisma.adminSession.updateMany({ where: { revokedAt: null }, data: { revokedAt: new Date() } });
    console.log(`Senha gravada no banco. ${count} sessão(ões) aberta(s) foram encerradas.`);
    await prisma.$disconnect();
  } catch {
    console.log('Não consegui falar com o banco agora (ligue o npm run dev e rode de novo). O .env já foi atualizado.');
  }
}

main();
