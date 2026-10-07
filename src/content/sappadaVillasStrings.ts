// La sezione «In montagna: Sappada» della home (2026-10-07, il giorno in cui
// sappadavillas.com è andato online). Stesso pattern di
// sloveniaVillasStrings.ts: un Record a quattro lingue col suo indirizzo per
// lingua, così testo e link stanno insieme e il typecheck obbliga ogni ramo.
//
// Regole di verità (brief del 07/10): si dice solo ciò che sul sito c'è —
// le quindici borgate con ore di sole e giro d'orizzonte calcolati sul modello
// del terreno, il rilievo 3D della conca, il mercato coi numeri dell'Agenzia
// delle Entrate, il confronto fra le località di montagna, gli strumenti, le
// prime case e un progetto in anteprima. NON si dice: che abbiamo una sede a
// Sappada (non l'abbiamo), quante case, superlativi, rendimenti, nomi di
// proprietari o costruttori; e non si promette assistenza in tedesco o in
// sloveno. Il confronto mette accanto anche località fuori regione: per questo
// «le altre località di montagna» e non «del Friuli Venezia Giulia».
// Le etichette dei due bottoni sono corte apposta: a 1440 px stanno su una
// riga nella colonna di sinistra, in tutte e quattro le lingue.
// Vocabolario preso dal sito stesso (borgata = hamlet / Weiler / zaselek).
// Sloveno col «vikanje». Ogni URL verificato 200 il 07/10/2026: l'italiano è
// sulla radice, e i percorsi sono tradotti lingua per lingua.

type Lang = "it" | "en" | "de" | "sl";
const asLang = (locale: string): Lang =>
  locale === "en" || locale === "de" || locale === "sl" ? locale : "it";

export type SappadaVillasStrings = {
  eyebrow: string;
  title: string;
  lead: string;
  /** L'intestazione del riquadro: porta alla radice del sito, nella lingua. */
  site: { label: string; href: string };
  /** Le tre righe: che cosa c'è su sappadavillas.com. */
  rows: ReadonlyArray<{ name: string; text: string }>;
  hamlets: { cta: string; href: string };
  compare: { cta: string; href: string };
};

const STRINGS: Record<Lang, SappadaVillasStrings> = {
  it: {
    eyebrow: "Dello stesso gruppo · SappadaVillas",
    title: "In montagna: Sappada, borgata per borgata.",
    lead: "Per Sappada/Plodn il gruppo ha un sito dedicato. SappadaVillas descrive la valle prima delle case, a partire da un rilievo 3D della conca su cui si sposta il sole.",
    site: { label: "Su sappadavillas.com", href: "https://sappadavillas.com/" },
    rows: [
      {
        name: "Le quindici borgate",
        text: "Una per una, con le ore di sole e il giro d'orizzonte calcolati sul modello del terreno.",
      },
      {
        name: "Il mercato e il confronto",
        text: "I numeri dell'Agenzia delle Entrate, e Sappada messa accanto alle altre località di montagna.",
      },
      {
        name: "Strumenti e immobili",
        text: "Costi d'acquisto, quanto spazio si compra, «trova la tua borgata»; le prime case e un progetto in anteprima.",
      },
    ],
    hamlets: { cta: "Le borgate di Sappada", href: "https://sappadavillas.com/borgate" },
    compare: { cta: "Confronta le località", href: "https://sappadavillas.com/confronto" },
  },
  en: {
    eyebrow: "Same group · SappadaVillas",
    title: "In the mountains: Sappada, hamlet by hamlet.",
    lead: "For Sappada/Plodn the group has a dedicated site. SappadaVillas describes the valley before the homes, starting from a 3D relief of the basin on which you move the sun.",
    site: { label: "On sappadavillas.com", href: "https://sappadavillas.com/en" },
    rows: [
      {
        name: "The fifteen hamlets",
        text: "One by one, with hours of sunlight and the full horizon worked out on the terrain model.",
      },
      {
        name: "The market and the comparison",
        text: "The Italian Revenue Agency's figures, and Sappada set beside the other mountain resorts.",
      },
      {
        name: "Tools and properties",
        text: "Purchase costs, how much space you buy, “find your hamlet”; the first homes and a project in preview.",
      },
    ],
    hamlets: { cta: "The hamlets of Sappada", href: "https://sappadavillas.com/en/hamlets" },
    compare: { cta: "Compare the resorts", href: "https://sappadavillas.com/en/compare" },
  },
  de: {
    eyebrow: "Aus derselben Gruppe · SappadaVillas",
    title: "In den Bergen: Sappada, Weiler für Weiler.",
    lead: "Für Sappada/Plodn hat die Gruppe eine eigene Website. SappadaVillas beschreibt zuerst das Tal und dann die Häuser, ausgehend von einem 3D-Relief des Talkessels, auf dem sich die Sonne verschieben lässt.",
    site: { label: "Auf sappadavillas.com", href: "https://sappadavillas.com/de" },
    rows: [
      {
        name: "Die fünfzehn Weiler",
        text: "Jeder für sich, mit Sonnenstunden und Rundblick, am Geländemodell berechnet.",
      },
      {
        name: "Markt und Vergleich",
        text: "Die Zahlen der italienischen Finanzverwaltung, und Sappada neben den anderen Bergorten.",
      },
      {
        name: "Werkzeuge und Immobilien",
        text: "Kaufkosten, wie viel Fläche man bekommt, „Finden Sie Ihren Weiler“; die ersten Immobilien und ein Projekt in der Vorschau.",
      },
    ],
    hamlets: { cta: "Die Weiler von Sappada", href: "https://sappadavillas.com/de/weiler" },
    compare: { cta: "Bergorte vergleichen", href: "https://sappadavillas.com/de/vergleich" },
  },
  sl: {
    eyebrow: "Iz iste skupine · SappadaVillas",
    title: "V gorah: Sappada, zaselek za zaselkom.",
    lead: "Za Sappado/Plodn ima skupina posebno spletno stran. SappadaVillas najprej opiše dolino in šele nato hiše, začne pa s 3D-reliefom kotline, na katerem premikate sonce.",
    site: { label: "Na sappadavillas.com", href: "https://sappadavillas.com/sl" },
    rows: [
      {
        name: "Petnajst zaselkov",
        text: "Vsak posebej, z urami sonca in celotnim obzorjem, izračunanimi na modelu terena.",
      },
      {
        name: "Trg in primerjava",
        text: "Številke italijanske davčne uprave in Sappada ob drugih gorskih krajih.",
      },
      {
        name: "Orodja in nepremičnine",
        text: "Stroški nakupa, koliko prostora kupite, »Najdite svoj zaselek«; prve nepremičnine in predogled projekta.",
      },
    ],
    hamlets: { cta: "Zaselki Sappade", href: "https://sappadavillas.com/sl/zaselki" },
    compare: { cta: "Primerjajte gorske kraje", href: "https://sappadavillas.com/sl/primerjava" },
  },
};

export function sappadaVillasStrings(locale: string): SappadaVillasStrings {
  return STRINGS[asLang(locale)];
}
