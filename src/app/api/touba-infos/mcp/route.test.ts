import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  article,
  createFakeStore,
} from "@/lib/integrations/__tests__/fake-store";

const store = vi.hoisted(() => ({ current: null as ReturnType<typeof createFakeStore> | null }));

vi.mock("@/lib/touba-infos-store", () => ({
  adminListAll: () => store.current!.adminListAll(),
  adminCreate: (input: never) => store.current!.adminCreate(input),
}));

import { DELETE, GET, POST } from "./route";

const SECRET = "s".repeat(40);
const URL = "https://toubainfos.com/api/touba-infos/mcp";

function rpc(body: unknown, token: string | null = SECRET, contentType = "application/json") {
  const headers: Record<string, string> = { "content-type": contentType };
  if (token !== null) headers.authorization = `Bearer ${token}`;
  return new Request(URL, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function call(name: string, args: unknown, id = 1) {
  const res = await POST(
    rpc({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } }),
  );
  const json = await res.json();
  const text = json.result?.content?.[0]?.text;
  return { res, json, payload: text ? JSON.parse(text) : undefined };
}

const VALID_DRAFT = {
  titre: "Touba : les cadres de Kiiraay tracent leurs priorités",
  contenu:
    "Les cadres se sont réunis samedi pour définir les priorités de la communauté.\n\n## Les décisions\n\n- Salubrité\n- Sécurité",
  categorie: "Touba",
  statut_verification: "CONFIRMÉ",
  sources: [{ titre: "Communiqué", url: "https://exemple.sn/communique" }],
  texte_facebook: "Texte pour la Page",
};

describe("POST /api/touba-infos/mcp — sécurité", () => {
  beforeEach(() => {
    store.current = createFakeStore([
      article({ id: "1", statut: "publie", slug: "article-publie" }),
      article({ id: "2", statut: "programme", slug: "article-programme" }),
    ]);
    vi.stubEnv("TOUBA_INFOS_MCP_SECRET", SECRET);
    vi.stubEnv("TOUBA_INFOS_INTEGRATION_SECRET", "secret-amy-different");
  });

  it("répond 503 si le secret n'est pas configuré", async () => {
    vi.stubEnv("TOUBA_INFOS_MCP_SECRET", "");
    expect((await POST(rpc({ jsonrpc: "2.0", id: 1, method: "ping" }))).status).toBe(503);
  });

  it("répond 503 si le secret est trop court", async () => {
    vi.stubEnv("TOUBA_INFOS_MCP_SECRET", "court");
    expect((await POST(rpc({ jsonrpc: "2.0", id: 1, method: "ping" }, "court"))).status).toBe(503);
  });

  it.each([
    ["sans jeton", null],
    ["mauvais jeton", "x".repeat(40)],
    ["secret AMY", "secret-amy-different"],
  ])("répond 401 %s", async (_label, token) => {
    const res = await POST(rpc({ jsonrpc: "2.0", id: 1, method: "ping" }, token));
    expect(res.status).toBe(401);
  });

  it("refuse un Content-Type autre que JSON", async () => {
    const res = await POST(rpc("{}", SECRET, "text/plain"));
    expect(res.status).toBe(415);
  });

  it("refuse une requête trop volumineuse", async () => {
    const res = await POST(rpc(`{"x":"${"a".repeat(210_000)}"}`));
    expect(res.status).toBe(413);
  });

  it("refuse le JSON invalide et les lots", async () => {
    expect((await POST(rpc("{pas du json"))).status).toBe(400);
    expect((await POST(rpc([{ jsonrpc: "2.0", id: 1, method: "ping" }]))).status).toBe(400);
  });

  it("n'accepte que POST", async () => {
    expect(GET().status).toBe(405);
    expect(DELETE().status).toBe(405);
  });
});

describe("POST /api/touba-infos/mcp — protocole et outils", () => {
  beforeEach(() => {
    store.current = createFakeStore([
      article({ id: "1", statut: "publie", slug: "article-publie" }),
      article({ id: "2", statut: "programme", slug: "article-programme" }),
    ]);
    vi.stubEnv("TOUBA_INFOS_MCP_SECRET", SECRET);
  });

  it("initialise la session MCP", async () => {
    const res = await POST(
      rpc({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } },
      }),
    );
    const json = await res.json();
    expect(json.result.protocolVersion).toBe("2025-06-18");
    expect(json.result.capabilities).toEqual({ tools: { listChanged: false } });
  });

  it("répond 202 sans corps à une notification", async () => {
    const res = await POST(rpc({ jsonrpc: "2.0", method: "notifications/initialized" }));
    expect(res.status).toBe(202);
  });

  it("expose exactement trois outils", async () => {
    const res = await POST(rpc({ jsonrpc: "2.0", id: 2, method: "tools/list" }));
    const names = (await res.json()).result.tools.map((t: { name: string }) => t.name);
    expect(names).toEqual(["creer_brouillon", "lister_brouillons", "lire_article"]);
  });

  it.each(["publier_article", "modifier_article", "supprimer_article", "adminUpdate"])(
    "refuse l'outil « %s »",
    async (name) => {
      const { json } = await call(name, {});
      expect(json.error.code).toBe(-32602);
    },
  );

  it("refuse les méthodes non prévues (resources, prompts…)", async () => {
    const res = await POST(rpc({ jsonrpc: "2.0", id: 3, method: "resources/list" }));
    expect((await res.json()).error.code).toBe(-32601);
  });

  it("crée un brouillon, jamais publié, et le marque comme venant de Claude", async () => {
    const { payload, json } = await call("creer_brouillon", VALID_DRAFT);
    expect(json.result.isError).toBe(false);
    expect(payload.statut).toBe("brouillon");
    expect(payload.origine).toBe("claude-mcp");
    expect(payload.doublon).toBe(false);

    const created = store.current!.articles.find((a) => a.id === payload.id)!;
    expect(created.statut).toBe("brouillon");
    expect(created.contenu).toContain("<h2>Les décisions</h2>");
    expect(created.metadata).toMatchObject({
      generatedBy: "claude-mcp",
      verificationStatus: "CONFIRMÉ",
      socialPosts: { facebook: "Texte pour la Page" },
    });
  });

  it.each([
    ["statut", { statut: "publie" }],
    ["alaUne", { alaUne: true }],
    ["publier", { publier: true }],
  ])("refuse le champ « %s » (validation stricte)", async (_label, extra) => {
    const { json } = await call("creer_brouillon", { ...VALID_DRAFT, ...extra });
    expect(json.result.isError).toBe(true);
    expect(store.current!.articles).toHaveLength(2);
  });

  it("exige le statut de vérification et une rubrique du site", async () => {
    const { statut_verification: _omit, ...sansStatut } = VALID_DRAFT;
    expect((await call("creer_brouillon", sansStatut)).json.result.isError).toBe(true);
    expect(
      (await call("creer_brouillon", { ...VALID_DRAFT, categorie: "Inventée" })).json.result
        .isError,
    ).toBe(true);
  });

  it("échappe le HTML envoyé dans le contenu", async () => {
    const { payload } = await call("creer_brouillon", {
      ...VALID_DRAFT,
      contenu: `${VALID_DRAFT.contenu}\n\n<img src=x onerror=alert(1)><script>alert(1)</script>`,
    });
    const created = store.current!.articles.find((a) => a.id === payload.id)!;
    expect(created.contenu).not.toMatch(/<script|<img/);
    expect(created.contenu).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("ne crée pas de doublon avec la même clé d'idempotence", async () => {
    const args = { ...VALID_DRAFT, cle_idempotence: "revue-2026-10-25-a" };
    const first = await call("creer_brouillon", args);
    const second = await call("creer_brouillon", args);
    expect(second.payload.doublon).toBe(true);
    expect(second.payload.id).toBe(first.payload.id);
    expect(store.current!.articles).toHaveLength(3);
  });

  it("liste les brouillons de Claude uniquement par défaut", async () => {
    await call("creer_brouillon", VALID_DRAFT);
    store.current!.articles.push(
      article({ id: "50", statut: "brouillon", metadata: { generatedBy: "amy-ia-solutions" } }),
    );
    const own = await call("lister_brouillons", {});
    expect(own.payload.total).toBe(1);
    const all = await call("lister_brouillons", { origine: "toutes" });
    expect(all.payload.total).toBe(2);
  });

  it("lit un article publié ou un brouillon, pas un article programmé", async () => {
    expect((await call("lire_article", { slug: "article-publie" })).payload.id).toBe("1");
    const programmed = await call("lire_article", { slug: "article-programme" });
    expect(programmed.json.result.isError).toBe(true);
    const both = await call("lire_article", { id: "1", slug: "article-publie" });
    expect(both.json.result.isError).toBe(true);
  });
});
