// ============================================================================
//  TOUBA INFOS NEWS AGENT — Store des sujets détectés (dual-backend)
//   • PostgreSQL via Prisma si DATABASE_URL (production) ;
//   • fichier `data/…json` + mémoire sinon (dev/local).
// ============================================================================

import { promises as fs } from "fs";
import path from "path";
import { prisma } from "./db";
import {
  type SujetDetecte,
  type StatutSujet,
  type Fiabilite,
  type ScoreDetail,
  similariteTitre,
  hashChaine,
  normaliserTitre,
} from "./touba-infos-agent";
import type { CategorieInfo } from "./touba-infos";
import { adminListAll } from "./touba-infos-store";

const hasDb = !!process.env.DATABASE_URL;
const FILE = path.join(process.cwd(), "data", "touba-infos-sujets.json");

export interface DerniereVeille {
  at: string;
  consultees: number;
  detectes: number;
  nouveaux: number;
  erreurs: string[];
  mode: "reel" | "demo" | "mixte";
}

interface AgentState {
  sujets: SujetDetecte[];
  lastRun?: DerniereVeille;
}

// ── Backend fichier ──────────────────────────────────────────────────────────
let fileState: AgentState | null = null;

async function loadFileState(): Promise<AgentState> {
  if (fileState) return fileState;
  try {
    const raw = await fs.readFile(FILE, "utf8");
    fileState = JSON.parse(raw) as AgentState;
    if (!Array.isArray(fileState.sujets)) fileState = { sujets: [] };
  } catch {
    fileState = { sujets: [] };
  }
  return fileState;
}

async function persistFileState(): Promise<void> {
  if (!fileState) return;
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(fileState, null, 2), "utf8");
  } catch {
    /* FS lecture seule */
  }
}

// ── Backend Prisma ───────────────────────────────────────────────────────────
type SujetRow = Awaited<ReturnType<typeof prisma.infoSujet.findFirst>>;

function rowToSujet(r: NonNullable<SujetRow>): SujetDetecte {
  return {
    id: r.id,
    titre: r.titre,
    sourceNom: r.sourceNom,
    sourceId: r.sourceId,
    url: r.url,
    resume: r.resume,
    categorie: r.categorie as CategorieInfo,
    score: r.score,
    scoreDetail: r.scoreDetail as unknown as ScoreDetail,
    confiance: r.confiance as Fiabilite,
    nbSources: r.nbSources,
    autresSources: (r.autresSources as unknown as { nom: string; url: string }[]) ?? [],
    detecteA: r.detecteA.toISOString(),
    publieA: r.publieA ? r.publieA.toISOString() : undefined,
    statut: r.statut as StatutSujet,
    tags: r.tags,
    hash: r.hash,
    demo: r.demo,
  };
}

function sujetToDb(s: SujetDetecte) {
  return {
    id: s.id,
    titre: s.titre,
    sourceNom: s.sourceNom,
    sourceId: s.sourceId,
    url: s.url,
    resume: s.resume,
    categorie: s.categorie,
    score: s.score,
    scoreDetail: s.scoreDetail as object,
    confiance: s.confiance,
    nbSources: s.nbSources,
    autresSources: s.autresSources as object,
    detecteA: new Date(s.detecteA),
    publieA: s.publieA ? new Date(s.publieA) : null,
    statut: s.statut,
    tags: s.tags,
    hash: s.hash,
    demo: s.demo ?? false,
  };
}

// ── Lecture unifiée ──────────────────────────────────────────────────────────
async function loadSujets(): Promise<SujetDetecte[]> {
  if (hasDb) {
    try {
      const rows = await prisma.infoSujet.findMany({ orderBy: { detecteA: "desc" } });
      return rows.map(rowToSujet);
    } catch {
      return [];
    }
  }
  return (await loadFileState()).sujets;
}

export async function listSujets(): Promise<SujetDetecte[]> {
  return (await loadSujets()).sort(
    (a, b) =>
      b.score - a.score ||
      new Date(b.detecteA).getTime() - new Date(a.detecteA).getTime(),
  );
}

export async function getSujet(id: string): Promise<SujetDetecte | undefined> {
  if (hasDb) {
    try {
      const r = await prisma.infoSujet.findUnique({ where: { id } });
      return r ? rowToSujet(r) : undefined;
    } catch {
      return undefined;
    }
  }
  return (await loadFileState()).sujets.find((x) => x.id === id);
}

export async function getDerniereVeille(): Promise<DerniereVeille | undefined> {
  if (hasDb) {
    try {
      const r = await prisma.infoVeilleRun.findFirst({ orderBy: { at: "desc" } });
      if (!r) return undefined;
      return {
        at: r.at.toISOString(),
        consultees: r.consultees,
        detectes: r.detectes,
        nouveaux: r.nouveaux,
        erreurs: r.erreurs,
        mode: r.mode as DerniereVeille["mode"],
      };
    } catch {
      return undefined;
    }
  }
  return (await loadFileState()).lastRun;
}

export async function ajouterSujets(
  candidats: Omit<SujetDetecte, "id" | "hash" | "detecteA">[],
): Promise<number> {
  const existants = await loadSujets();
  const articles = await adminListAll();
  const titresArticles = articles.map((a) => normaliserTitre(a.titre));

  const aInserer: SujetDetecte[] = [];
  for (const c of candidats) {
    const hash = hashChaine(c.url || c.titre);
    if (existants.some((s) => s.hash === hash)) continue;
    if (aInserer.some((s) => s.hash === hash)) continue;
    if (existants.some((s) => similariteTitre(s.titre, c.titre) > 0.6)) continue;
    if (aInserer.some((s) => similariteTitre(s.titre, c.titre) > 0.6)) continue;
    const nt = normaliserTitre(c.titre);
    if (titresArticles.some((t) => similariteTitre(t, nt) > 0.6)) continue;

    aInserer.push({
      ...c,
      id: `${hash}-${Date.now().toString(36)}-${aInserer.length}`,
      hash,
      detecteA: new Date().toISOString(),
    });
  }

  if (aInserer.length === 0) return 0;

  if (hasDb) {
    try {
      await prisma.infoSujet.createMany({
        data: aInserer.map(sujetToDb),
        skipDuplicates: true,
      });
    } catch {
      return 0;
    }
  } else {
    const st = await loadFileState();
    st.sujets = [...aInserer, ...st.sujets].slice(0, 200);
    fileState = st;
    await persistFileState();
  }
  return aInserer.length;
}

export async function setStatutSujet(
  id: string,
  statut: StatutSujet,
): Promise<void> {
  if (hasDb) {
    await prisma.infoSujet.update({ where: { id }, data: { statut } }).catch(() => {});
  } else {
    const st = await loadFileState();
    const s = st.sujets.find((x) => x.id === id);
    if (s) {
      s.statut = statut;
      fileState = st;
      await persistFileState();
    }
  }
}

export async function enregistrerVeille(run: DerniereVeille): Promise<void> {
  if (hasDb) {
    try {
      await prisma.infoVeilleRun.create({
        data: {
          at: new Date(run.at),
          consultees: run.consultees,
          detectes: run.detectes,
          nouveaux: run.nouveaux,
          erreurs: run.erreurs,
          mode: run.mode,
        },
      });
    } catch {
      /* table absente / DB indisponible */
    }
  } else {
    const st = await loadFileState();
    st.lastRun = run;
    fileState = st;
    await persistFileState();
  }
}

export interface StatsAgent {
  total: number;
  prioritaires: number;
  aVerifier: number;
  rediges: number;
  rejetes: number;
}

export async function statsAgent(): Promise<StatsAgent> {
  const sujets = await loadSujets();
  return {
    total: sujets.filter((x) => x.statut === "detecte" || x.statut === "a_verifier").length,
    prioritaires: sujets.filter((x) => x.score >= 80 && x.statut !== "rejete").length,
    aVerifier: sujets.filter((x) => x.statut === "a_verifier").length,
    rediges: sujets.filter((x) => x.statut === "redige").length,
    rejetes: sujets.filter((x) => x.statut === "rejete").length,
  };
}
