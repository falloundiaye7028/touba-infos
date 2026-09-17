import type { Metadata } from "next";
import { Target, Eye, ShieldCheck, Users } from "lucide-react";
import { AUTEURS } from "@/lib/touba-infos";
import { SectionHeading } from "../_components/ui";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Touba Infos, média numérique d'information générale : histoire, vision, mission, ligne éditoriale, valeurs et équipe.",
};

const VALEURS = [
  { Icon: ShieldCheck, t: "Rigueur", d: "Vérification systématique des informations avant publication." },
  { Icon: Eye, t: "Indépendance", d: "Une ligne éditoriale libre, au service du public." },
  { Icon: Users, t: "Proximité", d: "Ancrés à Touba, à l'écoute des populations." },
  { Icon: Target, t: "Ouverture", d: "Du local au global : Sénégal, Afrique et monde." },
];

export default function AProposPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-neutral-100 bg-neutral-50">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-green-700">
            À propos
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
            Le média numérique au cœur de Touba, ouvert sur le monde
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-600">
            Touba Infos est un média numérique d&apos;information générale.
            Partant de Touba, il couvre l&apos;actualité du Sénégal, de
            l&apos;Afrique et du monde&nbsp;: politique, société, économie,
            religion, culture, sport, et le Grand Magal de Touba.
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-7">
            <Target className="text-green-600" size={28} />
            <h2 className="mt-3 text-xl font-black text-neutral-900">Notre mission</h2>
            <p className="mt-2 text-neutral-600">
              Informer avec rigueur et rapidité, mettre en valeur l&apos;actualité
              de Touba et donner aux lecteurs les clés pour comprendre le Sénégal
              et le monde.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-7">
            <Eye className="text-green-600" size={28} />
            <h2 className="mt-3 text-xl font-black text-neutral-900">Notre vision</h2>
            <p className="mt-2 text-neutral-600">
              Faire de Touba Infos une plateforme médiatique de référence pour
              comprendre Touba, suivre le Sénégal et rester connecté au monde.
            </p>
          </div>
        </div>

        {/* Valeurs */}
        <div className="mt-12">
          <SectionHeading titre="Nos valeurs" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALEURS.map(({ Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <Icon className="text-green-600" size={24} />
                <h3 className="mt-2 font-black text-neutral-900">{t}</h3>
                <p className="mt-1 text-sm text-neutral-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section id="equipe" className="scroll-mt-32 border-t border-neutral-100 bg-neutral-50 py-14">
        <div className="mx-auto max-w-5xl px-4">
          <SectionHeading titre="La rédaction" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AUTEURS.map((a) => (
              <div key={a.slug} className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-xl font-black text-white">
                  {a.initiales}
                </div>
                <p className="mt-3 font-black text-neutral-900">{a.nom}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  {a.role}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500">{a.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
