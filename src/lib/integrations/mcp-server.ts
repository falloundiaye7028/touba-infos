// ============================================================================
//  TOUBA INFOS — Serveur MCP « Rédaction » pour Claude
//  Trois outils, et uniquement trois :
//    • creer_brouillon   → crée un BROUILLON (jamais publié) ;
//    • lister_brouillons → lecture seule ;
//    • lire_article      → lecture seule (brouillons et articles publiés).
//  Aucun outil ne publie, ne modifie ni ne supprime : ce module n'importe
//  aucune fonction d'écriture du store hormis la création via
//  draft-service, qui force le statut « brouillon ».
// ============================================================================

import { z } from "zod";

import type { ArticleInfo } from "@/lib/touba-infos";
import { adminListAll } from "@/lib/touba-infos-store";
import { rateLimit } from "@/lib/rateLimit";

import { INTEGRATION_CATEGORIES, INTEGRATION_GENRES } from "./categories";
import { plainTextToHtml, textLength } from "./content";
import {
  VERIFICATION_STATUSES,
  createIntegrationDraft,
  summarizeArticle,
} from "./draft-service";

export const MCP_SERVER_INFO = {
  name: "touba-infos-redaction",
  title: "Touba Infos — Rédaction",
  version: "1.0.0",
} as const;

export const SUPPORTED_PROTOCOL_VERSIONS = [
  "2025-11-25",
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
] as const;

export const TOOL_NAMES = [
  "creer_brouillon",
  "lister_brouillons",
  "lire_article",
] as const;
type ToolName = (typeof TOOL_NAMES)[number];

/** Créations autorisées par heure (par instance serveur). */
export const CREATE_LIMIT_PER_HOUR = 30;
const HOUR_MS = 60 * 60 * 1000;
const MAX_CONTENT_RETURNED = 20_000;
const READABLE_STATUSES = new Set(["brouillon", "publie"]);

const SERVER_INSTRUCTIONS =
  "Connecteur de la rédaction de Touba Infos. Il permet seulement de créer " +
  "des brouillons, de lister les brouillons et de lire un article. Aucun " +
  "outil ne publie : chaque brouillon doit être relu et publié par la " +
  "rédaction dans /admin. Ne jamais inventer de fait, de chiffre ou de " +
  "citation ; indiquer le statut de vérification et les sources.";

// ── Validation des arguments ────────────────────────────────────────────────
const httpsUrl = z
  .string()
  .trim()
  .url()
  .max(2_000)
  .refine((v) => v.startsWith("https://"), "URL https:// requise.");

const createDraftArgs = z
  .object({
    titre: z.string().trim().min(5).max(200),
    contenu: z.string().trim().min(30).max(50_000),
    categorie: z.enum(INTEGRATION_CATEGORIES),
    statut_verification: z.enum(VERIFICATION_STATUSES),
    genre: z.enum(INTEGRATION_GENRES).optional(),
    sous_titre: z.string().trim().max(300).optional(),
    extrait: z.string().trim().max(500).optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
    sources: z
      .array(
        z
          .object({
            titre: z.string().trim().max(200).optional(),
            url: httpsUrl,
          })
          .strict(),
      )
      .max(10)
      .optional(),
    image_url: httpsUrl.optional(),
    credit_photo: z.string().trim().max(200).optional(),
    legende: z.string().trim().max(300).optional(),
    texte_facebook: z.string().trim().max(3_000).optional(),
    texte_partage_profil: z.string().trim().max(1_500).optional(),
    texte_whatsapp: z.string().trim().max(3_000).optional(),
    cle_idempotence: z
      .string()
      .trim()
      .min(8)
      .max(100)
      .regex(/^[A-Za-z0-9._:-]+$/)
      .optional(),
  })
  .strict();

const listDraftsArgs = z
  .object({
    origine: z.enum(["claude", "toutes"]).default("claude"),
    limite: z.number().int().min(1).max(50).default(20),
  })
  .strict();

const readArticleArgs = z
  .object({
    id: z.string().trim().min(1).max(40).regex(/^[A-Za-z0-9_-]+$/).optional(),
    slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  })
  .strict()
  .refine((v) => Boolean(v.id) !== Boolean(v.slug), {
    message: "Indiquer soit « id », soit « slug » (un seul des deux).",
  });

// ── Description des outils (JSON Schema exposé au client) ───────────────────
const TOOLS = [
  {
    name: "creer_brouillon",
    title: "Créer un brouillon d'article",
    description:
      "Crée un BROUILLON d'article sur toubainfos.com. Le brouillon n'est " +
      "jamais publié : la rédaction le relit et le publie dans /admin. " +
      "Contenu en texte simple : paragraphes séparés par une ligne vide, " +
      "« ## » pour un intertitre, « - » pour une liste, **gras**. Le HTML " +
      "est échappé. Une image n'est retenue que si elle est déjà stockée " +
      "chez Touba Infos ; sinon elle est seulement suggérée à la rédaction.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["titre", "contenu", "categorie", "statut_verification"],
      properties: {
        titre: { type: "string", minLength: 5, maxLength: 200 },
        contenu: { type: "string", minLength: 30, maxLength: 50_000 },
        categorie: { type: "string", enum: [...INTEGRATION_CATEGORIES] },
        statut_verification: { type: "string", enum: [...VERIFICATION_STATUSES] },
        genre: { type: "string", enum: [...INTEGRATION_GENRES] },
        sous_titre: { type: "string", maxLength: 300 },
        extrait: { type: "string", maxLength: 500 },
        tags: {
          type: "array",
          maxItems: 10,
          items: { type: "string", minLength: 1, maxLength: 40 },
        },
        sources: {
          type: "array",
          maxItems: 10,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["url"],
            properties: {
              titre: { type: "string", maxLength: 200 },
              url: { type: "string", format: "uri", maxLength: 2_000 },
            },
          },
        },
        image_url: { type: "string", format: "uri", maxLength: 2_000 },
        credit_photo: { type: "string", maxLength: 200 },
        legende: { type: "string", maxLength: 300 },
        texte_facebook: { type: "string", maxLength: 3_000 },
        texte_partage_profil: { type: "string", maxLength: 1_500 },
        texte_whatsapp: { type: "string", maxLength: 3_000 },
        cle_idempotence: {
          type: "string",
          minLength: 8,
          maxLength: 100,
          pattern: "^[A-Za-z0-9._:-]+$",
          description:
            "Identifiant unique de la demande : une seconde demande avec la même clé renvoie le brouillon existant.",
        },
      },
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "lister_brouillons",
    title: "Lister les brouillons",
    description:
      "Liste les brouillons en attente de validation, les plus récents d'abord. " +
      "Par défaut, seulement ceux préparés par Claude.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        origine: { type: "string", enum: ["claude", "toutes"], default: "claude" },
        limite: { type: "integer", minimum: 1, maximum: 50, default: 20 },
      },
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "lire_article",
    title: "Lire un article",
    description:
      "Lit un brouillon ou un article publié, par « id » ou par « slug ».",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string", maxLength: 40 },
        slug: { type: "string", maxLength: 120 },
      },
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
] as const;

// ── JSON-RPC ────────────────────────────────────────────────────────────────
export type JsonRpcId = string | number;

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: JsonRpcId | null;
  result?: unknown;
  error?: { code: number; message: string };
}

export const RPC_ERRORS = {
  parse: -32700,
  invalidRequest: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  internal: -32603,
} as const;

function ok(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

export function rpcError(
  id: JsonRpcId | null,
  code: number,
  message: string,
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function toolText(payload: unknown, isError = false) {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    isError,
  };
}

function zodMessage(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "arguments"} : ${issue.message}`)
    .join(" ; ");
}

export interface McpContext {
  requestId: string;
  now?: Date;
}

export interface McpLogEntry {
  method: string;
  tool?: ToolName;
  articleId?: string;
  duplicate?: boolean;
  outcome: "ok" | "refused" | "error";
}

// ── Outils ──────────────────────────────────────────────────────────────────
async function callCreateDraft(args: unknown, ctx: McpContext, log: McpLogEntry) {
  const parsed = createDraftArgs.safeParse(args ?? {});
  if (!parsed.success) {
    log.outcome = "refused";
    return toolText({ erreur: zodMessage(parsed.error) }, true);
  }
  if (!rateLimit("mcp:creer_brouillon", CREATE_LIMIT_PER_HOUR, HOUR_MS).allowed) {
    log.outcome = "refused";
    return toolText(
      { erreur: `Limite atteinte : ${CREATE_LIMIT_PER_HOUR} brouillons par heure.` },
      true,
    );
  }

  const a = parsed.data;
  const contenuHtml = plainTextToHtml(a.contenu);
  if (textLength(contenuHtml) < 30) {
    log.outcome = "refused";
    return toolText({ erreur: "Contenu trop court après nettoyage." }, true);
  }

  const { article, duplicate } = await createIntegrationDraft(
    {
      origin: "claude-mcp",
      titre: a.titre,
      contenuHtml,
      categorie: a.categorie,
      genre: a.genre,
      sousTitre: a.sous_titre,
      extrait: a.extrait,
      tags: a.tags,
      imageUrl: a.image_url,
      credit: a.credit_photo,
      legende: a.legende,
      sourceUrl: a.sources?.[0]?.url,
      sources: a.sources,
      verificationStatus: a.statut_verification,
      idempotencyKey: a.cle_idempotence,
      requestId: ctx.requestId,
      socialPosts: {
        facebook: a.texte_facebook,
        profil: a.texte_partage_profil,
        whatsapp: a.texte_whatsapp,
      },
    },
    ctx.now,
  );

  log.articleId = article.id;
  log.duplicate = duplicate;
  const imageRetenue = Boolean(article.imageUrl);

  return toolText({
    ...summarizeArticle(article),
    doublon: duplicate,
    message: duplicate
      ? "Un brouillon existe déjà pour cette demande : aucun nouvel article créé."
      : "Brouillon créé. Il n'est PAS publié : validation requise dans /admin.",
    image:
      a.image_url && !duplicate
        ? imageRetenue
          ? "Image retenue (stockage Touba Infos)."
          : "Image NON retenue : adresse externe, conservée en suggestion pour la rédaction."
        : undefined,
  });
}

async function callListDrafts(args: unknown, log: McpLogEntry) {
  const parsed = listDraftsArgs.safeParse(args ?? {});
  if (!parsed.success) {
    log.outcome = "refused";
    return toolText({ erreur: zodMessage(parsed.error) }, true);
  }
  const { origine, limite } = parsed.data;
  const drafts = (await adminListAll())
    .filter((a) => (a.statut ?? "publie") === "brouillon")
    .filter((a) => origine === "toutes" || a.metadata?.generatedBy === "claude-mcp")
    .slice(0, limite)
    .map(summarizeArticle);

  return toolText({ total: drafts.length, brouillons: drafts });
}

function readableArticle(a: ArticleInfo) {
  const meta = a.metadata ?? {};
  const contenu =
    a.contenu.length > MAX_CONTENT_RETURNED
      ? `${a.contenu.slice(0, MAX_CONTENT_RETURNED)}…`
      : a.contenu;
  return {
    ...summarizeArticle(a),
    sousTitre: a.sousTitre,
    extrait: a.extrait,
    tags: a.tags,
    imageUrl: a.imageUrl ?? null,
    contenuHtml: contenu,
    sources: meta.sources ?? null,
    textesReseaux: meta.socialPosts ?? null,
    imageSuggeree: meta.imageSuggestion ?? null,
  };
}

async function callReadArticle(args: unknown, log: McpLogEntry) {
  const parsed = readArticleArgs.safeParse(args ?? {});
  if (!parsed.success) {
    log.outcome = "refused";
    return toolText({ erreur: zodMessage(parsed.error) }, true);
  }
  const { id, slug } = parsed.data;
  const article = (await adminListAll()).find((a) =>
    id ? a.id === id : a.slug === slug,
  );
  if (!article || !READABLE_STATUSES.has(article.statut ?? "publie")) {
    log.outcome = "refused";
    return toolText({ erreur: "Article introuvable ou non consultable." }, true);
  }
  log.articleId = article.id;
  return toolText(readableArticle(article));
}

// ── Point d'entrée ──────────────────────────────────────────────────────────
function negotiateVersion(requested: unknown): string {
  if (
    typeof requested === "string" &&
    (SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(requested)
  ) {
    return requested;
  }
  return SUPPORTED_PROTOCOL_VERSIONS[0];
}

function isToolName(value: unknown): value is ToolName {
  return typeof value === "string" && (TOOL_NAMES as readonly string[]).includes(value);
}

/**
 * Traite un message JSON-RPC unique.
 * Retourne null pour une notification (pas de réponse attendue).
 */
export async function handleMcpMessage(
  message: unknown,
  ctx: McpContext,
  log: McpLogEntry = { method: "?", outcome: "ok" },
): Promise<JsonRpcResponse | null> {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    log.outcome = "refused";
    return rpcError(null, RPC_ERRORS.invalidRequest, "Requête JSON-RPC invalide.");
  }
  const msg = message as Record<string, unknown>;
  const method = typeof msg.method === "string" ? msg.method : "";
  log.method = method || "?";

  const hasId = typeof msg.id === "string" || typeof msg.id === "number";
  if (msg.jsonrpc !== "2.0" || !method) {
    log.outcome = "refused";
    return rpcError(
      hasId ? (msg.id as JsonRpcId) : null,
      RPC_ERRORS.invalidRequest,
      "Requête JSON-RPC invalide.",
    );
  }
  if (!hasId) return null; // notification (ex. notifications/initialized)
  const id = msg.id as JsonRpcId;
  const params = (msg.params ?? {}) as Record<string, unknown>;

  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: negotiateVersion(params.protocolVersion),
        capabilities: { tools: { listChanged: false } },
        serverInfo: MCP_SERVER_INFO,
        instructions: SERVER_INSTRUCTIONS,
      });
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const name = params.name;
      if (!isToolName(name)) {
        log.outcome = "refused";
        return rpcError(id, RPC_ERRORS.invalidParams, "Outil inconnu.");
      }
      log.tool = name;
      try {
        if (name === "creer_brouillon") {
          return ok(id, await callCreateDraft(params.arguments, ctx, log));
        }
        if (name === "lister_brouillons") {
          return ok(id, await callListDrafts(params.arguments, log));
        }
        return ok(id, await callReadArticle(params.arguments, log));
      } catch {
        log.outcome = "error";
        return ok(id, toolText({ erreur: "Erreur interne. Aucune donnée n'a été publiée." }, true));
      }
    }
    default:
      log.outcome = "refused";
      return rpcError(id, RPC_ERRORS.methodNotFound, "Méthode non prise en charge.");
  }
}

/** Liste des outils exposés (pour les tests et l'audit des permissions). */
export function exposedTools(): readonly { name: string }[] {
  return TOOLS;
}
