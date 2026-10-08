// La voce di menu dei soggiorni, nelle quattro lingue. Sta qui e non in
// messages/*.json per non toccare i dizionari condivisi (il rifacimento del
// sito li riscrive): Header la legge con la lingua della pagina.
import type { Lingua } from "./case";

export const NAV_SOGGIORNI: Record<Lingua, string> = {
  it: "Soggiorni",
  en: "Stays",
  de: "Ferienhäuser",
  sl: "Počitnice",
};

export const BANDA_SOGGIORNI: Record<
  Lingua,
  { eyebrow: string; titolo: string; testo: string; vai: string; tutte: string; righe: Record<"top-hill-cottage" | "chalet-navauce", string> }
> = {
  it: {
    eyebrow: "Novità · soggiorni in Carnia",
    titolo: "Due case in montagna, da abitare per qualche giorno.",
    testo:
      "Da oggi FriuliVillas presenta anche case dove soggiornare: in Carnia, tra il Tagliamento e le Dolomiti Friulane. Date libere e preventivo, direttamente da qui.",
    vai: "Scopri",
    tutte: "Tutti i soggiorni",
    righe: {
      "top-hill-cottage": "Viaso · villa in pietra e vetro sul poggio · fino a 12 ospiti",
      "chalet-navauce": "Raveo · chalet in un prato tra i boschi · per pochi",
    },
  },
  en: {
    eyebrow: "New · stays in Carnia",
    titolo: "Two houses in the mountains, to live in for a few days.",
    testo:
      "From today FriuliVillas also presents houses to stay in: in Carnia, between the Tagliamento and the Friulian Dolomites. Free dates and a quote, right here.",
    vai: "Discover",
    tutte: "All stays",
    righe: {
      "top-hill-cottage": "Viaso · stone-and-glass villa on a knoll · up to 12 guests",
      "chalet-navauce": "Raveo · chalet in a meadow among the woods · for a few",
    },
  },
  de: {
    eyebrow: "Neu · Aufenthalte in Karnien",
    titolo: "Zwei Häuser in den Bergen, für ein paar Tage.",
    testo:
      "Ab heute stellt FriuliVillas auch Häuser für einen Aufenthalt vor: in Karnien, zwischen dem Tagliamento und den Friauler Dolomiten. Freie Termine und Angebot, direkt hier.",
    vai: "Entdecken",
    tutte: "Alle Ferienhäuser",
    righe: {
      "top-hill-cottage": "Viaso · Villa aus Stein und Glas auf der Anhöhe · bis zu 12 Gäste",
      "chalet-navauce": "Raveo · Chalet auf einer Wiese zwischen Wäldern · für wenige",
    },
  },
  sl: {
    eyebrow: "Novost · bivanje v Karniji",
    titolo: "Dve hiši v gorah, za nekaj dni.",
    testo:
      "Od danes FriuliVillas predstavlja tudi hiše za bivanje: v Karniji, med Tilmentom in Furlanskimi Dolomiti. Prosti termini in ponudba, kar tukaj.",
    vai: "Odkrijte",
    tutte: "Vse počitniške hiše",
    righe: {
      "top-hill-cottage": "Viaso · vila iz kamna in stekla na griču · do 12 gostov",
      "chalet-navauce": "Raveo · brunarica na travniku med gozdovi · za manjše skupine",
    },
  },
};

// Il rimando dalla pagina d'area «Montagna» (/area/montagna e le sue lingue):
// le due case cadono lì, ma non sono schede del catalogo del CRM, quindi la
// fila «In affitto» della pagina non le vede. Nomi dei paesi fra parentesi per
// non declinarli in sloveno a orecchio.
export const AREA_SOGGIORNI: Record<Lingua, { titolo: string; testo: string }> = {
  it: {
    titolo: "Soggiorni in Carnia",
    testo: "Due case dove passare qualche giorno: Top Hill Cottage (Viaso) e Chalet Navauce (Raveo). Date libere e preventivo.",
  },
  en: {
    titolo: "Stays in Carnia",
    testo: "Two houses for a few days away: Top Hill Cottage (Viaso) and Chalet Navauce (Raveo). Free dates and a quote.",
  },
  de: {
    titolo: "Ferienhäuser in Karnien",
    testo: "Zwei Häuser für ein paar Tage: Top Hill Cottage (Viaso) und Chalet Navauce (Raveo). Freie Termine und Angebot.",
  },
  sl: {
    titolo: "Počitnice v Karniji",
    testo: "Dve hiši za nekaj dni: Top Hill Cottage (Viaso) in Chalet Navauce (Raveo). Prosti termini in ponudba.",
  },
};
