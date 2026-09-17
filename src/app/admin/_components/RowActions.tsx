"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  Pencil,
  Star,
  Zap,
  Eye,
  Trash2,
  CheckCircle2,
  CircleSlash,
} from "lucide-react";
import type { ArticleInfo } from "@/lib/touba-infos";
import {
  toggleAction,
  setStatutAction,
  deleteArticleAction,
} from "../actions";

export default function RowActions({ article }: { article: ArticleInfo }) {
  const [pending, start] = useTransition();
  const publie = (article.statut ?? "publie") === "publie";

  const run = (fn: () => Promise<unknown>) => start(() => void fn());

  return (
    <div
      className={`flex items-center justify-end gap-1 ${pending ? "opacity-50" : ""}`}
    >
      <IconBtn
        title={publie ? "Dépublier" : "Publier"}
        onClick={() =>
          run(() => setStatutAction(article.id, publie ? "brouillon" : "publie"))
        }
        active={publie}
        activeCls="text-green-600"
      >
        {publie ? <CheckCircle2 size={16} /> : <CircleSlash size={16} />}
      </IconBtn>
      <IconBtn
        title="À la Une"
        onClick={() => run(() => toggleAction(article.id, "alaUne"))}
        active={!!article.alaUne}
        activeCls="text-yellow-500"
      >
        <Star size={16} className={article.alaUne ? "fill-current" : ""} />
      </IconBtn>
      <IconBtn
        title="Dernière minute"
        onClick={() => run(() => toggleAction(article.id, "breaking"))}
        active={!!article.breaking}
        activeCls="text-red-600"
      >
        <Zap size={16} className={article.breaking ? "fill-current" : ""} />
      </IconBtn>
      <Link
        href={`/${article.slug}`}
        target="_blank"
        title="Aperçu"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
      >
        <Eye size={16} />
      </Link>
      <Link
        href={`/admin/articles/${article.id}`}
        title="Modifier"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-green-700"
      >
        <Pencil size={16} />
      </Link>
      <IconBtn
        title="Supprimer"
        onClick={() => {
          if (confirm(`Supprimer définitivement « ${article.titre} » ?`))
            run(() => deleteArticleAction(article.id));
        }}
        active={false}
        activeCls=""
        danger
      >
        <Trash2 size={16} />
      </IconBtn>
    </div>
  );
}

function IconBtn({
  title,
  onClick,
  active,
  activeCls,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  active: boolean;
  activeCls: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-neutral-100 ${
        active ? activeCls : danger ? "text-neutral-400 hover:text-red-600" : "text-neutral-400 hover:text-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}
