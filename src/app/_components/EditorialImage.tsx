"use client";

import { useEffect, useRef, useState } from "react";
import type { ArticleInfo } from "@/lib/touba-infos";
import { editorialImageSrc, focalPosition } from "@/lib/touba-infos-image";

type ImageMode = "card" | "detail";

/** Les cartes conservent leur cadre, sans couper la photo : le décor flouté
 * reste purement décoratif et l'image éditoriale au premier plan reste nette. */
export default function EditorialImage({
  article,
  className = "",
  emojiSize = "text-6xl",
  mode = "card",
  priority = false,
}: {
  article: Pick<ArticleInfo, "imageGradient" | "imageEmoji" | "imageUrl" | "imageFocalX" | "imageFocalY" | "titre">;
  className?: string;
  emojiSize?: string;
  mode?: ImageMode;
  priority?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, [article.imageUrl]);

  const src = editorialImageSrc(article.imageUrl);
  const focal = focalPosition(article.imageFocalX, article.imageFocalY);
  if (src && !broken) {
    if (mode === "card") {
      return (
        <>
          <div
            aria-hidden="true"
            className="absolute -inset-3 bg-neutral-200 bg-cover bg-center opacity-70 blur-xl brightness-75"
            style={{ backgroundImage: `url("${src}")`, backgroundPosition: focal }}
          />
          {/* Native img keeps Blob delivery untouched and accepts arbitrary existing image hosts. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={ref}
            src={src}
            alt={article.titre}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            onError={() => setBroken(true)}
            style={{ objectPosition: focal }}
            className={`relative z-10 h-full w-full object-contain ${className}`}
          />
        </>
      );
    }

    return (
      // Native img keeps Blob delivery untouched and accepts arbitrary existing image hosts.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={src}
        alt={article.titre}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        onError={() => setBroken(true)}
        style={{ objectPosition: focal, aspectRatio: "auto 16 / 10" }}
        className={`max-h-[min(70vh,720px)] w-auto max-w-full object-contain ${className}`}
      />
    );
  }
  return <div className={`flex ${mode === "detail" ? "min-h-52 w-full" : "h-full w-full"} items-center justify-center bg-gradient-to-br ${article.imageGradient} ${className}`}><span className={`select-none opacity-40 ${emojiSize}`}>{article.imageEmoji}</span></div>;
}
