// ============================================================================
//  TOUBA INFOS NEWS AGENT — Rédacteur IA (serveur)
//  Transforme un sujet détecté en article ORIGINAL Touba Infos (brouillon),
//  avec bloc « Sources » et mention de transparence. Jamais de copier-coller.
//  Fournisseur IA : Pollinations (text.pollinations.ai/openai), sans clé —
//  interface isolée ici pour un remplacement facile (Anthropic/OpenAI).
// ============================================================================

import { EMOJI_CATEGORIES, type ArticleInfo } from "./touba-infos";
import { estSensible, type SujetDetecte } from "./touba-infos-agent";
import { adminCreate } from "./touba-infos-store";
import { setStatutSujet, listSujets } from "./touba-infos-agent-store";

interface RedactionIA {
  titre: string;
  sousTitre: string;
  extrait: string;
  contenu: string;
  tags?: string[];
  seoTitle?: string;
  metaDescription?: string;
}

const GRADIENTS: Record<string, string> = {
  defaut: "from-green-700 via-emerald-800 to-green-900",
};

function blocSources(sujet: SujetDetecte): string {
  const liste = [
    `${sujet.sourceNom}`,
    ...sujet.autresSources.map((s) => s.nom),
  ];
  const unique = Array.from(new Set(liste));
  const lien = sujet.url
    ? ` (<a href="${sujet.url}" target="_blank" rel="noopener noreferrer">source</a>)`
    : "";
  return `
<h2>Sources</h2>
<p><strong>Sources&nbsp;:</strong> ${unique.join(", ")}${lien}.</p>
<p><em>Cet article a été préparé à partir d'informations vérifiées provenant de plusieurs sources publiques et relu par la rédaction de Touba Infos.</em></p>`;
}

/**
 * Appel LLM avec fournisseurs enfichables, dans l'ordre :
 *   1. Anthropic (ANTHROPIC_API_KEY)  — recommandé
 *   2. OpenAI    (OPENAI_API_KEY)
 *   3. Pollinations (best-effort, sans clé — souvent indisponible)
 * Renvoie le texte brut du modèle, ou null si aucun fournisseur ne répond.
 */
async function callLLM(system: string, user: string): Promise<string | null> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 40000);
  try {
    // 1) Anthropic
    const aKey = process.env.ANTHROPIC_API_KEY;
    if (aKey) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          signal: ctrl.signal,
          headers: {
            "content-type": "application/json",
            "x-api-key": aKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: process.env.TI_AGENT_MODEL || "claude-sonnet-5",
            max_tokens: 1800,
            system,
            messages: [{ role: "user", content: user }],
          }),
        });
        if (res.ok) {
          const d = await res.json();
          const txt = d.content?.[0]?.text;
          if (txt) return txt;
        }
      } catch {
        /* fallthrough */
      }
    }

    // 2) OpenAI
    const oKey = process.env.OPENAI_API_KEY;
    if (oKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          signal: ctrl.signal,
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${oKey}`,
          },
          body: JSON.stringify({
            model: process.env.TI_AGENT_MODEL || "gpt-4o-mini",
            temperature: 0.7,
            max_tokens: 1800,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
          }),
        });
        if (res.ok) {
          const d = await res.json();
          const txt = d.choices?.[0]?.message?.content;
          if (txt) return txt;
        }
      } catch {
        /* fallthrough */
      }
    }

    // 3) Pollinations (best-effort)
    try {
      const res = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.7,
          max_tokens: 1800,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        const txt = d.choices?.[0]?.message?.content;
        if (txt) return txt;
      }
    } catch {
      /* fallthrough */
    }
    return null;
  } finally {
    clearTimeout(to);
  }
}

async function appelIA(sujet: SujetDetecte): Promise<RedactionIA | null> {
  const sourcesTxt = [sujet.sourceNom, ...sujet.autresSources.map((s) => s.nom)]
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(", ");

  const system = `Tu es journaliste pour « Touba Infos », média numérique sénégalais d'information générale (Touba, Sénégal, Afrique, Monde). Tu écris un article ORIGINAL en français, factuel, clair, professionnel et accessible. Règles absolues :
- Ne JAMAIS recopier le texte source ; comprends l'information et réécris entièrement avec tes mots.
- Titre informatif et crédible (pas de sensationnalisme, pas de « Urgent !!! », pas de « Incroyable »).
- Style Touba Infos : phrases naturelles, paragraphes courts. Ne commence pas par « Dans un contexte où ». Évite les formules génériques d'IA.
- Attribution prudente : « selon… », « d'après un communiqué… ». Ne prétends jamais que Touba Infos était sur place.
- Si le sujet a un impact réel sur Touba, ajoute une section <h2>Ce que cela signifie pour Touba</h2> (sinon, ne l'ajoute pas).
- N'invente pas de faits, de chiffres ni de citations. Si une information n'est pas confirmée, reste prudent.`;

  const user = `Sujet détecté (rubrique : ${sujet.categorie}) :
Titre repéré : "${sujet.titre}"
Éléments repérés (résumé de source, à reformuler, NE PAS recopier) : "${sujet.resume}"
Sources ayant traité le sujet : ${sourcesTxt}

Rédige l'article Touba Infos correspondant. Longueur adaptée (250 à 600 mots). Structure avec des intertitres <h2> si utile.

Réponds UNIQUEMENT avec ce JSON (rien avant, rien après) :
{
  "titre": "Titre original, informatif",
  "sousTitre": "Chapô de 2 à 3 phrases résumant l'essentiel",
  "extrait": "Résumé d'une phrase (140 caractères max)",
  "contenu": "Corps de l'article en HTML : <p>…</p>, <h2>…</h2>, <strong>…</strong>. NE PAS inclure le bloc Sources (ajouté automatiquement).",
  "tags": ["mot-clé1", "mot-clé2"],
  "seoTitle": "Titre SEO (60 caractères max)",
  "metaDescription": "Meta description (155 caractères max)"
}`;

  const raw = await callLLM(system, user);
  if (!raw) return null;
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const parsed = JSON.parse(m[0]) as RedactionIA;
    if (!parsed.titre || !parsed.contenu) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Brouillon minimal si l'IA est indisponible (structure seulement, sans copie). */
function brouillonSecours(sujet: SujetDetecte): RedactionIA {
  return {
    titre: sujet.titre,
    sousTitre:
      "Brouillon à compléter par la rédaction : l'assistant IA était indisponible. Vérifier les faits, croiser les sources et réécrire un article original.",
    extrait: sujet.titre.slice(0, 140),
    contenu: `
<p><em>[Brouillon généré sans IA — à réécrire par la rédaction, sans recopier la source.]</em></p>
<p><strong>Élément détecté (à vérifier et reformuler)&nbsp;:</strong> ${sujet.resume || "—"}</p>
<h2>À faire</h2>
<p>Croiser au moins deux sources indépendantes (ou une source officielle), rechercher le communiqué original, ajouter le contexte et rédiger l'article dans le style Touba Infos.</p>`,
    tags: sujet.tags,
  };
}

/**
 * Rédige un article à partir d'un sujet.
 * @param autoPublish  si true ET que l'IA a réellement rédigé (pas un squelette),
 *   le statut est décidé par TI_AGENT_AUTOPUBLISH :
 *     - "full"     → publié directement ;
 *     - "assisted" → publié si le sujet n'est pas sensible, sinon brouillon ;
 *     - "off"/absent → toujours brouillon.
 *   Un squelette (IA indisponible) n'est JAMAIS publié automatiquement.
 */
export async function redigerArticle(
  sujet: SujetDetecte,
  autoPublish = false,
): Promise<ArticleInfo> {
  const ia = await appelIA(sujet);
  const iaOk = !!ia;
  const contenu = ia ?? brouillonSecours(sujet);

  const mode = (process.env.TI_AGENT_AUTOPUBLISH || "off").toLowerCase();
  let statut: ArticleInfo["statut"] = "brouillon";
  if (autoPublish && iaOk && mode !== "off") {
    if (mode === "full") statut = "publie";
    else if (mode === "assisted")
      statut = estSensible(sujet.categorie, sujet.tags) ? "brouillon" : "publie";
  }

  const article = await adminCreate({
    titre: contenu.titre,
    sousTitre: contenu.sousTitre,
    extrait: contenu.extrait,
    categorie: sujet.categorie,
    genre: "Actualité",
    statut,
    auteur: "Rédaction Touba Infos",
    date: new Date().toISOString(),
    tempsLecture: "3 min",
    imageEmoji: EMOJI_CATEGORIES[sujet.categorie] ?? "📰",
    imageGradient: GRADIENTS.defaut,
    tags: (contenu.tags && contenu.tags.length ? contenu.tags : sujet.tags).slice(0, 6),
    contenu: `${contenu.contenu}\n${blocSources(sujet)}`,
    vues: 0,
  });

  await setStatutSujet(sujet.id, "redige");
  return article;
}

/**
 * Traitement automatique : rédige (et publie selon le mode) les meilleurs
 * sujets détectés. Appelé par le cron. Limité par TI_AGENT_MAX_PER_RUN.
 */
export async function autoTraiterSujets(): Promise<{
  rediges: number;
  publies: number;
}> {
  const mode = (process.env.TI_AGENT_AUTOPUBLISH || "off").toLowerCase();
  if (mode === "off") return { rediges: 0, publies: 0 };

  const max = Number(process.env.TI_AGENT_MAX_PER_RUN || "5") || 5;
  const sujets = (await listSujets())
    .filter((s) => s.statut === "detecte")
    .slice(0, max); // listSujets est déjà trié par score décroissant

  let rediges = 0;
  let publies = 0;
  for (const s of sujets) {
    try {
      const art = await redigerArticle(s, true);
      rediges++;
      if ((art.statut ?? "brouillon") === "publie") publies++;
    } catch {
      /* on continue avec les suivants */
    }
  }
  return { rediges, publies };
}
