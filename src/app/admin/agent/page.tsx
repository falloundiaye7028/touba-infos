import Link from "next/link";
import {
  Radar,
  Flame,
  ShieldCheck,
  FileText,
  Rss,
  Info,
  Clock,
  TrendingUp,
  Layers,
} from "lucide-react";
import {
  listSujets,
  statsAgent,
  getDerniereVeille,
} from "@/lib/touba-infos-agent-store";
import { SOURCES, niveauScore, type Fiabilite } from "@/lib/touba-infos-agent";
import { formatDateHeureFr, formatHeureFr } from "@/lib/touba-infos";
import VeilleButton from "../_components/VeilleButton";
import SujetActions from "../_components/SujetActions";

const FIAB_CLS: Record<Fiabilite, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-sky-100 text-sky-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-red-100 text-red-700",
};
const FIAB_LABEL: Record<Fiabilite, string> = {
  A: "A · Source primaire",
  B: "B · Agence / référence",
  C: "C · Média numérique",
  D: "D · Non confirmé",
};

export default async function AgentPage() {
  const sujets = await listSujets();
  const stats = await statsAgent();
  const run = await getDerniereVeille();
  const sourcesActives = SOURCES.filter((s) => s.actif).length;
  const aTraiter = sujets.filter(
    (s) => s.statut === "detecte" || s.statut === "a_verifier",
  );
  // Sujets manquants : forte couverture (plusieurs médias) + score, non traités.
  const manquants = [...aTraiter]
    .sort((a, b) => b.nbSources - a.nbSources || b.score - a.score)
    .slice(0, 6);

  const cards = [
    { label: "Sujets à traiter", value: stats.total, Icon: Radar, cls: "bg-neutral-100 text-neutral-700" },
    { label: "Prioritaires (≥80)", value: stats.prioritaires, Icon: Flame, cls: "bg-red-100 text-red-700" },
    { label: "Rédigés (brouillons)", value: stats.rediges, Icon: FileText, cls: "bg-green-100 text-green-700" },
    { label: "Sources actives", value: sourcesActives, Icon: Rss, cls: "bg-sky-100 text-sky-700" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-neutral-900">
            <Radar size={24} className="text-green-600" /> Agent IA — Veille &amp; rédaction
          </h1>
          <p className="text-sm text-neutral-500">
            Surveiller, vérifier, enrichir et rédiger — l&apos;agent propose, la
            rédaction valide.
          </p>
        </div>
        <div className="text-right">
          <VeilleButton />
          {run && (
            <p className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-neutral-400">
              <Clock size={11} /> Dernière veille : {formatDateHeureFr(run.at)} ·{" "}
              {run.nouveaux} nouveau(x) ·{" "}
              <span className={run.mode === "reel" ? "text-green-600" : "text-amber-600"}>
                mode {run.mode}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, Icon, cls }) => (
          <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${cls}`}>
              <Icon size={18} />
            </div>
            <p className="mt-3 text-2xl font-black text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Note éthique */}
      <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" />
        <p>
          L&apos;agent détecte des sujets à partir de <strong>flux publics</strong>,
          n&apos;effectue <strong>aucun copier-coller</strong> et n&apos;auto-publie
          rien : chaque article est réécrit, sourcé, puis placé en{" "}
          <strong>brouillon</strong> pour validation humaine.{" "}
          <Link href="/admin/articles?statut=brouillon" className="font-bold underline">
            Voir les brouillons à valider →
          </Link>
        </p>
      </div>

      {/* Sujets manquants — analyse de couverture */}
      {manquants.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            <h2 className="font-black text-neutral-900">
              Sujets manquants — à préparer en priorité
            </h2>
          </div>
          <p className="mb-4 text-sm text-neutral-500">
            Sujets à fort écho médiatique, pas encore couverts par Touba Infos.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {manquants.map((s) => {
              const medias = [
                s.sourceNom,
                ...s.autresSources.map((x) => x.nom),
              ].filter((v, i, a) => a.indexOf(v) === i);
              const niv = niveauScore(s.score);
              return (
                <div
                  key={s.id}
                  className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                      <Layers size={12} /> {medias.length} média{medias.length > 1 ? "s" : ""}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${niv.cls}`}>
                      {s.score} · {niv.label}
                    </span>
                    <span className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                      {s.categorie}
                    </span>
                  </div>
                  <h3 className="font-bold leading-snug text-neutral-900 line-clamp-2">
                    {s.titre}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400 line-clamp-1">
                    Traité par&nbsp;: {medias.join(", ")}
                  </p>
                  <div className="mt-3 border-t border-neutral-100 pt-2">
                    <SujetActions sujetId={s.id} url={s.url} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sujets détectés */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-100 px-5 py-4">
          <h2 className="font-black text-neutral-900">Sujets détectés</h2>
        </div>
        {aTraiter.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-neutral-400">
            Aucun sujet en attente. Cliquez sur « Lancer la veille » pour
            interroger les sources.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sujet</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Rubrique</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Détecté</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {aTraiter.map((s) => {
                  const niv = niveauScore(s.score);
                  return (
                    <tr key={s.id} className="align-top hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-neutral-900 line-clamp-2">
                          {s.titre}
                          {s.demo && (
                            <span className="ml-2 rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-neutral-500">
                              démo
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-400 line-clamp-1">{s.resume}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-700">{s.sourceNom}</span>
                        <div className="mt-1 flex items-center gap-1">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${FIAB_CLS[s.confiance]}`}>
                            {s.confiance}
                          </span>
                          {s.nbSources > 1 && (
                            <span className="text-[10px] text-neutral-400">
                              {s.nbSources} sources
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{s.categorie}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-neutral-900">{s.score}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${niv.cls}`}>
                            {niv.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{formatHeureFr(s.detecteA)}</td>
                      <td className="px-4 py-3">
                        <SujetActions sujetId={s.id} url={s.url} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sources surveillées */}
      <div className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-black text-neutral-900">
          <Rss size={18} className="text-green-600" /> Sources surveillées ({SOURCES.length})
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCES.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-800">{s.nom}</p>
                <p className="truncate text-[11px] text-neutral-400">
                  {s.type} · {s.rss ? "RSS" : "manuel"}
                </p>
              </div>
              <span
                title={FIAB_LABEL[s.fiabilite]}
                className={`ml-2 flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${FIAB_CLS[s.fiabilite]}`}
              >
                {s.fiabilite}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Note cron */}
      <p className="mt-6 flex items-start gap-2 text-xs text-neutral-400">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        Veille automatique : programmer un appel régulier à{" "}
        <code className="rounded bg-neutral-100 px-1 font-mono text-neutral-600">
          /api/touba-infos/agent/veille?secret=…
        </code>{" "}
        (Vercel Cron, GitHub Actions ou cron externe). Respecte robots.txt,
        droits d&apos;auteur et conditions d&apos;utilisation ; aucun contournement
        de paywall.
      </p>
    </div>
  );
}
