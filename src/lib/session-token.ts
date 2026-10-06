// Cookie de sessão do admin: um JWT assinado (HS256) que carrega só o ID da sessão.
// Usado pelo proxy (checagem rápida da assinatura, sem banco) e pelo servidor (que confere a sessão no banco).
// Não importe banco nem módulos só-de-servidor aqui: o proxy roda antes de tudo.
import { SignJWT, jwtVerify } from 'jose';

/** Em produção usa o prefixo __Host-: o navegador só aceita com HTTPS, Path=/ e sem Domain. */
export const SESSION_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-sb_admin' : 'sb_admin';
/** Validade máxima de um login (depois disso, entra de novo) */
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7;
const ISSUER = 'soubarbarotti-admin';

function key(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(sid: string, secret: string): Promise<string> {
  return new SignJWT({ sid })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('admin')
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_S}s`)
    .sign(key(secret));
}

/** Confere assinatura, emissor e validade. Não confere se a sessão foi encerrada (isso é no banco). */
export async function verifySessionToken(token: string | undefined, secret: string | undefined): Promise<{ sid: string } | null> {
  if (!token || !secret || secret.length < 32) return null;
  try {
    const { payload } = await jwtVerify(token, key(secret), { algorithms: ['HS256'], issuer: ISSUER, subject: 'admin' });
    return typeof payload.sid === 'string' && payload.sid.length >= 32 ? { sid: payload.sid } : null;
  } catch {
    return null;
  }
}
