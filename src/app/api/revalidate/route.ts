import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// IL CAMPANELLO DELLA VETRINA (24/08/2026, fase 2 del taglio).
//
// Da quando il catalogo arriva da Postgres, «metti online» si fa nella scheda
// immobile del CRM v4 — ma la cache del sito (tag "properties", 600 s) avrebbe
// mostrato il cambiamento con fino a 10 minuti di ritardo. Questo endpoint la
// invalida SUBITO: il v4 lo chiama a ogni gesto di pubblicazione (canale,
// interruttore master, promozione dalla PC), e la pagina pubblica cambia al
// primo ricaricamento.
//
// Il segreto sta in REVALIDATE_SECRET (stesso valore sui tre siti; la copia
// del CRM sta nella tabella `segreto` di tsv-pg, chiave `revalidate_siti`).
// Senza header giusto: 401. Senza env: 503 — chiuso, non aperto.
// Stesso file in TRE repo (triestevillas-web, triesteimmobiliare,
// triesteaffitti): chi lo corregge, lo corregge in tutti e tre.
//
// FRIULIVILLAS (08/10/2026) è la QUARTA copia, identica: il sito legge il
// catalogo dal CRM (src/lib/vetrina.ts, CATALOGO_SORGENTE=pg) e il CRM la
// chiama da tsv-pg web/lib/campanello-siti.mjs — anche quando il cron spegne
// da solo un venduto (web/lib/spegni-scaduti.ts). Sull'apice
// https://friulivillas.com: il www risponde 308, e un POST rimandato non è
// detto che porti l'header. Stesso segreto `revalidate_siti`.
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = "nodejs";

export async function POST(req: Request) {
  const atteso = process.env.REVALIDATE_SECRET;
  if (!atteso) {
    return NextResponse.json({ ok: false, errore: "non configurato" }, { status: 503 });
  }
  if ((req.headers.get("x-revalidate-secret") ?? "") !== atteso) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidateTag("properties", "max");
  return NextResponse.json({ ok: true, tag: "properties" });
}
