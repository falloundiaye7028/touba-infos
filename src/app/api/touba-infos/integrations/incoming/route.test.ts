import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeStore } from "@/lib/integrations/__tests__/fake-store";

const store = vi.hoisted(() => ({ current: null as ReturnType<typeof createFakeStore> | null }));

vi.mock("@/lib/touba-infos-store", () => ({
  adminListAll: () => store.current!.adminListAll(),
  adminCreate: (input: never) => store.current!.adminCreate(input),
}));

import { POST } from "./route";

const SECRET = "secret-amy-de-test";

function post(body: unknown, token: string | null = SECRET) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  return POST(
    new Request("https://toubainfos.com/api/touba-infos/integrations/incoming", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /integrations/incoming (AMY IA)", () => {
  beforeEach(() => {
    store.current = createFakeStore();
    vi.stubEnv("TOUBA_INFOS_INTEGRATION_SECRET", SECRET);
    vi.stubEnv("TI_BLOB_PUBLIC_HOST", "abc123.public.blob.vercel-storage.com");
  });

  it("refuse sans jeton valide", async () => {
    expect((await post({ title: "T", body: "B" }, null)).status).toBe(401);
    expect((await post({ title: "T", body: "B" }, "faux")).status).toBe(401);
  });

  it("crée un brouillon et conserve le format de réponse existant", async () => {
    const res = await post({ title: "Titre AMY", body: "<p>Corps</p>", categorie: "Sénégal" });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, draftUrl: `/admin/articles/${json.articleId}` });
    const a = store.current!.articles[0];
    expect(a.statut).toBe("brouillon");
    expect(a.categorie).toBe("Sénégal");
    expect(a.metadata?.generatedBy).toBe("amy-ia-solutions");
  });

  it("ignore une tentative de publication dans le payload", async () => {
    await post({ title: "Titre AMY 2", body: "Corps", statut: "publie", alaUne: true });
    const a = store.current!.articles[0];
    expect(a.statut).toBe("brouillon");
    expect(a.alaUne).toBe(false);
  });

  it("nettoie le HTML reçu", async () => {
    await post({ title: "Titre AMY 3", body: '<p>Ok</p><script>alert(1)</script><img src="https://x/y.jpg">' });
    expect(store.current!.articles[0].contenu).toBe("<p>Ok</p>");
  });

  it("n'utilise pas d'image externe, même d'un site auparavant autorisé", async () => {
    await post({ title: "Titre AMY 4", body: "Corps", imageUrl: "https://www.aps.sn/photo.jpg" });
    const a = store.current!.articles[0];
    expect(a.imageUrl).toBeUndefined();
    expect(a.metadata?.imageSuggestion).toBe("https://www.aps.sn/photo.jpg");
  });

  it("accepte une image du stockage Touba Infos", async () => {
    const url = "https://abc123.public.blob.vercel-storage.com/touba-infos/articles/a.jpg";
    await post({ title: "Titre AMY 5", body: "Corps", imageUrl: url });
    expect(store.current!.articles[0].imageUrl).toBe(url);
  });

  it("répond 200 avec duplicate=true pour un doublon", async () => {
    const body = { title: "Même sujet", body: "Corps", sourceUrl: "https://aps.sn/1" };
    expect((await post(body)).status).toBe(201);
    const res = await post(body);
    expect(res.status).toBe(200);
    expect((await res.json()).duplicate).toBe(true);
    expect(store.current!.articles).toHaveLength(1);
  });

  it("refuse un contenu vide après nettoyage", async () => {
    expect((await post({ title: "Vide", body: "<script>x</script>" })).status).toBe(400);
  });
});
