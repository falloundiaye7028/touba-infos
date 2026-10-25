import type { ArticleInfo } from "@/lib/touba-infos";

type CreateInput = Partial<ArticleInfo> & {
  titre: string;
  categorie: ArticleInfo["categorie"];
  auteur: string;
};

/** Store en mémoire reproduisant adminCreate / adminListAll. */
export function createFakeStore(initial: ArticleInfo[] = []) {
  const articles: ArticleInfo[] = [...initial];

  return {
    articles,
    adminListAll: async () =>
      articles
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    adminCreate: async (input: CreateInput): Promise<ArticleInfo> => {
      const id = String(
        articles.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0) + 1,
      );
      const article: ArticleInfo = {
        id,
        slug: `article-${id}`,
        titre: input.titre,
        sousTitre: input.sousTitre ?? "",
        extrait: input.extrait ?? "",
        categorie: input.categorie,
        genre: input.genre ?? "Actualité",
        statut: input.statut ?? "brouillon",
        auteur: input.auteur,
        date: input.date ?? new Date().toISOString(),
        tempsLecture: "3 min",
        imageEmoji: "📰",
        imageGradient: "x",
        imageUrl: input.imageUrl,
        credit: input.credit,
        legende: input.legende,
        alaUne: input.alaUne ?? false,
        breaking: input.breaking ?? false,
        epingle: input.epingle ?? false,
        vues: 0,
        tags: input.tags ?? [],
        contenu: input.contenu ?? "",
        metadata: input.metadata,
      };
      articles.unshift(article);
      return article;
    },
  };
}

export function article(partial: Partial<ArticleInfo> & { id: string }): ArticleInfo {
  return {
    slug: `slug-${partial.id}`,
    titre: `Titre ${partial.id}`,
    sousTitre: "",
    extrait: "",
    categorie: "Touba",
    genre: "Actualité",
    statut: "publie",
    auteur: "Rédaction",
    date: new Date("2026-10-20T10:00:00Z").toISOString(),
    tempsLecture: "3 min",
    imageEmoji: "📰",
    imageGradient: "x",
    alaUne: false,
    breaking: false,
    vues: 0,
    tags: [],
    contenu: "<p>Contenu</p>",
    ...partial,
  };
}
