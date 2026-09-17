"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";

const MOTIFS = [
  "Contacter la rédaction",
  "Partenariat",
  "Publicité",
  "Signaler une information",
  "Demande d'interview",
  "Rectification / correction",
  "Assistance",
];

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-6 text-green-800">
        <Check size={22} />
        <div>
          <p className="font-bold">Message enregistré (démonstration).</p>
          <p className="text-sm">
            Le formulaire est prêt à être branché sur la messagerie de la
            rédaction.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom complet" name="nom" required />
        <Field label="Téléphone" name="tel" type="tel" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="E-mail" name="email" type="email" required />
        <div>
          <label className="mb-1 block text-sm font-semibold text-neutral-700">
            Motif
          </label>
          <select
            name="motif"
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
          >
            {MOTIFS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-neutral-700">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
          placeholder="Votre message…"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
      >
        <Send size={16} /> Envoyer le message
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-neutral-700">
        {label} {required && <span className="text-green-600">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
      />
    </div>
  );
}
