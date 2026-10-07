// Il registro delle case in AFFITTO TURISTICO di FriuliVillas (dal 07/10/2026).
//
// È l'UNICO punto di contatto fra i soggiorni e il resto del sito: la home
// (banda «Soggiorni»), la sitemap, il modulo di preventivo e — dal rifacimento
// di friulivillas.com — la classificazione per aree, che mette queste case in
// MONTAGNA (Carnia). Chi deve sapere «quali case in affitto ci sono» legge qui.
//
// ⛔ Queste case NON sono nel catalogo di vendita del CRM e non vanno
// mescolate con lui: niente codice TSV-PROP, niente `pubblicato_su`, niente
// collegamento al campo `immobile` dei lead. Non le gestiamo noi: le
// presentiamo, gratuitamente, con l'accordo verbale dei proprietari
// (KB: progetti/tophill-cottage/MANDATO.md §1).
//
// ⛔ Nessun nome di proprietario e nessun nome di cartella in questo file né
// nei testi: il registro è pubblico per costruzione (finisce nel browser).
//
// Ogni dato porta la sua fonte nella KB (FONTI.md delle due case): qui si
// scrive solo ciò che lì è verificato.

export type Lingua = "it" | "en" | "de" | "sl";
export type Testo4 = Record<Lingua, string>;

export type Servizio = {
  /** id stabile: è ciò che il modulo manda al server */
  id: string;
  testo: Testo4;
  /** chi lo dichiara (fonte), per il registro interno: non si mostra */
  fonte: string;
};

export type CasaAffitto = {
  slug: "top-hill-cottage" | "chalet-navauce";
  nome: string;
  /** località come la diciamo in pubblico (frazione, comune) */
  localita: { frazione: string; comune: string; provincia: string; regione: string };
  /** coordinate della casa (gradi decimali), per il sole e le distanze */
  coord: { lat: number; lon: number };
  /** quota in metri, se misurata */
  quota: number | null;
  ospitiMax: number | null;
  camere: number | null;
  bagni: number | null;
  /** servizi su richiesta DICHIARATI dalle fonti pubbliche della casa */
  servizi: Servizio[];
  /** il CIN (Codice Identificativo Nazionale), se pubblicato */
  cin: string | null;
  /** la casa gemella da proporre a fine pagina */
  sorella: CasaAffitto["slug"];
};

// Servizi DICHIARATI dalla struttura (descrizione dell'host su Airbnb, sito dei
// proprietari, yesalps, Booking: KB tophill-cottage/FONTI.md §4). Si chiedono
// col preventivo: costi e condizioni li conferma chi gestisce la casa.
const SERVIZI_TOPHILL: Servizio[] = [
  {
    id: "transfer",
    testo: {
      it: "Transfer da e per l'aeroporto, con autista",
      en: "Airport transfer with a driver",
      de: "Flughafentransfer mit Fahrer",
      sl: "Prevoz z letališča in na letališče, z voznikom",
    },
    fonte: "sito proprietari (FAQ) + Booking «navetta a pagamento» + Airbnb concierge",
  },
  {
    id: "spesa",
    testo: {
      it: "La spesa in casa all'arrivo, pane e latte al mattino",
      en: "Groceries in the house on arrival, bread and milk in the morning",
      de: "Einkauf im Haus bei Ankunft, morgens Brot und Milch",
      sl: "Nakup v hiši ob prihodu, zjutraj kruh in mleko",
    },
    fonte: "yesalps «servizio pane e latte» + Booking «consegna spesa a pagamento»",
  },
  {
    id: "chef",
    testo: {
      it: "Cuoco privato e cene in casa",
      en: "Private chef and dinners in the house",
      de: "Privatkoch und Abendessen im Haus",
      sl: "Zasebni kuhar in večerje v hiši",
    },
    fonte: "Airbnb, descrizione concierge",
  },
  {
    id: "guida",
    testo: {
      it: "Escursioni con una guida alpina o naturalistica",
      en: "Hikes with a mountain or nature guide",
      de: "Wanderungen mit Berg- oder Naturführer",
      sl: "Izleti z gorskim ali naravoslovnim vodnikom",
    },
    fonte: "Airbnb concierge (guida alpina) + yesalps (escursioni organizzate da terzi)",
  },
  {
    id: "ebike",
    testo: {
      it: "Giri in e-bike e mountain bike",
      en: "E-bike and mountain-bike tours",
      de: "E-Bike- und Mountainbike-Touren",
      sl: "Izleti z e-kolesom in gorskim kolesom",
    },
    fonte: "Airbnb concierge + yesalps (e-MTB, mountain bike)",
  },
  {
    id: "benessere",
    testo: {
      it: "Massaggi e trattamenti in casa",
      en: "Massages and treatments in the house",
      de: "Massagen und Behandlungen im Haus",
      sl: "Masaže in nege v hiši",
    },
    fonte: "Airbnb concierge",
  },
  {
    id: "trainer",
    testo: {
      it: "Personal trainer, yoga o pilates",
      en: "Personal trainer, yoga or pilates",
      de: "Personal Trainer, Yoga oder Pilates",
      sl: "Osebni trener, joga ali pilates",
    },
    fonte: "Airbnb concierge + Booking (personal trainer) + una recensione",
  },
  {
    id: "occasioni",
    testo: {
      it: "Un'occasione da preparare: anniversario, sorpresa, proposta",
      en: "An occasion to prepare: anniversary, surprise, proposal",
      de: "Einen Anlass vorbereiten: Jahrestag, Überraschung, Antrag",
      sl: "Priprava priložnosti: obletnica, presenečenje, zaroka",
    },
    fonte: "Airbnb concierge (anniversari e proposte di matrimonio)",
  },
  {
    id: "lavanderia",
    testo: {
      it: "Lavanderia e stireria",
      en: "Laundry and ironing",
      de: "Wäsche- und Bügelservice",
      sl: "Pranje in likanje perila",
    },
    fonte: "Booking (a pagamento) + yesalps",
  },
];

// Servizi DICHIARATI dallo chalet (sito dell'azienda agricola, yesalps, Airbnb:
// KB chalet-navauce/FONTI.md §4).
const SERVIZI_NAVAUCE: Servizio[] = [
  {
    id: "jeep",
    testo: {
      it: "La jeep per salire dal paese allo chalet",
      en: "The jeep to drive up from the village to the chalet",
      de: "Den Jeep für die Fahrt vom Dorf zum Chalet",
      sl: "Džip za vožnjo iz vasi do brunarice",
    },
    fonte: "Airbnb + sito + yesalps: comodato gratuito su richiesta, max 10 km al giorno",
  },
  {
    id: "pane",
    testo: {
      it: "Pane e latte al mattino",
      en: "Bread and milk in the morning",
      de: "Morgens Brot und Milch",
      sl: "Zjutraj kruh in mleko",
    },
    fonte: "yesalps «servizio pane e latte»",
  },
  {
    id: "escursione",
    testo: {
      it: "Un'escursione accompagnata su un sentiero provato dagli host",
      en: "A guided hike on a trail the hosts know well",
      de: "Eine begleitete Wanderung auf einem von den Gastgebern erprobten Weg",
      sl: "Voden izlet po poti, ki jo gostitelja dobro poznata",
    },
    fonte: "sito «una ventina di percorsi testati» + yesalps «escursioni guidate organizzate dalla struttura»",
  },
  {
    id: "mtb",
    testo: {
      it: "Giri in mountain bike (organizzati da terzi)",
      en: "Mountain-bike tours (run by third parties)",
      de: "Mountainbike-Touren (von Dritten organisiert)",
      sl: "Izleti z gorskim kolesom (organizirajo tretji)",
    },
    fonte: "yesalps «organizzate da terzi e prenotabili in struttura»",
  },
  {
    id: "fattoria",
    testo: {
      it: "Un momento con le pecore e le capre della fattoria",
      en: "Time with the farm's sheep and goats",
      de: "Zeit mit den Schafen und Ziegen des Hofs",
      sl: "Čas z ovcami in kozami s kmetije",
    },
    fonte: "sito «in nostra presenza» (fattoria didattica)",
  },
  {
    id: "culla",
    testo: {
      it: "Lettino o culla per un bambino",
      en: "A cot for a small child",
      de: "Ein Kinderbett",
      sl: "Otroška posteljica",
    },
    fonte: "sito + Airbnb + yesalps",
  },
];

export const CASE: CasaAffitto[] = [
  {
    slug: "top-hill-cottage",
    nome: "Top Hill Cottage",
    localita: { frazione: "Viaso", comune: "Socchieve", provincia: "UD", regione: "Friuli Venezia Giulia" },
    // Punto VOLUTAMENTE approssimato (fra la media delle posizioni del drone nei
    // 45 scatti EXIF del 02/07/2022 e il punto indicativo di Airbnb, ~100 m):
    // per il sole e per le direzioni basta, e in pagina non si pubblica il civico.
    coord: { lat: 46.4075, lon: 12.8483 },
    // Modello del terreno sul punto della casa (EU-DEM 25 m: 524,7 m; yesalps dice 500).
    quota: 525,
    // 12 per yesalps e Airbnb; Booking ne fa prenotare 10. Oltre i 10 il calendario
    // è «su richiesta» (lib/affitti/disponibilita.ts).
    ospitiMax: 12,
    camere: null, // 5 per yesalps e Booking, 6 per Airbnb: ⚠️ da chiedere, non si scrive
    bagni: null, // 6 o 7: idem
    servizi: SERVIZI_TOPHILL,
    cin: "IT030110C2XOSUL9R6",
    sorella: "chalet-navauce",
  },
  {
    slug: "chalet-navauce",
    nome: "Chalet Navauce",
    // ⚠️ Raveo, NON Viaso (sito dell'azienda, pagina «Ricettività»; CIN sul Comune di Raveo).
    localita: { frazione: "Raveo", comune: "Raveo", provincia: "UD", regione: "Friuli Venezia Giulia" },
    // Punto di yesalps (JSON-LD), coerente con Google (95 m) e Booking (122 m).
    coord: { lat: 46.4332, lon: 12.8651 },
    // yesalps dice 760 m, i modelli del terreno 593-630 m: ⚠️ da verificare, non si scrive.
    quota: null,
    // 2 al piano terra + 3 al primo piano (Airbnb); 6 «con il letto aggiuntivo» per yesalps.
    ospitiMax: 5,
    camere: null,
    bagni: 2,
    servizi: SERVIZI_NAVAUCE,
    cin: "IT030089B5QOUHWO3Q",
    sorella: "top-hill-cottage",
  },
];

export type SlugCasa = CasaAffitto["slug"];

export function casaDa(slug: string): CasaAffitto | undefined {
  return CASE.find((c) => c.slug === slug);
}
