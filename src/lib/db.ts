import { PrismaClient } from '@prisma/client';

// O endereço do banco vem só da variável DATABASE_URL (Dokploy em produção, .env no computador).
// Nunca escreva o endereço com senha aqui: o repositório é público.
function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  const placeholder =
    !url || url.includes('@host') || url.includes('host:5432') || url.includes('nomedobanco') || url.includes('usuario:senha');
  if (placeholder) {
    console.error('[db] DATABASE_URL não configurado. Defina a variável no Dokploy (produção) ou no .env (local).');
    return undefined;
  }
  return url;
}

const activeUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: activeUrl ? { db: { url: activeUrl } } : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

