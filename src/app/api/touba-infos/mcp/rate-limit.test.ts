import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeStore } from "@/lib/integrations/__tests__/fake-store";

const store = vi.hoisted(() => ({
  current: null as ReturnType<typeof createFakeStore> | null,
}));
const limits = vi.hoisted(() => ({ blocked: new Set<string>() }));

vi.mock("@/lib/touba-infos-store", () => ({
  adminListAll: () => store.current!.adminListAll(),
  adminCreate: (input: never) => store.current!.adminCreate(input),
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: (key: string) => ({
    allowed: !limits.blocked.has(key),
    remaining: limits.blocked.has(key) ? 0 : 1,
  }),
}));

import { POST } from "./route";

const SECRET = "k".repeat(40);

function rpc(body: unknown) {
  return new Request("https://toubainfos.com/api/touba-infos/mcp", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${SECRET}`,
    },
    body: JSON.stringify(body),
  });
}

describe("limites de débit du connecteur", () => {
  beforeEach(() => {
    store.current = createFakeStore();
    limits.blocked.clear();
    vi.stubEnv("TOUBA_INFOS_MCP_SECRET", SECRET);
  });

  it("répond 429 quand la limite globale d'appels est atteinte", async () => {
    limits.blocked.add("mcp:calls");
    const res = await POST(rpc({ jsonrpc: "2.0", id: 1, method: "ping" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("3600");
  });

  it("refuse la création au-delà de la limite horaire de brouillons", async () => {
    limits.blocked.add("mcp:creer_brouillon");
    const res = await POST(
      rpc({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "creer_brouillon",
          arguments: {
            titre: "Un titre de test valide",
            contenu:
              "Un contenu de test suffisamment long pour passer la validation.",
            categorie: "Touba",
            statut_verification: "À VÉRIFIER",
          },
        },
      }),
    );
    const json = await res.json();
    expect(json.result.isError).toBe(true);
    expect(json.result.content[0].text).toContain("Limite atteinte");
    expect(store.current!.articles).toHaveLength(0);
  });
});
