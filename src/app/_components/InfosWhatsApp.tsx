"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function InfosWhatsApp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 lg:bottom-6">
      {open && (
        <div className="w-64 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-neutral-900">
              Vous avez une information&nbsp;?
            </p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="text-neutral-400 hover:text-neutral-700"
            >
              <X size={16} />
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            Contactez la rédaction de Touba Infos sur WhatsApp. Les informations
            sont vérifiées avant toute publication.
          </p>
          <a
            href="https://wa.me/221768001717?text=Bonjour%20Touba%20Infos%2C%20j%27ai%20une%20information%20%C3%A0%20vous%20transmettre."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95"
          >
            Alerter la rédaction
          </a>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Alerter la rédaction"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
