import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ArticleForm from "../../_components/ArticleForm";
import { createArticleAction } from "../../actions";

export default function NewArticlePage() {
  return (
    <div>
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-green-700"
      >
        <ArrowLeft size={15} /> Articles
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-black text-neutral-900">
        Nouvel article
      </h1>
      <ArticleForm mode="new" action={createArticleAction} />
    </div>
  );
}
