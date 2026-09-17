// ============================================================================
//  TOUBA INFOS — Authentification de l'espace d'administration
//  Modèle simple par mot de passe + cookie httpOnly (aligné sur le pattern
//  ADMIN_SECRET déjà utilisé côté agence). Pour une prod multi-rôles,
//  brancher next-auth + le modèle User/Role de Prisma.
// ============================================================================

import { cookies } from "next/headers";

export const TI_COOKIE = "ti_admin";

/** Mot de passe attendu. Définir `TI_ADMIN_PASSWORD` en prod. */
export function expectedPassword(): string {
  return process.env.TI_ADMIN_PASSWORD || "touba-infos";
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return store.get(TI_COOKIE)?.value === expectedPassword();
}
