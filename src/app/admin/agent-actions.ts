"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/touba-infos-admin";
import { runVeille } from "@/lib/touba-infos-veille";
import { redigerArticle } from "@/lib/touba-infos-writer";
import { getSujet, setStatutSujet } from "@/lib/touba-infos-agent-store";

async function assert() {
  if (!(await isAuthed())) redirect("/admin");
}

export async function lancerVeilleAction() {
  await assert();
  await runVeille();
  revalidatePath("/admin/agent");
}

export async function genererArticleAction(sujetId: string) {
  await assert();
  const sujet = await getSujet(sujetId);
  if (!sujet) redirect("/admin/agent");
  const article = await redigerArticle(sujet!);
  revalidatePath("/admin/agent");
  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${article.id}?ok=cree`);
}

export async function rejeterSujetAction(sujetId: string) {
  await assert();
  await setStatutSujet(sujetId, "rejete");
  revalidatePath("/admin/agent");
}
