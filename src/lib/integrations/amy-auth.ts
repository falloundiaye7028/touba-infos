import { createHash, timingSafeEqual } from "node:crypto";

/** Longueur minimale d'un secret d'intégration accepté. */
export const MIN_SECRET_LENGTH = 32;

/** Compare les empreintes SHA-256 : temps constant, longueur non révélée. */
function safeEqual(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

/**
 * Vérifie un header `Authorization: Bearer <secret>` contre un secret donné.
 * Comparaison à temps constant. Un secret absent ou trop court refuse tout.
 */
export function verifyBearer(
  authorizationHeader: string | null,
  secret: string | undefined,
  minLength = 1,
): boolean {
  if (!secret || secret.length < minLength) return false;

  const match = /^bearer\s+(.+)$/i.exec((authorizationHeader ?? "").trim());
  if (!match) return false;

  const token = match[1].trim();
  if (!token) return false;

  return safeEqual(token, secret);
}

/**
 * Vérifie le header `Authorization: Bearer <secret>` du point d'entrée AMY.
 * Le secret est lu depuis `TOUBA_INFOS_INTEGRATION_SECRET` et jamais stocké
 * dans le code.
 */
export function verifyIntegrationToken(
  authorizationHeader: string | null,
): boolean {
  return verifyBearer(
    authorizationHeader,
    process.env.TOUBA_INFOS_INTEGRATION_SECRET,
  );
}

/**
 * Vérifie le jeton du connecteur MCP Claude (`TOUBA_INFOS_MCP_SECRET`).
 * Secret distinct de celui d'AMY et du mot de passe admin, d'au moins
 * 32 caractères : un jeton MCP n'ouvre aucune autre porte du site.
 */
export function verifyMcpToken(authorizationHeader: string | null): boolean {
  return verifyBearer(
    authorizationHeader,
    process.env.TOUBA_INFOS_MCP_SECRET,
    MIN_SECRET_LENGTH,
  );
}

export function isMcpConfigured(): boolean {
  return (process.env.TOUBA_INFOS_MCP_SECRET ?? "").length >= MIN_SECRET_LENGTH;
}
