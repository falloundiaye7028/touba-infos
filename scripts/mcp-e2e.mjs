#!/usr/bin/env node
// ============================================================================
//  Test de bout en bout du connecteur MCP avec le CLIENT OFFICIEL du SDK MCP
//  (@modelcontextprotocol/sdk, transport Streamable HTTP), contre un serveur
//  Next.js réellement démarré (`next start`).
//
//  Usage : MCP_E2E_URL=http://127.0.0.1:3100 MCP_E2E_TOKEN=<secret> \
//          node scripts/mcp-e2e.mjs
//  Code de sortie ≠ 0 si une vérification échoue.
// ============================================================================

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const BASE = process.env.MCP_E2E_URL ?? "http://127.0.0.1:3100";
const TOKEN = process.env.MCP_E2E_TOKEN;
const ENDPOINT = new URL("/api/touba-infos/mcp", BASE);

if (!TOKEN) {
  console.error("MCP_E2E_TOKEN manquant.");
  process.exit(2);
}

let failures = 0;
function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    failures += 1;
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function parse(result) {
  const text = result?.content?.[0]?.text;
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
}

async function connect(token) {
  const client = new Client({ name: "touba-infos-e2e", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(ENDPOINT, {
    requestInit: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  });
  await client.connect(transport);
  return client;
}

async function expectConnectFailure(label, token) {
  try {
    const client = await connect(token);
    await client.close();
    check(label, false, "connexion acceptée");
  } catch (error) {
    const message = String(error?.message ?? error);
    check(
      label,
      error?.code === 401 || /Non autorisé/.test(message),
      `code ${error?.code} — ${message}`,
    );
  }
}

console.log(`Serveur testé : ${ENDPOINT}`);

// ── 1. Authentification ────────────────────────────────────────────────────
console.log("\n1. Authentification");
await expectConnectFailure("refus sans jeton (401)", null);
await expectConnectFailure("refus avec un mauvais jeton (401)", "x".repeat(64));

const getRes = await fetch(ENDPOINT);
check(
  "GET refusé (405, pas de flux SSE)",
  getRes.status === 405,
  `statut ${getRes.status}`,
);

const foreign = await fetch(ENDPOINT, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${TOKEN}`,
    origin: "https://site-malveillant.example",
  },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }),
});
check(
  "origine navigateur étrangère refusée (403)",
  foreign.status === 403,
  `statut ${foreign.status}`,
);

// ── 2. Initialisation et outils ────────────────────────────────────────────
console.log("\n2. Initialisation et liste des outils");
const client = await connect(TOKEN);
const server = client.getServerVersion();
check(
  "initialisation réussie",
  server?.name === "touba-infos-redaction",
  JSON.stringify(server),
);
check(
  "capacité « tools » annoncée, sans ressources ni prompts",
  Boolean(client.getServerCapabilities()?.tools) &&
    !client.getServerCapabilities()?.resources &&
    !client.getServerCapabilities()?.prompts,
);
await client.ping();
check("ping", true);

const { tools } = await client.listTools();
const names = tools.map((t) => t.name);
check(
  "exactement 3 outils : creer_brouillon, lister_brouillons, lire_article",
  JSON.stringify(names) ===
    JSON.stringify(["creer_brouillon", "lister_brouillons", "lire_article"]),
  names.join(", "),
);
check(
  "aucun outil de publication, modification ou suppression",
  names.every((n) => !/publi|modif|update|supprim|delete|statut/i.test(n)),
);

// ── 3. Création d'un brouillon ────────────────────────────────────────────
console.log("\n3. Création d'un brouillon");
const unique = `e2e-${Date.now()}`;
const created = await client.callTool({
  name: "creer_brouillon",
  arguments: {
    titre: `Test de bout en bout du connecteur ${unique}`,
    contenu:
      "Brouillon créé par le test automatique du connecteur.\n\n## Vérification\n\n- Statut brouillon\n- Jamais publié",
    categorie: "Touba",
    statut_verification: "À VÉRIFIER",
    sources: [{ titre: "Test", url: "https://example.com/source" }],
    texte_facebook: "Texte Facebook de test",
    cle_idempotence: unique,
  },
});
const draft = parse(created);
check(
  "brouillon créé sans erreur",
  created.isError === false,
  JSON.stringify(created).slice(0, 200),
);
check("statut « brouillon »", draft?.statut === "brouillon", draft?.statut);
check(
  "origine « claude-mcp »",
  draft?.origine === "claude-mcp",
  draft?.origine,
);

const again = parse(
  await client.callTool({
    name: "creer_brouillon",
    arguments: {
      titre: `Test de bout en bout du connecteur ${unique}`,
      contenu:
        "Deuxième envoi identique pour vérifier la protection contre les doublons.",
      categorie: "Touba",
      statut_verification: "À VÉRIFIER",
      cle_idempotence: unique,
    },
  }),
);
check(
  "doublon détecté (même clé d'idempotence)",
  again?.doublon === true && again?.id === draft?.id,
);

const listed = parse(
  await client.callTool({ name: "lister_brouillons", arguments: {} }),
);
check(
  "le brouillon apparaît dans lister_brouillons",
  listed?.brouillons?.some((b) => b.id === draft?.id),
);

const read = parse(
  await client.callTool({ name: "lire_article", arguments: { id: draft?.id } }),
);
check(
  "lire_article renvoie le brouillon",
  read?.id === draft?.id && read?.statut === "brouillon",
);
check(
  "le HTML produit est structuré",
  /<h2>Vérification<\/h2>/.test(read?.contenuHtml ?? ""),
);

// ── 4. Refus des opérations non autorisées ─────────────────────────────────
console.log("\n4. Refus des opérations non autorisées");
for (const name of [
  "publier_article",
  "modifier_article",
  "supprimer_article",
]) {
  try {
    const r = await client.callTool({ name, arguments: { id: draft?.id } });
    check(
      `outil « ${name} » refusé`,
      r.isError === true,
      JSON.stringify(r).slice(0, 120),
    );
  } catch (error) {
    check(
      `outil « ${name} » refusé`,
      /Outil inconnu|-32602/.test(String(error?.message ?? error)),
    );
  }
}

const forged = await client.callTool({
  name: "creer_brouillon",
  arguments: {
    titre: "Tentative de publication directe",
    contenu: "Ce brouillon essaie de se publier lui-même via un champ statut.",
    categorie: "Touba",
    statut_verification: "CONFIRMÉ",
    statut: "publie",
  },
});
check("champ « statut » refusé (validation stricte)", forged.isError === true);

for (const method of ["resources/list", "prompts/list"]) {
  try {
    await client.request({ method, params: {} }, (await import("zod")).z.any());
    check(`méthode ${method} refusée`, false);
  } catch (error) {
    check(
      `méthode ${method} refusée`,
      /-32601|non prise en charge/i.test(String(error?.message ?? error)),
    );
  }
}

await client.close();

// ── 5. Le brouillon n'est pas publié sur le site ───────────────────────────
console.log("\n5. Aucune publication sur le site public");
const slugPage = await fetch(new URL(`/${read?.slug ?? "inexistant"}`, BASE));
check(
  "la page publique du brouillon n'existe pas (404)",
  slugPage.status === 404,
  `statut ${slugPage.status}`,
);
const home = await fetch(new URL("/", BASE));
const homeHtml = await home.text();
check(
  "la page d'accueil répond (200)",
  home.status === 200,
  `statut ${home.status}`,
);
check("le brouillon n'apparaît pas sur l'accueil", !homeHtml.includes(unique));

console.log(
  `\n${failures === 0 ? "SUCCÈS" : `ÉCHEC : ${failures} vérification(s)`}`,
);
process.exit(failures === 0 ? 0 : 1);
