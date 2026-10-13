// Autenticação do admin (uma senha, várias sessões).
// Camadas: 1) proxy barra quem não tem cookie assinado válido; 2) aqui, cada página e cada ação
// confere a sessão no banco (existe, não foi encerrada, não expirou, não ficou parada demais).
import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { AdminSession } from '@prisma/client';
import { prisma } from './db';
import { env } from './env';
import { hashIp, hashPassword, verifyPassword } from './password';
import { SESSION_COOKIE, SESSION_MAX_AGE_S, signSessionToken, verifySessionToken } from './session-token';

/** Sem uso por 24 h, a sessão cai */
const IDLE_MS = 24 * 60 * 60 * 1000;
/** Atualiza o "visto por último" no máximo a cada 5 min */
const TOUCH_MS = 5 * 60 * 1000;

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

async function clientInfo() {
  const h = await headers();
  const ip =
    h.get('cf-connecting-ip') ?? h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconhecido';
  return { ipHash: hashIp(ip, env.sessionSecret), userAgent: (h.get('user-agent') ?? '').slice(0, 200) };
}

export async function clientIpHash(): Promise<string> {
  return (await clientInfo()).ipHash;
}

/** Sessão atual (uma consulta por requisição, mesmo chamada várias vezes). */
export const currentSession = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const claims = await verifySessionToken(token, env.sessionSecret);
  if (!claims) return null;
  const session = await prisma.adminSession.findUnique({ where: { id: sha256(claims.sid) } });
  const now = Date.now();
  if (!session || session.revokedAt || session.expiresAt.getTime() <= now || now - session.lastSeenAt.getTime() > IDLE_MS) {
    return null;
  }
  if (now - session.lastSeenAt.getTime() > TOUCH_MS) {
    await prisma.adminSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date(now) } }).catch(() => {});
  }
  return session;
});

export async function isLoggedIn(): Promise<boolean> {
  return !!(await currentSession());
}

/** Use no topo de toda página e de toda ação do admin. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await currentSession();
  if (!session) redirect('/admin/login');
  return session;
}

/** Para rotas de API: devolve 401 quando não há sessão válida. */
export async function adminGuard(): Promise<Response | null> {
  if (await isLoggedIn()) return null;
  return Response.json({ error: 'Sessão expirada. Entre de novo.' }, { status: 401 });
}

/** Senha trocada pelo painel vale mais que a do .env */
async function passwordHash(): Promise<string> {
  const account = await prisma.adminAccount.findUnique({ where: { id: 1 } });
  return account?.passwordHash ?? env.adminPasswordHash;
}

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(password: string): Promise<LoginResult> {
  const { ipHash, userAgent } = await clientInfo();
  const now = Date.now();
  const [ipFailures, allFailures] = await Promise.all([
    prisma.loginAttempt.count({ where: { ipHash, ok: false, createdAt: { gte: new Date(now - 15 * 60 * 1000) } } }),
    prisma.loginAttempt.count({ where: { ok: false, createdAt: { gte: new Date(now - 60 * 60 * 1000) } } }),
  ]);
  // Por aparelho: 5 erros em 15 min · No geral (ataque de vários lugares): 30 erros em 1 h
  if (ipFailures >= 5 || allFailures >= 30) {
    return { ok: false, error: 'Muitas tentativas erradas. Espere 15 minutos e tente de novo.' };
  }

  const stored = await passwordHash();
  const ok = stored ? await verifyPassword(password, stored) : false;
  await prisma.loginAttempt.create({ data: { ipHash, ok } });
  if (!ok) {
    // Atraso aleatório: deixa a tentativa em massa lenta e não revela nada pelo tempo de resposta
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 500));
    return { ok: false, error: stored ? 'Senha incorreta.' : 'Senha do admin não configurada. Rode `npm run setup`.' };
  }

  // Sessão nova a cada login (nada de reaproveitar identificador antigo)
  const sid = randomBytes(32).toString('base64url');
  await prisma.adminSession.create({
    data: { id: sha256(sid), ipHash, userAgent, expiresAt: new Date(now + SESSION_MAX_AGE_S * 1000) },
  });
  (await cookies()).set(SESSION_COOKIE, await signSessionToken(sid, env.sessionSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_S,
  });
  // Limpeza: sessões vencidas há mais de 30 dias
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date(now - 30 * 24 * 60 * 60 * 1000) } } }).catch(() => {});
  return { ok: true };
}

export async function logout(): Promise<void> {
  const session = await currentSession();
  if (session) await prisma.adminSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
  (await cookies()).delete(SESSION_COOKIE);
}

/** Derruba todos os outros aparelhos logados */
export async function revokeOtherSessions(): Promise<number> {
  const session = await requireAdmin();
  const res = await prisma.adminSession.updateMany({
    where: { id: { not: session.id }, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return res.count;
}

export async function activeSessions() {
  const current = await requireAdmin();
  const rows = await prisma.adminSession.findMany({
    where: { revokedAt: null, expiresAt: { gt: new Date() }, lastSeenAt: { gt: new Date(Date.now() - IDLE_MS) } },
    orderBy: { lastSeenAt: 'desc' },
  });
  return rows.map((r) => ({ ...r, current: r.id === current.id }));
}

export type PasswordResult = { ok: true } | { ok: false; error: string };

export async function changePassword(current: string, next: string): Promise<PasswordResult> {
  await requireAdmin();
  if (!(await verifyPassword(current, await passwordHash()))) return { ok: false, error: 'A senha atual não confere.' };
  if (next.length < 10) return { ok: false, error: 'A senha nova precisa ter pelo menos 10 caracteres.' };
  const hash = await hashPassword(next);
  await prisma.adminAccount.upsert({ where: { id: 1 }, create: { id: 1, passwordHash: hash }, update: { passwordHash: hash } });
  await revokeOtherSessions();
  return { ok: true };
}
