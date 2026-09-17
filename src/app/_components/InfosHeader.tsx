"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Radio,
  Menu,
  X,
  ChevronDown,
  Facebook,
  Youtube,
  Instagram,
} from "lucide-react";
import Logo from "./Logo";

type NavItem = { label: string; href: string };

// Navigation principale : uniquement les grandes rubriques éditoriales.
// Les rubriques spécialisées et les formats sont regroupés dans « Plus »
// afin de garder un en-tête lisible sur desktop comme sur mobile.
const NAV_PRIMARY: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Touba", href: "/rubrique/touba" },
  { label: "Sénégal", href: "/rubrique/senegal" },
  { label: "Politique", href: "/rubrique/politique" },
  { label: "Économie", href: "/rubrique/economie" },
  { label: "Société", href: "/rubrique/societe" },
  { label: "Religion", href: "/rubrique/religion" },
  { label: "Magal", href: "/magal" },
  { label: "Afrique", href: "/rubrique/afrique" },
  { label: "International", href: "/rubrique/international" },
  { label: "Sport", href: "/rubrique/sport" },
  { label: "Culture", href: "/rubrique/culture" },
];

const NAV_PLUS: NavItem[] = [
  // Rubriques spécialisées
  { label: "Santé", href: "/rubrique/sante" },
  { label: "Éducation", href: "/rubrique/education" },
  { label: "Environnement", href: "/rubrique/environnement" },
  { label: "Diaspora", href: "/rubrique/diaspora" },
  { label: "Technologies", href: "/rubrique/technologies" },
  // Formats éditoriaux
  { label: "Interviews", href: "/rubrique/interviews" },
  { label: "Analyses", href: "/rubrique/analyses" },
  { label: "Communiqués", href: "/rubrique/communiques" },
  { label: "Vidéos", href: "/videos" },
  { label: "Ebooks", href: "/ebooks" },
  // Services
  { label: "Fil info", href: "/fil-info" },
  { label: "En direct", href: "/direct" },
  { label: "Publicité", href: "/publicite" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "YouTube", href: "https://youtube.com", Icon: Youtube },
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
];

export default function InfosHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloque le scroll quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname?.startsWith(href);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(q ? `/recherche?q=${encodeURIComponent(q)}` : "/recherche");
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* ── TOP BAR ── */}
      <div
        className={`overflow-hidden border-b border-neutral-100 bg-neutral-50 text-neutral-500 ${
          compact ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-[11px]">
          <div className="flex items-center gap-2 font-semibold uppercase tracking-widest">
            <span className="hidden sm:inline text-green-700">Touba</span>
            <span className="hidden sm:inline text-neutral-300">•</span>
            <span className="hidden sm:inline">Sénégal</span>
            <span className="hidden sm:inline text-neutral-300">•</span>
            <span className="hidden md:inline">Afrique</span>
            <span className="hidden md:inline text-neutral-300">•</span>
            <span className="hidden md:inline">Monde</span>
            <span className="sm:hidden text-green-700">L&apos;info au cœur de Touba</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline capitalize">{today}</span>
            <span className="hidden md:inline text-neutral-200">|</span>
            <div className="flex items-center gap-2.5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-neutral-400 transition-colors hover:text-green-700"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MASTHEAD ── */}
      <div className="border-b border-neutral-100">
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 ${
            compact ? "py-2" : "py-3.5"
          }`}
        >
          {/* Mobile: hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            aria-label="Touba Infos — Accueil"
            className="flex items-center"
          >
            <Logo height={compact ? 38 : 52} priority />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Rechercher"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              <Search size={20} />
            </button>

            <Link
              href="/direct"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
              </span>
              <span className="hidden sm:inline">EN DIRECT</span>
            </Link>

            <Link
              href="/newsletter"
              className="hidden items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-700 sm:inline-flex"
            >
              S&apos;abonner
            </Link>
          </div>
        </div>

        {/* Recherche déroulante */}
        {searchOpen && (
          <div className="border-t border-neutral-100 bg-neutral-50">
            <form
              onSubmit={submitSearch}
              className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3"
            >
              <Search size={18} className="text-neutral-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un article, une personne, un mot-clé…"
                className="flex-1 bg-transparent text-sm text-neutral-800 placeholder-neutral-400 outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Rechercher
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── NAV CATÉGORIES (desktop) ── */}
      <nav className="hidden border-b border-neutral-200 bg-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center px-4">
          <ul className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto py-2.5 text-[13px] font-semibold">
            {NAV_PRIMARY.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="flex-shrink-0">
                  <Link
                    href={item.href}
                    className={`rounded-md px-3 py-1.5 uppercase tracking-wide transition-colors ${
                      active
                        ? "bg-green-50 text-green-700"
                        : "text-neutral-700 hover:bg-neutral-100 hover:text-green-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Menu Plus */}
          <div
            className="relative flex-shrink-0 border-l border-neutral-200 pl-2"
            onMouseEnter={() => setPlusOpen(true)}
            onMouseLeave={() => setPlusOpen(false)}
          >
            <button
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-semibold uppercase tracking-wide text-neutral-700 hover:bg-neutral-100 hover:text-green-700"
              onClick={() => setPlusOpen((v) => !v)}
            >
              Plus <ChevronDown size={14} />
            </button>
            {plusOpen && (
              <div className="absolute right-0 top-full z-50 w-56 rounded-xl border border-neutral-200 bg-white py-2 shadow-lg">
                {NAV_PLUS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-green-50 hover:text-green-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── MENU MOBILE ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <Logo height={40} />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={submitSearch}
              className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3"
            >
              <Search size={18} className="text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="flex-1 bg-transparent text-sm outline-none placeholder-neutral-400"
              />
            </form>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                Rubriques
              </p>
              {NAV_PRIMARY.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive(item.href)
                      ? "bg-green-50 text-green-700"
                      : "text-neutral-800 hover:bg-neutral-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <p className="px-3 pb-1 pt-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                Plus
              </p>
              {NAV_PLUS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-neutral-100 p-4">
              <Link
                href="/newsletter"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700"
              >
                S&apos;abonner à la newsletter
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
