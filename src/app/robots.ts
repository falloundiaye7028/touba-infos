import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/preview-premium",
        "/newsletter/confirmer",
        "/newsletter/desinscription",
      ],
    },
    sitemap: [
      "https://toubainfos.com/sitemap.xml",
      "https://toubainfos.com/news-sitemap.xml",
    ],
  };
}
