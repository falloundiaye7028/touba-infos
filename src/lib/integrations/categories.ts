// ============================================================================
//  TOUBA INFOS — Rubriques et genres acceptés par les intégrations
//  Source unique : les listes affichées par le site (CATEGORIES_INFO +
//  CATEGORIES_PLUS). Toute rubrique visible sur toubainfos.com est donc
//  acceptée par le point d'entrée AMY et par le connecteur Claude.
// ============================================================================

import {
  CATEGORIES_INFO,
  CATEGORIES_PLUS,
  GENRES_INFO,
  type CategorieInfo,
  type GenreInfo,
} from "@/lib/touba-infos";

function nonEmpty<T>(values: readonly T[]): [T, ...T[]] {
  const unique = Array.from(new Set(values));
  if (unique.length === 0) {
    throw new Error("Liste de valeurs vide.");
  }
  return unique as [T, ...T[]];
}

/** Toutes les rubriques du site, dans l'ordre de navigation. */
export const INTEGRATION_CATEGORIES: [CategorieInfo, ...CategorieInfo[]] =
  nonEmpty([...CATEGORIES_INFO, ...CATEGORIES_PLUS]);

/** Tous les genres éditoriaux du site. */
export const INTEGRATION_GENRES: [GenreInfo, ...GenreInfo[]] =
  nonEmpty(GENRES_INFO);
