import { NextResponse } from "next/server";
import { calendario } from "@/lib/affitti/disponibilita";

// Il calendario delle date libere per il browser: solo date, arrivi, soggiorno
// minimo e notti libere — nessun prezzo, nessun testo della fonte. Il browser
// chiama solo questa rotta, mai Booking (KB: tophill-cottage/DISPONIBILITA.md §5.3).
// Lettura sempre dinamica (dipende da «oggi»); la fonte vera è in cache 6 ore
// dentro lib/affitti/disponibilita.ts, e qui la CDN tiene la risposta mezz'ora.
export const dynamic = "force-dynamic";

const CASE = new Set(["top-hill-cottage", "chalet-navauce"]);

export async function GET(request: Request) {
  const u = new URL(request.url);
  const casa = u.searchParams.get("casa") ?? "";
  const persone = Number(u.searchParams.get("persone") ?? "2");
  if (!CASE.has(casa) || !Number.isInteger(persone) || persone < 1 || persone > 40) {
    return NextResponse.json({ errore: "parametri" }, { status: 400 });
  }
  const c = await calendario(casa, persone);
  return NextResponse.json(c, {
    headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=21600" },
  });
}
