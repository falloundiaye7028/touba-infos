import { NextResponse } from "next/server";
import { MEDIA_URL } from "@/lib/touba-infos";
import { getArticlesTries } from "@/lib/touba-infos-store";

export const revalidate = 300;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const now = Date.now();
  const fenetre = 48 * 60 * 60 * 1000;

  // Google News n'accepte que les articles publiés dans les dernières 48 h.
  const articles = (await getArticlesTries())
    .map((a) => ({ article: a, t: new Date(a.date).getTime() }))
    .filter(({ t }) => !Number.isNaN(t) && now - t <= fenetre)
    .sort((x, y) => y.t - x.t)
    .map(({ article, t }) => ({
      slug: article.slug,
      titre: article.titre,
      date: new Date(t).toISOString(),
    }));

  const items = articles
    .map(
      (a) => `  <url>
    <loc>${MEDIA_URL}/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Touba Infos</news:name>
        <news:language>fr</news:language>
      </news:publication>
      <news:publication_date>${a.date}</news:publication_date>
      <news:title>${escapeXml(a.titre)}</news:title>
    </news:news>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
