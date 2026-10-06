// La sezione «SloveniaVillas» della home (2026-10-06, il giorno in cui
// sloveniavillas.com è andato online). Pattern `*Strings.ts` come
// components/media/sfondoVideoStrings.ts: un Record a quattro lingue, così la
// versione slovena può avere due stringhe in più (i proprietari della costa e
// del Carso) senza chiavi asimmetriche in messages/*.json, che check-messages
// rifiuterebbe; e il typecheck obbliga il ramo sloveno.
//
// Regole di verità (brief del 06/10): oggi in Slovenia NON mediamo, l'attività
// parte nel corso del 2027 — la sezione lo dice. Tempi di guida: OSRM da
// Piazza Unità senza traffico, misurati il 05/10/2026 (gli stessi del sito).
// Sloveno col «vikanje»; nessuna promessa di assistenza in sloveno.

type Lang = "it" | "en" | "de" | "sl";
const asLang = (locale: string): Lang =>
  locale === "en" || locale === "de" || locale === "sl" ? locale : "it";

export type SloveniaVillasStrings = {
  eyebrow: string;
  title: string;
  lead: string;
  /** Solo in sloveno: il messaggio ai proprietari della costa e del Carso. */
  owners?: { text: string; cta: string; href: string };
  from: string;
  times: ReadonlyArray<{ to: string; min: number }>;
  timeNote: string;
  limit: string;
  cta: string;
  href: string;
};

const STRINGS: Record<Lang, SloveniaVillasStrings> = {
  it: {
    eyebrow: "Dello stesso gruppo · SloveniaVillas",
    title: "Oltre il confine: la costa slovena e il Carso.",
    lead: "SloveniaVillas è l'atlante della costa slovena e del Carso, misurato da Trieste: undici luoghi in quattro mondi, guide per chi compra e per chi vende, sette strumenti costruiti sui dati pubblici sloveni.",
    from: "In auto da Piazza Unità, Trieste",
    times: [{ to: "a Sežana", min: 18 }, { to: "a Koper", min: 27 }, { to: "a Piran", min: 45 }],
    timeNote: "Tempi senza traffico (OSRM, ottobre 2026).",
    limit: "Oggi in Slovenia non facciamo intermediazione: l'attività parte nel corso del 2027.",
    cta: "Apri SloveniaVillas",
    href: "https://sloveniavillas.com/it",
  },
  en: {
    eyebrow: "Same group · SloveniaVillas",
    title: "Across the border: the Slovenian coast and the Karst.",
    lead: "SloveniaVillas is an atlas of the Slovenian coast and the Karst, measured from Trieste: eleven places in four worlds, guides for buyers and for owners, seven tools built on Slovenia's public data.",
    from: "Driving from Piazza Unità, Trieste",
    times: [{ to: "to Sežana", min: 18 }, { to: "to Koper", min: 27 }, { to: "to Piran", min: 45 }],
    timeNote: "Times without traffic (OSRM, October 2026).",
    limit: "We do not act as agents in Slovenia today: that starts during 2027.",
    cta: "Open SloveniaVillas",
    href: "https://sloveniavillas.com/",
  },
  de: {
    eyebrow: "Aus derselben Gruppe · SloveniaVillas",
    title: "Jenseits der Grenze: die slowenische Küste und der Karst.",
    lead: "SloveniaVillas ist ein Atlas der slowenischen Küste und des Karsts, von Triest aus vermessen: elf Orte in vier Welten, Ratgeber für Käufer und Eigentümer, sieben Werkzeuge auf Grundlage öffentlicher slowenischer Daten.",
    from: "Mit dem Auto von der Piazza Unità in Triest",
    times: [{ to: "nach Sežana", min: 18 }, { to: "nach Koper", min: 27 }, { to: "nach Piran", min: 45 }],
    timeNote: "Fahrzeiten ohne Verkehr (OSRM, Oktober 2026).",
    limit: "In Slowenien sind wir heute nicht als Makler tätig: Das beginnt im Laufe des Jahres 2027.",
    cta: "SloveniaVillas öffnen",
    href: "https://sloveniavillas.com/de",
  },
  sl: {
    eyebrow: "Iz iste skupine · SloveniaVillas",
    title: "Onkraj meje: slovenska obala in Kras.",
    lead: "SloveniaVillas je atlas slovenske obale in Krasa, izmerjen iz Trsta: enajst krajev v štirih svetovih, vodniki za kupce in za lastnike ter sedem orodij, zgrajenih na javnih slovenskih podatkih.",
    owners: {
      text: "Kupci, ki iščejo dom v Trstu, predvsem avstrijski in nemški, gledajo tudi čez mejo. SloveniaVillas jim predstavlja obalo in Kras. Če imate hišo na obali ali na Krasu, si oglejte stran za lastnike.",
      cta: "Za lastnike",
      href: "https://sloveniavillas.com/sl/za-lastnike",
    },
    from: "Z avtom od Trga Unità v Trstu",
    times: [{ to: "do Sežane", min: 18 }, { to: "do Kopra", min: 27 }, { to: "do Pirana", min: 45 }],
    timeNote: "Čas vožnje brez prometa (OSRM, oktober 2026).",
    limit: "V Sloveniji danes ne opravljamo posredovanja; dejavnost bomo začeli v letu 2027.",
    cta: "Odprite SloveniaVillas",
    href: "https://sloveniavillas.com/sl",
  },
};

export function sloveniaVillasStrings(locale: string): SloveniaVillasStrings {
  return STRINGS[asLang(locale)];
}
