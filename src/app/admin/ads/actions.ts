"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/touba-infos-admin";
import {
  createAd,
  updateAd,
  deleteAd,
  toggleAd,
} from "@/lib/touba-infos-ads";

async function assert() {
  if (!(await isAuthed())) redirect("/admin");
}

function fromForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    position: String(formData.get("position") ?? "sidebar").trim() || "sidebar",
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    linkUrl: String(formData.get("linkUrl") ?? "").trim(),
    label: String(formData.get("label") ?? "").trim() || "Publicité",
    active: formData.get("active") === "on",
  };
}

export async function createAdAction(formData: FormData) {
  await assert();
  const data = fromForm(formData);
  if (!data.name) redirect("/admin/ads/new?error=nom");
  await createAd(data);
  revalidatePath("/", "layout");
  revalidatePath("/admin/ads", "layout");
  redirect("/admin/ads?ok=creee");
}

export async function updateAdAction(id: string, formData: FormData) {
  await assert();
  await updateAd(id, fromForm(formData));
  revalidatePath("/", "layout");
  revalidatePath("/admin/ads", "layout");
  redirect(`/admin/ads/${id}?ok=maj`);
}

export async function deleteAdAction(id: string) {
  await assert();
  await deleteAd(id);
  revalidatePath("/", "layout");
  revalidatePath("/admin/ads", "layout");
  redirect("/admin/ads?ok=supprimee");
}

export async function toggleAdAction(id: string) {
  await assert();
  await toggleAd(id);
  revalidatePath("/", "layout");
  revalidatePath("/admin/ads", "layout");
  redirect("/admin/ads");
}
