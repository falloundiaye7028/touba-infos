import type { Metadata } from "next";
import Link from "next/link";
import { formatDateFr, formatHeureFr, type ArticleInfo } from "@/lib/touba-infos";
import { getArticlesTries } from "@/lib/touba-infos-store";
import { CategorieChip } from "../_components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fil info — Toutes les dernières actualités en continu",
  description:
    "Le fil info de Touba Infos : toutes les dernières actualités de Touba, du Sénégal, de l'Afrique et du monde, présentées chronologiquement.",
};

export default async function FilInfoPage() {
  const articles = await getArticlesTries();

  // Regroupement par jour
  const groupes: { jour: string; items: ArticleInfo[] }[] = [];
  for (const a of articles) {
    const jour = formatDateFr(a.date);
    const last = groupes[groupes.length - 1];
    if (last && last.jour === jour) last.items.push(a);
    else groupes.push({ jour, items: [a] });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
        Fil info
      </h1>
      <p className="mt-2 text-neutral-500">
        Toutes les dernières informations, en continu.
      </p>
      <div className="mt-4 h-1 w-16 rounded-full bg-green-600" />

      <div className="mt-8 space-y-10">
        {groupes.map((g) => (
          <div key={g.jour}>
            <h2 className="sticky top-[112px] z-10 mb-3 inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              {g.jour}
            </h2>
            <ol className="relative border-l-2 border-neutral-200 pl-5">
              {g.items.map((a) => (
                <li key={a.id} className="relative pb-6 last:pb-0">
                  <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-green-600" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-green-700">
                      {formatHeureFr(a.date)}
                    </span>
                    <CategorieChip categorie={a.categorie} />
                  </div>
                  <Link
                    href={`/${a.slug}`}
                    className="mt-1 block font-bold leading-snug text-neutral-900 hover:text-green-700"
                  >
                    {a.titre}
                  </Link>
                  <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                    {a.extrait}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
