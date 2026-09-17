"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Logo officiel Touba Infos.
 *
 * Le fichier officiel doit être déposé dans `public/touba-infos-logo.png`
 * (ou .svg — adapter `LOGO_SRC`). Tant qu'il est absent, un rendu texte
 * fidèle à la charte (badge noir · « Touba » vert · « Infos » blanc) prend
 * le relais afin que l'interface ne soit jamais cassée.
 *
 * ⚠️ Ne pas recréer / restyliser le logo : ce composant se contente de
 * l'afficher tel quel une fois le fichier fourni.
 */
const LOGO_SRC = "/touba-infos-logo.png";

export default function Logo({
  className = "",
  height = 44,
  priority = false,
}: {
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Si l'image a déjà échoué avant l'hydratation, onError ne se déclenche pas :
  // on vérifie donc l'état de chargement au montage.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, []);

  if (!broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={LOGO_SRC}
        alt="Touba Infos"
        style={{ height }}
        className={`w-auto select-none ${className}`}
        onError={() => setBroken(true)}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    );
  }

  // ── Repli typographique (charte : noir + vert + blanc) ──
  return (
    <span
      aria-label="Touba Infos"
      className={`inline-flex items-center rounded-md bg-black px-3 shadow-sm ${className}`}
      style={{ height }}
    >
      <span
        className="font-black italic leading-none tracking-tight"
        style={{ fontSize: height * 0.5 }}
      >
        <span className="text-[#22a63a]">Touba</span>
        <span className="text-white">&nbsp;Infos</span>
      </span>
    </span>
  );
}
