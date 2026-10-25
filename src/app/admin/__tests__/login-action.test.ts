import { beforeEach, describe, expect, it, vi } from "vitest";

const jar = vi.hoisted(() => ({
  values: new Map<string, string>(),
  options: new Map<string, unknown>(),
}));
const limit = vi.hoisted(() => ({ allowed: true }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.values.has(name) ? { name, value: jar.values.get(name)! } : undefined,
    set: (name: string, value: string, options: unknown) => {
      jar.values.set(name, value);
      jar.options.set(name, options);
    },
    delete: (name: string) => jar.values.delete(name),
  }),
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("@/lib/touba-infos-store", () => ({}));
vi.mock("@/lib/rateLimit", () => ({
  rateLimit: () => ({ allowed: limit.allowed, remaining: 0 }),
}));

import { loginAction } from "../actions";
import { isAuthed, TI_COOKIE } from "@/lib/touba-infos-admin";

function form(password: string) {
  const data = new FormData();
  data.set("password", password);
  return data;
}

async function login(password: string): Promise<string> {
  try {
    await loginAction(form(password));
  } catch (error) {
    return (error as Error).message;
  }
  return "aucune redirection";
}

describe("connexion à l'espace rédaction", () => {
  beforeEach(() => {
    jar.values.clear();
    jar.options.clear();
    limit.allowed = true;
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TI_ADMIN_PASSWORD", "mot-de-passe-prod");
    vi.stubEnv("TI_SESSION_SECRET", "");
  });

  it("connecte avec le mot de passe existant, sans le stocker dans le cookie", async () => {
    expect(await login("mot-de-passe-prod")).toBe("REDIRECT:/admin");
    const cookie = jar.values.get(TI_COOKIE)!;
    expect(cookie).toBeDefined();
    expect(cookie).not.toContain("mot-de-passe-prod");
    expect(jar.options.get(TI_COOKIE)).toMatchObject({
      httpOnly: true,
      secure: true,
    });
    expect(await isAuthed()).toBe(true);
  });

  it("refuse un mauvais mot de passe", async () => {
    expect(await login("faux")).toBe("REDIRECT:/admin?error=auth");
    expect(jar.values.has(TI_COOKIE)).toBe(false);
  });

  it("refuse l'ancien mot de passe par défaut en production", async () => {
    vi.stubEnv("TI_ADMIN_PASSWORD", "");
    expect(await login("touba-infos")).toBe("REDIRECT:/admin?error=config");
    expect(jar.values.has(TI_COOKIE)).toBe(false);
  });

  it("n'accepte plus un ancien cookie contenant le mot de passe", async () => {
    jar.values.set(TI_COOKIE, "mot-de-passe-prod");
    expect(await isAuthed()).toBe(false);
  });

  it("limite les tentatives", async () => {
    limit.allowed = false;
    expect(await login("mot-de-passe-prod")).toBe(
      "REDIRECT:/admin?error=limit",
    );
  });
});
