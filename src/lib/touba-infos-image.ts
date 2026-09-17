/**
 * Les URLs Vercel Blob sont déjà des fichiers livrés par le CDN : elles ne
 * prennent pas en charge les paramètres de transformation Cloudinary.
 */
export function isVercelBlobUrl(url: string): boolean {
  try { return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com"); } catch { return false; }
}

export function editorialImageSrc(imageUrl?: string): string | undefined {
  const url = imageUrl?.trim();
  if (!url) return undefined;
  if (isVercelBlobUrl(url) || url.includes("?")) return url;
  return `${url}?auto=format&fit=crop&w=1200&q=70`;
}

/** Clamp un point focal saisi dans l'administration pour le passer à CSS. */
export function focalPosition(x?: number, y?: number): string {
  const clamp = (value: number | undefined) => Math.min(100, Math.max(0, Number.isFinite(value) ? Math.round(value as number) : 50));
  return `${clamp(x)}% ${clamp(y)}%`;
}

export const TOUBA_INFOS_IMAGE_LAYOUT = {
  card: { aspectRatio: "16 / 10", objectFit: "contain" },
  detail: { objectFit: "contain", maxHeight: "min(70vh, 720px)" },
  ebook: { aspectRatio: "3 / 4", objectFit: "contain" },
} as const;
