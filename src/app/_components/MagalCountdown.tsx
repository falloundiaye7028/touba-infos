"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const now = Date.now();
  const d = Math.max(0, target - now);
  return {
    passed: d === 0,
    jours: Math.floor(d / 86400000),
    heures: Math.floor((d / 3600000) % 24),
    minutes: Math.floor((d / 60000) % 60),
    secondes: Math.floor((d / 1000) % 60),
  };
}

export default function MagalCountdown({
  dateISO,
  variant = "band",
}: {
  dateISO: string;
  variant?: "band" | "hero";
}) {
  const target = new Date(dateISO).getTime();
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells = [
    { v: t?.jours, l: "Jours" },
    { v: t?.heures, l: "Heures" },
    { v: t?.minutes, l: "Min" },
    { v: t?.secondes, l: "Sec" },
  ];

  const big = variant === "hero";

  return (
    <div className="flex gap-2 sm:gap-3">
      {cells.map((c) => (
        <div
          key={c.l}
          className={`flex min-w-[3.5rem] flex-col items-center rounded-xl bg-white/15 backdrop-blur ${
            big ? "px-4 py-3" : "px-3 py-2"
          }`}
        >
          <span
            className={`font-black tabular-nums leading-none text-white ${
              big ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
            }`}
          >
            {t ? String(c.v).padStart(2, "0") : "--"}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/70">
            {c.l}
          </span>
        </div>
      ))}
    </div>
  );
}
