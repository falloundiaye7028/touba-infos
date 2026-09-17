"use client";

import { usePathname } from "next/navigation";

/**
 * Habillage média public. Masqué sur l'espace d'administration
 * (`/admin`) qui possède sa propre interface.
 * Les blocs serveur (breaking, header, footer…) sont passés en props
 * déjà rendus, puis affichés ou non selon la route.
 */
export default function InfosChrome({
  breaking,
  header,
  footer,
  bottomNav,
  whatsapp,
  jsonLd,
  topAd,
  children,
}: {
  breaking: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  bottomNav: React.ReactNode;
  whatsapp: React.ReactNode;
  jsonLd: React.ReactNode;
  topAd: { name: string; imageUrl: string; linkUrl: string } | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {topAd && (
        <aside className="relative w-full bg-neutral-100" aria-label={topAd.name}>
          <span className="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            Publicité
          </span>
          <a
            href={topAd.linkUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            aria-label={topAd.name}
            className="block w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={topAd.imageUrl} alt={topAd.name} className="h-auto w-full" loading="eager" />
          </a>
        </aside>
      )}
      {breaking}
      {header}
      <main className="pb-16 lg:pb-0">{children}</main>
      {footer}
      {bottomNav}
      {whatsapp}
      {jsonLd}
    </>
  );
}
