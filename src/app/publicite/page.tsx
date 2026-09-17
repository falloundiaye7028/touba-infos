import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Smartphone,
  Newspaper,
  PlayCircle,
  Megaphone,
  Handshake,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Publicité — Communiquez sur Touba Infos",
  description:
    "Touchez l'audience de Touba Infos : bannières, articles sponsorisés, vidéos, couverture événementielle et partenariats. Demandez une offre commerciale.",
};

const FORMATS = [
  { Icon: Newspaper, t: "Bannières", d: "Haut de page, entre sections, sidebar et in-article." },
  { Icon: Megaphone, t: "Articles sponsorisés", d: "Contenus « Partenaire », clairement identifiés." },
  { Icon: PlayCircle, t: "Vidéos", d: "Pré-roll, capsules et intégrations sur Touba Infos TV." },
  { Icon: Handshake, t: "Partenariats", d: "Couverture événementielle et opérations spéciales." },
];

const STATS = [
  { v: "100 %", l: "Mobile-first" },
  { v: "Touba", l: "Ancrage local fort" },
  { v: "Diaspora", l: "Audience internationale" },
  { v: "Magal", l: "Pic d'audience annuel" },
];

export default function PublicitePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 via-green-800 to-emerald-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-green-200">
            Régie publicitaire
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Communiquez sur Touba Infos
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Associez votre marque à un média de référence, ancré à Touba et
            ouvert sur le Sénégal, l&apos;Afrique et le monde.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-800 transition hover:bg-green-50"
          >
            Demander une offre commerciale <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Stats audience */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
              <p className="text-2xl font-black text-green-700">{s.v}</p>
              <p className="mt-1 text-xs font-semibold text-neutral-500">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formats */}
      <section className="border-y border-neutral-100 bg-neutral-50 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-6 flex items-center gap-2">
            <Smartphone className="text-green-600" size={22} />
            <h2 className="text-xl font-black text-neutral-900">Nos formats</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {FORMATS.map(({ Icon, t, d }) => (
              <div key={t} className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-black text-neutral-900">{t}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
            <Users size={16} className="text-green-600" />
            Publicité et information sont toujours clairement distinguées. Les
            contenus commerciaux portent la mention « Partenaire » ou « Contenu
            sponsorisé ».
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <h2 className="text-2xl font-black text-neutral-900">
          Parlons de votre campagne
        </h2>
        <p className="mt-2 text-neutral-600">
          Notre équipe commerciale vous propose une offre adaptée à vos objectifs.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
          >
            Nous contacter
          </Link>
          <a
            href="https://wa.me/221768001717?text=Bonjour%2C%20je%20souhaite%20communiquer%20sur%20Touba%20Infos."
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
          >
            WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
