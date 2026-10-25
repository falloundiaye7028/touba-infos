import { beforeEach, describe, expect, it, vi } from "vitest";

import { article, createFakeStore } from "./fake-store";

const store = vi.hoisted(() => ({
  current: null as ReturnType<typeof createFakeStore> | null,
}));

vi.mock("@/lib/touba-infos-store", () => ({
  adminListAll: () => store.current!.adminListAll(),
  adminCreate: (input: never) => store.current!.adminCreate(input),
}));

import {
  createIntegrationDraft,
  computeDedupeKey,
  type DraftRequest,
} from "../draft-service";

const NOW = new Date("2026-10-25T08:00:00Z");

function request(partial: Partial<DraftRequest> = {}): DraftRequest {
  return {
    origin: "claude-mcp",
    titre: "Touba : réunion des cadres sur la salubrité",
    contenuHtml: "<p>Contenu vérifié.</p>",
    categorie: "Touba",
    ...partial,
  };
}

describe("createIntegrationDraft", () => {
  beforeEach(() => {
    store.current = createFakeStore([article({ id: "10" })]);
    vi.unstubAllEnvs();
  });

  it("crée toujours un brouillon, jamais à la une ni breaking", async () => {
    const forged = {
      ...request(),
      statut: "publie",
      alaUne: true,
      breaking: true,
    };
    const { article: a, duplicate } = await createIntegrationDraft(
      forged as DraftRequest,
      NOW,
    );
    expect(duplicate).toBe(false);
    expect(a.statut).toBe("brouillon");
    expect(a.alaUne).toBe(false);
    expect(a.breaking).toBe(false);
    expect(a.epingle).toBe(false);
  });

  it.each(["off", "assisted", "full"])(
    "reste un brouillon avec TI_AGENT_AUTOPUBLISH=%s",
    async (mode) => {
      vi.stubEnv("TI_AGENT_AUTOPUBLISH", mode);
      const { article: a } = await createIntegrationDraft(request(), NOW);
      expect(a.statut).toBe("brouillon");
    },
  );

  it("trace l'origine, la vérification et les sources", async () => {
    const { article: a } = await createIntegrationDraft(
      request({
        verificationStatus: "CONFIRMÉ",
        sources: [{ url: "https://aps.sn/article" }],
        sourceUrl: "https://aps.sn/article",
        idempotencyKey: "revue-2026-10-25-1",
        requestId: "req-1",
      }),
      NOW,
    );
    expect(a.auteur).toBe("Rédaction Touba Infos");
    expect(a.metadata).toMatchObject({
      generatedBy: "claude-mcp",
      createdVia: "mcp",
      reviewRequired: true,
      verificationStatus: "CONFIRMÉ",
      idempotencyKey: "revue-2026-10-25-1",
      requestId: "req-1",
      receivedAt: NOW.toISOString(),
      dedupeKey: computeDedupeKey(
        "Touba : réunion des cadres sur la salubrité",
        "https://aps.sn/article",
      ),
    });
  });

  it("ne retient jamais une image externe, la garde en suggestion", async () => {
    const { article: a } = await createIntegrationDraft(
      request({ imageUrl: "https://seneweb.com/photo.jpg", credit: "Seneweb" }),
      NOW,
    );
    expect(a.imageUrl).toBeUndefined();
    expect(a.credit).toBeUndefined();
    expect(a.metadata?.imageSuggestion).toBe("https://seneweb.com/photo.jpg");
    expect(a.metadata?.imageCreditSuggestion).toBe("Seneweb");
  });

  it("renvoie le brouillon existant pour la même clé d'idempotence", async () => {
    const first = await createIntegrationDraft(
      request({ idempotencyKey: "cle-unique-001" }),
      NOW,
    );
    const second = await createIntegrationDraft(
      request({
        titre: "Autre titre complètement différent",
        idempotencyKey: "cle-unique-001",
      }),
      NOW,
    );
    expect(second.duplicate).toBe(true);
    expect(second.article.id).toBe(first.article.id);
    expect(store.current!.articles).toHaveLength(2);
  });

  it("détecte un doublon de titre (accents et ponctuation ignorés) sous 72 h", async () => {
    await createIntegrationDraft(request(), NOW);
    const again = await createIntegrationDraft(
      request({ titre: "TOUBA — Réunion des cadres sur la salubrité !" }),
      new Date(NOW.getTime() + 60 * 60 * 1000),
    );
    expect(again.duplicate).toBe(true);
  });

  it("accepte le même titre au-delà de 72 h si la source diffère", async () => {
    await createIntegrationDraft(request({ sourceUrl: "https://a.sn/1" }), NOW);
    const later = await createIntegrationDraft(
      request({ sourceUrl: "https://a.sn/2" }),
      new Date(NOW.getTime() + 80 * 60 * 60 * 1000),
    );
    expect(later.duplicate).toBe(false);
  });

  it("une clé d'idempotence d'une autre origine ne bloque pas", async () => {
    await createIntegrationDraft(
      request({
        origin: "amy-ia-solutions",
        idempotencyKey: "cle-partagee-1",
        titre: "Sujet A de test",
      }),
      NOW,
    );
    const r = await createIntegrationDraft(
      request({ idempotencyKey: "cle-partagee-1", titre: "Sujet B de test" }),
      NOW,
    );
    expect(r.duplicate).toBe(false);
  });

  it("échoue si le store renvoie un article publié (garde-fou)", async () => {
    const real = store.current!.adminCreate;
    store.current!.adminCreate = async (input) => ({
      ...(await real(input)),
      statut: "publie",
    });
    await expect(createIntegrationDraft(request(), NOW)).rejects.toThrow(
      /non-publication/,
    );
  });

  it("ne renvoie jamais un article publié comme doublon", async () => {
    store.current!.articles.push(
      article({
        id: "20",
        statut: "publie",
        titre: "Touba : réunion des cadres sur la salubrité",
        metadata: {
          generatedBy: "claude-mcp",
          dedupeKey: computeDedupeKey(
            "Touba : réunion des cadres sur la salubrité",
          ),
        },
      }),
    );
    const r = await createIntegrationDraft(request(), NOW);
    expect(r.duplicate).toBe(false);
    expect(r.article.statut).toBe("brouillon");
  });

  it("ne considère pas le brouillon d'une autre origine comme doublon", async () => {
    await createIntegrationDraft(request({ origin: "amy-ia-solutions" }), NOW);
    const r = await createIntegrationDraft(request(), NOW);
    expect(r.duplicate).toBe(false);
  });

  it("même titre mais sources différentes : pas un doublon", async () => {
    await createIntegrationDraft(
      request({ titre: "Communiqué", sourceUrl: "https://a.sn/1" }),
      NOW,
    );
    const r = await createIntegrationDraft(
      request({ titre: "Communiqué", sourceUrl: "https://b.sn/2" }),
      NOW,
    );
    expect(r.duplicate).toBe(false);
  });

  it("refuse un titre vide après nettoyage", async () => {
    await expect(
      createIntegrationDraft(request({ titre: "<<>>" }), NOW),
    ).rejects.toThrow(/Titre vide/);
  });
});
