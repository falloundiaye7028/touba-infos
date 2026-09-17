import type { Metadata } from "next";
import { rechercheArticles } from "@/lib/touba-infos-store";
import { CardStandard } from "../_components/ui";
import SearchBox from "../_components/SearchBox";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Rechercher un article, une personne ou un mot-clé sur Touba Infos.",
  robots: { index: false },
};

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const resultats = query ? await rechercheArticles(query) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
        Recherche
      </h1>
      <div className="mt-6 max-w-2xl">
        <SearchBox initial={query} />
      </div>

      {query ? (
        <div className="mt-8">
          <p className="mb-5 text-sm text-neutral-500">
            {resultats.length} résultat{resultats.length > 1 ? "s" : ""} pour{" "}
            <span className="font-bold text-neutral-800">« {query} »</span>
          </p>
          {resultats.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
              <p className="text-5xl">🔍</p>
              <p className="mt-3 text-neutral-500">
                Aucun article ne correspond à votre recherche.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {resultats.map((a) => (
                <CardStandard key={a.id} article={a} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-8 text-neutral-500">
          Saisissez un terme pour rechercher parmi les articles, les rubriques,
          les auteurs et les mots-clés.
        </p>
      )}
    </div>
  );
}
