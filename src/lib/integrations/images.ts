// ============================================================================
//  TOUBA INFOS — Images reçues des intégrations
//  Règle : seule une image déjà stockée dans le stockage Vercel Blob de
//  Touba Infos (dossier touba-infos/articles/, format image) peut devenir
//  l'image d'un article. Les autres dossiers du stockage (ebooks payants…)
//  sont exclus.
//  Toute autre adresse (photo d'un autre média, banque d'images, autre
//  stockage Vercel…) n'est JAMAIS utilisée automatiquement : elle est
//  seulement conservée en suggestion, pour décision humaine dans /admin.
// ============================================================================

const BLOB_DOMAIN = "public.blob.vercel-storage.com";
const OWN_PATH_PREFIX = "/touba-infos/articles/";
const IMAGE_EXTENSION = /\.(jpe?g|png|webp|gif|avif)$/i;

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
  const path = url.pathname;
  const isOwn =
    host !== null &&
    url.protocol === "https:" &&
    url.hostname.toLowerCase() === host &&
    url.port === "" &&
    url.username === "" &&
    url.password === "" &&
    path.startsWith(OWN_PATH_PREFIX) &&
    !/%2f|%2e|%5c|\\|\/\.\.?\//i.test(path) &&
    IMAGE_EXTENSION.test(path);

  // Adresse reconstruite sans requête ni fragment.
  if (isOwn) return { imageUrl: `https://${host}${path}` };
  return { suggestion: url.toString() };
}
