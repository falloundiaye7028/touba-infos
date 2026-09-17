import type { Metadata } from "next";
import { Mail, Bell, CalendarClock, Star } from "lucide-react";
import NewsletterForm from "../_components/NewsletterForm";

export const metadata: Metadata = {
  title: "Newsletter — Recevez l'essentiel de l'actualité",
  description:
    "Abonnez-vous à la newsletter de Touba Infos et recevez l'essentiel de l'actualité de Touba, du Sénégal, de l'Afrique et du monde.",
};

const AVANTAGES = [
  { Icon: CalendarClock, t: "L'essentiel chaque jour", d: "Une sélection quotidienne des informations à ne pas manquer." },
  { Icon: Star, t: "Éditions spéciales", d: "Grand Magal de Touba et grands événements." },
  { Icon: Bell, t: "Alertes importantes", d: "Les informations majeures, dès qu'elles tombent." },
];

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-white">
          <Mail size={30} />
        </div>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
          Recevez l&apos;essentiel de l&apos;actualité
        </h1>
        <p className="mt-3 text-lg text-neutral-600">
          Touba, le Sénégal, l&apos;Afrique et le monde — directement dans votre
          boîte mail. Gratuit, et vous vous désabonnez en un clic.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-neutral-200 bg-white p-6">
        <NewsletterForm />
        <p className="mt-3 text-center text-xs text-neutral-400">
          En vous abonnant, vous acceptez de recevoir la newsletter de Touba
          Infos. Consultez notre{" "}
          <a href="/politique-editoriale#confidentialite" className="text-green-700 underline">
            politique de confidentialité
          </a>
          .
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {AVANTAGES.map(({ Icon, t, d }) => (
          <div key={t} className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
            <Icon className="mx-auto text-green-600" size={26} />
            <h2 className="mt-2 font-black text-neutral-900">{t}</h2>
            <p className="mt-1 text-sm text-neutral-500">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
