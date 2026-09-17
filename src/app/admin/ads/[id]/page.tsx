import { notFound } from "next/navigation";
import { getAd } from "@/lib/touba-infos-ads";
import AdForm from "../../_components/AdForm";
import { updateAdAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditAdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ad = await getAd(id);
  if (!ad) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-black text-neutral-900">Modifier la publicité</h1>
      <p className="mb-5 text-sm text-neutral-500">{ad.name}</p>
      <AdForm
        action={updateAdAction.bind(null, ad.id)}
        submitLabel="Enregistrer"
        initial={ad}
      />
    </div>
  );
}
