/* ================================================================
   Il PONTE verso Trieste (07/10/2026).

   Mandato di Martino del 06/10: FriuliVillas non si riempie di case di
   triestevillas.com («non impestare»), ma chi ci arriva da solo deve trovare
   qualcosa di Trieste. Quindi qui non nasce nessuna pagina per quelle case:
   si mostrano poche card vere, che portano su triestevillas.com (UTM), dove
   vive la scheda e il suo canonical. ⛔ Nel CRM non si spunta friulivillas.com
   sulle case di Trieste: il ponte LEGGE, non pubblica.

   SORGENTE. La vetrina pubblica del CRM (tsv-pg `/api/vetrina?sito=…`), la
   stessa dei cataloghi dei siti: online, mai la Private Collection, pubblicate
   su triestevillas.com. È lo schema di «Oltre Lignano» (lignanovillas.com,
   src/lib/oltre.ts, 05/10).

   NOMI. Solo `public_name` e le sue traduzioni. MAI il campo `nome` (fino al
   18/09 era il nome interno, che può portare il cognome di chi vende: regola
   del 25/08) e mai il codice interno in pagina.

   LA SCELTA. Si tengono le case dell'area «Trieste e Carso» (src/lib/aree.ts)
   in vendita e non vendute, con almeno otto foto e una copertina, che NON
   sono già su friulivillas.com (quelle hanno la loro scheda qui: Muggia e
   Duino) e che non sono unità di un cantiere a più unità. Poi una per zona
   di Trieste (CENTRO, BARCOLA…, il campo `zona` del CRM, che lì è giusto),
   prima l'evidenza del CRM e poi un punteggio, finché sono QUANTE.

   Un guasto della vetrina non rompe la pagina: il ponte resta un rimando
   testuale a triestevillas.com.
   ================================================================ */

import { areaDi } from "./aree";

const VETRINA_URL = (process.env.CRM_VETRINA_BASE || "").trim() || "https://tsv-pg.vercel.app/api/vetrina";
const REVALIDATE_SECONDS = 1800;
const TIMEOUT_MS = 8000;
const TSV = "https://triestevillas.com";

type Lingua = "it" | "en" | "de" | "sl";
type Allegato = { id?: string; filename?: string; type?: string; width?: number; height?: number };

type Riga = {
  tsv_prop_id: string | null;
  airtable_id: string;
  public_name: string | null;
  public_name_en: string | null;
  public_name_de: string | null;
  public_name_sl: string | null;
  contratto: string | null;
  tipologia: string | null;
  progetto: string | null;
  prezzo_eur: string | number | null;
  mq: string | number | null;
  comune: string | null;
  zona: string | null;
  map_lat: string | number | null;
  map_lng: string | number | null;
  in_evidenza: boolean | null;
  vista_mare: string | boolean | null;
  piscina: string | null;
  trattativa_riservata: string | boolean | null;
  soggetto_iva: string | boolean | null;
  status: string | null;
  pubblicato_su: string[] | null;
  foto: Allegato[] | null;
  copertina: Allegato[] | null;
  foto_top8: Allegato[] | null;
};

export type CasaPonte = {
  id: string;
  href: Record<Lingua, string>;
  titolo: Record<Lingua, string>;
  comune: string | null;
  /** Zona di Trieste del CRM (CENTRO, BARCOLA…), per l'etichetta. */
  zona: string | null;
  mq: number | null;
  prezzo: number | null;
  iva: boolean;
  riservata: boolean;
  foto: { base: string; width: number | null; height: number | null };
  /** La copertina è una simulazione AI o un rendering (vista trasparenza del CRM). */
  segno: "simulazione" | "rendering" | null;
};

export type Ponte = { case: CasaPonte[]; totale: number };

const num = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
const flag = (v: unknown): boolean => v === true || v === "true";

/** Lo stesso slugify di triestevillas.com: slug = slugify(nome pubblico) + numero del codice. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
function slugDi(r: Riga): string {
  const base = str(r.public_name) ?? ([str(r.tipologia), str(r.zona)].filter(Boolean).join(" ") || "immobile");
  const n = str(r.tsv_prop_id)?.match(/(\d+)\s*$/)?.[1] ?? "0";
  return `${slugify(base)}-${n}`;
}

const PREFISSO: Record<Lingua, string> = { it: "", en: "/en", de: "/de", sl: "/sl" };
const UTM = "utm_source=friulivillas.com&utm_medium=referral&utm_campaign=ponte-trieste";

export function hrefCatalogoTsv(l: Lingua): string {
  return `${TSV}${PREFISSO[l]}/immobili?${UTM}`;
}

function immagini(v: Allegato[] | null): (Allegato & { id: string })[] {
  return Array.isArray(v)
    ? v.filter((a): a is Allegato & { id: string } => typeof a?.id === "string" && (a.type ?? "image/").startsWith("image/"))
    : [];
}

function punteggio(r: Riga, foto: number): number {
  const prezzo = num(r.prezzo_eur) ?? 0;
  const t = `${str(r.tipologia) ?? ""} ${str(r.public_name) ?? ""}`.toLowerCase();
  return (
    (r.in_evidenza === true ? 3 : 0) +
    (flag(r.vista_mare) ? 2 : 0) +
    (/piscina|pool/i.test(str(r.piscina) ?? "") ? 1 : 0) +
    (/villa|attico|penthouse/.test(t) ? 1.5 : 0) +
    Math.min(2, prezzo / 600_000) +
    Math.min(1, foto / 30)
  );
}

const SEGNI: Record<string, CasaPonte["segno"]> = {
  ai_aggiunte: "simulazione",
  ai_rendering: "simulazione",
  rendering: "rendering",
};

async function leggi<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["vetrina"] },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`vetrina ${res.status}`);
  return (await res.json()) as T;
}

async function trasparenza(): Promise<Map<string, Map<string, string>> | null> {
  try {
    const data = await leggi<{ immobili?: { airtable_id: string; trasparenza: { foto?: { filename?: string; trattamento?: string }[] } | null }[] }>(
      `${VETRINA_URL}?sito=triestevillas.com&vista=trasparenza`,
    );
    const out = new Map<string, Map<string, string>>();
    for (const r of data.immobili ?? []) {
      const foto = r.trasparenza?.foto ?? [];
      if (foto.length) out.set(r.airtable_id, new Map(foto.filter((f) => f.filename && f.trattamento).map((f) => [f.filename!, f.trattamento!])));
    }
    return out;
  } catch {
    return null;
  }
}

/** Le case di Trieste per il ponte. `quante` = quante card. */
export async function getPonte(quante = 6): Promise<Ponte> {
  const data = await leggi<{ immobili?: Riga[] }>(`${VETRINA_URL}?sito=triestevillas.com&allegati=snelli`);
  const righe = Array.isArray(data.immobili) ? data.immobili : [];

  const inArea = righe.filter((r) => {
    const lat = num(r.map_lat);
    const lng = num(r.map_lng);
    return (
      areaDi({ comune: str(r.comune), lat, lng }) === "trieste-carso" &&
      (str(r.contratto) ?? "").toUpperCase() === "VENDITA" &&
      (str(r.status) ?? "").toUpperCase() !== "SOLD" &&
      !(r.pubblicato_su ?? []).includes("friulivillas.com")
    );
  });

  const unitaPerProgetto = new Map<string, number>();
  for (const r of inArea) {
    const p = str(r.progetto);
    if (p) unitaPerProgetto.set(p, (unitaPerProgetto.get(p) ?? 0) + 1);
  }

  const candidate = inArea
    .map((r) => ({ r, foto: immagini(r.foto).length, zona: (str(r.zona) ?? "?").replace(/^BARCOLA.*/, "BARCOLA") }))
    .filter(
      (c) =>
        c.foto >= 8 &&
        (immagini(c.r.copertina).length || immagini(c.r.foto_top8).length) &&
        (unitaPerProgetto.get(str(c.r.progetto) ?? "") ?? 0) < 2,
    )
    .map((c) => ({ ...c, punti: punteggio(c.r, c.foto) }))
    .sort((a, b) => b.punti - a.punti);

  // Una per zona di Trieste, finché ci sono zone; poi si riempie col punteggio.
  const scelte: typeof candidate = [];
  const zone = new Set<string>();
  for (const c of candidate) {
    if (scelte.length >= quante) break;
    if (!zone.has(c.zona)) {
      scelte.push(c);
      zone.add(c.zona);
    }
  }
  for (const c of candidate) {
    if (scelte.length >= quante) break;
    if (!scelte.includes(c)) scelte.push(c);
  }

  const vista = scelte.length ? await trasparenza() : null;

  const out: CasaPonte[] = scelte.map(({ r }) => {
    const tratt = vista?.get(r.airtable_id);
    const segnoDi = (a: Allegato) => (tratt && a.filename ? (SEGNI[tratt.get(a.filename) ?? ""] ?? null) : null);
    const giro = [...immagini(r.copertina), ...immagini(r.foto_top8), ...immagini(r.foto)];
    const orizzontale = (a: Allegato) => !a.width || !a.height || a.width >= a.height;
    const foto = giro.find((a) => !segnoDi(a) && orizzontale(a)) ?? giro.find((a) => !segnoDi(a)) ?? giro[0];
    const slug = slugDi(r);
    const it = str(r.public_name) ?? "Immobile a Trieste";
    const href = {} as Record<Lingua, string>;
    for (const l of Object.keys(PREFISSO) as Lingua[]) href[l] = `${TSV}${PREFISSO[l]}/annuncio/${slug}?${UTM}`;
    return {
      id: str(r.tsv_prop_id) ?? r.airtable_id,
      href,
      titolo: { it, en: str(r.public_name_en) ?? it, de: str(r.public_name_de) ?? it, sl: str(r.public_name_sl) ?? it },
      comune: str(r.comune),
      zona: str(r.zona),
      mq: num(r.mq),
      prezzo: num(r.prezzo_eur),
      iva: flag(r.soggetto_iva),
      riservata: flag(r.trattativa_riservata),
      foto: { base: `${TSV}/foto/${foto.id}`, width: foto.width ?? null, height: foto.height ?? null },
      segno: segnoDi(foto),
    };
  });

  return { case: out, totale: candidate.length };
}

export async function getPonteSafe(quante = 6): Promise<Ponte> {
  try {
    return await getPonte(quante);
  } catch {
    return { case: [], totale: 0 };
  }
}
