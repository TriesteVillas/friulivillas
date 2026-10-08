import "server-only";
import { matterportEmbed, slugify, type Photo, type Property } from "./properties";
import { videoAnnuncio } from "../content/annunciVideo";

// ─────────────────────────────────────────────────────────────────────────────
// IL CATALOGO DAL CRM (08/10/2026) — FriuliVillas entra nella catena dei gemelli.
//
// Fino a oggi questo era l'unico sito del gruppo col catalogo ancora letto da
// Airtable (airtable.ts). Il CRM però spegne e accende le case in Postgres, e
// su Airtable non scrive: il cron che toglie un venduto 30 giorni dopo la
// vendita (tsv-pg web/lib/spegni-scaduti.ts) lo toglieva da triestevillas.com
// e da qui no. Caso vero, misurato l'08/10: «Quadrilocale Borgata Bach Alta,
// Sappada», SOLD, spento dal CRM con `offline_il` 2026-10-08, ancora in
// catalogo su friulivillas.com perché su Airtable il flag resta ✓.
//
// Stessa forma (`Property`), altra sorgente: la vetrina pubblica del CRM,
//   GET https://tsv-pg.vercel.app/api/vetrina?sito=friulivillas.com&allegati=snelli
// che applica LA STESSA regola a tre condizioni della formula di airtable.ts
// (online + mai il cluster PRIVATE + pubblicato su friulivillas.com: la mappa
// REGOLE della rotta). Si accende con CATALOGO_SORGENTE=pg, come sui gemelli
// (triesteimmobiliare/src/lib/vetrina.ts, di cui questo file è il fratello);
// senza, il sito legge Airtable come sempre. Il rollback è togliere la
// variabile (e rideployare): nessun revert di codice.
//
// La mappa campo → colonna è QUELLA di mapRecord (properties.ts), voce per
// voce, non quella di TSI: dove i due siti differiscono vince FriuliVillas,
// perché lo stesso immobile deve uscire identico qualunque sia la sorgente.
// (Un esempio: TSI spegne ILIA e TARI fuori Trieste già qui; FriuliVillas lo
// decide nella pagina, e qui non si tocca.) I testi sloveni, che sulla via
// Airtable arrivavano da una seconda lettura di questa stessa vetrina, qui
// stanno già nella riga.
//
// ⛔ Si legge SOLO `public_name` e le sue traduzioni. La riga porta anche la
// chiave `nome`, che fino al 18/09 era un coalesce col nome INTERNO (il cognome
// di chi vende: regola ferrea del 25/08): non è nel tipo qui sotto di proposito.
//
// LE FOTO. Gli allegati arrivano «snelli» ({id, filename, type, width,
// height}), senza URL: quelle firmate di Airtable che lo specchio copia sono
// scadute per costruzione. Ogni Photo porta il suo `id` stabile e punta al
// proxy /foto del sito (photoSrc.ts), che in questa modalità ritrova la foto
// con fotoDaVetrina() qui sotto e la scarica dalla rotta foto del CRM
//   /api/vetrina/foto/<record>/<allegato>/<m|xl>
// invece che da Airtable (vedi airtable.ts → getPhotoSources). Un allegato
// senza id, o che non è un'immagine, si scarta: meglio una foto in meno che
// un riquadro rotto per sempre.
// ─────────────────────────────────────────────────────────────────────────────

/** La vetrina del CRM per questo sito. `CRM_VETRINA_URL` (URL completa) la
 *  sostituisce per un collaudo; la stessa variabile, prima di oggi, puntava
 *  la lettura dei soli testi sloveni (airtable.ts). */
export const VETRINA_URL =
  (process.env.CRM_VETRINA_URL || "").trim() ||
  "https://tsv-pg.vercel.app/api/vetrina?sito=friulivillas.com&allegati=snelli";
const REVALIDATE_SECONDS = 600;

/** L'interruttore, lo stesso dei gemelli: il CRM solo se acceso di proposito. */
export const VETRINA_ATTIVA = process.env.CATALOGO_SORGENTE === "pg";

/** Le taglie della rotta foto del CRM: m = la resa `large` di Airtable (la
 *  stessa che il proxy usava come `thumb`), xl = l'originale (`url`). */
export type TagliaCrm = "m" | "xl";

/** L'origine del CRM, ricavata dalla vetrina: un collaudo che la punta
 *  altrove sposta anche le foto. */
function origineCrm(): string {
  try {
    return new URL(VETRINA_URL).origin;
  } catch {
    return "https://tsv-pg.vercel.app";
  }
}

/** L'indirizzo stabile di una foto sulla rotta del CRM, mai l'URL firmata. */
export function fotoCrm(rec: string, att: string, taglia: TagliaCrm): string {
  return `${origineCrm()}/api/vetrina/foto/${encodeURIComponent(rec)}/${encodeURIComponent(att)}/${taglia}`;
}

type Allegato = {
  id?: string;
  filename?: string;
  type?: string;
  width?: number;
  height?: number;
};

type RigaVetrina = {
  tsv_prop_id: string | null;
  airtable_id: string;
  public_name: string | null;
  public_name_en: string | null;
  public_name_de: string | null;
  public_name_sl?: string | null;
  status: string | null;
  contratto: string | null;
  tipologia: string | null;
  cluster: string | null;
  // ⚠️ numeric di Postgres arriva come STRINGA (pg non converte per non
  // perdere precisione), integer come numero, e i valori estratti da `extra`
  // con ->> sono sempre testo: tutto passa da num()/flag().
  prezzo_eur: string | number | null;
  canone_mensile_eur: string | number | null;
  mq: string | number | null;
  locali: string | null;
  bagni: string | number | null;
  piano: string | null;
  ascensore: string | null;
  map_via: string | null;
  comune: string | null;
  zona: string | null;
  map_lat: string | number | null;
  map_lng: string | number | null;
  descrizione: string | null;
  descrizione_tsi: string | null;
  descrizione_tsi_en: string | null;
  descrizione_tsi_de: string | null;
  descrizione_tsi_sl?: string | null;
  // Il riassunto del gruppo arriva già ripulito dal CRM: null quando ricopia
  // la nota interna (vetrina, 01/10). Su Airtable quel controllo non c'è.
  oneliner: string | null;
  oneliner_tsi: string | null;
  online_da: string | null;
  in_evidenza: boolean | null;
  tags: string[] | null;
  ape_classe: string | null;
  arredato: string | null;
  piscina: string | null;
  parcheggio: string | null;
  matterport_url: string | null;
  youtube_urls: string | null;
  anno_costruzione: string | null;
  piani_edificio: string | null;
  trattativa_riservata: string | null;
  booking_url: string | null;
  stato_immobile: string | null;
  camere: string | number | null;
  cucina: string | null;
  terrazzo: string | null;
  riscaldamento: string | null;
  disponibilita: string | null;
  balcone: string | null;
  giardino: string | null;
  accesso_disabili: string | null;
  tipo_proprieta: string | null;
  classe_immobile: string | null;
  imposte_prima: string | number | null;
  imposte_seconda: string | number | null;
  note_imposte: string | null;
  soggetto_iva: string | null;
  spese_condo_mensili: string | number | null;
  ilia_annua: string | number | null;
  tari_annua_stima_eur: string | number | null;
  pc_data_ingresso: string | null;
  foto: Allegato[] | null;
  copertina: Allegato[] | null;
  foto_top8: Allegato[] | null;
  planimetrie: Allegato[] | null;
};

function num(v: string | number | null | undefined): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

// Un checkbox che ha viaggiato dentro `extra` con ->> è la stringa "true";
// una colonna booleana arriva booleana. Vale `true` solo il vero.
const flag = (v: unknown): boolean => v === true || v === "true";

function lines(v: string | null): string[] {
  return typeof v === "string"
    ? v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    : [];
}

// Una colonna `date` esce dal JSON come ISO completo («2026-09-04T00:00:00.000Z»):
// il giorno è i primi 10 caratteri, la forma che Airtable dava (yyyy-mm-dd). Il
// taglio è lecito perché lo specchio salva date pure (niente ore da spostare).
const giorno = (v: string | null): string | null =>
  typeof v === "string" && v.length >= 10 ? v.slice(0, 10) : null;

function attachments(v: Allegato[] | null, alt: string): Photo[] {
  return Array.isArray(v)
    ? v
        .filter((a): a is Allegato & { id: string } =>
          typeof a?.id === "string" && (a.type ?? "image/").startsWith("image/"))
        .map((a) => ({
          id: a.id,
          // url e thumb non vanno MAI a un'URL firmata: puntano al proxy del
          // sito, come le larghezze di photoSrc (allowlist della rotta).
          url: `/foto/${a.id}/2000.webp`,
          thumb: `/foto/${a.id}/800.webp`,
          width: a.width ?? null,
          height: a.height ?? null,
          alt,
          filename: a.filename ?? null,
        }))
    : [];
}

function idNumber(tsvId: string | null): string {
  const m = tsvId?.match(/(\d+)\s*$/);
  return m ? m[1] : "0";
}

// Stessi criteri di slugSource/buildName in properties.ts: il nome pubblico
// guida lo slug, il ripiego è NEUTRO (tipologia + zona), MAI il nome interno.
// Lo slug deve venire IDENTICO a quello della via Airtable: è l'URL della scheda.
function slugSource(r: RigaVetrina): string {
  const pub = str(r.public_name);
  if (pub) return pub;
  const derived = [str(r.tipologia), str(r.zona)].filter(Boolean).join(" ");
  return derived || "immobile";
}

function buildName(r: RigaVetrina): string {
  const derived = [str(r.tipologia), str(r.zona)].filter(Boolean).join(" · ");
  return derived || "Immobile";
}

function mapRiga(r: RigaVetrina): Property {
  const id = str(r.tsv_prop_id) ?? r.airtable_id;
  const title = str(r.public_name) ?? buildName(r);

  const photos = attachments(r.foto, title);
  const topPhotos = attachments(r.foto_top8, title);
  const planimetrie = attachments(r.planimetrie, title);
  const coverPhoto =
    attachments(r.copertina, title)[0] ?? topPhotos[0] ?? photos[0] ?? null;

  return {
    id,
    recId: r.airtable_id,
    slug: `${slugify(slugSource(r))}-${idNumber(id)}`,
    title,
    titleEn: str(r.public_name_en),
    titleDe: str(r.public_name_de),
    titleSl: str(r.public_name_sl),
    inEvidenza: r.in_evidenza === true,
    onlineDa: giorno(r.online_da),
    contratto: str(r.contratto) as Property["contratto"],
    cluster: str(r.cluster),
    tipologia: str(r.tipologia),
    zona: str(r.zona),
    comune: str(r.comune),
    via: str(r.map_via),
    lat: num(r.map_lat),
    lng: num(r.map_lng),
    priceSale: num(r.prezzo_eur),
    priceRent: num(r.canone_mensile_eur),
    mq: num(r.mq),
    rooms: str(r.locali),
    baths: num(r.bagni),
    floor: str(r.piano),
    energyClass: str(r.ape_classe),
    description: str(r.descrizione_tsi) || str(r.descrizione),
    descriptionEn: str(r.descrizione_tsi_en),
    descriptionDe: str(r.descrizione_tsi_de),
    descriptionSl: str(r.descrizione_tsi_sl),
    oneliner: str(r.oneliner_tsi) || str(r.oneliner),
    tags: Array.isArray(r.tags) ? r.tags : [],
    photos,
    coverPhoto,
    topPhotos,
    planimetrie,
    videos: lines(r.youtube_urls),
    matterportUrl: matterportEmbed(r.matterport_url),
    bookingUrl: str(r.booking_url),
    arredato: str(r.arredato),
    ascensore: str(r.ascensore),
    piscina: str(r.piscina),
    parcheggio: str(r.parcheggio),
    annoCostruzione: num(r.anno_costruzione),
    pianiEdificio: num(r.piani_edificio),
    stato: str(r.stato_immobile),
    camere: num(r.camere),
    cucina: str(r.cucina),
    terrazzo: flag(r.terrazzo),
    riscaldamento: str(r.riscaldamento),
    disponibilita: str(r.disponibilita),
    balcone: flag(r.balcone),
    giardino: str(r.giardino),
    accessoDisabili: flag(r.accesso_disabili),
    tipoProprieta: str(r.tipo_proprieta),
    classeImmobile: str(r.classe_immobile),
    trattativaRiservata: flag(r.trattativa_riservata),
    statusCommerciale: str(r.status),
    impostePrima: num(r.imposte_prima),
    imposteSeconda: num(r.imposte_seconda),
    noteImposte: str(r.note_imposte),
    soggettoIva: flag(r.soggetto_iva),
    condoMensile: num(r.spese_condo_mensili),
    iliaAnnua: num(r.ilia_annua),
    tariAnnua: num(r.tari_annua_stima_eur),
    pcSince: giorno(r.pc_data_ingresso),
    heroVideo: videoAnnuncio(id),
  };
}

/** Le righe della vetrina. Una risposta diversa da 200, o senza `immobili`,
 *  LANCIA: in build ferma la build (meglio di un catalogo vuoto pubblicato), a
 *  runtime fa fallire la rigenerazione ISR e Next continua a servire l'ultima
 *  pagina buona. Stessa scelta dei gemelli. La fetch è la stessa per catalogo
 *  e indice foto: Next la memoizza nel render e la tiene nella Data Cache. */
async function righe(): Promise<RigaVetrina[]> {
  const res = await fetch(VETRINA_URL, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["properties"] },
  });
  if (!res.ok) {
    throw new Error(`vetrina ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const data = (await res.json()) as { immobili?: unknown };
  if (!Array.isArray(data.immobili)) throw new Error("vetrina: risposta senza `immobili`");
  return data.immobili as RigaVetrina[];
}

/** Il catalogo pubblico dal CRM, nella stessa forma della via Airtable.
 *  Trasparenza AI e ordinamento li applica il chiamante (airtable.ts),
 *  identici per le due sorgenti. */
export async function getPropertiesDaVetrina(): Promise<Property[]> {
  return (await righe()).map(mapRiga);
}

/** Per il proxy /foto: id allegato → record e nome del file, per i quattro
 *  campi foto degli immobili pubblicati qui. Il confine di riservatezza è
 *  quello della vetrina (e la rotta foto del CRM lo ricontrolla): un allegato
 *  di una casa che questo sito non mostra non entra nell'indice → 404. */
export async function fotoDaVetrina(): Promise<Map<string, { rec: string; filename: string | null }>> {
  const indice = new Map<string, { rec: string; filename: string | null }>();
  for (const r of await righe()) {
    for (const campo of [r.copertina, r.foto_top8, r.foto, r.planimetrie]) {
      if (!Array.isArray(campo)) continue;
      for (const a of campo) {
        if (typeof a?.id !== "string" || !(a.type ?? "image/").startsWith("image/")) continue;
        indice.set(a.id, { rec: r.airtable_id, filename: a.filename ?? null });
      }
    }
  }
  return indice;
}
