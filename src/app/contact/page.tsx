import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle, AlertTriangle } from "lucide-react";
import ContactForm from "../_components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez la rédaction de Touba Infos : partenariats, publicité, signalement d'information, demande d'interview ou rectification.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
        Contact
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-500">
        Une question, une information, une proposition&nbsp;? Écrivez à la
        rédaction de Touba Infos.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        <aside className="space-y-4">
          <InfoCard Icon={Phone} title="Téléphone" value="+221 76 800 17 17" href="tel:+221768001717" />
          <InfoCard Icon={Mail} title="E-mail" value="toubainfoshd@gmail.com" href="mailto:toubainfoshd@gmail.com" />
          <InfoCard Icon={MapPin} title="Adresse" value="Touba, Sénégal" />
          <a
            href="https://wa.me/221768001717"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-[#25D366] p-4 text-white transition hover:brightness-95"
          >
            <MessageCircle size={22} />
            <div>
              <p className="text-sm font-black">WhatsApp</p>
              <p className="text-xs text-white/90">Réponse rapide de la rédaction</p>
            </div>
          </a>
        </aside>
      </div>

      {/* Alerter la rédaction */}
      <section id="alerte" className="mt-14 scroll-mt-32 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-neutral-900">
              Vous avez une information&nbsp;?
            </h2>
            <p className="mt-1 max-w-2xl text-neutral-600">
              Envoyez-nous vos textes, photos, vidéos ou documents. Toute
              information transmise à Touba Infos fait l&apos;objet d&apos;une
              <strong> vérification rigoureuse avant publication</strong>. Vous
              pouvez rester anonyme.
            </p>
            <a
              href="https://wa.me/221768001717?text=Bonjour%20Touba%20Infos%2C%20j%27ai%20une%20information%20%C3%A0%20vous%20transmettre."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
            >
              <MessageCircle size={16} /> Alerter la rédaction
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  Icon,
  title,
  value,
  href,
}: {
  Icon: React.ElementType;
  title: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-700">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">{title}</p>
        <p className="text-sm font-semibold text-neutral-800">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
