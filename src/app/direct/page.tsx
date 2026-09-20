import type { Metadata } from "next";
import Link from "next/link";
import { Radio, Youtube, Facebook, Calendar } from "lucide-react";
import { formatDateFr } from "@/lib/touba-infos";
import { getBreaking } from "@/lib/touba-infos-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "En direct — Touba Infos",
  description:
    "Suivez Touba Infos en direct : YouTube Live, Facebook Live, événements spéciaux et émissions de la rédaction.",
};

const PROGRAMME = [
  { h: "07:00", t: "Revue de presse du matin" },
  { h: "13:00", t: "Le journal de la mi-journée" },
  { h: "18:30", t: "Grand rendez-vous de l'actualité" },
  { h: "21:00", t: "Débat & analyses" },
];

export default async function DirectPage() {
  const breaking = (await getBreaking()).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
        </span>
        <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
          En direct
        </h1>
      </div>
      <p className="mt-2 text-neutral-500">
        La chaîne d&apos;information en continu de Touba Infos.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Lecteur */}
        <div className="lg:col-span-2">
          <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-2xl bg-neutral-900 text-center text-white">
            <Radio size={54} className="text-neutral-600" />
            <p className="mt-4 px-6 text-lg font-bold">
              Le direct n&apos;est pas actif pour le moment
            </p>
            <p className="mt-1 max-w-md px-6 text-sm text-neutral-400">
              Lorsqu&apos;une émission ou un événement est en cours, le flux
              vidéo s&apos;affiche automatiquement ici.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-700"
              >
                <Youtube size={16} /> YouTube
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-bold hover:brightness-95"
              >
                <Facebook size={16} /> Facebook
              </a>
            </div>
          </div>

          {/* À la une pendant le direct */}
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-neutral-900">
              À suivre en ce moment
            </h2>
            <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
              {breaking.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/${a.slug}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50"
                  >
                    <span className="font-bold text-red-600">●</span>
                    <span className="font-medium text-neutral-800">{a.titre}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Programme */}
        <aside>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-neutral-900">
              <Calendar size={16} className="text-green-600" /> Grille du jour
            </h2>
            <p className="mt-1 text-xs text-neutral-400">{formatDateFr(new Date().toISOString())}</p>
            <ul className="mt-4 space-y-3">
              {PROGRAMME.map((p) => (
                <li key={p.h} className="flex gap-3 text-sm">
                  <span className="font-mono font-bold text-green-700">{p.h}</span>
                  <span className="text-neutral-700">{p.t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
              Grille de démonstration.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
