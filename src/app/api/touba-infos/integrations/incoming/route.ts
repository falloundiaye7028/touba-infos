import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { verifyIntegrationToken } from "@/lib/integrations/amy-auth";
import { adminCreate } from "@/lib/touba-infos-store";
import { amyIncomingSchema } from "@/lib/validation/amy-incoming";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const IMAGE_DOWNLOAD_TIMEOUT_MS = 10_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_HOSTS = ["seneweb.com", "lesoleil.sn"];

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const rateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

function isAllowedImageHost(imageUrl: string): boolean {
  try {
    const host = new URL(imageUrl).hostname.toLowerCase();
    return ALLOWED_IMAGE_HOSTS.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`),
    );
  } catch {
    return false;
  }
}

function imageExtensionFromContentType(contentType: string): string {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  return "jpg";
}

async function downloadAndStoreImage(
  imageUrl: string,
): Promise<string | null> {
  if (!isAllowedImageHost(imageUrl)) return null;

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    IMAGE_DOWNLOAD_TIMEOUT_MS,
  );

  try {
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { Accept: "image/*" },
    });

    if (!response.ok) return null;

    const contentType = (response.headers.get("content-type") ?? "")
      .toLowerCase()
      .split(";")[0]
      .trim();
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) return null;

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
      return null;
    }

    const blob = await response.blob();
    if (blob.size > MAX_IMAGE_BYTES) return null;

    if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

    const extension = imageExtensionFromContentType(contentType);
    const stored = await put(
      `touba-infos/articles/rss-${Date.now()}.${extension}`,
      blob,
      { access: "public", addRandomSuffix: true, contentType },
    );

    return stored.url;
  } catch (error) {
    console.warn("[amy-incoming] image non stockée", {
      imageUrl,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!verifyIntegrationToken(request.headers.get("authorization"))) {
    return NextResponse.json(
      { ok: false, error: "Non autorisé." },
      { status: 401 },
    );
  }

  if (!checkRateLimit("amy-incoming")) {
    return NextResponse.json(
      { ok: false, error: "Limite de débit atteinte (100 req/h)." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload JSON invalide." },
      { status: 400 },
    );
  }

  const parsed = amyIncomingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Payload invalide." },
      { status: 400 },
    );
  }

  const input = parsed.data;

  const storedImageUrl = input.imageUrl
    ? await downloadAndStoreImage(input.imageUrl)
    : null;

  const article = await adminCreate({
    titre: input.title,
    categorie: input.categorie,
    auteur: "Rédaction Touba Infos",
    extrait: input.meta?.description ?? "",
    tags: input.meta?.keywords ?? [],
    imageUrl: storedImageUrl ?? input.imageUrl,
    contenu: input.body,
    statut: "brouillon",
    metadata: {
      sourceUrl: input.sourceUrl ?? null,
      socialPosts: input.socialPosts ?? null,
      generatedBy: "amy-ia-solutions",
    },
  });

  console.info("[amy-incoming] brouillon créé", {
    articleId: article.id,
    sourceUrl: input.sourceUrl ?? null,
  });

  return NextResponse.json(
    {
      ok: true,
      articleId: article.id,
      draftUrl: `/admin/articles/${article.id}`,
    },
    { status: 201 },
  );
}
