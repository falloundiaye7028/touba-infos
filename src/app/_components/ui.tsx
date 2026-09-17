import Link from "next/link";
import { Clock, PlayCircle, ArrowRight, Zap } from "lucide-react";
import {
  type ArticleInfo,
  type VideoInfo,
  COULEURS_CATEGORIES,
  formatDateFr,
} from "@/lib/touba-infos";
import EditorialImage from "./EditorialImage";
import { getActiveAd, listAds } from "@/lib/touba-infos-ads";

export { default as EditorialImage } from "./EditorialImage";

/* ── Chip catégorie ── */
export function CategorieChip({
  categorie,
  className = "",
}: {
  categorie: ArticleInfo["categorie"];
  className?: string;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${COULEURS_CATEGORIES[categorie]} ${className}`}
    >
      {categorie}
    </span>
  );
}

/* ── En-tête de section ── */
export function SectionHeading({
  titre,
  href,
  hrefLabel = "Tout voir",
  accent = "green",
}: {
  titre: string;
  href?: string;
  hrefLabel?: string;
  accent?: "green" | "red" | "neutral";
}) {
  const bar =
    accent === "red"
      ? "bg-red-600"
      : accent === "neutral"
        ? "bg-neutral-800"
        : "bg-green-600";
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-neutral-200 pb-2">
      <h2 className="flex items-center gap-2.5 text-lg font-black uppercase tracking-tight text-neutral-900 sm:text-xl">
        <span className={`h-5 w-1.5 rounded-full ${bar}`} />
        {titre}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex flex-shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wide text-green-700 hover:text-green-800"
        >
          {hrefLabel} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

/* ── Métadonnées article ── */
function Meta({ article, className = "" }: { article: ArticleInfo; className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-xs text-neutral-500 ${className}`}>
      <span className="truncate font-medium text-neutral-600">{article.auteur}</span>
      <span className="flex flex-shrink-0 items-center gap-1">
        <Clock size={12} />
        {article.tempsLecture}
      </span>
    </div>
  );
}

function BreakingBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black uppercase text-white">
      <Zap size={10} className="fill-current" /> Urgent
    </span>
  );
}

/* ── Carte standard (grille) ── */
export function CardStandard({ article }: { article: ArticleInfo }) {
  return (
    <Link
      href={`/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <EditorialImage article={article} />
        <div className="absolute left-3 top-3">
          <CategorieChip categorie={article.categorie} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {article.breaking && (
          <div className="mb-2">
            <BreakingBadge />
          </div>
        )}
        <h3 className="font-bold leading-snug text-neutral-900 line-clamp-3 group-hover:text-green-700">
          {article.titre}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500 line-clamp-2">
          {article.extrait}
        </p>
        <Meta article={article} className="mt-3 border-t border-neutral-100 pt-3" />
      </div>
    </Link>
  );
}

/* ── Carte horizontale (listes / sidebars) ── */
export function CardHorizontal({
  article,
  index,
}: {
  article: ArticleInfo;
  index?: number;
}) {
  return (
    <Link
      href={`/${article.slug}`}
      className="group flex items-start gap-3 py-3"
    >
      {typeof index === "number" && (
        <span className="mt-0.5 text-2xl font-black leading-none text-neutral-200 group-hover:text-green-600">
          {index}
        </span>
      )}
      <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        <EditorialImage article={article} emojiSize="text-2xl" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold uppercase tracking-wide text-green-700">
          {article.categorie}
        </span>
        <h4 className="text-sm font-semibold leading-snug text-neutral-900 line-clamp-2 group-hover:text-green-700">
          {article.titre}
        </h4>
      </div>
    </Link>
  );
}

/* ── Carte compacte (fil / plus lus sans image) ── */
export function CardCompact({
  article,
  index,
}: {
  article: ArticleInfo;
  index?: number;
}) {
  return (
    <Link
      href={`/${article.slug}`}
      className="group flex items-start gap-3 border-b border-neutral-100 py-3 last:border-0"
    >
      {typeof index === "number" && (
        <span className="text-lg font-black leading-none text-green-600">
          {index}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold leading-snug text-neutral-900 line-clamp-2 group-hover:text-green-700">
          {article.titre}
        </h4>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
          <span className="font-semibold uppercase tracking-wide text-green-700">
            {article.categorie}
          </span>
          <span>•</span>
          <span>{formatDateFr(article.date)}</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Carte vidéo ── */
export function CardVideo({ video }: { video: VideoInfo }) {
  return (
    <Link
      href="/videos"
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className={`relative aspect-video bg-gradient-to-br ${video.imageGradient}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="select-none text-5xl opacity-30">{video.imageEmoji}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle
            size={52}
            className="text-white/90 drop-shadow transition-transform group-hover:scale-110"
          />
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white">
          {video.duree}
        </span>
      </div>
      <div className="p-3.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-green-700">
          {video.categorie}
        </span>
        <h3 className="mt-1 text-sm font-bold leading-snug text-neutral-900 line-clamp-2 group-hover:text-green-700">
          {video.titre}
        </h3>
      </div>
    </Link>
  );
}

/* ── Emplacement publicitaire ── */
export function AdSlot({
  format = "banner",
  label = "Publicité",
}: {
  format?: "banner" | "rectangle" | "leaderboard" | "skyscraper" | "intelligence-btp";
  label?: string;
}) {
  if (format === "leaderboard") {
    return (
      <a
        href="https://pay.wave.com/m/M_sn_UMbi7rZ15Cq6/c/sn/?amount=7000"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Payer 7 000 FCFA à Touba Ça Kanam avec Wave"
        className="group block h-24 w-full overflow-hidden rounded-xl bg-green-900 md:h-28"
      >
        <img
          src="https://876xi1t4drtxireu.public.blob.vercel-storage.com/touba-infos/articles/touba-ca-kanam-banner-web-zngj5ildIg1aUUTKwT5oJSW3kTFoJ9.png"
          alt="Touba Ça Kanam : 7 000 FCFA multipliés par un million de personnes pour atteindre 7 milliards de FCFA"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
      </a>
    );
  }

  if (format === "rectangle") {
    return (
      <a
        href="https://www.der.sn/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Découvrir les programmes de la DER/FJ"
        className="group block aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#07162c]"
      >
        <img
          src="https://876xi1t4drtxireu.public.blob.vercel-storage.com/touba-infos/articles/exec-184ab3f6-b832-4a33-be41-95c849201434-FXHbHJ0tpH3dG07vOSyr32whCBemoE.png"
          alt="DER/FJ — Militants de l’entrepreneuriat — Découvrez nos programmes"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
      </a>
    );
  }

  if (format === "skyscraper") {
    return (
      <a
        href="tel:+221776866181"
        aria-label="Appeler TTP au 77 686 61 81"
        className="group block aspect-[4/5] w-full overflow-hidden rounded-xl bg-blue-950"
      >
        <img
          src="https://876xi1t4drtxireu.public.blob.vercel-storage.com/touba-infos/articles/exec-f3e932de-ef94-43d6-bdf7-d994c5aaa41f-ed5B3LE1zfuyxcqZlUUDbPV5JdVT2t.png"
          alt="TTP à Touba — Vente de matériel électroménager et bureautique — 77 686 61 81"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
      </a>
    );
  }

  if (format === "intelligence-btp") {
    return (
      <a
        href="https://www.intelligencebtp.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Découvrir Intelligence BTP"
        className="group block aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#0d2b49]"
      >
        <img
          src="https://876xi1t4drtxireu.public.blob.vercel-storage.com/touba-infos/articles/exec-f929a318-9fde-4fc0-b169-000cbb29cd96-WAqSd4I7OUmWayBbWyBaSfl063VEJG.png"
          alt="Intelligence BTP — Du plan au devis, avec plus de maîtrise"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
      </a>
    );
  }

  const h = "h-20 md:h-24";
  return (
    <div
      className={`flex ${h} w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-neutral-700`}
    >
      <span className="text-xs font-bold uppercase tracking-[0.2em]">{label}</span>
      <span className="mt-2 text-sm leading-relaxed">Espace disponible —
        <Link href="/publicite" className="ml-1 font-semibold text-green-700 hover:underline">
          communiquez sur Touba Infos
        </Link>
      </span>
    </div>
  );
}

export async function ManagedAd({ position }: { position: string }) {
  const ad = await getActiveAd(position);
  if (!ad) {
    return (
      <div className="flex h-20 w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-neutral-700 md:h-24">
        <span className="text-xs font-bold uppercase tracking-[0.2em]">Publicité</span>
        <span className="mt-2 text-sm leading-relaxed">
          Espace disponible —{" "}
          <Link href="/publicite" className="font-semibold text-green-700 hover:underline">
            communiquez sur Touba Infos
          </Link>
        </span>
      </div>
    );
  }
  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      aria-label={ad.name}
      className="group block w-full overflow-hidden rounded-xl bg-neutral-100"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ad.imageUrl} alt={ad.name} className="h-auto w-full" loading="lazy" />
    </a>
  );
}

export async function SidebarAds() {
  const ads = (await listAds()).filter((a) => a.position === "sidebar" && a.active);
  if (ads.length === 0) {
    return <ManagedAd position="sidebar" />;
  }
  return (
    <>
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.linkUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="group block overflow-hidden rounded-xl bg-neutral-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.imageUrl} alt={ad.name} className="h-auto w-full" loading="lazy" />
        </a>
      ))}
    </>
  );
}
