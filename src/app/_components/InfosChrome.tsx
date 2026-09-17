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
  children,
}: {
  breaking: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  bottomNav: React.ReactNode;
  whatsapp: React.ReactNode;
  jsonLd: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <aside className="relative w-full bg-neutral-100" aria-label="PétroleGaz — Votre PME mérite sa part du pétrole et du gaz sénégalais. Inscrivez votre PME.">
        <span className="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          Publicité
        </span>
        <a
          href="https://petrolegaz.com/"
          target="_blank"
          rel="sponsored noopener noreferrer"
          aria-label="PétroleGaz — Votre PME mérite sa part du pétrole et du gaz sénégalais. Inscrivez votre PME."
          className="block w-full"
        >
          <img
            src="https://876xi1t4drtxireu.public.blob.vercel-storage.com/touba-infos/articles/petrolegaz-banniere-6oHeBA2L5dfvSKhurKO08SeMIvDqmt.png"
            alt="PétroleGaz — Votre PME mérite sa part du pétrole et du gaz sénégalais. Inscrivez votre PME."
            className="h-auto w-full"
            width="2022"
            height="778"
            loading="eager"
          />
        </a>
      </aside>
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
