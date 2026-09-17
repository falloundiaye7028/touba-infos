"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Newspaper, PlusCircle, Radar, Share2, BookOpen } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", Icon: LayoutDashboard, exact: true },
  { href: "/admin/articles", label: "Articles", Icon: Newspaper, exact: false },
  { href: "/admin/articles/new", label: "Nouvel article", Icon: PlusCircle, exact: false },
  { href: "/admin/ebooks", label: "Ebooks", Icon: BookOpen, exact: false },
  { href: "/admin/agent", label: "Agent IA", Icon: Radar, exact: false },
  { href: "/admin/diffusion", label: "Diffusion", Icon: Share2, exact: false },
];

export default function AdminNav() {
  const pathname = usePathname();
  const active = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(href + "/");

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map(({ href, label, Icon, exact }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            active(href, exact)
              ? "bg-white/15 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
