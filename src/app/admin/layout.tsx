import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { isAuthed } from "@/lib/touba-infos-admin";
import Logo from "../_components/Logo";
import AdminLogin from "./_components/AdminLogin";
import AdminNav from "./_components/AdminNav";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthed())) {
    return (
      <Suspense>
        <AdminLogin />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Barre admin */}
      <header className="sticky top-0 z-40 bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="rounded bg-black/40 p-0.5">
                <Logo height={30} />
              </span>
              <span className="hidden text-xs font-bold uppercase tracking-widest text-white/50 md:inline">
                Rédaction
              </span>
            </Link>
            <AdminNav />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ExternalLink size={15} /> <span className="hidden sm:inline">Voir le site</span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                <LogOut size={15} /> <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
