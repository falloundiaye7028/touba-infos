import type { MetadataRoute } from "next";
import {
  CATEGORIES_INFO,
  CATEGORIES_PLUS,
  slugCategorie,
  MEDIA_URL,
  type CategorieInfo,
} from "@/lib/touba-infos";
import { getArticlesTries } from "@/lib/touba-infos-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articlesInfos = await getArticlesTries();

  const sections = [
    "magal",
    "videos",
    "direct",
    "fil-info",
    "a-propos",
    "contact",
    "publicite",
    "politique-editoriale",
    "newsletter",
  ].map((s) => ({
    url: `${MEDIA_URL}/${s}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const rubriques = [...CATEGORIES_INFO, ...CATEGORIES_PLUS]
    .filter((c) => slugCategorie(c as CategorieInfo) !== "magal")
    .map((c) => ({
      url: `${MEDIA_URL}/rubrique/${slugCategorie(c as CategorieInfo)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

  const articles = articlesInfos.map((a) => ({
    url: `${MEDIA_URL}/${a.slug}`,
    lastModified: new Date(a.miseAJour ?? a.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${MEDIA_URL}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.95,
    },
    ...sections,
    ...rubriques,
    ...articles,
  ];
}
