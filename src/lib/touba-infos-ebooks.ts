import { prisma } from "@/lib/db";
import crypto from "crypto";

export const SENEGAL_PHONE = /^(?:\+221|221)?(?:7[05678])\d{7}$/;
export const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
export const money = (value: number) => new Intl.NumberFormat("fr-SN").format(value) + " FCFA";

export async function publishedEbooks() { return prisma.infoEbook.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } }); }
export async function publishedEbook(slug: string) { return prisma.infoEbook.findFirst({ where: { slug, status: "PUBLISHED" } }); }
export function newDownloadToken() { return crypto.randomBytes(32).toString("base64url"); }
export function publicOrigin(_: Request) { const origin = process.env.NEXT_PUBLIC_SITE_URL; if (!origin?.startsWith("https://")) throw new Error("NEXT_PUBLIC_SITE_URL doit être une URL HTTPS."); return origin.replace(/\/$/, ""); }

export function paydunyaHeaders() {
  const master = process.env.PAYDUNYA_MASTER_KEY, privateKey = process.env.PAYDUNYA_PRIVATE_KEY, token = process.env.PAYDUNYA_TOKEN;
  if (!master || !privateKey || !token) throw new Error("PayDunya n’est pas configuré.");
  return { "Content-Type": "application/json", "PAYDUNYA-MASTER-KEY": master, "PAYDUNYA-PRIVATE-KEY": privateKey, "PAYDUNYA-TOKEN": token };
}
export function paydunyaUrl(path: string) { return `${process.env.PAYDUNYA_MODE === "live" ? "https://app.paydunya.com" : "https://app.paydunya.com/sandbox-api"}${path}`; }
