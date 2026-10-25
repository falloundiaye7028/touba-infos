// ============================================================================
//  TOUBA INFOS — Nettoyage du contenu reçu des intégrations
//  Le corps des articles est rendu tel quel en HTML sur le site public
//  (dangerouslySetInnerHTML). Tout contenu venant d'une intégration passe
//  donc par une liste blanche stricte : aucun script, aucun attribut
//  d'événement, aucune image ni iframe externe, liens http(s)/mailto seuls.
// ============================================================================

import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "h2",
    "h3",
    "h4",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
  ],
  allowedAttributes: {
    a: ["href", "title", "rel", "target"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    a: sanitizeHtml.simpleTransform(
      "a",
      { rel: "noopener noreferrer nofollow", target: "_blank" },
      true,
    ),
  },
};

/** Nettoie un fragment HTML selon la liste blanche éditoriale. */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS).trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Mise en forme simple après échappement : **gras** et *italique*. */
function inline(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
}

/**
 * Convertit un texte simple en HTML sûr.
 * Blocs séparés par une ligne vide ; « ## » et « ### » pour les intertitres ;
 * lignes en « - » pour les listes ; « > » pour les citations.
 * Le HTML éventuellement présent dans le texte est échappé, jamais interprété.
 */
export function plainTextToHtml(text: string): string {
  const blocks = text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const html = blocks.map((block) => {
    const lines = block.split("\n").map((line) => line.trim());

    if (lines.length === 1 && lines[0].startsWith("### ")) {
      return `<h3>${inline(lines[0].slice(4))}</h3>`;
    }
    if (lines.length === 1 && lines[0].startsWith("## ")) {
      return `<h2>${inline(lines[0].slice(3))}</h2>`;
    }
    if (lines.every((line) => /^[-•]\s+/.test(line))) {
      const items = lines
        .map((line) => `<li>${inline(line.replace(/^[-•]\s+/, ""))}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }
    if (lines.every((line) => line.startsWith(">"))) {
      const quote = lines
        .map((line) => inline(line.replace(/^>\s?/, "")))
        .join("<br>");
      return `<blockquote><p>${quote}</p></blockquote>`;
    }
    return `<p>${lines.map(inline).join("<br>")}</p>`;
  });

  return sanitizeArticleHtml(html.join("\n"));
}

/** Texte brut (sans balises) pour mesurer un contenu réel. */
export function textLength(html: string): number {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim().length;
}
