import { NextRequest, NextResponse } from "next/server";

// Rate limit en mémoire (Edge compatible)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

const SUSPICIOUS_PATTERNS = [
  /(<script|javascript:|vbscript:|onload=|onerror=)/i,
  /(union\s+select|drop\s+table|insert\s+into|delete\s+from)/i,
  /(\.\.\/)|(\.\.\\)/,
  /(eval\(|document\.cookie|window\.location)/i,
];

function isSuspicious(value: string): boolean {
  return SUSPICIOUS_PATTERNS.some((p) => p.test(value));
}

export async function middleware(req: NextRequest) {
  const ip = getIp(req);
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") || "").toLowerCase().split(":")[0];

  // Canonicalisation du domaine (www -> apex).
  if (host === "www.toubainfos.com") {
    const dest = new URL(
      req.nextUrl.pathname + req.nextUrl.search,
      "https://toubainfos.com",
    );
    return NextResponse.redirect(dest, 308);
  }

  // Rubrique Magal fusionnée vers le dossier /magal (une seule URL canonique).
  if (pathname === "/rubrique/magal") {
    const dest = req.nextUrl.clone();
    dest.pathname = "/magal";
    return NextResponse.redirect(dest, 308);
  }

  // Rate limiting API (60 req/min par IP).
  if (pathname.startsWith("/api/")) {
    if (!checkRateLimit(`api:${ip}`, 60, 60_000)) {
      return NextResponse.json(
        { error: "Trop de requêtes." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
  }

  // Détection d'injections dans les query params.
  if (isSuspicious(req.nextUrl.toString())) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  // Bloquer les user-agents suspects.
  const ua = req.headers.get("user-agent") ?? "";
  const BLOCKED_UA = ["sqlmap", "nikto", "nessus", "masscan", "zgrab", "nuclei"];
  if (BLOCKED_UA.some((b) => ua.toLowerCase().includes(b))) {
    return new NextResponse(null, { status: 403 });
  }

  // Bloquer les méthodes HTTP non autorisées sur les pages (hors Server Actions).
  const isServerAction = !!req.headers.get("next-action");
  if (
    !pathname.startsWith("/api/") &&
    !isServerAction &&
    !["GET", "HEAD"].includes(req.method)
  ) {
    return new NextResponse(null, { status: 405 });
  }

  const response = NextResponse.next();

  // Sécurité additionnelle.
  response.headers.set("X-Request-ID", crypto.randomUUID());
  response.headers.delete("X-Powered-By");

  // Laisser Next.js gérer l'ISR (revalidate) pour les pages publiques ;
  // no-store uniquement pour l'admin, les API et les Server Actions.
  const noStore =
    pathname.startsWith("/api/") ||
    pathname.startsWith("/admin") ||
    isServerAction;
  if (noStore) {
    response.headers.set("Cache-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
