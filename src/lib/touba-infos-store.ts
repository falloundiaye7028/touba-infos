// ============================================================================
//  TOUBA INFOS — Store de contenu (source de vérité du CMS)
//  Dual-backend :
//   • PostgreSQL via Prisma quand DATABASE_URL est défini (production) ;
//   • fichier `data/…json` + cache mémoire sinon (dev/local).
//  Interface identique dans les deux cas ; amorcé depuis ARTICLES_INFO.
// ============================================================================

import { cache as reactCache } from "react";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "./db";
import {
  ARTICLES_INFO,
  type ArticleInfo,
  type CategorieInfo,
  type GenreInfo,
  type StatutInfo,
} from "./touba-infos";

const hasDb = !!process.env.DATABASE_URL;
const DATA_FILE = path.join(process.cwd(), "data", "touba-infos-articles.json");

// ── Amorçage ────────────────────────────────────────────────────────────────
function seed(): ArticleInfo[] {
  return ARTICLES_INFO.map((a) => ({ ...a, statut: a.statut ?? "publie" }));
}

// ── Backend fichier / mémoire ────────────────────────────────────────────────
let fileCache: ArticleInfo[] | null = null;

async function loadFile(): Promise<ArticleInfo[]> {
  if (fileCache) return fileCache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as ArticleInfo[];
    fileCache = Array.isArray(parsed) && parsed.length ? parsed : seed();
  } catch {
    fileCache = seed();
    void persistFile();
  }
  return fileCache;
}

async function persistFile(): Promise<void> {
  if (!fileCache) return;
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(fileCache, null, 2), "utf8");
  } catch {
    /* FS lecture seule */
  }
}

// ── Backend Prisma ───────────────────────────────────────────────────────────
type Row = Awaited<ReturnType<typeof prisma.infoArticle.findFirst>>;

function rowToArticle(r: NonNullable<Row>): ArticleInfo {
  return {
    id: r.id,
    slug: r.slug,
    titre: r.titre,
    sousTitre: r.sousTitre,
    extrait: r.extrait,
    categorie: r.categorie as CategorieInfo,
    genre: r.genre as GenreInfo,
    statut: r.statut as StatutInfo,
    auteur: r.auteur,
    date: r.date.toISOString(),
    miseAJour: r.miseAJour ? r.miseAJour.toISOString() : undefined,
    tempsLecture: r.tempsLecture,
    imageEmoji: r.imageEmoji,
    imageGradient: r.imageGradient,
    imageUrl: r.imageUrl ?? undefined,
    imageFocalX: r.imageFocalX,
    imageFocalY: r.imageFocalY,
    credit: r.credit ?? undefined,
    legende: r.legende ?? undefined,
    alaUne: r.alaUne,
    breaking: r.breaking,
    epingle: r.epingle,
    vues: r.vues,
    tags: r.tags,
    contenu: r.contenu,
    youtubeId: r.youtubeId ?? undefined,
  };
}

function toDb(a: ArticleInfo) {
  return {
    slug: a.slug,
    titre: a.titre,
    sousTitre: a.sousTitre,
    extrait: a.extrait,
    categorie: a.categorie,
    genre: a.genre,
    statut: a.statut ?? "publie",
    auteur: a.auteur,
    date: new Date(a.date),
    miseAJour: a.miseAJour ? new Date(a.miseAJour) : null,
    tempsLecture: a.tempsLecture,
    imageEmoji: a.imageEmoji,
    imageGradient: a.imageGradient,
    imageUrl: a.imageUrl ?? null,
    imageFocalX: a.imageFocalX ?? 50,
    imageFocalY: a.imageFocalY ?? 50,
    credit: a.credit ?? null,
    legende: a.legende ?? null,
    alaUne: a.alaUne,
    breaking: a.breaking,
    epingle: a.epingle ?? false,
    vues: a.vues,
    tags: a.tags,
    contenu: a.contenu,
    youtubeId: a.youtubeId ?? null,
  };
}

let dbSeeded = false;
async function ensureSeededDb(): Promise<void> {
  if (dbSeeded) return;
  try {
    const n = await prisma.infoArticle.count();
    if (n === 0) {
      await prisma.infoArticle.createMany({
        data: seed().map((a) => ({ id: a.id, ...toDb(a) })),
        skipDuplicates: true,
      });
    }
    dbSeeded = true;
  } catch {
    /* DB indisponible : ne pas bloquer le rendu */
  }
}

// ── Lecture unifiée (mémoïsée par rendu) ─────────────────────────────────────
const loadAll = reactCache(async (): Promise<ArticleInfo[]> => {
  if (hasDb) {
    await ensureSeededDb();
    const rows = await prisma.infoArticle.findMany();
    return rows.length ? rows.map(rowToArticle) : seed();
  }
  return loadFile();
});

// ── Tri & visibilité ────────────────────────────────────────────────────────
const byDate = (a: ArticleInfo, b: ArticleInfo) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

function estPublic(a: ArticleInfo): boolean {
  return (a.statut ?? "publie") === "publie";
}

// ════════════════════════════════════════════════════════════════════════════
//  Lecture publique
// ════════════════════════════════════════════════════════════════════════════
export async function getArticlesTries(): Promise<ArticleInfo[]> {
  return (await loadAll()).filter(estPublic).sort(byDate);
}

export async function getUne(): Promise<ArticleInfo | undefined> {
  const pub = await getArticlesTries();
  return pub.find((a) => a.alaUne) ?? pub[0];
}

export async function getPlusLus(n = 5): Promise<ArticleInfo[]> {
  return (await getArticlesTries())
    .slice()
    .sort((a, b) => b.vues - a.vues)
    .slice(0, n);
}

export async function getDernieres(n = 6): Promise<ArticleInfo[]> {
  return (await getArticlesTries()).slice(0, n);
}

export async function getArticleInfoBySlug(
  slug: string,
): Promise<ArticleInfo | undefined> {
  return (await getArticlesTries()).find((a) => a.slug === slug);
}

export async function getArticlesInfoByCategorie(
  categorie: CategorieInfo,
): Promise<ArticleInfo[]> {
  return (await getArticlesTries()).filter((a) => a.categorie === categorie);
}

export async function getArticlesInfoByGenre(
  genre: GenreInfo,
): Promise<ArticleInfo[]> {
  return (await getArticlesTries()).filter((a) => a.genre === genre);
}

export async function getArticlesInfoSimilaires(
  article: ArticleInfo,
): Promise<ArticleInfo[]> {
  const pub = (await getArticlesTries()).filter((a) => a.id !== article.id);
  const meme = pub.filter((a) => a.categorie === article.categorie);
  const autres = pub.filter((a) => a.categorie !== article.categorie);
  return [...meme, ...autres].slice(0, 4);
}

export async function getBreaking(): Promise<ArticleInfo[]> {
  return (await getArticlesTries()).filter((a) => a.breaking);
}

export async function getByTag(tag: string): Promise<ArticleInfo[]> {
  return (await getArticlesTries()).filter((a) => a.tags.includes(tag));
}

export async function rechercheArticles(q: string): Promise<ArticleInfo[]> {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  return (await getArticlesTries()).filter((a) =>
    [a.titre, a.sousTitre, a.extrait, a.auteur, a.categorie, ...a.tags]
      .join(" ")
      .toLowerCase()
      .includes(t),
  );
}

export async function getPublishedSlugs(): Promise<string[]> {
  return (await getArticlesTries()).map((a) => a.slug);
}

// ════════════════════════════════════════════════════════════════════════════
//  Administration
// ════════════════════════════════════════════════════════════════════════════
export async function adminListAll(): Promise<ArticleInfo[]> {
  return (await loadAll()).slice().sort(byDate);
}

export async function adminGetById(
  id: string,
): Promise<ArticleInfo | undefined> {
  return (await loadAll()).find((a) => a.id === id);
}

export interface AdminStats {
  total: number;
  publies: number;
  brouillons: number;
  programmes: number;
  alaUne: number;
  breaking: number;
  vues: number;
}

export async function adminStats(): Promise<AdminStats> {
  const all = await loadAll();
  const st = (a: ArticleInfo) => a.statut ?? "publie";
  return {
    total: all.length,
    publies: all.filter((a) => st(a) === "publie").length,
    brouillons: all.filter((a) => st(a) === "brouillon").length,
    programmes: all.filter((a) => st(a) === "programme").length,
    alaUne: all.filter((a) => a.alaUne).length,
    breaking: all.filter((a) => a.breaking).length,
    vues: all.reduce((s, a) => s + (a.vues || 0), 0),
  };
}

const DIACRITICS = /[̀-ͯ]/g;
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export type ArticleInput = Partial<ArticleInfo> & {
  titre: string;
  categorie: CategorieInfo;
  auteur: string;
};

const GRAD_DEFAUT = "from-green-700 via-emerald-800 to-green-900";

function construireArticle(
  input: ArticleInput,
  existants: ArticleInfo[],
): ArticleInfo {
  const id = String(
    existants.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0) + 1,
  );
  let slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.titre);
  if (!slug) slug = `article-${id}`;
  while (existants.some((a) => a.slug === slug)) slug = `${slug}-${id}`;

  return {
    id,
    slug,
    titre: input.titre,
    sousTitre: input.sousTitre ?? "",
    extrait: input.extrait ?? "",
    categorie: input.categorie,
    genre: input.genre ?? "Actualité",
    statut: input.statut ?? "brouillon",
    auteur: input.auteur,
    date: input.date ?? new Date().toISOString(),
    miseAJour: input.miseAJour,
    tempsLecture: input.tempsLecture ?? "3 min",
    imageEmoji: input.imageEmoji ?? "📰",
    imageGradient: input.imageGradient ?? GRAD_DEFAUT,
    imageUrl: input.imageUrl || undefined,
    imageFocalX: input.imageFocalX ?? 50,
    imageFocalY: input.imageFocalY ?? 50,
    credit: input.credit || undefined,
    legende: input.legende || undefined,
    alaUne: input.alaUne ?? false,
    breaking: input.breaking ?? false,
    epingle: input.epingle ?? false,
    vues: input.vues ?? 0,
    tags: input.tags ?? [],
    contenu: input.contenu ?? "<p></p>",
  };
}

export async function adminCreate(input: ArticleInput): Promise<ArticleInfo> {
  const all = await loadAll();
  const article = construireArticle(input, all);
  if (hasDb) {
    await prisma.infoArticle.create({ data: { id: article.id, ...toDb(article) } });
  } else {
    fileCache = [article, ...all];
    await persistFile();
  }
  return article;
}

export async function adminUpdate(
  id: string,
  patch: Partial<ArticleInfo>,
): Promise<ArticleInfo | undefined> {
  const cur = await adminGetById(id);
  if (!cur) return undefined;
  const next: ArticleInfo = { ...cur, ...patch, id };
  if (patch.slug) next.slug = slugify(patch.slug);

  if (hasDb) {
    await prisma.infoArticle.update({ where: { id }, data: toDb(next) });
  } else {
    const all = await loadFile();
    const idx = all.findIndex((a) => a.id === id);
    if (idx >= 0) all[idx] = next;
    fileCache = all;
    await persistFile();
  }
  return next;
}

export async function adminToggle(
  id: string,
  field: "alaUne" | "breaking" | "epingle",
): Promise<void> {
  const a = await adminGetById(id);
  if (a) await adminUpdate(id, { [field]: !a[field] } as Partial<ArticleInfo>);
}

export async function adminSetStatut(
  id: string,
  statut: ArticleInfo["statut"],
): Promise<void> {
  await adminUpdate(id, { statut });
}

export async function adminDelete(id: string): Promise<void> {
  if (hasDb) {
    await prisma.infoArticle.delete({ where: { id } }).catch(() => {});
  } else {
    const all = await loadFile();
    fileCache = all.filter((a) => a.id !== id);
    await persistFile();
  }
}
