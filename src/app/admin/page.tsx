import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  PencilLine,
  Clock,
  Star,
  Zap,
  Eye,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { adminStats, adminListAll } from "@/lib/touba-infos-store";
import { formatDateFr } from "@/lib/touba-infos";
import StatutBadge from "./_components/StatutBadge";

export default async function AdminDashboard() {
  const stats = await adminStats();
  const recents = (await adminListAll()).slice(0, 6);

  const cards = [
    { label: "Articles", value: stats.total, Icon: FileText, color: "text-neutral-700 bg-neutral-100" },
    { label: "Publiés", value: stats.publies, Icon: CheckCircle2, color: "text-green-700 bg-green-100" },
    { label: "Brouillons", value: stats.brouillons, Icon: PencilLine, color: "text-amber-700 bg-amber-100" },
    { label: "Programmés", value: stats.programmes, Icon: Clock, color: "text-sky-700 bg-sky-100" },
    { label: "À la Une", value: stats.alaUne, Icon: Star, color: "text-yellow-700 bg-yellow-100" },
    { label: "Dernière minute", value: stats.breaking, Icon: Zap, color: "text-red-700 bg-red-100" },
    { label: "Vues cumulées", value: stats.vues.toLocaleString("fr-FR"), Icon: Eye, color: "text-violet-700 bg-violet-100" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Tableau de bord</h1>
          <p className="text-sm text-neutral-500">Vue d&apos;ensemble de la rédaction Touba Infos.</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
        >
          <PlusCircle size={16} /> Nouvel article
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        {cards.map(({ label, value, Icon, color }) => (
          <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
              <Icon size={18} />
            </div>
            <p className="mt-3 text-2xl font-black text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Articles récents */}
      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="font-black text-neutral-900">Articles récents</h2>
          <Link
            href="/admin/articles"
            className="flex items-center gap-1 text-sm font-bold text-green-700 hover:text-green-800"
          >
            Tous les articles <ArrowRight size={14} />
          </Link>
        </div>
        <ul className="divide-y divide-neutral-100">
          {recents.map((a) => (
            <li key={a.id}>
              <Link
                href={`/admin/articles/${a.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-50"
              >
                <span className="text-xl">{a.imageEmoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-900">{a.titre}</p>
                  <p className="text-xs text-neutral-400">
                    {a.categorie} · {a.auteur} · {formatDateFr(a.date)}
                  </p>
                </div>
                <StatutBadge statut={a.statut} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
