"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    router.push(v ? `/recherche?q=${encodeURIComponent(v)}` : "/recherche");
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-1"
    >
      <Search size={20} className="text-neutral-400" />
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher un article, une personne, un mot-clé…"
        className="flex-1 bg-transparent py-3 text-sm outline-none placeholder-neutral-400"
      />
      <button
        type="submit"
        className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
      >
        Rechercher
      </button>
    </form>
  );
}
