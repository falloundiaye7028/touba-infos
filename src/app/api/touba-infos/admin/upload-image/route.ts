import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/touba-infos-admin";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function safeFileName(name: string): string {
  const extension = name.includes(".") ? name.split(".").pop() : "jpg";
  const base = name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80);

  return `${base || "image"}.${extension?.toLowerCase() || "jpg"}`;
}

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Sélectionnez une image." }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formats acceptés : JPG, PNG, WebP ou GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "L’image ne doit pas dépasser 4 Mo." },
      { status: 400 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("[touba-infos/upload-image] BLOB_READ_WRITE_TOKEN absent");
    return NextResponse.json(
      { error: "Le stockage d’images n’est pas configuré." },
      { status: 503 },
    );
  }

  try {
    const blob = await put(`touba-infos/articles/${safeFileName(file.name)}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error("[touba-infos/upload-image] Échec Vercel Blob", {
      message: error instanceof Error ? error.message : String(error),
      fileName: safeFileName(file.name),
      fileSize: file.size,
      fileType: file.type,
    });
    return NextResponse.json(
      { error: "L’envoi de l’image a échoué. Réessayez." },
      { status: 500 },
    );
  }
}
