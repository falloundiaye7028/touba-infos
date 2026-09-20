import { describe, expect, it } from "vitest";

import { amyIncomingSchema } from "./amy-incoming";

describe("amyIncomingSchema", () => {
  it("accepte un payload complet", () => {
    const result = amyIncomingSchema.safeParse({
      title: "Un titre",
      body: "Un corps d'article",
      meta: { description: "Description", keywords: ["a", "b"] },
      socialPosts: { whatsapp: "Post", facebook: "Post", twitter: "Post" },
      sourceUrl: "https://example.com/article",
    });
    expect(result.success).toBe(true);
  });

  it("accepte un payload minimal (titre + corps)", () => {
    const result = amyIncomingSchema.safeParse({
      title: "Titre",
      body: "Corps",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un payload sans titre", () => {
    const result = amyIncomingSchema.safeParse({ body: "Corps" });
    expect(result.success).toBe(false);
  });

  it("rejette une sourceUrl invalide", () => {
    const result = amyIncomingSchema.safeParse({
      title: "Titre",
      body: "Corps",
      sourceUrl: "pas-une-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepte une catégorie valide", () => {
    const result = amyIncomingSchema.safeParse({
      title: "Titre",
      body: "Corps",
      categorie: "Religion",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.categorie).toBe("Religion");
  });

  it("rejette une catégorie inconnue", () => {
    const result = amyIncomingSchema.safeParse({
      title: "Titre",
      body: "Corps",
      categorie: "Inconnue",
    });
    expect(result.success).toBe(false);
  });

  it("par défaut, la catégorie vaut « Touba »", () => {
    const result = amyIncomingSchema.safeParse({ title: "Titre", body: "Corps" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.categorie).toBe("Touba");
  });

  it("accepte une imageUrl valide", () => {
    const result = amyIncomingSchema.safeParse({
      title: "Titre",
      body: "Corps",
      imageUrl: "https://example.com/image.jpg",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBe("https://example.com/image.jpg");
    }
  });

  it("rejette une imageUrl invalide", () => {
    const result = amyIncomingSchema.safeParse({
      title: "Titre",
      body: "Corps",
      imageUrl: "pas-une-url",
    });
    expect(result.success).toBe(false);
  });
});
