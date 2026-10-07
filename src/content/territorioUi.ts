// I testi del rifacimento (07/10/2026): home, catalogo per area, carta, ponte.
// Quattro lingue per costruzione: il tipo obbliga ogni voce in IT/EN/DE/SL.
// Nessun numero scritto a mano: conteggi e minuti entrano dalle funzioni
// (src/lib/territorio.ts), qui ci sono solo le frasi che li portano.
import type { Lingua } from "@/lib/aree";

type T = Record<Lingua, string>;

export const UI = {
  heroEyebrow: {
    it: "FriuliVillas · Friuli Venezia Giulia",
    en: "FriuliVillas · Friuli Venezia Giulia",
    de: "FriuliVillas · Friaul-Julisch Venetien",
    sl: "FriuliVillas · Furlanija - Julijska krajina",
  },
  heroTitolo: {
    it: "Dalla laguna alle Alpi, quattro paesaggi su una carta.",
    en: "From the lagoon to the Alps: four landscapes on one map.",
    // dal dato: da München la mediana verso i comuni di montagna è 4 h 38, verso la costa 5 h 13 (OSRM, 07/10/2026)
    de: "Von München aus sind die Berge näher als das Meer.",
    sl: "Od lagune do Alp: štiri pokrajine na enem zemljevidu.",
  },
  heroSotto: {
    it: "La regione divisa come la dividono l'ISTAT e il Piano paesaggistico regionale: costa e laguna, colline e pianura, montagna, Trieste e il Carso. Ogni casa sta nella sua area e nel suo comune, e ogni area ha la sua pagina.",
    en: "The region divided the way Italy's statistics office (ISTAT) and the regional landscape plan divide it: coast and lagoon, hills and plain, mountains, Trieste and the Karst. Each home sits in its own area and municipality, and every area has its own page.",
    de: "Die Region so eingeteilt, wie es das italienische Statistikamt ISTAT und der regionale Landschaftsplan tun: Küste und Lagune, Hügelland und Ebene, Bergland, Triest und der Karst. Jedes Haus liegt in seinem Gebiet und seiner Gemeinde – und jedes Gebiet hat eine eigene Seite.",
    sl: "Dežela, razdeljena tako, kot jo delita italijanski statistični urad ISTAT in deželni krajinski načrt: obala in laguna, gričevje in nižina, gore, Trst in Kras. Vsaka hiša je na svojem območju in v svoji občini, vsako območje pa ima svojo stran.",
  },
  ctaCase: { it: "Vedi le case", en: "See the homes", de: "Häuser ansehen", sl: "Oglejte si hiše" },
  ctaVendi: { it: "Valuta la tua casa", en: "Value your home", de: "Ihr Haus bewerten lassen", sl: "Ocenite svojo hišo" },
  cartaTitolo: {
    it: "Carta del Friuli Venezia Giulia con le quattro aree, le nostre case e i siti del gruppo",
    en: "Map of Friuli Venezia Giulia with the four areas, our homes and the group's sites",
    de: "Karte von Friaul-Julisch Venetien mit den vier Gebieten, unseren Häusern und den Websites der Gruppe",
    sl: "Zemljevid Furlanije - Julijske krajine s štirimi območji, našimi hišami in spletnimi stranmi skupine",
  },
  legendaCasa: { it: "casa in vendita", en: "home for sale", de: "Haus zum Verkauf", sl: "hiša naprodaj" },
  posizioneIndicativa: {
    it: "posizione indicativa: sede del comune",
    en: "approximate: town hall of the municipality",
    de: "ungefähre Lage: Rathaus der Gemeinde",
    sl: "približna lega: sedež občine",
  },
  legendaGruppo: { it: "sito del gruppo", en: "group site", de: "Website der Gruppe", sl: "spletna stran skupine" },
  legendaCitta: { it: "città di riferimento", en: "reference town", de: "Bezugsort", sl: "referenčni kraj" },
  fontiCarta: {
    it: "Rilievo: Copernicus DEM GLO-90 (© DLR e.V. 2010-2014, © Airbus Defence and Space GmbH 2014-2018, Copernicus/UE-ESA). Confini e costa: ISTAT, CC BY 4.0. Aree: zona altimetrica ISTAT e ambiti del Piano paesaggistico regionale FVG (2018).",
    en: "Relief: Copernicus DEM GLO-90 (© DLR e.V. 2010-2014, © Airbus Defence and Space GmbH 2014-2018, Copernicus/EU-ESA). Boundaries and coastline: ISTAT, CC BY 4.0. Areas: ISTAT altitude zones and the FVG regional landscape plan (2018).",
    de: "Relief: Copernicus DEM GLO-90 (© DLR e.V. 2010-2014, © Airbus Defence and Space GmbH 2014-2018, Copernicus/EU-ESA). Grenzen und Küste: ISTAT, CC BY 4.0. Gebiete: ISTAT-Höhenzonen und regionaler Landschaftsplan FVG (2018).",
    sl: "Relief: Copernicus DEM GLO-90 (© DLR e.V. 2010-2014, © Airbus Defence and Space GmbH 2014-2018, Copernicus/EU-ESA). Meje in obala: ISTAT, CC BY 4.0. Območja: višinski pasovi ISTAT in deželni krajinski načrt FJK (2018).",
  },

  areeEyebrow: { it: "Quattro aree", en: "Four areas", de: "Vier Gebiete", sl: "Štiri območja" },
  areeTitolo: {
    it: "Una regione piccola, quattro modi di abitarla.",
    en: "A small region, four ways of living in it.",
    de: "Eine kleine Region, vier Arten, hier zu leben.",
    sl: "Majhna dežela, štirje načini bivanja.",
  },
  comuni: { it: "comuni", en: "municipalities", de: "Gemeinden", sl: "občin" },
  inVendita: { it: "in vendita", en: "for sale", de: "zum Verkauf", sl: "naprodaj" },
  nessunaInVendita: { it: "oggi nessuna in vendita", en: "none for sale today", de: "derzeit keines zum Verkauf", sl: "trenutno nobena naprodaj" },
  daOrigine: { it: "da", en: "from", de: "ab", sl: "iz" },
  mediana: { it: "mediana", en: "median", de: "Median", sl: "mediana" },
  scopriArea: { it: "Scopri l'area", en: "Explore the area", de: "Gebiet entdecken", sl: "Odkrijte območje" },

  daDoveEyebrow: { it: "Quanto dista", en: "How far", de: "Wie weit", sl: "Kako daleč" },
  daDoveTitolo: { it: "Da dove partite?", en: "Where are you coming from?", de: "Woher kommen Sie?", sl: "Od kod prihajate?" },
  daDoveNota: {
    it: "Minuti in auto, senza traffico né attese al confine, verso la sede municipale di ogni comune (per le nostre case, la frazione dove stanno, quando è misurata a parte): per un'area è la mediana dei suoi comuni, escluso quello di partenza. Misurati con OSRM il {data}.",
    en: "Driving minutes, without traffic or border waits, to each municipality's town hall (for our homes, their own village when it was measured separately); for an area it is the median of its municipalities, excluding the one you start from. Measured with OSRM on {data}.",
    de: "Fahrzeit in Minuten, ohne Verkehr und ohne Wartezeit an der Grenze, bis zum Rathaus jeder Gemeinde (bei unseren Häusern bis zum Ortsteil, wenn er eigens gemessen wurde); für ein Gebiet ist es der Median seiner Gemeinden ohne die Ausgangsgemeinde. Gemessen mit OSRM am {data}.",
    sl: "Minute vožnje z avtom, brez prometa in čakanja na meji, do sedeža vsake občine (za naše hiše do zaselka, kadar je bil izmerjen posebej); za območje je to mediana njegovih občin brez izhodiščne. Izmerjeno z OSRM dne {data}.",
  },
  verso: { it: "verso", en: "to", de: "nach", sl: "do" },
  leNostreCase: { it: "Le nostre case", en: "Our homes", de: "Unsere Häuser", sl: "Naše hiše" },

  venditaEyebrow: { it: "In vendita ora", en: "For sale now", de: "Jetzt zum Verkauf", sl: "Zdaj naprodaj" },
  venditaTitolo: {
    it: "Le case, area per area.",
    en: "The homes, area by area.",
    de: "Die Häuser, Gebiet für Gebiet.",
    sl: "Hiše, območje za območjem.",
  },
  tuttiGliImmobili: { it: "Tutti gli immobili", en: "All properties", de: "Alle Immobilien", sl: "Vse nepremičnine" },

  ponteEyebrow: { it: "La città accanto", en: "The city next door", de: "Die Stadt nebenan", sl: "Mesto v bližini" },
  ponteTitolo: {
    it: "Trieste è sul sito di casa sua.",
    en: "Trieste has its own site.",
    de: "Triest hat seine eigene Seite.",
    sl: "Trst ima svojo stran.",
  },
  ponteTesto: {
    it: "Le case di Trieste non le copiamo qui: stanno su triestevillas.com, lo stesso gruppo. Eccone alcune, scelte una per quartiere fra le {n} che oggi sono in vendita con le foto complete.",
    en: "We don't copy Trieste's homes here: they live on triestevillas.com, part of the same group. Here are a few, one per neighbourhood, from the {n} currently for sale with a full set of photos.",
    de: "Die Häuser in Triest übernehmen wir nicht hierher: Sie stehen auf triestevillas.com, einer Website derselben Gruppe. Hier einige davon, je eines pro Stadtviertel, aus den {n}, die derzeit mit vollständigen Fotos zum Verkauf stehen.",
    sl: "Hiš v Trstu tu ne podvajamo: objavljene so na triestevillas.com, strani iste skupine. Tu je nekaj od njih, po ena iz vsake mestne četrti, izmed {n}, ki so trenutno naprodaj s celotnim naborom fotografij.",
  },
  ponteTutte: {
    it: "Tutte le case su triestevillas.com",
    en: "All homes on triestevillas.com",
    de: "Alle Häuser auf triestevillas.com",
    sl: "Vse hiše na triestevillas.com",
  },
  ponteSuTsv: { it: "su triestevillas.com", en: "on triestevillas.com", de: "auf triestevillas.com", sl: "na triestevillas.com" },
  ponteGuasto: {
    it: "Le case di Trieste sono su triestevillas.com.",
    en: "Trieste's homes are on triestevillas.com.",
    de: "Die Häuser in Triest finden Sie auf triestevillas.com.",
    sl: "Hiše v Trstu so na triestevillas.com.",
  },
  trattativaRiservata: { it: "Trattativa riservata", en: "Price on request", de: "Preis auf Anfrage", sl: "Cena na zahtevo" },
  simulazione: { it: "simulazione", en: "simulation", de: "Simulation", sl: "simulacija" },
  rendering: { it: "rendering", en: "rendering", de: "Rendering", sl: "vizualizacija" },

  catalogoTitolo: { it: "Immobili in Friuli Venezia Giulia", en: "Properties in Friuli Venezia Giulia", de: "Immobilien in Friaul-Julisch Venetien", sl: "Nepremičnine v Furlaniji - Julijski krajini" },
  catalogoIntro: {
    it: "Divisi per area, come sulla carta. Le vendite e gli affitti stanno in elenchi separati.",
    en: "Grouped by area, as on the map. Sales and rentals are listed separately.",
    de: "Nach Gebieten geordnet, wie auf der Karte. Verkauf und Vermietung stehen in getrennten Listen.",
    sl: "Razvrščene po območjih, kot na zemljevidu. Prodaja in najem sta v ločenih seznamih.",
  },
  tutte: { it: "Tutte", en: "All", de: "Alle", sl: "Vse" },
  venduti: { it: "Venduti", en: "Sold", de: "Verkauft", sl: "Prodano" },
  altreZone: { it: "Altre zone", en: "Other areas", de: "Weitere Gebiete", sl: "Druga območja" },
  areaLabel: { it: "Area", en: "Area", de: "Gebiet", sl: "Območje" },
  tempiFinoA: {
    it: "In auto, fino a {luogo}",
    en: "By car, to {luogo}",
    de: "Mit dem Auto bis {luogo}",
    sl: "Z avtom do kraja {luogo}",
  },
  tempiDaQui: { it: "Da qui, in auto", en: "From here, by car", de: "Von hier, mit dem Auto", sl: "Od tod z avtom" },
} satisfies Record<string, T>;

export function ui(k: keyof typeof UI, l: Lingua, vars: Record<string, string | number> = {}): string {
  return UI[k][l].replace(/\{(\w+)\}/g, (_, n) => String(vars[n] ?? `{${n}}`));
}

/** «7 ottobre 2026» nella lingua del lettore. */
export function dataLunga(iso: string, l: Lingua): string {
  if (l === "sl") {
    // In sloveno il mese della data va al genitivo («7. oktobra 2026»), che Intl non dà.
    const MESI = ["januarja", "februarja", "marca", "aprila", "maja", "junija", "julija", "avgusta", "septembra", "oktobra", "novembra", "decembra"];
    const [a, m, g] = iso.split("-").map(Number);
    return `${g}. ${MESI[m - 1]} ${a}`;
  }
  const loc = { it: "it-IT", en: "en-GB", de: "de-DE", sl: "sl-SI" }[l];
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });
}
