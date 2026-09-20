import Link from "next/link";

import { listAIDrafts } from "@/lib/touba-infos-store";

export default async function AIDraftBanner() {
  const count = (await listAIDrafts()).length;
  if (count === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
      <p className="text-sm font-semibold text-amber-800">
        🤖 {count} brouillon(s) généré(s) par AMY IA en attente de validation
      </p>
      <Link
        href="/admin/articles?filter=ai-drafts"
        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
      >
        Voir les brouillons IA
      </Link>
    </div>
  );
}
