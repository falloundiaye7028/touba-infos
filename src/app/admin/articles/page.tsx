import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import { adminListAll } from "@/lib/touba-infos-store";
import { formatDateFr } from "@/lib/touba-infos";
import StatutBadge from "../_components/StatutBadge";
import RowActions from "../_components/RowActions";

const FILTRES = [
  { key: "", label: "Tous" },
  { key: "publie", label: "Publiés" },
  { key: "brouillon", label: "Brouillons" },
  { key: "programme", label: "Programmés" },
];

export default async function ArticlesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; q?: string; ok?: string }>;
}) {
  const { statut = "", q = "", ok } = await searchParams;
  let items = await adminListAll();

  if (statut) items = items.filter((a) => (a.statut ?? "publie") === statut);
  if (q) {
    const t = q.toLowerCase();
    items = items.filter((a) =>
      [a.titre, a.auteur, a.categorie, ...a.tags].join(" ").toLowerCase().includes(t),
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Articles</h1>
          <p className="text-sm text-neutral-500">{items.length} article(s)</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
        >
          <PlusCircle size={16} /> Nouvel article
        </Link>
      </div>

      {ok && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
          {ok === "supprime" ? "Article supprimé." : "Enregistré."}
        </p>
      )}

      {/* Filtres + recherche */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTRES.map((f) => {
            const active = statut === f.key;
            const href = f.key
              ? `/admin/articles?statut=${f.key}`
              : "/admin/articles";
            return (
              <Link
                key={f.key || "all"}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  active ? "bg-green-600 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <form className="flex items-center gap-2 rounded-lg bg-white px-3 ring-1 ring-neutral-200">
          <Search size={16} className="text-neutral-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher…"
            className="w-44 bg-transparent py-2 text-sm outline-none"
          />
          {statut && <input type="hidden" name="statut" value={statut} />}
        </form>
      </div>

      {/* Tableau */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Titre</th>
                <th className="px-4 py-3 font-semibold">Rubrique</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{a.imageEmoji}</span>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/articles/${a.id}`}
                          className="line-clamp-1 font-semibold text-neutral-900 hover:text-green-700"
                        >
                          {a.titre}
                        </Link>
                        <p className="text-xs text-neutral-400">{a.auteur}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{a.categorie}</td>
                  <td className="px-4 py-3 text-neutral-500">{formatDateFr(a.date)}</td>
                  <td className="px-4 py-3"><StatutBadge statut={a.statut} /></td>
                  <td className="px-4 py-3"><RowActions article={a} /></td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-neutral-400">
                    Aucun article.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
