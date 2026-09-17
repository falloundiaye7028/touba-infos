import AdForm from "../../_components/AdForm";
import { createAdAction } from "../actions";

export const dynamic = "force-dynamic";

export default function NewAdPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-black text-neutral-900">Nouvelle publicité</h1>
      <p className="mb-5 text-sm text-neutral-500">Ajoutez un bandeau publicitaire.</p>
      <AdForm action={createAdAction} submitLabel="Créer la publicité" />
    </div>
  );
}
