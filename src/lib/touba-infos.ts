// ============================================================================
//  TOUBA INFOS — Couche de données (contenus de démonstration)
//  Média numérique : Touba • Sénégal • Afrique • Monde
//  NB : contenus de DÉMONSTRATION réalistes — ne pas présenter comme réels.
// ============================================================================

/** URL publique du média (domaine dédié). Le média est servi à la racine
 *  de ce domaine via une réécriture dans le middleware. */
export const MEDIA_URL = "https://toubainfos.com";

export type CategorieInfo =
  | "Touba"
  | "Sénégal"
  | "Politique"
  | "Société"
  | "Économie"
  | "Religion"
  | "Magal"
  | "Afrique"
  | "International"
  | "Sport"
  | "Culture"
  | "Santé"
  | "Éducation"
  | "Environnement"
  | "Diaspora"
  | "Technologies";

export type GenreInfo =
  | "Actualité"
  | "Interview"
  | "Analyse"
  | "Tribune"
  | "Reportage"
  | "Communiqué"
  | "Vidéo";

/** Statut éditorial (workflow). Un article sans statut est considéré publié. */
export type StatutInfo = "brouillon" | "publie" | "programme";

export const GENRES_INFO: GenreInfo[] = [
  "Actualité",
  "Interview",
  "Analyse",
  "Tribune",
  "Reportage",
  "Communiqué",
  "Vidéo",
];

export interface AuteurInfo {
  slug: string;
  nom: string;
  role: string;
  bio: string;
  initiales: string;
}

export interface ArticleInfo {
  id: string;
  slug: string;
  titre: string;
  sousTitre: string;
  extrait: string;
  categorie: CategorieInfo;
  genre: GenreInfo;
  /** Statut éditorial. Absent = publié (contenus de démonstration). */
  statut?: StatutInfo;
  auteur: string;
  /** ISO 8601 — sert au SEO (datePublished) et au tri */
  date: string;
  /** Mise à jour éventuelle (ISO) */
  miseAJour?: string;
  tempsLecture: string;
  imageEmoji: string;
  imageGradient: string;
  /** Photo réelle si disponible (sinon tuile éditoriale) */
  imageUrl?: string;
  /** Point focal de recadrage des cartes, de 0 à 100. */
  imageFocalX?: number;
  imageFocalY?: number;
  credit?: string;
  legende?: string;
  alaUne: boolean;
  breaking?: boolean;
  epingle?: boolean;
  vues: number;
  tags: string[];
  contenu: string;
  /** Pour les contenus vidéo — id YouTube éventuel */
  youtubeId?: string;
}

export interface VideoInfo {
  id: string;
  slug: string;
  titre: string;
  categorie: CategorieInfo;
  duree: string;
  date: string;
  imageEmoji: string;
  imageGradient: string;
  youtubeId?: string;
  description: string;
}

// ── Rubriques principales (ordre de navigation) ───────────────────────────
export const CATEGORIES_INFO: CategorieInfo[] = [
  "Touba",
  "Sénégal",
  "Politique",
  "Société",
  "Économie",
  "Religion",
  "Magal",
  "Afrique",
  "International",
  "Sport",
  "Culture",
];

export const CATEGORIES_PLUS: CategorieInfo[] = [
  "Santé",
  "Éducation",
  "Environnement",
  "Diaspora",
  "Technologies",
];

// ── Couleurs des rubriques (chips clairs, sobres) ─────────────────────────
export const COULEURS_CATEGORIES: Record<CategorieInfo, string> = {
  Touba: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
  Sénégal: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  Politique: "bg-slate-100 text-slate-700 ring-1 ring-slate-600/15",
  Société: "bg-teal-50 text-teal-700 ring-1 ring-teal-600/20",
  Économie: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  Religion: "bg-green-100 text-green-800 ring-1 ring-green-700/20",
  Magal: "bg-green-600 text-white",
  Afrique: "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20",
  International: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/20",
  Sport: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  Culture: "bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-600/20",
  Santé: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20",
  Éducation: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20",
  Environnement: "bg-lime-50 text-lime-700 ring-1 ring-lime-600/20",
  Diaspora: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600/20",
  Technologies: "bg-violet-50 text-violet-700 ring-1 ring-violet-600/20",
};

export const EMOJI_CATEGORIES: Record<CategorieInfo, string> = {
  Touba: "🕌",
  Sénégal: "🇸🇳",
  Politique: "🏛️",
  Société: "👥",
  Économie: "📈",
  Religion: "🌙",
  Magal: "🕌",
  Afrique: "🌍",
  International: "🌐",
  Sport: "🏆",
  Culture: "🎭",
  Santé: "🩺",
  Éducation: "🎓",
  Environnement: "🌱",
  Diaspora: "✈️",
  Technologies: "💡",
};

// ── Slugs de rubriques (URLs propres) ─────────────────────────────────────
const SLUG_MAP: Record<CategorieInfo, string> = {
  Touba: "touba",
  Sénégal: "senegal",
  Politique: "politique",
  Société: "societe",
  Économie: "economie",
  Religion: "religion",
  Magal: "magal",
  Afrique: "afrique",
  International: "international",
  Sport: "sport",
  Culture: "culture",
  Santé: "sante",
  Éducation: "education",
  Environnement: "environnement",
  Diaspora: "diaspora",
  Technologies: "technologies",
};

export function slugCategorie(cat: CategorieInfo): string {
  return SLUG_MAP[cat];
}

export function categorieFromSlug(slug: string): CategorieInfo | undefined {
  return (Object.keys(SLUG_MAP) as CategorieInfo[]).find(
    (c) => SLUG_MAP[c] === slug,
  );
}

// ── Genres éditoriaux → slug ──────────────────────────────────────────────
const GENRE_SLUG: Partial<Record<GenreInfo, string>> = {
  Interview: "interviews",
  Analyse: "analyses",
  Tribune: "tribunes",
  Communiqué: "communiques",
  Reportage: "reportages",
};

export function genreFromSlug(slug: string): GenreInfo | undefined {
  const entry = (Object.keys(GENRE_SLUG) as GenreInfo[]).find(
    (g) => GENRE_SLUG[g] === slug,
  );
  return entry;
}

export const GENRE_LABEL_PLURIEL: Record<string, string> = {
  interviews: "Interviews",
  analyses: "Analyses",
  tribunes: "Tribunes",
  communiques: "Communiqués",
  reportages: "Reportages",
};

// ── Auteurs / contributeurs ───────────────────────────────────────────────
export const AUTEURS: AuteurInfo[] = [
  {
    slug: "ibrahima-mbacke-diop",
    nom: "Ibrahima Mbacké Diop",
    role: "Rédacteur en chef",
    bio: "Journaliste, spécialiste des questions religieuses et du fait mouride. Couvre Touba et le Grand Magal depuis plus de dix ans.",
    initiales: "IM",
  },
  {
    slug: "fatou-diallo-kane",
    nom: "Fatou Diallo Kane",
    role: "Grand reporter",
    bio: "Reportages de société, religion et diaspora. Passionnée par les récits de terrain.",
    initiales: "FK",
  },
  {
    slug: "moussa-thiaw",
    nom: "Moussa Thiaw",
    role: "Journaliste politique",
    bio: "Suit l'actualité institutionnelle, l'Assemblée nationale et la vie des partis.",
    initiales: "MT",
  },
  {
    slug: "ndeye-fatou-dieng",
    nom: "Ndèye Fatou Dieng",
    role: "Journaliste économique",
    bio: "Économie, énergie et entrepreneuriat. Décrypte les grands dossiers financiers du Sénégal.",
    initiales: "ND",
  },
  {
    slug: "pape-demba-sarr",
    nom: "Pape Demba Sarr",
    role: "Journaliste sportif",
    bio: "Football, Lions de la Téranga et sport national. Couvre les grandes compétitions africaines.",
    initiales: "PS",
  },
  {
    slug: "aminata-sy-ndiaye",
    nom: "Aminata Sy Ndiaye",
    role: "Correspondante diaspora",
    bio: "Basée entre Dakar et New York, elle suit les communautés sénégalaises à travers le monde.",
    initiales: "AS",
  },
  {
    slug: "cheikh-omar-fall",
    nom: "Cheikh Omar Fall",
    role: "Rédaction Afrique",
    bio: "Géopolitique africaine, Union africaine et intégration régionale.",
    initiales: "CF",
  },
  {
    slug: "mariama-diouf",
    nom: "Mariama Diouf",
    role: "Journaliste culture",
    bio: "Arts, patrimoine et musiques du Sénégal.",
    initiales: "MD",
  },
  {
    slug: "redaction-touba-infos",
    nom: "Rédaction Touba Infos",
    role: "Rédaction",
    bio: "Articles préparés par la rédaction de Touba Infos à partir d'informations vérifiées provenant de plusieurs sources publiques, avec l'appui de l'agent éditorial IA et une relecture humaine.",
    initiales: "TI",
  },
  {
    slug: "mamadou-falilou-ndiaye",
    nom: "Mamadou Falilou Ndiaye",
    role: "Président fondateur de Touba Ça Kanam",
    bio: "Acteur du développement territorial de Touba. Auteur de « Comment Touba peut-elle mieux profiter de l'économie du Magal ? » (Édition 2026), contribution au débat sur l'économie du Grand Magal, l'emploi des jeunes et la modernisation de l'action locale.",
    initiales: "MN",
  },
];

export function getAuteur(nom: string): AuteurInfo | undefined {
  return AUTEURS.find((a) => a.nom === nom);
}

// ── Articles (démonstration) ──────────────────────────────────────────────
/**
 * Le média démarre avec une ligne éditoriale vierge. Les publications sont
 * créées depuis l’espace d’administration, puis affichées lorsqu’elles sont
 * publiées. Aucun contenu de démonstration n’est exposé au public.
 */
export const ARTICLES_INFO: ArticleInfo[] = [];

/** Les vidéos sont gérées par la rédaction avant publication. */
export const VIDEOS_INFO: VideoInfo[] = [];

export const MAGAL = {
  edition: "Grand Magal de Touba 2027",
  // 18 Safar 1449 AH (approximatif) — date évènementielle
  dateISO: "2027-08-02T00:00:00+00:00",
  dateAffichee: "2 août 2027",
};

// ============================================================================
//  Helpers
// ============================================================================

export function formatDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatHeureFr(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateHeureFr(iso: string): string {
  return `${formatDateFr(iso)} à ${formatHeureFr(iso)}`;
}

const parByDate = (a: ArticleInfo, b: ArticleInfo) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

export function getArticlesTries(): ArticleInfo[] {
  return [...ARTICLES_INFO].sort(parByDate);
}

export function getArticleInfoBySlug(slug: string): ArticleInfo | undefined {
  return ARTICLES_INFO.find((a) => a.slug === slug);
}

export function getArticlesInfoByCategorie(
  categorie: CategorieInfo,
): ArticleInfo[] {
  return ARTICLES_INFO.filter((a) => a.categorie === categorie).sort(parByDate);
}

export function getArticlesInfoByGenre(genre: GenreInfo): ArticleInfo[] {
  return ARTICLES_INFO.filter((a) => a.genre === genre).sort(parByDate);
}

export function getArticlesInfoSimilaires(article: ArticleInfo): ArticleInfo[] {
  const memeCat = ARTICLES_INFO.filter(
    (a) => a.id !== article.id && a.categorie === article.categorie,
  );
  const complement = ARTICLES_INFO.filter(
    (a) => a.id !== article.id && a.categorie !== article.categorie,
  );
  return [...memeCat, ...complement].slice(0, 4);
}

export function getBreaking(): ArticleInfo[] {
  return ARTICLES_INFO.filter((a) => a.breaking).sort(parByDate);
}

export function getUne(): ArticleInfo | undefined {
  return ARTICLES_INFO.find((a) => a.alaUne) ?? getArticlesTries()[0];
}

export function getPlusLus(n = 5): ArticleInfo[] {
  return [...ARTICLES_INFO].sort((a, b) => b.vues - a.vues).slice(0, n);
}

export function getDernieres(n = 6): ArticleInfo[] {
  return getArticlesTries().slice(0, n);
}

export function rechercheArticles(q: string): ArticleInfo[] {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  return getArticlesTries().filter((a) =>
    [a.titre, a.sousTitre, a.extrait, a.auteur, a.categorie, ...a.tags]
      .join(" ")
      .toLowerCase()
      .includes(t),
  );
}
