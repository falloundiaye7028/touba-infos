import Link from "next/link";
import { Mail, Share2 } from "lucide-react";
import { adminListAll, getArticlesTries } from "@/lib/touba-infos-store";
import { VIDEOS_INFO } from "@/lib/touba-infos";
import {
  genererDiffusion,
  assemblerNewsletter,
  newsletterTexte,
} from "@/lib/touba-infos-diffusion";
import CopyBlock from "../_components/CopyBlock";

export default async function DiffusionPage({
  searchParams,
}: {
  searchParams: Promise<{ article?: string }>;
}) {
  const { article: articleId } = await searchParams;
  const tous = await adminListAll();
  const selected = articleId
    ? tous.find((a) => a.id === articleId)
    : tous.find((a) => (a.statut ?? "publie") === "publie") ?? tous[0];

  const diff = selected ? genererDiffusion(selected) : null;

  const publies = await getArticlesTries();
  const news = assemblerNewsletter(publies, VIDEOS_INFO);
  const newsTxt = newsletterTexte(news);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Share2 size={22} className="text-green-600" />
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Diffusion</h1>
          <p className="text-sm text-neutral-500">
            Résumés réseaux sociaux, notification push et newsletter — prêts à copier.
          </p>
        </div>
      </div>

      {/* Réseaux sociaux */}
      <section className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-black text-neutral-900">Réseaux sociaux &amp; notification</h2>
          <form className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Article
            </label>
            <select
              name="article"
              defaultValue={selected?.id}
              className="max-w-xs rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
            >
              {tous.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.titre.slice(0, 60)}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700">
              Générer
            </button>
          </form>
        </div>

        {diff ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <CopyBlock label="Facebook" text={diff.facebook} icon="facebook" />
            <CopyBlock label="WhatsApp" text={diff.whatsapp} icon="whatsapp" />
            <CopyBlock label="X (Twitter)" text={diff.x} icon="x" max={280} />
            <CopyBlock label="Script TikTok / Reels" text={diff.tiktok} icon="tiktok" />
            <CopyBlock label="Notification — titre" text={diff.pushTitre} icon="push" max={60} />
            <CopyBlock label="Notification — corps" text={diff.pushCorps} icon="push" max={120} />
          </div>
        ) : (
          <p className="text-sm text-neutral-400">Aucun article disponible.</p>
        )}
      </section>

      {/* Newsletter */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-black text-neutral-900">
            <Mail size={18} className="text-green-600" /> Newsletter du jour
          </h2>
          <Link
            href="/newsletter"
            target="_blank"
            className="text-sm font-bold text-green-700 hover:text-green-800"
          >
            Page d&apos;abonnement →
          </Link>
        </div>
        <CopyBlock label="L'essentiel de Touba Infos" text={newsTxt} icon="mail" />
        <p className="mt-3 text-xs text-neutral-400">
          Assemblée automatiquement à partir des derniers articles publiés (5 à la
          une, 3 Touba, 3 Sénégal, 1 Afrique/Monde, 1 vidéo). L&apos;envoi reste
          manuel — brancher ici votre outil d&apos;emailing.
        </p>
      </section>
    </div>
  );
}
