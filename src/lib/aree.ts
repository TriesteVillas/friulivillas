/* ================================================================
   Le AREE di friulivillas.com (07/10/2026) — il modulo unico.

   Fino al 06/10 il sito raggruppava per il campo `zona` del CRM, che è
   una tassonomia di TRIESTE (CENTRO, BARCOLA, COSTIERA…): fuori dalla
   provincia ogni casa aveva `zona = FVG`, e l'isola di Grado finiva nello
   stesso secchio del quadrilocale di Sappada. Mandato di Martino del 06/10:
   «almeno mare, Friuli centrale e montagna».

   LA REGOLA, per COMUNE (mai per `zona`), dalle classificazioni
   istituzionali — dossier tsv-kb progetti/friulivillas/territorio/
   GEOGRAFIA-AREE.md, dati in data/geo/ (generati da scripts/genera-aree.mjs):
     1. Montagna          = zona altimetrica ISTAT «montagna interna»
     2. Trieste e Carso   = ambito «Carso e costiera orientale» del Piano
                            paesaggistico regionale (2018)
     3. Costa e laguna    = ambito «Laguna e costa» del PPR, o comune
                            litoraneo ISTAT
     4. Colline e pianura = tutto il resto
   La prima che si applica vince. 215 comuni: 58 · 10 · 9 · 138.

   UNA CORREZIONE PER IMMOBILE, misurata e non a mano: alcuni comuni della
   costa hanno il centro o le frazioni lontani dal mare (San Canzian
   d'Isonzo: il comune è per il 54% laguna, la frazione di Begliano sta a
   5,5 km dalla costa). Se la casa ha le coordinate e dista più di
   SOGLIA_COSTA_KM dalla linea di costa ISTAT, esce da «Costa e laguna» e
   va in «Colline e pianura». Nessun'altra area si sposta per coordinate.

   PURO: niente import, niente fetch — lo carica anche il cancello del
   prebuild (scripts/check-aree.mjs) con lo strip dei tipi di Node.
   ================================================================ */

export type AreaId = "costa-laguna" | "colline-pianura" | "montagna" | "trieste-carso";
export type Lingua = "it" | "en" | "de" | "sl";

/** In ordine di racconto: dal mare ai monti, poi Trieste, la porta verso triestevillas.com. */
export const AREE: readonly AreaId[] = ["costa-laguna", "colline-pianura", "montagna", "trieste-carso"];

export const NOMI_AREA: Record<AreaId, Record<Lingua, string>> = {
  "costa-laguna": { it: "Costa e laguna", en: "Coast & Lagoon", de: "Küste & Lagune", sl: "Obala in laguna" },
  "colline-pianura": { it: "Colline e pianura", en: "Hills & Plain", de: "Hügelland & Ebene", sl: "Gričevje in nižina" },
  montagna: { it: "Montagna", en: "Mountains", de: "Bergland", sl: "Gore" },
  "trieste-carso": { it: "Trieste e Carso", en: "Trieste & Karst", de: "Triest & Karst", sl: "Trst in Kras" },
};

/** Lo slug dell'URL, per lingua: /area/<slug>. */
export const SLUG_AREA: Record<AreaId, Record<Lingua, string>> = {
  "costa-laguna": { it: "costa-e-laguna", en: "coast-and-lagoon", de: "kueste-und-lagune", sl: "obala-in-laguna" },
  "colline-pianura": { it: "colline-e-pianura", en: "hills-and-plain", de: "huegelland-und-ebene", sl: "gricevje-in-nizina" },
  montagna: { it: "montagna", en: "mountains", de: "bergland", sl: "gore" },
  "trieste-carso": { it: "trieste-e-carso", en: "trieste-and-karst", de: "triest-und-karst", sl: "trst-in-kras" },
};

export const SOGLIA_COSTA_KM = 4;

export function areaDaSlug(slug: string, lingua: Lingua): AreaId | null {
  for (const a of AREE) if (SLUG_AREA[a][lingua] === slug) return a;
  return null;
}

/** «Duino-Aurisina», «Duino Aurisina», «San Canzian d’Isonzo»… → una chiave sola. */
export function chiaveComune(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function areaDelComune(comune: string | null | undefined): AreaId | null {
  if (!comune) return null;
  const k = chiaveComune(comune);
  return (COMUNI[k]?.[1] as AreaId | undefined) ?? (ALIAS[k] ? (COMUNI[ALIAS[k]][1] as AreaId) : null);
}

/** Distanza in km da un punto alla linea di costa (polilinee, equirettangolare locale). */
export function kmDallaCosta(lat: number, lng: number): number {
  const kx = 111.32 * Math.cos((lat * Math.PI) / 180);
  const ky = 110.57;
  let best = Infinity;
  for (const linea of COSTA) {
    for (let i = 0; i + 1 < linea.length; i++) {
      const ax = (linea[i][0] - lng) * kx, ay = (linea[i][1] - lat) * ky;
      const bx = (linea[i + 1][0] - lng) * kx, by = (linea[i + 1][1] - lat) * ky;
      const dx = bx - ax, dy = by - ay;
      const l2 = dx * dx + dy * dy;
      const t = l2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2)) : 0;
      const d = Math.hypot(ax + t * dx, ay + t * dy);
      if (d < best) best = d;
    }
  }
  return best;
}

export type PerArea = { comune: string | null; lat?: number | null; lng?: number | null };

/** L'area di una casa: il comune decide, le coordinate correggono solo la costa. */
export function areaDi(p: PerArea): AreaId | null {
  const a = areaDelComune(p.comune);
  if (a === "costa-laguna" && p.lat != null && p.lng != null && kmDallaCosta(p.lat, p.lng) > SOGLIA_COSTA_KM) {
    return "colline-pianura";
  }
  return a;
}

/** Il nome ufficiale del comune (ISTAT), se lo conosciamo. */
export function nomeComune(comune: string): string | null {
  const k = chiaveComune(comune);
  return COMUNI[k]?.[0] ?? (ALIAS[k] ? COMUNI[ALIAS[k]][0] : null);
}

/** Sede municipale del comune (OSM, controllata dentro il confine ISTAT) e codice ISTAT. */
export function sedeComune(comune: string | null | undefined): { lat: number; lng: number; istat: string; nome: string } | null {
  if (!comune) return null;
  const k = chiaveComune(comune);
  const r = COMUNI[k] ?? (ALIAS[k] ? COMUNI[ALIAS[k]] : undefined);
  return r ? { nome: r[0], lat: r[2], lng: r[3], istat: r[4] } : null;
}

/** Tutti i comuni, per la carta e gli strumenti: [nome, area, lat, lng, istat]. */
export function tuttiIComuni(): { nome: string; area: AreaId; lat: number; lng: number; istat: string }[] {
  return Object.values(COMUNI).map((r) => ({ nome: r[0], area: r[1] as AreaId, lat: r[2], lng: r[3], istat: r[4] }));
}

// <dati> — generato da scripts/genera-aree.mjs, non modificare a mano
const COMUNI: Record<string, [string, string, number, number, string]> = {"aiellodelfriuli":["Aiello del Friuli","colline-pianura",45.870691,13.362331,"030001"],"amaro":["Amaro","montagna",46.373824,13.096118,"030002"],"ampezzo":["Ampezzo","montagna",46.416622,12.794601,"030003"],"aquileia":["Aquileia","costa-laguna",45.766434,13.364921,"030004"],"artaterme":["Arta Terme","montagna",46.472837,13.024952,"030005"],"artegna":["Artegna","colline-pianura",46.241786,13.15602,"030006"],"attimis":["Attimis","colline-pianura",46.188712,13.305112,"030007"],"bagnariaarsa":["Bagnaria Arsa","colline-pianura",45.887943,13.301511,"030008"],"basiliano":["Basiliano","colline-pianura",46.015919,13.106787,"030009"],"bertiolo":["Bertiolo","colline-pianura",45.943497,13.055082,"030010"],"bicinicco":["Bicinicco","colline-pianura",45.931282,13.249551,"030011"],"bordano":["Bordano","montagna",46.315353,13.106064,"030012"],"buja":["Buja","colline-pianura",46.209018,13.125724,"030013"],"buttrio":["Buttrio","colline-pianura",46.013108,13.330438,"030014"],"caminoaltagliamento":["Camino al Tagliamento","colline-pianura",45.927129,12.94407,"030015"],"campoformido":["Campoformido","colline-pianura",46.019846,13.160077,"030016"],"carlino":["Carlino","colline-pianura",45.801736,13.188041,"030018"],"cassacco":["Cassacco","colline-pianura",46.173947,13.186293,"030019"],"castionsdistrada":["Castions di Strada","colline-pianura",45.908487,13.185076,"030020"],"cavazzocarnico":["Cavazzo Carnico","montagna",46.367246,13.041025,"030021"],"cercivento":["Cercivento","montagna",46.527049,12.987961,"030022"],"cervignanodelfriuli":["Cervignano del Friuli","colline-pianura",45.823461,13.334307,"030023"],"chioprisviscone":["Chiopris-Viscone","colline-pianura",45.924418,13.402598,"030024"],"chiusaforte":["Chiusaforte","montagna",46.408248,13.3107,"030025"],"cividaledelfriuli":["Cividale del Friuli","colline-pianura",46.093623,13.430328,"030026"],"codroipo":["Codroipo","colline-pianura",45.961593,12.977352,"030027"],"colloredodimontealbano":["Colloredo di Monte Albano","colline-pianura",46.16342,13.136533,"030028"],"comeglians":["Comeglians","montagna",46.513655,12.867605,"030029"],"cornodirosazzo":["Corno di Rosazzo","colline-pianura",45.99655,13.441591,"030030"],"coseano":["Coseano","colline-pianura",46.096828,13.018747,"030031"],"dignano":["Dignano","colline-pianura",46.087434,12.938218,"030032"],"dogna":["Dogna","montagna",46.447601,13.316007,"030033"],"drenchia":["Drenchia","montagna",46.17522,13.622214,"030034"],"enemonzo":["Enemonzo","montagna",46.410312,12.879384,"030035"],"faedis":["Faedis","colline-pianura",46.152817,13.344168,"030036"],"fagagna":["Fagagna","colline-pianura",46.113384,13.084104,"030037"],"flaibano":["Flaibano","colline-pianura",46.058736,12.983447,"030039"],"forniavoltri":["Forni Avoltri","montagna",46.584479,12.778473,"030040"],"fornidisopra":["Forni di Sopra","montagna",46.423933,12.578381,"030041"],"fornidisotto":["Forni di Sotto","montagna",46.393566,12.671848,"030042"],"gemonadelfriuli":["Gemona del Friuli","colline-pianura",46.276823,13.139824,"030043"],"gonars":["Gonars","colline-pianura",45.896562,13.236299,"030044"],"grimacco":["Grimacco","montagna",46.156556,13.593644,"030045"],"latisana":["Latisana","costa-laguna",45.776336,12.995294,"030046"],"lauco":["Lauco","montagna",46.424111,12.933092,"030047"],"lestizza":["Lestizza","colline-pianura",45.957742,13.141058,"030048"],"lignanosabbiadoro":["Lignano Sabbiadoro","costa-laguna",45.689167,13.129643,"030049"],"lusevera":["Lusevera","montagna",46.264677,13.260455,"030051"],"magnanoinriviera":["Magnano in Riviera","colline-pianura",46.230992,13.17759,"030052"],"majano":["Majano","colline-pianura",46.185232,13.069023,"030053"],"malborghettovalbruna":["Malborghetto Valbruna","montagna",46.50742,13.439355,"030054"],"manzano":["Manzano","colline-pianura",45.989637,13.385428,"030055"],"maranolagunare":["Marano Lagunare","costa-laguna",45.765409,13.167288,"030056"],"martignacco":["Martignacco","colline-pianura",46.098147,13.130324,"030057"],"meretoditomba":["Mereto di Tomba","colline-pianura",46.051035,13.048527,"030058"],"moggioudinese":["Moggio Udinese","montagna",46.410394,13.19475,"030059"],"moimacco":["Moimacco","colline-pianura",46.091809,13.380982,"030060"],"montenars":["Montenars","colline-pianura",46.256678,13.180573,"030061"],"mortegliano":["Mortegliano","colline-pianura",45.944972,13.172276,"030062"],"moruzzo":["Moruzzo","colline-pianura",46.119651,13.123766,"030063"],"muzzanadelturgnano":["Muzzana del Turgnano","colline-pianura",45.817581,13.12781,"030064"],"nimis":["Nimis","colline-pianura",46.201188,13.265811,"030065"],"osoppo":["Osoppo","colline-pianura",46.256698,13.080546,"030066"],"ovaro":["Ovaro","montagna",46.483196,12.865548,"030067"],"pagnacco":["Pagnacco","colline-pianura",46.12053,13.187325,"030068"],"palazzolodellostella":["Palazzolo dello Stella","colline-pianura",45.804466,13.079431,"030069"],"palmanova":["Palmanova","colline-pianura",45.904565,13.309551,"030070"],"paluzza":["Paluzza","montagna",46.529506,13.016489,"030071"],"pasiandiprato":["Pasian di Prato","colline-pianura",46.049108,13.190787,"030072"],"paularo":["Paularo","montagna",46.530378,13.116391,"030073"],"paviadiudine":["Pavia di Udine","colline-pianura",45.977591,13.281686,"030074"],"pocenia":["Pocenia","colline-pianura",45.837077,13.098151,"030075"],"pontebba":["Pontebba","montagna",46.506115,13.304164,"030076"],"porpetto":["Porpetto","colline-pianura",45.858493,13.21482,"030077"],"povoletto":["Povoletto","colline-pianura",46.118558,13.298558,"030078"],"pozzuolodelfriuli":["Pozzuolo del Friuli","colline-pianura",45.984645,13.196736,"030079"],"pradamano":["Pradamano","colline-pianura",46.031191,13.299289,"030080"],"pratocarnico":["Prato Carnico","montagna",46.520399,12.798265,"030081"],"precenicco":["Precenicco","colline-pianura",45.789791,13.078478,"030082"],"premariacco":["Premariacco","colline-pianura",46.060073,13.394239,"030083"],"preone":["Preone","montagna",46.395396,12.867688,"030084"],"prepotto":["Prepotto","colline-pianura",46.046078,13.479579,"030085"],"pulfero":["Pulfero","montagna",46.173399,13.485387,"030086"],"ragogna":["Ragogna","colline-pianura",46.17763,12.97854,"030087"],"ravascletto":["Ravascletto","montagna",46.525528,12.922188,"030088"],"raveo":["Raveo","montagna",46.434514,12.870178,"030089"],"reanadelrojale":["Reana del Rojale","colline-pianura",46.149594,13.243026,"030090"],"remanzacco":["Remanzacco","colline-pianura",46.085242,13.324473,"030091"],"resia":["Resia","montagna",46.373289,13.305097,"030092"],"resiutta":["Resiutta","montagna",46.392967,13.220315,"030093"],"rigolato":["Rigolato","montagna",46.54985,12.853669,"030094"],"rivedarcano":["Rive d'Arcano","colline-pianura",46.12621,13.030962,"030095"],"ronchis":["Ronchis","colline-pianura",45.805793,12.996037,"030097"],"ruda":["Ruda","colline-pianura",45.837573,13.401455,"030098"],"sandanieledelfriuli":["San Daniele del Friuli","colline-pianura",46.161062,13.011271,"030099"],"sangiorgiodinogaro":["San Giorgio di Nogaro","colline-pianura",45.833006,13.207232,"030100"],"sangiovannialnatisone":["San Giovanni al Natisone","colline-pianura",45.980799,13.404477,"030101"],"sanleonardo":["San Leonardo","montagna",46.12127,13.523753,"030102"],"sanpietroalnatisone":["San Pietro al Natisone","colline-pianura",46.12647,13.48537,"030103"],"santamarialalonga":["Santa Maria la Longa","colline-pianura",45.933304,13.288379,"030104"],"sanvitoaltorre":["San Vito al Torre","colline-pianura",45.895761,13.369993,"030105"],"sanvitodifagagna":["San Vito di Fagagna","colline-pianura",46.089044,13.057607,"030106"],"sauris":["Sauris","montagna",46.466628,12.708183,"030107"],"savogna":["Savogna","montagna",46.159418,13.53338,"030108"],"sedegliano":["Sedegliano","colline-pianura",46.015391,12.985378,"030109"],"socchieve":["Socchieve","montagna",46.40362,12.823243,"030110"],"stregna":["Stregna","montagna",46.127077,13.577669,"030111"],"sutrio":["Sutrio","montagna",46.512281,12.990042,"030112"],"taipana":["Taipana","montagna",46.249693,13.34234,"030113"],"talmassons":["Talmassons","colline-pianura",45.930223,13.115211,"030114"],"tarcento":["Tarcento","colline-pianura",46.216515,13.222347,"030116"],"tarvisio":["Tarvisio","montagna",46.505124,13.577729,"030117"],"tavagnacco":["Tavagnacco","colline-pianura",46.101326,13.215429,"030118"],"terzodaquileia":["Terzo d'Aquileia","costa-laguna",45.800278,13.346432,"030120"],"tolmezzo":["Tolmezzo","montagna",46.405891,13.015568,"030121"],"torreano":["Torreano","colline-pianura",46.130012,13.432293,"030122"],"torviscosa":["Torviscosa","colline-pianura",45.823273,13.274105,"030123"],"trasaghis":["Trasaghis","montagna",46.282614,13.075559,"030124"],"treppogrande":["Treppo Grande","colline-pianura",46.190659,13.1571,"030126"],"tricesimo":["Tricesimo","colline-pianura",46.161887,13.211838,"030127"],"trivignanoudinese":["Trivignano Udinese","colline-pianura",45.946056,13.340332,"030128"],"udine":["Udine","colline-pianura",46.062888,13.235295,"030129"],"varmo":["Varmo","colline-pianura",45.886923,12.988075,"030130"],"venzone":["Venzone","montagna",46.333643,13.139082,"030131"],"verzegnis":["Verzegnis","montagna",46.389844,12.993745,"030132"],"villasantina":["Villa Santina","montagna",46.415487,12.92394,"030133"],"visco":["Visco","colline-pianura",45.892082,13.347469,"030135"],"zuglio":["Zuglio","montagna",46.460816,13.026158,"030136"],"forgarianelfriuli":["Forgaria nel Friuli","montagna",46.22412,12.968501,"030137"],"campolongotapogliano":["Campolongo Tapogliano","colline-pianura",45.864112,13.394133,"030138"],"rivignanoteor":["Rivignano Teor","colline-pianura",45.874273,13.041142,"030188"],"sappada":["Sappada","montagna",46.566001,12.683955,"030189"],"fiumicellovillavicentina":["Fiumicello Villa Vicentina","colline-pianura",45.790608,13.409463,"030190"],"treppoligosullo":["Treppo Ligosullo","montagna",46.533954,13.043084,"030191"],"caprivadelfriuli":["Capriva del Friuli","colline-pianura",45.941736,13.514124,"031001"],"cormons":["Cormons","colline-pianura",45.960441,13.473596,"031002"],"doberdodellago":["Doberdò del Lago","trieste-carso",45.844407,13.539869,"031003"],"dolegnadelcollio":["Dolegna del Collio","colline-pianura",46.031663,13.479284,"031004"],"farradisonzo":["Farra d'Isonzo","colline-pianura",45.907389,13.518017,"031005"],"foglianoredipuglia":["Fogliano Redipuglia","trieste-carso",45.866489,13.481002,"031006"],"gorizia":["Gorizia","colline-pianura",45.9352,13.6193,"031007"],"gradiscadisonzo":["Gradisca d'Isonzo","colline-pianura",45.889092,13.50388,"031008"],"grado":["Grado","costa-laguna",45.67521,13.386509,"031009"],"marianodelfriuli":["Mariano del Friuli","colline-pianura",45.917913,13.458528,"031010"],"medea":["Medea","colline-pianura",45.917082,13.423527,"031011"],"monfalcone":["Monfalcone","costa-laguna",45.809243,13.533109,"031012"],"moraro":["Moraro","colline-pianura",45.930364,13.495069,"031013"],"mossa":["Mossa","colline-pianura",45.938304,13.547759,"031014"],"romansdisonzo":["Romans d'Isonzo","colline-pianura",45.890705,13.439262,"031015"],"ronchideilegionari":["Ronchi dei Legionari","colline-pianura",45.827808,13.501845,"031016"],"sagrado":["Sagrado","trieste-carso",45.876413,13.485413,"031017"],"sancanziandisonzo":["San Canzian d'Isonzo","costa-laguna",45.809521,13.443429,"031018"],"sanflorianodelcollio":["San Floriano del Collio","colline-pianura",45.981819,13.585001,"031019"],"sanlorenzoisontino":["San Lorenzo Isontino","colline-pianura",45.932893,13.5264,"031020"],"sanpierdisonzo":["San Pier d'Isonzo","colline-pianura",45.846374,13.460749,"031021"],"savognadisonzo":["Savogna d'Isonzo","trieste-carso",45.905882,13.574864,"031022"],"staranzano":["Staranzano","costa-laguna",45.806505,13.499781,"031023"],"turriaco":["Turriaco","colline-pianura",45.820856,13.444822,"031024"],"villesse":["Villesse","colline-pianura",45.859748,13.438408,"031025"],"duinoaurisina":["Duino Aurisina","trieste-carso",45.750434,13.670866,"032001"],"monrupino":["Monrupino","trieste-carso",45.718913,13.800474,"032002"],"muggia":["Muggia","trieste-carso",45.604441,13.767529,"032003"],"sandorligodellavalle":["San Dorligo della Valle","trieste-carso",45.607789,13.856888,"032004"],"sgonico":["Sgonico","trieste-carso",45.733333,13.75,"032005"],"trieste":["Trieste","trieste-carso",45.649425,13.768411,"032006"],"andreis":["Andreis","montagna",46.2018,12.614563,"093001"],"arba":["Arba","colline-pianura",46.146218,12.790431,"093002"],"aviano":["Aviano","colline-pianura",46.06702,12.588168,"093004"],"azzanodecimo":["Azzano Decimo","colline-pianura",45.88103,12.714836,"093005"],"barcis":["Barcis","montagna",46.190979,12.560075,"093006"],"brugnera":["Brugnera","colline-pianura",45.899184,12.536807,"093007"],"budoia":["Budoia","colline-pianura",46.042776,12.532425,"093008"],"caneva":["Caneva","colline-pianura",45.968792,12.448944,"093009"],"casarsadelladelizia":["Casarsa della Delizia","colline-pianura",45.95703,12.84212,"093010"],"castelnovodelfriuli":["Castelnovo del Friuli","colline-pianura",46.199867,12.903252,"093011"],"cavassonuovo":["Cavasso Nuovo","colline-pianura",46.194391,12.768723,"093012"],"chions":["Chions","colline-pianura",45.862319,12.752446,"093013"],"cimolais":["Cimolais","montagna",46.288052,12.437826,"093014"],"claut":["Claut","montagna",46.267486,12.513766,"093015"],"clauzetto":["Clauzetto","montagna",46.230058,12.917139,"093016"],"cordenons":["Cordenons","colline-pianura",45.988382,12.707699,"093017"],"cordovado":["Cordovado","colline-pianura",45.849887,12.882508,"093018"],"ertoecasso":["Erto e Casso","montagna",46.275654,12.373545,"093019"],"fanna":["Fanna","colline-pianura",46.1878,12.754586,"093020"],"fiumeveneto":["Fiume Veneto","colline-pianura",45.927943,12.732176,"093021"],"fontanafredda":["Fontanafredda","colline-pianura",45.966667,12.566667,"093022"],"frisanco":["Frisanco","montagna",46.212743,12.723599,"093024"],"maniago":["Maniago","colline-pianura",46.170974,12.707399,"093025"],"meduno":["Meduno","colline-pianura",46.217702,12.788437,"093026"],"monterealevalcellina":["Montereale Valcellina","colline-pianura",46.166667,12.666667,"093027"],"morsanoaltagliamento":["Morsano al Tagliamento","colline-pianura",45.858235,12.928822,"093028"],"pasianodipordenone":["Pasiano di Pordenone","colline-pianura",45.851525,12.627643,"093029"],"pinzanoaltagliamento":["Pinzano al Tagliamento","colline-pianura",46.182989,12.946087,"093030"],"polcenigo":["Polcenigo","colline-pianura",46.030297,12.501853,"093031"],"porcia":["Porcia","colline-pianura",45.958016,12.611469,"093032"],"pordenone":["Pordenone","colline-pianura",45.954241,12.659935,"093033"],"pratadipordenone":["Prata di Pordenone","colline-pianura",45.894278,12.596855,"093034"],"pravisdomini":["Pravisdomini","colline-pianura",45.817675,12.691792,"093035"],"roveredoinpiano":["Roveredo in Piano","colline-pianura",46.009202,12.618308,"093036"],"sacile":["Sacile","colline-pianura",45.954346,12.502852,"093037"],"sangiorgiodellarichinvelda":["San Giorgio della Richinvelda","colline-pianura",46.045468,12.866649,"093038"],"sanmartinoaltagliamento":["San Martino al Tagliamento","colline-pianura",46.020916,12.864052,"093039"],"sanquirino":["San Quirino","colline-pianura",46.036527,12.680527,"093040"],"sanvitoaltagliamento":["San Vito al Tagliamento","colline-pianura",45.915555,12.855394,"093041"],"sequals":["Sequals","colline-pianura",46.16585,12.826755,"093042"],"sestoalreghena":["Sesto al Reghena","colline-pianura",45.847448,12.815796,"093043"],"spilimbergo":["Spilimbergo","colline-pianura",46.112156,12.905745,"093044"],"tramontidisopra":["Tramonti di Sopra","montagna",46.30975,12.789472,"093045"],"tramontidisotto":["Tramonti di Sotto","montagna",46.28508,12.795649,"093046"],"travesio":["Travesio","colline-pianura",46.195936,12.870925,"093047"],"vitodasio":["Vito d'Asio","montagna",46.233294,12.958575,"093049"],"vivaro":["Vivaro","colline-pianura",46.078047,12.775626,"093050"],"zoppola":["Zoppola","colline-pianura",45.966031,12.772174,"093051"],"vajont":["Vajont","colline-pianura",46.14618,12.697931,"093052"],"valvasonearzene":["Valvasone Arzene","colline-pianura",46.000312,12.846889,"093053"]};
const ALIAS: Record<string, string> = {"doberdodellagodoberdob":"doberdodellago","doberdob":"doberdodellago","sanflorianodelcolliosteverjan":"sanflorianodelcollio","steverjan":"sanflorianodelcollio","savognadisonzosovodnjeobsoci":"savognadisonzo","sovodnjeobsoci":"savognadisonzo","duinoaurisinadevinnabrezina":"duinoaurisina","devinnabrezina":"duinoaurisina","monrupinorepentabor":"monrupino","repentabor":"monrupino","sandorligodellavalledolina":"sandorligodellavalle","dolina":"sandorligodellavalle","sgonicozgonik":"sgonico","zgonik":"sgonico"};
const COSTA: [number, number][][] = [[[12.978,45.627],[12.968,45.622],[12.96,45.622],[12.944,45.619],[12.917,45.612],[12.912,45.614],[12.906,45.612],[12.9,45.606]],[[13.101,45.643],[13.102,45.639],[13.098,45.635],[13.091,45.635],[13.078,45.633],[13.062,45.631],[13.028,45.629],[13.002,45.627],[12.978,45.623],[12.978,45.627]],[[13.153,45.698],[13.151,45.692],[13.144,45.686],[13.117,45.67],[13.109,45.663],[13.104,45.653],[13.101,45.643]],[[13.246,45.72],[13.245,45.713],[13.208,45.713],[13.192,45.711],[13.184,45.712],[13.178,45.709],[13.178,45.706],[13.168,45.703],[13.157,45.703],[13.152,45.701],[13.153,45.698]],[[13.554,45.726],[13.552,45.724],[13.543,45.724],[13.535,45.723],[13.531,45.723],[13.516,45.718],[13.506,45.712],[13.486,45.704],[13.473,45.704],[13.463,45.701],[13.46,45.694],[13.454,45.69],[13.444,45.687],[13.438,45.683],[13.434,45.682],[13.433,45.678],[13.428,45.676],[13.423,45.677],[13.408,45.678],[13.396,45.676],[13.385,45.675],[13.381,45.679],[13.368,45.682],[13.367,45.684],[13.359,45.682],[13.352,45.679],[13.343,45.681],[13.323,45.687],[13.315,45.692],[13.303,45.697],[13.295,45.7],[13.292,45.704],[13.275,45.707],[13.261,45.707],[13.256,45.708],[13.253,45.714],[13.248,45.715],[13.246,45.72]],[[13.581,45.782],[13.579,45.775],[13.562,45.778],[13.564,45.782],[13.562,45.784],[13.557,45.783],[13.548,45.793],[13.538,45.791],[13.539,45.787],[13.531,45.787],[13.538,45.783],[13.528,45.772]],[[13.528,45.772],[13.526,45.771],[13.521,45.763],[13.521,45.757],[13.523,45.756],[13.521,45.752],[13.526,45.748],[13.517,45.744],[13.526,45.737],[13.533,45.738],[13.541,45.733],[13.549,45.731],[13.555,45.728],[13.554,45.726]],[[13.668,45.742],[13.643,45.756],[13.636,45.763],[13.63,45.771],[13.622,45.769],[13.618,45.771],[13.608,45.772],[13.604,45.771],[13.596,45.775],[13.589,45.777],[13.587,45.78],[13.581,45.782]],[[13.723,45.595],[13.721,45.598],[13.719,45.606],[13.727,45.606],[13.733,45.61],[13.737,45.611],[13.742,45.609],[13.751,45.608],[13.757,45.608],[13.775,45.604],[13.778,45.601],[13.783,45.599],[13.797,45.604],[13.797,45.607],[13.805,45.609],[13.807,45.607]],[[13.807,45.607],[13.805,45.61],[13.786,45.614],[13.778,45.611],[13.774,45.613],[13.782,45.615],[13.779,45.617],[13.776,45.622],[13.772,45.625],[13.776,45.627],[13.774,45.63],[13.778,45.631],[13.774,45.636],[13.766,45.636],[13.766,45.631],[13.757,45.628],[13.755,45.631],[13.763,45.633],[13.758,45.636],[13.75,45.636],[13.748,45.645],[13.754,45.648],[13.752,45.65],[13.756,45.65],[13.758,45.646],[13.769,45.653],[13.765,45.66],[13.76,45.664],[13.756,45.674],[13.752,45.676],[13.754,45.679],[13.746,45.687],[13.733,45.696],[13.722,45.701],[13.713,45.702],[13.711,45.705],[13.714,45.708],[13.712,45.71],[13.694,45.723],[13.692,45.725],[13.682,45.732],[13.677,45.737],[13.668,45.742]]];
// </dati>
