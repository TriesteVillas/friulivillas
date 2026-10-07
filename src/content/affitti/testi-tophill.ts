// I testi della pagina di Top Hill Cottage, nelle quattro lingue.
//
// Ogni fatto viene dalla KB (progetti/tophill-cottage/FONTI.md, territorio/,
// REGOLE-LEGALI.md). Regole che i testi rispettano:
//   · niente superlativi e niente lusso dichiarato: si dicono le cose;
//   · niente numeri che le fonti si contraddicono (camere 5 o 6, bagni 6 o 7,
//     sauna): si scrivono solo quelli confermati da almeno due fonti;
//   · niente prezzi (Codice del Consumo art. 22 c. 4): preventivo su richiesta;
//   · la piscina è quella che è: una vasca fuori terra, d'estate;
//   · i servizi su richiesta sono quelli che la struttura dichiara, «da concordare»;
//   · nessun nome di proprietari o gestori (CLAUDE.md §3).
import type { Lingua } from "./case";
import type { TestiRecensioni } from "@/components/affitti/Recensioni";

export type TestiPagina = {
  seo: { titolo: string; descrizione: string };
  testata: { eyebrow: string; titolo: string; sottotitolo: string };
  manifesto: { titolo: string; testo: string[]; fatti: Array<{ valore: string; etichetta: string }> };
  volo: { titolo: string; tappe: Array<{ da: number; a: number; testo: string }>; nota: string };
  casa: { eyebrow: string; titolo: string; testo: string[] };
  ore: { eyebrow: string; titolo: string; voci: { giorno: string; oro: string; notte: string }; nota: string };
  modi: { eyebrow: string; titolo: string; voci: Array<{ titolo: string; testo: string }> };
  chiavi: { eyebrow: string; titolo: string; testo: string[]; elenco: string[]; nota: string };
  recensioni: TestiRecensioni | null;
  dove: { eyebrow: string; titolo: string; testo: string[] };
  stagioni: { eyebrow: string; titolo: string; testo: string };
  prenota: { eyebrow: string; titolo: string; testo: string };
  regole: { titolo: string; voci: string[] };
  sorella: { eyebrow: string; titolo: string; testo: string };
};

const IT: TestiPagina = {
  seo: {
    titolo: "Top Hill Cottage · casa in affitto a Viaso, in Carnia",
    descrizione:
      "Una villa nuova in pietra e vetro sopra la valle del Tagliamento, a Viaso di Socchieve: si affitta intera a un gruppo, fino a 12 persone. Date libere e preventivo.",
  },
  testata: {
    eyebrow: "Viaso · Carnia · Friuli Venezia Giulia",
    titolo: "Top Hill Cottage",
    sottotitolo:
      "Una casa nuova in pietra e vetro, in cima a un poggio sopra la valle del Tagliamento. Si affitta intera, a un gruppo solo.",
  },
  manifesto: {
    titolo: "Il colle, il bosco, la valle sotto i piedi.",
    testo: [
      "Top Hill Cottage sta ai margini di Viaso, un paese di prati e tetti rossi a 525 metri, nella Carnia: le montagne del Friuli dove il Tagliamento esce dalle valli e si allarga in un letto di ghiaia bianca.",
      "Intorno alla casa ci sono dodicimila metri quadrati di prato e alberi. Dentro, pietra, legno e grandi vetrate che guardano i monti. Si affitta per intero: chi arriva ha tutta la casa, e nessun altro.",
    ],
    fatti: [
      { valore: "12", etichetta: "ospiti al massimo" },
      { valore: "700 m²", etichetta: "di casa" },
      { valore: "12.000 m²", etichetta: "di parco" },
      { valore: "525 m", etichetta: "di quota" },
    ],
  },
  volo: {
    titolo: "Dal paese alla casa, in volo.",
    tappe: [
      { da: 0, a: 0.3, testo: "Viaso: prati, orti e tetti rossi sopra la valle." },
      { da: 0.3, a: 0.62, testo: "Il bosco sale fino al poggio." },
      { da: 0.62, a: 1.01, testo: "In cima, la casa: pietra, legno e vetro." },
    ],
    nota: "Ripresa vera col drone, estate 2022. Nessuna modifica con l'intelligenza artificiale.",
  },
  casa: {
    eyebrow: "La casa",
    titolo: "Una stanza grande per stare insieme, e una camera per ciascuno.",
    testo: [
      "Al piano terra la cucina con l'isola, il tavolo per dodici e il soggiorno stanno in un unico spazio aperto, con la stufa a legna da una parte e il camino dall'altra. Una scala sospesa sale alle camere sotto le travi, ciascuna col suo bagno.",
      "Poi un secondo soggiorno davanti alla vetrata, una palestra, un bagno turco; fuori il portico, il prato e, d'estate, una piscina fuori terra.",
    ],
  },
  ore: {
    eyebrow: "La luce",
    titolo: "Un giorno lassù.",
    voci: {
      giorno: "Di giorno il prato, il bosco e la valle.",
      oro: "Al tramonto la pietra si scalda.",
      notte: "La sera la casa si accende.",
    },
    nota: "Il giorno e la sera sono fotografie vere. L'ora del tramonto è una simulazione creata con l'AI dalla foto di giorno.",
  },
  modi: {
    eyebrow: "Per chi è",
    titolo: "Tre modi di stare a Top Hill.",
    voci: [
      {
        titolo: "La montagna, con calma",
        testo:
          "Le Dolomiti Friulane, il lago di Sauris e lo Zoncolan sono a meno di quaranta minuti d'auto. Si torna a una casa calda, con il camino acceso e un tavolo per tutti.",
      },
      {
        titolo: "Ritiri e riunioni di lavoro",
        testo:
          "Una casa intera per una squadra: il tavolo da dodici per lavorare, una camera per dormire ciascuno, una palestra per staccare. Su richiesta si organizzano il cuoco in casa e le uscite con una guida; a due chilometri, a Socchieve, c'è un coworking comunale con sala riunioni.",
      },
      {
        titolo: "Famiglie e amici",
        testo:
          "Il giardino è recintato, la culla si chiede gratis, i giochi da tavolo ci sono già. E la sera c'è spazio per tutti attorno allo stesso tavolo.",
      },
    ],
  },
  chiavi: {
    eyebrow: "Non solo le chiavi",
    titolo: "Dietro la casa c'è chi la conosce.",
    testo: [
      "All'arrivo vi accoglie di persona chi gestisce la casa, e ve la fa vedere stanza per stanza. Durante il soggiorno resta raggiungibile, con i consigli su cosa vedere e dove mangiare.",
      "E su richiesta organizza quello che serve. Sono i servizi che la struttura dichiara: costi e condizioni si concordano col preventivo.",
    ],
    elenco: [
      "Transfer dall'aeroporto con autista",
      "La spesa in casa all'arrivo",
      "Un cuoco privato per le cene",
      "Escursioni con una guida alpina",
      "Giri in e-bike",
      "Massaggi, personal trainer, yoga",
      "Un anniversario o una sorpresa da preparare",
    ],
    nota: "Servizi dichiarati dalla struttura sui suoi annunci. Disponibilità e prezzi si confermano con il preventivo.",
  },
  recensioni: null,
  dove: {
    eyebrow: "Dov'è",
    titolo: "In Carnia, dove il Friuli diventa montagna.",
    testo: [
      "Viaso è una frazione di Socchieve, uno dei comuni della Carnia, la terra di montagna dell'alto Friuli. Dalla casa a Tolmezzo sono una ventina di minuti, a Udine un'ora, all'aeroporto di Trieste meno di un'ora e mezza.",
    ],
  },
  stagioni: {
    eyebrow: "Cosa fare",
    titolo: "Una valle per ogni stagione.",
    testo:
      "Laghi, malghe, borghi di legno, sentieri e piste: scegliete la stagione e mettete da parte quello che vi incuriosisce. Le idee che aggiungete partono con la richiesta di preventivo.",
  },
  prenota: {
    eyebrow: "Date e preventivo",
    titolo: "Quando venite?",
    testo:
      "Scegliete le date tra quelle libere e diteci quanti siete e cosa vi piacerebbe trovare. Vi rispondiamo con la conferma e il preventivo: non serve passare da altri siti.",
  },
  regole: {
    titolo: "Da sapere",
    voci: [
      "Si affitta intera, a un gruppo per volta. Soggiorno minimo di tre notti.",
      "Arrivo dalle 15 alle 21, partenza entro le 10.",
      "Bambini benvenuti, culla gratuita su richiesta.",
      "Niente animali, niente fumo in casa, niente feste.",
    ],
  },
  sorella: {
    eyebrow: "A pochi chilometri",
    titolo: "Chalet Navauce",
    testo:
      "Chi fa funzionare Top Hill ha anche una casa sua: uno chalet di legno e pietra in un prato tra i boschi, per chi viaggia in pochi.",
  },
};

const EN: TestiPagina = {
  seo: {
    titolo: "Top Hill Cottage · a house to rent in Viaso, Carnia",
    descrizione:
      "A new stone-and-glass villa above the Tagliamento valley in Viaso di Socchieve, Friuli: rented whole to one group, up to 12 guests. Free dates and a quote.",
  },
  testata: {
    eyebrow: "Viaso · Carnia · Friuli Venezia Giulia",
    titolo: "Top Hill Cottage",
    sottotitolo:
      "A new house of stone and glass on top of a knoll above the Tagliamento valley. Rented whole, to one group only.",
  },
  manifesto: {
    titolo: "The hill, the woods, the valley at your feet.",
    testo: [
      "Top Hill Cottage stands on the edge of Viaso, a village of meadows and red roofs at 525 metres in Carnia: the mountains of Friuli, where the Tagliamento leaves the valleys and spreads into a bed of white gravel.",
      "Around the house lie twelve thousand square metres of meadow and trees. Inside, stone, wood and large windows facing the mountains. It is let as a whole: whoever arrives has the entire house, and nobody else.",
    ],
    fatti: [
      { valore: "12", etichetta: "guests at most" },
      { valore: "700 m²", etichetta: "of house" },
      { valore: "12,000 m²", etichetta: "of grounds" },
      { valore: "525 m", etichetta: "above sea level" },
    ],
  },
  volo: {
    titolo: "From the village to the house, in flight.",
    tappe: [
      { da: 0, a: 0.3, testo: "Viaso: meadows, gardens and red roofs above the valley." },
      { da: 0.3, a: 0.62, testo: "The woods climb up to the knoll." },
      { da: 0.62, a: 1.01, testo: "At the top, the house: stone, wood and glass." },
    ],
    nota: "Real drone footage, summer 2022. No changes made with artificial intelligence.",
  },
  casa: {
    eyebrow: "The house",
    titolo: "One large room to be together, and a bedroom for everyone.",
    testo: [
      "On the ground floor the kitchen with its island, the table for twelve and the living room share one open space, with the wood stove at one end and the fireplace at the other. A floating staircase leads to the bedrooms under the beams, each with its own bathroom.",
      "Then a second living room facing the glass wall, a gym and a steam bath; outside the porch, the lawn and, in summer, an above-ground pool.",
    ],
  },
  ore: {
    eyebrow: "The light",
    titolo: "A day up there.",
    voci: {
      giorno: "By day the meadow, the woods and the valley.",
      oro: "At sunset the stone warms up.",
      notte: "In the evening the house lights up.",
    },
    nota: "Day and evening are real photographs. The sunset is a simulation created with AI from the daytime photo.",
  },
  modi: {
    eyebrow: "Who it is for",
    titolo: "Three ways to stay at Top Hill.",
    voci: [
      {
        titolo: "The mountains, slowly",
        testo:
          "The Friulian Dolomites, Lake Sauris and Monte Zoncolan are less than forty minutes' drive away. You come back to a warm house, the fire lit and a table for everyone.",
      },
      {
        titolo: "Retreats and work meetings",
        testo:
          "A whole house for one team: the table for twelve to work at, a bedroom each to sleep in, a gym to switch off. A chef in the house and outings with a guide can be arranged on request; two kilometres away, in Socchieve, there is a municipal coworking space with a meeting room.",
      },
      {
        titolo: "Families and friends",
        testo:
          "The garden is fenced, a cot is free on request, the board games are already there. And in the evening there is room for everyone around the same table.",
      },
    ],
  },
  chiavi: {
    eyebrow: "More than the keys",
    titolo: "Behind the house there is someone who knows it.",
    testo: [
      "On arrival the person who runs the house welcomes you in person and shows you around, room by room. During your stay they remain within reach, with tips on what to see and where to eat.",
      "And on request they arrange what you need. These are the services the house declares: costs and terms are agreed with the quote.",
    ],
    elenco: [
      "Airport transfer with a driver",
      "Groceries in the house on arrival",
      "A private chef for dinners",
      "Hikes with a mountain guide",
      "E-bike tours",
      "Massages, personal trainer, yoga",
      "An anniversary or a surprise to prepare",
    ],
    nota: "Services declared by the house in its listings. Availability and prices are confirmed with the quote.",
  },
  recensioni: null,
  dove: {
    eyebrow: "Where it is",
    titolo: "In Carnia, where Friuli turns into mountains.",
    testo: [
      "Viaso is a hamlet of Socchieve, one of the municipalities of Carnia, the mountain land of upper Friuli. From the house Tolmezzo is about twenty minutes away, Udine an hour, Trieste airport less than an hour and a half.",
    ],
  },
  stagioni: {
    eyebrow: "What to do",
    titolo: "A valley for every season.",
    testo:
      "Lakes, mountain pastures, wooden villages, trails and slopes: choose the season and set aside what catches your eye. The ideas you add travel with your request for a quote.",
  },
  prenota: {
    eyebrow: "Dates and quote",
    titolo: "When are you coming?",
    testo:
      "Pick your dates among the free ones and tell us how many you are and what you would like to find. We reply with the confirmation and a quote: there is no need to go through other websites.",
  },
  regole: {
    titolo: "Good to know",
    voci: [
      "Rented whole, to one group at a time. Minimum stay three nights.",
      "Check-in 3 pm to 9 pm, check-out by 10 am.",
      "Children welcome, cot free on request.",
      "No pets, no smoking in the house, no parties.",
    ],
  },
  sorella: {
    eyebrow: "A few kilometres away",
    titolo: "Chalet Navauce",
    testo:
      "The person who keeps Top Hill running also has a house of his own: a wood-and-stone chalet in a meadow among the woods, for those travelling in few.",
  },
};

const DE: TestiPagina = {
  seo: {
    titolo: "Top Hill Cottage · Ferienhaus in Viaso, Karnien",
    descrizione:
      "Eine neue Villa aus Stein und Glas über dem Tagliamento-Tal in Viaso di Socchieve, Friaul: als Ganzes an eine Gruppe vermietet, bis zu 12 Gäste. Freie Termine und Angebot.",
  },
  testata: {
    eyebrow: "Viaso · Karnien · Friaul-Julisch Venetien",
    titolo: "Top Hill Cottage",
    sottotitolo:
      "Ein neues Haus aus Stein und Glas auf einer Anhöhe über dem Tal des Tagliamento. Als Ganzes vermietet, an eine einzige Gruppe.",
  },
  manifesto: {
    titolo: "Der Hügel, der Wald, das Tal zu Ihren Füßen.",
    testo: [
      "Top Hill Cottage liegt am Rand von Viaso, einem Dorf aus Wiesen und roten Dächern auf 525 Metern, in Karnien: den Bergen Friauls, wo der Tagliamento die Täler verlässt und sich zu einem Bett aus weißem Kies weitet.",
      "Rund um das Haus liegen zwölftausend Quadratmeter Wiese und Bäume. Drinnen Stein, Holz und große Fenster, die auf die Berge blicken. Vermietet wird nur das ganze Haus: Wer ankommt, hat es für sich allein.",
    ],
    fatti: [
      { valore: "12", etichetta: "Gäste höchstens" },
      { valore: "700 m²", etichetta: "Wohnfläche" },
      { valore: "12.000 m²", etichetta: "Park" },
      { valore: "525 m", etichetta: "Höhe" },
    ],
  },
  volo: {
    titolo: "Vom Dorf zum Haus, im Flug.",
    tappe: [
      { da: 0, a: 0.3, testo: "Viaso: Wiesen, Gärten und rote Dächer über dem Tal." },
      { da: 0.3, a: 0.62, testo: "Der Wald steigt bis zur Anhöhe hinauf." },
      { da: 0.62, a: 1.01, testo: "Oben das Haus: Stein, Holz und Glas." },
    ],
    nota: "Echte Drohnenaufnahme, Sommer 2022. Keine Veränderung mit künstlicher Intelligenz.",
  },
  casa: {
    eyebrow: "Das Haus",
    titolo: "Ein großer Raum für alle, und ein Zimmer für jeden.",
    testo: [
      "Im Erdgeschoss teilen sich die Küche mit Kochinsel, der Tisch für zwölf und das Wohnzimmer einen offenen Raum, mit dem Holzofen auf der einen und dem Kamin auf der anderen Seite. Eine freitragende Treppe führt zu den Zimmern unter den Balken, jedes mit eigenem Bad.",
      "Dazu ein zweites Wohnzimmer vor der Glasfront, ein Fitnessraum und ein Dampfbad; draußen die Veranda, der Rasen und im Sommer ein Aufstellpool.",
    ],
  },
  ore: {
    eyebrow: "Das Licht",
    titolo: "Ein Tag dort oben.",
    voci: {
      giorno: "Tagsüber die Wiese, der Wald und das Tal.",
      oro: "Bei Sonnenuntergang wird der Stein warm.",
      notte: "Am Abend leuchtet das Haus.",
    },
    nota: "Tag und Abend sind echte Fotos. Der Sonnenuntergang ist eine mit KI erzeugte Simulation aus dem Tagesfoto.",
  },
  modi: {
    eyebrow: "Für wen",
    titolo: "Drei Arten, in Top Hill zu wohnen.",
    voci: [
      {
        titolo: "Die Berge, in Ruhe",
        testo:
          "Die Friauler Dolomiten, der Sauris-See und der Monte Zoncolan liegen weniger als vierzig Autominuten entfernt. Zurück geht es in ein warmes Haus, mit brennendem Kamin und einem Tisch für alle.",
      },
      {
        titolo: "Retreats und Arbeitstreffen",
        testo:
          "Ein ganzes Haus für ein Team: der Tisch für zwölf zum Arbeiten, ein Zimmer für jeden zum Schlafen, ein Fitnessraum zum Abschalten. Auf Anfrage lassen sich ein Koch im Haus und Ausflüge mit Führer organisieren; zwei Kilometer entfernt, in Socchieve, gibt es einen kommunalen Coworking-Raum mit Besprechungssaal.",
      },
      {
        titolo: "Familien und Freunde",
        testo:
          "Der Garten ist eingezäunt, das Babybett gibt es kostenlos auf Anfrage, Brettspiele sind schon da. Und abends ist Platz für alle am selben Tisch.",
      },
    ],
  },
  chiavi: {
    eyebrow: "Mehr als nur Schlüssel",
    titolo: "Hinter dem Haus steht jemand, der es kennt.",
    testo: [
      "Bei der Ankunft empfängt Sie der Verwalter des Hauses persönlich und zeigt es Ihnen Zimmer für Zimmer. Während des Aufenthalts bleibt er erreichbar, mit Tipps, was man sehen und wo man essen kann.",
      "Und auf Anfrage organisiert er, was Sie brauchen. Es sind die Leistungen, die das Haus angibt: Kosten und Konditionen werden mit dem Angebot vereinbart.",
    ],
    elenco: [
      "Flughafentransfer mit Fahrer",
      "Einkauf im Haus bei Ankunft",
      "Ein Privatkoch für die Abendessen",
      "Wanderungen mit Bergführer",
      "E-Bike-Touren",
      "Massagen, Personal Trainer, Yoga",
      "Ein Jahrestag oder eine Überraschung",
    ],
    nota: "Vom Haus in seinen Inseraten angegebene Leistungen. Verfügbarkeit und Preise werden mit dem Angebot bestätigt.",
  },
  recensioni: null,
  dove: {
    eyebrow: "Wo es liegt",
    titolo: "In Karnien, wo Friaul zum Gebirge wird.",
    testo: [
      "Viaso ist ein Ortsteil von Socchieve, einer der Gemeinden Karniens, des Berglands im oberen Friaul. Vom Haus sind es etwa zwanzig Minuten nach Tolmezzo, eine Stunde nach Udine und weniger als anderthalb Stunden zum Flughafen Triest.",
    ],
  },
  stagioni: {
    eyebrow: "Was man tun kann",
    titolo: "Ein Tal für jede Jahreszeit.",
    testo:
      "Seen, Almen, Holzdörfer, Wege und Pisten: Wählen Sie die Jahreszeit und legen Sie beiseite, was Sie neugierig macht. Die Ideen, die Sie hinzufügen, gehen mit der Angebotsanfrage mit.",
  },
  prenota: {
    eyebrow: "Termine und Angebot",
    titolo: "Wann kommen Sie?",
    testo:
      "Wählen Sie Ihre Termine unter den freien und sagen Sie uns, wie viele Sie sind und was Sie vorfinden möchten. Wir antworten mit der Bestätigung und einem Angebot: Andere Websites brauchen Sie dafür nicht.",
  },
  regole: {
    titolo: "Gut zu wissen",
    voci: [
      "Nur als Ganzes vermietet, an eine Gruppe zur Zeit. Mindestaufenthalt drei Nächte.",
      "Anreise 15 bis 21 Uhr, Abreise bis 10 Uhr.",
      "Kinder willkommen, Babybett kostenlos auf Anfrage.",
      "Keine Haustiere, kein Rauchen im Haus, keine Feiern.",
    ],
  },
  sorella: {
    eyebrow: "Wenige Kilometer entfernt",
    titolo: "Chalet Navauce",
    testo:
      "Der Mann, der Top Hill am Laufen hält, hat auch ein eigenes Haus: ein Chalet aus Holz und Stein auf einer Wiese zwischen den Wäldern, für alle, die zu wenigen reisen.",
  },
};

const SL: TestiPagina = {
  seo: {
    titolo: "Top Hill Cottage · hiša za najem v Viasu, Karnija",
    descrizione:
      "Nova vila iz kamna in stekla nad dolino Tilmenta v Viasu (Socchieve), Furlanija: v najem v celoti eni skupini, do 12 gostov. Prosti termini in ponudba.",
  },
  testata: {
    eyebrow: "Viaso · Karnija · Furlanija - Julijska krajina",
    titolo: "Top Hill Cottage",
    sottotitolo:
      "Nova hiša iz kamna in stekla na vrhu griča nad dolino Tilmenta. V najem v celoti, samo eni skupini.",
  },
  manifesto: {
    titolo: "Grič, gozd in dolina pod nogami.",
    testo: [
      "Top Hill Cottage stoji na robu Viasa, vasi travnikov in rdečih streh na 525 metrih, v Karniji: v gorah Furlanije, kjer Tilment zapusti doline in se razlije v strugo belega proda.",
      "Okoli hiše je dvanajst tisoč kvadratnih metrov travnikov in dreves. Notri kamen, les in velika okna, ki gledajo na gore. Oddaja se v celoti: kdor pride, ima vso hišo zase.",
    ],
    fatti: [
      { valore: "12", etichetta: "gostov največ" },
      { valore: "700 m²", etichetta: "hiše" },
      { valore: "12.000 m²", etichetta: "parka" },
      { valore: "525 m", etichetta: "nadmorske višine" },
    ],
  },
  volo: {
    titolo: "Od vasi do hiše, v letu.",
    tappe: [
      { da: 0, a: 0.3, testo: "Viaso: travniki, vrtovi in rdeče strehe nad dolino." },
      { da: 0.3, a: 0.62, testo: "Gozd se vzpenja do griča." },
      { da: 0.62, a: 1.01, testo: "Na vrhu hiša: kamen, les in steklo." },
    ],
    nota: "Pravi posnetek z dronom, poletje 2022. Brez sprememb z umetno inteligenco.",
  },
  casa: {
    eyebrow: "Hiša",
    titolo: "Velik prostor za skupaj in soba za vsakogar.",
    testo: [
      "V pritličju si kuhinja z otokom, miza za dvanajst in dnevna soba delijo en odprt prostor, s pečjo na drva na eni strani in kaminom na drugi. Lebdeče stopnišče vodi do sob pod tramovi, vsaka ima svojo kopalnico.",
      "Nato še druga dnevna soba pred stekleno steno, fitnes in parna kopel; zunaj veranda, trata in poleti nadzemni bazen.",
    ],
  },
  ore: {
    eyebrow: "Svetloba",
    titolo: "En dan tam zgoraj.",
    voci: {
      giorno: "Podnevi travnik, gozd in dolina.",
      oro: "Ob sončnem zahodu se kamen ogreje.",
      notte: "Zvečer se hiša prižge.",
    },
    nota: "Dan in večer sta pravi fotografiji. Sončni zahod je simulacija, ustvarjena z umetno inteligenco iz dnevne fotografije.",
  },
  modi: {
    eyebrow: "Za koga",
    titolo: "Trije načini bivanja v Top Hillu.",
    voci: [
      {
        titolo: "Gore, v miru",
        testo:
          "Furlanski Dolomiti, jezero Sauris in Zoncolan so manj kot štirideset minut vožnje stran. Vrnete se v toplo hišo, k prižganemu kaminu in mizi za vse.",
      },
      {
        titolo: "Umiki in delovna srečanja",
        testo:
          "Cela hiša za ekipo: miza za dvanajst za delo, za vsakogar svoja soba, fitnes za sprostitev. Na zahtevo se organizirata kuhar v hiši in izleti z vodnikom; dva kilometra stran, v Socchieveju, je občinski coworking s sejno sobo.",
      },
      {
        titolo: "Družine in prijatelji",
        testo:
          "Vrt je ograjen, otroška posteljica je na zahtevo brezplačna, družabne igre so že tam. Zvečer je prostor za vse okoli iste mize.",
      },
    ],
  },
  chiavi: {
    eyebrow: "Ne samo ključi",
    titolo: "Za hišo stoji nekdo, ki jo pozna.",
    testo: [
      "Ob prihodu vas osebno sprejme upravljavec hiše in vam jo razkaže, sobo za sobo. Med bivanjem je dosegljiv, z nasveti, kaj si ogledati in kje jesti.",
      "Na zahtevo pa organizira, kar potrebujete. To so storitve, ki jih navaja hiša: stroški in pogoji se dogovorijo s ponudbo.",
    ],
    elenco: [
      "Prevoz z letališča z voznikom",
      "Nakup v hiši ob prihodu",
      "Zasebni kuhar za večerje",
      "Izleti z gorskim vodnikom",
      "Izleti z e-kolesom",
      "Masaže, osebni trener, joga",
      "Obletnica ali presenečenje",
    ],
    nota: "Storitve, ki jih hiša navaja v svojih oglasih. Razpoložljivost in cene se potrdijo s ponudbo.",
  },
  recensioni: null,
  dove: {
    eyebrow: "Kje je",
    titolo: "V Karniji, kjer se Furlanija spremeni v gore.",
    testo: [
      "Viaso je zaselek občine Socchieve, ene od občin Karnije, gorske dežele zgornje Furlanije. Od hiše je do Tolmezza približno dvajset minut, do Vidma ura, do tržaškega letališča manj kot uro in pol.",
    ],
  },
  stagioni: {
    eyebrow: "Kaj početi",
    titolo: "Dolina za vsak letni čas.",
    testo:
      "Jezera, planine, lesene vasi, poti in smučišča: izberite letni čas in si odložite, kar vas pritegne. Ideje, ki jih dodate, gredo s povpraševanjem za ponudbo.",
  },
  prenota: {
    eyebrow: "Termini in ponudba",
    titolo: "Kdaj pridete?",
    testo:
      "Izberite termine med prostimi in nam povejte, koliko vas je in kaj bi radi našli. Odgovorimo s potrditvijo in ponudbo: drugih spletnih strani ne potrebujete.",
  },
  regole: {
    titolo: "Dobro je vedeti",
    voci: [
      "Oddaja se v celoti, eni skupini naenkrat. Najkrajše bivanje tri noči.",
      "Prihod od 15. do 21. ure, odhod do 10. ure.",
      "Otroci dobrodošli, otroška posteljica brezplačno na zahtevo.",
      "Brez živali, brez kajenja v hiši, brez zabav.",
    ],
  },
  sorella: {
    eyebrow: "Nekaj kilometrov stran",
    titolo: "Chalet Navauce",
    testo:
      "Kdor skrbi za Top Hill, ima tudi svojo hišo: brunarico iz lesa in kamna na travniku med gozdovi, za tiste, ki potujejo v manjšem številu.",
  },
};

export const TESTI_TOPHILL: Record<Lingua, TestiPagina> = { it: IT, en: EN, de: DE, sl: SL };
