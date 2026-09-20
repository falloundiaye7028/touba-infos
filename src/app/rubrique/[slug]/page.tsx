import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  categorieFromSlug,
  genreFromSlug,
  GENRE_LABEL_PLURIEL,
  EMOJI_CATEGORIES,
  MEDIA_URL,
  type ArticleInfo,
} from "@/lib/touba-infos";
import {
  getArticlesInfoByCategorie,
  getArticlesInfoByGenre,
} from "@/lib/touba-infos-store";
import { CardStandard, CardHorizontal, EditorialImage, CategorieChip } from "../../_components/ui";

export const dynamic = "force-dynamic";

async function resolve(slug: string): Promise<{
  titre: string;
  intro: string;
  emoji: string;
  items: ArticleInfo[];
} | null> {
  const cat = categorieFromSlug(slug);
  if (cat) {
    return {
      titre: cat,
      intro: `Toute l'actualité « ${cat} » sur Touba Infos.`,
      emoji: EMOJI_CATEGORIES[cat],
      items: await getArticlesInfoByCategorie(cat),
    };
  }
  const genre = genreFromSlug(slug);
  if (genre) {
    return {
      titre: GENRE_LABEL_PLURIEL[slug] ?? genre,
      intro: `Les ${(GENRE_LABEL_PLURIEL[slug] ?? genre).toLowerCase()} de la rédaction de Touba Infos.`,
      emoji: "📝",
      items: await getArticlesInfoByGenre(genre),
    };
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await resolve(slug);
  if (!data) return { title: "Rubrique introuvable" };
  return {
    title: data.titre,
    description: data.intro,
    alternates: { canonical: `${MEDIA_URL}/rubrique/${slug}` },
  };
}

export default async function RubriquePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await resolve(slug);
  if (!data) notFound();

  const { titre, intro, emoji, items } = data;
  const lead = items[0];
  const suite = items.slice(1);

  return (
    <div>
      {/* Fil d'Ariane */}
      <div className="border-b border-neutral-100 bg-neutral-50">
        <nav className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-xs text-neutral-500">
          <Link href="/" className="hover:text-green-700">Accueil</Link>
          <ChevronRight size={13} />
          <span className="text-neutral-400">{titre}</span>
        </nav>
      </div>

      {/* En-tête de rubrique */}
      <header className="mx-auto max-w-7xl px-4 pt-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
            {titre}
          </h1>
        </div>
        <p className="mt-2 text-neutral-500">{intro}</p>
        <div className="mt-4 h-1 w-16 rounded-full bg-green-600" />
      </header>

      {items.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <p className="text-5xl">🗞️</p>
          <p className="mt-4 text-neutral-500">
            Aucun article publié dans cette rubrique pour le moment.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-10">
          {/* Article principal de la rubrique */}
          <Link href={`/${lead.slug}`} className="group grid gap-6 md:grid-cols-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
              <EditorialImage article={lead} emojiSize="text-8xl" />
              <div className="absolute left-3 top-3">
                <CategorieChip categorie={lead.categorie} />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-black leading-tight text-neutral-900 group-hover:text-green-700 sm:text-3xl">
                {lead.titre}
              </h2>
              <p className="mt-3 text-neutral-600">{lead.sousTitre}</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700">{lead.auteur}</span>
                <span>•</span>
                <span>{lead.tempsLecture}</span>
              </div>
            </div>
          </Link>

          {suite.length > 0 && (
            <>
              <div className="my-10 border-t border-neutral-200" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {suite.map((a) => (
                  <CardStandard key={a.id} article={a} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
