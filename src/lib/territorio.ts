// Il territorio sul sito (07/10/2026): dalle case alla carta e ai tempi.
// Tutto ciò che la pagina dice di un'area, di un comune o di una distanza passa
// da qui, e qui legge solo dati misurati (src/lib/aree.ts, src/content/carta/*).
import { AREE, areaDi, sedeComune, tuttiIComuni, type AreaId, type Lingua } from "./aree";
import { MINUTI, ORIGINI, DATA_MISURA, type Origine } from "@/content/carta/tempi";
import type { Property } from "./properties";
import type { PuntoCarta } from "@/components/carta/CartaFvg";

export { DATA_MISURA, ORIGINI, type Origine };

export function areaDiCasa(p: Pick<Property, "comune" | "lat" | "lng">): AreaId | null {
  return areaDi({ comune: p.comune, lat: p.lat, lng: p.lng });
}

/** Le case per area, nell'ordine delle aree; le senza area (estero, comune ignoto) in coda. */
export function perArea<T extends Pick<Property, "comune" | "lat" | "lng">>(case_: T[]): { area: AreaId | null; items: T[] }[] {
  const m = new Map<AreaId | null, T[]>();
  for (const p of case_) {
    const a = areaDiCasa(p);
    (m.get(a) ?? m.set(a, []).get(a)!).push(p);
  }
  return [...AREE, null].filter((a) => m.has(a)).map((a) => ({ area: a, items: m.get(a)! }));
}

/** Dove sta una casa sulla carta: le sue coordinate, o la sede del comune (dichiarato). */
export function puntoDiCasa(p: Pick<Property, "comune" | "lat" | "lng">): { lat: number; lng: number; approssimato: boolean } | null {
  if (p.lat != null && p.lng != null) return { lat: p.lat, lng: p.lng, approssimato: false };
  const s = sedeComune(p.comune);
  return s ? { lat: s.lat, lng: s.lng, approssimato: true } : null;
}

export const NOMI_ORIGINE: Record<Origine, Record<Lingua, string>> = {
  trieste: { it: "Trieste", en: "Trieste", de: "Triest", sl: "Trst" },
  udine: { it: "Udine", en: "Udine", de: "Udine", sl: "Videm" },
  aer_trieste: { it: "Aeroporto di Trieste", en: "Trieste Airport", de: "Flughafen Triest", sl: "Letališče Trst" },
  aer_venezia: { it: "Aeroporto di Venezia", en: "Venice Airport", de: "Flughafen Venedig", sl: "Letališče Benetke" },
  lubiana: { it: "Lubiana", en: "Ljubljana", de: "Laibach", sl: "Ljubljana" },
  klagenfurt: { it: "Klagenfurt", en: "Klagenfurt", de: "Klagenfurt", sl: "Celovec" },
  vienna: { it: "Vienna", en: "Vienna", de: "Wien", sl: "Dunaj" },
  monaco: { it: "Monaco di Baviera", en: "Munich", de: "München", sl: "München" },
  salisburgo: { it: "Salisburgo", en: "Salzburg", de: "Salzburg", sl: "Salzburg" },
};

/** Da dove parte, di default, chi legge in quella lingua. */
export const ORIGINE_DEFAULT: Record<Lingua, Origine> = { it: "trieste", en: "vienna", de: "monaco", sl: "lubiana" };

export function minuti(dest: string, origine: Origine): number | null {
  const riga = MINUTI[dest];
  return riga ? riga[ORIGINI.indexOf(origine)] ?? null : null;
}

/** «1 h 44», «23 min». Il minuto misurato, mai arrotondato ai 5. */
export function durata(min: number | null, l: Lingua): string {
  if (min == null) return "—";
  const h = Math.floor(min / 60), m = min % 60;
  const ore = { it: "h", en: "h", de: "Std.", sl: "h" }[l];
  return h ? `${h} ${ore} ${String(m).padStart(2, "0")}` : `${m} min`;
}

/** Mediana, minimo e massimo dei minuti da un'origine verso i comuni di un'area (sedi municipali). */
export function tempiArea(area: AreaId, origine: Origine): { mediana: number; min: { min: number; comune: string }; max: { min: number; comune: string } } {
  const v = tuttiIComuni()
    .filter((c) => c.area === area)
    .map((c) => ({ comune: c.nome, min: minuti(c.istat, origine) }))
    .filter((x): x is { comune: string; min: number } => x.min != null)
    .sort((a, b) => a.min - b.min);
  const n = v.length;
  // mediana vera: con un numero pari di comuni la media dei due centrali
  const mediana = n % 2 ? v[(n - 1) / 2].min : Math.round((v[n / 2 - 1].min + v[n / 2].min) / 2);
  return { mediana, min: v[0], max: v[n - 1] };
}

export function comuniDellArea(area: AreaId): string[] {
  return tuttiIComuni()
    .filter((c) => c.area === area)
    .map((c) => c.nome)
    .sort((a, b) => a.localeCompare(b, "it"));
}

/** L'indirizzo di un sito del gruppo nella lingua del lettore (misurato il 07/10: ogni sito ha la sua lingua «senza prefisso»). */
export function urlGemello(sito: "tsv" | "lignano" | "sappada" | "slovenia", l: Lingua, campagna = "carta"): string {
  const base = {
    tsv: { host: "https://triestevillas.com", radice: "it" },
    lignano: { host: "https://www.lignanovillas.com", radice: "en" },
    sappada: { host: "https://sappadavillas.com", radice: "it" },
    slovenia: { host: "https://sloveniavillas.com", radice: "en" },
  }[sito];
  const path = l === base.radice ? "/" : `/${l}`;
  return `${base.host}${path}?utm_source=friulivillas.com&utm_medium=referral&utm_campaign=${campagna}`;
}

/** I siti del gruppo sulla carta: dove stanno davvero, e dove portano. */
export function puntiGruppo(l: Lingua): PuntoCarta[] {
  const nota = { it: "sito del gruppo", en: "group site", de: "Seite der Gruppe", sl: "stran skupine" }[l];
  return [
    { id: "g-tsv", tipo: "gruppo", lat: 45.6503, lng: 13.7681, etichetta: "TriesteVillas", nota, href: urlGemello("tsv", l), esterno: true },
    { id: "g-lig", tipo: "gruppo", lat: 45.6892, lng: 13.1296, etichetta: "LignanoVillas", nota, href: urlGemello("lignano", l), esterno: true },
    { id: "g-sap", tipo: "gruppo", lat: 46.566, lng: 12.684, etichetta: "SappadaVillas", nota, href: urlGemello("sappada", l), esterno: true },
    { id: "g-slo", tipo: "gruppo", lat: 45.709, lng: 13.873, etichetta: "SloveniaVillas", nota, href: urlGemello("slovenia", l), esterno: true },
  ];
}

const CITTA: Record<string, Partial<Record<Lingua, string>>> = {
  Udine: { sl: "Videm" },
  Pordenone: { sl: "Pordenon" },
  Gorizia: { de: "Görz", sl: "Gorica" },
  Tolmezzo: { sl: "Tolmeč" },
  Tarvisio: { de: "Tarvis", sl: "Trbiž" },
  "Cividale del Friuli": { it: "Cividale", en: "Cividale", de: "Cividale", sl: "Čedad" },
  Grado: { sl: "Gradež" },
  Palmanova: { sl: "Palmanova" },
};

/** Città di riferimento: geografia, non promesse («case a…» solo dove ci sono). */
export function puntiCitta(l: Lingua): PuntoCarta[] {
  return Object.entries(CITTA).flatMap(([n, nomi]) => {
    const s = sedeComune(n);
    return s ? [{ id: `c-${s.istat}`, tipo: "citta" as const, lat: s.lat, lng: s.lng, etichetta: nomi[l] ?? n }] : [];
  });
}
