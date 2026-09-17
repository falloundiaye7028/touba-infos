import Link from "next/link";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { listAds } from "@/lib/touba-infos-ads";
import { toggleAdAction, deleteAdAction } from "./actions";

export const dynamic = "force-dynamic";

const POSITION_LABEL: Record<string, string> = {
  top: "Bandeau haut",
  leaderboard: "Grand bandeau",
  sidebar: "Colonne latérale",
};

export default async function AdsAdmin() {
  const ads = await listAds();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Publicités</h1>
          <p className="text-sm text-neutral-500">
            Gérez les bandeaux affichés sur le site.
          </p>
        </div>
        <Link
          href="/admin/ads/new"
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
        >
          <PlusCircle size={16} /> Nouvelle publicité
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {ads.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-500">
            Aucune publicité pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {ads.map((ad) => (
              <li key={ad.id} className="flex items-center gap-4 px-5 py-4">
                {ad.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ad.imageUrl} alt={ad.name} className="h-10 w-16 rounded object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-900">
                    {ad.name}
                    <span className="ml-2 text-xs text-neutral-400">
                      {POSITION_LABEL[ad.position] ?? ad.position}
                    </span>
                  </p>
                  <p className="truncate text-xs text-neutral-400">{ad.linkUrl}</p>
                </div>
                <form action={toggleAdAction.bind(null, ad.id)}>
                  <button
                    type="submit"
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                      ad.active
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {ad.active ? "Active" : "Inactive"}
                  </button>
                </form>
                <Link
                  href={`/admin/ads/${ad.id}`}
                  className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                  aria-label="Modifier"
                >
                  <Pencil size={16} />
                </Link>
                <form action={deleteAdAction.bind(null, ad.id)}>
                  <button
                    type="submit"
                    className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
