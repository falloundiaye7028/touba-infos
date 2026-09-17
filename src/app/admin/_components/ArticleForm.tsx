"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, Eye, ImagePlus, LoaderCircle, X } from "lucide-react";
import type { ArticleInfo } from "@/lib/touba-infos";
import {
  CATEGORIES_INFO,
  CATEGORIES_PLUS,
  GENRES_INFO,
  AUTEURS,
} from "@/lib/touba-infos";

const GRADIENTS = [
  { label: "Vert", v: "from-green-700 via-emerald-800 to-green-900" },
  { label: "Ardoise", v: "from-slate-700 via-slate-800 to-green-900" },
  { label: "Ambre", v: "from-amber-700 via-stone-700 to-emerald-900" },
  { label: "Rouge", v: "from-red-700 via-red-800 to-green-900" },
  { label: "Bleu", v: "from-sky-700 via-emerald-800 to-green-900" },
  { label: "Magenta", v: "from-fuchsia-700 via-rose-800 to-orange-900" },
  { label: "Violet", v: "from-violet-700 via-indigo-800 to-slate-900" },
];

function toLocalInput(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

const CATS = [...CATEGORIES_INFO, ...CATEGORIES_PLUS];

export default function ArticleForm({
  action,
  article,
  mode,
}: {
  action: (formData: FormData) => void | Promise<void>;
  article?: ArticleInfo;
  mode: "new" | "edit";
}) {
  const [titre, setTitre] = useState(article?.titre ?? "");
  const [sousTitre, setSousTitre] = useState(article?.sousTitre ?? "");
  const [categorie, setCategorie] = useState<string>(article?.categorie ?? "Touba");
  const [emoji, setEmoji] = useState(article?.imageEmoji ?? "📰");
  const [imageUrl, setImageUrl] = useState(article?.imageUrl ?? "");
  const [focalX, setFocalX] = useState(article?.imageFocalX ?? 50);
  const [focalY, setFocalY] = useState(article?.imageFocalY ?? 50);
  const [gradient, setGradient] = useState(
    article?.imageGradient ?? GRADIENTS[0].v,
  );
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "error">("idle");
  const [uploadError, setUploadError] = useState("");

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Sélectionnez un fichier image.");
      setUploadState("error");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("L’image ne doit pas dépasser 4 Mo.");
      setUploadState("error");
      return;
    }

    setUploadState("uploading");
    setUploadError("");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/touba-infos/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "Envoi impossible.");
      setImageUrl(data.url);
      setUploadState("idle");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Envoi impossible.");
      setUploadState("error");
    }
  }

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-3">
      {/* Colonne principale */}
      <div className="space-y-4 lg:col-span-2">
        <Field label="Titre" required>
          <input
            name="titre"
            required
            defaultValue={article?.titre}
            onChange={(e) => setTitre(e.target.value)}
            className={inputCls}
            placeholder="Titre de l'article"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug (URL)" hint={mode === "new" ? "auto si vide" : undefined}>
            <input name="slug" defaultValue={article?.slug} className={inputCls} placeholder="titre-de-larticle" />
          </Field>
          <Field label="Temps de lecture">
            <input name="tempsLecture" defaultValue={article?.tempsLecture ?? "3 min"} className={inputCls} />
          </Field>
        </div>

        <Field label="Sous-titre / chapô">
          <input
            name="sousTitre"
            defaultValue={article?.sousTitre}
            onChange={(e) => setSousTitre(e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Extrait (résumé)">
          <textarea name="extrait" rows={2} defaultValue={article?.extrait} className={inputCls} />
        </Field>

        <Field label="Contenu — HTML autorisé : titres, gras, listes, citations">
          <textarea
            name="contenu"
            rows={16}
            defaultValue={article?.contenu}
            className={`${inputCls} font-mono text-xs leading-relaxed`}
            placeholder="<p>Votre article…</p>"
          />
        </Field>
      </div>

      {/* Colonne latérale */}
      <div className="space-y-4">
        {/* Aperçu */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-400">Aperçu</p>
          <div className="overflow-hidden rounded-xl border border-neutral-100">
            <div className={`relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br ${gradient}`}>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${focalX}% ${focalY}%` }} />
              ) : (
                <span className="text-5xl opacity-40">{emoji}</span>
              )}
              <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                {categorie}
              </span>
            </div>
            <div className="p-3">
              <p className="font-black leading-tight text-neutral-900 line-clamp-2">
                {titre || "Titre de l'article"}
              </p>
              <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{sousTitre}</p>
            </div>
          </div>
        </div>

        {/* Publication */}
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
          <Field label="Statut">
            <select name="statut" defaultValue={article?.statut ?? "brouillon"} className={inputCls}>
              <option value="brouillon">Brouillon</option>
              <option value="publie">Publié</option>
              <option value="programme">Programmé</option>
            </select>
          </Field>
          <Field label="Date de publication">
            <input type="datetime-local" name="date" defaultValue={toLocalInput(article?.date)} className={inputCls} />
          </Field>
          <div className="flex flex-wrap gap-4 pt-1">
            <Check name="alaUne" label="À la Une" defaultChecked={article?.alaUne} />
            <Check name="breaking" label="Dernière minute" defaultChecked={article?.breaking} />
            <Check name="epingle" label="Épinglé" defaultChecked={article?.epingle} />
          </div>
        </div>

        {/* Classement */}
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
          <Field label="Rubrique">
            <select
              name="categorie"
              defaultValue={article?.categorie ?? "Touba"}
              onChange={(e) => setCategorie(e.target.value)}
              className={inputCls}
            >
              {CATS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Genre">
            <select name="genre" defaultValue={article?.genre ?? "Actualité"} className={inputCls}>
              {GENRES_INFO.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="Auteur">
            <input
              name="auteur"
              list="touba-infos-auteurs"
              defaultValue={article?.auteur ?? AUTEURS[0]?.nom ?? "Rédaction Touba Infos"}
              className={inputCls}
              placeholder="Nom de l’auteur"
            />
            <datalist id="touba-infos-auteurs">
              {AUTEURS.map((a) => (
                <option key={a.slug} value={a.nom} />
              ))}
            </datalist>
          </Field>
          <Field label="Mots-clés (séparés par des virgules)">
            <input name="tags" defaultValue={article?.tags.join(", ")} className={inputCls} placeholder="Touba, Magal" />
          </Field>
        </div>

        {/* Média */}
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
          <Field label="Image de l’article">
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-green-500 bg-green-50 px-4 py-4 text-sm font-bold text-green-800 transition hover:bg-green-100">
                {uploadState === "uploading" ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <ImagePlus size={18} />
                )}
                {uploadState === "uploading" ? "Envoi de l’image…" : "Choisir une image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={uploadState === "uploading"}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadImage(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <p className="text-xs text-neutral-500">JPG, PNG, WebP ou GIF · 4 Mo maximum</p>
              {uploadError && <p className="text-xs font-semibold text-red-600">{uploadError}</p>}
              {imageUrl && (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800">
                  <span className="truncate font-semibold">Image prête à être associée à l’article.</span>
                  <button type="button" onClick={() => setImageUrl("")} className="rounded p-1 hover:bg-green-100" aria-label="Retirer l’image">
                    <X size={15} />
                  </button>
                </div>
              )}
              <input
                name="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={inputCls}
                placeholder="Ou collez une URL d’image"
              />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Point focal horizontal">
              <input name="imageFocalX" type="range" min="0" max="100" value={focalX} onChange={(e) => setFocalX(Number(e.target.value))} className="w-full accent-green-600" />
              <span className="text-xs text-neutral-500">{focalX}%</span>
            </Field>
            <Field label="Point focal vertical">
              <input name="imageFocalY" type="range" min="0" max="100" value={focalY} onChange={(e) => setFocalY(Number(e.target.value))} className="w-full accent-green-600" />
              <span className="text-xs text-neutral-500">{focalY}%</span>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Emoji (repli)">
              <input
                name="imageEmoji"
                defaultValue={article?.imageEmoji ?? "📰"}
                onChange={(e) => setEmoji(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Dégradé">
              <select
                name="imageGradient"
                defaultValue={article?.imageGradient ?? GRADIENTS[0].v}
                onChange={(e) => setGradient(e.target.value)}
                className={inputCls}
              >
                {GRADIENTS.map((g) => (
                  <option key={g.v} value={g.v}>{g.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Crédit photo">
            <input name="credit" defaultValue={article?.credit} className={inputCls} placeholder="Photo Unsplash" />
          </Field>
          <Field label="Légende">
            <input name="legende" defaultValue={article?.legende} className={inputCls} />
          </Field>
          <Field label="Vues">
            <input type="number" name="vues" defaultValue={article?.vues ?? 0} className={inputCls} />
          </Field>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700"
          >
            <Save size={16} /> {mode === "new" ? "Créer l'article" : "Enregistrer"}
          </button>
          {article && (
            <Link
              href={`/${article.slug}`}
              target="_blank"
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
            >
              <Eye size={16} /> Aperçu
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-500">
        {label}
        {required && <span className="text-green-600"> *</span>}
        {hint && <span className="ml-1 font-normal normal-case text-neutral-400">({hint})</span>}
      </span>
      {children}
    </label>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-green-600" />
      {label}
    </label>
  );
}
