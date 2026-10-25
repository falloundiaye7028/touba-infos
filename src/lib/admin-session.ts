// ============================================================================
//  TOUBA INFOS — Mot de passe et session de l'espace rédaction (logique pure)
//
//  • Plus de mot de passe par défaut en production : sans TI_ADMIN_PASSWORD,
//    la connexion est désactivée. Le mot de passe « touba-infos » n'existe
//    plus qu'en développement local (NODE_ENV ≠ production).
//  • Le cookie ne contient plus le mot de passe : il porte un jeton signé
//    (HMAC-SHA256) avec date d'émission et d'expiration. Le voler ne révèle
//    pas le mot de passe, et le jeton expire seul.
//  • La clé de signature combine le mot de passe ET TI_SESSION_SECRET (s'il
//    existe), via scrypt : changer l'un OU l'autre invalide toutes les
//    sessions, et un cookie volé ne permet pas de tester rapidement des mots
//    de passe hors ligne.
//  • En production, les mots de passe par défaut connus (« change-me »,
//    « touba-infos »…) sont refusés comme s'ils n'étaient pas définis.
//  • Comparaisons à temps constant.
// ============================================================================

import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

type Env = Record<string, string | undefined>;

/** Mot de passe de développement local uniquement. */
export const DEV_FALLBACK_PASSWORD = "touba-infos";
/** Durée d'une session (identique à l'ancien cookie : 8 h). */
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const TOKEN_VERSION = "v1";
const CLOCK_SKEW_MS = 60 * 1000;

/** Valeurs d'exemple ou par défaut, jamais acceptées en production. */
const KNOWN_DEFAULT_PASSWORDS = new Set([
  "change-me",
  "changeme",
  "touba-infos",
  "toubainfos",
  "password",
  "admin",
  "motdepasse",
]);

/** Longueur recommandée ; en dessous, un avertissement est journalisé. */
export const RECOMMENDED_PASSWORD_LENGTH = 12;

/** Paramètres scrypt (≈ 16 Mo, quelques dizaines de ms, clé mise en cache). */
const SCRYPT = { N: 2 ** 14, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;

function isProduction(env: Env): boolean {
  return env.NODE_ENV === "production";
}

/**
 * Mot de passe attendu, ou null si la connexion doit être refusée
 * (production sans TI_ADMIN_PASSWORD, ou avec une valeur par défaut connue).
 */
export function resolveAdminPassword(env: Env = process.env): string | null {
  const configured = env.TI_ADMIN_PASSWORD;
  if (configured && configured.length > 0) {
    if (
      isProduction(env) &&
      KNOWN_DEFAULT_PASSWORDS.has(configured.trim().toLowerCase())
    ) {
      return null;
    }
    return configured;
  }
  return isProduction(env) ? null : DEV_FALLBACK_PASSWORD;
}

/** Vrai si le mot de passe est plus court que la longueur recommandée. */
export function isWeakPassword(password: string): boolean {
  return password.length < RECOMMENDED_PASSWORD_LENGTH;
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

let cachedKey: { id: string; key: Buffer } | null = null;

/**
 * Clé de signature des sessions : scrypt(mot de passe, sel = libellé +
 * TI_SESSION_SECRET). Null si la connexion est désactivée. La dérivation,
 * volontairement lente, n'est faite qu'une fois par instance (cache).
 */
export function sessionKey(env: Env = process.env): Buffer | null {
  const password = resolveAdminPassword(env);
  if (!password) return null;
  const salt = `touba-infos/admin-session/v1|${env.TI_SESSION_SECRET ?? ""}`;

  const id = createHash("sha256")
    .update(salt, "utf8")
    .update("\0")
    .update(password, "utf8")
    .digest("hex");
  if (cachedKey?.id === id) return cachedKey.key;

  const key = scryptSync(password, salt, 32, SCRYPT);
  cachedKey = { id, key };
  return key;
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
