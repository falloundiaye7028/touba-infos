import Link from "next/link";

export default function AdForm({
  action,
  submitLabel,
  initial,
}: {
  action: (formData: FormData) => void;
  submitLabel: string;
  initial?: {
    name?: string;
    position?: string;
    imageUrl?: string;
    linkUrl?: string;
    label?: string;
    active?: boolean;
  };
}) {
  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <label className="grid gap-1 text-sm font-semibold text-neutral-700">
        Nom de l&apos;annonceur
        <input
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="Ex. PétroleGaz"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-neutral-700">
        Emplacement
        <select
          name="position"
          defaultValue={initial?.position ?? "sidebar"}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal"
        >
          <option value="top">Bandeau haut (au-dessus du menu)</option>
          <option value="leaderboard">Grand bandeau (sous la une)</option>
          <option value="sidebar">Colonne latérale</option>
        </select>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-neutral-700">
        Image (URL)
        <input
          name="imageUrl"
          required
          type="url"
          defaultValue={initial?.imageUrl}
          placeholder="https://…"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-neutral-700">
        Lien (URL)
        <input
          name="linkUrl"
          required
          type="url"
          defaultValue={initial?.linkUrl}
          placeholder="https://…"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-neutral-700">
        Libellé
        <input
          name="label"
          defaultValue={initial?.label ?? "Publicité"}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
          className="h-4 w-4"
        />
        Active
      </label>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
        >
          {submitLabel}
        </button>
        <Link href="/admin/ads" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100">
          Annuler
        </Link>
      </div>
    </form>
  );
}
