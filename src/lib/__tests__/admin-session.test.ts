import { describe, expect, it } from "vitest";

import {
  DEV_FALLBACK_PASSWORD,
  isWeakPassword,
  SESSION_TTL_MS,
  createSessionToken,
  resolveAdminPassword,
  sessionKey,
  verifyAdminPassword,
  verifySessionToken,
} from "../admin-session";

const PROD = { NODE_ENV: "production", TI_ADMIN_PASSWORD: "mot-de-passe-prod" };

describe("mot de passe administrateur", () => {
  it("aucun mot de passe par défaut en production", () => {
    expect(resolveAdminPassword({ NODE_ENV: "production" })).toBeNull();
    expect(sessionKey({ NODE_ENV: "production" })).toBeNull();
  });

  it("mot de passe de développement seulement hors production", () => {
    expect(resolveAdminPassword({ NODE_ENV: "development" })).toBe(
      DEV_FALLBACK_PASSWORD,
    );
  });

  it("le mot de passe configuré reste valable (compatibilité)", () => {
    expect(resolveAdminPassword(PROD)).toBe("mot-de-passe-prod");
    expect(verifyAdminPassword("mot-de-passe-prod", "mot-de-passe-prod")).toBe(
      true,
    );
    expect(verifyAdminPassword("mauvais", "mot-de-passe-prod")).toBe(false);
    expect(verifyAdminPassword("", null)).toBe(false);
  });
});

describe("jeton de session", () => {
  const key = sessionKey(PROD)!;
  const now = Date.UTC(2026, 9, 25, 9, 0, 0);

  it("ne contient jamais le mot de passe", () => {
    const token = createSessionToken(key, now);
    expect(token).not.toContain("mot-de-passe-prod");
    expect(
      Buffer.from(token.split(".")[4], "base64url").toString(),
    ).not.toContain("mot-de-passe");
  });

  it("est accepté tant qu'il n'a pas expiré", () => {
    const token = createSessionToken(key, now);
    expect(verifySessionToken(token, key, now + 1000)).toBe(true);
    expect(verifySessionToken(token, key, now + SESSION_TTL_MS + 1)).toBe(
      false,
    );
  });

  it("refuse l'ancien cookie contenant le mot de passe en clair", () => {
    expect(verifySessionToken("mot-de-passe-prod", key, now)).toBe(false);
    expect(verifySessionToken(DEV_FALLBACK_PASSWORD, key, now)).toBe(false);
  });

  it("refuse un jeton falsifié ou prolongé", () => {
    const token = createSessionToken(key, now);
    const [v, issued, expires, nonce, sig] = token.split(".");
    const extended = [
      v,
      issued,
      String(Number(expires) + 86_400_000),
      nonce,
      sig,
    ].join(".");
    expect(verifySessionToken(extended, key, now)).toBe(false);
    expect(verifySessionToken(`${token}x`, key, now)).toBe(false);
    expect(verifySessionToken("v1.1.2.3", key, now)).toBe(false);
    expect(verifySessionToken("", key, now)).toBe(false);
    expect(verifySessionToken(token, null, now)).toBe(false);
  });

  it("refuse un jeton signé avec une durée supérieure au maximum", () => {
    const token = createSessionToken(key, now, SESSION_TTL_MS * 10);
    expect(verifySessionToken(token, key, now + 1000)).toBe(false);
  });

  it("changer le mot de passe invalide les sessions ouvertes", () => {
    const token = createSessionToken(key, now);
    const newKey = sessionKey({ ...PROD, TI_ADMIN_PASSWORD: "nouveau" })!;
    expect(verifySessionToken(token, newKey, now + 1000)).toBe(false);
  });

  it("TI_SESSION_SECRET, s'il existe, sert de clé", () => {
    const withSecret = sessionKey({
      ...PROD,
      TI_SESSION_SECRET: "s".repeat(40),
    })!;
    const token = createSessionToken(withSecret, now);
    expect(verifySessionToken(token, withSecret, now + 1)).toBe(true);
    expect(verifySessionToken(token, key, now + 1)).toBe(false);
  });

  it("changer le mot de passe invalide les sessions même avec TI_SESSION_SECRET", () => {
    const secret = "s".repeat(40);
    const before = sessionKey({ ...PROD, TI_SESSION_SECRET: secret })!;
    const token = createSessionToken(before, now);
    const after = sessionKey({
      ...PROD,
      TI_ADMIN_PASSWORD: "nouveau-mot-de-passe",
      TI_SESSION_SECRET: secret,
    })!;
    expect(verifySessionToken(token, after, now + 1000)).toBe(false);
  });

  it("la clé n'est pas un simple HMAC du mot de passe (dérivation scrypt)", async () => {
    const { createHmac } = await import("node:crypto");
    const naive = createHmac("sha256", "touba-infos/admin-session/v1")
      .update("password:mot-de-passe-prod")
      .digest();
    expect(sessionKey(PROD)!.equals(naive)).toBe(false);
    expect(sessionKey(PROD)!.equals(sessionKey(PROD)!)).toBe(true);
  });
});

describe("mots de passe par défaut connus", () => {
  it.each(["change-me", "touba-infos", "Password", "admin"])(
    "« %s » est refusé en production",
    (pw) => {
      expect(
        resolveAdminPassword({ NODE_ENV: "production", TI_ADMIN_PASSWORD: pw }),
      ).toBeNull();
    },
  );

  it("reste utilisable en développement local", () => {
    expect(
      resolveAdminPassword({
        NODE_ENV: "development",
        TI_ADMIN_PASSWORD: "change-me",
      }),
    ).toBe("change-me");
  });

  it("un mot de passe court reste accepté (compatibilité) mais signalé", () => {
    expect(
      resolveAdminPassword({
        NODE_ENV: "production",
        TI_ADMIN_PASSWORD: "court1",
      }),
    ).toBe("court1");
    expect(isWeakPassword("court1")).toBe(true);
    expect(isWeakPassword("un-mot-de-passe-long")).toBe(false);
  });
});
