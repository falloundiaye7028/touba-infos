// ============================================================================
//  TOUBA INFOS — Mot de passe et session de l'espace rédaction (logique pure)
//
//  • Plus de mot de passe par défaut en production : sans TI_ADMIN_PASSWORD,
//    la connexion est désactivée. Le mot de passe « touba-infos » n'existe
//    plus qu'en développement local (NODE_ENV ≠ production).
//  • Le cookie ne contient plus le mot de passe : il porte un jeton signé
//    (HMAC-SHA256) avec date d'émission et d'expiration. Le voler ne révèle
//    pas le mot de passe, et le jeton expire seul.
//  • Changer TI_ADMIN_PASSWORD (ou TI_SESSION_SECRET) invalide toutes les
//    sessions ouvertes.
//  • Comparaisons à temps constant.
// ============================================================================

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

type Env = Record<string, string | undefined>;

/** Mot de passe de développement local uniquement. */
export const DEV_FALLBACK_PASSWORD = "touba-infos";
/** Durée d'une session (identique à l'ancien cookie : 8 h). */
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const TOKEN_VERSION = "v1";
const CLOCK_SKEW_MS = 60 * 1000;

function isProduction(env: Env): boolean {
  return env.NODE_ENV === "production";
}

/**
 * Mot de passe attendu, ou null si la connexion doit être refusée
 * (production sans TI_ADMIN_PASSWORD).
 */
export function resolveAdminPassword(env: Env = process.env): string | null {
  const configured = env.TI_ADMIN_PASSWORD;
  if (configured && configured.length > 0) return configured;
  return isProduction(env) ? null : DEV_FALLBACK_PASSWORD;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Compare deux chaînes à temps constant (longueur non révélée). */
export function safeEqualStrings(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

export function verifyAdminPassword(
  candidate: string,
  expected: string | null,
): boolean {
  if (!expected) return false;
  return safeEqualStrings(candidate, expected);
}

/**
 * Clé de signature des sessions, dérivée de TI_SESSION_SECRET s'il existe,
 * sinon du mot de passe. Null si la connexion est désactivée.
 */
export function sessionKey(env: Env = process.env): Buffer | null {
  const password = resolveAdminPassword(env);
  if (!password) return null;
  const base =
    env.TI_SESSION_SECRET && env.TI_SESSION_SECRET.length > 0
      ? `secret:${env.TI_SESSION_SECRET}`
      : `password:${password}`;
  return createHmac("sha256", "touba-infos/admin-session/v1")
    .update(base, "utf8")
    .digest();
}

function sign(payload: string, key: Buffer): string {
  return createHmac("sha256", key).update(payload, "utf8").digest("base64url");
}

/** Crée un jeton : v1.<émis>.<expire>.<aléa>.<signature> */
export function createSessionToken(
  key: Buffer,
  now: number = Date.now(),
  ttlMs: number = SESSION_TTL_MS,
): string {
  const nonce = randomBytes(16).toString("base64url");
  const payload = `${TOKEN_VERSION}.${now}.${now + ttlMs}.${nonce}`;
  return `${payload}.${sign(payload, key)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
  key: Buffer | null,
  now: number = Date.now(),
): boolean {
  if (!token || !key || token.length > 512) return false;

  const parts = token.split(".");
  if (parts.length !== 5) return false;
  const [version, issuedRaw, expiresRaw, nonce, signature] = parts;
  if (version !== TOKEN_VERSION || !nonce || !signature) return false;
  if (!/^\d{1,16}$/.test(issuedRaw) || !/^\d{1,16}$/.test(expiresRaw))
    return false;

  const expected = sign(`${version}.${issuedRaw}.${expiresRaw}.${nonce}`, key);
  if (!safeEqualStrings(signature, expected)) return false;

  const issued = Number(issuedRaw);
  const expires = Number(expiresRaw);
  return (
    issued <= now + CLOCK_SKEW_MS &&
    expires > now &&
    expires - issued <= SESSION_TTL_MS
  );
}

export function sessionCookieOptions(env: Env = process.env) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction(env),
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
