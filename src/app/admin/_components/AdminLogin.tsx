"use client";

import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import Logo from "../../_components/Logo";
import { loginAction } from "../actions";

export default function AdminLogin() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex justify-center">
          <Logo height={44} />
        </div>
        <h1 className="mt-6 text-center text-lg font-black text-neutral-900">
          Espace rédaction
        </h1>
        <p className="mt-1 text-center text-sm text-neutral-500">
          Connectez-vous pour gérer les contenus.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700">
            Mot de passe incorrect.
          </p>
        )}

        <form action={loginAction} className="mt-6 space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-300 px-3">
            <Lock size={18} className="text-neutral-400" />
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="Mot de passe"
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700"
          >
            Se connecter
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-neutral-400">
          Démo : mot de passe par défaut <code className="font-mono">touba-infos</code>
          <br />(définir <code className="font-mono">TI_ADMIN_PASSWORD</code> en production)
        </p>
      </div>
    </div>
  );
}
