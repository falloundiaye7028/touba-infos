import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { runVeille } from "@/lib/touba-infos-veille";
import { autoTraiterSujets } from "@/lib/touba-infos-writer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Déclenche une passe de veille (à appeler par un cron externe).
 * Sécurisé par `TI_AGENT_SECRET` (ou `ADMIN_SECRET`).
 * Exemple : GET /api/touba-infos/agent/veille?secret=XXXX
 * Programmation : Vercel Cron, GitHub Actions ou cron externe.
 */
export async function GET(req: NextRequest) {
  const secret =
    req.nextUrl.searchParams.get("secret") || req.headers.get("x-agent-secret");
  const expected = process.env.TI_AGENT_SECRET || process.env.ADMIN_SECRET;
  const secretOk = !!expected && secret === expected;

  // Vercel Cron : en-tête Authorization: Bearer ${CRON_SECRET}
  const auth = req.headers.get("authorization");
  const cronOk =
    !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;

  if (!secretOk && !cronOk) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const run = await runVeille();
    // Rédaction + publication automatiques (selon TI_AGENT_AUTOPUBLISH)
    const auto = await autoTraiterSujets();
    if (auto.publies > 0) {
      revalidatePath("/touba-infos", "layout");
    }
    return NextResponse.json({ ok: true, run, auto });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e).slice(0, 200) },
      { status: 500 },
    );
  }
}
