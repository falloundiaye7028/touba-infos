import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { adminGetById } from "@/lib/touba-infos-store";
import ArticleForm from "../../_components/ArticleForm";
import { updateArticleAction } from "../../actions";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;
  const article = await adminGetById(id);
  if (!article) notFound();

  const action = updateArticleAction.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-green-700"
      >
        <ArrowLeft size={15} /> Articles
      </Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-neutral-900">Modifier l&apos;article</h1>
        {ok && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
            <CheckCircle2 size={16} /> {ok === "cree" ? "Article créé." : "Modifications enregistrées."}
          </span>
        )}
      </div>
      <ArticleForm mode="edit" article={article} action={action} />
    </div>
  );
}
