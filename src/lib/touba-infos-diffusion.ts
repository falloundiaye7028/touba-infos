// ============================================================================
//  TOUBA INFOS — Diffusion (réseaux sociaux, notification, newsletter)
//  Générateurs par gabarits (déterministes, sans dépendance réseau).
//  Base fiable ; une amélioration IA pourra être branchée ensuite.
// ============================================================================

import { MEDIA_URL, type ArticleInfo, type VideoInfo, type CategorieInfo } from "./touba-infos";

const SITE = MEDIA_URL;

export function urlArticle(slug: string): string {
  return `${SITE}/${slug}`;
}

function motCle(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]/g, "");
}

function hashtags(article: ArticleInfo): string {
  const fromTags = article.tags
    .map((t) => "#" + motCle(t))
    .filter((h) => h.length > 1);
  const base = ["#ToubaInfos", `#${motCle(article.categorie)}`];
  return Array.from(new Set([...base, ...fromTags])).slice(0, 6).join(" ");
}

function couper(txt: string, max: number): string {
  if (txt.length <= max) return txt;
  return txt.slice(0, max - 1).trimEnd() + "…";
}

export interface Diffusion {
  facebook: string;
  whatsapp: string;
  x: string;
  tiktok: string;
  pushTitre: string;
  pushCorps: string;
}

export function genererDiffusion(article: ArticleInfo): Diffusion {
  const url = urlArticle(article.slug);
  const tags = hashtags(article);

  const facebook = `${article.titre}

${article.extrait}

👉 Lire l'article sur Touba Infos : ${url}

${tags}`;

  const whatsapp = `*${article.titre}*
${article.extrait ? couper(article.extrait, 180) + "\n" : ""}${url}
_Touba Infos — l'actualité de Touba, du Sénégal et du monde_`;

  // X : 280 caractères, on réserve la place du lien (~23) + espace
  const placeLien = 24;
  const titreX = couper(article.titre, 280 - placeLien - 1);
  const x = `${titreX} ${url}`;

  const tiktok = `🎬 SCRIPT VIDÉO (30–60 s) — ${article.titre}

[0-3 s] ACCROCHE : "${couper(article.titre, 70)}"
[3-10 s] CONTEXTE : ${couper(article.extrait || article.sousTitre, 160)}
[10-40 s] L'ESSENTIEL :
 • Point 1 — le fait principal
 • Point 2 — le chiffre ou la citation clé
 • Point 3 — ce que ça change (${
   article.tags.includes("Touba") ? "impact pour Touba" : "pour le Sénégal"
 })
[40-55 s] CONCLUSION : ce qu'il faut retenir
[55-60 s] CTA : "Toute l'info sur Touba Infos — abonne-toi !"

🎵 Ambiance sobre · Sous-titres en français · Logo Touba Infos en bas`;

  const pushTitre = couper(article.titre, 60);
  const pushCorps = couper(article.extrait || article.sousTitre, 120);

  return { facebook, whatsapp, x, tiktok, pushTitre, pushCorps };
}

// ── Newsletter « L'essentiel de Touba Infos » ─────────────────────────────
export interface NewsletterData {
  principales: ArticleInfo[];
  touba: ArticleInfo[];
  senegal: ArticleInfo[];
  afriqueMonde: ArticleInfo[];
  video?: VideoInfo;
}

export function assemblerNewsletter(
  articles: ArticleInfo[],
  videos: VideoInfo[],
): NewsletterData {
  const pris = new Set<string>();
  const prendre = (arr: ArticleInfo[], n: number) => {
    const out: ArticleInfo[] = [];
    for (const a of arr) {
      if (out.length >= n) break;
      if (pris.has(a.id)) continue;
      pris.add(a.id);
      out.push(a);
    }
    return out;
  };

  const principales = prendre(articles, 5);
  const touba = prendre(
    articles.filter(
      (a) => a.categorie === "Touba" || a.tags.includes("Touba"),
    ),
    3,
  );
  const catsNat: CategorieInfo[] = ["Sénégal", "Politique", "Société", "Économie"];
  const senegal = prendre(
    articles.filter((a) => catsNat.includes(a.categorie)),
    3,
  );
  const afriqueMonde = prendre(
    articles.filter(
      (a) => a.categorie === "Afrique" || a.categorie === "International",
    ),
    1,
  );

  return { principales, touba, senegal, afriqueMonde, video: videos[0] };
}

export function newsletterTexte(data: NewsletterData): string {
  const bloc = (titre: string, arts: ArticleInfo[]) =>
    arts.length
      ? `\n${titre}\n` +
        arts
          .map((a) => `• ${a.titre}\n  ${urlArticle(a.slug)}`)
          .join("\n")
      : "";

  const date = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `L'ESSENTIEL DE TOUBA INFOS — ${date}
Touba • Sénégal • Afrique • Monde
${bloc("À LA UNE", data.principales)}
${bloc("TOUBA", data.touba)}
${bloc("SÉNÉGAL", data.senegal)}
${bloc("AFRIQUE / MONDE", data.afriqueMonde)}${
    data.video
      ? `\n\nVIDÉO\n• ${data.video.titre}\n  ${SITE}/videos`
      : ""
  }

—
Vous recevez cette lettre car vous êtes abonné à Touba Infos.
Se désabonner : ${SITE}/newsletter`;
}
