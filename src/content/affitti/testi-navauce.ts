// I testi della pagina di Chalet Navauce, nelle quattro lingue.
//
// Fonti: KB progetti/chalet-navauce/FONTI.md e RECENSIONI.md; regole di legge in
// tophill-cottage/REGOLE-LEGALI.md. Per lo chalet in più:
//   · ⛔ mai «agriturismo» (né «agri-», «rurale») finché non si vede la SCIA;
//   · niente parole ambientali generiche: solo i fatti (pannelli non collegati
//     alla rete, stufe a pellet, acqua piovana per orto e animali);
//   · la quota non si scrive (760 m per yesalps, 593-630 m per il terreno);
//   · il cognome dell'host non si scrive mai; i nomi di battesimo sono quelli
//     con cui gli host si presentano sulle piattaforme;
//   · «da Trieste» lo dice Martino (mandato del 06/10), non le pagine pubbliche.
import type { Lingua } from "./case";
import type { TestiPagina } from "./testi-tophill";

const IT: TestiPagina = {
  seo: {
    titolo: "Chalet Navauce · chalet in affitto a Raveo, in Carnia",
    descrizione:
      "Uno chalet di pietra e larice in un prato tra i boschi sopra Raveo, in Carnia: due piccoli appartamenti, fino a 5 persone, con la corrente dei pannelli solari. Date libere e preventivo.",
  },
  testata: {
    eyebrow: "Raveo · Carnia · Friuli Venezia Giulia",
    titolo: "Chalet Navauce",
    sottotitolo:
      "Pietra e larice in un prato ai margini del bosco, sopra Raveo. Due piccoli appartamenti per stare in pochi, e accanto la fattoria di chi l'ha costruito.",
  },
  manifesto: {
    titolo: "Qui il lusso è la cura.",
    testo: [
      "Chalet Navauce è nato nel 2023 accanto alla piccola azienda agricola che Davide e Alessandra portano avanti a Raveo dal 2016. È fatto di pietra a vista e legno di larice, sul modello degli stavoli, i vecchi fienili della Carnia.",
      "La corrente arriva dai pannelli solari, che non sono collegati alla rete; d'inverno scaldano le stufe a pellet. Intorno c'è un ettaro di prato e bosco ai margini di una faggeta, lontano dalle strade.",
    ],
    fatti: [
      { valore: "2", etichetta: "appartamenti, insieme o separati" },
      { valore: "5", etichetta: "posti letto, più un lettino" },
      { valore: "80 m²", etichetta: "in tutto" },
      { valore: "1 ettaro", etichetta: "di prato e bosco" },
    ],
  },
  volo: { titolo: "", tappe: [], nota: "" },
  casa: {
    eyebrow: "Lo chalet",
    titolo: "Due appartamenti, uno sopra l'altro.",
    testo: [
      "Al piano terra, per due: la zona giorno con la cucina a vista e il divano letto matrimoniale, il bagno con la doccia senza gradini, la porta che dà sul prato.",
      "Al primo piano, per tre: una camera matrimoniale e una cameretta con un letto singolo, sotto le travi di larice, con l'angolo cottura e il bagno. Si affittano insieme, per cinque, oppure uno alla volta.",
    ],
  },
  ore: {
    eyebrow: "La luce",
    titolo: "Un giorno nel prato.",
    voci: {
      giorno: "Di giorno il prato, gli steccati, il bosco.",
      oro: "Al tramonto il larice si scalda.",
      notte: "La notte, le stelle sopra il tetto.",
    },
    nota: "Il giorno e la notte sono fotografie vere. Il tramonto è una simulazione creata con l'AI dalla foto di giorno.",
  },
  modi: {
    eyebrow: "Per chi è",
    titolo: "Tre modi di stare allo chalet.",
    voci: [
      {
        titolo: "In due, nel silenzio",
        testo:
          "Il piano terra è fatto per due: la doccia senza gradini, il prato appena fuori dalla porta, il bosco subito dietro.",
      },
      {
        titolo: "In famiglia",
        testo:
          "Al primo piano la cameretta col letto singolo e il lettino; fuori le amache, il ping-pong e, poco lontano, le pecore e le capre della fattoria.",
      },
      {
        titolo: "Con gli amici, tutto lo chalet",
        testo:
          "I due appartamenti insieme ospitano cinque persone. Se siete di più, Top Hill Cottage è a un quarto d'ora.",
      },
    ],
  },
  chiavi: {
    eyebrow: "Chi vi accoglie",
    titolo: "Davide e Alessandra.",
    testo: [
      "Davide è arrivato in Carnia da Trieste, cambiando vita. Con Alessandra manda avanti la piccola azienda agricola accanto allo chalet e accoglie gli ospiti di persona.",
      "Se non avete un fuoristrada, su richiesta c'è la loro jeep per salire dal paese. E poi i sentieri: una ventina, provati da loro uno per uno.",
    ],
    elenco: [
      "La jeep per salire dal paese, su richiesta",
      "Pane e latte al mattino",
      "Un'escursione accompagnata sui loro sentieri",
      "Giri in mountain bike con chi li organizza in zona",
      "Un momento con le pecore e le capre",
    ],
    nota: "Servizi dichiarati dagli host sui loro annunci. Costi e condizioni si concordano con il preventivo.",
  },
  recensioni: {
    eyebrow: "Gli ospiti",
    titolo: "Quasi tutti, prima di ogni altra cosa, parlano di chi li ha accolti.",
    punteggio: "4,96",
    dettaglio: "su 5, la media che Airbnb calcola sulle 53 recensioni dello chalet. Letta il 7 ottobre 2026.",
    temi: [
      { n: 20, su: 21, testo: "l'accoglienza degli host" },
      { n: 13, su: 21, testo: "il silenzio e la pace" },
      { n: 11, su: 21, testo: "la natura, il bosco" },
      { n: 8, su: 21, testo: "staccare davvero" },
      { n: 7, su: 21, testo: "la pulizia" },
      { n: 7, su: 21, testo: "la cura dei dettagli" },
      { n: 6, su: 21, testo: "la voglia di tornare" },
    ],
    nota:
      "Il punteggio è quello che Airbnb mostra sulla pagina dello chalet: la media, calcolata da Airbnb, di tutte le 53 recensioni (scala da 1 a 5), letta il 7 ottobre 2026; può cambiare dopo questa data. Le recensioni non le raccogliamo noi: le raccoglie e le pubblica Airbnb, che le accetta da chi ha soggiornato prenotando sulla piattaforma; noi non verifichiamo i singoli soggiorni. I temi sono un conteggio nostro sulle 21 recensioni con commento pubblicate su Airbnb negli ultimi 24 mesi (dal 3 novembre 2024 all'8 settembre 2026), senza escluderne nessuna: una recensione conta se nomina il tema, in positivo o in negativo. In quel periodo le osservazioni critiche sono due: la temperatura dell'acqua, regolata subito dagli host, e gli spazi, definiti piccoli. Nessuna recensione è stata pagata, sollecitata o premiata da noi; questa pagina non è affiliata ad Airbnb.",
  },
  dove: {
    eyebrow: "Dov'è",
    titolo: "Raveo, un paese di quattrocento abitanti in Carnia.",
    testo: [
      "Lo chalet sta sopra il paese di Raveo, nel Parco intercomunale delle Colline Carniche. Si arriva in fuoristrada; chi non lo ha lascia l'auto in paese e sale con la jeep degli host, oppure a piedi, in poco più di dieci minuti.",
    ],
  },
  stagioni: {
    eyebrow: "Cosa fare",
    titolo: "Fuori dalla porta, la Carnia.",
    testo:
      "Laghi, malghe, borghi di legno, sentieri e piste: scegliete la stagione e mettete da parte quello che vi incuriosisce. Le idee che aggiungete partono con la richiesta di preventivo.",
  },
  prenota: {
    eyebrow: "Date e preventivo",
    titolo: "Quando salite?",
    testo:
      "Diteci quanti siete e quando vorreste venire. Vi rispondiamo con la conferma e il preventivo: non serve passare da altri siti.",
  },
  regole: {
    titolo: "Da sapere",
    voci: [
      "Si arriva in fuoristrada o a piedi: chi non ha un 4x4 lascia l'auto nel parcheggio del paese.",
      "Arrivo dalle 15 alle 20, partenza entro le 10.",
      "Niente animali, niente fumo.",
      "Negli appartamenti non c'è la lavatrice.",
    ],
  },
  sorella: {
    eyebrow: "A un quarto d'ora",
    titolo: "Top Hill Cottage",
    testo:
      "Per i gruppi più grandi c'è la villa sul poggio di Viaso, che Davide gestisce: fino a dodici persone, la stessa cura.",
  },
};

const EN: TestiPagina = {
  seo: {
    titolo: "Chalet Navauce · a chalet to rent in Raveo, Carnia",
    descrizione:
      "A stone-and-larch chalet in a meadow among the woods above Raveo, in Carnia: two small flats, up to 5 guests, with power from solar panels. Free dates and a quote.",
  },
  testata: {
    eyebrow: "Raveo · Carnia · Friuli Venezia Giulia",
    titolo: "Chalet Navauce",
    sottotitolo:
      "Stone and larch in a meadow at the edge of the woods, above Raveo. Two small flats for staying in few, and next door the farm of the people who built it.",
  },
  manifesto: {
    titolo: "Here, luxury means care.",
    testo: [
      "Chalet Navauce opened in 2023 next to the small farm that Davide and Alessandra have run in Raveo since 2016. It is built of exposed stone and larch wood, modelled on the stavoli, the old hay barns of Carnia.",
      "Power comes from solar panels that are not connected to the grid; in winter pellet stoves keep it warm. All around lies a hectare of meadow and woodland at the edge of a beech forest, away from the roads.",
    ],
    fatti: [
      { valore: "2", etichetta: "flats, together or separately" },
      { valore: "5", etichetta: "beds, plus a cot" },
      { valore: "80 m²", etichetta: "in all" },
      { valore: "1 hectare", etichetta: "of meadow and woods" },
    ],
  },
  volo: { titolo: "", tappe: [], nota: "" },
  casa: {
    eyebrow: "The chalet",
    titolo: "Two flats, one above the other.",
    testo: [
      "On the ground floor, for two: the living area with an open kitchen and a double sofa bed, the bathroom with a step-free shower, the door opening onto the meadow.",
      "On the first floor, for three: a double bedroom and a small room with a single bed, under the larch beams, with a kitchenette and a bathroom. They are let together, for five, or one at a time.",
    ],
  },
  ore: {
    eyebrow: "The light",
    titolo: "A day in the meadow.",
    voci: {
      giorno: "By day the meadow, the fences, the woods.",
      oro: "At sunset the larch warms up.",
      notte: "At night, the stars above the roof.",
    },
    nota: "Day and night are real photographs. The sunset is a simulation created with AI from the daytime photo.",
  },
  modi: {
    eyebrow: "Who it is for",
    titolo: "Three ways to stay at the chalet.",
    voci: [
      {
        titolo: "Two of you, in the quiet",
        testo: "The ground floor is made for two: the step-free shower, the meadow just outside the door, the woods right behind.",
      },
      {
        titolo: "As a family",
        testo:
          "Upstairs the small room with a single bed and a cot; outside the hammocks, the ping-pong table and, a little further on, the farm's sheep and goats.",
      },
      {
        titolo: "With friends, the whole chalet",
        testo: "The two flats together sleep five. If you are more, Top Hill Cottage is a quarter of an hour away.",
      },
    ],
  },
  chiavi: {
    eyebrow: "Who welcomes you",
    titolo: "Davide and Alessandra.",
    testo: [
      "Davide came to Carnia from Trieste, changing his life. With Alessandra he runs the small farm next to the chalet and welcomes guests in person.",
      "If you have no four-wheel drive, their jeep is there on request to drive up from the village. And then the trails: about twenty, each tried out by them.",
    ],
    elenco: [
      "The jeep to drive up from the village, on request",
      "Bread and milk in the morning",
      "A guided hike on their trails",
      "Mountain-bike tours with local organisers",
      "Time with the sheep and goats",
    ],
    nota: "Services declared by the hosts in their listings. Costs and terms are agreed with the quote.",
  },
  recensioni: {
    eyebrow: "The guests",
    titolo: "Almost all of them, before anything else, talk about the people who welcomed them.",
    punteggio: "4.96",
    dettaglio: "out of 5, the average Airbnb calculates on the chalet's 53 reviews. Read on 7 October 2026.",
    temi: [
      { n: 20, su: 21, testo: "the hosts' welcome" },
      { n: 13, su: 21, testo: "silence and peace" },
      { n: 11, su: 21, testo: "nature, the woods" },
      { n: 8, su: 21, testo: "really switching off" },
      { n: 7, su: 21, testo: "cleanliness" },
      { n: 7, su: 21, testo: "attention to detail" },
      { n: 6, su: 21, testo: "wanting to come back" },
    ],
    nota:
      "The score is the one Airbnb shows on the chalet's page: the average, calculated by Airbnb, of all 53 reviews (scale of 1 to 5), read on 7 October 2026; it may change after this date. We do not collect the reviews: Airbnb collects and publishes them, accepting them from people who stayed after booking on the platform; we do not check individual stays. The themes are our own count on the 21 reviews with a comment published on Airbnb in the last 24 months (from 3 November 2024 to 8 September 2026), excluding none: a review counts if it mentions the theme, positively or negatively. In that period there are two critical remarks: the water temperature, adjusted at once by the hosts, and the spaces, described as small. No review was paid for, solicited or rewarded by us; this page is not affiliated with Airbnb. Translations of the themes are ours.",
  },
  dove: {
    eyebrow: "Where it is",
    titolo: "Raveo, a village of four hundred people in Carnia.",
    testo: [
      "The chalet stands above the village of Raveo, in the Colline Carniche inter-municipal park. You get there by four-wheel drive; without one, you leave the car in the village and go up with the hosts' jeep, or on foot in just over ten minutes.",
    ],
  },
  stagioni: {
    eyebrow: "What to do",
    titolo: "Outside the door, Carnia.",
    testo:
      "Lakes, mountain pastures, wooden villages, trails and slopes: choose the season and set aside what catches your eye. The ideas you add travel with your request for a quote.",
  },
  prenota: {
    eyebrow: "Dates and quote",
    titolo: "When are you coming up?",
    testo: "Tell us how many you are and when you would like to come. We reply with the confirmation and a quote: there is no need to go through other websites.",
  },
  regole: {
    titolo: "Good to know",
    voci: [
      "Access by four-wheel drive or on foot: without a 4x4 you leave the car in the village car park.",
      "Check-in 3 pm to 8 pm, check-out by 10 am.",
      "No pets, no smoking.",
      "There is no washing machine in the flats.",
    ],
  },
  sorella: {
    eyebrow: "A quarter of an hour away",
    titolo: "Top Hill Cottage",
    testo: "For larger groups there is the villa on the knoll of Viaso, which Davide runs: up to twelve guests, the same care.",
  },
};

const DE: TestiPagina = {
  seo: {
    titolo: "Chalet Navauce · Chalet zur Miete in Raveo, Karnien",
    descrizione:
      "Ein Chalet aus Stein und Lärche auf einer Wiese zwischen Wäldern oberhalb von Raveo in Karnien: zwei kleine Wohnungen, bis zu 5 Gäste, Strom aus Solarmodulen. Freie Termine und Angebot.",
  },
  testata: {
    eyebrow: "Raveo · Karnien · Friaul-Julisch Venetien",
    titolo: "Chalet Navauce",
    sottotitolo:
      "Stein und Lärche auf einer Wiese am Waldrand, oberhalb von Raveo. Zwei kleine Wohnungen für wenige Gäste, und nebenan der Hof derer, die es gebaut haben.",
  },
  manifesto: {
    titolo: "Luxus heißt hier Sorgfalt.",
    testo: [
      "Chalet Navauce entstand 2023 neben dem kleinen Bauernhof, den Davide und Alessandra seit 2016 in Raveo führen. Es ist aus sichtbarem Stein und Lärchenholz gebaut, nach dem Vorbild der Stavoli, der alten Heuscheunen Karniens.",
      "Der Strom kommt von Solarmodulen, die nicht ans Netz angeschlossen sind; im Winter heizen Pelletöfen. Ringsum liegt ein Hektar Wiese und Wald am Rand eines Buchenwalds, abseits der Straßen.",
    ],
    fatti: [
      { valore: "2", etichetta: "Wohnungen, zusammen oder einzeln" },
      { valore: "5", etichetta: "Schlafplätze, dazu ein Kinderbett" },
      { valore: "80 m²", etichetta: "insgesamt" },
      { valore: "1 Hektar", etichetta: "Wiese und Wald" },
    ],
  },
  volo: { titolo: "", tappe: [], nota: "" },
  casa: {
    eyebrow: "Das Chalet",
    titolo: "Zwei Wohnungen, eine über der anderen.",
    testo: [
      "Im Erdgeschoss, für zwei: der Wohnbereich mit offener Küche und Doppelschlafsofa, das Bad mit bodengleicher Dusche, die Tür direkt auf die Wiese.",
      "Im ersten Stock, für drei: ein Doppelzimmer und ein kleines Zimmer mit Einzelbett unter den Lärchenbalken, mit Kochnische und Bad. Vermietet werden sie zusammen, für fünf, oder einzeln.",
    ],
  },
  ore: {
    eyebrow: "Das Licht",
    titolo: "Ein Tag auf der Wiese.",
    voci: {
      giorno: "Tagsüber die Wiese, die Zäune, der Wald.",
      oro: "Bei Sonnenuntergang wird die Lärche warm.",
      notte: "Nachts die Sterne über dem Dach.",
    },
    nota: "Tag und Nacht sind echte Fotos. Der Sonnenuntergang ist eine mit KI erzeugte Simulation aus dem Tagesfoto.",
  },
  modi: {
    eyebrow: "Für wen",
    titolo: "Drei Arten, im Chalet zu wohnen.",
    voci: [
      {
        titolo: "Zu zweit, in der Stille",
        testo: "Das Erdgeschoss ist für zwei gemacht: die bodengleiche Dusche, die Wiese gleich vor der Tür, der Wald direkt dahinter.",
      },
      {
        titolo: "Als Familie",
        testo:
          "Oben das kleine Zimmer mit Einzelbett und Kinderbett; draußen die Hängematten, die Tischtennisplatte und, etwas weiter, die Schafe und Ziegen des Hofs.",
      },
      {
        titolo: "Mit Freunden, das ganze Chalet",
        testo: "Beide Wohnungen zusammen bieten fünf Personen Platz. Wenn Sie mehr sind: Top Hill Cottage liegt eine Viertelstunde entfernt.",
      },
    ],
  },
  chiavi: {
    eyebrow: "Wer Sie empfängt",
    titolo: "Davide und Alessandra.",
    testo: [
      "Davide kam aus Triest nach Karnien und hat sein Leben verändert. Mit Alessandra führt er den kleinen Bauernhof neben dem Chalet und empfängt die Gäste persönlich.",
      "Wer keinen Allradwagen hat, kann auf Anfrage mit ihrem Jeep vom Dorf hinauffahren. Und dann die Wege: etwa zwanzig, jeden einzelnen selbst erprobt.",
    ],
    elenco: [
      "Der Jeep für die Fahrt vom Dorf hinauf, auf Anfrage",
      "Morgens Brot und Milch",
      "Eine begleitete Wanderung auf ihren Wegen",
      "Mountainbike-Touren mit Anbietern aus der Gegend",
      "Zeit mit den Schafen und Ziegen",
    ],
    nota: "Von den Gastgebern in ihren Inseraten angegebene Leistungen. Kosten und Konditionen werden mit dem Angebot vereinbart.",
  },
  recensioni: {
    eyebrow: "Die Gäste",
    titolo: "Fast alle sprechen zuerst von den Menschen, die sie empfangen haben.",
    punteggio: "4,96",
    dettaglio: "von 5, der Durchschnitt, den Airbnb aus den 53 Bewertungen des Chalets berechnet. Gelesen am 7. Oktober 2026.",
    temi: [
      { n: 20, su: 21, testo: "der Empfang der Gastgeber" },
      { n: 13, su: 21, testo: "Stille und Ruhe" },
      { n: 11, su: 21, testo: "die Natur, der Wald" },
      { n: 8, su: 21, testo: "wirklich abschalten" },
      { n: 7, su: 21, testo: "die Sauberkeit" },
      { n: 7, su: 21, testo: "die Liebe zum Detail" },
      { n: 6, su: 21, testo: "der Wunsch wiederzukommen" },
    ],
    nota:
      "Die Bewertung ist die, die Airbnb auf der Seite des Chalets anzeigt: der von Airbnb berechnete Durchschnitt aller 53 Bewertungen (Skala 1 bis 5), gelesen am 7. Oktober 2026; sie kann sich danach ändern. Die Bewertungen sammeln nicht wir: Airbnb sammelt und veröffentlicht sie und nimmt sie von Gästen an, die über die Plattform gebucht und dort gewohnt haben; einzelne Aufenthalte prüfen wir nicht. Die Themen sind unsere eigene Zählung über die 21 Bewertungen mit Kommentar, die in den letzten 24 Monaten auf Airbnb veröffentlicht wurden (3. November 2024 bis 8. September 2026), ohne eine auszulassen: Eine Bewertung zählt, wenn sie das Thema nennt, positiv oder negativ. In diesem Zeitraum gibt es zwei kritische Anmerkungen: die Wassertemperatur, von den Gastgebern sofort eingestellt, und die als klein beschriebenen Räume. Keine Bewertung wurde von uns bezahlt, erbeten oder belohnt; diese Seite ist nicht mit Airbnb verbunden. Die Übersetzung der Themen stammt von uns.",
  },
  dove: {
    eyebrow: "Wo es liegt",
    titolo: "Raveo, ein Dorf mit vierhundert Einwohnern in Karnien.",
    testo: [
      "Das Chalet liegt oberhalb des Dorfes Raveo, im interkommunalen Park der Karnischen Hügel (Colline Carniche). Man erreicht es mit dem Geländewagen; ohne lässt man das Auto im Dorf und fährt mit dem Jeep der Gastgeber hinauf, oder geht in gut zehn Minuten zu Fuß.",
    ],
  },
  stagioni: {
    eyebrow: "Was man tun kann",
    titolo: "Vor der Tür: Karnien.",
    testo:
      "Seen, Almen, Holzdörfer, Wege und Pisten: Wählen Sie die Jahreszeit und legen Sie beiseite, was Sie neugierig macht. Die Ideen, die Sie hinzufügen, gehen mit der Angebotsanfrage mit.",
  },
  prenota: {
    eyebrow: "Termine und Angebot",
    titolo: "Wann kommen Sie hinauf?",
    testo:
      "Sagen Sie uns, wie viele Sie sind und wann Sie kommen möchten. Wir antworten mit der Bestätigung und einem Angebot: Andere Websites brauchen Sie dafür nicht.",
  },
  regole: {
    titolo: "Gut zu wissen",
    voci: [
      "Zufahrt mit Allradwagen oder zu Fuß: Ohne 4x4 bleibt das Auto auf dem Parkplatz im Dorf.",
      "Anreise 15 bis 20 Uhr, Abreise bis 10 Uhr.",
      "Keine Haustiere, kein Rauchen.",
      "In den Wohnungen gibt es keine Waschmaschine.",
    ],
  },
  sorella: {
    eyebrow: "Eine Viertelstunde entfernt",
    titolo: "Top Hill Cottage",
    testo: "Für größere Gruppen gibt es die Villa auf der Anhöhe von Viaso, die Davide betreut: bis zu zwölf Gäste, dieselbe Sorgfalt.",
  },
};

const SL: TestiPagina = {
  seo: {
    titolo: "Chalet Navauce · brunarica za najem v Raveu, Karnija",
    descrizione:
      "Brunarica iz kamna in macesna na travniku med gozdovi nad Raveom v Karniji: dve manjši stanovanji, do 5 gostov, elektrika iz sončnih panelov. Prosti termini in ponudba.",
  },
  testata: {
    eyebrow: "Raveo · Karnija · Furlanija - Julijska krajina",
    titolo: "Chalet Navauce",
    sottotitolo:
      "Kamen in macesen na travniku ob robu gozda, nad Raveom. Dve manjši stanovanji za bivanje v manjšem številu, zraven pa kmetija tistih, ki so jo zgradili.",
  },
  manifesto: {
    titolo: "Tukaj je razkošje skrbnost.",
    testo: [
      "Chalet Navauce je nastal leta 2023 ob majhni kmetiji, ki jo Davide in Alessandra v Raveu vodita od leta 2016. Zgrajen je iz vidnega kamna in macesnovega lesa, po zgledu stavolov, starih karnijskih senikov.",
      "Elektrika prihaja iz sončnih panelov, ki niso priključeni na omrežje; pozimi grejejo peči na pelete. Okoli je hektar travnika in gozda ob robu bukovega gozda, stran od cest.",
    ],
    fatti: [
      { valore: "2", etichetta: "stanovanji, skupaj ali ločeno" },
      { valore: "5", etichetta: "ležišč in otroška posteljica" },
      { valore: "80 m²", etichetta: "skupaj" },
      { valore: "1 hektar", etichetta: "travnika in gozda" },
    ],
  },
  volo: { titolo: "", tappe: [], nota: "" },
  casa: {
    eyebrow: "Brunarica",
    titolo: "Dve stanovanji, eno nad drugim.",
    testo: [
      "V pritličju, za dva: dnevni prostor z odprto kuhinjo in zakonskim raztegljivim kavčem, kopalnica s tušem brez stopnice, vrata, ki vodijo na travnik.",
      "V prvem nadstropju, za tri: zakonska soba in sobica z enojno posteljo pod macesnovimi tramovi, s čajno kuhinjo in kopalnico. Oddajata se skupaj, za pet oseb, ali vsako posebej.",
    ],
  },
  ore: {
    eyebrow: "Svetloba",
    titolo: "En dan na travniku.",
    voci: {
      giorno: "Podnevi travnik, ograje, gozd.",
      oro: "Ob sončnem zahodu se macesen ogreje.",
      notte: "Ponoči zvezde nad streho.",
    },
    nota: "Dan in noč sta pravi fotografiji. Sončni zahod je simulacija, ustvarjena z umetno inteligenco iz dnevne fotografije.",
  },
  modi: {
    eyebrow: "Za koga",
    titolo: "Trije načini bivanja v brunarici.",
    voci: [
      {
        titolo: "V dvoje, v tišini",
        testo: "Pritličje je narejeno za dva: tuš brez stopnice, travnik tik pred vrati, gozd takoj zadaj.",
      },
      {
        titolo: "Z družino",
        testo:
          "Zgoraj sobica z enojno posteljo in otroško posteljico; zunaj viseči mreži, namizni tenis in nekoliko dlje ovce in koze s kmetije.",
      },
      {
        titolo: "S prijatelji, vsa brunarica",
        testo: "Obe stanovanji skupaj sprejmeta pet oseb. Če vas je več, je Top Hill Cottage oddaljen četrt ure.",
      },
    ],
  },
  chiavi: {
    eyebrow: "Kdo vas sprejme",
    titolo: "Davide in Alessandra.",
    testo: [
      "Davide je prišel v Karnijo iz Trsta in spremenil življenje. Z Alessandro vodi majhno kmetijo ob brunarici in goste sprejme osebno.",
      "Če nimate terenskega vozila, je na zahtevo na voljo njun džip za vzpon iz vasi. Potem pa poti: okoli dvajset, vsako sta preizkusila sama.",
    ],
    elenco: [
      "Džip za vzpon iz vasi, na zahtevo",
      "Zjutraj kruh in mleko",
      "Voden izlet po njunih poteh",
      "Izleti z gorskim kolesom z lokalnimi organizatorji",
      "Čas z ovcami in kozami",
    ],
    nota: "Storitve, ki jih gostitelja navajata v svojih oglasih. Stroški in pogoji se dogovorijo s ponudbo.",
  },
  recensioni: {
    eyebrow: "Gostje",
    titolo: "Skoraj vsi najprej govorijo o tistih, ki so jih sprejeli.",
    punteggio: "4,96",
    dettaglio: "od 5, povprečje, ki ga Airbnb izračuna iz 53 ocen brunarice. Prebrano 7. oktobra 2026.",
    temi: [
      { n: 20, su: 21, testo: "sprejem gostiteljev" },
      { n: 13, su: 21, testo: "tišina in mir" },
      { n: 11, su: 21, testo: "narava, gozd" },
      { n: 8, su: 21, testo: "res se odklopiti" },
      { n: 7, su: 21, testo: "čistoča" },
      { n: 7, su: 21, testo: "skrb za podrobnosti" },
      { n: 6, su: 21, testo: "želja, da bi se vrnili" },
    ],
    nota:
      "Ocena je tista, ki jo Airbnb prikazuje na strani brunarice: povprečje vseh 53 ocen, ki ga izračuna Airbnb (lestvica od 1 do 5), prebrano 7. oktobra 2026; po tem datumu se lahko spremeni. Ocen ne zbiramo mi: zbira in objavlja jih Airbnb, ki jih sprejema od gostov, ki so bivali po rezervaciji na platformi; posameznih bivanj ne preverjamo. Teme so naše štetje 21 ocen s komentarjem, objavljenih na Airbnb v zadnjih 24 mesecih (od 3. novembra 2024 do 8. septembra 2026), brez izločanja: ocena šteje, če temo omeni, pozitivno ali negativno. V tem obdobju sta kritični pripombi dve: temperatura vode, ki sta jo gostitelja takoj uredila, in prostori, opisani kot majhni. Nobena ocena ni bila plačana, izzvana ali nagrajena z naše strani; ta stran ni povezana z Airbnb. Prevod tem je naš.",
  },
  dove: {
    eyebrow: "Kje je",
    titolo: "Raveo, vas s štiristo prebivalci v Karniji.",
    testo: [
      "Brunarica stoji nad vasjo Raveo, v medobčinskem parku Karnijskih gričev (Colline Carniche). Do nje se pride s terenskim vozilom; brez njega pustite avto v vasi in se povzpnete z džipom gostiteljev ali peš, v dobrih desetih minutah.",
    ],
  },
  stagioni: {
    eyebrow: "Kaj početi",
    titolo: "Pred vrati, Karnija.",
    testo:
      "Jezera, planine, lesene vasi, poti in smučišča: izberite letni čas in si odložite, kar vas pritegne. Ideje, ki jih dodate, gredo s povpraševanjem za ponudbo.",
  },
  prenota: {
    eyebrow: "Termini in ponudba",
    titolo: "Kdaj pridete gor?",
    testo: "Povejte nam, koliko vas je in kdaj bi radi prišli. Odgovorimo s potrditvijo in ponudbo: drugih spletnih strani ne potrebujete.",
  },
  regole: {
    titolo: "Dobro je vedeti",
    voci: [
      "Dostop s terenskim vozilom ali peš: brez vozila 4x4 pustite avto na parkirišču v vasi.",
      "Prihod od 15. do 20. ure, odhod do 10. ure.",
      "Brez živali, brez kajenja.",
      "V stanovanjih ni pralnega stroja.",
    ],
  },
  sorella: {
    eyebrow: "Četrt ure stran",
    titolo: "Top Hill Cottage",
    testo: "Za večje skupine je tu vila na griču v Viasu, ki jo upravlja Davide: do dvanajst gostov, ista skrbnost.",
  },
};

export const TESTI_NAVAUCE: Record<Lingua, TestiPagina> = { it: IT, en: EN, de: DE, sl: SL };
