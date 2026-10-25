// ============================================================================
//  TOUBA INFOS — Images reçues des intégrations
//  Règle : seule une image déjà stockée dans le stockage Vercel Blob de
//  Touba Infos (dossier touba-infos/) peut devenir l'image d'un article.
//  Toute autre adresse (photo d'un autre média, banque d'images, autre
//  stockage Vercel…) n'est JAMAIS utilisée automatiquement : elle est
//  seulement conservée en suggestion, pour décision humaine dans /admin.
// ============================================================================

const BLOB_DOMAIN = "public.blob.vercel-storage.com";
const OWN_PATH_PREFIX = "/touba-infos/";

/**
 * Hôte public du stockage Blob de Touba Infos.
 * 1. `TI_BLOB_PUBLIC_HOST` s'il est défini (recommandé) ;
 * 2. sinon, déduit de l'identifiant de stockage contenu dans
 *    `BLOB_READ_WRITE_TOKEN` (vercel_blob_rw_<storeId>_<secret>).
 * Retourne null si aucun des deux n'est disponible : aucune image n'est
 * alors acceptée.
 */
export function ownBlobHost(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const explicit = env.TI_BLOB_PUBLIC_HOST?.trim().toLowerCase();
  if (explicit) return explicit;

  const token = env.BLOB_READ_WRITE_TOKEN ?? "";
  const match = /^vercel_blob_rw_([A-Za-z0-9]+)_/.exec(token);
  if (!match) return null;
  return `${match[1].toLowerCase()}.${BLOB_DOMAIN}`;
}

export interface ResolvedImage {
  /** Image utilisable par l'article (stockage Touba Infos uniquement). */
  imageUrl?: string;
  /** Adresse refusée, conservée pour information de la rédaction. */
  suggestion?: string;
}

export function resolveIntegrationImage(
  rawUrl: string | undefined | null,
  env: Record<string, string | undefined> = process.env,
): ResolvedImage {
  if (!rawUrl) return {};

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return {};
  }

  const host = ownBlobHost(env);
  const isOwn =
    host !== null &&
    url.protocol === "https:" &&
    url.hostname.toLowerCase() === host &&
    url.username === "" &&
    url.password === "" &&
    url.pathname.startsWith(OWN_PATH_PREFIX);

  if (isOwn) return { imageUrl: url.toString() };
  return { suggestion: url.toString() };
}
