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
