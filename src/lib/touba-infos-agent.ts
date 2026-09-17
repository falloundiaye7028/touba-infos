// ============================================================================
//  TOUBA INFOS NEWS AGENT — Données & logique pure (sources, scoring, filtres)
//  Aucune I/O ici (importable partout). La veille (réseau) et la rédaction (IA)
//  sont dans touba-infos-veille.ts et touba-infos-writer.ts.
//
//  Éthique : on ne collecte que des flux publics (titres/résumés RSS) pour
//  DÉTECTER un sujet ; l'article final est réécrit et sourcé. Jamais de
//  copier-coller, jamais de contournement de paywall.
// ============================================================================

import type { CategorieInfo } from "./touba-infos";

export type Fiabilite = "A" | "B" | "C" | "D";

export interface SourceMedia {
  id: string;
  nom: string;
  domaine: string;
  type: string;
  pays: string;
  fiabilite: Fiabilite; // A primaire · B agence/référence · C numérique · D non confirmé
  categorie: string;
  rss?: string;
  actif: boolean;
}

export type StatutSujet =
  | "detecte"
  | "a_verifier"
  | "redige"
  | "rejete";

export interface ScoreDetail {
  importanceNationale: number; // 0-20
  importanceTouba: number; // 0-25
  urgence: number; // 0-15
  fiabilite: number; // 0-20
  interet: number; // 0-10
  nbSources: number; // 0-10
}

export interface SujetDetecte {
  id: string;
  titre: string;
  sourceNom: string;
  sourceId: string;
  url: string;
  resume: string;
  categorie: CategorieInfo;
  score: number;
  scoreDetail: ScoreDetail;
  confiance: Fiabilite;
  nbSources: number;
  autresSources: { nom: string; url: string }[];
  detecteA: string; // ISO
  publieA?: string; // date de l'item source (ISO) si connue
  statut: StatutSujet;
  tags: string[];
  hash: string;
  demo?: boolean;
}

// ── Liste blanche des sources surveillées ─────────────────────────────────
export const SOURCES: SourceMedia[] = [
  // Sénégal — agences & références (B)
  { id: "aps", nom: "APS", domaine: "aps.sn", type: "Agence de presse", pays: "SN", fiabilite: "B", categorie: "Généraliste", rss: "https://aps.sn/feed/", actif: true },
  { id: "lesoleil", nom: "Le Soleil", domaine: "lesoleil.sn", type: "Presse", pays: "SN", fiabilite: "B", categorie: "Généraliste", rss: "https://lesoleil.sn/feed/", actif: true },
  { id: "rts", nom: "RTS", domaine: "rts.sn", type: "Audiovisuel public", pays: "SN", fiabilite: "B", categorie: "Généraliste", actif: true },
  // Sénégal — médias numériques (C)
  { id: "seneweb", nom: "Seneweb", domaine: "seneweb.com", type: "Média numérique", pays: "SN", fiabilite: "C", categorie: "Généraliste", rss: "https://www.seneweb.com/rss/", actif: true },
  { id: "dakaractu", nom: "Dakaractu", domaine: "dakaractu.com", type: "Média numérique", pays: "SN", fiabilite: "C", categorie: "Généraliste", rss: "https://www.dakaractu.com/xml/syndication.rss", actif: true },
  { id: "pressafrik", nom: "PressAfrik", domaine: "pressafrik.com", type: "Média numérique", pays: "SN", fiabilite: "C", categorie: "Généraliste", rss: "https://www.pressafrik.com/xml/syndication.rss", actif: true },
  { id: "senego", nom: "Senego", domaine: "senego.com", type: "Média numérique", pays: "SN", fiabilite: "C", categorie: "Généraliste", rss: "https://senego.com/feed", actif: true },
  { id: "emedia", nom: "Emedia", domaine: "emedia.sn", type: "Média numérique", pays: "SN", fiabilite: "C", categorie: "Généraliste", rss: "https://www.emedia.sn/feed/", actif: true },
  { id: "sudquotidien", nom: "Sud Quotidien", domaine: "sudquotidien.sn", type: "Presse", pays: "SN", fiabilite: "C", categorie: "Généraliste", rss: "https://www.sudquotidien.sn/feed/", actif: true },
  { id: "senenews", nom: "SeneNews", domaine: "senenews.com", type: "Média numérique", pays: "SN", fiabilite: "C", categorie: "Généraliste", rss: "https://www.senenews.com/feed", actif: true },
  // International — références (B)
  { id: "rfi", nom: "RFI Afrique", domaine: "rfi.fr", type: "Radio internationale", pays: "FR", fiabilite: "B", categorie: "Afrique/Monde", rss: "https://www.rfi.fr/fr/afrique/rss", actif: true },
  { id: "france24", nom: "France 24 Afrique", domaine: "france24.com", type: "Chaîne internationale", pays: "FR", fiabilite: "B", categorie: "Afrique/Monde", rss: "https://www.france24.com/fr/afrique/rss", actif: true },
  { id: "bbcafrique", nom: "BBC Afrique", domaine: "bbc.com", type: "Chaîne internationale", pays: "UK", fiabilite: "B", categorie: "Afrique/Monde", rss: "https://www.bbc.com/afrique/index.xml", actif: true },
  { id: "aljazeera", nom: "Al Jazeera", domaine: "aljazeera.com", type: "Chaîne internationale", pays: "QA", fiabilite: "B", categorie: "International", rss: "https://www.aljazeera.com/xml/rss/all.xml", actif: true },
  { id: "reuters", nom: "Reuters", domaine: "reuters.com", type: "Agence de presse", pays: "US", fiabilite: "B", categorie: "International", actif: true },
  { id: "ap", nom: "Associated Press", domaine: "apnews.com", type: "Agence de presse", pays: "US", fiabilite: "B", categorie: "International", actif: true },
  // Sources officielles (A) — surveillées manuellement / à brancher
  { id: "presidence", nom: "Présidence du Sénégal", domaine: "presidence.sn", type: "Institution", pays: "SN", fiabilite: "A", categorie: "Officiel", actif: true },
  { id: "primature", nom: "Primature", domaine: "primature.sn", type: "Institution", pays: "SN", fiabilite: "A", categorie: "Officiel", actif: true },
  { id: "ansd", nom: "ANSD", domaine: "ansd.sn", type: "Institution", pays: "SN", fiabilite: "A", categorie: "Officiel", actif: true },
  { id: "magaltouba", nom: "Comité d'organisation du Magal", domaine: "magal-touba.org", type: "Organisation", pays: "SN", fiabilite: "A", categorie: "Touba", actif: true },
];

export function getSource(id: string): SourceMedia | undefined {
  return SOURCES.find((s) => s.id === id);
}

// ── Filtre prioritaire TOUBA ──────────────────────────────────────────────
const MOTS_TOUBA_FORTS = [
  "touba", "mbacké", "mbacke", "magal", "mouride", "mouridisme",
  "serigne touba", "cheikh ahmadou bamba", "khadim", "khalife général des mourides",
];
const MOTS_TOUBA_SECONDAIRES = [
  "diourbel", "khalife", "daara", "khassaïde", "khassaide", "ndigël", "ndigel",
  "grande mosquée", "cité sainte", "darou", "hizbut",
];

function contientUn(txt: string, mots: string[]): number {
  return mots.filter((m) => txt.includes(m)).length;
}

// ── Détection de catégorie par mots-clés ──────────────────────────────────
const CAT_KEYWORDS: [CategorieInfo, string[]][] = [
  ["Magal", ["magal", "grand magal", "18 safar"]],
  ["Religion", ["mouride", "khalife", "serigne", "mosquée", "islam", "tidiane", "confrérie", "coran", "religieux", "ziara", "gamou"]],
  ["Politique", ["président", "gouvernement", "ministre", "assemblée", "député", "parti", "élection", "sonko", "diomaye", "opposition", "premier ministre", "conseil des ministres"]],
  ["Économie", ["économie", "franc cfa", "fcfa", "bcéao", "budget", "investissement", "entreprise", "emploi", "inflation", "pétrole", "gaz", "der", "impôt", "croissance", "banque"]],
  ["Sport", ["football", "lions", "can ", "match", "sport", "équipe nationale", "basket", "lutte", "champion"]],
  ["Santé", ["santé", "hôpital", "maladie", "épidémie", "médecin", "vaccin", "paludisme"]],
  ["Éducation", ["école", "université", "bac ", "élève", "étudiant", "enseignant", "éducation", "ucad"]],
  ["Environnement", ["environnement", "climat", "inondation", "pollution", "déchets", "assainissement", "eau"]],
  ["Culture", ["culture", "musique", "sabar", "cinéma", "art", "patrimoine", "festival", "unesco"]],
  ["Technologies", ["numérique", "intelligence artificielle", "startup", "technologie", "internet", "télécom"]],
  ["Diaspora", ["diaspora", "émigré", "sénégalais de l'extérieur"]],
  ["Afrique", ["afrique", "cedeao", "union africaine", "sahel", "mali", "guinée", "côte d'ivoire"]],
  ["Société", ["société", "famille", "jeunes", "femmes", "social", "accident", "sécurité", "justice", "tribunal"]],
  ["International", ["international", "monde", "onu", "états-unis", "france", "europe", "gaza", "ukraine"]],
];

export function detecterCategorie(titre: string, resume: string): CategorieInfo {
  const t = `${titre} ${resume}`.toLowerCase();
  if (contientUn(t, MOTS_TOUBA_FORTS) > 0 && !t.includes("magal")) return "Touba";
  for (const [cat, mots] of CAT_KEYWORDS) {
    if (mots.some((m) => t.includes(m))) return cat;
  }
  return "Sénégal";
}

export function detecterTags(titre: string, resume: string): string[] {
  const t = `${titre} ${resume}`.toLowerCase();
  const tags = new Set<string>();
  if (contientUn(t, MOTS_TOUBA_FORTS.concat(MOTS_TOUBA_SECONDAIRES)) > 0) tags.add("Touba");
  if (t.includes("magal")) tags.add("Magal");
  if (t.includes("mouride") || t.includes("khalife")) tags.add("Mouridisme");
  if (t.includes("économie") || t.includes("fcfa")) tags.add("Économie");
  if (t.includes("gouvernement") || t.includes("ministre")) tags.add("Gouvernement");
  return Array.from(tags).slice(0, 5);
}

// ── Scoring 0-100 ─────────────────────────────────────────────────────────
const FIAB_POINTS: Record<Fiabilite, number> = { A: 20, B: 16, C: 11, D: 4 };

function urgenceDepuis(publieA?: string): number {
  if (!publieA) return 6;
  const age = Date.now() - new Date(publieA).getTime();
  const h = age / 3_600_000;
  if (h < 1) return 15;
  if (h < 6) return 12;
  if (h < 24) return 8;
  if (h < 72) return 4;
  return 1;
}

export function scorerSujet(params: {
  titre: string;
  resume: string;
  categorie: CategorieInfo;
  fiabilite: Fiabilite;
  publieA?: string;
  nbSources: number;
}): { score: number; detail: ScoreDetail } {
  const t = `${params.titre} ${params.resume}`.toLowerCase();

  // Importance Touba (0-25)
  const forts = contientUn(t, MOTS_TOUBA_FORTS);
  const secs = contientUn(t, MOTS_TOUBA_SECONDAIRES);
  const importanceTouba = Math.min(25, forts * 13 + secs * 6);

  // Importance nationale (0-20)
  const nat = ["président", "gouvernement", "ministre", "assemblée", "sénégal", "national", "état"];
  const importanceNationale = Math.min(20, contientUn(t, nat) * 7 + (params.categorie === "Politique" || params.categorie === "Économie" ? 6 : 3));

  // Urgence (0-15)
  const urgence = urgenceDepuis(params.publieA);

  // Fiabilité (0-20)
  const fiabilite = FIAB_POINTS[params.fiabilite];

  // Intérêt lecteurs (0-10)
  const interetCat: Partial<Record<CategorieInfo, number>> = {
    Magal: 10, Touba: 10, Religion: 8, Politique: 8, Sport: 7, Économie: 6, Société: 6,
  };
  const interet = interetCat[params.categorie] ?? 4;

  // Nb sources indépendantes (0-10)
  const nbSources = Math.min(10, params.nbSources * 3);

  const detail: ScoreDetail = {
    importanceNationale,
    importanceTouba,
    urgence,
    fiabilite,
    interet,
    nbSources,
  };
  const score = Math.round(
    importanceNationale + importanceTouba + urgence + fiabilite + interet + nbSources,
  );
  return { score: Math.min(100, score), detail };
}

export function niveauScore(score: number): { label: string; cls: string } {
  if (score >= 80) return { label: "Priorité élevée", cls: "bg-red-100 text-red-700" };
  if (score >= 60) return { label: "Important", cls: "bg-amber-100 text-amber-700" };
  if (score >= 40) return { label: "À examiner", cls: "bg-sky-100 text-sky-700" };
  return { label: "Faible", cls: "bg-neutral-100 text-neutral-500" };
}

/** Sujet « sensible » : en mode assisté, il reste en brouillon pour relecture. */
export function estSensible(categorie: CategorieInfo, tags: string[]): boolean {
  const cats: CategorieInfo[] = [
    "Politique",
    "Religion",
    "Société",
    "International",
    "Afrique",
  ];
  if (cats.includes(categorie)) return true;
  const kw = [
    "décès", "deces", "nécrologie", "necrologie", "justice", "tribunal",
    "arrestation", "accusation", "mort", "conflit", "sécurité",
  ];
  return tags.some((t) => kw.includes(t.toLowerCase()));
}

/** Nécessite une validation humaine obligatoire (jamais d'auto-publication). */
export function exigeValidationHumaine(categorie: CategorieInfo): boolean {
  return [
    "Politique", "Société", "Religion", "International", "Afrique", "Magal", "Touba",
    "Économie", "Santé", "Sport", "Culture", "Éducation", "Environnement", "Diaspora", "Sénégal",
  ].includes(categorie);
}

// ── Utilitaires ───────────────────────────────────────────────────────────
export function normaliserTitre(titre: string): string {
  return titre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hashChaine(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

/** Similarité de titres (Jaccard sur mots) pour le clustering / dédup. */
export function similariteTitre(a: string, b: string): number {
  const sa = new Set(normaliserTitre(a).split(" ").filter((w) => w.length > 3));
  const sb = new Set(normaliserTitre(b).split(" ").filter((w) => w.length > 3));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  sa.forEach((w) => { if (sb.has(w)) inter++; });
  return inter / (sa.size + sb.size - inter);
}

// ── Sujets de démonstration (repli si la veille réseau échoue) ────────────
export function sujetsDemo(): Omit<SujetDetecte, "id" | "hash" | "detecteA">[] {
  const now = Date.now();
  const iso = (hAgo: number) => new Date(now - hAgo * 3_600_000).toISOString();
  const base = [
    {
      titre: "Grand Magal de Touba : le Comité d'organisation précise le dispositif de sécurité",
      sourceNom: "APS", sourceId: "aps", url: "https://aps.sn/",
      resume: "Le Comité d'organisation du Grand Magal a présenté les mesures de sécurité et de circulation pour l'édition à venir.",
      categorie: "Magal" as CategorieInfo, fiabilite: "B" as Fiabilite, publieA: iso(2), nbSources: 3,
    },
    {
      titre: "Économie : nouvelle étude sur l'impact du Grand Magal sur les recettes locales",
      sourceNom: "Le Soleil", sourceId: "lesoleil", url: "https://lesoleil.sn/",
      resume: "Une étude évalue l'impact économique du Magal et les pistes de rétention de la valeur au niveau local.",
      categorie: "Économie" as CategorieInfo, fiabilite: "B" as Fiabilite, publieA: iso(5), nbSources: 2,
    },
    {
      titre: "Sénégal : le gouvernement annonce un programme pour l'emploi des jeunes",
      sourceNom: "Seneweb", sourceId: "seneweb", url: "https://www.seneweb.com/",
      resume: "Un nouveau dispositif d'appui à l'emploi des jeunes a été annoncé par les autorités.",
      categorie: "Politique" as CategorieInfo, fiabilite: "C" as Fiabilite, publieA: iso(8), nbSources: 4,
    },
    {
      titre: "Touba : les travaux d'assainissement s'intensifient avant le Magal",
      sourceNom: "Dakaractu", sourceId: "dakaractu", url: "https://www.dakaractu.com/",
      resume: "Les services techniques renforcent la collecte des déchets et le curage des canaux dans la cité sainte.",
      categorie: "Touba" as CategorieInfo, fiabilite: "C" as Fiabilite, publieA: iso(11), nbSources: 2,
    },
    {
      titre: "CAN 2027 : la sélection nationale poursuit sa préparation",
      sourceNom: "RFI Afrique", sourceId: "rfi", url: "https://www.rfi.fr/fr/afrique/",
      resume: "Les Lions poursuivent leur préparation en vue de la prochaine Coupe d'Afrique des nations.",
      categorie: "Sport" as CategorieInfo, fiabilite: "B" as Fiabilite, publieA: iso(20), nbSources: 3,
    },
    {
      titre: "Afrique de l'Ouest : la CEDEAO se réunit sur l'intégration économique",
      sourceNom: "France 24 Afrique", sourceId: "france24", url: "https://www.france24.com/fr/afrique/",
      resume: "Les États membres examinent des mesures de facilitation des échanges et de libre circulation.",
      categorie: "Afrique" as CategorieInfo, fiabilite: "B" as Fiabilite, publieA: iso(28), nbSources: 2,
    },
  ];
  return base.map((b) => {
    const { score, detail } = scorerSujet({
      titre: b.titre, resume: b.resume, categorie: b.categorie,
      fiabilite: b.fiabilite, publieA: b.publieA, nbSources: b.nbSources,
    });
    return {
      ...b,
      score,
      scoreDetail: detail,
      confiance: b.fiabilite,
      autresSources: [],
      tags: detecterTags(b.titre, b.resume),
      statut: "detecte" as StatutSujet,
      demo: true,
    };
  });
}
