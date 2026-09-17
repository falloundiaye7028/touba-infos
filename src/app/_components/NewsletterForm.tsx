"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";

export default function NewsletterForm({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    // Démo : aucune donnée n'est envoyée. Brancher ici l'API newsletter.
    setOk(true);
    setEmail("");
  };

  const dark = variant === "dark";

  if (ok) {
    return (
      <div
        className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
          dark ? "bg-white/10 text-white" : "bg-green-50 text-green-700"
        }`}
      >
        <Check size={18} /> Merci ! Votre abonnement de démonstration est
        enregistré.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <div
        className={`flex flex-1 items-center gap-2 rounded-xl border px-3 ${
          dark
            ? "border-white/20 bg-white/10"
            : "border-neutral-300 bg-white"
        }`}
      >
        <Mail size={18} className={dark ? "text-white/60" : "text-neutral-400"} />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse e-mail"
          className={`w-full bg-transparent py-3 text-sm outline-none ${
            dark
              ? "text-white placeholder-white/50"
              : "text-neutral-800 placeholder-neutral-400"
          }`}
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700"
      >
        Je m&apos;abonne
      </button>
    </form>
  );
}
