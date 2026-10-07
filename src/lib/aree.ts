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
  montagna: { it: "Montagna", en: "Mountains", de: "Berge", sl: "Gore" },
  "trieste-carso": { it: "Trieste e Carso", en: "Trieste & Karst", de: "Triest & Karst", sl: "Trst in Kras" },
};

/** Lo slug dell'URL, per lingua: /area/<slug>. */
export const SLUG_AREA: Record<AreaId, Record<Lingua, string>> = {
  "costa-laguna": { it: "costa-e-laguna", en: "coast-and-lagoon", de: "kueste-und-lagune", sl: "obala-in-laguna" },
  "colline-pianura": { it: "colline-e-pianura", en: "hills-and-plain", de: "huegelland-und-ebene", sl: "gricevje-in-nizina" },
  montagna: { it: "montagna", en: "mountains", de: "berge", sl: "gore" },
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

// <dati> — generato da scripts/genera-aree.mjs, non modificare a mano
const COMUNI: Record<string, [string, string]> = {"aiellodelfriuli":["Aiello del Friuli","colline-pianura"],"amaro":["Amaro","montagna"],"ampezzo":["Ampezzo","montagna"],"aquileia":["Aquileia","costa-laguna"],"artaterme":["Arta Terme","montagna"],"artegna":["Artegna","colline-pianura"],"attimis":["Attimis","colline-pianura"],"bagnariaarsa":["Bagnaria Arsa","colline-pianura"],"basiliano":["Basiliano","colline-pianura"],"bertiolo":["Bertiolo","colline-pianura"],"bicinicco":["Bicinicco","colline-pianura"],"bordano":["Bordano","montagna"],"buja":["Buja","colline-pianura"],"buttrio":["Buttrio","colline-pianura"],"caminoaltagliamento":["Camino al Tagliamento","colline-pianura"],"campoformido":["Campoformido","colline-pianura"],"carlino":["Carlino","colline-pianura"],"cassacco":["Cassacco","colline-pianura"],"castionsdistrada":["Castions di Strada","colline-pianura"],"cavazzocarnico":["Cavazzo Carnico","montagna"],"cercivento":["Cercivento","montagna"],"cervignanodelfriuli":["Cervignano del Friuli","colline-pianura"],"chioprisviscone":["Chiopris-Viscone","colline-pianura"],"chiusaforte":["Chiusaforte","montagna"],"cividaledelfriuli":["Cividale del Friuli","colline-pianura"],"codroipo":["Codroipo","colline-pianura"],"colloredodimontealbano":["Colloredo di Monte Albano","colline-pianura"],"comeglians":["Comeglians","montagna"],"cornodirosazzo":["Corno di Rosazzo","colline-pianura"],"coseano":["Coseano","colline-pianura"],"dignano":["Dignano","colline-pianura"],"dogna":["Dogna","montagna"],"drenchia":["Drenchia","montagna"],"enemonzo":["Enemonzo","montagna"],"faedis":["Faedis","colline-pianura"],"fagagna":["Fagagna","colline-pianura"],"flaibano":["Flaibano","colline-pianura"],"forniavoltri":["Forni Avoltri","montagna"],"fornidisopra":["Forni di Sopra","montagna"],"fornidisotto":["Forni di Sotto","montagna"],"gemonadelfriuli":["Gemona del Friuli","colline-pianura"],"gonars":["Gonars","colline-pianura"],"grimacco":["Grimacco","montagna"],"latisana":["Latisana","costa-laguna"],"lauco":["Lauco","montagna"],"lestizza":["Lestizza","colline-pianura"],"lignanosabbiadoro":["Lignano Sabbiadoro","costa-laguna"],"lusevera":["Lusevera","montagna"],"magnanoinriviera":["Magnano in Riviera","colline-pianura"],"majano":["Majano","colline-pianura"],"malborghettovalbruna":["Malborghetto Valbruna","montagna"],"manzano":["Manzano","colline-pianura"],"maranolagunare":["Marano Lagunare","costa-laguna"],"martignacco":["Martignacco","colline-pianura"],"meretoditomba":["Mereto di Tomba","colline-pianura"],"moggioudinese":["Moggio Udinese","montagna"],"moimacco":["Moimacco","colline-pianura"],"montenars":["Montenars","colline-pianura"],"mortegliano":["Mortegliano","colline-pianura"],"moruzzo":["Moruzzo","colline-pianura"],"muzzanadelturgnano":["Muzzana del Turgnano","colline-pianura"],"nimis":["Nimis","colline-pianura"],"osoppo":["Osoppo","colline-pianura"],"ovaro":["Ovaro","montagna"],"pagnacco":["Pagnacco","colline-pianura"],"palazzolodellostella":["Palazzolo dello Stella","colline-pianura"],"palmanova":["Palmanova","colline-pianura"],"paluzza":["Paluzza","montagna"],"pasiandiprato":["Pasian di Prato","colline-pianura"],"paularo":["Paularo","montagna"],"paviadiudine":["Pavia di Udine","colline-pianura"],"pocenia":["Pocenia","colline-pianura"],"pontebba":["Pontebba","montagna"],"porpetto":["Porpetto","colline-pianura"],"povoletto":["Povoletto","colline-pianura"],"pozzuolodelfriuli":["Pozzuolo del Friuli","colline-pianura"],"pradamano":["Pradamano","colline-pianura"],"pratocarnico":["Prato Carnico","montagna"],"precenicco":["Precenicco","colline-pianura"],"premariacco":["Premariacco","colline-pianura"],"preone":["Preone","montagna"],"prepotto":["Prepotto","colline-pianura"],"pulfero":["Pulfero","montagna"],"ragogna":["Ragogna","colline-pianura"],"ravascletto":["Ravascletto","montagna"],"raveo":["Raveo","montagna"],"reanadelrojale":["Reana del Rojale","colline-pianura"],"remanzacco":["Remanzacco","colline-pianura"],"resia":["Resia","montagna"],"resiutta":["Resiutta","montagna"],"rigolato":["Rigolato","montagna"],"rivedarcano":["Rive d'Arcano","colline-pianura"],"ronchis":["Ronchis","colline-pianura"],"ruda":["Ruda","colline-pianura"],"sandanieledelfriuli":["San Daniele del Friuli","colline-pianura"],"sangiorgiodinogaro":["San Giorgio di Nogaro","colline-pianura"],"sangiovannialnatisone":["San Giovanni al Natisone","colline-pianura"],"sanleonardo":["San Leonardo","montagna"],"sanpietroalnatisone":["San Pietro al Natisone","colline-pianura"],"santamarialalonga":["Santa Maria la Longa","colline-pianura"],"sanvitoaltorre":["San Vito al Torre","colline-pianura"],"sanvitodifagagna":["San Vito di Fagagna","colline-pianura"],"sauris":["Sauris","montagna"],"savogna":["Savogna","montagna"],"sedegliano":["Sedegliano","colline-pianura"],"socchieve":["Socchieve","montagna"],"stregna":["Stregna","montagna"],"sutrio":["Sutrio","montagna"],"taipana":["Taipana","montagna"],"talmassons":["Talmassons","colline-pianura"],"tarcento":["Tarcento","colline-pianura"],"tarvisio":["Tarvisio","montagna"],"tavagnacco":["Tavagnacco","colline-pianura"],"terzodaquileia":["Terzo d'Aquileia","costa-laguna"],"tolmezzo":["Tolmezzo","montagna"],"torreano":["Torreano","colline-pianura"],"torviscosa":["Torviscosa","colline-pianura"],"trasaghis":["Trasaghis","montagna"],"treppogrande":["Treppo Grande","colline-pianura"],"tricesimo":["Tricesimo","colline-pianura"],"trivignanoudinese":["Trivignano Udinese","colline-pianura"],"udine":["Udine","colline-pianura"],"varmo":["Varmo","colline-pianura"],"venzone":["Venzone","montagna"],"verzegnis":["Verzegnis","montagna"],"villasantina":["Villa Santina","montagna"],"visco":["Visco","colline-pianura"],"zuglio":["Zuglio","montagna"],"forgarianelfriuli":["Forgaria nel Friuli","montagna"],"campolongotapogliano":["Campolongo Tapogliano","colline-pianura"],"rivignanoteor":["Rivignano Teor","colline-pianura"],"sappada":["Sappada","montagna"],"fiumicellovillavicentina":["Fiumicello Villa Vicentina","colline-pianura"],"treppoligosullo":["Treppo Ligosullo","montagna"],"caprivadelfriuli":["Capriva del Friuli","colline-pianura"],"cormons":["Cormons","colline-pianura"],"doberdodellago":["Doberdò del Lago","trieste-carso"],"dolegnadelcollio":["Dolegna del Collio","colline-pianura"],"farradisonzo":["Farra d'Isonzo","colline-pianura"],"foglianoredipuglia":["Fogliano Redipuglia","trieste-carso"],"gorizia":["Gorizia","colline-pianura"],"gradiscadisonzo":["Gradisca d'Isonzo","colline-pianura"],"grado":["Grado","costa-laguna"],"marianodelfriuli":["Mariano del Friuli","colline-pianura"],"medea":["Medea","colline-pianura"],"monfalcone":["Monfalcone","costa-laguna"],"moraro":["Moraro","colline-pianura"],"mossa":["Mossa","colline-pianura"],"romansdisonzo":["Romans d'Isonzo","colline-pianura"],"ronchideilegionari":["Ronchi dei Legionari","colline-pianura"],"sagrado":["Sagrado","trieste-carso"],"sancanziandisonzo":["San Canzian d'Isonzo","costa-laguna"],"sanflorianodelcollio":["San Floriano del Collio","colline-pianura"],"sanlorenzoisontino":["San Lorenzo Isontino","colline-pianura"],"sanpierdisonzo":["San Pier d'Isonzo","colline-pianura"],"savognadisonzo":["Savogna d'Isonzo","trieste-carso"],"staranzano":["Staranzano","costa-laguna"],"turriaco":["Turriaco","colline-pianura"],"villesse":["Villesse","colline-pianura"],"duinoaurisina":["Duino Aurisina","trieste-carso"],"monrupino":["Monrupino","trieste-carso"],"muggia":["Muggia","trieste-carso"],"sandorligodellavalle":["San Dorligo della Valle","trieste-carso"],"sgonico":["Sgonico","trieste-carso"],"trieste":["Trieste","trieste-carso"],"andreis":["Andreis","montagna"],"arba":["Arba","colline-pianura"],"aviano":["Aviano","colline-pianura"],"azzanodecimo":["Azzano Decimo","colline-pianura"],"barcis":["Barcis","montagna"],"brugnera":["Brugnera","colline-pianura"],"budoia":["Budoia","colline-pianura"],"caneva":["Caneva","colline-pianura"],"casarsadelladelizia":["Casarsa della Delizia","colline-pianura"],"castelnovodelfriuli":["Castelnovo del Friuli","colline-pianura"],"cavassonuovo":["Cavasso Nuovo","colline-pianura"],"chions":["Chions","colline-pianura"],"cimolais":["Cimolais","montagna"],"claut":["Claut","montagna"],"clauzetto":["Clauzetto","montagna"],"cordenons":["Cordenons","colline-pianura"],"cordovado":["Cordovado","colline-pianura"],"ertoecasso":["Erto e Casso","montagna"],"fanna":["Fanna","colline-pianura"],"fiumeveneto":["Fiume Veneto","colline-pianura"],"fontanafredda":["Fontanafredda","colline-pianura"],"frisanco":["Frisanco","montagna"],"maniago":["Maniago","colline-pianura"],"meduno":["Meduno","colline-pianura"],"monterealevalcellina":["Montereale Valcellina","colline-pianura"],"morsanoaltagliamento":["Morsano al Tagliamento","colline-pianura"],"pasianodipordenone":["Pasiano di Pordenone","colline-pianura"],"pinzanoaltagliamento":["Pinzano al Tagliamento","colline-pianura"],"polcenigo":["Polcenigo","colline-pianura"],"porcia":["Porcia","colline-pianura"],"pordenone":["Pordenone","colline-pianura"],"pratadipordenone":["Prata di Pordenone","colline-pianura"],"pravisdomini":["Pravisdomini","colline-pianura"],"roveredoinpiano":["Roveredo in Piano","colline-pianura"],"sacile":["Sacile","colline-pianura"],"sangiorgiodellarichinvelda":["San Giorgio della Richinvelda","colline-pianura"],"sanmartinoaltagliamento":["San Martino al Tagliamento","colline-pianura"],"sanquirino":["San Quirino","colline-pianura"],"sanvitoaltagliamento":["San Vito al Tagliamento","colline-pianura"],"sequals":["Sequals","colline-pianura"],"sestoalreghena":["Sesto al Reghena","colline-pianura"],"spilimbergo":["Spilimbergo","colline-pianura"],"tramontidisopra":["Tramonti di Sopra","montagna"],"tramontidisotto":["Tramonti di Sotto","montagna"],"travesio":["Travesio","colline-pianura"],"vitodasio":["Vito d'Asio","montagna"],"vivaro":["Vivaro","colline-pianura"],"zoppola":["Zoppola","colline-pianura"],"vajont":["Vajont","colline-pianura"],"valvasonearzene":["Valvasone Arzene","colline-pianura"]};
const ALIAS: Record<string, string> = {"doberdodellagodoberdob":"doberdodellago","doberdob":"doberdodellago","sanflorianodelcolliosteverjan":"sanflorianodelcollio","steverjan":"sanflorianodelcollio","savognadisonzosovodnjeobsoci":"savognadisonzo","sovodnjeobsoci":"savognadisonzo","duinoaurisinadevinnabrezina":"duinoaurisina","devinnabrezina":"duinoaurisina","monrupinorepentabor":"monrupino","repentabor":"monrupino","sandorligodellavalledolina":"sandorligodellavalle","dolina":"sandorligodellavalle","sgonicozgonik":"sgonico","zgonik":"sgonico"};
const COSTA: [number, number][][] = [[[12.978,45.627],[12.968,45.622],[12.96,45.622],[12.944,45.619],[12.917,45.612],[12.912,45.614],[12.906,45.612],[12.9,45.606]],[[13.101,45.643],[13.102,45.639],[13.098,45.635],[13.091,45.635],[13.078,45.633],[13.062,45.631],[13.028,45.629],[13.002,45.627],[12.978,45.623],[12.978,45.627]],[[13.153,45.698],[13.151,45.692],[13.144,45.686],[13.117,45.67],[13.109,45.663],[13.104,45.653],[13.101,45.643]],[[13.246,45.72],[13.245,45.713],[13.208,45.713],[13.192,45.711],[13.184,45.712],[13.178,45.709],[13.178,45.706],[13.168,45.703],[13.157,45.703],[13.152,45.701],[13.153,45.698]],[[13.554,45.726],[13.552,45.724],[13.543,45.724],[13.535,45.723],[13.531,45.723],[13.516,45.718],[13.506,45.712],[13.486,45.704],[13.473,45.704],[13.463,45.701],[13.46,45.694],[13.454,45.69],[13.444,45.687],[13.438,45.683],[13.434,45.682],[13.433,45.678],[13.428,45.676],[13.423,45.677],[13.408,45.678],[13.396,45.676],[13.385,45.675],[13.381,45.679],[13.368,45.682],[13.367,45.684],[13.359,45.682],[13.352,45.679],[13.343,45.681],[13.323,45.687],[13.315,45.692],[13.303,45.697],[13.295,45.7],[13.292,45.704],[13.275,45.707],[13.261,45.707],[13.256,45.708],[13.253,45.714],[13.248,45.715],[13.246,45.72]],[[13.581,45.782],[13.579,45.775],[13.562,45.778],[13.564,45.782],[13.562,45.784],[13.557,45.783],[13.548,45.793],[13.538,45.791],[13.539,45.787],[13.531,45.787],[13.538,45.783],[13.528,45.772]],[[13.528,45.772],[13.526,45.771],[13.521,45.763],[13.521,45.757],[13.523,45.756],[13.521,45.752],[13.526,45.748],[13.517,45.744],[13.526,45.737],[13.533,45.738],[13.541,45.733],[13.549,45.731],[13.555,45.728],[13.554,45.726]],[[13.668,45.742],[13.643,45.756],[13.636,45.763],[13.63,45.771],[13.622,45.769],[13.618,45.771],[13.608,45.772],[13.604,45.771],[13.596,45.775],[13.589,45.777],[13.587,45.78],[13.581,45.782]],[[13.723,45.595],[13.721,45.598],[13.719,45.606],[13.727,45.606],[13.733,45.61],[13.737,45.611],[13.742,45.609],[13.751,45.608],[13.757,45.608],[13.775,45.604],[13.778,45.601],[13.783,45.599],[13.797,45.604],[13.797,45.607],[13.805,45.609],[13.807,45.607]],[[13.807,45.607],[13.805,45.61],[13.786,45.614],[13.778,45.611],[13.774,45.613],[13.782,45.615],[13.779,45.617],[13.776,45.622],[13.772,45.625],[13.776,45.627],[13.774,45.63],[13.778,45.631],[13.774,45.636],[13.766,45.636],[13.766,45.631],[13.757,45.628],[13.755,45.631],[13.763,45.633],[13.758,45.636],[13.75,45.636],[13.748,45.645],[13.754,45.648],[13.752,45.65],[13.756,45.65],[13.758,45.646],[13.769,45.653],[13.765,45.66],[13.76,45.664],[13.756,45.674],[13.752,45.676],[13.754,45.679],[13.746,45.687],[13.733,45.696],[13.722,45.701],[13.713,45.702],[13.711,45.705],[13.714,45.708],[13.712,45.71],[13.694,45.723],[13.692,45.725],[13.682,45.732],[13.677,45.737],[13.668,45.742]]];
// </dati>
