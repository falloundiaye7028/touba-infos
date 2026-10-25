// ============================================================================
//  TOUBA INFOS — Création de brouillons par les intégrations
//  POINT DE PASSAGE UNIQUE pour tout article créé par une machine
//  (AMY IA via /integrations/incoming, Claude via le connecteur MCP).
//
//  Garanties imposées ici, côté serveur, quel que soit l'appelant :
//   • statut toujours « brouillon » — aucune entrée ne peut le changer ;
//   • jamais « à la une », « breaking » ni « épinglé » ;
//   • seule opération autorisée sur le store : la CRÉATION (aucune mise à
//     jour, publication ni suppression n'est importée dans ce module) ;
//   • traçabilité de l'origine dans metadata ;
//   • protection contre les doublons (clé de contenu + clé d'idempotence).
//  La variable TI_AGENT_AUTOPUBLISH n'est PAS lue ici : aucune configuration
//  ne peut transformer un brouillon d'intégration en article publié.
// ============================================================================

import { createHash } from "node:crypto";

import type { ArticleInfo, CategorieInfo, GenreInfo } from "@/lib/touba-infos";
import { adminCreate, adminListAll } from "@/lib/touba-infos-store";

import { resolveIntegrationImage } from "./images";

export type DraftOrigin = "amy-ia-solutions" | "claude-mcp";

export const VERIFICATION_STATUSES = [
  "CONFIRMÉ",
  "DÉCLARATION ATTRIBUÉE",
  "À VÉRIFIER",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export interface DraftSource {
  titre?: string;
  url: string;
}

export interface DraftRequest {
  origin: DraftOrigin;
  titre: string;
  /** HTML DÉJÀ nettoyé (voir content.ts). */
  contenuHtml: string;
  categorie: CategorieInfo;
  genre?: GenreInfo;
  sousTitre?: string;
  extrait?: string;
  tags?: string[];
  imageUrl?: string;
  credit?: string;
  legende?: string;
  sourceUrl?: string;
  sources?: DraftSource[];
  socialPosts?: Record<string, string | undefined>;
  verificationStatus?: VerificationStatus;
  idempotencyKey?: string;
  requestId?: string;
}

export interface DraftResult {
  article: ArticleInfo;
  duplicate: boolean;
}

/** Fenêtre pendant laquelle un même titre en brouillon est un doublon. */
export const DUPLICATE_TITLE_WINDOW_MS = 72 * 60 * 60 * 1000;

export const INTEGRATION_AUTHOR = "Rédaction Touba Infos";

export function normalizeTitle(titre: string): string {
  return titre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function computeDedupeKey(titre: string, sourceUrl?: string): string {
  return createHash("sha256")
    .update(
      `${normalizeTitle(titre)}|${(sourceUrl ?? "").trim().toLowerCase()}`,
    )
    .digest("hex");
}

function metaString(a: ArticleInfo, key: string): string | undefined {
  const value = a.metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Recherche un brouillon déjà créé pour la même demande.
 * Ne considère QUE les brouillons créés par la même intégration : un article
 * publié, programmé ou écrit par la rédaction n'est jamais renvoyé.
 */
export function findDuplicate(
  existing: ArticleInfo[],
  request: Pick<
    DraftRequest,
    "origin" | "titre" | "sourceUrl" | "idempotencyKey"
  >,
  now: Date,
): ArticleInfo | undefined {
  const dedupeKey = computeDedupeKey(request.titre, request.sourceUrl);
  const title = normalizeTitle(request.titre);
  const source = request.sourceUrl?.trim().toLowerCase();

  return existing.find((a) => {
    const sameOriginDraft =
      (a.statut ?? "publie") === "brouillon" &&
      metaString(a, "generatedBy") === request.origin;
    if (!sameOriginDraft) return false;

    if (
      request.idempotencyKey &&
      metaString(a, "idempotencyKey") === request.idempotencyKey
    ) {
      return true;
    }
    if (metaString(a, "dedupeKey") === dedupeKey) return true;

    // Même titre sous 72 h, sauf si les deux demandes citent des sources
    // différentes (ex. deux communiqués distincts au titre générique).
    const otherSource = metaString(a, "sourceUrl")?.trim().toLowerCase();
    if (source && otherSource && source !== otherSource) return false;

    const age = now.getTime() - new Date(a.date).getTime();
    return (
      age >= 0 &&
      age <= DUPLICATE_TITLE_WINDOW_MS &&
      normalizeTitle(a.titre) === title
    );
  });
}

/**
 * Champ texte affiché hors du corps de l'article (titre, chapô, tags,
 * légende, crédit) : retire les chevrons pour qu'aucun de ces champs ne
 * puisse contenir de balise, quel que soit l'endroit où il est rendu.
 */
export function plainField(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

export class DraftInvariantError extends Error {}

export async function createIntegrationDraft(
  request: DraftRequest,
  now: Date = new Date(),
): Promise<DraftResult> {
  if (!plainField(request.titre)) {
    throw new DraftInvariantError("Titre vide après nettoyage.");
  }
  const existing = await adminListAll();
  const duplicate = findDuplicate(existing, request, now);
  if (duplicate) return { article: duplicate, duplicate: true };

  const image = resolveIntegrationImage(request.imageUrl);
  const socialPosts = request.socialPosts
    ? Object.fromEntries(
        Object.entries(request.socialPosts).filter(
          ([, value]) => typeof value === "string" && value.trim() !== "",
        ),
      )
    : undefined;

  const article = await adminCreate({
    titre: plainField(request.titre) ?? "",
    sousTitre: plainField(request.sousTitre) ?? "",
    extrait: plainField(request.extrait) ?? "",
    categorie: request.categorie,
    genre: request.genre ?? "Actualité",
    auteur: INTEGRATION_AUTHOR,
    contenu: request.contenuHtml,
    tags: (request.tags ?? [])
      .map((tag) => plainField(tag) ?? "")
      .filter(Boolean),
    imageUrl: image.imageUrl,
    credit: image.imageUrl ? plainField(request.credit) : undefined,
    legende: image.imageUrl ? plainField(request.legende) : undefined,
    date: now.toISOString(),
    // ── Invariants : jamais modifiables par l'appelant ──
    statut: "brouillon",
    alaUne: false,
    breaking: false,
    epingle: false,
    vues: 0,
    metadata: {
      generatedBy: request.origin,
      createdVia:
        request.origin === "claude-mcp" ? "mcp" : "integrations/incoming",
      reviewRequired: true,
      receivedAt: now.toISOString(),
      dedupeKey: computeDedupeKey(request.titre, request.sourceUrl),
      idempotencyKey: request.idempotencyKey ?? null,
      requestId: request.requestId ?? null,
      verificationStatus: request.verificationStatus ?? null,
      sourceUrl: request.sourceUrl ?? null,
      sources: request.sources ?? null,
      socialPosts:
        socialPosts && Object.keys(socialPosts).length ? socialPosts : null,
      imageSuggestion: image.suggestion ?? null,
      imageCreditSuggestion: image.suggestion
        ? (plainField(request.credit) ?? null)
        : null,
    },
  });

  if (
    article.statut !== "brouillon" ||
    article.alaUne ||
    article.breaking ||
    article.epingle
  ) {
    // Ne devrait jamais arriver : signal fort d'une régression du store.
    throw new DraftInvariantError(
      "Le brouillon créé ne respecte pas les invariants de non-publication.",
    );
  }

  return { article, duplicate: false };
}

/** Vue publique minimale d'un article pour les intégrations. */
export function summarizeArticle(a: ArticleInfo) {
  return {
    id: a.id,
    slug: a.slug,
    titre: a.titre,
    categorie: a.categorie,
    genre: a.genre,
    statut: a.statut ?? "publie",
    date: a.date,
    origine: metaString(a, "generatedBy") ?? "rédaction",
    statutVerification: metaString(a, "verificationStatus") ?? null,
    lienAdmin: `/admin/articles/${a.id}`,
  };
}
