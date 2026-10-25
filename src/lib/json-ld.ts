// ============================================================================
//  Sérialisation sûre des données structurées (JSON-LD).
//  JSON.stringify n'échappe pas « < » : un titre contenant « </script> »
//  fermerait la balise <script type="application/ld+json"> et permettrait
//  d'injecter du code. On échappe donc les caractères sensibles en
//  séquences Unicode, ce qui garde un JSON strictement équivalent.
// ============================================================================

const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g");
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g");

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEPARATOR, "\\u2028")
    .replace(PARAGRAPH_SEPARATOR, "\\u2029");
}
