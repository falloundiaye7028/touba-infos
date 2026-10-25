"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as store from "@/lib/touba-infos-store";
import { TI_COOKIE, isAuthed } from "@/lib/touba-infos-admin";
import {
  createSessionToken,
  isWeakPassword,
  resolveAdminPassword,
  sessionCookieOptions,
  sessionKey,
  verifyAdminPassword,
} from "@/lib/admin-session";
import { rateLimit } from "@/lib/rateLimit";
import type { CategorieInfo, GenreInfo, StatutInfo } from "@/lib/touba-infos";

const LOGIN_ATTEMPTS = 10;
const LOGIN_ATTEMPTS_GLOBAL = 100;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// ── Auth ────────────────────────────────────────────────────────────────────
export async function loginAction(formData: FormData) {
  // Sur Vercel, x-vercel-forwarded-for et x-real-ip sont posés par la
  // plateforme ; x-forwarded-for ne sert qu'en dernier recours.
  const h = await headers();
  const ip =
    h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "inconnue";
  if (
    !rateLimit(`admin-login:${ip}`, LOGIN_ATTEMPTS, LOGIN_WINDOW_MS).allowed ||
    !rateLimit("admin-login:*", LOGIN_ATTEMPTS_GLOBAL, LOGIN_WINDOW_MS).allowed
  ) {
    redirect("/admin?error=limit");
  }

  const expected = resolveAdminPassword();
  const key = sessionKey();
  if (!expected || !key) {
    console.error(
      "[admin] connexion désactivée : TI_ADMIN_PASSWORD n'est pas défini.",
    );
    redirect("/admin?error=config");
  }

  const pw = String(formData.get("password") ?? "");
  if (!verifyAdminPassword(pw, expected)) {
    redirect("/admin?error=auth");
  }

  if (isWeakPassword(expected)) {
    console.warn(
      "[admin] TI_ADMIN_PASSWORD est court : 12 caractères ou plus recommandés.",
    );
  }

  const jar = await cookies();
  jar.set(TI_COOKIE, createSessionToken(key), sessionCookieOptions());
  redirect("/admin");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(TI_COOKIE);
  redirect("/admin");
}

// ── Garde ────────────────────────────────────────────────────────────────────
async function assert() {
  if (!(await isAuthed())) redirect("/admin");
}

function revalidateAll() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

function parseTags(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function focal(value: FormDataEntryValue | null): number {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(100, Math.max(0, Math.round(number)))
    : 50;
}

function fromForm(formData: FormData) {
  const titre = String(formData.get("titre") ?? "").trim();
  const dateLocal = String(formData.get("date") ?? "").trim();
  return {
    titre,
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    sousTitre: String(formData.get("sousTitre") ?? "").trim(),
    extrait: String(formData.get("extrait") ?? "").trim(),
    categorie: String(formData.get("categorie") ?? "Touba") as CategorieInfo,
    genre: String(formData.get("genre") ?? "Actualité") as GenreInfo,
    statut: String(formData.get("statut") ?? "brouillon") as StatutInfo,
    auteur: String(formData.get("auteur") ?? "").trim(),
    date: dateLocal
      ? new Date(dateLocal).toISOString()
      : new Date().toISOString(),
    tempsLecture: String(formData.get("tempsLecture") ?? "3 min").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || undefined,
    imageFocalX: focal(formData.get("imageFocalX")),
    imageFocalY: focal(formData.get("imageFocalY")),
    imageEmoji: String(formData.get("imageEmoji") ?? "📰").trim() || "📰",
    imageGradient:
      String(formData.get("imageGradient") ?? "").trim() ||
      "from-green-700 via-emerald-800 to-green-900",
    credit: String(formData.get("credit") ?? "").trim() || undefined,
    legende: String(formData.get("legende") ?? "").trim() || undefined,
    tags: parseTags(formData.get("tags")),
    vues: Number(formData.get("vues") ?? 0) || 0,
    alaUne: formData.get("alaUne") === "on",
    breaking: formData.get("breaking") === "on",
    epingle: formData.get("epingle") === "on",
    contenu: String(formData.get("contenu") ?? "").trim() || "<p></p>",
  };
}

// ── CRUD ─────────────────────────────────────────────────────────────────────
export async function createArticleAction(formData: FormData) {
  await assert();
  const data = fromForm(formData);
  if (!data.titre) redirect("/admin/articles/new?error=titre");
  const article = await store.adminCreate(data);
  revalidateAll();
  redirect(`/admin/articles/${article.id}?ok=cree`);
}

export async function updateArticleAction(id: string, formData: FormData) {
  await assert();
  const data = fromForm(formData);
  await store.adminUpdate(id, { ...data, miseAJour: new Date().toISOString() });
  revalidateAll();
  redirect(`/admin/articles/${id}?ok=maj`);
}

export async function deleteArticleAction(id: string) {
  await assert();
  await store.adminDelete(id);
  revalidateAll();
  redirect("/admin/articles?ok=supprime");
}

export async function toggleAction(
  id: string,
  field: "alaUne" | "breaking" | "epingle",
) {
  await assert();
  await store.adminToggle(id, field);
  revalidateAll();
}

export async function setStatutAction(id: string, statut: StatutInfo) {
  await assert();
  await store.adminSetStatut(id, statut);
  revalidateAll();
}
