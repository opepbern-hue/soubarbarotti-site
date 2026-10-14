import { PrismaClient } from '@prisma/client';

export const SUPABASE_PROD_DATABASE_URL =
  'postgresql://soubarbarotti.xvabghgvrhpnyywpmodb:SouBarbarotti_DB_2026_Secure@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';

function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();

  // Se não estiver configurado, ou se for placeholder do template do Dokploy (contém "host:5432", "@host", "nomedobanco", "usuario:senha")
  if (
    !url ||
    url.includes('@host') ||
    url.includes('host:5432') ||
    url.includes('nomedobanco') ||
    url.includes('usuario:senha')
  ) {
    return SUPABASE_PROD_DATABASE_URL;
  }

  return url;
}

const activeUrl = resolveDatabaseUrl();
if (activeUrl && activeUrl !== process.env.DATABASE_URL) {
  process.env.DATABASE_URL = activeUrl;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: activeUrl ? { db: { url: activeUrl } } : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

