import "server-only";
import { F, mapRecord, type Property } from "./properties";

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? "app1ZDay9vQNU5V2u";
const TABLE_ID = "tblwAUWPnX7KF8FhU";
const TOKEN = process.env.AIRTABLE_TOKEN;
const REVALIDATE_SECONDS = 600;

const FIELD_IDS = Object.values(F);
// Publish rule for the FriuliVillas site:
//   1) tsv_com_online (checkbox) = true  — MASTER online/offline switch shared by
//      every TriesteVillas Group site (if false, the unit is offline everywhere).
//   2) cluster != PRIVATE — off-market units NEVER reach a public grid.
//   3) pubblicato_su contains one of SITE_TARGETS.
// pubblicato_su is multipleSelects -> membership via ARRAYJOIN+FIND.
// NOTE: the formula references {tsv_com_online}, {cluster} and {pubblicato_su} by
// NAME - if any is renamed in Airtable, update this formula (and the sibling sites').
//
// (2) is not belt-and-braces. Without it the confidentiality of an off-market unit
// rests on nobody ever ticking friulivillas.com on a PRIVATE record — a data
// invariant, not a code one. And the rest of the pipeline is primed to show it well:
// propertyView emits the `private` badge, PropertyBadge already styles it, it.json
// already has the "Vendita riservata" label, and sitemap.ts + generateStaticParams
// would hand the URL to crawlers. One stray tick would publish photos, price and
// address of a listing whose whole point is that it is not published. Every sibling
// site carries this clause; FriuliVillas has no Private Collection of its own, so
// here the clause is the ONLY thing standing between a PRIVATE record and the grid.
//
// NB: un immobile può stare su PIÙ canali — DUINO BOWLING e VILLA BEGLIANO oggi
// sono spuntati sia triestevillas.com sia friulivillas.com, e compaiono su
// entrambi i siti. I canali non sono mutuamente esclusivi e non devono diventarlo.
const SITE_TARGETS = ["friulivillas.com"];
const FILTER = `AND({tsv_com_online}=TRUE(),{cluster}!='PRIVATE',OR(${SITE_TARGETS.map(
  (s) => `FIND("${s}",ARRAYJOIN({pubblicato_su}))`,
).join(",")}))`;

type RawRecord = { id: string; fields: Record<string, unknown> };

// Pull the offending field id out of an Airtable UNKNOWN_FIELD_NAME 422 body.
function unknownFieldId(status: number, body: string): string | null {
  if (status !== 422) return null;
  try {
    const err = JSON.parse(body) as { error?: { type?: string; message?: string } };
    if (err.error?.type !== "UNKNOWN_FIELD_NAME") return null;
    return err.error.message?.match(/fld[A-Za-z0-9]{14}/)?.[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchAllRaw(filter: string, fieldIds: string[] = FIELD_IDS): Promise<RawRecord[]> {
  const out: RawRecord[] = [];
  // A field id that no longer exists in the table (schema drift, or a stale/typo
  // id in F) makes Airtable 422 the ENTIRE fetch — which breaks the build and
  // silently freezes ISR revalidation. So be resilient: drop the offending id
  // and retry, keeping every other field. `fields` only ever shrinks, and an
  // empty list means "all fields" (never 422s), so this loop is bounded by
  // FIELD_IDS.length. Dropped fields just map to null downstream.
  const fields: string[] = [...fieldIds];
  let offset: string | undefined;

  while (true) {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    url.searchParams.set("filterByFormula", filter);
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("returnFieldsByFieldId", "true");
    for (const id of fields) url.searchParams.append("fields[]", id);
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["properties"] },
    });

    if (!res.ok) {
      const body = await res.text();
      const badField = unknownFieldId(res.status, body);
      if (badField && fields.includes(badField)) {
        console.warn(
          `[airtable] unknown field id "${badField}" — dropping it and retrying (schema drift)`,
        );
        fields.splice(fields.indexOf(badField), 1);
        continue; // retry the SAME page with the reduced field set
      }
      throw new Error(`Airtable ${res.status}: ${body}`);
    }

    const data = (await res.json()) as { records: RawRecord[]; offset?: string };
    out.push(...data.records);
    offset = data.offset;
    if (!offset) break;
  }

  return out;
}

// L'ordine di vetrina è una decisione editoriale del CRM: prima l'evidenza,
// poi la data di pubblicazione. Le date assenti o non valide vanno in fondo;
// il prezzo interviene soltanto come spareggio.
export function compareShowcase(a: Property, b: Property): number {
  const featuredOrder = Number(b.inEvidenza) - Number(a.inEvidenza);
  if (featuredOrder !== 0) return featuredOrder;

  const aOnline = a.onlineDa ? Date.parse(a.onlineDa) : Number.NaN;
  const bOnline = b.onlineDa ? Date.parse(b.onlineDa) : Number.NaN;
  const aHasOnline = Number.isFinite(aOnline);
  const bHasOnline = Number.isFinite(bOnline);
  if (aHasOnline !== bHasOnline) return aHasOnline ? -1 : 1;
  if (aHasOnline && bHasOnline && aOnline !== bOnline) return bOnline - aOnline;

  const aPrice = a.priceSale ?? a.priceRent ?? 0;
  const bPrice = b.priceSale ?? b.priceRent ?? 0;
  return bPrice - aPrice;
}

export async function getProperties(): Promise<Property[]> {
  let raw: RawRecord[];
  if (TOKEN) {
    raw = await fetchAllRaw(FILTER);
  } else {
    // Il seed di FriuliVillas è VUOTO, di proposito, e va tenuto tale finché
    // qualcuno non ha una ragione forte per riempirlo.
    //
    // Ereditandolo da TriesteImmobiliare conteneva due immobili DI QUEL
    // marchio (BILIVELLO VIA DENZA, VIA GORIZIA FURLAN): senza token — cioè in
    // ogni ambiente in cui la variabile manca o arriva vuota, e `vercel env
    // pull` le variabili Sensitive le restituisce vuote — questo sito avrebbe
    // pubblicato due case di Trieste che non sono sue, complete di foto,
    // prezzo e indirizzo, come se fossero il suo catalogo.
    //
    // Un seed "giusto" non risolverebbe granché: le URL delle foto Airtable
    // sono firmate e scadono in un paio d'ore, quindi uno snapshot committato
    // nasce già con le immagini rotte. Per lavorare in locale sul catalogo
    // vero si mette AIRTABLE_TOKEN in .env.local — che è anche il solo modo di
    // vedere davvero quello che vedrà la produzione.
    console.warn("[airtable] AIRTABLE_TOKEN non impostato — catalogo vuoto (vedi seed.json).");
    // The seed bypasses FILTER, so the PRIVATE exclusion has to be re-applied by
    // hand here: a public grid must never show an off-market unit, not even in dev.
    raw = ((await import("./seed.json")).default as RawRecord[]).filter(
      (r) => String(r.fields[F.cluster] ?? "").toUpperCase().trim() !== "PRIVATE",
    );
  }
  return raw
    .map((r) => mapRecord(r.id, r.fields))
    .sort(compareShowcase);
}

export async function getProperty(slug: string): Promise<Property | null> {
  const all = await getProperties();
  return all.find((p) => p.slug === slug) ?? null;
}

// ---- Indice foto per il proxy /foto ----------------------------------------

// Il proxy /foto/<attId>/<w>.webp deve solo tradurre un id attachment nella url
// sorgente da ricodificare. Passare da getProperties() si paga: quella chiede ad
// Airtable tutti i ~150 campi di ogni immobile, descrizioni comprese, e ne
// ricostruisce ogni record. Misurato sul gemello triestevillas.com il
// 2026-07-30, una foto NON in cache CDN rispondeva in ~0,9 s, di cui ~0,65 s
// spesi lì dentro. Per sapere dove sta una foto servono QUATTRO campi.
//
// Il filtro è lo stesso FILTER di getProperties(), quindi il confine di
// riservatezza non si sposta: un attachment di un immobile PRIVATE non entra in
// questo indice e dal proxy continua a dare 404.
const PHOTO_FIELDS = [F.coverPhoto, F.topPhotos, F.foto, F.planimetrie];

// url = originale (per le larghezze grandi), thumb = rendition `large` di
// Airtable, ~917 px (basta per le piccole ed evita di scaricare un PNG da 6 MB
// per farne una miniatura).
export type PhotoSource = { url: string; thumb: string };

type RawAttachmentCell = { id?: string; url?: string; thumbnails?: { large?: { url: string } } };

export async function getPhotoSources(): Promise<Map<string, PhotoSource>> {
  let raw: RawRecord[];
  if (TOKEN) {
    raw = await fetchAllRaw(FILTER, PHOTO_FIELDS);
  } else {
    raw = ((await import("./seed.json")).default as RawRecord[]).filter(
      (r) => String(r.fields[F.cluster] ?? "").toUpperCase().trim() !== "PRIVATE",
    );
  }

  const index = new Map<string, PhotoSource>();
  for (const r of raw) {
    for (const field of PHOTO_FIELDS) {
      const cell = r.fields[field];
      if (!Array.isArray(cell)) continue;
      for (const a of cell as RawAttachmentCell[]) {
        if (!a?.id || typeof a.url !== "string") continue;
        index.set(a.id, { url: a.url, thumb: a.thumbnails?.large?.url ?? a.url });
      }
    }
  }
  return index;
}
