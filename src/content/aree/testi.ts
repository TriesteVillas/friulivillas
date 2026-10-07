import type { AreaId, Lingua } from "@/lib/aree";

/* ================================================================
   I testi delle quattro pagine d'area di friulivillas.com (07/10/2026).

   FONTI (abbreviate nei commenti `// fonte:`):
   - GEO      = tsv-kb progetti/friulivillas/territorio/GEOGRAFIA-AREE.md (§ = sezione; §11 errata vince)
   - COMUNI   = data/geo/comuni-fvg.csv (ISTAT SITUAS rep. 61/73/74 al 07/10/2026; residenti 2024;
                superficie 2026; quota del municipio; alt_max = DEM ISTAT 31/12/2021; nomi Wikidata)
   - AREE-C   = data/geo/aree-comuni.csv (regola, ambito PPR e quota, S4, S5, L.R. 33/2002, comunità, DOC)
   - T-AREE   = data/geo/tempi-aree.csv, schema S4 (mediana, min, max in minuti; OSRM, senza traffico, 07/10/2026)
   - T-OSRM   = data/geo/tempi-osrm.csv (coppia origine→municipio, minuti arrotondati all'intero)
   - NOMI     = ~/.tsv-work/FV-RIFACIMENTO/geo/nomi/nomi.md (esonimi SL/DE con fonte: Statuto SL, elenco
                regionale comuni di lingua slovena, sl/de.wikipedia)
   - aree.ts  = src/lib/aree.ts (SOGLIA_COSTA_KM = 4)
   - UNESCO   = en.wikipedia «List of World Heritage Sites in Italy» (righe con anno di iscrizione e id WHC:
                825 Aquileia 1998 · 1318 Longobardi/Cividale 2011 · 1237 Dolomiti 2009 · 1533 Opere di difesa
                veneziane/Palmanova 2017); whc.unesco.org/en/list/<id> è dietro Cloudflare, non letto.
   Calcoli (somme, quote, densità, mediane vere) rifatti con python su COMUNI e AREE-C il 07/10/2026.
   Tempi: minuto misurato, sempre «circa» / «senza traffico». Le case NON si nominano: le mette la pagina.
   ================================================================ */

export type TestoArea = {
  titleSeo: string; // ≤ 60 caratteri, senza il marchio (lo aggiunge il template)
  descriptionSeo: string; // 140–160 caratteri
  h1: string;
  sottotitolo: string; // una riga
  intro: string[]; // 2–3 paragrafi
  paesaggi: { nome: string; testo: string }[]; // 3–5 sotto-paesaggi dell'area
  confine: string; // come è tracciato il confine dell'area
  senzaCase: string; // frase onesta se oggi non ci sono case in vendita nell'area
  faq: { q: string; a: string }[]; // 3–4 domande vere di un compratore
};

export const TESTI_AREE: Record<AreaId, Record<Lingua, TestoArea>> = {
  /* ==============================================================
     COSTA E LAGUNA — 9 comuni
     fonte: AREE-C (S4 = costa-laguna): Aquileia, Grado, Latisana, Lignano Sabbiadoro, Marano Lagunare,
     Monfalcone, San Canzian d'Isonzo, Staranzano, Terzo d'Aquileia. COMUNI: 78.626 residenti 2024,
     398,7 km² (5,0% della regione), municipi fra 4 e 13 m. Litoranei ISTAT: 5 (Lignano, Marano, Grado,
     Staranzano, Monfalcone). T-AREE: Trieste 55 (33 Monfalcone–83 Lignano), Udine 43, aer. Trieste 20
     (8 San Canzian–59 Lignano), aer. Venezia 80 (58 Latisana–97 Grado), Lubiana 101, Monaco 313, Vienna 339.
     Distanze dei centri dalla costa: GEO §8 (Latisana 14,9 · Aquileia 9,0 · Terzo 11,5 · San Canzian 7,0 km).
     ============================================================== */
  "costa-laguna": {
    it: {
      titleSeo: "Costa e laguna del Friuli: Lignano, Grado, Aquileia", // fonte: G2 §3 rivisto (toponimi, nessuna «casa a»)
      descriptionSeo:
        "Nove comuni fra Lignano e Monfalcone: la laguna di Marano e Grado, Aquileia, la bassa dell'Isonzo. Tempi in auto misurati e come abbiamo tracciato l'area.",
      h1: "Costa e laguna: nove comuni fra Lignano e Monfalcone", // fonte: G2 §3; AREE-C 9 comuni
      sottotitolo: "Il mare aperto, la laguna di Marano e Grado e i paesi che le stanno alle spalle.",
      intro: [
        // fonte: COMUNI (somma residenti 2024 e superficie, quota municipi); AREE-C (litoranei, quote PPR)
        "Costa e laguna riunisce nove comuni: circa 399 km², il 5% del territorio regionale, e 78.626 residenti nel 2024. Cinque toccano il mare aperto secondo l'ISTAT: Lignano Sabbiadoro, Marano Lagunare, Grado, Staranzano e Monfalcone. Gli altri quattro, Latisana, Aquileia, Terzo d'Aquileia e San Canzian d'Isonzo, hanno la maggior parte del territorio nell'ambito «Laguna e costa» del Piano paesaggistico regionale, ma il centro qualche chilometro all'interno.",
        // fonte: COMUNI (altitudine_municipio_m 4–13; pop_residente Monfalcone 30.360, Grado 7.532, Lignano 6.888)
        "È una terra piatta: tutte le sedi municipali stanno fra 4 e 13 metri sul livello del mare. Il centro più popoloso è Monfalcone, con 30.360 abitanti; Grado ne conta 7.532 e Lignano 6.888.",
        // fonte: T-AREE costa-laguna (aer_trieste 20/8/59; trieste 55; udine 43; aer_venezia 80; monaco 313; vienna 339)
        "La porta d'ingresso è l'aeroporto di Trieste, a Ronchi dei Legionari: in auto e senza traffico i municipi dell'area sono a una mediana di 20 minuti dal terminal, da 8 minuti per San Canzian d'Isonzo a 59 per Lignano. Da Piazza Unità a Trieste la mediana è di circa 55 minuti, da Udine di 43, dall'aeroporto di Venezia di 1 ora e 20. Da Monaco e da Vienna servono più di cinque ore.",
      ],
      paesaggi: [
        {
          nome: "Lignano e la Riviera friulana",
          // fonte: COMUNI (lon: Lignano è il più occidentale degli 8 comuni litoranei); AREE-C (Comunità Riviera Friulana; Latisana ppr_quota 0,697); GEO §8 (14,9 km)
          testo:
            "Lignano Sabbiadoro è il più occidentale dei comuni costieri della regione. Con Latisana e Marano Lagunare fa parte della Comunità Riviera Friulana. Latisana ha il centro a 14,9 km dalla linea di costa, ma il 70% del suo territorio sta nell'ambito di paesaggio della laguna.",
        },
        {
          nome: "La laguna di Marano e Grado",
          // fonte: AREE-C (Marano e Grado: AP 12 al 100%, litoranei); COMUNI (pop. Marano 1.674); T-OSRM (Grado da aer_trieste 34, da Udine 57)
          testo:
            "Marano Lagunare e Grado sono interamente nell'ambito «Laguna e costa». Marano è un paese di 1.674 abitanti affacciato sulla laguna; Grado sta fra la laguna e il mare aperto, a circa 34 minuti dall'aeroporto di Trieste e 57 da Udine.",
        },
        {
          nome: "Aquileia e Terzo d'Aquileia",
          // fonte: UNESCO id 825 (1998); GEO §8 (9,0 e 11,5 km); AREE-C (ppr_quota 0,717 e 0,628); T-OSRM (Aquileia da aer_trieste 20)
          testo:
            "L'area archeologica e la basilica patriarcale di Aquileia sono nella lista del patrimonio mondiale UNESCO dal 1998. Il centro di Aquileia è a 9 km dalla linea di costa, quello di Terzo a 11,5: entrambi rientrano nell'area perché il 72% e il 63% del loro territorio è laguna e costa. Aquileia è a circa 20 minuti dall'aeroporto.",
        },
        {
          nome: "Monfalcone e la bassa dell'Isonzo",
          // fonte: AREE-C (DOC Friuli Isonzo parte; Monfalcone DOC Carso parte); T-AREE (San Canzian 8); T-OSRM (Monfalcone aer_trieste 11, Trieste 33)
          testo:
            "Monfalcone, Staranzano e San Canzian d'Isonzo chiudono l'area a est, dove la bassa dell'Isonzo incontra il Carso. Sono i comuni più vicini all'aeroporto di Trieste, San Canzian a 8 minuti e Monfalcone a 11, e Monfalcone è a circa 33 minuti da Piazza Unità.",
        },
      ],
      // fonte: GEO §3 (R1→R2→R3, prima regola che vale); GEO §8 (Duino 93%, Muggia 100% AP 11; distanze dei centri); aree.ts SOGLIA_COSTA_KM = 4
      confine:
        "Un comune entra in Costa e laguna se il Piano paesaggistico regionale del 2018 mette la maggior parte del suo territorio nell'ambito «Laguna e costa», oppure se l'ISTAT lo classifica come litoraneo. Prima, però, si assegnano la montagna e il Carso: per questo Duino Aurisina, Muggia e Trieste, che pure sono sul mare, stanno nell'area Trieste e Carso. Il caso limite è l'entroterra della laguna: Latisana, Aquileia, Terzo d'Aquileia e San Canzian d'Isonzo sono dentro per superficie, anche se il loro centro è fra 7 e 15 km dalla costa. Per questo una casa di quest'area che si trova a più di 4 km dalla linea di costa ISTAT la mostriamo in Colline e pianura.",
      senzaCase:
        "In questo momento non abbiamo case in vendita in Costa e laguna: scriveteci che cosa cercate e vi diremo con franchezza se possiamo aiutarvi.",
      faq: [
        {
          q: "Quanto dista la costa dall'aeroporto di Trieste?",
          // fonte: T-AREE costa-laguna aer_trieste e aer_venezia
          a: "In auto e senza traffico la mediana dei nove municipi è di 20 minuti: da 8 per San Canzian d'Isonzo a 59 per Lignano Sabbiadoro. Dall'aeroporto di Venezia la mediana sale a 1 ora e 20, con Latisana a 58 minuti. Sono misure del 7 ottobre 2026.",
        },
        {
          q: "Aquileia e Latisana sono sul mare?",
          // fonte: GEO §8
          a: "No: i loro centri sono a 9 e a 14,9 km dalla linea di costa. Stanno in quest'area perché la maggior parte del loro territorio fa parte dell'ambito paesaggistico della laguna.",
        },
        {
          q: "Perché Duino e Muggia non sono in Costa e laguna?",
          // fonte: GEO §8
          a: "Perché il Piano paesaggistico li assegna all'ambito del Carso e della costiera orientale. Hanno il mare, ma un paesaggio di Carso, diverso da quello della laguna: li trovate nell'area Trieste e Carso.",
        },
        {
          q: "Quanto ci vuole da Monaco o da Vienna?",
          // fonte: T-AREE costa-laguna monaco 313, vienna 339; GEO §7 (tempi ottimisti, code estive non contate)
          a: "Come mediana dei nove comuni, circa 5 ore e 13 minuti da Monaco e 5 ore e 39 da Vienna, in auto e senza traffico né attese al confine. Nei fine settimana d'estate i tempi reali possono essere sensibilmente più lunghi.",
        },
      ],
    },
    en: {
      titleSeo: "Friuli coast & lagoon: Lignano, Grado, Aquileia",
      descriptionSeo:
        "Nine municipalities from Lignano to Monfalcone: the Marano and Grado lagoon, Aquileia, the lower Isonzo. Measured driving times and how the area is drawn.",
      h1: "Coast & Lagoon: nine municipalities from Lignano to Monfalcone", // fonte: G2 §3
      sottotitolo: "The open sea, the Marano and Grado lagoon, and the towns just inland.",
      intro: [
        // fonte: COMUNI; AREE-C (vedi blocco IT)
        "Coast & Lagoon brings together nine municipalities: about 399 km², 5% of the region, with 78,626 residents in 2024. Five of them face the open sea according to ISTAT, Italy's statistics office: Lignano Sabbiadoro, Marano Lagunare, Grado, Staranzano and Monfalcone. The other four, Latisana, Aquileia, Terzo d'Aquileia and San Canzian d'Isonzo, have most of their land in the regional landscape plan's ‘Lagoon and coast’ zone, but their town centres lie a few kilometres inland.",
        // fonte: COMUNI (altitudine_municipio_m; pop_residente)
        "This is flat country: every town hall sits between 4 and 13 metres above sea level. The largest town is Monfalcone, with 30,360 inhabitants; Grado has 7,532 and Lignano 6,888.",
        // fonte: T-AREE costa-laguna
        "The natural gateway is Trieste Airport at Ronchi dei Legionari. Driving without traffic, the area's town halls are a median 20 minutes from the terminal, ranging from 8 minutes for San Canzian d'Isonzo to 59 for Lignano. From Piazza Unità in Trieste the median is about 55 minutes, from Udine 43, from Venice airport 1 hour 20 minutes. From Munich or Vienna, allow more than five hours.",
      ],
      paesaggi: [
        {
          nome: "Lignano and the Friulian Riviera",
          // fonte: COMUNI (lon); AREE-C (comunità; quota PPR 0,697); GEO §8
          testo:
            "Lignano Sabbiadoro is the westernmost coastal municipality in the region. Together with Latisana and Marano Lagunare it belongs to the Riviera Friulana community of municipalities. Latisana's centre is 14.9 km from the shoreline, yet 70% of its land lies within the lagoon landscape zone.",
        },
        {
          nome: "The Marano and Grado lagoon",
          // fonte: AREE-C; COMUNI; T-OSRM
          testo:
            "Marano Lagunare and Grado lie entirely within the lagoon and coast zone. Marano is a village of 1,674 people on the lagoon; Grado sits between the lagoon and the open sea, about 34 minutes from Trieste Airport and 57 from Udine.",
        },
        {
          nome: "Aquileia and Terzo d'Aquileia",
          // fonte: UNESCO id 825; GEO §8; AREE-C; T-OSRM
          testo:
            "The archaeological area and patriarchal basilica of Aquileia have been on the UNESCO World Heritage List since 1998. Aquileia's centre is 9 km from the shoreline and Terzo's 11.5 km; both belong here because 72% and 63% of their land is lagoon and coast. Aquileia is about 20 minutes from the airport.",
        },
        {
          nome: "Monfalcone and the lower Isonzo",
          // fonte: AREE-C; T-AREE; T-OSRM
          testo:
            "Monfalcone, Staranzano and San Canzian d'Isonzo close the area to the east, where the lower Isonzo plain meets the Karst. They are the closest municipalities to Trieste Airport, San Canzian at 8 minutes and Monfalcone at 11, and Monfalcone is about 33 minutes from Piazza Unità.",
        },
      ],
      // fonte: GEO §3, §8; aree.ts
      confine:
        "A municipality belongs to Coast & Lagoon if the 2018 regional landscape plan places most of its land in the ‘Lagoon and coast’ zone, or if ISTAT classifies it as coastal. Mountains and Karst are assigned first, though, which is why Duino Aurisina, Muggia and Trieste, although on the sea, are in the Trieste & Karst area. The borderline cases are the lagoon's hinterland: Latisana, Aquileia, Terzo d'Aquileia and San Canzian d'Isonzo qualify by surface area even though their centres are 7 to 15 km from the coast. So when a home in this area stands more than 4 km from the ISTAT shoreline, we list it under Hills & Plain.",
      senzaCase:
        "We have no homes for sale in Coast & Lagoon right now. Tell us what you are looking for and we will say plainly whether we can help.",
      faq: [
        {
          q: "How far is the coast from Trieste Airport?",
          // fonte: T-AREE
          a: "Driving without traffic, the median of the nine town halls is 20 minutes, from 8 for San Canzian d'Isonzo to 59 for Lignano Sabbiadoro. From Venice airport the median rises to 1 h 20 min, with Latisana the closest at 58 minutes. Measured on 7 October 2026.",
        },
        {
          q: "Are Aquileia and Latisana on the sea?",
          // fonte: GEO §8
          a: "No. Their centres are 9 and 14.9 km from the shoreline. They are in this area because most of their land belongs to the lagoon landscape zone.",
        },
        {
          q: "Why are Duino and Muggia not in Coast & Lagoon?",
          // fonte: GEO §8
          a: "Because the landscape plan assigns them to the Karst and eastern coast zone. They are on the sea, but their landscape is Karst, quite unlike the lagoon. You will find them under Trieste & Karst.",
        },
        {
          q: "How long is the drive from Munich or Vienna?",
          // fonte: T-AREE; GEO §7
          a: "As a median across the nine municipalities, about 5 h 13 min from Munich and 5 h 39 min from Vienna, without traffic or border delays. On summer weekends the real journey can take considerably longer.",
        },
      ],
    },
    de: {
      titleSeo: "Küste & Lagune im Friaul: Lignano, Grado, Aquileia",
      descriptionSeo:
        "Neun Gemeinden zwischen Lignano und Monfalcone: Lagune von Marano und Grado, Aquileia, der untere Isonzo. Gemessene Fahrzeiten und die Abgrenzung des Gebiets.",
      h1: "Küste & Lagune: neun Gemeinden zwischen Lignano und Monfalcone", // fonte: G2 §3
      sottotitolo: "Offenes Meer, die Lagune von Marano und Grado und die Orte gleich dahinter.",
      intro: [
        // fonte: COMUNI; AREE-C
        "Küste & Lagune umfasst neun Gemeinden: rund 399 km², 5 % der Region, und 78.626 Einwohner im Jahr 2024. Fünf davon liegen laut ISTAT, dem italienischen Statistikamt, am offenen Meer: Lignano Sabbiadoro, Marano Lagunare, Grado, Staranzano und Monfalcone. Die anderen vier – Latisana, Aquileia, Terzo d'Aquileia und San Canzian d'Isonzo – haben den größten Teil ihrer Fläche im Landschaftsraum „Lagune und Küste“ des regionalen Landschaftsplans, ihr Ortskern liegt aber einige Kilometer landeinwärts.",
        // fonte: COMUNI
        "Das Land ist flach: Alle Rathäuser liegen zwischen 4 und 13 Metern über dem Meeresspiegel. Größter Ort ist Monfalcone mit 30.360 Einwohnern; Grado zählt 7.532, Lignano 6.888.",
        // fonte: T-AREE costa-laguna
        "Das Tor zur Küste ist der Flughafen Triest in Ronchi dei Legionari: Ohne Verkehr erreicht man die Rathäuser im Median in 20 Minuten, San Canzian d'Isonzo in 8, Lignano in 59. Von der Piazza Unità in Triest sind es im Median rund 55 Minuten, von Udine 43, vom Flughafen Venedig 1 Std. 20 Min. Von München und Wien braucht man mehr als fünf Stunden.",
      ],
      paesaggi: [
        {
          nome: "Lignano und die Friaulische Riviera",
          // fonte: COMUNI (lon); AREE-C; GEO §8
          testo:
            "Lignano Sabbiadoro ist die westlichste Küstengemeinde der Region. Mit Latisana und Marano Lagunare gehört es zum Gemeindeverband Riviera Friulana. Der Ortskern von Latisana liegt 14,9 km von der Küstenlinie entfernt, doch 70 % des Gemeindegebiets gehören zum Landschaftsraum der Lagune.",
        },
        {
          nome: "Die Lagune von Marano und Grado",
          // fonte: AREE-C; COMUNI; T-OSRM
          testo:
            "Marano Lagunare und Grado liegen vollständig im Landschaftsraum „Lagune und Küste“. Marano ist ein Ort mit 1.674 Einwohnern an der Lagune; Grado liegt zwischen Lagune und offenem Meer, etwa 34 Minuten vom Flughafen Triest und 57 von Udine.",
        },
        {
          nome: "Aquileia und Terzo d'Aquileia",
          // fonte: UNESCO id 825; GEO §8; AREE-C; T-OSRM; NOMI (DE: Aquileia, Aquileja)
          testo:
            "Die archäologische Zone und die Patriarchalbasilika von Aquileia stehen seit 1998 auf der UNESCO-Welterbeliste. Der Ortskern von Aquileia liegt 9 km von der Küste, der von Terzo 11,5 km; beide gehören dazu, weil 72 % bzw. 63 % ihrer Fläche Lagune und Küste sind. Zum Flughafen sind es von Aquileia etwa 20 Minuten.",
        },
        {
          nome: "Monfalcone und der untere Isonzo",
          // fonte: AREE-C; T-AREE; T-OSRM
          testo:
            "Monfalcone, Staranzano und San Canzian d'Isonzo schließen das Gebiet nach Osten ab, wo die Isonzo-Ebene auf den Karst trifft. Sie liegen dem Flughafen Triest am nächsten – San Canzian 8 Minuten, Monfalcone 11 –, und von Monfalcone zur Piazza Unità sind es rund 33 Minuten.",
        },
      ],
      // fonte: GEO §3, §8; aree.ts
      confine:
        "Eine Gemeinde gehört zu Küste & Lagune, wenn der regionale Landschaftsplan von 2018 den größten Teil ihrer Fläche dem Raum „Lagune und Küste“ zuordnet oder wenn ISTAT sie als Küstengemeinde führt. Zuvor werden jedoch Berge und Karst zugeordnet: Deshalb stehen Duino Aurisina, Muggia und Triest, obwohl am Meer, im Gebiet Triest & Karst. Grenzfälle sind die Orte hinter der Lagune: Latisana, Aquileia, Terzo d'Aquileia und San Canzian d'Isonzo zählen nach Fläche dazu, obwohl ihr Ortskern 7 bis 15 km von der Küste entfernt ist. Ein Haus in diesem Gebiet, das mehr als 4 km von der ISTAT-Küstenlinie entfernt liegt, zeigen wir deshalb unter Hügelland & Ebene.",
      senzaCase:
        "Derzeit haben wir im Gebiet Küste & Lagune keine Häuser zum Verkauf. Schreiben Sie uns, was Sie suchen – wir sagen Ihnen offen, ob wir helfen können.",
      faq: [
        {
          q: "Wie weit ist die Küste vom Flughafen Triest entfernt?",
          // fonte: T-AREE
          a: "Ohne Verkehr im Median 20 Minuten bis zu den neun Rathäusern: von 8 Minuten nach San Canzian d'Isonzo bis 59 nach Lignano Sabbiadoro. Vom Flughafen Venedig sind es im Median 1 Std. 20 Min., nach Latisana 58 Minuten. Gemessen am 7. Oktober 2026.",
        },
        {
          q: "Liegen Aquileia und Latisana am Meer?",
          // fonte: GEO §8
          a: "Nein. Ihre Ortskerne liegen 9 bzw. 14,9 km von der Küstenlinie entfernt. Sie gehören zum Gebiet, weil der größte Teil ihrer Fläche zum Landschaftsraum der Lagune zählt.",
        },
        {
          q: "Warum gehören Duino und Muggia nicht zu Küste & Lagune?",
          // fonte: GEO §8
          a: "Weil der Landschaftsplan sie dem Raum Karst und östliche Küste zuordnet. Sie liegen am Meer, aber in einer Karstlandschaft, die mit der Lagune wenig gemein hat. Sie finden sie unter Triest & Karst.",
        },
        {
          q: "Wie lange fährt man von München oder Wien?",
          // fonte: T-AREE; GEO §7
          a: "Im Median der neun Gemeinden rund 5 Std. 13 Min. ab München und 5 Std. 39 Min. ab Wien, ohne Verkehr und ohne Wartezeit an der Grenze. An Sommerwochenenden kann die Fahrt deutlich länger dauern.",
        },
      ],
    },
    sl: {
      // fonte toponimi SL: NOMI (Gradež, Oglej, Tržič; Lignano e Marano senza esonimo); COMUNI nome_sl_wikidata (Štarancan, Škocjan ob Soči)
      titleSeo: "Furlanska obala in laguna: Lignano, Gradež, Oglej",
      descriptionSeo:
        "Devet občin med Lignanom in Tržičem: laguna pri Maranu in Gradežu, Oglej, spodnja Soča. Izmerjeni časi vožnje in pojasnilo, kako smo začrtali območje.",
      h1: "Obala in laguna: devet občin med Lignanom in Tržičem", // fonte: G2 §3
      sottotitolo: "Odprto morje, laguna pri Maranu in Gradežu ter kraji tik za njo.",
      intro: [
        // fonte: COMUNI; AREE-C
        "Območje Obala in laguna združuje devet občin: približno 399 km², 5 % deželnega ozemlja, in 78.626 prebivalcev leta 2024. Pet jih po podatkih italijanskega statističnega urada ISTAT leži ob odprtem morju: Lignano Sabbiadoro, Marano Lagunare, Gradež, Štarancan in Tržič. Preostale štiri – Latisana, Oglej, Terzo d'Aquileia in Škocjan ob Soči – imajo večino ozemlja v krajinskem območju »Laguna in obala« deželnega krajinskega načrta, njihova središča pa so nekaj kilometrov v notranjosti.",
        // fonte: COMUNI
        "Svet je raven: vsi občinski sedeži so med 4 in 13 metri nadmorske višine. Največji kraj je Tržič s 30.360 prebivalci; Gradež jih ima 7.532, Lignano 6.888.",
        // fonte: T-AREE costa-laguna
        "Vstopna točka je tržaško letališče v Ronkah: brez prometa je mediana vožnje od terminala do občinskih sedežev 20 minut, od 8 minut do Škocjana ob Soči do 59 do Lignana. S Trga Unità v Trstu je mediana približno 55 minut, iz Vidma 43, z beneškega letališča 1 ura in 20 minut. Iz Münchna in z Dunaja potrebujete več kot pet ur.",
      ],
      paesaggi: [
        {
          nome: "Lignano in Furlanska riviera",
          // fonte: COMUNI (lon); AREE-C; GEO §8
          testo:
            "Lignano Sabbiadoro je najzahodnejša obalna občina dežele. Z Latisano in Maranom Lagunare spada v zvezo občin Riviera Friulana. Središče Latisane je 14,9 km od obalne črte, vendar 70 % njenega ozemlja spada v krajinsko območje lagune.",
        },
        {
          nome: "Laguna pri Maranu in Gradežu",
          // fonte: AREE-C; COMUNI; T-OSRM; NOMI (nome SL unico della laguna non riscontrato: «Maranska laguna» + «Gradeška laguna»)
          testo:
            "Marano Lagunare in Gradež v celoti ležita v območju »Laguna in obala«. Marano je kraj s 1.674 prebivalci ob laguni; Gradež leži med laguno in odprtim morjem, približno 34 minut od tržaškega letališča in 57 od Vidma.",
        },
        {
          nome: "Oglej in Terzo d'Aquileia",
          // fonte: UNESCO id 825; GEO §8; AREE-C; T-OSRM
          testo:
            "Arheološko območje in patriarhalna bazilika v Ogleju sta od leta 1998 na Unescovem seznamu svetovne dediščine. Središče Ogleja je 9 km od obalne črte, središče Terza 11,5 km; obe občini spadata sem, ker je 72 oziroma 63 % njunega ozemlja laguna in obala. Iz Ogleja je do letališča približno 20 minut.",
        },
        {
          nome: "Tržič in spodnja Soča",
          // fonte: AREE-C; T-AREE; T-OSRM
          testo:
            "Tržič, Štarancan in Škocjan ob Soči zapirajo območje na vzhodu, kjer se nižina ob spodnji Soči sreča s Krasom. Tržaškemu letališču so najbližje – Škocjan 8 minut, Tržič 11 –, iz Tržiča pa je do Trga Unità približno 33 minut.",
        },
      ],
      // fonte: GEO §3, §8; aree.ts
      confine:
        "Občina spada na območje Obala in laguna, če deželni krajinski načrt iz leta 2018 večino njenega ozemlja uvršča v območje »Laguna in obala« ali če jo ISTAT vodi kot obalno. Pred tem pa se razvrstijo občine gorskega sveta in Krasa: zato so Devin - Nabrežina, Milje in Trst, čeprav ob morju, na območju Trst in Kras. Mejni primeri so kraji za laguno: Latisana, Oglej, Terzo d'Aquileia in Škocjan ob Soči so zraven po površini, čeprav so njihova središča od 7 do 15 km od obale. Zato hišo s tega območja, ki je od obalne črte ISTAT oddaljena več kot 4 km, prikažemo na območju Gričevje in nižina.",
      senzaCase:
        "Trenutno na območju Obala in laguna nimamo hiš naprodaj. Pišite nam, kaj iščete, in odkrito vam bomo povedali, ali vam lahko pomagamo.",
      faq: [
        {
          q: "Kako daleč je obala od tržaškega letališča?",
          // fonte: T-AREE
          a: "Brez prometa je mediana do devetih občinskih sedežev 20 minut: od 8 minut do Škocjana ob Soči do 59 do Lignana Sabbiadoro. Z beneškega letališča je mediana 1 ura in 20 minut, Latisana je oddaljena 58 minut. Merjeno 7. oktobra 2026.",
        },
        {
          q: "Ali sta Oglej in Latisana ob morju?",
          // fonte: GEO §8
          a: "Ne. Njuni središči sta 9 oziroma 14,9 km od obalne črte. Na tem območju sta, ker večina njunega ozemlja spada v krajinsko območje lagune.",
        },
        {
          q: "Zakaj Devin in Milje nista na območju Obala in laguna?",
          // fonte: GEO §8; NOMI (Devin - Nabrežina, Milje)
          a: "Ker ju krajinski načrt uvršča v območje Krasa in vzhodne obale. Ležita ob morju, a v kraški pokrajini, ki je povsem drugačna od lagunske. Najdete ju na območju Trst in Kras.",
        },
        {
          q: "Koliko časa traja vožnja iz Ljubljane ali Münchna?",
          // fonte: T-AREE costa-laguna lubiana 101, monaco 313; GEO §7
          a: "V mediani devetih občin približno 1 uro in 41 minut iz Ljubljane (Tržič je najbližji, 80 minut) in 5 ur in 13 minut iz Münchna, brez prometa in čakanja na meji. Ob poletnih koncih tedna je vožnja lahko precej daljša.",
        },
      ],
    },
  },

  /* ==============================================================
     COLLINE E PIANURA — 138 comuni
     fonte: AREE-C (S4 = colline-pianura; S5: colline 47, pianura 91; ambiti PPR AP4 11, AP5 15, AP6 16,
     AP7 9, AP8 41, AP9 20, AP10 26). COMUNI: 818.900 residenti (68,6% della regione), 3.841,8 km² (48,4%);
     Udine 98.279, Pordenone 52.314, Gorizia 33.620. T-AREE: Udine 35 (max Polcenigo 79), Trieste 72
     (36 Ronchi–113 Montereale V.), aer. Trieste 48 (6 Ronchi–89 Montereale V.), aer. Venezia 80 (46 Pravisdomini),
     Lubiana 119 (78 Gorizia), Monaco 306 (270 Osoppo). Casi limite GEO §8.
     ============================================================== */
  "colline-pianura": {
    it: {
      titleSeo: "Colline e pianura del Friuli: dal Collio alla Bassa", // fonte: G2 §3
      descriptionSeo:
        "138 comuni fra Pordenone, Udine e Gorizia: Collio, Colli Orientali, colline moreniche, pedemontana e Bassa. Tempi in auto misurati e la regola dell'area.",
      h1: "Colline e pianura: 138 comuni da Pordenone al Collio", // fonte: G2 §3; AREE-C
      sottotitolo: "La parte più abitata della regione: le città, il Collio, le colline moreniche e la pianura fino alla laguna.",
      intro: [
        // fonte: COMUNI (somme e quote calcolate); AREE-C
        "È l'area più grande delle quattro: 138 comuni su 215, circa 3.842 km², quasi metà della regione, e 818.900 residenti, più di due abitanti su tre del Friuli Venezia Giulia. Ci sono le tre città capoluogo di ex provincia diverse da Trieste: Udine con 98.279 abitanti, Pordenone con 52.314 e Gorizia con 33.620.",
        // fonte: GEO §2 (ambiti PPR), §3 (S5: 47 + 91)
        "Il nome dice che cosa c'è dentro. Il Piano paesaggistico regionale divide questo territorio in sette ambiti: la pedemontana occidentale, l'anfiteatro morenico, le valli orientali e il Collio, l'alta e la bassa pianura pordenonese, l'alta e la bassa pianura friulana e isontina. Quando il catalogo crescerà, l'area si dividerà in Colline, 47 comuni, e Pianura, 91, con una regola già scritta.",
        // fonte: T-AREE colline-pianura (udine 35/79; trieste 72; aer_trieste 48; aer_venezia 80; monaco min 270 Osoppo)
        "Da Udine, in auto e senza traffico, la mediana è di 35 minuti e il comune più lontano, Polcenigo, è a 79. Da Trieste la mediana è di 1 ora e 12, dall'aeroporto di Trieste di 48 minuti, da quello di Venezia di 1 ora e 20. Da Monaco il comune più vicino è Osoppo, a circa 4 ore e 30.",
      ],
      paesaggi: [
        {
          nome: "Il Collio e Gorizia",
          // fonte: GEO §3 S5 (Collio e Isontino collinare); AREE-C (DOC Collio Goriziano); T-AREE (lubiana min 78 Gorizia)
          testo:
            "Cormons, Capriva del Friuli, Dolegna del Collio, Mossa e San Floriano del Collio, insieme a Gorizia, formano il Collio italiano, la zona della DOC «Collio Goriziano». Gorizia è il comune dell'area più vicino a Lubiana: circa 78 minuti in auto.",
        },
        {
          nome: "Cividale e i Colli Orientali",
          // fonte: UNESCO id 1318 (2011; parte longobarda del centro di Cividale); GEO §3 S5; T-OSRM (Cividale da Udine 25)
          testo:
            "Una parte del centro storico di Cividale del Friuli, quella di età longobarda, è dal 2011 nel sito UNESCO «I Longobardi in Italia». Cividale è a circa 25 minuti da Udine; intorno, Prepotto, Corno di Rosazzo, Torreano, Faedis, Attimis, Nimis e Tarcento disegnano le colline orientali fino al Torre.",
        },
        {
          nome: "Le colline moreniche e San Daniele",
          // fonte: AREE-C (AP 5 Anfiteatro morenico: 15 comuni); T-OSRM (San Daniele da Udine 35)
          testo:
            "A nord-ovest di Udine l'ambito dell'anfiteatro morenico raccoglie quindici comuni: San Daniele del Friuli, Fagagna, Majano, Buja, Ragogna, Osoppo, Tricesimo, Moruzzo, Pagnacco e altri. San Daniele è a circa 35 minuti da Udine.",
        },
        {
          nome: "La pedemontana pordenonese",
          // fonte: AREE-C (zona ISTAT collina interna; lr33_montano totale/parziale); GEO §8
          testo:
            "Aviano, Budoia, Polcenigo, Caneva e Maniago stanno ai piedi delle montagne pordenonesi. Per la legge regionale sulla montagna sono comuni montani, in tutto o in parte, ma l'ISTAT li classifica collina: per questo sono qui e non in Montagna.",
        },
        {
          nome: "La pianura e la Bassa",
          // fonte: UNESCO id 1533 (2017; Palmanova, fortezza a stella veneziana del 1593: en.wikipedia «Palmanova»); AREE-C S5 pianura 91; COMUNI
          testo:
            "Novantuno comuni di pianura, dall'alta pianura di Udine e Pordenone fino alla Bassa che confina con la laguna: Codroipo, Sacile, Cervignano del Friuli, Ronchi dei Legionari. Palmanova, la fortezza a stella costruita da Venezia nel 1593, è dal 2017 nel sito UNESCO delle opere di difesa veneziane.",
        },
      ],
      // fonte: GEO §3 (R5 = il resto); GEO §8 (Gorizia 59/41%, valli del Natisone, Collio, Ronchi 3,6 km); aree.ts
      confine:
        "Quest'area è ciò che resta dopo le altre tre: un comune è qui se l'ISTAT non lo classifica montagna interna, se il Piano paesaggistico non lo mette nel Carso e se non è né litoraneo né in maggioranza nell'ambito della laguna. I casi limite: Gorizia, che il Piano divide fra alta pianura (59%) e Collio (41%); le valli del Natisone a monte di Cividale, che per l'ISTAT sono montagna e quindi vanno in Montagna; il Collio, che l'ISTAT classifica pianura e il Piano mette fra le colline; Ronchi dei Legionari, l'unico comune di quest'area col centro a meno di 5 km dal mare. Qui mostriamo anche le case dei comuni della costa che stanno a più di 4 km dalla linea di costa.",
      senzaCase:
        "In questo momento non abbiamo case in vendita in Colline e pianura: scriveteci che cosa cercate e in quale zona.",
      faq: [
        {
          q: "Perché colline e pianura stanno insieme?",
          // fonte: GEO §0, §3 S5
          a: "Perché oggi le nostre case in quest'area sono poche, e due caselle quasi vuote non aiutano chi cerca. La divisione è già pronta e contata: 47 comuni di collina e 91 di pianura.",
        },
        {
          q: "Il Collio è in quest'area?",
          // fonte: GEO §8
          a: "Sì. Cormons, Capriva, Dolegna, Mossa e San Floriano sono qui, e nella divisione futura andranno in Colline: il Piano paesaggistico li assegna all'ambito delle valli orientali e del Collio, anche se l'ISTAT li classifica pianura.",
        },
        {
          q: "Quanto distano Gorizia e Pordenone da Udine?",
          // fonte: T-OSRM (udine→Gorizia 45, udine→Pordenone 62 arrotondato da 61,5)
          a: "Da Piazza della Libertà, in auto e senza traffico, Gorizia è a circa 45 minuti e Pordenone a circa 62.",
        },
        {
          q: "Quali comuni sono vicini all'aeroporto di Trieste?",
          // fonte: T-AREE colline-pianura aer_trieste (6 Ronchi, mediana 48, max 89 Montereale Valcellina)
          a: "Ronchi dei Legionari, dove sta l'aeroporto, è a 6 minuti dal terminal. La mediana dell'area è di 48 minuti; il comune più lontano è Montereale Valcellina, a 1 ora e 29.",
        },
      ],
    },
    en: {
      titleSeo: "Friuli hills & plain: from the Collio to the lowlands", // fonte: G2 §3
      descriptionSeo:
        "138 municipalities around Pordenone, Udine and Gorizia: the Collio, the eastern hills, the moraine hills, the foothills and the plain. Measured driving times.",
      h1: "Hills & Plain: 138 municipalities from Pordenone to the Collio", // fonte: G2 §3
      sottotitolo: "The most populated part of the region: its cities, the Collio, the moraine hills and the plain down to the lagoon.",
      intro: [
        // fonte: COMUNI; AREE-C
        "This is the largest of the four areas: 138 of the region's 215 municipalities, about 3,842 km² or almost half of Friuli Venezia Giulia, and 818,900 residents, more than two in every three people in the region. It includes the three former provincial capitals other than Trieste: Udine with 98,279 inhabitants, Pordenone with 52,314 and Gorizia with 33,620.",
        // fonte: GEO §2, §3
        "The name says what is inside. The regional landscape plan divides this territory into seven zones: the western foothills, the moraine amphitheatre, the eastern valleys and the Collio, the upper and lower Pordenone plain, and the upper and lower Friulian and Isonzo plain. When our catalogue grows, the area will split into Hills (47 municipalities) and Plain (91), using a rule that is already written.",
        // fonte: T-AREE colline-pianura
        "From Udine, driving without traffic, the median is 35 minutes and the farthest municipality, Polcenigo, is 79 minutes away. From Trieste the median is 1 h 12 min, from Trieste Airport 48 minutes, from Venice airport 1 h 20 min. From Munich the nearest municipality is Osoppo, at about 4 h 30 min.",
      ],
      paesaggi: [
        {
          nome: "The Collio and Gorizia",
          // fonte: GEO §3; AREE-C; T-AREE
          testo:
            "Cormons, Capriva del Friuli, Dolegna del Collio, Mossa and San Floriano del Collio, together with Gorizia, make up the Italian Collio, home of the Collio Goriziano DOC wine zone. Gorizia is the municipality in this area closest to Ljubljana, about 78 minutes by car.",
        },
        {
          nome: "Cividale and the eastern hills",
          // fonte: UNESCO id 1318; GEO §3; T-OSRM
          testo:
            "Part of the historic centre of Cividale del Friuli, the Lombard-era quarter, has been part of the UNESCO site ‘Longobards in Italy’ since 2011. Cividale is about 25 minutes from Udine; around it, Prepotto, Corno di Rosazzo, Torreano, Faedis, Attimis, Nimis and Tarcento trace the eastern hills as far as the River Torre.",
        },
        {
          nome: "The moraine hills and San Daniele",
          // fonte: AREE-C (AP 5: 15 comuni); T-OSRM
          testo:
            "North-west of Udine, the moraine amphitheatre zone takes in fifteen municipalities: San Daniele del Friuli, Fagagna, Majano, Buja, Ragogna, Osoppo, Tricesimo, Moruzzo, Pagnacco and others. San Daniele is about 35 minutes from Udine.",
        },
        {
          nome: "The Pordenone foothills",
          // fonte: AREE-C; GEO §8
          testo:
            "Aviano, Budoia, Polcenigo, Caneva and Maniago lie at the foot of the Pordenone mountains. Regional mountain law counts them, wholly or partly, as mountain municipalities, but ISTAT classifies them as hills, so they are listed here rather than under Mountains.",
        },
        {
          nome: "The plain and the lowlands",
          // fonte: UNESCO id 1533; en.wikipedia «Palmanova»; AREE-C
          testo:
            "Ninety-one lowland municipalities, from the upper plain around Udine and Pordenone down to the lowlands that border the lagoon: Codroipo, Sacile, Cervignano del Friuli, Ronchi dei Legionari. Palmanova, the star-shaped fortress town built by Venice in 1593, has been part of the UNESCO site of Venetian defence works since 2017.",
        },
      ],
      // fonte: GEO §3, §8; aree.ts
      confine:
        "This area is what remains once the other three are drawn: a municipality belongs here if ISTAT does not classify it as inland mountain, if the landscape plan does not place it in the Karst, and if it is neither coastal nor mostly within the lagoon zone. The borderline cases: Gorizia, which the plan splits between upper plain (59%) and Collio (41%); the Natisone valleys above Cividale, which ISTAT counts as mountain and which therefore go to Mountains; the Collio, which ISTAT classifies as plain but the plan places among the hills; and Ronchi dei Legionari, the only municipality here whose centre is less than 5 km from the sea. Homes in coastal municipalities that stand more than 4 km from the shoreline are also listed here.",
      senzaCase:
        "We have no homes for sale in Hills & Plain right now. Tell us what you are looking for, and where.",
      faq: [
        {
          q: "Why are hills and plain one area?",
          // fonte: GEO §0, §3
          a: "Because we currently have only a few homes here, and two near-empty categories would not help anyone searching. The split is ready and counted: 47 hill municipalities and 91 on the plain.",
        },
        {
          q: "Is the Collio in this area?",
          // fonte: GEO §8
          a: "Yes. Cormons, Capriva, Dolegna, Mossa and San Floriano are here, and in the future split they will go to Hills: the landscape plan assigns them to the eastern valleys and Collio zone, even though ISTAT classifies them as plain.",
        },
        {
          q: "How far are Gorizia and Pordenone from Udine?",
          // fonte: T-OSRM
          a: "From Piazza della Libertà, driving without traffic, Gorizia is about 45 minutes away and Pordenone about 62.",
        },
        {
          q: "Which municipalities are close to Trieste Airport?",
          // fonte: T-AREE
          a: "Ronchi dei Legionari, where the airport is, is 6 minutes from the terminal. The median for the area is 48 minutes; the farthest municipality, Montereale Valcellina, is 1 h 29 min away.",
        },
      ],
    },
    de: {
      titleSeo: "Hügelland & Ebene im Friaul: vom Collio bis zur Bassa", // fonte: G2 §3 rivisto (niente «Haus kaufen»)
      descriptionSeo:
        "138 Gemeinden um Pordenone, Udine und Görz: Collio, östliche Hügel, Moränenhügel, Voralpenrand und Ebene. Gemessene Fahrzeiten und wie das Gebiet abgegrenzt ist.",
      h1: "Hügelland & Ebene: 138 Gemeinden von Pordenone bis zum Collio", // fonte: G2 §3
      sottotitolo: "Der am dichtesten besiedelte Teil der Region: die Städte, der Collio, die Moränenhügel und die Ebene bis zur Lagune.",
      intro: [
        // fonte: COMUNI; AREE-C; NOMI (DE: Görz)
        "Es ist das größte der vier Gebiete: 138 von 215 Gemeinden, rund 3.842 km² – fast die Hälfte der Region – und 818.900 Einwohner, mehr als zwei von drei Bewohnern Friaul-Julisch Venetiens. Dazu gehören die drei früheren Provinzhauptstädte außer Triest: Udine mit 98.279 Einwohnern, Pordenone mit 52.314 und Görz mit 33.620.",
        // fonte: GEO §2, §3
        "Der Name sagt, was dazugehört. Der regionale Landschaftsplan teilt dieses Gebiet in sieben Räume: den westlichen Voralpenrand, das Moränenamphitheater, die östlichen Täler mit dem Collio, die obere und untere Ebene von Pordenone sowie die obere und untere friaulische und Isonzo-Ebene. Wächst unser Angebot, teilt sich das Gebiet in Hügelland (47 Gemeinden) und Ebene (91) – nach einer Regel, die schon feststeht.",
        // fonte: T-AREE colline-pianura
        "Von Udine sind es ohne Verkehr im Median 35 Minuten, zur entferntesten Gemeinde, Polcenigo, 79. Von Triest beträgt der Median 1 Std. 12 Min., vom Flughafen Triest 48 Minuten, vom Flughafen Venedig 1 Std. 20 Min. Von München aus liegt Osoppo am nächsten, rund 4 Std. 30 Min.",
      ],
      paesaggi: [
        {
          nome: "Der Collio und Görz",
          // fonte: GEO §3; AREE-C; T-AREE; NOMI (Collio in DE resta «Collio»)
          testo:
            "Cormòns, Capriva del Friuli, Dolegna del Collio, Mossa und San Floriano del Collio bilden zusammen mit Görz den italienischen Collio, das Gebiet der DOC Collio Goriziano. Görz ist die Gemeinde des Gebiets, die Ljubljana am nächsten liegt: rund 78 Minuten mit dem Auto.",
        },
        {
          nome: "Cividale und die östlichen Hügel",
          // fonte: UNESCO id 1318; GEO §3; T-OSRM
          testo:
            "Ein Teil der Altstadt von Cividale del Friuli, der langobardische, gehört seit 2011 zur UNESCO-Welterbestätte „Langobarden in Italien“. Cividale liegt rund 25 Minuten von Udine entfernt; ringsum ziehen sich mit Prepotto, Corno di Rosazzo, Torreano, Faedis, Attimis, Nimis und Tarcento die östlichen Hügel bis zum Torre.",
        },
        {
          nome: "Die Moränenhügel und San Daniele",
          // fonte: AREE-C; T-OSRM
          testo:
            "Nordwestlich von Udine umfasst der Raum des Moränenamphitheaters fünfzehn Gemeinden: San Daniele del Friuli, Fagagna, Majano, Buja, Ragogna, Osoppo, Tricesimo, Moruzzo, Pagnacco und weitere. San Daniele liegt rund 35 Minuten von Udine entfernt.",
        },
        {
          nome: "Der Voralpenrand bei Pordenone",
          // fonte: AREE-C; GEO §8
          testo:
            "Aviano, Budoia, Polcenigo, Caneva und Maniago liegen am Fuß der Berge um Pordenone. Nach dem regionalen Berggesetz sind sie ganz oder teilweise Berggemeinden, ISTAT führt sie aber als Hügelland – deshalb stehen sie hier und nicht im Bergland.",
        },
        {
          nome: "Die Ebene und die Bassa",
          // fonte: UNESCO id 1533; en.wikipedia «Palmanova»; AREE-C
          testo:
            "Einundneunzig Gemeinden in der Ebene, von der oberen Ebene um Udine und Pordenone bis zur Bassa an der Lagune: Codroipo, Sacile, Cervignano del Friuli, Ronchi dei Legionari. Palmanova, die sternförmige Festungsstadt, die Venedig 1593 anlegte, gehört seit 2017 zur UNESCO-Welterbestätte der venezianischen Verteidigungsanlagen.",
        },
      ],
      // fonte: GEO §3, §8; aree.ts
      confine:
        "Dieses Gebiet ist, was nach den anderen dreien übrig bleibt: Eine Gemeinde gehört dazu, wenn ISTAT sie nicht als Berggebiet einstuft, der Landschaftsplan sie nicht dem Karst zuordnet und sie weder Küstengemeinde ist noch überwiegend im Raum der Lagune liegt. Die Grenzfälle: Görz, das der Plan zwischen oberer Ebene (59 %) und Collio (41 %) teilt; die Natisone-Täler oberhalb von Cividale, die für ISTAT Berggebiet sind und daher zu den Bergen gehören; der Collio, den ISTAT als Ebene führt, der Plan aber zum Hügelland zählt; und Ronchi dei Legionari, die einzige Gemeinde hier, deren Ortskern weniger als 5 km vom Meer liegt. Häuser in Küstengemeinden, die mehr als 4 km von der Küstenlinie entfernt sind, zeigen wir ebenfalls hier.",
      senzaCase:
        "Derzeit haben wir im Gebiet Hügelland & Ebene keine Häuser zum Verkauf. Schreiben Sie uns, was Sie suchen und wo.",
      faq: [
        {
          q: "Warum sind Hügelland und Ebene ein Gebiet?",
          // fonte: GEO §0, §3
          a: "Weil wir hier derzeit nur wenige Häuser haben und zwei fast leere Rubriken niemandem bei der Suche helfen. Die Teilung ist vorbereitet und gezählt: 47 Gemeinden im Hügelland, 91 in der Ebene.",
        },
        {
          q: "Gehört der Collio zu diesem Gebiet?",
          // fonte: GEO §8
          a: "Ja. Cormòns, Capriva, Dolegna, Mossa und San Floriano liegen hier und kommen bei der späteren Teilung ins Hügelland: Der Landschaftsplan ordnet sie den östlichen Tälern und dem Collio zu, auch wenn ISTAT sie als Ebene führt.",
        },
        {
          q: "Wie weit sind Görz und Pordenone von Udine entfernt?",
          // fonte: T-OSRM
          a: "Von der Piazza della Libertà sind es ohne Verkehr rund 45 Minuten nach Görz und rund 62 nach Pordenone.",
        },
        {
          q: "Welche Gemeinden liegen nahe am Flughafen Triest?",
          // fonte: T-AREE
          a: "Ronchi dei Legionari, wo der Flughafen liegt, ist 6 Minuten vom Terminal entfernt. Der Median des Gebiets beträgt 48 Minuten; am weitesten ist es nach Montereale Valcellina, 1 Std. 29 Min.",
        },
      ],
    },
    sl: {
      // fonte toponimi SL: NOMI (Videm, Gorica, Čedad, Krmin, Pordenon/Pordenone, Collio = Brda); COMUNI nome_sl_wikidata (Koprivno, Dolenje v Brdih, Moš, Števerjan, Prapotno, Čenta, Ronke, Červinjan, Taržizem)
      titleSeo: "Furlansko gričevje in nižina: od Brd do spodnje nižine", // fonte: G2 §3 rivisto
      descriptionSeo:
        "138 občin okoli Pordenona, Vidma in Gorice: Collio (Brda), vzhodni griči, morenski griči, predgorje in nižina. Izmerjeni časi vožnje in pravilo območja.",
      h1: "Gričevje in nižina: 138 občin od Pordenona do Brd", // fonte: G2 §3
      sottotitolo: "Najgosteje naseljeni del dežele: mesta, Brda, morenski griči in nižina vse do lagune.",
      intro: [
        // fonte: COMUNI; AREE-C
        "To je največje od štirih območij: 138 od 215 občin, približno 3.842 km² – skoraj polovica dežele – in 818.900 prebivalcev, več kot dve tretjini prebivalstva Furlanije - Julijske krajine. Sem spadajo tri nekdanja pokrajinska središča razen Trsta: Videm z 98.279 prebivalci, Pordenone z 52.314 in Gorica s 33.620.",
        // fonte: GEO §2, §3
        "Ime pove, kaj zajema. Deželni krajinski načrt to ozemlje deli na sedem območij: zahodno predgorje, morenski amfiteater, vzhodne doline z Brdi, zgornjo in spodnjo pordenonsko nižino ter zgornjo in spodnjo furlansko in posoško nižino. Ko bo naša ponudba večja, se bo območje razdelilo na Gričevje (47 občin) in Nižino (91), po pravilu, ki je že zapisano.",
        // fonte: T-AREE colline-pianura
        "Iz Vidma je mediana brez prometa 35 minut, do najbolj oddaljene občine, Polcenigo, pa 79. Iz Trsta je mediana 1 ura in 12 minut, s tržaškega letališča 48 minut, z beneškega 1 ura in 20 minut. Iz Ljubljane je najbližja Gorica, približno 78 minut vožnje.",
      ],
      paesaggi: [
        {
          nome: "Brda na italijanski strani in Gorica",
          // fonte: GEO §3, §5 (SL «Collio (Brda)»); AREE-C (DOC Collio Goriziano); NOMI
          testo:
            "Krmin, Koprivno, Dolenje v Brdih, Moš in Števerjan skupaj z Gorico tvorijo italijanski del Brd, ki ga Italijani imenujejo Collio – to je tudi območje vin DOC Collio Goriziano. Gorica je občina tega območja, ki je Ljubljani najbližja.",
        },
        {
          nome: "Čedad in vzhodni griči",
          // fonte: UNESCO id 1318; GEO §3; T-OSRM; NOMI (Čedad); COMUNI (Prapotno, Čenta)
          testo:
            "Del zgodovinskega središča Čedada, tisti iz langobardske dobe, je od leta 2011 del Unescove dediščine »Langobardi v Italiji«. Čedad je od Vidma oddaljen približno 25 minut; okoli njega se vzhodni griči vlečejo vse do reke Ter: Prapotno, Corno di Rosazzo, Tavorjana, Fojda, Ahten, Neme in Čenta.",
        },
        {
          nome: "Morenski griči in San Daniele",
          // fonte: AREE-C; T-OSRM; COMUNI (Taržizem)
          testo:
            "Severozahodno od Vidma obsega območje morenskega amfiteatra petnajst občin: San Daniele del Friuli, Fagagna, Majano, Buja, Ragogna, Osoppo, Taržizem, Moruzzo, Pagnacco in druge. San Daniele je od Vidma oddaljen približno 35 minut.",
        },
        {
          nome: "Predgorje pri Pordenonu",
          // fonte: AREE-C; GEO §8
          testo:
            "Aviano, Budoia, Polcenigo, Caneva in Maniago ležijo ob vznožju pordenonskih gora. Po deželnem zakonu o gorskih območjih so v celoti ali deloma gorske občine, ISTAT pa jih uvršča med gričevnate – zato so tukaj in ne pod Gorami.",
        },
        {
          nome: "Zgornja in spodnja nižina",
          // fonte: UNESCO id 1533; en.wikipedia «Palmanova»; AREE-C; COMUNI (Červinjan, Ronke); GEO §5 (ZRC SAZU: «spodnja nižina»)
          testo:
            "Enaindevetdeset nižinskih občin, od zgornje nižine okoli Vidma in Pordenona do spodnje, ki meji na laguno: Codroipo, Sacile, Červinjan, Ronke. Palmanova, zvezdasta trdnjava, ki so jo Benečani zgradili leta 1593, je od leta 2017 del Unescove dediščine beneških obrambnih sistemov.",
        },
      ],
      // fonte: GEO §3, §8; aree.ts
      confine:
        "To območje je tisto, kar ostane po drugih treh: občina spada sem, če je ISTAT ne uvršča v notranje gorsko območje, če je krajinski načrt ne uvršča na Kras in če ni niti obalna niti pretežno v območju lagune. Mejni primeri: Gorica, ki jo načrt deli med zgornjo nižino (59 %) in Brda (41 %); Nadiške doline nad Čedadom, ki so za ISTAT gorsko območje in zato spadajo pod Gore; Brda, ki jih ISTAT vodi kot nižino, načrt pa kot gričevje; in Ronke, edina občina tega območja, katere središče je manj kot 5 km od morja. Tukaj prikazujemo tudi hiše iz obalnih občin, ki so od obalne črte oddaljene več kot 4 km.",
      senzaCase:
        "Trenutno na območju Gričevje in nižina nimamo hiš naprodaj. Pišite nam, kaj iščete in kje.",
      faq: [
        {
          q: "Zakaj sta gričevje in nižina eno območje?",
          // fonte: GEO §0, §3
          a: "Ker imamo tukaj zaenkrat le malo hiš in dva skoraj prazna razdelka ne bi pomagala nikomur, ki išče. Delitev je pripravljena in prešteta: 47 gričevnatih in 91 nižinskih občin.",
        },
        {
          q: "Ali so Brda na tem območju?",
          // fonte: GEO §8
          a: "Da, italijanski del Brd: Krmin, Koprivno, Dolenje, Moš in Števerjan so tukaj in bodo ob prihodnji delitvi spadali v Gričevje. Krajinski načrt jih uvršča v območje vzhodnih dolin in Brd, čeprav jih ISTAT vodi kot nižino.",
        },
        {
          q: "Koliko sta Gorica in Pordenone oddaljena od Vidma?",
          // fonte: T-OSRM
          a: "S Trga Libertà v Vidmu je brez prometa do Gorice približno 45 minut, do Pordenona približno 62.",
        },
        {
          q: "Katere občine so blizu tržaškega letališča?",
          // fonte: T-AREE
          a: "Ronke, kjer je letališče, so od terminala oddaljene 6 minut. Mediana območja je 48 minut; najbolj oddaljena občina, Montereale Valcellina, je 1 uro in 29 minut stran.",
        },
      ],
    },
  },

  /* ==============================================================
     MONTAGNA — 58 comuni
     fonte: AREE-C (S4 = montagna; AP1 27, AP2 9, AP3 12, AP6 8, AP4 1, Sappada fuori PPR). COMUNI: 59.833
     residenti (5,0%), 3.414,3 km² (43,0%), densità 17,5/km² contro 150,4 della regione; 42 comuni sotto i
     1.000 residenti; Tolmezzo 9.702; municipi 159 (San Leonardo)–1.242 (Sappada), mediana vera 481
     (GEO errata/G3: «circa 480 m»); Sauris 1.209; alt_max 2.752 Forni Avoltri; Drenchia 89 residenti (minimo
     regionale). T-AREE: Udine 59 (34 Trasaghis–102 Erto e Casso), Trieste 104 (79–140 Sappada), Klagenfurt 106
     (45 Tarvisio–175 Erto), Salisburgo 205 (147 Tarvisio), Monaco 278 (226 Tarvisio) contro costa 313, colline 306,
     carso 318; aer. Venezia 118 (74 Erto–137 Rigolato). T-OSRM: Tarvisio da Lubiana 87, Vienna 256.
     ============================================================== */
  montagna: {
    it: {
      titleSeo: "Montagna in Friuli: Carnia, Val Canale, Sappada", // fonte: G2 §3
      descriptionSeo:
        "58 comuni di montagna: Carnia, Val Canale e Canal del Ferro, Dolomiti friulane, Sappada, valli del Natisone. Tarvisio a circa 45 minuti da Klagenfurt.",
      h1: "Montagna: 58 comuni, Tarvisio a circa 45 minuti da Klagenfurt", // fonte: G2 §3; T-OSRM 45,2
      sottotitolo: "Carnia, Val Canale, Dolomiti friulane, Sappada e Prealpi Giulie: la parte alta della regione.",
      intro: [
        // fonte: COMUNI (somme, quote, densità calcolate; conteggio < 1.000 residenti)
        "Montagna sono i 58 comuni che l'ISTAT classifica «montagna interna». Coprono 3.414 km², il 43% della regione, ma ci vivono 59.833 persone, il 5%: circa 18 abitanti per km², contro i 150 della media regionale. Quarantadue comuni su 58 hanno meno di mille residenti; il più grande è Tolmezzo, con 9.702.",
        // fonte: COMUNI (altitudine_municipio_m; mediana vera 481 → «circa 480», G3 §1.2; alt_max Forni Avoltri 2.752 DEM ISTAT)
        "Le sedi municipali stanno fra 159 metri, a San Leonardo nelle valli del Natisone, e 1.242 a Sappada; metà dei municipi è sopra i 480 metri circa. Secondo il modello del terreno dell'ISTAT, il punto più alto dei territori comunali è nel comune di Forni Avoltri, a 2.752 metri.",
        // fonte: T-AREE (klagenfurt, salisburgo, monaco: montagna è la mediana più bassa; udine 59; trieste 104); T-OSRM Tarvisio
        "Da Klagenfurt, da Salisburgo e da Monaco è l'area più vicina delle quattro. In auto e senza traffico Tarvisio è a circa 45 minuti da Klagenfurt, 2 ore e 27 da Salisburgo e 3 ore e 46 da Monaco; da Monaco la mediana dei 58 comuni è di 4 ore e 38, contro le 5 ore e 13 della costa. Da Udine la mediana è di 59 minuti, da Trieste di 1 ora e 44.",
      ],
      paesaggi: [
        {
          nome: "Carnia",
          // fonte: AREE-C (AP 1 Carnia: 27 comuni); T-OSRM (Tolmezzo da Udine 42); COMUNI (Sauris 1.209, secondo municipio più alto dopo Sappada)
          testo:
            "Ventisette comuni nell'ambito di paesaggio «Carnia» del Piano regionale, da Tolmezzo, a circa 42 minuti da Udine, a Forni di Sopra, Paluzza, Ovaro e Sauris. Sauris ha il municipio a 1.209 metri, il più alto della regione dopo Sappada.",
        },
        {
          nome: "Val Canale e Canal del Ferro",
          // fonte: AREE-C (AP 2: Chiusaforte, Dogna, Malborghetto V., Moggio U., Pontebba, Resia, Resiutta, Tarvisio, Venzone); T-OSRM (Tarvisio: Klagenfurt 45, Lubiana 87; Malborghetto Klagenfurt 56); COMUNI (Tarvisio 3.903)
          testo:
            "Tarvisio, Malborghetto Valbruna, Pontebba, Dogna, Chiusaforte, Moggio Udinese, Resiutta, Resia e Venzone: nove comuni nell'ambito di paesaggio che il Piano chiama «Val Canale, Canal del Ferro, Val Resia». Tarvisio, con 3.903 residenti, è a circa 45 minuti da Klagenfurt e a 1 ora e 27 da Lubiana; Malborghetto a 56 minuti da Klagenfurt.",
        },
        {
          nome: "Dolomiti friulane e valli pordenonesi",
          // fonte: AREE-C (AP 3 Alte valli occidentali); it.wikipedia «Parco naturale delle Dolomiti Friulane» + UNESCO id 1237 (2009); T-AREE (Erto e Casso: Udine 102, aer. Venezia 74)
          testo:
            "Nelle alte valli occidentali, a Claut, Cimolais, Erto e Casso, Barcis, Andreis, Frisanco e Tramonti, le Dolomiti friulane fanno parte dal 2009 del bene UNESCO «Dolomiti». Sono i comuni più lontani da Udine, Erto e Casso a circa 1 ora e 42, ma i più vicini all'aeroporto di Venezia: Erto è a 1 ora e 14.",
        },
        {
          nome: "Sappada",
          // fonte: GEO §2 (L. 182/2017); COMUNI (1.242 m; UTS Udine); T-OSRM (Udine 95, Trieste 140, Monaco 278); KB sappadavillas
          testo:
            "Passata al Friuli Venezia Giulia con la legge 182 del 2017, Sappada ha il municipio più alto della regione, a 1.242 metri. È a circa 1 ora e 35 da Udine, 2 ore e 20 da Trieste e 4 ore e 38 da Monaco. Nel gruppo ha un sito tutto suo, sappadavillas.com.",
        },
        {
          nome: "Prealpi Giulie e valli del Natisone",
          // fonte: GEO §3 S4, §11 (i 9 comuni ISTAT montagna fuori AP 1-3); COMUNI (Drenchia 89, minimo regionale)
          testo:
            "Pulfero, San Leonardo, Savogna, Stregna, Grimacco, Drenchia, Lusevera e Taipana, a monte di Cividale e di Tarcento, più Forgaria nel Friuli: piccoli comuni che il Piano mette fra colline e pedemontana, ma che l'ISTAT classifica montagna. Drenchia, con 89 residenti, è il comune meno popoloso della regione.",
        },
      ],
      // fonte: GEO §3 (R1), §2 (L.R. 33/2002: Muggia, Duino, Sgonico, Aviano, Prepotto), §11 (58 = AP 1-3 + Sappada + 9)
      confine:
        "Qui la regola è la più semplice: è Montagna ogni comune che l'ISTAT classifica «montagna interna», la zona altimetrica nazionale, ed è la prima regola che si applica. Coincide con gli ambiti alpini del Piano paesaggistico, cioè Carnia, Val Canale-Canal del Ferro-Val Resia e alte valli occidentali, più Sappada e nove comuni delle valli orientali e della pedemontana. Non usiamo la legge regionale sulla montagna: è molto più larga, comprende per intero anche Aviano, Prepotto e perfino Muggia e Duino Aurisina, e serve per i contributi, non a dire dove si trova una casa. Sappada è l'unico comune senza doppia conferma, perché manca nelle schede del Piano del 2018.",
      senzaCase:
        "In questo momento non abbiamo case in vendita in montagna: se cercate qui, scriveteci. Per Sappada c'è anche il nostro sito sappadavillas.com.",
      faq: [
        {
          q: "Quanto è lontana la montagna dall'Austria?",
          // fonte: T-OSRM (Tarvisio 45, Malborghetto 56 da Klagenfurt); T-AREE (klagenfurt mediana 106, max 175 Erto e Casso)
          a: "Da Klagenfurt, in auto e senza attese, Tarvisio è a circa 45 minuti e Malborghetto Valbruna a 56. La mediana dei 58 comuni è di 1 ora e 46; il più lontano è Erto e Casso, a 2 ore e 55.",
        },
        {
          q: "Sappada fa parte del Friuli?",
          // fonte: GEO §2; COMUNI (uts_ex_provincia Udine)
          a: "Dal 2017 è un comune del Friuli Venezia Giulia, con la legge 182/2017, e nei dati ISTAT sta nell'ex provincia di Udine. Nelle schede del Piano paesaggistico regionale del 2018 non compare ancora.",
        },
        {
          q: "Le valli del Natisone sono montagna?",
          // fonte: GEO §8
          a: "Sì: Pulfero, San Leonardo, Savogna, Stregna, Grimacco e Drenchia sono montagna interna per l'ISTAT. Cividale, appena a valle, è invece collina e sta in Colline e pianura.",
        },
        {
          q: "Quanto dista la montagna dall'aeroporto di Venezia?",
          // fonte: T-AREE montagna aer_venezia (118; 74 Erto e Casso; 137 Rigolato)
          a: "In auto e senza traffico la mediana è di 1 ora e 58. Il comune più vicino è Erto e Casso, a 1 ora e 14; il più lontano Rigolato, a 2 ore e 17.",
        },
      ],
    },
    en: {
      titleSeo: "Friuli mountains: Carnia, Val Canale, Sappada", // fonte: G2 §3
      descriptionSeo:
        "58 mountain municipalities: Carnia, Val Canale and Canal del Ferro, Friulian Dolomites, Sappada, the Natisone valleys. Tarvisio about 45 min from Klagenfurt.",
      h1: "Mountains: 58 municipalities, Tarvisio about 45 minutes from Klagenfurt", // fonte: G2 §3
      sottotitolo: "Carnia, Val Canale, the Friulian Dolomites, Sappada and the Julian Pre-Alps: the region's high country.",
      intro: [
        // fonte: COMUNI
        "Mountains means the 58 municipalities that ISTAT, Italy's statistics office, classifies as inland mountain. They cover 3,414 km², 43% of the region, yet only 59,833 people live here, 5% of the total: about 18 inhabitants per km², against a regional average of 150. Forty-two of the 58 have fewer than a thousand residents; the largest is Tolmezzo, with 9,702.",
        // fonte: COMUNI; G3 §1.2
        "Town halls stand between 159 metres, at San Leonardo in the Natisone valleys, and 1,242 metres at Sappada; half of them are above roughly 480 metres. According to ISTAT's terrain model, the highest point of any municipality is in Forni Avoltri, at 2,752 metres.",
        // fonte: T-AREE; T-OSRM
        "From Klagenfurt, Salzburg and Munich this is the nearest of the four areas. Driving without traffic, Tarvisio is about 45 minutes from Klagenfurt, 2 h 27 min from Salzburg and 3 h 46 min from Munich; from Munich the median across the 58 municipalities is 4 h 38 min, compared with 5 h 13 min for the coast. From Udine the median is 59 minutes, from Trieste 1 h 44 min.",
      ],
      paesaggi: [
        {
          nome: "Carnia",
          // fonte: AREE-C; T-OSRM; COMUNI
          testo:
            "Twenty-seven municipalities in the regional plan's Carnia landscape zone, from Tolmezzo, about 42 minutes from Udine, to Forni di Sopra, Paluzza, Ovaro and Sauris. Sauris has its town hall at 1,209 metres, the highest in the region after Sappada.",
        },
        {
          nome: "Val Canale and Canal del Ferro",
          // fonte: AREE-C; T-OSRM; COMUNI
          testo:
            "Tarvisio, Malborghetto Valbruna, Pontebba, Dogna, Chiusaforte, Moggio Udinese, Resiutta, Resia and Venzone: nine municipalities in the zone the plan calls Val Canale, Canal del Ferro and Val Resia. Tarvisio, with 3,903 residents, is about 45 minutes from Klagenfurt and 1 h 27 min from Ljubljana; Malborghetto is 56 minutes from Klagenfurt.",
        },
        {
          nome: "The Friulian Dolomites and the Pordenone valleys",
          // fonte: AREE-C; it.wikipedia Parco Dolomiti Friulane; UNESCO id 1237; T-AREE
          testo:
            "In the upper western valleys, around Claut, Cimolais, Erto e Casso, Barcis, Andreis, Frisanco and Tramonti, the Friulian Dolomites have formed part of the UNESCO ‘Dolomites’ site since 2009. These are the municipalities farthest from Udine, Erto e Casso at about 1 h 42 min, but the closest to Venice airport: Erto is 1 h 14 min away.",
        },
        {
          nome: "Sappada",
          // fonte: GEO §2; COMUNI; T-OSRM
          testo:
            "Transferred to Friuli Venezia Giulia by Law 182 of 2017, Sappada has the highest town hall in the region, at 1,242 metres. It is about 1 h 35 min from Udine, 2 h 20 min from Trieste and 4 h 38 min from Munich. Within our group it has its own site, sappadavillas.com.",
        },
        {
          nome: "The Julian Pre-Alps and the Natisone valleys",
          // fonte: GEO §3, §11; COMUNI
          testo:
            "Pulfero, San Leonardo, Savogna, Stregna, Grimacco, Drenchia, Lusevera and Taipana, above Cividale and Tarcento, plus Forgaria nel Friuli: small municipalities that the landscape plan groups with the hills and foothills but ISTAT classifies as mountain. Drenchia, with 89 residents, is the least populated municipality in the region.",
        },
      ],
      // fonte: GEO §3, §2, §11
      confine:
        "The rule here is the simplest one: every municipality that ISTAT classifies as inland mountain, the national altitude zone, belongs to Mountains, and this rule is applied first. It matches the Alpine zones of the landscape plan, namely Carnia, Val Canale-Canal del Ferro-Val Resia and the upper western valleys, plus Sappada and nine municipalities in the eastern valleys and foothills. We do not use the regional mountain law: it is far broader, covering in full even Aviano, Prepotto, Muggia and Duino Aurisina, and it exists for grants, not to tell you where a house is. Sappada is the only municipality without a double confirmation, because it is missing from the plan's 2018 zone sheets.",
      senzaCase:
        "We have no homes for sale in the mountains right now. If this is where you are looking, write to us. For Sappada there is also our own site, sappadavillas.com.",
      faq: [
        {
          q: "How far are the mountains from Austria?",
          // fonte: T-OSRM; T-AREE
          a: "From Klagenfurt, without traffic or delays, Tarvisio is about 45 minutes away and Malborghetto Valbruna 56. The median across the 58 municipalities is 1 h 46 min; the farthest is Erto e Casso, at 2 h 55 min.",
        },
        {
          q: "Is Sappada part of Friuli?",
          // fonte: GEO §2; COMUNI
          a: "Since 2017 it has been a municipality of Friuli Venezia Giulia, under Law 182/2017, and ISTAT places it in the former province of Udine. It does not yet appear in the 2018 regional landscape plan.",
        },
        {
          q: "Are the Natisone valleys mountain or hills?",
          // fonte: GEO §8
          a: "Mountain: Pulfero, San Leonardo, Savogna, Stregna, Grimacco and Drenchia are inland mountain for ISTAT. Cividale, just below them, is hill country and belongs to Hills & Plain.",
        },
        {
          q: "How far are the mountains from Venice airport?",
          // fonte: T-AREE
          a: "Driving without traffic, the median is 1 h 58 min. The closest municipality is Erto e Casso, at 1 h 14 min; the farthest is Rigolato, at 2 h 17 min.",
        },
      ],
    },
    de: {
      // fonte toponimi DE: NOMI (Karnien, Kanaltal, Tarvis vivi; Pontafel/Peuscheldorf ecc. «veraltet» → non usati)
      titleSeo: "Berge im Friaul: Karnien, Kanaltal, Sappada", // fonte: G2 §3
      descriptionSeo:
        "58 Berggemeinden: Karnien, Kanaltal und Canal del Ferro, Friauler Dolomiten, Sappada, Natisone-Täler. Tarvis liegt rund 45 Minuten von Klagenfurt entfernt.",
      h1: "Von München aus sind die Berge näher als das Meer", // fonte: G2 §3; T-AREE monaco montagna 278 < costa 313
      sottotitolo: "Bergland: 58 Gemeinden zwischen Karnien, Kanaltal, Friauler Dolomiten, Sappada und Julischen Voralpen.",
      intro: [
        // fonte: COMUNI
        "Zu den Bergen zählen die 58 Gemeinden, die ISTAT, das italienische Statistikamt, als inneres Berggebiet einstuft. Sie bedecken 3.414 km², 43 % der Region, doch hier leben nur 59.833 Menschen, 5 %: rund 18 Einwohner je km² gegenüber 150 im regionalen Schnitt. Zweiundvierzig der 58 Gemeinden haben weniger als tausend Einwohner; die größte ist Tolmezzo mit 9.702.",
        // fonte: COMUNI; G3 §1.2
        "Die Rathäuser liegen zwischen 159 Metern in San Leonardo im Natisone-Tal und 1.242 Metern in Sappada; die Hälfte liegt über etwa 480 Metern. Nach dem Geländemodell von ISTAT befindet sich der höchste Punkt aller Gemeindegebiete in Forni Avoltri, auf 2.752 Metern.",
        // fonte: T-AREE; T-OSRM
        "Von Klagenfurt, Salzburg und München aus ist dies das nächstgelegene der vier Gebiete. Ohne Verkehr erreicht man Tarvis von Klagenfurt in rund 45 Minuten, von Salzburg in 2 Std. 27 Min., von München in 3 Std. 46 Min.; von München beträgt der Median der 58 Gemeinden 4 Std. 38 Min., an die Küste sind es 5 Std. 13 Min. Von Udine sind es im Median 59 Minuten, von Triest 1 Std. 44 Min.",
      ],
      paesaggi: [
        {
          nome: "Karnien",
          // fonte: AREE-C; T-OSRM; COMUNI
          testo:
            "Siebenundzwanzig Gemeinden im Landschaftsraum Karnien des regionalen Plans, von Tolmezzo, rund 42 Minuten von Udine, bis Forni di Sopra, Paluzza, Ovaro und Sauris. In Sauris steht das Rathaus auf 1.209 Metern – nach Sappada das höchstgelegene der Region.",
        },
        {
          nome: "Kanaltal und Canal del Ferro",
          // fonte: AREE-C; T-OSRM; COMUNI; NOMI (Tarvis, Kanaltal)
          testo:
            "Tarvis, Malborghetto Valbruna, Pontebba, Dogna, Chiusaforte, Moggio Udinese, Resiutta, Resia und Venzone: neun Gemeinden im Landschaftsraum, den der Plan „Val Canale, Canal del Ferro, Val Resia“ nennt. Tarvis mit 3.903 Einwohnern liegt rund 45 Minuten von Klagenfurt und 1 Std. 27 Min. von Ljubljana entfernt, Malborghetto 56 Minuten von Klagenfurt.",
        },
        {
          nome: "Friauler Dolomiten und die Täler um Pordenone",
          // fonte: AREE-C; it.wikipedia Parco Dolomiti Friulane; UNESCO id 1237; T-AREE
          testo:
            "In den oberen westlichen Tälern, um Claut, Cimolais, Erto e Casso, Barcis, Andreis, Frisanco und Tramonti, gehören die Friauler Dolomiten seit 2009 zur UNESCO-Welterbestätte „Dolomiten“. Es sind die Gemeinden, die am weitesten von Udine entfernt sind – Erto e Casso rund 1 Std. 42 Min. –, aber dem Flughafen Venedig am nächsten: Erto liegt 1 Std. 14 Min. entfernt.",
        },
        {
          nome: "Sappada",
          // fonte: GEO §2; COMUNI; T-OSRM; NOMI (DE «Pladen» attestato ma non corrente: si usa Sappada)
          testo:
            "Seit dem Gesetz Nr. 182 von 2017 gehört Sappada zu Friaul-Julisch Venetien; sein Rathaus liegt auf 1.242 Metern, so hoch wie kein anderes in der Region. Von Udine sind es rund 1 Std. 35 Min., von Triest 2 Std. 20 Min., von München 4 Std. 38 Min. In unserer Gruppe hat Sappada eine eigene Website, sappadavillas.com.",
        },
        {
          nome: "Julische Voralpen und Natisone-Täler",
          // fonte: GEO §3, §11; COMUNI
          testo:
            "Pulfero, San Leonardo, Savogna, Stregna, Grimacco, Drenchia, Lusevera und Taipana oberhalb von Cividale und Tarcento, dazu Forgaria nel Friuli: kleine Gemeinden, die der Landschaftsplan zum Hügelland und Voralpenrand rechnet, ISTAT aber als Berggebiet führt. Drenchia ist mit 89 Einwohnern die kleinste Gemeinde der Region.",
        },
      ],
      // fonte: GEO §3, §2, §11
      confine:
        "Hier gilt die einfachste Regel: Zu den Bergen gehört jede Gemeinde, die ISTAT als inneres Berggebiet einstuft – die nationale Höhenzone –, und diese Regel wird zuerst angewendet. Sie deckt sich mit den alpinen Räumen des Landschaftsplans, also Karnien, Kanaltal-Canal del Ferro-Val Resia und den oberen westlichen Tälern, dazu Sappada und neun Gemeinden der östlichen Täler und des Voralpenrands. Das regionale Berggesetz verwenden wir nicht: Es ist viel weiter gefasst, schließt sogar Aviano, Prepotto, Muggia und Duino Aurisina vollständig ein und dient der Förderung, nicht der Frage, wo ein Haus liegt. Sappada ist die einzige Gemeinde ohne doppelte Bestätigung, weil sie in den Raumblättern des Plans von 2018 fehlt.",
      senzaCase:
        "Derzeit haben wir in den Bergen keine Häuser zum Verkauf. Wenn Sie hier suchen, schreiben Sie uns. Für Sappada gibt es außerdem unsere eigene Website sappadavillas.com.",
      faq: [
        {
          q: "Wie weit sind die Berge von Österreich entfernt?",
          // fonte: T-OSRM; T-AREE
          a: "Von Klagenfurt erreicht man ohne Verkehr und Wartezeit Tarvis in rund 45 Minuten, Malborghetto Valbruna in 56. Der Median der 58 Gemeinden liegt bei 1 Std. 46 Min.; am weitesten ist es nach Erto e Casso, 2 Std. 55 Min.",
        },
        {
          q: "Gehört Sappada zum Friaul?",
          // fonte: GEO §2; COMUNI
          a: "Seit 2017 ist Sappada eine Gemeinde von Friaul-Julisch Venetien (Gesetz 182/2017); ISTAT führt sie in der früheren Provinz Udine. Im regionalen Landschaftsplan von 2018 ist sie noch nicht verzeichnet.",
        },
        {
          q: "Sind die Natisone-Täler Berg- oder Hügelland?",
          // fonte: GEO §8
          a: "Berggebiet: Pulfero, San Leonardo, Savogna, Stregna, Grimacco und Drenchia sind für ISTAT inneres Berggebiet. Cividale gleich unterhalb ist dagegen Hügelland und gehört zu Hügelland & Ebene.",
        },
        {
          q: "Wie weit sind die Berge vom Flughafen Venedig entfernt?",
          // fonte: T-AREE
          a: "Ohne Verkehr im Median 1 Std. 58 Min. Am nächsten liegt Erto e Casso mit 1 Std. 14 Min., am weitesten Rigolato mit 2 Std. 17 Min.",
        },
      ],
    },
    sl: {
      // fonte toponimi SL: NOMI (Karnija, Kanalska dolina, Železna dolina, Trbiž, Tablja, Naborjet - Ovčja vas, Rezija, Pušja vas, Nadiške doline, Čedad, Čenta); COMUNI nome_sl_wikidata (Tolmeč, Kluže, Dunja, Možac, Na Bili, Podbonesec, Podutana, Sovodnja, Srednje, Grmek, Dreka, Bardo, Tipana); Sappada senza esonimo SL
      titleSeo: "Furlanske gore: Karnija, Kanalska dolina, Sappada", // fonte: G2 §3
      descriptionSeo:
        "58 gorskih občin: Karnija, Kanalska in Železna dolina, Furlanski Dolomiti, Sappada, Nadiške doline. Trbiž je od Celovca oddaljen približno 45 minut vožnje.",
      h1: "Gore: 58 občin, Trbiž približno 45 minut od Celovca", // fonte: G2 §3
      sottotitolo: "Karnija, Kanalska dolina, Furlanski Dolomiti, Sappada in Julijske Predalpe: visoki svet dežele.",
      intro: [
        // fonte: COMUNI
        "Gore so 58 občin, ki jih italijanski statistični urad ISTAT uvršča v notranje gorsko območje. Pokrivajo 3.414 km², 43 % dežele, a v njih živi le 59.833 ljudi, 5 %: približno 18 prebivalcev na km² v primerjavi s 150 v deželnem povprečju. Dvainštirideset od 58 občin ima manj kot tisoč prebivalcev; največja je Tolmeč z 9.702.",
        // fonte: COMUNI; G3 §1.2
        "Občinski sedeži ležijo med 159 metri v Podutani v Nadiških dolinah in 1.242 metri v Sappadi; polovica jih je nad približno 480 metri. Po digitalnem modelu reliefa ISTAT je najvišja točka vseh občinskih ozemelj v občini Forni Avoltri, na 2.752 metrih.",
        // fonte: T-AREE (lubiana montagna 143 = la più alta delle 4: onestà verso il lettore SL); T-OSRM Tarvisio lubiana 87, klagenfurt 45
        "Za tiste, ki prihajajo iz Celovca, Salzburga ali Münchna, je to najbližje od štirih območij. Iz Ljubljane pa je najbolj oddaljeno: mediana 58 občin je 2 uri in 23 minut, a Trbiž je le približno 1 uro in 27 minut stran, iz Celovca pa 45 minut. Iz Vidma je mediana 59 minut, iz Trsta 1 ura in 44 minut – vse brez prometa.",
      ],
      paesaggi: [
        {
          nome: "Karnija",
          // fonte: AREE-C; T-OSRM; COMUNI; NOMI (Tolmeč)
          testo:
            "Sedemindvajset občin v krajinskem območju Karnija deželnega načrta, od Tolmeča, približno 42 minut od Vidma, do Forni di Sopra, Paluzze, Ovara in Saurisa. Občinski sedež Saurisa je na 1.209 metrih, za Sappado najvišji v deželi.",
        },
        {
          nome: "Kanalska in Železna dolina",
          // fonte: AREE-C; T-OSRM; COMUNI; NOMI; COMUNI nome_sl_wikidata
          testo:
            "Trbiž, Naborjet - Ovčja vas, Tablja, Dunja, Kluže, Možac, Na Bili, Rezija in Pušja vas: devet občin v krajinskem območju Kanalske doline, Železne doline in Rezije. Trbiž s 3.903 prebivalci je približno 45 minut od Celovca in 1 uro in 27 minut od Ljubljane, Naborjet pa 56 minut od Celovca.",
        },
        {
          nome: "Furlanski Dolomiti in pordenonske doline",
          // fonte: AREE-C; it.wikipedia Parco Dolomiti Friulane; UNESCO id 1237; T-AREE
          testo:
            "V zgornjih zahodnih dolinah, okoli Clauta, Cimolaisa, Erta e Cassa, Barcisa, Andreisa, Frisanca in Tramontov, so Furlanski Dolomiti od leta 2009 del Unescove dediščine »Dolomiti«. To so občine, ki so od Vidma najbolj oddaljene – Erto e Casso približno 1 uro in 42 minut –, beneškemu letališču pa najbližje: do Erta je 1 uro in 14 minut.",
        },
        {
          nome: "Sappada",
          // fonte: GEO §2; COMUNI; T-OSRM; NOMI (nessun esonimo SL)
          testo:
            "Sappada je z zakonom št. 182 iz leta 2017 prešla k Furlaniji - Julijski krajini in ima najvišje ležeči občinski sedež v deželi, na 1.242 metrih. Od Vidma je oddaljena približno 1 uro in 35 minut, od Trsta 2 uri in 20 minut. V naši skupini ima svojo spletno stran, sappadavillas.com.",
        },
        {
          nome: "Julijske Predalpe in Nadiške doline",
          // fonte: GEO §3, §11; COMUNI; COMUNI nome_sl_wikidata
          testo:
            "Podbonesec, Podutana, Sovodnja, Srednje, Grmek, Dreka, Bardo in Tipana nad Čedadom in Čento ter Forgaria nel Friuli: majhne občine, ki jih krajinski načrt šteje h gričevju in predgorju, ISTAT pa med gorske. Dreka z 89 prebivalci je najmanj naseljena občina v deželi.",
        },
      ],
      // fonte: GEO §3, §2, §11; NOMI (Milje, Devin - Nabrežina)
      confine:
        "Tu velja najpreprostejše pravilo: pod Gore spada vsaka občina, ki jo ISTAT uvršča v notranje gorsko območje – državni višinski pas –, in to pravilo se uporabi najprej. Ujema se z alpskimi območji krajinskega načrta, torej s Karnijo, Kanalsko in Železno dolino z Rezijo ter zgornjimi zahodnimi dolinami, k temu pa še Sappada in devet občin vzhodnih dolin in predgorja. Deželnega zakona o gorskih območjih ne uporabljamo: je veliko širši, v celoti zajema celo Aviano, Prapotno, Milje in Devin - Nabrežino, namenjen pa je spodbudam, ne temu, da bi povedal, kje stoji hiša. Sappada je edina občina brez dvojne potrditve, ker je v listih krajinskega načrta iz leta 2018 ni.",
      senzaCase:
        "Trenutno v gorah nimamo hiš naprodaj. Če iščete tukaj, nam pišite. Za Sappado je na voljo tudi naša spletna stran sappadavillas.com.",
      faq: [
        {
          q: "Kako daleč so gore od Ljubljane?",
          // fonte: T-AREE montagna lubiana (143; 87 Tarvisio; 187 Erto e Casso)
          a: "Brez prometa je mediana 58 občin 2 uri in 23 minut. Najbližji je Trbiž, približno 1 uro in 27 minut, najbolj oddaljen Erto e Casso, 3 ure in 7 minut.",
        },
        {
          q: "Kako daleč so gore od Avstrije?",
          // fonte: T-OSRM; T-AREE
          a: "Iz Celovca je do Trbiža brez prometa in čakanja približno 45 minut, do Naborjeta 56. Mediana 58 občin je 1 ura in 46 minut; najbolj oddaljen je Erto e Casso, 2 uri in 55 minut.",
        },
        {
          q: "Ali Sappada spada k Furlaniji?",
          // fonte: GEO §2; COMUNI
          a: "Od leta 2017 je občina Furlanije - Julijske krajine (zakon 182/2017), ISTAT jo vodi v nekdanji videmski pokrajini. V deželnem krajinskem načrtu iz leta 2018 je še ni.",
        },
        {
          q: "Ali so Nadiške doline gorsko območje?",
          // fonte: GEO §8; NOMI (Nadiške doline, Čedad)
          a: "Da: Podbonesec, Podutana, Sovodnja, Srednje, Grmek in Dreka so za ISTAT notranje gorsko območje. Čedad tik pod njimi pa je gričevnat in spada pod Gričevje in nižino.",
        },
      ],
    },
  },

  /* ==============================================================
     TRIESTE E CARSO — 10 comuni
     fonte: AREE-C (S4 = carso-trieste, tutti AP 11): Trieste, Muggia, San Dorligo della Valle, Sgonico,
     Monrupino, Duino Aurisina, Doberdò del Lago, Savogna d'Isonzo, Sagrado, Fogliano Redipuglia. COMUNI:
     235.925 residenti, di cui Trieste 198.388 (gli altri nove 37.537); 278,5 km²; 6 nomi ufficiali bilingui
     (denominazione_altra_lingua); 3 litoranei (Trieste, Muggia, Duino A.); municipi 5 (Muggia)–371 (Monrupino).
     T-AREE: Trieste 23 (2–47 Savogna) [mediana VERSO 10 comuni: NON è «Trieste a 23′», G3 §1.3], aer. Trieste 27
     (12 Fogliano–49 Muggia), Lubiana 75 (62 Monrupino–87 Fogliano), Udine 51. T-OSRM: Muggia 18, Monrupino 16,
     Sgonico 21, Duino 24, Doberdò 41 da Piazza Unità. Regola editoriale: niente concorrenza a TSV su «case a
     Trieste» (SPEC §5, G2 §3); in DE mai «Friaul».
     ============================================================== */
  "trieste-carso": {
    it: {
      titleSeo: "Carso, Duino e Muggia: l'area Trieste e Carso", // fonte: G2 §3 rivisto (niente «case a», niente «23 minuti»)
      descriptionSeo:
        "Dieci comuni fra Muggia e il Carso goriziano: l'altipiano, la costiera di Duino, Muggia. Tempi in auto misurati e, per la città di Trieste, triestevillas.com.",
      h1: "Trieste e Carso: dieci comuni fra Muggia e Doberdò del Lago", // fonte: AREE-C
      sottotitolo: "L'altipiano carsico, la costiera di Duino e Muggia; per la città di Trieste c'è triestevillas.com.",
      intro: [
        // fonte: AREE-C; COMUNI (residenti 2024; somma degli altri nove calcolata)
        "L'area comprende i dieci comuni che il Piano paesaggistico regionale assegna all'ambito «Carso e costiera orientale»: Trieste, Muggia, San Dorligo della Valle, Sgonico, Monrupino e Duino Aurisina nella ex provincia di Trieste; Doberdò del Lago, Savogna d'Isonzo, Sagrado e Fogliano Redipuglia nel Goriziano. Sono 278 km² e 235.925 residenti, ma 198.388 vivono nella città di Trieste: gli altri nove comuni insieme ne contano 37.537.",
        // fonte: SPEC §5 (ponte verso TSV, nessuna scheda copiata)
        "Per la città di Trieste il riferimento è il nostro sito gemello, triestevillas.com, e qui non ne ripetiamo le case. Su FriuliVillas quest'area racconta ciò che sta intorno alla città: l'altipiano carsico, la costiera verso Duino, Muggia a sud del golfo, il Carso goriziano verso l'Isonzo.",
        // fonte: COMUNI (denominazione_altra_lingua, 6 comuni); T-OSRM (da Piazza Unità: Muggia 18, Duino 24, Doberdò 41); T-AREE lubiana 75
        "Sei dei dieci comuni hanno per l'ISTAT un nome ufficiale in italiano e in sloveno: Duino Aurisina-Devin Nabrežina, Monrupino-Repentabor, San Dorligo della Valle-Dolina, Sgonico-Zgonik, Doberdò del Lago-Doberdob e Savogna d'Isonzo-Sovodnje ob Soči. Da Piazza Unità, in auto e senza traffico, Muggia è a circa 18 minuti, Duino Aurisina a 24 e Doberdò del Lago a 41; da Lubiana la mediana dell'area è di 1 ora e 15.",
      ],
      paesaggi: [
        {
          nome: "Duino e la costiera",
          // fonte: COMUNI (litoraneo; municipio 136 m; alt_max 343; residenti 8.217); T-OSRM (trieste 24, aer_trieste 25)
          testo:
            "Duino Aurisina è, con Trieste e Muggia, uno dei tre comuni dell'area che l'ISTAT considera litoranei. Conta 8.217 residenti; il municipio sta a 136 metri e il territorio sale fino a 343. È a circa 24 minuti da Piazza Unità e a 25 dall'aeroporto di Trieste.",
        },
        {
          nome: "Muggia",
          // fonte: COMUNI (municipio 5 m; alt_max 241; residenti 12.708); T-OSRM (trieste 18; lubiana 74)
          testo:
            "Muggia sta a sud di Trieste, sull'altro lato della baia, col municipio a 5 metri sul mare e un territorio che sale fino a 241 metri. Con 12.708 residenti è il secondo comune dell'area; è a circa 18 minuti da Piazza Unità e a 1 ora e 14 da Lubiana.",
        },
        {
          nome: "L'altipiano: Sgonico, Monrupino, San Dorligo",
          // fonte: COMUNI (municipi Monrupino 371, Sgonico 275; alt_max San Dorligo 666); T-OSRM (Monrupino 16, Sgonico 21 da Trieste); T-AREE (lubiana min 62 Monrupino)
          testo:
            "Sono i comuni del Carso alle spalle della città. Monrupino ha il municipio più alto dell'area, a 371 metri, Sgonico sta a 275; da Piazza Unità sono a circa 16 e 21 minuti, e Monrupino è il comune dell'area più vicino a Lubiana, a 62 minuti. San Dorligo della Valle, a sud-est, arriva a 666 metri di quota.",
        },
        {
          nome: "Il Carso goriziano",
          // fonte: AREE-C (AP 11 al 100%; zona ISTAT pianura per Fogliano e Sagrado); T-AREE (aer_trieste min 12 Fogliano; trieste max 47 Savogna)
          testo:
            "Doberdò del Lago, Savogna d'Isonzo, Sagrado e Fogliano Redipuglia stanno sul bordo occidentale del Carso, dove comincia la pianura dell'Isonzo. Sono i comuni dell'area più vicini all'aeroporto di Trieste, Fogliano a 12 minuti, e i più lontani da Piazza Unità: Savogna è a 47.",
        },
        {
          nome: "La città di Trieste",
          // fonte: GEO §8; SPEC §5
          testo:
            "Trieste rientra nell'area per regola, ma le sue case stanno su triestevillas.com, il sito del nostro gruppo dedicato alla città: lì trovate quartieri, zone e annunci.",
        },
      ],
      // fonte: GEO §3 (R2 dopo R1, prima di R3), §8 (Duino 93%, Muggia 100%; Fogliano e Sagrado pianura ISTAT)
      confine:
        "Decide il paesaggio. Un comune è in Trieste e Carso se il Piano paesaggistico regionale del 2018 mette la maggior parte del suo territorio nell'ambito «Carso e costiera orientale»; questa regola viene dopo quella della montagna e prima di quella della costa. Per questo Duino Aurisina, al 93% nell'ambito, e Muggia, al 100%, stanno qui e non accanto a Lignano. Il caso discutibile è il Carso goriziano: per il Piano Fogliano Redipuglia e Sagrado sono interamente Carso, ma l'ISTAT li classifica pianura, e chi li descrive come pianura isontina non sbaglia.",
      senzaCase:
        "Oggi non abbiamo case in vendita nel Carso fuori dalla città: per Trieste guardate triestevillas.com, per il resto scriveteci.",
      faq: [
        {
          q: "Perché qui non trovo case nella città di Trieste?",
          // fonte: SPEC §5
          a: "Perché la città ha il suo sito, triestevillas.com, dello stesso gruppo. Qui mostriamo le case del Carso e della costa intorno, e per la città vi rimandiamo là senza duplicare gli annunci.",
        },
        {
          q: "Quanto dista il Carso da Lubiana?",
          // fonte: T-AREE carso-trieste lubiana
          a: "In auto e senza traffico la mediana dei dieci comuni è di 1 ora e 15 da Prešernov trg. Il più vicino è Monrupino, a 62 minuti; il più lontano Fogliano Redipuglia, a 1 ora e 27.",
        },
        {
          q: "Perché alcuni comuni hanno due nomi?",
          // fonte: COMUNI (denominazione_altra_lingua); GEO §5
          a: "Sei dei dieci hanno una denominazione ufficiale in italiano e in sloveno, registrata dall'ISTAT: per esempio Duino Aurisina-Devin Nabrežina o Sgonico-Zgonik. Negli atti ufficiali possono comparire entrambe le forme.",
        },
        {
          q: "Quanto dista l'area dall'aeroporto di Trieste?",
          // fonte: T-AREE carso-trieste aer_trieste
          a: "Dal terminal di Ronchi dei Legionari la mediana è di 27 minuti, in auto e senza traffico: da 12 per Fogliano Redipuglia a 49 per Muggia.",
        },
      ],
    },
    en: {
      titleSeo: "The Karst, Duino and Muggia: Trieste & Karst area",
      descriptionSeo:
        "Ten municipalities from Muggia to the Gorizia Karst: the plateau, the Duino coast, Muggia. Measured driving times and, for Trieste itself, triestevillas.com.",
      h1: "Trieste & Karst: ten municipalities from Muggia to Doberdò del Lago",
      sottotitolo: "The Karst plateau, the Duino coast and Muggia; for the city of Trieste, see triestevillas.com.",
      intro: [
        // fonte: AREE-C; COMUNI
        "This area covers the ten municipalities that the regional landscape plan assigns to the ‘Karst and eastern coast’ zone: Trieste, Muggia, San Dorligo della Valle, Sgonico, Monrupino and Duino Aurisina in the former province of Trieste, and Doberdò del Lago, Savogna d'Isonzo, Sagrado and Fogliano Redipuglia on the Gorizia side. Together they cover 278 km² and have 235,925 residents, but 198,388 of them live in the city of Trieste; the other nine municipalities have 37,537 between them.",
        // fonte: SPEC §5
        "For the city of Trieste itself, our sister site triestevillas.com is the place to look, and we do not repeat its listings here. On FriuliVillas this area is about what surrounds the city: the Karst plateau, the coast towards Duino, Muggia on the south side of the gulf, and the Gorizia Karst towards the Isonzo.",
        // fonte: COMUNI; T-OSRM; T-AREE
        "Six of the ten municipalities have an official name in both Italian and Slovene, as recorded by ISTAT: Duino Aurisina-Devin Nabrežina, Monrupino-Repentabor, San Dorligo della Valle-Dolina, Sgonico-Zgonik, Doberdò del Lago-Doberdob and Savogna d'Isonzo-Sovodnje ob Soči. From Piazza Unità, driving without traffic, Muggia is about 18 minutes away, Duino Aurisina 24 and Doberdò del Lago 41; from Ljubljana the median for the area is 1 h 15 min.",
      ],
      paesaggi: [
        {
          nome: "Duino and the coast",
          // fonte: COMUNI; T-OSRM
          testo:
            "Duino Aurisina is, with Trieste and Muggia, one of the three municipalities here that ISTAT counts as coastal. It has 8,217 residents; its town hall stands at 136 metres and its land rises to 343. It is about 24 minutes from Piazza Unità and 25 from Trieste Airport.",
        },
        {
          nome: "Muggia",
          // fonte: COMUNI; T-OSRM
          testo:
            "Muggia lies south of Trieste, across the bay, with its town hall 5 metres above the sea and land rising to 241 metres. With 12,708 residents it is the second-largest municipality in the area, about 18 minutes from Piazza Unità and 1 h 14 min from Ljubljana.",
        },
        {
          nome: "The plateau: Sgonico, Monrupino, San Dorligo",
          // fonte: COMUNI; T-OSRM; T-AREE
          testo:
            "These are the Karst municipalities behind the city. Monrupino has the highest town hall in the area, at 371 metres, and Sgonico's stands at 275; they are about 16 and 21 minutes from Piazza Unità, and Monrupino is the municipality closest to Ljubljana, at 62 minutes. San Dorligo della Valle, to the south-east, reaches 666 metres.",
        },
        {
          nome: "The Gorizia Karst",
          // fonte: AREE-C; T-AREE
          testo:
            "Doberdò del Lago, Savogna d'Isonzo, Sagrado and Fogliano Redipuglia sit on the western edge of the Karst, where the Isonzo plain begins. They are the closest to Trieste Airport, Fogliano at 12 minutes, and the farthest from Piazza Unità: Savogna is 47 minutes away.",
        },
        {
          nome: "The city of Trieste",
          // fonte: GEO §8; SPEC §5
          testo:
            "Trieste falls within the area by rule, but its homes are on triestevillas.com, our group's site dedicated to the city, where you will find its districts, zones and listings.",
        },
      ],
      // fonte: GEO §3, §8
      confine:
        "Landscape decides. A municipality belongs to Trieste & Karst if the 2018 regional landscape plan places most of its land in the ‘Karst and eastern coast’ zone; this rule comes after the mountain rule and before the coast rule. That is why Duino Aurisina, 93% within the zone, and Muggia, 100%, are here and not next to Lignano. The debatable case is the Gorizia Karst: for the plan, Fogliano Redipuglia and Sagrado are entirely Karst, but ISTAT classifies them as plain, and anyone who describes them as part of the Isonzo plain is not wrong.",
      senzaCase:
        "We have no homes for sale in the Karst outside the city at the moment. For Trieste, see triestevillas.com; for anything else, write to us.",
      faq: [
        {
          q: "Why can't I find homes in the city of Trieste here?",
          // fonte: SPEC §5
          a: "Because the city has its own site, triestevillas.com, run by the same group. Here we show homes in the Karst and along the surrounding coast, and for the city we send you there rather than duplicating listings.",
        },
        {
          q: "How far is the Karst from Ljubljana?",
          // fonte: T-AREE
          a: "Driving without traffic, the median of the ten municipalities is 1 h 15 min from Prešernov trg. The closest is Monrupino, at 62 minutes; the farthest is Fogliano Redipuglia, at 1 h 27 min.",
        },
        {
          q: "Why do some municipalities have two names?",
          // fonte: COMUNI; GEO §5
          a: "Six of the ten have an official name in Italian and Slovene, recorded by ISTAT, such as Duino Aurisina-Devin Nabrežina or Sgonico-Zgonik. Official documents may use either form.",
        },
        {
          q: "How far is the area from Trieste Airport?",
          // fonte: T-AREE
          a: "From the terminal at Ronchi dei Legionari the median is 27 minutes, driving without traffic: from 12 for Fogliano Redipuglia to 49 for Muggia.",
        },
      ],
    },
    de: {
      // fonte: GEO §5 (in DE «Friaul» NON comprende Trieste e il Carso: mai usato in questo blocco); NOMI (Triest, Karst, Görz)
      titleSeo: "Triester Karst, Duino und Muggia: Triest & Karst", // fonte: G2 §3 rivisto
      descriptionSeo:
        "Zehn Gemeinden zwischen Muggia und dem Karst bei Görz: Hochfläche, Küste bei Duino, Muggia. Gemessene Fahrzeiten und für die Stadt Triest triestevillas.com.",
      h1: "Triest & Karst: zehn Gemeinden zwischen Muggia und Doberdò del Lago",
      sottotitolo: "Die Karsthochfläche, die Küste bei Duino und Muggia; für die Stadt Triest gibt es triestevillas.com.",
      intro: [
        // fonte: AREE-C; COMUNI
        "Das Gebiet umfasst die zehn Gemeinden, die der regionale Landschaftsplan dem Raum „Karst und östliche Küste“ zuordnet: Triest, Muggia, San Dorligo della Valle, Sgonico, Monrupino und Duino Aurisina in der früheren Provinz Triest sowie Doberdò del Lago, Savogna d'Isonzo, Sagrado und Fogliano Redipuglia auf der Görzer Seite. Zusammen sind es 278 km² und 235.925 Einwohner, von denen aber 198.388 in der Stadt Triest leben; die übrigen neun Gemeinden zählen zusammen 37.537.",
        // fonte: SPEC §5
        "Für die Stadt Triest ist unsere Schwesterseite triestevillas.com zuständig; deren Angebote wiederholen wir hier nicht. Auf FriuliVillas zeigt dieses Gebiet, was die Stadt umgibt: die Karsthochfläche, die Küste Richtung Duino, Muggia auf der Südseite des Golfs und den Görzer Karst zum Isonzo hin.",
        // fonte: COMUNI; T-OSRM; T-AREE
        "Sechs der zehn Gemeinden tragen laut ISTAT einen amtlichen Namen auf Italienisch und Slowenisch: Duino Aurisina-Devin Nabrežina, Monrupino-Repentabor, San Dorligo della Valle-Dolina, Sgonico-Zgonik, Doberdò del Lago-Doberdob und Savogna d'Isonzo-Sovodnje ob Soči. Von der Piazza Unità erreicht man ohne Verkehr Muggia in rund 18 Minuten, Duino Aurisina in 24 und Doberdò del Lago in 41; von Ljubljana beträgt der Median 1 Std. 15 Min.",
      ],
      paesaggi: [
        {
          nome: "Duino und die Küste",
          // fonte: COMUNI; T-OSRM
          testo:
            "Duino Aurisina ist neben Triest und Muggia eine der drei Gemeinden des Gebiets, die ISTAT als Küstengemeinde führt. Sie hat 8.217 Einwohner; das Rathaus liegt auf 136 Metern, das Gemeindegebiet steigt bis 343 Meter an. Zur Piazza Unità sind es rund 24 Minuten, zum Flughafen Triest 25.",
        },
        {
          nome: "Muggia",
          // fonte: COMUNI; T-OSRM
          testo:
            "Muggia liegt südlich von Triest auf der anderen Seite der Bucht, das Rathaus 5 Meter über dem Meer, das Gemeindegebiet bis 241 Meter hoch. Mit 12.708 Einwohnern ist es die zweitgrößte Gemeinde des Gebiets, rund 18 Minuten von der Piazza Unità und 1 Std. 14 Min. von Ljubljana entfernt.",
        },
        {
          nome: "Die Hochfläche: Sgonico, Monrupino, San Dorligo",
          // fonte: COMUNI; T-OSRM; T-AREE
          testo:
            "Das sind die Karstgemeinden hinter der Stadt. Monrupino hat mit 371 Metern das höchstgelegene Rathaus des Gebiets, Sgonico liegt auf 275 Metern; zur Piazza Unità sind es rund 16 bzw. 21 Minuten, und Monrupino ist die Gemeinde, die Ljubljana am nächsten liegt: 62 Minuten. San Dorligo della Valle im Südosten reicht bis auf 666 Meter.",
        },
        {
          nome: "Der Karst bei Görz",
          // fonte: AREE-C; T-AREE
          testo:
            "Doberdò del Lago, Savogna d'Isonzo, Sagrado und Fogliano Redipuglia liegen am Westrand des Karsts, wo die Isonzo-Ebene beginnt. Sie sind dem Flughafen Triest am nächsten – Fogliano 12 Minuten – und am weitesten von der Piazza Unità entfernt: nach Savogna sind es 47 Minuten.",
        },
        {
          nome: "Die Stadt Triest",
          // fonte: GEO §8; SPEC §5
          testo:
            "Triest gehört nach der Regel zum Gebiet, seine Häuser finden Sie aber auf triestevillas.com, der Website unserer Gruppe für die Stadt, mit Vierteln, Lagen und Angeboten.",
        },
      ],
      // fonte: GEO §3, §8
      confine:
        "Es entscheidet die Landschaft. Eine Gemeinde gehört zu Triest & Karst, wenn der regionale Landschaftsplan von 2018 den größten Teil ihrer Fläche dem Raum „Karst und östliche Küste“ zuordnet; diese Regel kommt nach der Bergregel und vor der Küstenregel. Deshalb stehen Duino Aurisina (zu 93 % in diesem Raum) und Muggia (zu 100 %) hier und nicht neben Lignano. Strittig ist der Görzer Karst: Für den Plan sind Fogliano Redipuglia und Sagrado vollständig Karst, ISTAT führt sie aber als Ebene – wer sie zur Isonzo-Ebene zählt, liegt nicht falsch.",
      senzaCase:
        "Derzeit haben wir im Karst außerhalb der Stadt keine Häuser zum Verkauf. Für Triest finden Sie Angebote auf triestevillas.com, für alles andere schreiben Sie uns.",
      faq: [
        {
          q: "Warum finde ich hier keine Häuser in der Stadt Triest?",
          // fonte: SPEC §5
          a: "Weil die Stadt eine eigene Website hat, triestevillas.com, aus derselben Gruppe. Hier zeigen wir Häuser im Karst und an der umliegenden Küste; für die Stadt verweisen wir dorthin, statt Angebote doppelt zu führen.",
        },
        {
          q: "Wie weit ist der Karst von Ljubljana entfernt?",
          // fonte: T-AREE
          a: "Ohne Verkehr beträgt der Median der zehn Gemeinden 1 Std. 15 Min. ab Prešernov trg. Am nächsten liegt Monrupino mit 62 Minuten, am weitesten Fogliano Redipuglia mit 1 Std. 27 Min.",
        },
        {
          q: "Warum haben manche Gemeinden zwei Namen?",
          // fonte: COMUNI; GEO §5
          a: "Sechs der zehn tragen einen amtlichen Namen auf Italienisch und Slowenisch, den ISTAT führt, etwa Duino Aurisina-Devin Nabrežina oder Sgonico-Zgonik. In amtlichen Dokumenten kann jede der beiden Formen stehen.",
        },
        {
          q: "Wie weit ist das Gebiet vom Flughafen Triest entfernt?",
          // fonte: T-AREE
          a: "Vom Terminal in Ronchi dei Legionari ohne Verkehr im Median 27 Minuten: von 12 Minuten nach Fogliano Redipuglia bis 49 nach Muggia.",
        },
      ],
    },
    sl: {
      // fonte toponimi SL: NOMI (Trst, Kras, Milje, Devin - Nabrežina); COMUNI denominazione_altra_lingua (Repentabor, Dolina, Zgonik, Doberdob, Sovodnje ob Soči) e nome_sl_wikidata (Zagraj, Sredipolje)
      titleSeo: "Tržaški Kras, Devin in Milje: območje Trst in Kras", // fonte: G2 §3 rivisto
      descriptionSeo:
        "Deset občin med Miljami in Goriškim Krasom: kraška planota, obala pri Devinu, Milje. Izmerjeni časi vožnje, za mesto Trst pa stran triestevillas.com.",
      h1: "Trst in Kras: deset občin med Miljami in Doberdobom",
      sottotitolo: "Kraška planota, obala pri Devinu in Milje; za mesto Trst je tu triestevillas.com.",
      intro: [
        // fonte: AREE-C; COMUNI
        "Območje zajema deset občin, ki jih deželni krajinski načrt uvršča v območje »Kras in vzhodna obala«: Trst, Milje, Dolino, Zgonik, Repentabor in Devin - Nabrežino v nekdanji tržaški pokrajini ter Doberdob, Sovodnje ob Soči, Zagraj in Foljan - Sredipolje na Goriškem. Skupaj merijo 278 km² in imajo 235.925 prebivalcev, od tega jih 198.388 živi v mestu Trst; preostalih devet občin jih ima skupaj 37.537.",
        // fonte: SPEC §5
        "Za samo mesto Trst je pravi naslov naša sestrska stran triestevillas.com, njenih ponudb tukaj ne ponavljamo. Na FriuliVillas to območje predstavlja, kar mesto obdaja: kraško planoto, obalo proti Devinu, Milje na južni strani zaliva in Goriški Kras proti Soči.",
        // fonte: COMUNI; T-OSRM; T-AREE
        "Šest od desetih občin ima po podatkih ISTAT uradno ime v italijanščini in slovenščini: Devin Nabrežina, Repentabor, Dolina, Zgonik, Doberdob in Sovodnje ob Soči. S Trga Unità je brez prometa do Milj približno 18 minut, do Devina - Nabrežine 24, do Doberdoba 41; iz Ljubljane je mediana območja 1 ura in 15 minut.",
      ],
      paesaggi: [
        {
          nome: "Devin in obala",
          // fonte: COMUNI; T-OSRM
          testo:
            "Devin - Nabrežina je poleg Trsta in Milj ena od treh občin območja, ki jih ISTAT vodi kot obalne. Ima 8.217 prebivalcev; občinski sedež je na 136 metrih, ozemlje se dviga do 343 metrov. S Trga Unità je približno 24 minut, s tržaškega letališča 25.",
        },
        {
          nome: "Milje",
          // fonte: COMUNI; T-OSRM
          testo:
            "Milje ležijo južno od Trsta, na drugi strani zaliva, z občinskim sedežem 5 metrov nad morjem in ozemljem, ki se vzpenja do 241 metrov. Z 12.708 prebivalci so druga največja občina območja, približno 18 minut od Trga Unità in 1 uro in 14 minut od Ljubljane.",
        },
        {
          nome: "Planota: Zgonik, Repentabor, Dolina",
          // fonte: COMUNI; T-OSRM; T-AREE
          testo:
            "To so kraške občine za mestom. Repentabor ima najvišje ležeči občinski sedež območja, na 371 metrih, Zgonik je na 275; od Trga Unità sta oddaljena približno 16 in 21 minut, Repentabor pa je Ljubljani najbližja občina območja, 62 minut. Dolina na jugovzhodu sega do 666 metrov.",
        },
        {
          nome: "Goriški Kras",
          // fonte: AREE-C; T-AREE
          testo:
            "Doberdob, Sovodnje ob Soči, Zagraj in Foljan - Sredipolje ležijo na zahodnem robu Krasa, kjer se začne posoška nižina. Tržaškemu letališču so najbližje – Sredipolje 12 minut –, od Trga Unità pa najbolj oddaljene: do Sovodenj je 47 minut.",
        },
        {
          nome: "Mesto Trst",
          // fonte: GEO §8; SPEC §5
          testo:
            "Trst po pravilu spada v to območje, njegove hiše pa so na triestevillas.com, strani naše skupine, posvečeni mestu, kjer najdete četrti, lege in ponudbe.",
        },
      ],
      // fonte: GEO §3, §8
      confine:
        "Odloča pokrajina. Občina spada v območje Trst in Kras, če deželni krajinski načrt iz leta 2018 večino njenega ozemlja uvršča v območje »Kras in vzhodna obala«; to pravilo se uporabi po gorskem in pred obalnim. Zato sta Devin - Nabrežina (93 % v tem območju) in Milje (100 %) tukaj in ne poleg Lignana. Sporen je Goriški Kras: za načrt sta Foljan - Sredipolje in Zagraj v celoti Kras, ISTAT pa ju vodi kot nižino – kdor ju prišteva k posoški nižini, se ne moti.",
      senzaCase:
        "Trenutno na Krasu zunaj mesta nimamo hiš naprodaj. Za Trst poglejte triestevillas.com, za vse drugo nam pišite.",
      faq: [
        {
          q: "Zakaj tukaj ne najdem hiš v mestu Trst?",
          // fonte: SPEC §5
          a: "Ker ima mesto svojo stran, triestevillas.com, iste skupine. Tukaj prikazujemo hiše na Krasu in ob okoliški obali, za mesto pa vas napotimo tja, namesto da bi ponudbe podvajali.",
        },
        {
          q: "Kako daleč je Kras od Ljubljane?",
          // fonte: T-AREE
          a: "Brez prometa je mediana desetih občin 1 ura in 15 minut s Prešernovega trga. Najbližji je Repentabor, 62 minut, najbolj oddaljeno Sredipolje, 1 uro in 27 minut.",
        },
        {
          q: "Zakaj imajo nekatere občine dve imeni?",
          // fonte: COMUNI; GEO §5
          a: "Šest od desetih ima uradno ime v italijanščini in slovenščini, ki ga vodi ISTAT, na primer Duino Aurisina-Devin Nabrežina ali Sgonico-Zgonik. V uradnih listinah se lahko pojavi katera koli od obeh oblik.",
        },
        {
          q: "Kako daleč je območje od tržaškega letališča?",
          // fonte: T-AREE
          a: "Od terminala v Ronkah je brez prometa mediana 27 minut: od 12 minut do Sredipolja do 49 do Milj.",
        },
      ],
    },
  },
};
