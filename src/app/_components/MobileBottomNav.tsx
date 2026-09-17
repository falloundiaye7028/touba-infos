"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, PlayCircle, Radio, Search } from "lucide-react";

const ITEMS = [
  { label: "Accueil", href: "/", Icon: Home, exact: true },
  { label: "Dernières", href: "/fil-info", Icon: Newspaper },
  { label: "Vidéos", href: "/videos", Icon: PlayCircle },
  { label: "Direct", href: "/direct", Icon: Radio },
  { label: "Recherche", href: "/recherche", Icon: Search },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname?.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between">
        {ITEMS.map(({ label, href, Icon, exact }) => {
          const on = active(href, exact);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
                  on ? "text-green-700" : "text-neutral-500"
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
