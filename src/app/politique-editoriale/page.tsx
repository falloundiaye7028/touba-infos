import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique éditoriale, mentions légales & confidentialité",
  description:
    "Charte éditoriale de Touba Infos : vérification des informations, traitement des sources, corrections, indépendance, mentions légales, confidentialité et cookies.",
};

export default function PolitiqueEditorialePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
        Politique éditoriale &amp; mentions
      </h1>
      <p className="mt-2 text-neutral-500">
        La confiance de nos lecteurs est notre bien le plus précieux. Voici les
        règles qui encadrent notre travail.
      </p>
      <div className="mt-4 h-1 w-16 rounded-full bg-green-600" />

      <div className="ti-prose mt-10">
        <h2>Notre engagement éditorial</h2>
        <p>
          Touba Infos est un média numérique d&apos;information générale.
          Nous nous engageons à publier une information vérifiée, équilibrée et
          respectueuse des personnes.
        </p>

        <h2>Vérification des informations</h2>
        <p>
          Toute information est vérifiée et recoupée avant publication. En cas de
          doute, nous préférons différer une publication plutôt que diffuser une
          information non confirmée.
        </p>

        <h2>Traitement des sources</h2>
        <p>
          Nous protégeons nos sources et privilégions les sources identifiées et
          fiables. Les informations sensibles font l&apos;objet d&apos;une
          attention particulière.
        </p>

        <h2>Indépendance</h2>
        <p>
          Notre ligne éditoriale est indépendante. Les contenus commerciaux
          (publicité, articles sponsorisés) sont toujours clairement identifiés
          et distingués de l&apos;information journalistique, par les mentions
          «&nbsp;Partenaire&nbsp;» ou «&nbsp;Contenu sponsorisé&nbsp;».
        </p>

        <h2 id="corrections">Corrections &amp; droit de réponse</h2>
        <p>
          L&apos;erreur est humaine&nbsp;: lorsqu&apos;une inexactitude est
          constatée, nous la corrigeons dans les meilleurs délais et
          l&apos;indiquons de manière transparente («&nbsp;Correction apportée
          le&nbsp;… à&nbsp;…&nbsp;»). Toute personne concernée par un article
          dispose d&apos;un droit de réponse.
        </p>

        <h2 id="confidentialite">Confidentialité &amp; données personnelles</h2>
        <p>
          Nous respectons la vie privée de nos lecteurs. Les données collectées
          (par exemple lors de l&apos;abonnement à la newsletter) servent
          uniquement aux finalités annoncées et ne sont pas cédées à des tiers.
          Chaque abonné peut se désinscrire à tout moment.
        </p>

        <h2 id="cookies">Cookies</h2>
        <p>
          Le site peut utiliser des cookies techniques et de mesure d&apos;audience
          respectueux de la vie privée. Vous pouvez configurer votre navigateur
          pour les limiter.
        </p>

        <h2 id="mentions">Mentions légales</h2>
        <p>
          <strong>Éditeur&nbsp;:</strong> Touba Infos — un projet de
          l&apos;Agence Touba Visuel, Touba, Sénégal.
          <br />
          <strong>Contact&nbsp;:</strong> toubainfoshd@gmail.com · +221 76 800 17 17.
          <br />
          <strong>Hébergement&nbsp;:</strong> plateforme d&apos;hébergement web
          professionnelle.
        </p>

        <p className="text-sm text-neutral-400">
          Cette page constitue un cadre de démonstration et pourra être complétée
          par les mentions légales définitives du média.
        </p>
      </div>
    </div>
  );
}
