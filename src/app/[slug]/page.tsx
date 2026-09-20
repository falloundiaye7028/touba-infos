import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Calendar, AlertTriangle } from "lucide-react";
import { getAuteur, slugCategorie, formatDateFr, formatDateHeureFr, MEDIA_URL } from "@/lib/touba-infos";
import {
  getArticleInfoBySlug,
  getArticlesInfoSimilaires,
  getDernieres,
} from "@/lib/touba-infos-store";

export const dynamic = "force-dynamic";
import {
  CardStandard,
  CardHorizontal,
  CategorieChip,
  EditorialImage,
  SectionHeading,
} from "../_components/ui";
import ShareButtons from "../_components/ShareButtons";

const SITE = MEDIA_URL;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleInfoBySlug(slug);
  if (!article) return { title: "Article introuvable" };

  const url = `${SITE}/${article.slug}`;
  const image = article.imageUrl ?? "/touba-infos-logo.png";

  return {
    title: article.titre,
    description: article.extrait,
    alternates: { canonical: url },
    openGraph: {
      title: article.titre,
      description: article.extrait,
      url,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.miseAJour ?? article.date,
      authors: [article.auteur],
      section: article.categorie,
      tags: article.tags,
      images: [{ url: image, alt: article.titre }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.titre,
      description: article.extrait,
      images: [image],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleInfoBySlug(slug);
  if (!article) notFound();

  const url = `${SITE}/${article.slug}`;
  const auteur = getAuteur(article.auteur);
  const similaires = await getArticlesInfoSimilaires(article);
  const dernieres = (await getDernieres(4))
    .filter((a) => a.id !== article.id)
    .slice(0, 3);
  const genreAffiche =
    article.genre !== "Actualité" ? article.genre : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    headline: article.titre,
    description: article.extrait,
    datePublished: article.date,
    dateModified: article.miseAJour ?? article.date,
    articleSection: article.categorie,
    keywords: article.tags.join(", "),
    author: article.auteur.toLowerCase().includes("rédaction")
      ? { "@type": "Organization", name: article.auteur }
      : { "@type": "Person", name: article.auteur },
    publisher: {
      "@type": "NewsMediaOrganization",
      "@id": `${SITE}/#organization`,
      name: "Touba Infos",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/touba-infos-logo.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: {
      "@type": "ImageObject",
      url: article.imageUrl ?? `${SITE}/touba-infos-logo.png`,
      caption: article.legende,
    },
    articleBody: stripHtml(article.contenu),
    isAccessibleForFree: true,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE}` },
      {
        "@type": "ListItem",
        position: 2,
        name: article.categorie,
        item: `${SITE}/rubrique/${slugCategorie(article.categorie)}`,
      },
      { "@type": "ListItem", position: 3, name: article.titre, item: url },
    ],
  };

  return (
    <article>
      {/* Fil d'Ariane */}
      <div className="border-b border-neutral-100 bg-neutral-50">
        <nav className="mx-auto flex max-w-3xl items-center gap-1.5 px-4 py-3 text-xs text-neutral-500">
          <Link href="/" className="hover:text-green-700">Accueil</Link>
          <ChevronRight size={13} />
          <Link
            href={`/rubrique/${slugCategorie(article.categorie)}`}
            className="hover:text-green-700"
          >
            {article.categorie}
          </Link>
          <ChevronRight size={13} />
          <span className="truncate text-neutral-400">{article.titre}</span>
        </nav>
      </div>

      {/* En-tête */}
      <header className="mx-auto max-w-3xl px-4 pt-8">
        <div className="flex items-center gap-2">
          <CategorieChip categorie={article.categorie} />
          {genreAffiche && (
            <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              {genreAffiche}
            </span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-neutral-900 sm:text-4xl">
          {article.titre}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-600">
          {article.sousTitre}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-neutral-100 py-4 text-sm text-neutral-500">
          <span className="font-bold text-neutral-800">{article.auteur}</span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} /> {formatDateFr(article.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> {article.tempsLecture} de lecture
          </span>
          {article.miseAJour && (
            <span className="text-green-700">
              Mis à jour le {formatDateHeureFr(article.miseAJour)}
            </span>
          )}
        </div>
      </header>

      {/* Image principale */}
      <figure className="mx-auto mt-6 max-w-4xl px-4">
        <div className="flex min-h-52 items-center justify-center rounded-2xl bg-neutral-100 p-2 sm:p-4">
          <EditorialImage article={article} mode="detail" priority emojiSize="text-[9rem]" />
        </div>
        {(article.legende || article.credit) && (
          <figcaption className="mt-2 px-1 text-xs text-neutral-500">
            {article.legende}
            {article.credit && (
              <span className="text-neutral-400"> — {article.credit}</span>
            )}
          </figcaption>
        )}
      </figure>

      {/* Partage (haut) */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <ShareButtons url={url} title={article.titre} />
      </div>

      {/* Corps */}
      <div
        className="ti-prose mx-auto max-w-3xl px-4 py-8"
        dangerouslySetInnerHTML={{ __html: article.contenu }}
      />

      {/* Tags */}
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Partage (bas) + signaler */}
      <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <ShareButtons url={url} title={article.titre} />
        <a
          href={`https://wa.me/221768001717?text=${encodeURIComponent(
            `Signalement d'erreur — article : ${article.titre}`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-red-600"
        >
          <AlertTriangle size={14} /> Signaler une erreur
        </a>
      </div>

      {/* Encadré auteur */}
      {auteur && (
        <div className="mx-auto mt-10 max-w-3xl px-4">
          <div className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-lg font-black text-white">
              {auteur.initiales}
            </div>
            <div>
              <p className="text-sm font-black text-neutral-900">{auteur.nom}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                {auteur.role}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                {auteur.bio}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* À lire aussi */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading titre="À lire aussi" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {similaires.map((a) => (
            <CardStandard key={a.id} article={a} />
          ))}
        </div>
      </section>

      {/* Dernières actualités */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading titre="Dernières actualités" href="/fil-info" hrefLabel="Fil info" />
          <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {dernieres.map((a) => (
              <div key={a.id} className="border-b border-neutral-200">
                <CardHorizontal article={a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </article>
  );
}
