import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Bus,
  Home,
  Shield,
  HeartPulse,
  CalendarDays,
  Landmark,
  Wallet,
} from "lucide-react";
import { MAGAL } from "@/lib/touba-infos";
import { getArticlesInfoByCategorie, getArticlesTries } from "@/lib/touba-infos-store";
import { CardStandard, CardHorizontal, SectionHeading } from "../_components/ui";
import MagalCountdown from "../_components/MagalCountdown";

export const revalidate = 20;

export const metadata: Metadata = {
  title: "Grand Magal de Touba — Dossier spécial",
  description:
    "Dossier spécial Grand Magal de Touba : programme, circulation, transport, hébergement, sécurité, santé, histoire et économie du Magal. Toute l'actualité en continu.",
};

const SERVICES = [
  { Icon: CalendarDays, label: "Programme" },
  { Icon: MapPin, label: "Circulation" },
  { Icon: Bus, label: "Transport" },
  { Icon: Home, label: "Hébergement" },
  { Icon: Shield, label: "Sécurité" },
  { Icon: HeartPulse, label: "Santé" },
  { Icon: Landmark, label: "Histoire" },
  { Icon: Wallet, label: "Économie" },
];

export default async function MagalPage() {
  const magal = await getArticlesInfoByCategorie("Magal");
  const autour = (await getArticlesTries())
    .filter((a) => a.tags.includes("Magal") && a.categorie !== "Magal")
    .slice(0, 4);
  const lead = magal[0];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-700 via-green-800 to-emerald-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
            Dossier spécial
          </span>
          <h1 className="mt-4 text-4xl font-black leading-none tracking-tight sm:text-5xl">
            Grand Magal de Touba
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/80">
            La commémoration du départ en exil de Cheikh Ahmadou Bamba — la plus
            grande manifestation religieuse d&apos;Afrique de l&apos;Ouest.
            Suivez toute l&apos;actualité, en continu.
          </p>

          <div className="mt-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
              {MAGAL.edition} — {MAGAL.dateAffichee}
            </p>
            <MagalCountdown dateISO={MAGAL.dateISO} variant="hero" />
          </div>
        </div>
      </section>

      {/* SERVICES / RACCOURCIS */}
      <section className="border-b border-neutral-100 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-4 lg:grid-cols-8">
          {SERVICES.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white py-4 text-center"
            >
              <Icon size={22} className="text-green-600" />
              <span className="text-xs font-bold text-neutral-700">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* DERNIÈRES INFOS MAGAL */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading titre="Dernières informations" />
        {lead && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="grid gap-5 sm:grid-cols-2">
                {magal.map((a) => (
                  <CardStandard key={a.id} article={a} />
                ))}
              </div>
            </div>
            <aside>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-neutral-900">
                Autour du Magal
              </h3>
              <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 px-4">
                {autour.map((a) => (
                  <CardHorizontal key={a.id} article={a} />
                ))}
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* HISTOIRE */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading titre="Comprendre le Magal" />
          <div className="ti-prose">
            <p>
              Le <strong>Grand Magal de Touba</strong> commémore le départ en
              exil de <strong>Cheikh Ahmadou Bamba Mbacké</strong> au Gabon,
              ordonné par les autorités coloniales françaises en 1895. Célébré le
              18 Safar du calendrier islamique, il rassemble chaque année des
              millions de fidèles mourides venus du Sénégal, d&apos;Afrique et de
              la diaspora mondiale.
            </p>
            <p>
              Reconnu officiellement en 1964, l&apos;événement mobilise
              l&apos;ensemble des familles mourides, les autorités de
              l&apos;État et des milliers de bénévoles autour d&apos;un même
              élan de foi, de partage et de fraternité.
            </p>
          </div>
        </div>
      </section>

      {/* ARCHIVES */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading titre="Archives des éditions" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
            <div
              key={y}
              className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white py-6 text-neutral-700"
            >
              <span className="text-2xl font-black text-green-700">{y}</span>
              <span className="text-xs text-neutral-400">Édition</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-400">
          Les archives complètes seront alimentées au fil des éditions.
        </p>
      </section>
    </div>
  );
}
