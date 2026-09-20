import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/**
 * Vérifie le header `Authorization: Bearer <secret>`.
 * Le secret est lu depuis `TOUBA_INFOS_INTEGRATION_SECRET` et jamais stocké
 * dans le code. Comparaison à temps constant pour éviter les attaques par
 * timing.
 */
export function verifyIntegrationToken(
  authorizationHeader: string | null,
): boolean {
  const secret = process.env.TOUBA_INFOS_INTEGRATION_SECRET;
  if (!secret) return false;

  const header = authorizationHeader ?? "";
  if (!header.startsWith("Bearer ")) return false;

  const token = header.slice("Bearer ".length).trim();
  if (!token) return false;

  return safeEqual(token, secret);
}
