// I testi d'interfaccia dei soggiorni, nelle quattro lingue (IT/EN/DE/SL).
// Stanno qui e non in messages/*.json: sono lunghi, servono a due pagine sole,
// e il dizionario del sito arriva intero al browser su OGNI pagina
// (friulivillas/RIPRESA, brief del 07/10). Il Record a quattro chiavi obbliga
// il controllo dei tipi a pretendere lo sloveno.
import type { TestiPrenota } from "@/components/affitti/Prenota";
import type { Lingua } from "./case";

type Ui = {
  testata: {
    luci: { giorno: string; oro: string; notte: string };
    adesso: { giorno: string; oro: string; notte: string; notteBuio: string };
    tornaVera: string;
    scegliLuce: string;
    pausa: string;
    riprendi: string;
    cta1: string;
    cta2: string;
  };
  stagioni: {
    nomi: { primavera: string; estate: string; autunno: string; inverno: string };
    aggiungi: string;
    aggiunta: string;
    minuti: string;
    programma: string;
    vaiAlModulo: string;
    scegli: string;
  };
  rosa: { minuti: string; cardinali: [string, string, string, string]; legenda: string };
  galleria: { etichetta: string; chiudi: string; griglia: string; vediTutte: string };
  prenota: TestiPrenota;
  cin: string;
  nonLocatore: string;
  preventivoSuRichiesta: string;
  sorellaVai: string;
  fonti: string;
};

const IT: Ui = {
  testata: {
    luci: { giorno: "Giorno", oro: "Tramonto", notte: "Notte" },
    adesso: {
      giorno: "Adesso lassù è giorno. Il sole tramonta alle {ora}.",
      oro: "Adesso lassù è l'ora d'oro. Tramonto alle {ora}.",
      notte: "Adesso lassù è notte, con la luna al {luna}%. Il sole torna alle {ora}.",
      notteBuio: "Adesso lassù è notte senza luna: il buio delle stelle. Il sole torna alle {ora}.",
    },
    tornaVera: "Torna alla luce di adesso",
    scegliLuce: "Scegli la luce",
    pausa: "Ferma il video",
    riprendi: "Riprendi il video",
    cta1: "Date libere e preventivo",
    cta2: "Scopri la casa",
  },
  stagioni: {
    nomi: { primavera: "Primavera", estate: "Estate", autunno: "Autunno", inverno: "Inverno" },
    aggiungi: "Aggiungi al mio soggiorno",
    aggiunta: "Nel mio soggiorno",
    minuti: "{n} min",
    programma: "Il tuo soggiorno: {n} idee",
    vaiAlModulo: "Chiedi il preventivo",
    scegli: "Scegli la stagione",
  },
  rosa: {
    minuti: "{n} min",
    cardinali: ["N", "E", "S", "O"],
    legenda:
      "Minuti d'auto dalla casa, senza traffico (OSRM, misurati il 7 ottobre 2026). Ogni luogo sta nella sua direzione vera.",
  },
  galleria: {
    etichetta: "Le foto della casa",
    chiudi: "Chiudi",
    griglia: "Tutte le foto",
    vediTutte: "Vedi tutte le foto",
  },
  prenota: {
    titolo: "Date libere e preventivo",
    intro: "",
    persone: "Quanti siete",
    adulti: "Adulti",
    bambini: "Bambini",
    animali: "Viaggiamo con un animale",
    date: "Le date",
    arrivo: "Arrivo",
    partenza: "Partenza",
    scegliArrivo: "Scegliete il giorno d'arrivo",
    scegliPartenza: "Ora la partenza",
    minimo: "minimo {n} notti",
    notti: "{n} notti",
    legendaLibero: "si può arrivare",
    legendaOccupato: "non disponibile",
    aggiornato:
      "Disponibilità indicativa, aggiornata alle {ora} del {data} (ora italiana). La conferma arriva con il preventivo.",
    suRichiesta:
      "Il calendario in questo momento non è disponibile: indicate le date che preferite, vi rispondiamo con disponibilità e preventivo.",
    suRichiestaPersone:
      "Per gruppi oltre i {n} ospiti le date si verificano a mano: indicate quelle che preferite, vi rispondiamo con disponibilità e preventivo.",
    oltreOrizzonte: "Dopo il {data} le date non sono ancora in calendario: si chiedono.",
    mesePrec: "Mese precedente",
    meseSucc: "Mese successivo",
    ricomincia: "Ricomincia",
    tipo: "Che soggiorno è",
    tipi: { natura: "Vacanza nella natura", ritiro: "Ritiro aziendale o meeting", famiglia: "Famiglia o amici", altro: "Altro" },
    servizi: "Servizi che vi interessano",
    serviziNota: "Su richiesta, da concordare: li dichiara la struttura. Prezzi nel preventivo.",
    programma: "Il vostro programma",
    programmaVuoto: "Scorrendo le stagioni potete aggiungere qui le esperienze che vi incuriosiscono.",
    togli: "Togli",
    entrambe: "Siamo un gruppo: proponeteci anche {casa}",
    nome: "Nome e cognome",
    email: "Email",
    telefono: "Telefono",
    contattoNota: "Basta l'email o il telefono.",
    messaggio: "Messaggio",
    messaggioPh: "Un'occasione da festeggiare, un orario d'arrivo, una domanda…",
    privacy:
      "Ho letto l'{link} e acconsento a essere ricontattato. La richiesta può essere girata a chi gestisce la casa, perché risponda direttamente.",
    privacyLink: "informativa privacy",
    invia: "Chiedi il preventivo per {casa}",
    invio: "Invio…",
    grazieTitolo: "Richiesta ricevuta.",
    grazieTesto:
      "Vi rispondiamo con le date confermate, le condizioni e il preventivo. Se avete lasciato l'email, trovate lì il riepilogo.",
    errore: "La richiesta non è partita. Riprovate tra poco, oppure scrivete a richieste@triestevillas.com.",
    errori: {
      casa: "Scegliete la casa.",
      date: "Controllate le date: la partenza deve venire dopo l'arrivo.",
      date_passate: "L'arrivo è nel passato.",
      notti: "Per soggiorni oltre i 60 giorni scriveteci direttamente.",
      ospiti: "Indicate almeno un adulto.",
      ospiti_max: "Siete più degli ospiti che la casa accoglie.",
      nome: "Scrivete il vostro nome.",
      contatto: "Serve un'email valida o un numero di telefono.",
      privacy: "Serve il consenso per potervi rispondere.",
      tipo: "Scegliete il tipo di soggiorno.",
    },
  },
  cin: "CIN (Codice Identificativo Nazionale)",
  nonLocatore:
    "Pagina pubblicata gratuitamente da TriesteVillas srl (P.IVA 01235580329) con il marchio FriuliVillas. TriesteVillas non è locatore né gestore della casa e non incassa pagamenti. Disponibilità, prezzo e condizioni li conferma il proprietario o il gestore, con cui si conclude l'eventuale contratto. Le date libere mostrate sono indicative.",
  preventivoSuRichiesta: "Preventivo su richiesta",
  sorellaVai: "Scopri",
  fonti: "Da dove vengono questi dati",
};

const EN: Ui = {
  testata: {
    luci: { giorno: "Day", oro: "Sunset", notte: "Night" },
    adesso: {
      giorno: "Up there it is daytime right now. The sun sets at {ora}.",
      oro: "Up there it is golden hour right now. Sunset at {ora}.",
      notte: "Up there it is night right now, with the moon {luna}% full. The sun is back at {ora}.",
      notteBuio: "Up there it is a moonless night right now: the dark of the stars. The sun is back at {ora}.",
    },
    tornaVera: "Back to the light of now",
    scegliLuce: "Choose the light",
    pausa: "Pause the video",
    riprendi: "Play the video",
    cta1: "Free dates and a quote",
    cta2: "Discover the house",
  },
  stagioni: {
    nomi: { primavera: "Spring", estate: "Summer", autunno: "Autumn", inverno: "Winter" },
    aggiungi: "Add to my stay",
    aggiunta: "In my stay",
    minuti: "{n} min",
    programma: "Your stay: {n} ideas",
    vaiAlModulo: "Ask for a quote",
    scegli: "Choose the season",
  },
  rosa: {
    minuti: "{n} min",
    cardinali: ["N", "E", "S", "W"],
    legenda:
      "Minutes by car from the house, without traffic (OSRM, measured on 7 October 2026). Every place sits in its true direction.",
  },
  galleria: { etichetta: "Photos of the house", chiudi: "Close", griglia: "All photos", vediTutte: "See all photos" },
  prenota: {
    titolo: "Free dates and a quote",
    intro: "",
    persone: "How many of you",
    adulti: "Adults",
    bambini: "Children",
    animali: "We travel with a pet",
    date: "Dates",
    arrivo: "Arrival",
    partenza: "Departure",
    scegliArrivo: "Choose your arrival day",
    scegliPartenza: "Now your departure",
    minimo: "minimum {n} nights",
    notti: "{n} nights",
    legendaLibero: "arrival possible",
    legendaOccupato: "not available",
    aggiornato:
      "Indicative availability, updated at {ora} on {data} (Italian time). Confirmation comes with the quote.",
    suRichiesta:
      "The calendar is not available right now: tell us the dates you would like and we will reply with availability and a quote.",
    suRichiestaPersone:
      "For groups of more than {n} guests dates are checked by hand: tell us the dates you would like and we will reply with availability and a quote.",
    oltreOrizzonte: "After {data} the dates are not in the calendar yet: just ask.",
    mesePrec: "Previous month",
    meseSucc: "Next month",
    ricomincia: "Start again",
    tipo: "What kind of stay",
    tipi: { natura: "A holiday in nature", ritiro: "Company retreat or meeting", famiglia: "Family or friends", altro: "Other" },
    servizi: "Services you are interested in",
    serviziNota: "On request, to be agreed: as declared by the house. Prices come with the quote.",
    programma: "Your programme",
    programmaVuoto: "As you browse the seasons you can add here the experiences that catch your eye.",
    togli: "Remove",
    entrambe: "We are a group: suggest {casa} as well",
    nome: "Full name",
    email: "Email",
    telefono: "Phone",
    contattoNota: "Email or phone is enough.",
    messaggio: "Message",
    messaggioPh: "Something to celebrate, an arrival time, a question…",
    privacy:
      "I have read the {link} and agree to be contacted. The request may be passed on to the people who run the house, so that they can reply directly.",
    privacyLink: "privacy notice",
    invia: "Ask for a quote for {casa}",
    invio: "Sending…",
    grazieTitolo: "Request received.",
    grazieTesto:
      "We will reply with confirmed dates, terms and a quote. If you left your email, you will find a summary there.",
    errore: "The request did not go through. Please try again shortly, or write to richieste@triestevillas.com.",
    errori: {
      casa: "Choose the house.",
      date: "Check the dates: departure must come after arrival.",
      date_passate: "The arrival date is in the past.",
      notti: "For stays longer than 60 days please write to us directly.",
      ospiti: "Add at least one adult.",
      ospiti_max: "You are more than the guests the house can host.",
      nome: "Please write your name.",
      contatto: "We need a valid email or a phone number.",
      privacy: "We need your consent to reply.",
      tipo: "Choose the kind of stay.",
    },
  },
  cin: "CIN (Italian national identification code)",
  nonLocatore:
    "Page published free of charge by TriesteVillas srl (VAT IT01235580329) under the FriuliVillas brand. TriesteVillas is neither the landlord nor the manager of the house and takes no payments. Availability, price and terms are confirmed by the owner or the manager, with whom any contract is made. The free dates shown are indicative.",
  preventivoSuRichiesta: "Quote on request",
  sorellaVai: "Discover",
  fonti: "Where these data come from",
};

const DE: Ui = {
  testata: {
    luci: { giorno: "Tag", oro: "Sonnenuntergang", notte: "Nacht" },
    adesso: {
      giorno: "Dort oben ist es gerade Tag. Die Sonne geht um {ora} unter.",
      oro: "Dort oben ist gerade die goldene Stunde. Sonnenuntergang um {ora}.",
      notte: "Dort oben ist es gerade Nacht, der Mond ist zu {luna} % beleuchtet. Die Sonne kommt um {ora} zurück.",
      notteBuio: "Dort oben ist es gerade eine mondlose Nacht: das Dunkel der Sterne. Die Sonne kommt um {ora} zurück.",
    },
    tornaVera: "Zurück zum Licht von jetzt",
    scegliLuce: "Licht wählen",
    pausa: "Video anhalten",
    riprendi: "Video abspielen",
    cta1: "Freie Termine und Angebot",
    cta2: "Das Haus entdecken",
  },
  stagioni: {
    nomi: { primavera: "Frühling", estate: "Sommer", autunno: "Herbst", inverno: "Winter" },
    aggiungi: "Zu meinem Aufenthalt",
    aggiunta: "In meinem Aufenthalt",
    minuti: "{n} Min.",
    programma: "Ihr Aufenthalt: {n} Ideen",
    vaiAlModulo: "Angebot anfragen",
    scegli: "Jahreszeit wählen",
  },
  rosa: {
    minuti: "{n} Min.",
    cardinali: ["N", "O", "S", "W"],
    legenda:
      "Minuten mit dem Auto vom Haus, ohne Verkehr (OSRM, gemessen am 7. Oktober 2026). Jeder Ort steht in seiner wahren Richtung.",
  },
  galleria: { etichetta: "Fotos des Hauses", chiudi: "Schließen", griglia: "Alle Fotos", vediTutte: "Alle Fotos ansehen" },
  prenota: {
    titolo: "Freie Termine und Angebot",
    intro: "",
    persone: "Wie viele Personen",
    adulti: "Erwachsene",
    bambini: "Kinder",
    animali: "Wir reisen mit einem Haustier",
    date: "Termine",
    arrivo: "Anreise",
    partenza: "Abreise",
    scegliArrivo: "Wählen Sie den Anreisetag",
    scegliPartenza: "Jetzt die Abreise",
    minimo: "mindestens {n} Nächte",
    notti: "{n} Nächte",
    legendaLibero: "Anreise möglich",
    legendaOccupato: "nicht verfügbar",
    aggiornato:
      "Unverbindliche Verfügbarkeit, aktualisiert um {ora} am {data} (italienische Zeit). Die Bestätigung kommt mit dem Angebot.",
    suRichiesta:
      "Der Kalender ist gerade nicht verfügbar: Nennen Sie uns Ihre Wunschtermine, wir antworten mit Verfügbarkeit und Angebot.",
    suRichiestaPersone:
      "Für Gruppen über {n} Gäste prüfen wir die Termine von Hand: Nennen Sie uns Ihre Wunschtermine, wir antworten mit Verfügbarkeit und Angebot.",
    oltreOrizzonte: "Nach dem {data} sind die Termine noch nicht im Kalender: einfach anfragen.",
    mesePrec: "Vorheriger Monat",
    meseSucc: "Nächster Monat",
    ricomincia: "Neu beginnen",
    tipo: "Art des Aufenthalts",
    tipi: { natura: "Urlaub in der Natur", ritiro: "Firmen-Retreat oder Meeting", famiglia: "Familie oder Freunde", altro: "Sonstiges" },
    servizi: "Leistungen, die Sie interessieren",
    serviziNota: "Auf Anfrage, nach Absprache: so vom Haus angegeben. Preise im Angebot.",
    programma: "Ihr Programm",
    programmaVuoto: "Beim Durchblättern der Jahreszeiten können Sie hier die Erlebnisse sammeln, die Sie neugierig machen.",
    togli: "Entfernen",
    entrambe: "Wir sind eine Gruppe: schlagen Sie uns auch {casa} vor",
    nome: "Vor- und Nachname",
    email: "E-Mail",
    telefono: "Telefon",
    contattoNota: "E-Mail oder Telefon genügt.",
    messaggio: "Nachricht",
    messaggioPh: "Ein Anlass zum Feiern, eine Ankunftszeit, eine Frage…",
    privacy:
      "Ich habe die {link} gelesen und bin mit einer Kontaktaufnahme einverstanden. Die Anfrage kann an die Verwalter des Hauses weitergegeben werden, damit diese direkt antworten.",
    privacyLink: "Datenschutzerklärung",
    invia: "Angebot für {casa} anfragen",
    invio: "Wird gesendet…",
    grazieTitolo: "Anfrage erhalten.",
    grazieTesto:
      "Wir antworten mit bestätigten Terminen, Konditionen und Angebot. Wenn Sie Ihre E-Mail angegeben haben, finden Sie dort eine Zusammenfassung.",
    errore: "Die Anfrage wurde nicht gesendet. Bitte versuchen Sie es gleich noch einmal oder schreiben Sie an richieste@triestevillas.com.",
    errori: {
      casa: "Wählen Sie das Haus.",
      date: "Prüfen Sie die Termine: Die Abreise muss nach der Anreise liegen.",
      date_passate: "Die Anreise liegt in der Vergangenheit.",
      notti: "Für Aufenthalte über 60 Tage schreiben Sie uns bitte direkt.",
      ospiti: "Geben Sie mindestens einen Erwachsenen an.",
      ospiti_max: "Sie sind mehr Personen, als das Haus aufnimmt.",
      nome: "Bitte geben Sie Ihren Namen an.",
      contatto: "Wir brauchen eine gültige E-Mail oder eine Telefonnummer.",
      privacy: "Wir brauchen Ihre Einwilligung, um zu antworten.",
      tipo: "Wählen Sie die Art des Aufenthalts.",
    },
  },
  cin: "CIN (italienische nationale Identifikationsnummer)",
  nonLocatore:
    "Diese Seite veröffentlicht die TriesteVillas srl (USt-IdNr. IT01235580329) kostenlos unter der Marke FriuliVillas. TriesteVillas ist weder Vermieter noch Verwalter des Hauses und nimmt keine Zahlungen entgegen. Verfügbarkeit, Preis und Konditionen bestätigt der Eigentümer oder Verwalter, mit dem auch ein eventueller Vertrag geschlossen wird. Die angezeigten freien Termine sind unverbindlich.",
  preventivoSuRichiesta: "Angebot auf Anfrage",
  sorellaVai: "Entdecken",
  fonti: "Woher diese Angaben stammen",
};

const SL: Ui = {
  testata: {
    luci: { giorno: "Dan", oro: "Sončni zahod", notte: "Noč" },
    adesso: {
      giorno: "Tam zgoraj je zdaj dan. Sonce zaide ob {ora}.",
      oro: "Tam zgoraj je zdaj zlata ura. Sončni zahod ob {ora}.",
      notte: "Tam zgoraj je zdaj noč, luna je osvetljena {luna} %. Sonce se vrne ob {ora}.",
      notteBuio: "Tam zgoraj je zdaj noč brez lune: tema zvezd. Sonce se vrne ob {ora}.",
    },
    tornaVera: "Nazaj na svetlobo zdaj",
    scegliLuce: "Izberite svetlobo",
    pausa: "Ustavi video",
    riprendi: "Predvajaj video",
    cta1: "Prosti termini in ponudba",
    cta2: "Odkrijte hišo",
  },
  stagioni: {
    nomi: { primavera: "Pomlad", estate: "Poletje", autunno: "Jesen", inverno: "Zima" },
    aggiungi: "Dodaj k mojemu bivanju",
    aggiunta: "V mojem bivanju",
    minuti: "{n} min",
    programma: "Vaše bivanje: {n} idej",
    vaiAlModulo: "Zahtevajte ponudbo",
    scegli: "Izberite letni čas",
  },
  rosa: {
    minuti: "{n} min",
    cardinali: ["S", "V", "J", "Z"],
    legenda:
      "Minute z avtom od hiše, brez prometa (OSRM, izmerjeno 7. oktobra 2026). Vsak kraj je v svoji pravi smeri.",
  },
  galleria: { etichetta: "Fotografije hiše", chiudi: "Zapri", griglia: "Vse fotografije", vediTutte: "Poglejte vse fotografije" },
  prenota: {
    titolo: "Prosti termini in ponudba",
    intro: "",
    persone: "Koliko vas je",
    adulti: "Odrasli",
    bambini: "Otroci",
    animali: "Potujemo z hišnim ljubljenčkom",
    date: "Termini",
    arrivo: "Prihod",
    partenza: "Odhod",
    scegliArrivo: "Izberite dan prihoda",
    scegliPartenza: "Zdaj še odhod",
    minimo: "najmanj {n} noči",
    notti: "noči: {n}",
    legendaLibero: "prihod je mogoč",
    legendaOccupato: "ni na voljo",
    aggiornato:
      "Okvirna razpoložljivost, posodobljena ob {ora}, {data} (italijanski čas). Potrditev pride s ponudbo.",
    suRichiesta:
      "Koledar trenutno ni na voljo: navedite želene termine in odgovorili vam bomo z razpoložljivostjo in ponudbo.",
    suRichiestaPersone:
      "Za skupine z več kot {n} gosti termine preverimo ročno: navedite želene termine in odgovorili vam bomo z razpoložljivostjo in ponudbo.",
    oltreOrizzonte: "Po {data} termini še niso v koledarju: vprašajte nas.",
    mesePrec: "Prejšnji mesec",
    meseSucc: "Naslednji mesec",
    ricomincia: "Začni znova",
    tipo: "Vrsta bivanja",
    tipi: { natura: "Počitnice v naravi", ritiro: "Podjetniški umik ali srečanje", famiglia: "Družina ali prijatelji", altro: "Drugo" },
    servizi: "Storitve, ki vas zanimajo",
    serviziNota: "Na zahtevo, po dogovoru: tako jih navaja hiša. Cene v ponudbi.",
    programma: "Vaš program",
    programmaVuoto: "Med brskanjem po letnih časih lahko sem dodate doživetja, ki vas pritegnejo.",
    togli: "Odstrani",
    entrambe: "Smo skupina: predlagajte nam tudi {casa}",
    nome: "Ime in priimek",
    email: "E-pošta",
    telefono: "Telefon",
    contattoNota: "Dovolj je e-pošta ali telefon.",
    messaggio: "Sporočilo",
    messaggioPh: "Priložnost za praznovanje, ura prihoda, vprašanje…",
    privacy:
      "Prebral(a) sem {link} in se strinjam, da me kontaktirate. Povpraševanje lahko posredujemo tistim, ki hišo upravljajo, da vam odgovorijo neposredno.",
    privacyLink: "obvestilo o zasebnosti",
    invia: "Zahtevajte ponudbo za {casa}",
    invio: "Pošiljanje…",
    grazieTitolo: "Povpraševanje smo prejeli.",
    grazieTesto:
      "Odgovorili vam bomo s potrjenimi termini, pogoji in ponudbo. Če ste pustili e-pošto, boste tam našli povzetek. Odgovarjamo v italijanščini, angleščini ali nemščini.",
    errore: "Povpraševanje ni bilo poslano. Poskusite znova čez nekaj trenutkov ali pišite na richieste@triestevillas.com.",
    errori: {
      casa: "Izberite hišo.",
      date: "Preverite termine: odhod mora biti po prihodu.",
      date_passate: "Datum prihoda je v preteklosti.",
      notti: "Za bivanja, daljša od 60 dni, nam pišite neposredno.",
      ospiti: "Navedite vsaj eno odraslo osebo.",
      ospiti_max: "Vas je več, kot je gostov, ki jih hiša sprejme.",
      nome: "Napišite svoje ime.",
      contatto: "Potrebujemo veljaven e-poštni naslov ali telefonsko številko.",
      privacy: "Za odgovor potrebujemo vašo privolitev.",
      tipo: "Izberite vrsto bivanja.",
    },
  },
  cin: "CIN (italijanska nacionalna identifikacijska koda)",
  nonLocatore:
    "Stran brezplačno objavlja TriesteVillas srl (ID za DDV IT01235580329) pod blagovno znamko FriuliVillas. TriesteVillas ni najemodajalec ne upravljavec hiše in ne prejema plačil. Razpoložljivost, ceno in pogoje potrdi lastnik ali upravljavec, s katerim se sklene morebitna pogodba. Prikazani prosti termini so okvirni.",
  preventivoSuRichiesta: "Ponudba na zahtevo",
  sorellaVai: "Odkrijte",
  fonti: "Od kod so ti podatki",
};

export const UI: Record<Lingua, Ui> = { it: IT, en: EN, de: DE, sl: SL };
