// Le esperienze del territorio che il visitatore può mettere nel suo programma
// («Componi il soggiorno»). Ogni voce viene dal dossier verificato della KB
// (progetti/tophill-cottage/territorio/cosa-fare.md, fonti lette il 07/10/2026)
// e i minuti d'auto sono MISURATI con OSRM, senza traffico, da ciascuna casa
// (~/.tsv-work/FV-AFFITTI/territorio/osrm-case.json). Il server accetta solo questi id.
//
// Da NON scrivere (dossier, «Per il sito»): fare il bagno nei laghi, rafting, «nel cuore
// delle Dolomiti UNESCO», la ferrata Farina del Diavolo (chiusa dalla frana del 2025),
// date di eventi non lette.
import type { SlugCasa, Testo4 } from "./case";

export type Stagione = "primavera" | "estate" | "autunno" | "inverno";

export type Esperienza = {
  id: string;
  titolo: Testo4;
  testo: Testo4;
  stagioni: Stagione[];
  /** per quali case la proponiamo */
  case: SlugCasa[];
  /** minuti in auto da ciascuna casa (OSRM, senza traffico) */
  minuti: Partial<Record<SlugCasa, number>>;
  /** voce del dossier (cosa-fare.md): non si mostra */
  fonte: string;
};

const ENTRAMBE: SlugCasa[] = ["top-hill-cottage", "chalet-navauce"];
const TUTTO_L_ANNO: Stagione[] = ["primavera", "estate", "autunno", "inverno"];

export const ESPERIENZE: Esperienza[] = [
  {
    id: "pievi",
    titolo: { it: "Le pievi della valle", en: "The valley's old churches", de: "Die alten Pfarrkirchen des Tals", sl: "Stare župnijske cerkve v dolini" },
    testo: {
      it: "San Martino di Socchieve, monumento nazionale, con gli affreschi di Gianfrancesco da Tolmezzo datati 1493; la Pieve di Castoia sul colle; San Biagio a Mediis.",
      en: "San Martino in Socchieve, a national monument, with Gianfrancesco da Tolmezzo's frescoes dated 1493; the Pieve di Castoia on its hill; San Biagio in Mediis.",
      de: "San Martino in Socchieve, ein Nationaldenkmal, mit den Fresken von Gianfrancesco da Tolmezzo aus dem Jahr 1493; die Pieve di Castoia auf ihrem Hügel; San Biagio in Mediis.",
      sl: "San Martino v Socchieveju, narodni spomenik, s freskami Gianfrancesca da Tolmezzo iz leta 1493; cerkev Pieve di Castoia na griču; San Biagio v Mediisu.",
    },
    stagioni: ["primavera", "estate", "autunno"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 5, "chalet-navauce": 12 },
    fonte: "P11, P16 + distanze mediis-san-biagio",
  },
  {
    id: "cascate",
    titolo: { it: "Le cascate in piena", en: "Waterfalls in full flow", de: "Wasserfälle mit voller Kraft", sl: "Slapovi v polnem toku" },
    testo: {
      it: "La Plera e la Radime, la «farine dal diàul», si vedono davvero dopo la pioggia e col disgelo, alle spalle di Villa Santina.",
      en: "The Plera and the Radime, the «devil's flour», are at their best after rain and during the thaw, just behind Villa Santina.",
      de: "Die Plera und die Radime, das «Mehl des Teufels», zeigen sich nach Regen und zur Schneeschmelze von ihrer besten Seite, gleich hinter Villa Santina.",
      sl: "Slapova Plera in Radime, »hudičeva moka«, sta najlepša po dežju in ob taljenju snega, tik za Villo Santino.",
    },
    stagioni: ["primavera"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 14, "chalet-navauce": 14 },
    fonte: "P2 + distanze cascata-plera",
  },
  {
    id: "preone",
    titolo: { it: "Preone, 200 milioni di anni", en: "Preone, 200 million years", de: "Preone, 200 Millionen Jahre", sl: "Preone, 200 milijonov let" },
    testo: {
      it: "Tra i fossili del Triassico trovati qui c'è uno dei più antichi rettili volanti conosciuti. L'esposizione è gratuita, e il sentiero degli Stavoli Lunas fa un anello di 4 km.",
      en: "Among the Triassic fossils found here is one of the oldest known flying reptiles. The exhibition is free, and the Stavoli Lunas trail makes a 4 km loop.",
      de: "Unter den hier gefundenen Fossilien aus der Trias ist eines der ältesten bekannten Flugreptilien. Die Ausstellung ist kostenlos, der Weg der Stavoli Lunas ist ein Rundweg von 4 km.",
      sl: "Med triasnimi fosili, najdenimi tukaj, je eden najstarejših znanih letečih plazilcev. Razstava je brezplačna, pot Stavoli Lunas pa je 4 km dolg krog.",
    },
    stagioni: ["primavera", "estate", "autunno"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 7, "chalet-navauce": 12 },
    fonte: "P15, P5 + distanze preone-lupieri",
  },
  {
    id: "dolomiti",
    titolo: { it: "Le Dolomiti Friulane", en: "The Friulian Dolomites", de: "Die Friauler Dolomiten", sl: "Furlanski Dolomiti" },
    testo: {
      it: "Il Parco naturale delle Dolomiti Friulane si attraversa solo a piedi. Da Forni di Sopra il centro visite e, d'estate, le seggiovie del Varmost verso le malghe.",
      en: "The Friulian Dolomites nature park can only be crossed on foot. From Forni di Sopra, the visitor centre and, in summer, the Varmost chairlifts up to the mountain pastures.",
      de: "Den Naturpark der Friauler Dolomiten durchquert man nur zu Fuß. In Forni di Sopra das Besucherzentrum und im Sommer die Sessellifte des Varmost hinauf zu den Almen.",
      sl: "Naravni park Furlanskih Dolomitov se prečka samo peš. V Forni di Sopra center za obiskovalce in poleti sedežnici na Varmost proti planinam.",
    },
    stagioni: ["estate", "autunno"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 31, "chalet-navauce": 38 },
    fonte: "E1, E4 + distanze forni-centro-visite",
  },
  {
    id: "stambecchi",
    titolo: { it: "La Val di Suola e gli stambecchi", en: "Val di Suola and its ibexes", de: "Das Val di Suola und die Steinböcke", sl: "Dolina Suola in kozorogi" },
    testo: {
      it: "Dal sentiero CAI 362 si sale al rifugio Flaiban-Pacherini in un'ora e mezza; più su, al Passo di Suola, vedere gli stambecchi è normale.",
      en: "Trail CAI 362 climbs to the Flaiban-Pacherini hut in an hour and a half; higher up, at the Suola pass, seeing ibexes is normal.",
      de: "Über den Weg CAI 362 erreicht man die Hütte Flaiban-Pacherini in anderthalb Stunden; weiter oben, am Passo di Suola, sind Steinböcke ein gewohnter Anblick.",
      sl: "Po poti CAI 362 se v uri in pol povzpnete do koče Flaiban-Pacherini; višje, na prelazu Suola, so kozorogi običajen prizor.",
    },
    stagioni: ["estate"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 29, "chalet-navauce": 36 },
    fonte: "E3 + distanze forni-di-sopra (la partenza è a Davost, pochi minuti oltre)",
  },
  {
    id: "sauris",
    titolo: { it: "Sauris e il suo lago", en: "Sauris and its lake", de: "Sauris und sein See", sl: "Sauris in njegovo jezero" },
    testo: {
      it: "Un lago a 977 metri con il SUP, la canoa e il giro in bici; sopra, i borghi di lingua tedesca di Sauris, «Best Tourism Village» 2023 per l'Organizzazione mondiale del turismo.",
      en: "A lake at 977 metres with SUP, canoeing and a bike loop; above it, the German-speaking hamlets of Sauris, a «Best Tourism Village» 2023 for the UN World Tourism Organization.",
      de: "Ein See auf 977 Metern mit SUP, Kanu und einer Radrunde; darüber die deutschsprachigen Weiler von Sauris, 2023 «Best Tourism Village» der Welttourismusorganisation.",
      sl: "Jezero na 977 metrih s SUP-om, kanujem in krogom s kolesom; nad njim nemško govoreči zaselki Saurisa, »Best Tourism Village« 2023 Svetovne turistične organizacije.",
    },
    stagioni: ["estate"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 19, "chalet-navauce": 26 },
    fonte: "E8, E25 + distanze lago-sauris-diga",
  },
  {
    id: "malghe",
    titolo: { it: "Prosciutto, formaggi e malghe", en: "Ham, cheese and mountain pastures", de: "Schinken, Käse und Almen", sl: "Pršut, siri in planine" },
    testo: {
      it: "A Sauris il prosciutto IGP affumicato al faggio e la birra del paese; a luglio la festa del prosciutto, ad agosto quella dei formaggi di malga; intorno al Pieltinis l'anello delle malghe.",
      en: "In Sauris the beech-smoked PGI ham and the village beer; the ham festival in July, the mountain-cheese festival in August; around Monte Pieltinis, the ring of mountain pastures.",
      de: "In Sauris der über Buchenholz geräucherte g.g.A.-Schinken und das Bier des Dorfes; im Juli das Schinkenfest, im August das Fest der Almkäse; rund um den Pieltinis die Almrunde.",
      sl: "V Saurisu pršut ZGO, dimljen na bukovem lesu, in vaško pivo; julija praznik pršuta, avgusta praznik planinskih sirov; okoli Pieltinisa krog planin.",
    },
    stagioni: ["estate"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 24, "chalet-navauce": 31 },
    fonte: "E30, E21, E22, E10 + distanze sauris-wolf",
  },
  {
    id: "carniarmonie",
    titolo: { it: "Musica nelle pievi", en: "Music in the old churches", de: "Musik in den Pfarrkirchen", sl: "Glasba v starih cerkvah" },
    testo: {
      it: "Ogni estate il festival Carniarmonie porta concerti nelle pievi e nei borghi della Carnia, anche a Mediis e alla Pieve di Castoia.",
      en: "Every summer the Carniarmonie festival brings concerts to the churches and villages of Carnia, including Mediis and the Pieve di Castoia.",
      de: "Jeden Sommer bringt das Festival Carniarmonie Konzerte in die Kirchen und Dörfer Karniens, auch nach Mediis und in die Pieve di Castoia.",
      sl: "Vsako poletje festival Carniarmonie prinese koncerte v cerkve in vasi Karnije, tudi v Mediis in v cerkev Pieve di Castoia.",
    },
    stagioni: ["estate"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 5, "chalet-navauce": 12 },
    fonte: "E20 + distanze pieve-castoia",
  },
  {
    id: "zoncolan-bici",
    titolo: { it: "Lo Zoncolan in bici", en: "Monte Zoncolan by bike", de: "Der Zoncolan mit dem Rad", sl: "Zoncolan s kolesom" },
    testo: {
      it: "La salita del Giro d'Italia da Sutrio: 13,7 km su strada aperta, gli ultimi tre al 14% con strappi al 25%.",
      en: "The Giro d'Italia climb from Sutrio: 13.7 km on an open road, the last three at 14% with ramps of 25%.",
      de: "Der Anstieg des Giro d'Italia von Sutrio: 13,7 km auf offener Straße, die letzten drei mit 14 % und Rampen bis 25 %.",
      sl: "Vzpon Gira d'Italia iz Sutria: 13,7 km po odprti cesti, zadnji trije s 14 % in odseki do 25 %.",
    },
    stagioni: ["estate"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 32, "chalet-navauce": 22 },
    fonte: "E17 + distanze zoncolan-ravascletto",
  },
  {
    id: "illegio",
    titolo: { it: "Illegio, la mostra dell'anno", en: "Illegio, the exhibition of the year", de: "Illegio, die Ausstellung des Jahres", sl: "Illegio, razstava leta" },
    testo: {
      it: "Un paese di montagna che dal 2004 ha portato in Carnia più di 1.600 opere d'arte: ogni anno, da giugno a novembre, una grande mostra nella Casa delle Esposizioni.",
      en: "A mountain village that since 2004 has brought more than 1,600 works of art to Carnia: every year, from June to November, a major exhibition in the Casa delle Esposizioni.",
      de: "Ein Bergdorf, das seit 2004 mehr als 1.600 Kunstwerke nach Karnien geholt hat: jedes Jahr von Juni bis November eine große Ausstellung in der Casa delle Esposizioni.",
      sl: "Gorska vas, ki je od leta 2004 v Karnijo pripeljala več kot 1.600 umetnin: vsako leto od junija do novembra velika razstava v Casa delle Esposizioni.",
    },
    stagioni: ["estate", "autunno"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 34, "chalet-navauce": 33 },
    fonte: "A1 + distanze illegio",
  },
  {
    id: "colori",
    titolo: { it: "I colori delle Colline Carniche", en: "The colours of the Colline Carniche", de: "Die Farben der Karnischen Hügel", sl: "Barve Karnijskih gričev" },
    testo: {
      it: "Ottobre è il mese delle faggete: nel parco delle Colline Carniche la conca di Valdie e i prati sopra il Tagliamento; per chi arrampica, le pareti esposte a sud di Raveo.",
      en: "October is the month of the beech woods: in the Colline Carniche park, the Valdie basin and the meadows above the Tagliamento; for climbers, the south-facing walls of Raveo.",
      de: "Der Oktober ist der Monat der Buchenwälder: im Park der Karnischen Hügel die Mulde von Valdie und die Wiesen über dem Tagliamento; für Kletterer die Südwände von Raveo.",
      sl: "Oktober je mesec bukovih gozdov: v parku Karnijskih gričev kotanja Valdie in travniki nad Tilmentom; za plezalce južne stene v Raveu.",
    },
    stagioni: ["autunno"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 21, "chalet-navauce": 10 },
    fonte: "P1, A7 + distanze valdie",
  },
  {
    id: "museo-carnico",
    titolo: { it: "Tolmezzo e il Museo Carnico", en: "Tolmezzo and the Carnic Museum", de: "Tolmezzo und das Karnische Museum", sl: "Tolmeč in Karnijski muzej" },
    testo: {
      it: "Una trentina di sale su tre piani raccontano la vita di montagna: le cucine, le botteghe, gli orologi, i cramârs, i venditori ambulanti della Carnia.",
      en: "Some thirty rooms on three floors tell the story of mountain life: kitchens, workshops, clocks, the cramârs, Carnia's travelling pedlars.",
      de: "Rund dreißig Säle auf drei Etagen erzählen vom Leben in den Bergen: Küchen, Werkstätten, Uhren, die Cramârs, die Wanderhändler Karniens.",
      sl: "Okoli trideset sob v treh nadstropjih pripoveduje o življenju v gorah: kuhinje, delavnice, ure, cramârji, karnijski krošnjarji.",
    },
    stagioni: ["autunno", "inverno"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 22, "chalet-navauce": 20 },
    fonte: "A2 + distanze museo-carnico",
  },
  {
    id: "venzone",
    titolo: { it: "Venzone, pietra per pietra", en: "Venzone, stone by stone", de: "Venzone, Stein für Stein", sl: "Venzone, kamen za kamnom" },
    testo: {
      it: "Dopo il terremoto del 1976 il borgo fu ricostruito rimettendo al suo posto ogni pietra; nella cripta di San Michele, le mummie.",
      en: "After the 1976 earthquake the village was rebuilt by putting every stone back in its place; in the crypt of San Michele, the mummies.",
      de: "Nach dem Erdbeben von 1976 wurde der Ort wieder aufgebaut, indem man jeden Stein an seinen Platz zurücksetzte; in der Krypta von San Michele die Mumien.",
      sl: "Po potresu leta 1976 so kraj obnovili tako, da so vsak kamen vrnili na svoje mesto; v kripti San Michele mumije.",
    },
    stagioni: ["primavera", "autunno", "inverno"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 37, "chalet-navauce": 36 },
    fonte: "A4 + distanze venzone",
  },
  {
    id: "sci",
    titolo: { it: "Sciare a mezz'ora", en: "Skiing half an hour away", de: "Skifahren eine halbe Stunde entfernt", sl: "Smučanje pol ure stran" },
    testo: {
      it: "Forni di Sopra, Sauris e lo Zoncolan da Ravascletto, con un solo skipass che vale in tutti i poli della regione.",
      en: "Forni di Sopra, Sauris and Monte Zoncolan from Ravascletto, with a single ski pass valid in all the region's ski areas.",
      de: "Forni di Sopra, Sauris und der Zoncolan von Ravascletto aus, mit einem einzigen Skipass für alle Skigebiete der Region.",
      sl: "Forni di Sopra, Sauris in Zoncolan iz Ravascletta, z eno samo smučarsko vozovnico za vsa smučišča v regiji.",
    },
    stagioni: ["inverno"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 32, "chalet-navauce": 22 },
    fonte: "I1, I2, I3, I4 + distanze zoncolan-ravascletto",
  },
  {
    id: "fondo",
    titolo: { it: "Fondo lungo il Tagliamento", en: "Cross-country along the Tagliamento", de: "Langlauf am Tagliamento", sl: "Tek na smučeh ob Tilmentu" },
    testo: {
      it: "A Forni di Sopra la pista «Tagliamento»: 13 km lungo il fiume, quattro anelli omologati FIS, due chilometri illuminati la sera.",
      en: "In Forni di Sopra the «Tagliamento» trail: 13 km along the river, four FIS-approved loops, two kilometres lit in the evening.",
      de: "In Forni di Sopra die Loipe «Tagliamento»: 13 km am Fluss entlang, vier FIS-homologierte Runden, zwei Kilometer abends beleuchtet.",
      sl: "V Forni di Sopra proga »Tagliamento«: 13 km ob reki, štirje krogi s homologacijo FIS, dva kilometra zvečer osvetljena.",
    },
    stagioni: ["inverno"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 32, "chalet-navauce": 39 },
    fonte: "I5 + distanze forni-santaviela-fondo",
  },
  {
    id: "lanterne",
    titolo: { it: "La Notte delle Lanterne", en: "The Night of the Lanterns", de: "Die Nacht der Laternen", sl: "Noč lanternov" },
    testo: {
      it: "Il sabato prima delle Ceneri, a Sauris, un corteo di maschere di legno e di lanterne scende nel bosco da Sauris di Sopra a Sauris di Sotto.",
      en: "On the Saturday before Ash Wednesday, in Sauris, a procession of wooden masks and lanterns walks down through the woods from Sauris di Sopra to Sauris di Sotto.",
      de: "Am Samstag vor Aschermittwoch zieht in Sauris ein Umzug aus Holzmasken und Laternen durch den Wald von Sauris di Sopra nach Sauris di Sotto.",
      sl: "Soboto pred pepelnično sredo se v Saurisu sprevod lesenih mask in lanternov spusti skozi gozd iz Sauris di Sopra v Sauris di Sotto.",
    },
    stagioni: ["inverno"],
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 24, "chalet-navauce": 31 },
    fonte: "I10 + distanze sauris-sotto",
  },
  {
    id: "pesariis",
    titolo: { it: "Pesariis, il paese degli orologi", en: "Pesariis, the village of clocks", de: "Pesariis, das Dorf der Uhren", sl: "Pesariis, vas ur" },
    testo: {
      it: "Qui si costruiscono orologi dal Seicento: dodici orologi monumentali da vedere all'aperto, a ogni ora, e il museo dell'orologeria.",
      en: "Clocks have been made here since the 17th century: twelve monumental clocks to see in the open, at any hour, and the clock-making museum.",
      de: "Hier baut man seit dem 17. Jahrhundert Uhren: zwölf monumentale Uhren unter freiem Himmel, zu jeder Stunde, und das Uhrenmuseum.",
      sl: "Tu izdelujejo ure od 17. stoletja: dvanajst monumentalnih ur na prostem, ob vsaki uri, in muzej urarstva.",
    },
    stagioni: TUTTO_L_ANNO,
    case: ENTRAMBE,
    minuti: { "top-hill-cottage": 34, "chalet-navauce": 23 },
    fonte: "E26 + distanze pesariis",
  },
  {
    id: "tavola",
    titolo: { it: "A tavola in Carnia", en: "At the table in Carnia", de: "Zu Tisch in Karnien", sl: "Za mizo v Karniji" },
    testo: {
      it: "Frico, cjarsons, ricotta affumicata e formaggi di malga. A Raveo l'Indiniò è nella selezione della Guida Michelin.",
      en: "Frico, cjarsons, smoked ricotta and mountain cheeses. In Raveo, Indiniò is in the MICHELIN Guide selection.",
      de: "Frico, Cjarsons, geräucherter Ricotta und Almkäse. In Raveo steht das Indiniò in der Auswahl des Guide MICHELIN.",
      sl: "Frico, cjarsons, prekajena skuta in planinski siri. V Raveu je Indiniò v izboru vodnika MICHELIN.",
    },
    stagioni: TUTTO_L_ANNO,
    case: ENTRAMBE,
    // Dallo chalet l'Indiniò è in paese, sotto casa: i minuti d'auto non dicono niente.
    minuti: { "top-hill-cottage": 12 },
    fonte: "I11, I12 + distanze rist-indinio-raveo",
  },
];

export const ESPERIENZE_ID: ReadonlySet<string> = new Set(ESPERIENZE.map((e) => e.id));
