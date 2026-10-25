// ============================================================================
//  TOUBA INFOS — Connecteur MCP « Rédaction » (Streamable HTTP, sans état)
//  POST /api/touba-infos/mcp  — Authorization: Bearer <TOUBA_INFOS_MCP_SECRET>
//  Outils : creer_brouillon, lister_brouillons, lire_article. Aucun outil
//  de publication, de modification ni de suppression (voir mcp-server.ts).
// ============================================================================

import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { isMcpConfigured, verifyMcpToken } from "@/lib/integrations/amy-auth";
import {
  RPC_ERRORS,
  handleMcpMessage,
  rpcError,
  type McpLogEntry,
} from "@/lib/integrations/mcp-server";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_CHARS = 200_000;
/** Appels autorisés par heure, tous outils confondus (par instance). */
const CALLS_PER_HOUR = 300;
const HOUR_MS = 60 * 60 * 1000;

const NO_STORE = { "Cache-Control": "no-store" };

function jsonError(status: number, message: string, extra?: HeadersInit) {
  return NextResponse.json(
    { error: message },
    { status, headers: { ...NO_STORE, ...extra } },
  );
}

export async function POST(request: Request): Promise<Response> {
  const requestId = randomUUID();

  if (!isMcpConfigured()) {
    return jsonError(503, "Connecteur non configuré.");
  }
  if (!verifyMcpToken(request.headers.get("authorization"))) {
    console.warn("[mcp] accès refusé", { requestId });
    return jsonError(401, "Non autorisé.");
  }
  if (!rateLimit("mcp:calls", CALLS_PER_HOUR, HOUR_MS).allowed) {
    return jsonError(429, "Trop de requêtes.", { "Retry-After": "3600" });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError(415, "Content-Type application/json requis.");
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) {
    return jsonError(413, "Requête trop volumineuse.");
  }

  let message: unknown;
  try {
    message = JSON.parse(raw);
  } catch {
    return NextResponse.json(rpcError(null, RPC_ERRORS.parse, "JSON invalide."), {
      status: 400,
      headers: NO_STORE,
    });
  }
  if (Array.isArray(message)) {
    return NextResponse.json(
      rpcError(null, RPC_ERRORS.invalidRequest, "Les lots JSON-RPC ne sont pas acceptés."),
      { status: 400, headers: NO_STORE },
    );
  }

  const log: McpLogEntry = { method: "?", outcome: "ok" };
  const response = await handleMcpMessage(message, { requestId }, log);

  // Journal : jamais d'en-têtes, de jeton ni de contenu d'article.
  console.info("[mcp]", { requestId, ...log });

  if (response === null) {
    return new Response(null, { status: 202, headers: NO_STORE });
  }
  return NextResponse.json(response, { headers: NO_STORE });
}

// Pas de flux SSE ni de session : seules les requêtes POST sont acceptées.
function methodNotAllowed() {
  return jsonError(405, "Méthode non autorisée.", { Allow: "POST" });
}

export const GET = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
