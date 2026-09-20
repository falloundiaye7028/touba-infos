import { NextResponse } from "next/server";

import { verifyIntegrationToken } from "@/lib/integrations/amy-auth";
import { adminCreate } from "@/lib/touba-infos-store";
import { amyIncomingSchema } from "@/lib/validation/amy-incoming";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

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

  const article = await adminCreate({
    titre: input.title,
    categorie: input.categorie,
    auteur: "Rédaction Touba Infos",
    extrait: input.meta?.description ?? "",
    tags: input.meta?.keywords ?? [],
    imageUrl: input.imageUrl,
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
