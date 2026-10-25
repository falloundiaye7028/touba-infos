// ============================================================================
//  Audit des permissions RÉELLES des intégrations.
//  Au-delà des outils annoncés, on vérifie dans le code source que les
//  modules des intégrations n'ont accès à aucune fonction d'écriture du store
//  autre que la création, ni à l'authentification de l'administration.
// ============================================================================

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/touba-infos-store", () => ({
  adminListAll: async () => [],
  adminCreate: async () => {
    throw new Error("non utilisé");
  },
}));

import { exposedTools } from "../mcp-server";

const ROOT = path.resolve(__dirname, "../../../..");

const INTEGRATION_FILES = [
  ...readdirSync(path.join(ROOT, "src/lib/integrations"))
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .map((f) => `src/lib/integrations/${f}`),
  "src/app/api/touba-infos/mcp/route.ts",
  "src/app/api/touba-infos/integrations/incoming/route.ts",
  "src/lib/validation/amy-incoming.ts",
];

const FORBIDDEN = [
  "adminUpdate",
  "adminDelete",
  "adminSetStatut",
  "adminToggle",
  "publishArticle",
  "prisma",
  "isAuthed",
  "TI_ADMIN_PASSWORD",
  "TI_AGENT_AUTOPUBLISH",
  "revalidatePath",
];

function source(file: string): string {
  return readFileSync(path.join(ROOT, file), "utf8")
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("audit des permissions des intégrations", () => {
  it.each(INTEGRATION_FILES)(
    "%s n'utilise aucune opération interdite",
    (file) => {
      const code = source(file);
      for (const word of FORBIDDEN) {
        expect(code, `${file} contient « ${word} »`).not.toContain(word);
      }
    },
  );

  it("seul draft-service importe une fonction d'écriture : adminCreate", () => {
    for (const file of INTEGRATION_FILES) {
      const code = source(file);
      if (file.endsWith("draft-service.ts")) {
        expect(code).toMatch(
          /import \{ adminCreate, adminListAll \} from "@\/lib\/touba-infos-store"/,
        );
      } else {
        expect(code, file).not.toContain("adminCreate");
      }
    }
  });

  it("draft-service impose le statut brouillon en dur", () => {
    const code = source("src/lib/integrations/draft-service.ts");
    expect(code).toContain('statut: "brouillon"');
    expect(code).not.toMatch(/statut:\s*request\./);
  });

  it("aucun outil exposé ne publie, ne modifie ni ne supprime", () => {
    const names = exposedTools().map((t) => t.name);
    expect(names).toEqual([
      "creer_brouillon",
      "lister_brouillons",
      "lire_article",
    ]);
    for (const name of names) {
      expect(name).not.toMatch(
        /publi|modif|update|supprim|delete|statut|archiv/i,
      );
    }
  });

  it("les routes d'intégration n'exposent que POST pour écrire", () => {
    const incoming = source(
      "src/app/api/touba-infos/integrations/incoming/route.ts",
    );
    expect(incoming).not.toMatch(
      /export (async )?function (PUT|PATCH|DELETE|GET)/,
    );
    const mcp = source("src/app/api/touba-infos/mcp/route.ts");
    expect(mcp).toMatch(
      /export const (GET|DELETE|PUT|PATCH) = methodNotAllowed/,
    );
  });

  it("aucun secret en clair dans les fichiers d'intégration", () => {
    for (const file of INTEGRATION_FILES) {
      const code = readFileSync(path.join(ROOT, file), "utf8");
      expect(code, file).not.toMatch(
        /(sk-ant-|sk-[A-Za-z0-9]{20,}|vercel_blob_rw_[A-Za-z0-9]+_[A-Za-z0-9]{10,})/,
      );
    }
  });
});
