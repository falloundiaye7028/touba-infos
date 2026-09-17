import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const SLUG = "locales-2027-ce-que-changent-reponses-ministere-cena";

export async function GET() {
  const data = {
    titre: "LOCALES 2027 : CE QUE CHANGENT LES RÉPONSES DU MINISTÈRE ET DE LA CENA",
    sousTitre: "L’absence actuelle de décret ne constitue pas, à ce stade, une carence de l’administration. Mais le calendrier des territoriales reste juridiquement encadré.",
    extrait: "Les réponses du ministère de l’Intérieur et de la CENA clarifient le débat sur les élections territoriales de 2027 : marge de calendrier, cinquième année du mandat et limites institutionnelles.",
    categorie: "Politique",
    genre: "Analyse",
    statut: "publie",
    auteur: "Rédaction Touba Infos",
    date: new Date("2026-09-04T23:07:00.000Z"),
    miseAJour: new Date("2026-09-04T23:07:00.000Z"),
    tempsLecture: "3 min",
    imageEmoji: "🗳️",
    imageGradient: "from-green-800 via-emerald-900 to-neutral-950",
    imageUrl: "/images/touba-infos/locales-2027-ministere-cena.png",
    imageFocalX: 50,
    imageFocalY: 50,
    credit: "Touba Infos",
    legende: "Locales 2027 : réponses du ministère de l’Intérieur et de la CENA",
    alaUne: false,
    breaking: false,
    epingle: false,
    tags: ["Locales 2027", "CENA", "Ministère de l’Intérieur", "Élections territoriales", "Code électoral"],
    contenu: `<p>Le débat sur les prochaines élections départementales et municipales vient de prendre une nouvelle dimension.</p>

<p>Dans une correspondance du <strong>28 août 2026</strong>, le ministère de l’Intérieur répond à une saisine de PASTEF concernant l’absence de décret fixant la date du scrutin. Le <strong>31 août</strong>, la Commission électorale nationale autonome (CENA) apporte à son tour des précisions sur l’étendue de ses compétences.</p>

<p>Ces documents permettent désormais de mieux comprendre ce que dit réellement le droit.</p>

<h2>Pas de « carence » pour le moment</h2>

<p>Le ministère s’appuie notamment sur les articles <strong>L.63, L.236 et L.269 du Code électoral</strong>, ainsi que sur l’ordonnance n°33 du 27 août 2026 de la Cour suprême telle qu’elle est citée dans sa réponse.</p>

<p>Son raisonnement est simple : si un décret doit effectivement fixer la date du scrutin, les dispositions relatives aux élections départementales et municipales ne fixent pas un délai précis imposant que ce décret soit déjà publié aujourd’hui.</p>

<p>L’absence actuelle de date ne peut donc pas, selon cette interprétation, être automatiquement assimilée à une carence de l’administration.</p>

<p>Mais cela ne donne pas pour autant au Gouvernement une liberté totale.</p>

<h2>La « cinquième année du mandat » devient la vraie limite</h2>

<p>Le point le plus important concerne les articles <strong>L.236 et L.269</strong>.</p>

<p>En principe, les élections territoriales ont lieu dans les trente jours précédant l’expiration de la cinquième année du mandat. Lorsque les circonstances l’exigent, une exception à cette période peut être envisagée.</p>

<p>Mais le Code ajoute une limite essentielle : <strong>les élections doivent avoir lieu dans la cinquième année du mandat.</strong></p>

<p>Autrement dit, le Gouvernement peut disposer d’une certaine marge pour choisir la date, mais cette marge ne doit pas être confondue avec un pouvoir de proroger librement les mandats des élus locaux.</p>

<h2>La CENA précise également son rôle</h2>

<p>PASTEF demandait à la CENA d’utiliser ses pouvoirs de contrôle et d’injonction.</p>

<p>La Commission répond que son contrôle commence avec les opérations électorales, notamment la révision des listes, et se poursuit jusqu’à la proclamation provisoire des résultats. Selon elle, la fixation de la date du scrutin intervient en amont de cette phase.</p>

<p>La CENA ne dit donc pas que le calendrier peut être ignoré. Elle considère simplement qu’à ce stade, elle ne peut pas se substituer à l’autorité chargée de fixer la date.</p>

<h2>Et le couplage avec d’éventuelles législatives ?</h2>

<p>En cas de dissolution de l’Assemblée nationale en décembre 2026, l’article 87 de la Constitution impose l’organisation de nouvelles législatives <strong>entre 60 et 90 jours après le décret de dissolution</strong>.</p>

<p>La question devient donc très précise : <strong>la cinquième année des mandats locaux permet-elle d’aller assez loin dans le calendrier pour faire coïncider les territoriales avec ces législatives ?</strong></p>

<p>Les documents du ministère et de la CENA ne répondent pas encore définitivement à cette question.</p>

<h2>Notre analyse</h2>

<p>Les nouveaux documents clarifient le débat sans le fermer.</p>

<p><strong>Le Gouvernement n’est pas encore considéré comme juridiquement en retard.</strong> Mais il ne dispose pas non plus d’un pouvoir illimité pour repousser les élections.</p>

<p>Le véritable enjeu devient désormais celui-ci : <strong>jusqu’où va juridiquement la cinquième année du mandat des élus locaux ?</strong></p>

<p>La réponse pourrait déterminer non seulement la date des territoriales, mais aussi la possibilité ou non d’un couplage avec des élections législatives anticipées en 2027.</p>

<p><em>Touba Infos — Analyse institutionnelle et électorale. Documents examinés : réponses du ministère de l’Intérieur du 28 août 2026 et de la CENA du 31 août 2026 ; ordonnance n°33 de la Cour suprême du 27 août 2026 telle que citée dans ces correspondances ; Code électoral et Constitution du Sénégal.</em></p>`
  };

  const article = await prisma.infoArticle.upsert({
    where: { slug: SLUG },
    update: data,
    create: {
      id: "locales-2027-docs-20260904",
      slug: SLUG,
      vues: 0,
      ...data,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/touba-infos", "layout");
  revalidatePath(`/touba-infos/${SLUG}`);

  return NextResponse.json({
    ok: true,
    slug: article.slug,
    url: `/touba-infos/${article.slug}`,
    imageUrl: article.imageUrl,
  });
}
