"use client";

import { useTransition } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { lancerVeilleAction } from "../agent-actions";

export default function VeilleButton() {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => void lancerVeilleAction())}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
      {pending ? "Veille en cours…" : "Lancer la veille"}
    </button>
  );
}
