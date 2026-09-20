"use client";

import { useTransition } from "react";

import type { ArticleInfo } from "@/lib/touba-infos";

import { deleteArticleAction, setStatutAction } from "../actions";

export default function AIDraftActions({ article }: { article: ArticleInfo }) {
  const [pending, start] = useTransition();

  return (
    <div
      className={`flex items-center justify-end gap-2 ${
        pending ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => start(() => setStatutAction(article.id, "publie"))}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
      >
        Publier
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Supprimer définitivement « ${article.titre} » ?`))
            start(() => deleteArticleAction(article.id));
        }}
        className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-200 hover:bg-red-50"
      >
        Supprimer
      </button>
    </div>
  );
}
