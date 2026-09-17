"use client";

import { useState } from "react";
import { focalPosition } from "@/lib/touba-infos-image";

export default function EbookForm({ ebook, action }: { ebook?: any; action: (f: FormData) => void }) {
  const [uploading, setUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState(ebook?.coverUrl ?? "");
  const [focalX, setFocalX] = useState(ebook?.coverFocalX ?? 50);
  const [focalY, setFocalY] = useState(ebook?.coverFocalY ?? 50);

  async function upload(event: React.ChangeEvent<HTMLInputElement>, field: "coverUrl" | "pdfPathname", key: "image" | "ebook") {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData(); body.set(key, file);
      const response = await fetch(`/api/touba-infos/admin/upload-${key}`, { method: "POST", body });
      const data = await response.json() as { url?: string };
      if (!response.ok || !data.url) return;
      if (field === "coverUrl") setCoverUrl(data.url);
      else { const input = document.querySelector<HTMLInputElement>('input[name="pdfPathname"]'); if (input) input.value = data.url; }
    } finally { setUploading(false); }
  }

  return <form action={action} className="max-w-3xl space-y-4">
    <input name="title" required defaultValue={ebook?.title} placeholder="Titre" className="w-full rounded-lg border p-3" />
    <input name="slug" defaultValue={ebook?.slug} placeholder="Slug (facultatif)" className="w-full rounded-lg border p-3" />
    <div className="grid gap-4 sm:grid-cols-2"><input name="author" required defaultValue={ebook?.author} placeholder="Auteur" className="rounded-lg border p-3" /><input name="category" required defaultValue={ebook?.category} placeholder="Catégorie" className="rounded-lg border p-3" /></div>
    <textarea name="description" required defaultValue={ebook?.description} placeholder="Résumé" className="min-h-32 w-full rounded-lg border p-3" />
    <section className="rounded-xl border bg-neutral-50 p-4">
      <p className="mb-3 text-sm font-bold">Couverture et aperçu</p>
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-neutral-200">{coverUrl && <img src={coverUrl} alt="Aperçu de la couverture" className="h-full w-full object-contain" style={{ objectPosition: focalPosition(focalX, focalY) }} />}</div>
        <div className="space-y-3"><label className="block text-sm">Couverture <input type="file" accept="image/*" onChange={(event) => upload(event, "coverUrl", "image")} /></label><input name="coverUrl" value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} placeholder="URL de couverture" className="w-full rounded-lg border p-3" />
          <Focal label="Point focal horizontal" value={focalX} onChange={setFocalX} name="coverFocalX" /><Focal label="Point focal vertical" value={focalY} onChange={setFocalY} name="coverFocalY" /></div>
      </div>
    </section>
    <label className="block">PDF <input type="file" accept="application/pdf" onChange={(event) => upload(event, "pdfPathname", "ebook")} /><input type="hidden" name="pdfPathname" required defaultValue={ebook?.pdfPathname || ""} /></label>
    <div className="grid gap-4 sm:grid-cols-3"><select name="kind" defaultValue={ebook?.kind || "FREE"} className="rounded-lg border p-3"><option value="FREE">Gratuit</option><option value="PAID">Payant</option></select><input name="priceXof" type="number" min="0" defaultValue={ebook?.priceXof || 0} placeholder="Prix XOF" className="rounded-lg border p-3" /><select name="status" defaultValue={ebook?.status || "DRAFT"} className="rounded-lg border p-3"><option value="DRAFT">Brouillon</option><option value="PUBLISHED">Publié</option></select></div>
    <button disabled={uploading} className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white">{uploading ? "Envoi…" : "Enregistrer"}</button>
  </form>;
}
function Focal({ label, value, onChange, name }: { label: string; value: number; onChange: (value: number) => void; name: string }) { return <label className="block text-sm">{label} ({value}%)<input name={name} type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} className="block w-full accent-green-600" /></label>; }
