import type { StatutInfo } from "@/lib/touba-infos";

const MAP: Record<StatutInfo, { label: string; cls: string }> = {
  publie: { label: "Publié", cls: "bg-green-100 text-green-700" },
  brouillon: { label: "Brouillon", cls: "bg-amber-100 text-amber-700" },
  programme: { label: "Programmé", cls: "bg-sky-100 text-sky-700" },
};

export default function StatutBadge({ statut }: { statut?: StatutInfo }) {
  const s = MAP[statut ?? "publie"];
  return (
    <span className={`inline-block flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}
