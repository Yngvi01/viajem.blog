/**
 * Utilitários de autenticação para a área admin.
 * Usa apenas o módulo `crypto` nativo do Node — sem dependências externas.
 */

import { createHmac, timingSafeEqual, randomBytes } from "crypto";

const SESSION_SECRET =
  import.meta.env.SESSION_SECRET ?? "dev-secret-inseguro-troque-em-producao";
const ADMIN_USERNAME = import.meta.env.ADMIN_USERNAME ?? "";
const ADMIN_PASSWORD_HASH = import.meta.env.ADMIN_PASSWORD_HASH ?? "";

/** Duração da sessão: 8 horas */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// ─── Verificação de senha ────────────────────────────────────────────────────

/**
 * Compara a senha em texto simples com o hash bcrypt armazenado no .env.
 * Como o ambiente serverless não tem bcrypt nativo facilmente disponível,
 * usamos uma comparação HMAC-SHA256 para simplicidade e segurança adequada.
 *
 * Para usar bcrypt real: instale `bcryptjs` e substitua esta função.
 */
export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) return false;

  const usernameMatch = username === ADMIN_USERNAME;

  // Gera HMAC da senha informada com o SESSION_SECRET como chave
  const inputHash = createHmac("sha256", SESSION_SECRET)
    .update(password)
    .digest("hex");
  const storedHash = ADMIN_PASSWORD_HASH;

  // Comparação segura contra timing attacks
  try {
    const inputBuf = Buffer.from(inputHash, "hex");
    const storedBuf = Buffer.from(storedHash, "hex");
    const passwordMatch =
      inputBuf.length === storedBuf.length &&
      timingSafeEqual(inputBuf, storedBuf);
    return usernameMatch && passwordMatch;
  } catch {
    return false;
  }
}

// ─── Token de sessão ─────────────────────────────────────────────────────────

/** Cria um token de sessão assinado com HMAC: `payload.signature` */
export function createSessionToken(): string {
  const payload = JSON.stringify({
    sub: "admin",
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
    jti: randomBytes(16).toString("hex"),
  });

  const encoded = Buffer.from(payload).toString("base64url");
  const sig = createHmac("sha256", SESSION_SECRET)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

/** Valida o token de sessão. Retorna true se válido e não expirado. */
export function validateSessionToken(token: string): boolean {
  if (!token) return false;

  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return false;

    // Verifica assinatura
    const expectedSig = createHmac("sha256", SESSION_SECRET)
      .update(encoded)
      .digest("base64url");
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (
      sigBuf.length !== expectedBuf.length ||
      !timingSafeEqual(sigBuf, expectedBuf)
    )
      return false;

    // Verifica expiração
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf-8"),
    );
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

/** Lê e valida o cookie de sessão de uma Request. */
export function isAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = parseCookie(cookieHeader, "admin_session");
  return validateSessionToken(token);
}

/** Monta o header Set-Cookie para criar a sessão. */
export function buildSessionCookie(token: string): string {
  return `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`;
}

/** Monta o header Set-Cookie para destruir a sessão. */
export function buildLogoutCookie(): string {
  return `admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseCookie(cookieHeader: string, name: string): string {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

/**
 * Utilitário para gerar o hash HMAC-SHA256 de uma senha.
 * Use no terminal para gerar o valor de ADMIN_PASSWORD_HASH:
 *   node -e "const {createHmac}=require('crypto'); console.log(createHmac('sha256','SEU_SESSION_SECRET').update('SUA_SENHA').digest('hex'))"
 */
export function hashPassword(password: string, secret: string): string {
  return createHmac("sha256", secret).update(password).digest("hex");
}
