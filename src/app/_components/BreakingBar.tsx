import Link from "next/link";
import { Zap } from "lucide-react";
import { getBreaking } from "@/lib/touba-infos";

/**
 * Bandeau « DERNIÈRE MINUTE ».
 * (Dans une future version, l'activation/désactivation se pilotera depuis
 * l'administration ; ici le bandeau s'affiche s'il existe des articles
 * marqués « breaking ».)
 */
export default function BreakingBar() {
  const breaking = getBreaking();
  if (breaking.length === 0) return null;

  const items = [...breaking, ...breaking];

  return (
    <div className="flex items-stretch overflow-hidden border-b border-neutral-200 bg-white text-sm">
      <span className="flex flex-shrink-0 items-center gap-1.5 bg-red-600 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-white sm:px-4">
        <Zap size={13} className="fill-current" />
        <span className="hidden sm:inline">Dernière minute</span>
        <span className="sm:hidden">Direct</span>
      </span>
      <div className="relative flex flex-1 items-center overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-2">
          {items.map((a, i) => (
            <Link
              key={`${a.id}-${i}`}
              href={`/${a.slug}`}
              className="mx-6 font-medium text-neutral-700 transition-colors hover:text-red-600"
            >
              <span className="mr-2 font-bold text-red-600">●</span>
              {a.titre}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
