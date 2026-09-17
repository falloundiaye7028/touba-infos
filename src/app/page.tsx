import Link from "next/link";
import { AlertCircle, ArrowRight, Bell, Newspaper, PlayCircle, Send } from "lucide-react";
import { slugCategorie, type ArticleInfo } from "@/lib/touba-infos";
import { getArticlesTries } from "@/lib/touba-infos-store";
import {
  CardCompact,
  CardHorizontal,
  CardStandard,
  CategorieChip,
  EditorialImage,
  ManagedAd,
  SectionHeading,
  SidebarAds,
} from "./_components/ui";

export const revalidate = 20;

export const metadata = {
  title: { absolute: "Touba Infos — L’actualité de Touba, du Sénégal et du monde" },
  alternates: { canonical: "/" },
};

export default async function ToubaInfosHome() {
  try {
    const articles = await getArticlesTries();
    const une = articles.find((article) => article.alaUne) ?? articles[0];
    const suite = articles.filter((article) => article.id !== une?.id);

    if (!une) return <EmptyState />;

    const manchettes = suite.slice(0, 4);
    const dernieres = suite.slice(4, 12);
    const plusLus = [...articles].sort((a, b) => b.vues - a.vues).slice(0, 5);
    const touba = articles.filter((article) => article.categorie === "Touba").slice(0, 4);
    const politique = articles.filter((article) => article.categorie === "Politique").slice(0, 4);
    const economie = articles.filter((article) => article.categorie === "Économie").slice(0, 4);
    const societe = articles.filter((article) => article.categorie === "Société").slice(0, 4);
    const videos = articles
      .filter((article) => article.genre === "Vidéo" || article.youtubeId)
      .slice(0, 3);

    return (
      <>
        <TopHeadlines une={une} manchettes={manchettes} />

        <section className="mx-auto max-w-[1400px] px-4 py-8">
          <ManagedAd position="leaderboard" />
        </section>

        <section className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-12 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div>
            <SectionHeading titre="Dernières actualités" href="/fil-info" hrefLabel="Tout le fil" />
            <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
              {dernieres.slice(0, 6).map((article) => (
                <CardStandard key={article.id} article={article} />
              ))}
            </div>

            <div className="mt-10">
              <EditorialSection
                title="Touba"
                articles={touba}
                href="/rubrique/touba"
                accent="green"
              />
            </div>
          </div>

          <aside className="space-y-7">
            <div className="border-t-4 border-green-600 bg-neutral-50 p-5">
              <SectionHeading titre="Les plus lus" />
              <div>
                {plusLus.map((article, index) => (
                  <CardCompact key={article.id} article={article} index={index + 1} />
                ))}
              </div>
            </div>
            <SidebarAds />
            <div className="bg-neutral-950 p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-green-400">Touba Infos</p>
              <h2 className="mt-3 text-2xl font-black leading-tight">Toute l’actualité, directement dans votre boîte mail.</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-300">Recevez l’essentiel de Touba et du Sénégal sans manquer les dernières informations.</p>
              <Link href="/newsletter" className="mt-5 inline-flex items-center gap-2 bg-green-600 px-4 py-3 text-sm font-black text-white hover:bg-green-700">
                S’abonner <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </section>

        <section className="border-y border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-[1400px] px-4 py-12">
            <div className="grid gap-10 lg:grid-cols-3">
              <EditorialColumn title="Politique" articles={politique} href="/rubrique/politique" />
              <EditorialColumn title="Économie" articles={economie} href="/rubrique/economie" />
              <EditorialColumn title="Société" articles={societe} href="/rubrique/societe" />
            </div>
          </div>
        </section>

        {videos.length > 0 && (
          <section className="bg-neutral-950 text-white">
            <div className="mx-auto max-w-[1400px] px-4 py-12">
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/15 pb-3">
                <h2 className="flex items-center gap-2 text-xl font-black uppercase">
                  <PlayCircle className="text-red-500" /> Touba Infos TV
                </h2>
                <Link href="/videos" className="text-xs font-black uppercase tracking-wide text-green-400">
                  Toutes les vidéos
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {videos.map((article) => (
                  <Link key={article.id} href={`/${article.slug}`} className="group">
                    <div className="relative aspect-video overflow-hidden bg-neutral-900">
                      <EditorialImage article={article} />
                      <div className="absolute inset-0 grid place-items-center bg-black/20">
                        <PlayCircle size={54} className="text-white drop-shadow-lg transition-transform group-hover:scale-110" />
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-black uppercase text-green-400">{article.categorie}</p>
                    <h3 className="mt-1 text-lg font-black leading-snug group-hover:text-green-300">{article.titre}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1400px] px-4 py-12">
          <SectionHeading titre="Explorer toutes les rubriques" />
          <div className="flex flex-wrap gap-2">
            {[...new Set(articles.map((article) => article.categorie))].map((categorie) => (
              <Link
                key={categorie}
                href={`/rubrique/${slugCategorie(categorie)}`}
                className="border border-neutral-300 bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-neutral-700 hover:border-green-600 hover:bg-green-50 hover:text-green-700"
              >
                {categorie}
              </Link>
            ))}
          </div>
        </section>
      </>
    );
  } catch {
    return <ErrorState />;
  }
}

function TopHeadlines({ une, manchettes }: { une: ArticleInfo; manchettes: ArticleInfo[] }) {
  return (
    <section className="border-b border-neutral-300 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="mb-4 flex items-center gap-3 border-b-2 border-neutral-950 pb-2">
          <span className="bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">À la une</span>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Les principales informations du moment</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(420px,1fr)]">
          <Link href={`/${une.slug}`} className="group relative isolate flex min-w-0 flex-col overflow-hidden bg-neutral-950 lg:min-h-[430px]">
            <div className="relative z-0 aspect-video overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto">
              <EditorialImage article={une} emojiSize="text-[10rem]" priority />
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 hidden bg-gradient-to-t from-black via-black/60 to-transparent lg:block" />
            <div className="relative z-20 p-5 sm:p-8 lg:mt-auto">
              <CategorieChip categorie={une.categorie} />
              <h1 className="mt-3 max-w-4xl text-3xl font-black leading-[1.03] text-white sm:text-4xl xl:text-5xl">{une.titre}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-200 sm:text-base lg:line-clamp-2">{une.extrait}</p>
            </div>
          </Link>
          <div className="grid gap-4 sm:grid-cols-2">
            {manchettes.map((article) => (
              <Link key={article.id} href={`/${article.slug}`} className="group border-b border-neutral-200 pb-4 sm:border-b-0 sm:pb-0">
                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                  <EditorialImage article={article} />
                  <div className="absolute left-3 top-3"><CategorieChip categorie={article.categorie} /></div>
                </div>
                <h2 className="mt-2.5 text-base font-black leading-snug text-neutral-950 line-clamp-3 group-hover:text-green-700">{article.titre}</h2>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EditorialSection({
  title,
  articles,
  href,
  accent,
}: {
  title: string;
  articles: ArticleInfo[];
  href: string;
  accent: "green" | "red" | "neutral";
}) {
  if (!articles.length) return null;
  return (
    <div>
      <SectionHeading titre={title} href={href} accent={accent} />
      <div className="grid gap-6 md:grid-cols-2">
        {articles.map((article) => <CardStandard key={article.id} article={article} />)}
      </div>
    </div>
  );
}

function EditorialColumn({ title, articles, href }: { title: string; articles: ArticleInfo[]; href: string }) {
  if (!articles.length) return null;
  const [lead, ...rest] = articles;
  return (
    <div>
      <SectionHeading titre={title} href={href} />
      <CardStandard article={lead} />
      <div className="mt-2 divide-y divide-neutral-200">
        {rest.map((article) => <CardHorizontal key={article.id} article={article} />)}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <Newspaper size={42} className="text-green-700" />
      <h1 className="mt-5 text-3xl font-black text-neutral-900">La rédaction prépare ses prochaines publications.</h1>
      <p className="mt-3 max-w-xl text-neutral-600">Aucun article publié n’est disponible pour le moment. Revenez bientôt ou contactez la rédaction.</p>
      <Link href="/contact#alerte" className="mt-7 inline-flex items-center gap-2 bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700">Contacter la rédaction <Send size={16} /></Link>
    </section>
  );
}

function ErrorState() {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <AlertCircle size={42} className="text-amber-600" />
      <h1 className="mt-5 text-3xl font-black text-neutral-900">Les actualités sont temporairement indisponibles.</h1>
      <p className="mt-3 max-w-xl text-neutral-600">La rédaction reste accessible pendant le rétablissement du service.</p>
      <Link href="/contact#alerte" className="mt-7 inline-flex items-center gap-2 bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700">Contacter la rédaction <Bell size={16} /></Link>
    </section>
  );
}
