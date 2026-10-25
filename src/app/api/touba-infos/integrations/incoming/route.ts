import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { sanitizeArticleHtml, textLength } from "@/lib/integrations/content";
import { createIntegrationDraft } from "@/lib/integrations/draft-service";
import { verifyIntegrationToken } from "@/lib/integrations/amy-auth";
import { rateLimit } from "@/lib/rateLimit";
import { amyIncomingSchema } from "@/lib/validation/amy-incoming";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_BODY_CHARS = 250_000;

// Ce point d'entrée ne fait qu'UNE chose : créer un brouillon.
// Aucune méthode GET/PUT/PATCH/DELETE n'est exportée ; Next.js répond 405.
export async function POST(request: Request): Promise<Response> {
  const requestId = randomUUID();

  if (!verifyIntegrationToken(request.headers.get("authorization"))) {
    return NextResponse.json(
      { ok: false, error: "Non autorisé." },
      { status: 401 },
    );
  }

  if (!rateLimit("amy-incoming", RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS).allowed) {
    return NextResponse.json(
      { ok: false, error: "Limite de débit atteinte (100 req/h)." },
      { status: 429 },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) {
    return NextResponse.json(
      { ok: false, error: "Payload trop volumineux." },
      { status: 413 },
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
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
  const contenuHtml = sanitizeArticleHtml(input.body);
  if (textLength(contenuHtml) === 0) {
    return NextResponse.json(
      { ok: false, error: "Contenu vide après nettoyage." },
      { status: 400 },
    );
  }

  const { article, duplicate } = await createIntegrationDraft({
    origin: "amy-ia-solutions",
    titre: input.title,
    contenuHtml,
    categorie: input.categorie,
    extrait: input.meta?.description,
    tags: input.meta?.keywords,
    imageUrl: input.imageUrl,
    sourceUrl: input.sourceUrl,
    socialPosts: input.socialPosts,
    requestId,
  });

  console.info("[amy-incoming] brouillon", {
    requestId,
    articleId: article.id,
    duplicate,
  });

  return NextResponse.json(
    {
      ok: true,
      articleId: article.id,
      draftUrl: `/admin/articles/${article.id}`,
      duplicate,
    },
    { status: duplicate ? 200 : 201 },
  );
}
