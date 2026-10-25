// Exerce le VRAI store (backend fichier, sans base de données) derrière
// draft-service, pour vérifier les invariants de bout en bout.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// react.cache n'existe que dans le rendu serveur : passe-plat en test.
vi.mock("react", () => ({ cache: <T>(fn: T) => fn }));

const workdir = mkdtempSync(path.join(tmpdir(), "ti-store-"));
const originalCwd = process.cwd();

describe("draft-service sur le store réel (backend fichier)", () => {
  beforeAll(() => {
    vi.stubEnv("DATABASE_URL", "");
    process.chdir(workdir);
  });

  afterAll(() => {
    process.chdir(originalCwd);
    rmSync(workdir, { recursive: true, force: true });
  });

  it("crée un brouillon invisible du public, sans toucher aux autres articles", async () => {
    const store = await import("@/lib/touba-infos-store");
    const { createIntegrationDraft } = await import("../draft-service");

    const before = await store.getArticlesTries();
    const { article, duplicate } = await createIntegrationDraft({
      origin: "claude-mcp",
      titre: "Article de test du connecteur",
      contenuHtml: "<p>Contenu de test.</p>",
      categorie: "Magal",
    });

    expect(duplicate).toBe(false);
    expect(article.statut).toBe("brouillon");
    expect(article.alaUne).toBe(false);

    const stored = await store.adminGetById(article.id);
    expect(stored?.statut).toBe("brouillon");
    expect(stored?.metadata?.generatedBy).toBe("claude-mcp");
    expect(store.isAIGenerated(stored!)).toBe(true);

    const after = await store.getArticlesTries();
    expect(after.map((a) => a.id)).toEqual(before.map((a) => a.id));
    expect(await store.getArticleInfoBySlug(article.slug)).toBeUndefined();

    const again = await createIntegrationDraft({
      origin: "claude-mcp",
      titre: "Article de test du connecteur",
      contenuHtml: "<p>Contenu de test.</p>",
      categorie: "Magal",
    });
    expect(again.duplicate).toBe(true);
    expect(again.article.id).toBe(article.id);
  });
});
