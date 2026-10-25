// ============================================================================
//  TOUBA INFOS — Authentification de l'espace d'administration
//  Connexion par mot de passe (TI_ADMIN_PASSWORD), puis cookie httpOnly
//  contenant un jeton de session signé — jamais le mot de passe.
//  Logique pure et testée dans admin-session.ts.
// ============================================================================

import { cookies } from "next/headers";

import { sessionKey, verifySessionToken } from "./admin-session";

export const TI_COOKIE = "ti_admin";

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(TI_COOKIE)?.value, sessionKey());
}
