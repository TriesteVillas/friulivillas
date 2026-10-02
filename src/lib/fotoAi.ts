// La trasparenza AI sulle foto — la parte PURA, condivisa fra server e client
// (SPEC 01/10/2026 §5 e §9, v1.1). Nessun I/O qui: la lettura della vista del
// CRM sta in src/lib/trasparenza.ts (server-only), che usa questi tipi.
//
// Cosa arriva al browser per ogni foto: il trattamento (→ etichetta), la
// didascalia nelle quattro lingue, l'originale da mostrare con «Vedi
// l'originale», il flag del blocco difetti e la marcatura IPTC da scrivere nel
// file. Niente modello, niente job, niente provenienza: quella resta nel CRM
// (SPEC §2).

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

// Quali trattamenti sono «passati da un modello generativo» — la stessa lista
// del CRM (tsv-pg web/lib/trasparenza-regole.mjs → TRATTAMENTI_AI, eAi), così
// «N foto modificate con l'AI» del sito è lo stesso numero di `conteggi.ai`.
// Non `tecnico`, e da v1.1 non `rendering`: è il render di progetto fatto SENZA
// AI, ha la sua etichetta «Rendering» ma non si conta come AI.
const TRATTAMENTI_AI: readonly Trattamento[] = ["ai", "ai_luce", "ai_pulizia", "ai_aggiunte", "ai_rendering"];
export function eAi(t: Trattamento | null | undefined): boolean {
  return Boolean(t && TRATTAMENTI_AI.includes(t));
}

// ---- La marcatura IPTC «DigitalSourceType» (SPEC §2, §5.7) -------------------
//
// Il CRM la dichiara per ogni foto (`iptc`); se manca o non è fra le tre che il
// contratto conosce, si deriva dal trattamento con la stessa tabella del CRM.
// Nell'URL del proxy /foto viaggia come sigla corta (vedi photoSrc): l'URL è in
// cache immutabile per un anno, quindi la marcatura deve far parte della chiave.
export const IPTC_PER_TRATTAMENTO: Record<Trattamento, string> = {
  tecnico: "algorithmicallyEnhanced",
  ai: "compositeWithTrainedAlgorithmicMedia",
  ai_luce: "compositeWithTrainedAlgorithmicMedia",
  ai_pulizia: "compositeWithTrainedAlgorithmicMedia",
  ai_aggiunte: "compositeWithTrainedAlgorithmicMedia",
  ai_rendering: "trainedAlgorithmicMedia",
  rendering: "trainedAlgorithmicMedia",
};

/** sigla nell'URL → codice IPTC. Solo queste: ogni sigla è una voce di cache. */
export const IPTC_PER_SIGLA = {
  ai: "compositeWithTrainedAlgorithmicMedia",
  gen: "trainedAlgorithmicMedia",
  enh: "algorithmicallyEnhanced",
} as const;
export type SiglaIptc = keyof typeof IPTC_PER_SIGLA;

export function siglaDiIptc(codice: string | null | undefined): SiglaIptc | null {
  for (const [sigla, c] of Object.entries(IPTC_PER_SIGLA))
    if (c === codice) return sigla as SiglaIptc;
  return null;
}

export function iptcValido(codice: unknown, trattamento: Trattamento): string {
  return typeof codice === "string" && siglaDiIptc(codice) !== null
    ? codice
    : IPTC_PER_TRATTAMENTO[trattamento];
}

export type FotoAi = {
  trattamento: Trattamento;
  /** codice IPTC DigitalSourceType da scrivere nel file servito */
  iptc: string;
  /**
   * `crm`: la foto ha la sua riga nel CRM. `generica`: nessuna riga, ma il sito
   * mette comunque «AI» (nome del file da generatore, o righe AI del CRM che
   * non combaciano più con nessun file). Le generiche non entrano nel numero
   * «modificate con l'AI», che è quello del CRM: si contano a parte.
   */
  origine: "crm" | "generica";
  didascalia: Testi | null;
  // URL assolute della vetrina del CRM (non immutabili: `max-age=3600`, il
  // ritiro di un originale deve poter arrivare). `m` = lato lungo 1600,
  // `xl` = 2560. Le misure sono quelle dichiarate dal CRM (possono mancare).
  originale: { m: string; xl: string; larghezza: number | null; altezza: number | null } | null;
  bloccoDifetti: boolean;
};

// ---- STILE o SOSTANZA (SPEC v1.3 §11, 02/10/2026) ---------------------------
//
// «L'etichetta sulla foto si mette dove l'AI ha cambiato la SOSTANZA (cosa si
// vede), non lo STILE (luce, colore, inquadratura).» `tecnico` e `ai_luce` sono
// stile: nessuna etichetta e nessuna didascalia, OVUNQUE (scheda, miniature,
// griglia, lightbox, card, og:image). Lo stile resta dichiarato nel riepilogo
// #foto-ai dell'annuncio, e la marcatura IPTC dentro il file resta (photoSrc):
// è invisibile e vera. `ai` generica resta etichettata: finché la foto non è
// classificata non sappiamo se è solo luce (§11.4).
// Questa è LA regola: ogni superficie passa da qui (haEtichetta,
// didascaliaFoto, photoOgSrc) e il prebuild lo controlla eseguendola
// (scripts/check-etichette-ai.mjs, §11).
const TRATTAMENTI_STILE: readonly Trattamento[] = ["tecnico", "ai_luce"];
export function eStile(t: Trattamento | null | undefined): boolean {
  return Boolean(t && TRATTAMENTI_STILE.includes(t));
}

/** L'etichetta visibile sulla foto: solo dove l'AI ha toccato la sostanza (§11.1). */
export function haEtichetta(ai: FotoAi | null | undefined): ai is FotoAi {
  return Boolean(ai && !eStile(ai.trattamento));
}

/**
 * La didascalia della foto nella vista singola, nella lingua del visitatore:
 * mai per lo stile (§11.1), anche se il CRM la tiene (§11.3). Sulla sola sigla
 * «AI» senza didascalia (foto ancora in ricontrollo) NIENTE: fino al 02/10 sotto
 * ognuna si leggeva «…la descrizione dell'intervento è in preparazione», fino a
 * 55 volte nello stesso annuncio (review di misura). È uno stato di lavoro, non
 * un'informazione sulla foto: lo dice UNA volta la riga del riepilogo, e la
 * sigla porta già nell'aria-label «Foto modificata con l'AI, in ricontrollo».
 */
export function didascaliaFoto(
  ai: FotoAi | null | undefined,
  locale: string,
): { testo: string; lang: string } | null {
  if (!haEtichetta(ai)) return null;
  return testoIn(ai.didascalia, locale);
}

// ---- La home: nessuna pillola, un segno discreto solo sulle simulazioni -------
//
// SPEC §11.1: nella home di ogni sito nessuna pillola AI. Unica eccezione:
// un'immagine che mostra cose che non esistono — lì un segno DISCRETO (testo
// piccolo «simulazione», non la pillola). Il render di progetto fatto senza AI
// mostra anche lui cose che non ci sono ancora: il suo segno discreto è la sua
// parola, «Rendering». La dichiarazione completa resta nella scheda.
export type SegnoHome = "simulazione" | "rendering";
export function segnoHome(ai: FotoAi | null | undefined): SegnoHome | null {
  if (!ai) return null;
  if (ai.trattamento === "ai_aggiunte" || ai.trattamento === "ai_rendering") return "simulazione";
  if (ai.trattamento === "rendering") return "rendering";
  return null;
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

// ---- Il nome del file dice «generatore»: la sigla «AI» minima -----------------
//
// Una foto senza riga nel CRM il cui nome porta la firma di un generatore esce
// SEMPRE con la sigla «AI», qualunque cosa risponda il CRM: è la soglia minima
// (SPEC §0, «meglio una sigla di troppo»). Prima valeva solo quando la vista non
// aveva mai risposto, e così il sito più informato mostrava MENO etichette:
// misurato il 01/10/2026, con la vista FriuliVillas letta e vuota 105 foto
// `hf_…` uscivano nude (Scodovacca 40/40, Begliano 43/43, Sappada 13, Le Vigne 9).
//
// Le regole sono quelle della sentinella del CRM (tsv-pg
// web/lib/trasparenza-regole.mjs → NOMI_DA_GENERATORE), misurate sul
// censimento delle 2.128 foto pubblicate: 861 riconosciute su 861, zero falsi
// positivi. Tutte TRANNE «render nel nome»: da v1.1 un render può essere il
// progetto dell'architetto fatto senza AI, e una sigla «AI» lì direbbe il
// falso (il CRM propone «rendering o ai_rendering», da scegliere a mano).
const siglaAiNelNome = (f: string): boolean => {
  const base = f.replace(/\.[a-z0-9]{2,5}$/i, "");
  if (!/(^|[_\s.-])AI([_\s.-]|$)/.test(base)) return false;
  // In un nome tutto maiuscolo «AI» è anche la preposizione («VISTA AI
  // GIARDINI.jpg»): lì vale solo come ULTIMA parola.
  if (/[a-zà-ÿ]/.test(base)) return true;
  return /(^|[_\s.-])AI[_\s.\d-]*$/.test(base);
};
const GENERATORI: ReadonlyArray<(f: string) => boolean> = [
  (f) => /^hf_\d{8}_\d{6}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(f),
  (f) =>
    /(^|[_\s.-])(nano[_\s-]?banana|seedream|imagegen|gpt[_\s-]?image|dall[_·-]e|midjourney|firefly|ideogram)([_\s.-]|$)/i.test(f),
  (f) => /chatgpt[_\s-]?image|gemini[_\s-]generated[_\s-]image/i.test(f),
  siglaAiNelNome,
];
export function firmaDiGeneratore(filename: string | null | undefined): boolean {
  return typeof filename === "string" && filename !== "" && GENERATORI.some((prova) => prova(filename));
}

// ---- La nota AI già scritta dentro la descrizione (SPEC §5.4) ---------------
//
// Quando la vista porta la nota, il riepilogo #foto-ai la mostra: la stessa
// nota in fondo alla descrizione sarebbe un doppione. Si tolgono i paragrafi
// che COMINCIANO con uno degli attacchi standard (vecchi compresi); se l'attacco
// sta dentro un paragrafo, dopo la fine di una frase, il paragrafo si tronca lì
// (la nota sta sempre in fondo: protocols/nota-ai-foto.md §2). Se il paragrafo
// dell'attacco è un TITOLO su una riga sola («Nota sulle foto:»), si toglie
// anche il paragrafo che lo segue: è il testo della nota, e resterebbe orfano.
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
  // Varianti vere trovate nella KB (review del 01/10), fuori dall'elenco della SPEC.
  "Nota sulle immagini",
  "Nota sulle foto",
  "Hinweis zu den Bildern",
  "About the photos",
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

// Un titolo: dopo l'attacco restano al più poche parole senza contenuto
// («Nota sulle foto:», «Nota sull'uso dell'intelligenza artificiale nelle
// fotografie.»). «Nota sulle foto: scattate a luglio.» NON è un titolo: dopo i
// due punti c'è la nota stessa, e il paragrafo che segue non le appartiene.
const TITOLO_RESTO = /^[\p{L}'’\s]{0,40}[:.]?$/u;
function eTitolo(p: string): boolean {
  const s = p.trim();
  const m = IN_TESTA.exec(s);
  if (!m) return false;
  return TITOLO_RESTO.test(s.slice(m[0].length).trim());
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
  for (let i = 0; i < paragrafi.length; i++) {
    const p = paragrafi[i];
    if (p.trim() && cominciaConAttacco(p)) {
      cambiato = true;
      if (eTitolo(p)) {
        // salta anche il primo paragrafo non vuoto che segue: è il corpo della nota
        let j = i + 1;
        while (j < paragrafi.length && !paragrafi[j].trim()) j++;
        if (j < paragrafi.length) i = j;
      }
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
// `galleriaDelSito`). `ai` è LO STESSO numero di `conteggi.ai` del CRM: le foto
// con una riga AI (eAi: non `tecnico`, non `rendering`). Le etichette che il
// sito aggiunge da sé (`generica`) si contano a parte, e così i render senza AI:
// un render dell'architetto non è «modificato con l'AI».
// Dal 02/10 (SPEC §11.2) il riepilogo visibile è UNA riga calcolata da qui, in
// tre gruppi che non si mescolano (review di misura del 02/10: la prima riga
// metteva le foto ancora in ricontrollo fra quelle «con modifiche indicate
// sulla foto», e per quelle non lo sappiamo):
//   · `modificate` — l'AI ha cambiato la sostanza e la didascalia dice cosa
//     (ai_pulizia, ai_aggiunte, ai_rendering); `simulazioni` ne è una parte;
//   · `inVerifica` — la sola sigla «AI» (`ai`, dal CRM o messa dal sito):
//     passate da un modello, cosa è cambiato non è ancora descritto (§11.4);
//   · `luce` — solo stile, senza etichetta sulla foto (§11.1).
// Il dettaglio per tipo (`perTipo`) sta dentro il comando che si apre.
export type ConteggiAi = {
  pubblicate: number;
  /** foto con riga nel CRM e trattamento AI (= conteggi.ai del CRM) */
  ai: number;
  /** foto con la sola sigla «AI» messa dal sito, senza riga nel CRM */
  generiche: number;
  /** render di progetto senza AI (etichetta «Rendering») */
  rendering: number;
  /** foto ritoccate con l'AI solo nella luce e nei colori: nessuna etichetta sulla foto (§11.1) */
  luce: number;
  /** foto in cui l'AI ha cambiato la sostanza, descritta (ai_pulizia, ai_aggiunte, ai_rendering) */
  modificate: number;
  /** foto con la sola sigla «AI» (trattamento `ai`, dal CRM o dal sito): cosa è cambiato è in verifica */
  inVerifica: number;
  /** foto passate da un modello CON l'etichetta sulla foto (= modificate + inVerifica) */
  segnalate: number;
  /** simulazioni AI: ai_aggiunte + ai_rendering */
  simulazioni: number;
  bloccoDifetti: number;
  /** foto con l'originale da confrontare, comprese le `tecnico` (= con_originale del CRM) */
  conOriginale: number;
  /** foto con un'etichetta visibile sulla foto (segnalate + rendering) */
  etichettate: number;
  /**
   * quante foto per tipo, nell'ordine di TRATTAMENTI, solo i tipi presenti (non
   * `tecnico`). Le sigle «AI» messe dal sito stanno con `ai`: per chi legge sono
   * la stessa cosa, una foto passata da un modello e ancora da descrivere.
   */
  perTipo: Array<{ tipo: Trattamento; n: number }>;
};

export function contaFotoAi(
  fotoMostrate: Array<{ id: string | null; url: string; filename: string | null; ai?: FotoAi | null }>,
): ConteggiAi {
  const viste = new Set<string>();
  const perTipo = new Map<Trattamento, number>();
  const c: ConteggiAi = {
    pubblicate: 0,
    ai: 0,
    generiche: 0,
    rendering: 0,
    luce: 0,
    modificate: 0,
    inVerifica: 0,
    segnalate: 0,
    simulazioni: 0,
    bloccoDifetti: 0,
    conOriginale: 0,
    etichettate: 0,
    perTipo: [],
  };
  for (const p of fotoMostrate) {
    const chiave = p.filename ?? `\u0000${p.id ?? p.url}`;
    if (viste.has(chiave)) continue;
    viste.add(chiave);
    c.pubblicate++;
    const ai = p.ai ?? null;
    if (!ai) continue;
    if (ai.trattamento !== "tecnico") perTipo.set(ai.trattamento, (perTipo.get(ai.trattamento) ?? 0) + 1);
    if (ai.origine === "generica") c.generiche++;
    else if (eAi(ai.trattamento)) c.ai++;
    else if (ai.trattamento === "rendering") c.rendering++;
    if (ai.origine !== "generica" && ai.trattamento === "ai_luce") c.luce++;
    if (haEtichetta(ai)) {
      c.etichettate++;
      if (eAi(ai.trattamento)) {
        c.segnalate++;
        if (ai.trattamento === "ai") c.inVerifica++;
        else c.modificate++;
      }
    }
    if (ai.origine !== "generica" && (ai.trattamento === "ai_aggiunte" || ai.trattamento === "ai_rendering"))
      c.simulazioni++;
    if (ai.bloccoDifetti) c.bloccoDifetti++;
    if (ai.originale) c.conOriginale++;
  }
  c.perTipo = TRATTAMENTI.filter((t) => perTipo.has(t)).map((t) => ({ tipo: t, n: perTipo.get(t)! }));
  return c;
}

/**
 * La riga del riepilogo (§11.2), come chiavi di messaggio + valori: la scrive
 * la pagina con `tAi`. Mai scritta a mano: dai soli conteggi. Prima la
 * sostanza, poi il resto; niente denominatore («40 foto su 40» non aiuta a
 * decidere niente: review di misura del 02/10, le stesse forme proposte per
 * TSI). Una frase per gruppo, nell'ordine:
 *   · modificate (sostanza descritta)
 *       tutte simulazioni         → summaryLineSimOnly {count}
 *       alcune simulazioni        → summaryLineChangedSim {count, sim}
 *       nessuna simulazione       → summaryLineChanged {count}
 *   · in verifica (sigla «AI»)
 *       sono tutte le pubblicate  → summaryLineCheckingAll {count}
 *       dopo le modificate        → summaryLineCheckingMore {count}
 *       da sole                   → summaryLineChecking {count}
 *   · solo luce (nessuna etichetta sulla foto)
 *       sono tutte le pubblicate  → summaryLineLightAll
 *       dopo un'altra frase       → summaryLineLightMore {count}
 *       da sole                   → summaryLineLight {count}
 *   · + render senza AI          → summaryLineRenderings {count}
 *   · + difetti protetti         → summaryLineDefects
 * La chiusura «La visita resta l'unico riferimento.» la aggiunge la pagina.
 */
export function rigaRiepilogo(c: ConteggiAi): Array<{ chiave: string; valori?: Record<string, number> }> {
  const out: Array<{ chiave: string; valori?: Record<string, number> }> = [];
  const sim = Math.min(c.simulazioni, c.modificate);
  if (c.modificate > 0) {
    if (sim === c.modificate) out.push({ chiave: "summaryLineSimOnly", valori: { count: c.modificate } });
    else if (sim > 0) out.push({ chiave: "summaryLineChangedSim", valori: { count: c.modificate, sim } });
    else out.push({ chiave: "summaryLineChanged", valori: { count: c.modificate } });
  }
  if (c.inVerifica > 0) {
    if (c.inVerifica === c.pubblicate) out.push({ chiave: "summaryLineCheckingAll", valori: { count: c.inVerifica } });
    else if (out.length) out.push({ chiave: "summaryLineCheckingMore", valori: { count: c.inVerifica } });
    else out.push({ chiave: "summaryLineChecking", valori: { count: c.inVerifica } });
  }
  if (c.luce > 0) {
    if (c.luce === c.pubblicate) out.push({ chiave: "summaryLineLightAll" });
    else if (out.length) out.push({ chiave: "summaryLineLightMore", valori: { count: c.luce } });
    else out.push({ chiave: "summaryLineLight", valori: { count: c.luce } });
  }
  if (c.rendering > 0) out.push({ chiave: "summaryLineRenderings", valori: { count: c.rendering } });
  if (c.bloccoDifetti > 0) out.push({ chiave: "summaryLineDefects" });
  return out;
}

// ---- La nota del CRM dentro il riepilogo ---------------------------------------
//
// La nota comincia spesso con il suo titolo («Nota sull'uso dell'intelligenza
// artificiale nelle fotografie.»), che sotto il titolo del riepilogo («Come
// abbiamo usato l'AI in queste foto») è un doppione. Si toglie SOLO quella
// prima frase, e solo se è un titolo (l'attacco standard e poche parole senza
// contenuto); il resto della nota resta identico.
export function notaSenzaTitolo(testo: string): string {
  const s = testo.trim();
  const m = IN_TESTA.exec(s);
  if (!m) return testo;
  const dopo = s.slice(m[0].length);
  const fine = /^([\p{L}'’\s]{0,40})[.:](\s+|$)/u.exec(dopo);
  if (!fine) return testo;
  const resto = dopo.slice(fine[0].length).trim();
  return resto || testo;
}

// ---- I testi dell'etichetta ---------------------------------------------------
//
// `tr` traduce le chiavi del namespace `property.aiFoto` (messages/*.json, in
// quattro lingue: il prebuild check-messages ferma la build se ne manca una).
// Lo passano allo stesso modo le pagine server (getTranslations) e i
// componenti client (useTranslations).
//
// `aria` è CORTO di proposito: l'etichetta sta dentro bottoni e link (miniature,
// card) e il loro nome accessibile non deve diventare un paragrafo; nella vista
// singola la didascalia è già nel figcaption, e letta due volte stanca.
export type TradAi = (chiave: string) => string;

export function etichettaAi(
  ai: FotoAi,
  tr: TradAi,
  mostraOriginale = false,
): { estesa: string; compatta: string; aria: string } {
  if (mostraOriginale) {
    const testo = tr("tag.originale");
    return { estesa: testo, compatta: testo, aria: testo };
  }
  const estesa = ai.trattamento === "tecnico" ? "" : tr(`tag.${ai.trattamento}`);
  // La sigla nuda «AI» si legge per esteso (SPEC §9.3).
  const aria = ai.trattamento === "ai" ? tr("genericAria") : estesa;
  // Sulle miniature basta la sigla «AI» (SPEC §5.1) — ma non sul render di
  // progetto fatto SENZA AI (v1.1): lì «AI» direbbe il falso, e resta la
  // parola intera, «Rendering».
  const compatta = ai.trattamento === "rendering" ? estesa : tr("glyph");
  return { estesa, compatta, aria };
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
