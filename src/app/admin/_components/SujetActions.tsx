"use client";

import { useTransition } from "react";
import { Sparkles, X, Loader2, ExternalLink } from "lucide-react";
import { genererArticleAction, rejeterSujetAction } from "../agent-actions";

export default function SujetActions({
  sujetId,
  url,
}: {
  sujetId: string;
  url: string;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1.5">
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="Voir la source"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          <ExternalLink size={15} />
        </a>
      )}
      <button
        onClick={() => start(() => void genererArticleAction(sujetId))}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        {pending ? "Rédaction…" : "Générer"}
      </button>
      <button
        onClick={() => start(() => void rejeterSujetAction(sujetId))}
        disabled={pending}
        title="Rejeter"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
      >
        <X size={15} />
      </button>
    </div>
  );
}
