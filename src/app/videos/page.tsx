import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle, Radio } from "lucide-react";

export const metadata: Metadata = {
  title: "Touba Infos TV",
  description: "Les formats vidéo de Touba Infos seront publiés prochainement.",
};

export default function VideosPage() {
  return (
    <div className="bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-[58vh] max-w-4xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="rounded-2xl bg-white/10 p-5"><PlayCircle size={46} className="text-green-400" /></div>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-green-300">Touba Infos TV</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Les vidéos arrivent bientôt.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-300">Cette page accueillera les reportages, entretiens et formats vidéo validés par la rédaction. Aucun contenu de démonstration n’est affiché.</p>
        <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-bold text-neutral-950 hover:bg-green-400"><Radio size={17} /> Contacter la rédaction</Link>
      </section>
    </div>
  );
}
