import "server-only";
import { unstable_cache } from "next/cache";
import {
  LINGUE_AI,
  firmaDiGeneratore,
  iptcValido,
  normalizzaTrattamento,
  riordinaSimulazioni,
  eSimulazione,
  IPTC_PER_TRATTAMENTO,
  type FotoAi,
  type Testi,
} from "./fotoAi";
import type { Photo, Property } from "./properties";

// ═══════════════════════════════════════════════════════════════════════════
// LA TRASPARENZA AI SULLE FOTO, DAL CRM (SPEC 01/10/2026 §5.8 e §9.1).
//
// FriuliVillas legge il catalogo da Airtable; la trasparenza (etichetta,
// didascalia, originale, nota) vive invece in tabelle NATE nel CRM
// (foto_trasparenza, foto_originale, immobile_nota_ai) e su Airtable non c'è.
// Si prende con UNA fetch separata della vetrina del CRM:
//   GET <vetrina>/api/vetrina?sito=friulivillas.com&vista=trasparenza
//   → { stato, …, immobili: [{ airtable_id, tsv_prop_id, trasparenza }] }
// indicizzata per id record Airtable, e si abbina alle foto per filename.
//
// ── TOLLERANTE, MA SENZA TOGLIERE ETICHETTE ────────────────────────────────
// Il catalogo non dipende mai da questa lettura: se fallisce, le pagine si
// costruiscono lo stesso. Ma «fallisce ⇒ nessuna etichetta» non va bene: le
// foto che l'ultima risposta buona conosceva come AI uscirebbero nude. Quindi,
// dal più al meno informato:
//   1. la vista, letta e VALIDATA dentro `unstable_cache` (revalidate 600 e
//      tag "properties", come il catalogo). Il tetto d'attesa (5 s) sta DENTRO
//      la funzione in cache, come `AbortSignal`: una risposta lenta o rotta
//      LANCIA, e una funzione in cache che lancia non sovrascrive la copia
//      buona. Next la serve ancora — anche nella rigenerazione ISR, dove la
//      voce scaduta si rilegge in primo piano: in caso d'errore
//      unstable-cache.js restituisce la copia vecchia (`return cachedResponse`).
//      Prima il tetto era una corsa FUORI dalla cache, e su una risposta lenta
//      vinceva il timer prima che Next potesse ripiegare sulla copia vecchia
//      (review del 01/10). Una risposta che dichiara `stato` diverso da
//      «letta» (tabelle illeggibili ⇒ `trasparenza` null per tutti) è un
//      GUASTO, non «nessuna foto AI»: si lancia anche lì;
//   2. l'ultima risposta valida vista da QUESTO processo (in memoria), per i
//      casi in cui la cache non ha nessuna copia (prima lettura dopo un deploy:
//      la chiave di unstable_cache contiene il sorgente della funzione);
//   3. nessuna risposta buona: restano le sole sigle «AI» sui nomi dei
//      generatori.
// La sigla sui nomi dei generatori NON è un gradino: vale SEMPRE, su ogni foto
// senza riga nel CRM (vedi fotoAi.ts → firmaDiGeneratore). Così lo stato più
// informato non mostra mai meno etichette di quello meno informato.
//
// ── OVERRIDE PER IL COLLAUDO ───────────────────────────────────────────────
// `CRM_TRASPARENZA_URL` (URL completa) sostituisce l'indirizzo della vista,
// per servirne una di prova in locale. L'origine di quell'URL è anche quella
// da cui si caricano gli ORIGINALI (`/api/vetrina/foto/<rec>/<id>/<m|xl>`).
// Senza override, l'origine è quella di `CRM_VETRINA_URL` (la vetrina già
// usata per lo sloveno), di default https://tsv-pg.vercel.app.
// ═══════════════════════════════════════════════════════════════════════════

const SITO = "friulivillas.com";
const REVALIDATE_SECONDS = 600;
// Tetto della lettura vera (dentro la cache) e, più largo, di tutta l'attesa:
// il secondo serve solo se la cache stessa non risponde, e deve lasciare al
// primo il tempo di scadere e a Next quello di restituire la copia vecchia.
const TIMEOUT_MS = 5000;
const TETTO_ATTESA_MS = 8000;

function origineVetrina(): string {
  const configurata = (process.env.CRM_VETRINA_URL || "").trim();
  try {
    if (configurata) return new URL(configurata).origin;
  } catch {
    /* URL malformata: si ripiega sul default */
  }
  return "https://tsv-pg.vercel.app";
}

const VISTA_URL =
  (process.env.CRM_TRASPARENZA_URL || "").trim() ||
  `${origineVetrina()}/api/vetrina?sito=${SITO}&vista=trasparenza`;

const ORIGINE_ORIGINALI = (() => {
  try {
    return new URL(VISTA_URL).origin;
  } catch {
    return origineVetrina();
  }
})();

// ---- La forma della vista, ripulita -----------------------------------------
// Si tiene SOLO ciò che serve al sito: la copia in cache resta piccola (il tetto
// della Data Cache è 2 MB) e niente di ciò che la vista aggiungerà domani
// arriva al browser senza che lo si decida qui.

export type FotoVista = {
  filename: string;
  trattamento: string;
  iptc: string | null;
  blocco_difetti: boolean;
  didascalia: Testi | null;
  originale: { id: string; larghezza: number | null; altezza: number | null } | null;
};

export type TrasparenzaImmobile = {
  nota: Testi | null;
  foto: FotoVista[];
  aiNonAbbinate: number;
};

type Vista = { immobili: Record<string, TrasparenzaImmobile> };

const ATT_ID = /^att[A-Za-z0-9]{14}$/;
const REC_ID = /^rec[A-Za-z0-9]{14}$/;

const testo = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;
const numero = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

function testi(v: unknown): Testi | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const t = Object.fromEntries(LINGUE_AI.map((l) => [l, testo(o[l])])) as Testi;
  return LINGUE_AI.some((l) => t[l] !== null) ? t : null;
}

function pulisciFoto(v: unknown): FotoVista | null {
  if (!v || typeof v !== "object") return null;
  const f = v as Record<string, unknown>;
  const filename = typeof f.filename === "string" ? f.filename : null;
  if (filename === null) return null;
  const o = f.originale as Record<string, unknown> | null | undefined;
  const id = o && typeof o.id === "string" && ATT_ID.test(o.id) ? o.id : null;
  return {
    filename,
    trattamento: typeof f.trattamento === "string" ? f.trattamento : "ai",
    iptc: testo(f.iptc),
    blocco_difetti: f.blocco_difetti === true,
    didascalia: testi(f.didascalia),
    originale: id ? { id, larghezza: numero(o!.larghezza), altezza: numero(o!.altezza) } : null,
  };
}

/** Valida e ripulisce la risposta. Lancia se la risposta non è una vista buona. */
function leggiRisposta(dati: unknown): Vista {
  if (!dati || typeof dati !== "object") throw new Error("risposta non JSON");
  const d = dati as Record<string, unknown>;
  if (d.vista !== "trasparenza") throw new Error(`vista «${String(d.vista)}» invece di «trasparenza»`);
  if (d.stato !== "letta") throw new Error(`stato «${String(d.stato)}»: il CRM non ha letto le tabelle`);
  if (!Array.isArray(d.immobili)) throw new Error("risposta senza `immobili`");
  const immobili: Record<string, TrasparenzaImmobile> = {};
  for (const r of d.immobili as Array<Record<string, unknown> | null>) {
    const id = typeof r?.airtable_id === "string" && REC_ID.test(r.airtable_id) ? r.airtable_id : null;
    const t = r?.trasparenza as Record<string, unknown> | null | undefined;
    if (!id || !t || typeof t !== "object") continue;
    const conteggi = (t.conteggi ?? {}) as Record<string, unknown>;
    immobili[id] = {
      nota: testi(t.nota),
      foto: Array.isArray(t.foto)
        ? (t.foto as unknown[]).map(pulisciFoto).filter((x): x is FotoVista => x !== null)
        : [],
      aiNonAbbinate: numero(conteggi.ai_non_abbinate) ?? 0,
    };
  }
  return { immobili };
}

// La copia valida più recente, nella Data Cache di Next. Una lettura che non
// passa leggiRisposta, o che non arriva in TIMEOUT_MS, LANCIA: così non
// sovrascrive mai la copia buona, e Next ripiega su quella.
const vistaInCache = unstable_cache(
  async (url: string): Promise<Vista> => {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return leggiRisposta(await res.json());
  },
  ["trasparenza-vista-v1"],
  { revalidate: REVALIDATE_SECONDS, tags: ["properties"] },
);

let ultimaBuona: Vista | null = null;
let inVolo: Promise<Esito> | null = null;

export type Esito = {
  /** da dove vengono i dati: vista (o sua copia in cache), memoria del processo, nessuna */
  fonte: "vista" | "memoria" | "nessuna";
  per: Map<string, TrasparenzaImmobile>;
};

function esitoDa(v: Vista, fonte: Esito["fonte"]): Esito {
  return { fonte, per: new Map(Object.entries(v.immobili)) };
}

async function leggi(): Promise<Esito> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Il tetto vero è dentro vistaInCache (AbortSignal): questo è solo il
  // paracadute se la cache stessa non risponde. La lettura rimasta indietro
  // finisce da sola e popola la cache per il giro dopo.
  const scaduto = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), TETTO_ATTESA_MS);
  });
  // Anche una lettura arrivata DOPO il timer aggiorna la memoria del processo.
  const lettura = vistaInCache(VISTA_URL).then((v) => {
    ultimaBuona = v;
    return v;
  });
  lettura.catch(() => {}); // se vince il timer, il rifiuto tardivo non resta orfano
  try {
    const v = await Promise.race([lettura, scaduto]);
    if (v) return esitoDa(v, "vista");
    console.warn(`[trasparenza] nessuna risposta in ${TETTO_ATTESA_MS} ms`);
  } catch (e) {
    console.warn(`[trasparenza] vista non letta: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    clearTimeout(timer);
  }
  if (ultimaBuona) return esitoDa(ultimaBuona, "memoria");
  console.warn("[trasparenza] nessuna risposta buona finora: restano le sole sigle sui nomi dei generatori");
  return { fonte: "nessuna", per: new Map() };
}

/** La trasparenza di tutti gli immobili del sito. Non lancia mai. */
export function getTrasparenza(): Promise<Esito> {
  // Le chiamate concorrenti dello stesso processo (in build sono decine)
  // aspettano la stessa lettura.
  if (!inVolo) inVolo = leggi().finally(() => (inVolo = null));
  return inVolo;
}

// ---- Dalla vista alle foto del sito ------------------------------------------

function urlOriginale(rec: string, id: string, taglia: "m" | "xl"): string {
  return `${ORIGINE_ORIGINALI}/api/vetrina/foto/${rec}/${id}/${taglia}`;
}

function fotoAiDa(rec: string, f: FotoVista): FotoAi {
  const trattamento = normalizzaTrattamento(f.trattamento);
  return {
    trattamento,
    iptc: iptcValido(f.iptc, trattamento),
    origine: "crm",
    didascalia: f.didascalia,
    originale: f.originale
      ? {
          m: urlOriginale(rec, f.originale.id, "m"),
          xl: urlOriginale(rec, f.originale.id, "xl"),
          larghezza: f.originale.larghezza,
          altezza: f.originale.altezza,
        }
      : null,
    bloccoDifetti: f.blocco_difetti,
  };
}

// La sigla «AI» che il sito mette da sé, senza riga nel CRM.
const GENERICA: FotoAi = {
  trattamento: "ai",
  iptc: IPTC_PER_TRATTAMENTO.ai,
  origine: "generica",
  didascalia: null,
  originale: null,
  bloccoDifetti: false,
};

/**
 * L'immobile con la trasparenza applicata: `ai` su ogni foto (non sulle
 * planimetrie, SPEC §5.5), `trasparenza` per il riepilogo, e le simulazioni
 * tolte dalla copertina e dalla testa della galleria (SPEC §9.3).
 *
 * Per ogni foto, dal più al meno certo:
 *   1. la sua riga nel CRM;
 *   2. senza riga, ma con righe AI del CRM che non combaciano più con nessun
 *      file mostrato (`ai_non_abbinate`): non sappiamo quale foto
 *      descrivessero, quindi la sigla va su tutte quelle senza riga;
 *   3. senza riga, col nome di un generatore (hf_…, Nano Banana, …): la sigla
 *      minima, SEMPRE — anche quando il CRM risponde e non sa niente
 *      dell'immobile.
 * ⚠️ La SPEC §0 dice «se `conteggi.ai > 0` e una foto non ha riga, etichetta
 * generica»; qui la regola è `ai_non_abbinate > 0`, come la definisce il CRM
 * (vetrina-trasparenza.ts: «è il segnale per il sito»). Con la regola letterale,
 * un immobile con tre righe AI e cinquanta foto vere non registrate avrebbe la
 * sigla «AI» su tutte e cinquanta. Da ratificare con Martino.
 *
 * Senza riga, senza segnale e senza firma la foto resta com'era: un immobile
 * senza nulla di tutto questo torna IDENTICO (stesso oggetto).
 */
export function applicaTrasparenza(p: Property, esito: Esito): Property {
  const t = esito.per.get(p.recId) ?? null;
  const perNome = t ? new Map(t.foto.map((f) => [f.filename, f])) : null;
  const assegna = (ph: Photo): FotoAi | null => {
    const riga = ph.filename !== null ? perNome?.get(ph.filename) : undefined;
    if (riga) return fotoAiDa(p.recId, riga);
    if (t && t.aiNonAbbinate > 0) return GENERICA;
    return firmaDiGeneratore(ph.filename) ? GENERICA : null;
  };

  let toccata = false;
  const marca = (ph: Photo): Photo => {
    const ai = assegna(ph);
    if (!ai) return ph;
    toccata = true;
    return { ...ph, ai };
  };
  const photos0 = p.photos.map(marca);
  const topPhotos0 = p.topPhotos.map(marca);
  const cover0 = p.coverPhoto ? marca(p.coverPhoto) : null;
  if (!toccata && !t) return p;

  const photos = riordinaSimulazioni(photos0);
  const topPhotos = riordinaSimulazioni(topPhotos0);
  let coverPhoto = cover0;

  // La copertina simulata cede il posto alla prima foto reale (prima i top 8,
  // poi la galleria). Se non è anche in galleria, ci entra subito dopo la
  // prima foto reale: si sposta, non sparisce.
  let galleria = photos;
  if (coverPhoto && eSimulazione(coverPhoto.ai)) {
    const reale = [...topPhotos, ...photos].find((ph) => !eSimulazione(ph.ai));
    if (reale) {
      const simulata = coverPhoto;
      coverPhoto = reale;
      const giaDentro = photos.some((ph) =>
        simulata.filename !== null ? ph.filename === simulata.filename : ph.url === simulata.url,
      );
      if (!giaDentro) {
        const k = photos.findIndex((ph) => !eSimulazione(ph.ai));
        galleria = k < 0 ? [...photos, simulata] : [...photos.slice(0, k + 1), simulata, ...photos.slice(k + 1)];
      }
    }
  }

  return {
    ...p,
    photos: galleria,
    topPhotos,
    coverPhoto,
    trasparenza: t ? { nota: t.nota } : null,
  };
}
