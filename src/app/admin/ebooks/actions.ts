"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAuthed } from "@/lib/touba-infos-admin";
import { slugify } from "@/lib/touba-infos-ebooks";

async function guard() { if (!(await isAuthed())) redirect("/admin"); }
function focal(value: FormDataEntryValue | null) { const number = Number(value); return Number.isFinite(number) ? Math.min(100, Math.max(0, Math.round(number))) : 50; }
function data(form: FormData) { const price = Number(form.get("priceXof")); return { title: String(form.get("title") || "").trim(), slug: slugify(String(form.get("slug") || form.get("title") || "")), author: String(form.get("author") || "").trim(), description: String(form.get("description") || "").trim(), category: String(form.get("category") || "").trim(), coverUrl: String(form.get("coverUrl") || "").trim() || null, coverFocalX: focal(form.get("coverFocalX")), coverFocalY: focal(form.get("coverFocalY")), pdfPathname: String(form.get("pdfPathname") || "").trim(), kind: String(form.get("kind")) === "PAID" ? "PAID" as const : "FREE" as const, priceXof: Number.isInteger(price) && price > 0 ? price : 0, status: String(form.get("status")) === "PUBLISHED" ? "PUBLISHED" as const : "DRAFT" as const }; }
export async function saveEbook(id: string | undefined, form: FormData) { await guard(); const value = data(form); if (!value.title || !value.author || !value.description || !value.category || !value.pdfPathname || (value.kind === "PAID" && !value.priceXof)) redirect("/admin/ebooks/new?error=champs"); const ebook = id ? await prisma.infoEbook.update({ where: { id }, data: value }) : await prisma.infoEbook.create({ data: value }); revalidatePath("/ebooks", "layout"); redirect(`/admin/ebooks/${ebook.id}?ok=1`); }
export async function deleteEbook(id: string) { await guard(); await prisma.infoEbook.delete({ where: { id } }); revalidatePath("/ebooks", "layout"); redirect("/admin/ebooks?ok=supprime"); }
