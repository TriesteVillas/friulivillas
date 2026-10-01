// La trasparenza AI sulle foto — la parte PURA, condivisa fra server e client
// (SPEC 01/10/2026 §5 e §9, v1.1). Nessun I/O qui: la lettura della vista del
// CRM sta in src/lib/trasparenza.ts (server-only), che usa questi tipi.
//
// Cosa arriva al browser per ogni foto: il trattamento (→ etichetta), la
// didascalia nelle quattro lingue, l'originale da mostrare con «Vedi
// l'originale» e il flag dei difetti protetti. Niente modello, niente job,
// niente provenienza: quella resta nel CRM (SPEC §2).

export const LINGUE_AI = ["it", "en", "de", "sl"] as const;
export type LinguaAi = (typeof LINGUE_AI)[number];
export type Testi = Record<LinguaAi, string | null>;

// I trattamenti che il sito sa etichettare (SPEC §5.1 + §9.3). Un valore che il
// sito non conosce (il CRM ne aggiunge uno domani) NON resta senza etichetta:
// diventa l'etichetta generica «AI» — meglio una sigla di troppo che una
// in meno (SPEC §0).
export const TRATTAMENTI = [
  "tecnico",
  "ai",
  "ai_luce",
  "ai_pulizia",
  "ai_aggiunte",
  "ai_rendering",
  "rendering",
] as const;
export type Trattamento = (typeof TRATTAMENTI)[number];

export function normalizzaTrattamento(v: unknown): Trattamento {
  return typeof v === "string" && (TRATTAMENTI as readonly string[]).includes(v)
    ? (v as Trattamento)
    : "ai";
}

export type FotoAi = {
  trattamento: Trattamento;
  didascalia: Testi | null;
  // URL assolute della vetrina del CRM (non immutabili: `max-age=3600`, il
  // ritiro di un originale deve poter arrivare). `m` = lato lungo 1600,
  // `xl` = 2560. Le misure sono quelle dichiarate dal CRM (possono mancare).
  originale: { m: string; xl: string; larghezza: number | null; altezza: number | null } | null;
  bloccoDifetti: boolean;
};

/** L'etichetta visibile: `tecnico` non ne ha (SPEC §5.1). */
export function haEtichetta(ai: FotoAi | null | undefined): ai is FotoAi {
  return Boolean(ai && ai.trattamento !== "tecnico");
}

// Simulazioni: arredi o parti che nella casa non ci sono, o immagini generate
// per intero. Non sono mai la copertina né la prima foto della galleria
// (SPEC §9.3, regola di ordine).
const SIMULAZIONI: readonly Trattamento[] = ["ai_aggiunte", "ai_rendering", "rendering"];
export function eSimulazione(ai: FotoAi | null | undefined): boolean {
  return Boolean(ai && SIMULAZIONI.includes(ai.trattamento));
}

/**
 * Testo nella lingua del visitatore, con il ripiego lingua → en → it (SPEC
 * §5.2). Restituisce anche la lingua VERA del testo, per l'attributo `lang`.
 */
export function testoIn(
  t: Testi | null | undefined,
  locale: string,
): { testo: string; lang: LinguaAi } | null {
  if (!t) return null;
  const ordine: LinguaAi[] = [];
  if ((LINGUE_AI as readonly string[]).includes(locale)) ordine.push(locale as LinguaAi);
  for (const l of ["en", "it"] as const) if (!ordine.includes(l)) ordine.push(l);
  for (const l of ordine) {
    const s = t[l];
    if (typeof s === "string" && s.trim()) return { testo: s.trim(), lang: l };
  }
  return null;
}

/**
 * Sposta le simulazioni che aprono una lista DOPO la prima foto reale.
 * Se nella lista non c'è nessuna foto reale la lascia com'è: l'etichetta basta.
 * Non tocca l'ordine relativo di tutto il resto.
 */
export function riordinaSimulazioni<T extends { ai?: FotoAi | null }>(lista: T[]): T[] {
  const k = lista.findIndex((p) => !eSimulazione(p.ai));
  if (k <= 0) return lista;
  return [lista[k], ...lista.slice(0, k), ...lista.slice(k + 1)];
}

// ---- Etichetta generica quando la vista del CRM non è MAI stata letta --------
//
// Ultima linea di difesa (non la regola): se la vista non ha mai risposto bene
// da quando questo processo è vivo e la cache non ne conserva una copia, le foto
// i cui nomi portano la firma di un generatore escono con la sigla «AI». Sono i
// nomi che i generatori danno ai file e che restano tali sul catalogo:
//   hf_AAAAMMGG_…            Higgsfield (Nano Banana, Seedream…)
//   …Nano_Banana… / RENDER…  esportazioni rinominate a mano
//   Gemini_Generated_Image…  Gemini · «ChatGPT Image …» ChatGPT
const GENERATORI = [
  /^hf_\d{8}_/i,
  /nano[\s_-]*banana/i,
  /render/i,
  /^gemini_generated_image/i,
  /^chatgpt image/i,
];
export function firmaDiGeneratore(filename: string | null | undefined): boolean {
  return typeof filename === "string" && GENERATORI.some((re) => re.test(filename.trim()));
}

// ---- La nota AI già scritta dentro la descrizione (SPEC §5.4) ---------------
//
// Quando la vista porta la nota, il riepilogo #foto-ai la mostra: la stessa
// nota in fondo alla descrizione sarebbe un doppione. Si tolgono i paragrafi
// che COMINCIANO con uno degli attacchi standard (vecchi compresi); se l'attacco
// sta dentro un paragrafo, dopo la fine di una frase, il paragrafo si tronca lì
// (la nota sta sempre in fondo: protocols/nota-ai-foto.md §2).
const ATTACCHI_NOTA = [
  "Nota sull'uso dell'intelligenza artificiale",
  "Note on the use of artificial intelligence",
  "Hinweis zum Einsatz künstlicher Intelligenz",
  "Opomba o uporabi umetne inteligence",
  "Nota sulle fotografie",
  "A note on the photographs",
  "Note on the images",
  "Hinweis zu den Fotos",
  "Hinweis zu den Fotografien",
  "Opomba o fotografijah",
];

// L'attacco come espressione: maiuscole indifferenti, apostrofo dritto o curvo,
// spazi multipli tollerati.
const ATTACCHI_RE = ATTACCHI_NOTA.map((a) =>
  a
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/'/g, "['’‘`´]")
    .replace(/ /g, "\\s+"),
);
// Davanti all'attacco, in testa al paragrafo, si tollera ciò che non è una
// lettera: virgolette, asterischi, trattini, emoji.
const IN_TESTA = new RegExp(`^[^\\p{L}]*(?:${ATTACCHI_RE.join("|")})`, "iu");
// Dentro un paragrafo vale solo dopo la fine di una frase.
const DENTRO = new RegExp(`(?<=[.!?…»"”)]\\s+)(?:${ATTACCHI_RE.join("|")})`, "iu");

function cominciaConAttacco(p: string): boolean {
  return IN_TESTA.test(p);
}

function tagliaAttaccoInterno(p: string): string | null {
  const m = DENTRO.exec(p);
  return m && m.index > 0 ? p.slice(0, m.index).trimEnd() : null;
}

/** La descrizione senza la nota AI. Se non c'è nulla da togliere, la stringa resta IDENTICA. */
export function togliNotaAi(testo: string): string {
  const paragrafi = testo.split(/\n+/);
  let cambiato = false;
  const out: string[] = [];
  for (const p of paragrafi) {
    if (p.trim() && cominciaConAttacco(p)) {
      cambiato = true;
      continue;
    }
    const tagliato = tagliaAttaccoInterno(p);
    if (tagliato !== null) {
      cambiato = true;
      if (tagliato.trim()) out.push(tagliato);
      continue;
    }
    out.push(p);
  }
  return cambiato ? out.join("\n").trim() : testo;
}

// ---- I conteggi del riepilogo -------------------------------------------------
//
// Contati su ciò che il SITO mostra — copertina + top 8 + galleria, coi doppioni
// tolti per filename come li toglie il sito (stessa regola del CRM,
// `galleriaDelSito`) — dopo aver applicato anche le etichette generiche. Così
// «N foto su M» dice quante etichette il visitatore trova davvero, anche quando
// una riga del CRM non combacia più con nessun file (ai_non_abbinate).
export type ConteggiAi = {
  pubblicate: number;
  ai: number;
  bloccoDifetti: number;
  /** foto con l'originale visibile, comprese quelle `tecnico` (come `con_originale` del CRM) */
  conOriginale: number;
  /** delle foto con etichetta, quante hanno l'originale: decide «su ogni foto modificata» */
  aiConOriginale: number;
};

export function contaFotoAi(
  fotoMostrate: Array<{ id: string | null; url: string; filename: string | null; ai?: FotoAi | null }>,
): ConteggiAi {
  const viste = new Set<string>();
  const c: ConteggiAi = { pubblicate: 0, ai: 0, bloccoDifetti: 0, conOriginale: 0, aiConOriginale: 0 };
  for (const p of fotoMostrate) {
    const chiave = p.filename ?? `\u0000${p.id ?? p.url}`;
    if (viste.has(chiave)) continue;
    viste.add(chiave);
    c.pubblicate++;
    if (haEtichetta(p.ai)) {
      c.ai++;
      if (p.ai.originale) c.aiConOriginale++;
    }
    if (p.ai?.bloccoDifetti) c.bloccoDifetti++;
    if (p.ai?.originale) c.conOriginale++;
  }
  return c;
}

// ---- I testi dell'etichetta ---------------------------------------------------
//
// `tr` traduce le chiavi del namespace `property.aiFoto` (messages/*.json, in
// quattro lingue: il prebuild check-messages ferma la build se ne manca una).
// Lo passano allo stesso modo le pagine server (getTranslations) e i
// componenti client (useTranslations).
export type TradAi = (chiave: string) => string;

export function etichettaAi(
  ai: FotoAi,
  locale: string,
  tr: TradAi,
  mostraOriginale = false,
): { estesa: string; compatta: string; aria: string } {
  if (mostraOriginale) {
    const testo = tr("tag.originale");
    return { estesa: testo, compatta: testo, aria: `${testo}: ${tr("originalCaption")}` };
  }
  const estesa = ai.trattamento === "tecnico" ? "" : tr(`tag.${ai.trattamento}`);
  // La sigla nuda «AI» si legge per esteso (SPEC §9.3).
  const base = ai.trattamento === "ai" ? tr("genericAria") : estesa;
  const didascalia = testoIn(ai.didascalia, locale)?.testo;
  return { estesa, compatta: tr("glyph"), aria: didascalia ? `${base}: ${didascalia}` : base };
}

// ---- La serie del lightbox quando l'annuncio ha dati AI -----------------------
//
// Il lightbox di questo sito scorre la sola galleria (`foto`): una miniatura
// dei top 8 che non sta anche in galleria lo apriva sulla foto 1. Su FriuliVillas
// è il caso normale — i top 8 sono una scelta a parte (misurato il 01/10/2026:
// su Le Vigne, Begliano e Sappada nessuno dei top 8 è in `foto`) — e per la
// trasparenza non va: didascalia e «Vedi l'originale» di una foto AI dei top 8
// non si potevano aprire mai. Quando l'annuncio ha dati AI la serie è quindi
// copertina + top 8 + galleria, coi doppioni tolti per filename (la stessa
// serie che il CRM conta come «foto pubblicate»). Senza dati AI resta com'era.
type FotoSerie = { url: string; filename: string | null; ai?: FotoAi | null };

export function serieHaAi(...gruppi: Array<FotoSerie | null | undefined | FotoSerie[]>): boolean {
  return gruppi.some((g) => (Array.isArray(g) ? g.some((p) => p.ai) : Boolean(g?.ai)));
}

export function serieCompleta<T extends FotoSerie>(copertina: T | null, top: T[], galleria: T[]): T[] {
  const viste = new Set<string>();
  const out: T[] = [];
  for (const p of [...(copertina ? [copertina] : []), ...top, ...galleria]) {
    const chiave = p.filename ?? `\u0000${p.url}`;
    if (viste.has(chiave)) continue;
    viste.add(chiave);
    out.push(p);
  }
  return out;
}
