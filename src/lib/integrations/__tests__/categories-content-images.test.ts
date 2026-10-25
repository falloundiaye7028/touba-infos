import { describe, expect, it } from "vitest";

import { COULEURS_CATEGORIES } from "@/lib/touba-infos";
import { amyIncomingSchema } from "@/lib/validation/amy-incoming";

import { INTEGRATION_CATEGORIES } from "../categories";
import { plainTextToHtml, sanitizeArticleHtml, textLength } from "../content";
import { ownBlobHost, resolveIntegrationImage } from "../images";

describe("rubriques des intégrations", () => {
  it("couvrent toutes les rubriques affichées par le site", () => {
    for (const categorie of Object.keys(COULEURS_CATEGORIES)) {
      expect(INTEGRATION_CATEGORIES).toContain(categorie);
    }
  });

  it.each(["Sénégal", "Magal", "Afrique", "Environnement", "Diaspora"])(
    "le point d'entrée AMY accepte désormais « %s »",
    (categorie) => {
      const result = amyIncomingSchema.safeParse({
        title: "Titre",
        body: "Corps",
        categorie,
      });
      expect(result.success).toBe(true);
    },
  );

  it("ignore un champ « statut » envoyé par l'appelant", () => {
    const result = amyIncomingSchema.safeParse({
      title: "Titre",
      body: "Corps",
      statut: "publie",
    });
    expect(result.success).toBe(true);
    if (result.success) expect("statut" in result.data).toBe(false);
  });
});

describe("nettoyage du contenu", () => {
  it("supprime scripts, attributs d'événement, images et liens javascript:", () => {
    const html = sanitizeArticleHtml(
      '<p onclick="x()">Texte<script>alert(1)</script></p>' +
        '<img src="https://autre-media.sn/photo.jpg" onerror="alert(1)">' +
        '<a href="javascript:alert(1)">piège</a><iframe src="https://x"></iframe>',
    );
    expect(html).not.toMatch(/script|onclick|onerror|<img|javascript:|iframe/i);
    expect(html).toContain("<p>Texte</p>");
  });

  it("conserve les liens http(s) en les sécurisant", () => {
    const html = sanitizeArticleHtml('<a href="https://aps.sn/x">APS</a>');
    expect(html).toContain('href="https://aps.sn/x"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });

  it("convertit le texte simple et échappe le HTML fourni", () => {
    const html = plainTextToHtml(
      "## Intertitre\n\nPremier **paragraphe** <script>alert(1)</script>\n\n- un\n- deux\n\n> Citation",
    );
    expect(html).toContain("<h2>Intertitre</h2>");
    expect(html).toContain("<strong>paragraphe</strong>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("<ul><li>un</li><li>deux</li></ul>");
    expect(html).toContain("<blockquote>");
  });

  it("mesure la longueur du texte réel", () => {
    expect(textLength("<p>  abc  </p><p></p>")).toBe(3);
  });
});

describe("images des intégrations", () => {
  const env = { TI_BLOB_PUBLIC_HOST: "abc123.public.blob.vercel-storage.com" };

  it("accepte une image du stockage Touba Infos", () => {
    const url =
      "https://abc123.public.blob.vercel-storage.com/touba-infos/articles/photo.jpg";
    expect(resolveIntegrationImage(url, env)).toEqual({ imageUrl: url });
  });

  it.each([
    ["autre média", "https://seneweb.com/photo.jpg"],
    [
      "autre stockage Vercel",
      "https://zzz999.public.blob.vercel-storage.com/touba-infos/a.jpg",
    ],
    [
      "hors dossier",
      "https://abc123.public.blob.vercel-storage.com/autre/a.jpg",
    ],
    [
      "http non chiffré",
      "http://abc123.public.blob.vercel-storage.com/touba-infos/a.jpg",
    ],
    [
      "identifiants dans l'URL",
      "https://u:p@abc123.public.blob.vercel-storage.com/touba-infos/a.jpg",
    ],
  ])("refuse et met en suggestion : %s", (_label, url) => {
    const result = resolveIntegrationImage(url, env);
    expect(result.imageUrl).toBeUndefined();
    expect(result.suggestion).toBeDefined();
  });

  it("déduit l'hôte du jeton Blob si TI_BLOB_PUBLIC_HOST est absent", () => {
    expect(
      ownBlobHost({
        // Valeur factice assemblée à l'exécution (pas un vrai jeton).
        BLOB_READ_WRITE_TOKEN: [
          "vercel",
          "blob",
          "rw",
          "AbC123",
          "fixture",
        ].join("_"),
      }),
    ).toBe("abc123.public.blob.vercel-storage.com");
  });

  it("refuse toute image si le stockage n'est pas identifiable", () => {
    const url =
      "https://abc123.public.blob.vercel-storage.com/touba-infos/a.jpg";
    expect(resolveIntegrationImage(url, {}).imageUrl).toBeUndefined();
  });

  it("ignore une adresse invalide", () => {
    expect(resolveIntegrationImage("pas une url", env)).toEqual({});
  });
});

describe("images : cas limites relevés en relecture", () => {
  const env = { TI_BLOB_PUBLIC_HOST: "abc123.public.blob.vercel-storage.com" };
  const base = "https://abc123.public.blob.vercel-storage.com";

  it.each([
    ["ebook payant", `${base}/touba-infos/ebooks/livre.pdf`],
    [
      "port explicite",
      "https://abc123.public.blob.vercel-storage.com:444/touba-infos/articles/a.jpg",
    ],
    ["SVG", `${base}/touba-infos/articles/a.svg`],
    ["slash encodé", `${base}/touba-infos/articles/..%2febooks/a.jpg`],
  ])("refuse : %s", (_label, url) => {
    expect(resolveIntegrationImage(url, env).imageUrl).toBeUndefined();
  });

  it("supprime la requête et le fragment", () => {
    expect(
      resolveIntegrationImage(`${base}/touba-infos/articles/a.webp?x=1#y`, env)
        .imageUrl,
    ).toBe(`${base}/touba-infos/articles/a.webp`);
  });
});
