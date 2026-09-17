import type { Metadata } from "next";
import { MEDIA_URL } from "@/lib/touba-infos";
import BreakingBar from "./_components/BreakingBar";
import InfosHeader from "./_components/InfosHeader";
import InfosFooter from "./_components/InfosFooter";
import MobileBottomNav from "./_components/MobileBottomNav";
import InfosWhatsApp from "./_components/InfosWhatsApp";
import InfosChrome from "./_components/InfosChrome";

export const metadata: Metadata = {
  title: {
    default:
      "Touba Infos — L'actualité de Touba, du Sénégal et du monde",
    template: "%s · Touba Infos",
  },
  description:
    "Touba Infos, média numérique d'information générale. Suivez l'actualité de Touba, du Sénégal, de l'Afrique et du monde : politique, société, économie, religion, Grand Magal, sport, culture, vidéos et interviews.",
  applicationName: "Touba Infos",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  keywords: [
    "Touba Infos",
    "actualité Touba",
    "actualité Sénégal",
    "Grand Magal",
    "Mourides",
    "religion Touba",
    "politique Sénégal",
    "économie Sénégal",
    "société",
    "sport",
    "Dakar",
    "Sénégal",
  ],
  appleWebApp: {
    title: "Touba Infos",
    statusBarStyle: "default",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  metadataBase: new URL(MEDIA_URL),
  openGraph: {
    siteName: "Touba Infos",
    locale: "fr_SN",
    type: "website",
    url: MEDIA_URL,
    title: "Touba Infos — L'actualité de Touba, du Sénégal et du monde",
    description:
      "Média numérique d'information générale. L'information au cœur de Touba, ouverte sur le monde.",
    images: [{ url: `${MEDIA_URL}/touba-infos-logo.png`, alt: "Touba Infos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Touba Infos",
    description:
      "L'actualité de Touba, du Sénégal, de l'Afrique et du monde.",
    images: [`${MEDIA_URL}/touba-infos-logo.png`],
  },
};

export default function ToubaInfosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ti-root min-h-screen bg-[#ffffff] text-neutral-900">
      <InfosChrome
        breaking={<BreakingBar />}
        header={<InfosHeader />}
        footer={<InfosFooter />}
        bottomNav={<MobileBottomNav />}
        whatsapp={<InfosWhatsApp />}
        jsonLd={
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "NewsMediaOrganization",
                  "@id": `${MEDIA_URL}/#organization`,
                  name: "Touba Infos",
                  url: MEDIA_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${MEDIA_URL}/touba-infos-logo.png`,
                    width: 800,
                    height: 278,
                  },
                  slogan:
                    "L'information au cœur de Touba, ouverte sur le monde.",
                  areaServed: ["Touba", "Sénégal", "Afrique", "Monde"],
                  sameAs: [
                    "https://www.tiktok.com/@yoonu_murid_digital",
                    "https://facebook.com",
                    "https://youtube.com",
                    "https://instagram.com",
                  ],
                  contactPoint: {
                    "@type": "ContactPoint",
                    telephone: "+221776866181",
                    contactType: "customer service",
                    availableLanguage: ["fr", "wo"],
                  },
                }),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "@id": `${MEDIA_URL}/#website`,
                  url: MEDIA_URL,
                  name: "Touba Infos",
                  publisher: { "@id": `${MEDIA_URL}/#organization` },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: `${MEDIA_URL}/recherche?q={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                  },
                }),
              }}
            />
          </>
        }
      >
        {children}
      </InfosChrome>
    </div>
  );
}
