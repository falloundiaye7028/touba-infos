// ============================================================================
//  TOUBA INFOS NEWS AGENT — Moteur de veille (serveur)
//  Récupère les flux RSS publics des sources actives, détecte et score les
//  sujets, regroupe les doublons inter-médias, puis alimente le store.
// ============================================================================

import {
  SOURCES,
  type SourceMedia,
  type SujetDetecte,
  scorerSujet,
  detecterCategorie,
  detecterTags,
  similariteTitre,
} from "./touba-infos-agent";
import {
  ajouterSujets,
  enregistrerVeille,
  type DerniereVeille,
} from "./touba-infos-agent-store";

interface FeedItem {
  title: string;
  link: string;
  pubDate?: string;
  description: string;
}

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string | undefined {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : undefined;
}

function parseFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const blocks =
    xml.match(/<item[\s\S]*?<\/item>/gi) ||
    xml.match(/<entry[\s\S]*?<\/entry>/gi) ||
    [];
  for (const b of blocks.slice(0, 10)) {
    const title = tag(b, "title");
    if (!title) continue;
    let link = tag(b, "link") || "";
    if (!link) {
      const m = b.match(/<link[^>]*href="([^"]+)"/i);
      if (m) link = m[1];
    }
    const pubDate = tag(b, "pubDate") || tag(b, "updated") || tag(b, "published");
    const description = tag(b, "description") || tag(b, "summary") || "";
    items.push({ title, link, pubDate, description: description.slice(0, 400) });
  }
  return items;
}

async function fetchFeed(source: SourceMedia): Promise<FeedItem[]> {
  if (!source.rss) return [];
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(source.rss, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "ToubaInfosNewsAgent/1.0 (+https://toubainfos.com)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseFeed(xml);
  } finally {
    clearTimeout(to);
  }
}

interface Brut extends FeedItem {
  source: SourceMedia;
}

function clusteriser(bruts: Brut[]): Omit<SujetDetecte, "id" | "hash" | "detecteA">[] {
  const used = new Set<number>();
  const sujets: Omit<SujetDetecte, "id" | "hash" | "detecteA">[] = [];
  const rang = { A: 3, B: 2, C: 1, D: 0 } as const;

  for (let i = 0; i < bruts.length; i++) {
    if (used.has(i)) continue;
    const cluster = [bruts[i]];
    used.add(i);
    for (let j = i + 1; j < bruts.length; j++) {
      if (used.has(j)) continue;
      if (similariteTitre(bruts[i].title, bruts[j].title) > 0.5) {
        cluster.push(bruts[j]);
        used.add(j);
      }
    }
    const rep = cluster.reduce((best, x) =>
      rang[x.source.fiabilite] > rang[best.source.fiabilite] ? x : best,
    );
    const sourcesDistinctes = new Set(cluster.map((c) => c.source.id));
    const nbSources = sourcesDistinctes.size;
    const resume = decode(rep.description).slice(0, 300);
    const categorie = detecterCategorie(rep.title, resume);
    const { score, detail } = scorerSujet({
      titre: rep.title,
      resume,
      categorie,
      fiabilite: rep.source.fiabilite,
      publieA: rep.pubDate ? new Date(rep.pubDate).toISOString() : undefined,
      nbSources,
    });
    sujets.push({
      titre: rep.title,
      sourceNom: rep.source.nom,
      sourceId: rep.source.id,
      url: rep.link,
      resume,
      categorie,
      score,
      scoreDetail: detail,
      confiance: rep.source.fiabilite,
      nbSources,
      autresSources: cluster
        .filter((c) => c !== rep)
        .map((c) => ({ nom: c.source.nom, url: c.link })),
      publieA: rep.pubDate ? new Date(rep.pubDate).toISOString() : undefined,
      statut: "detecte",
      tags: detecterTags(rep.title, resume),
    });
  }
  return sujets;
}

export async function runVeille(): Promise<DerniereVeille> {
  const actives = SOURCES.filter((s) => s.actif && s.rss);
  const erreurs: string[] = [];
  const bruts: Brut[] = [];

  const results = await Promise.allSettled(
    actives.map(async (s) => ({ s, items: await fetchFeed(s) })),
  );
  for (const r of results) {
    if (r.status === "fulfilled") {
      for (const it of r.value.items) bruts.push({ ...it, source: r.value.s });
    } else {
      erreurs.push(String(r.reason).slice(0, 120));
    }
  }

  const mode: DerniereVeille["mode"] = erreurs.length > 0 ? "mixte" : "reel";
  const candidats = clusteriser(bruts);

  // En production, une panne de flux ne doit jamais créer de faux sujets.
  // Si aucune source n'est disponible, on enregistre simplement une veille vide.
  const nouveaux = candidats.length > 0 ? await ajouterSujets(candidats) : 0;

  const run: DerniereVeille = {
    at: new Date().toISOString(),
    consultees: actives.length,
    detectes: candidats.length,
    nouveaux,
    erreurs: erreurs.slice(0, 8),
    mode,
  };
  await enregistrerVeille(run);
  return run;
}
