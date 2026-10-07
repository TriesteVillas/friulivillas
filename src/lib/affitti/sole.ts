// Il sole sopra la casa, adesso: altezza, alba e tramonto, e la «luce» che ne
// segue (notte, oro, giorno). Serve alla testata dei soggiorni, che mostra la
// casa con la luce che c'è in quel momento a Viaso, e alla riga «oggi a Viaso
// il sole tramonta alle…».
//
// Formule dell'almanacco astronomico (approssimazione a bassa precisione del
// Naval Observatory e della NOAA): precisione di qualche centesimo di grado
// sull'altezza e di un minuto circa su alba e tramonto, che per scegliere un
// video basta e avanza. Nessuna libreria, nessuna rete: tutto nel browser,
// perché una pagina statica non può sapere che ora è (la data della build non
// è «oggi»: friulivillas/RIPRESA §0-bis).

const RAD = Math.PI / 180;

/** Altezza del centro del sole sull'orizzonte, in gradi (senza rifrazione). */
export function altezzaSole(quando: Date, lat: number, lon: number): number {
  const n = quando.getTime() / 86_400_000 + 2440587.5 - 2451545.0; // giorni da J2000
  const L = (280.46 + 0.9856474 * n) % 360; // longitudine media
  const g = ((357.528 + 0.9856003 * n) % 360) * RAD; // anomalia media
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD; // longitudine eclittica
  const eps = (23.439 - 0.0000004 * n) * RAD; // obliquità
  const alfa = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)); // ascensione retta
  const delta = Math.asin(Math.sin(eps) * Math.sin(lambda)); // declinazione
  const gmst = (18.697374558 + 24.06570982441908 * n) % 24; // tempo siderale di Greenwich, ore
  const H = (gmst * 15 + lon) * RAD - alfa; // angolo orario
  const phi = lat * RAD;
  const sinAlt = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(H);
  return Math.asin(Math.max(-1, Math.min(1, sinAlt))) / RAD;
}

/** L'orizzonte apparente di alba e tramonto (rifrazione + semidiametro). */
const ORIZZONTE = -0.833;

export type Luce = "notte" | "oro" | "giorno";

/**
 * La luce da mostrare: «oro» è l'ora d'oro, mattina e sera (sole fra 6° sotto
 * e 6° sopra l'orizzonte); «notte» sotto il crepuscolo civile.
 */
export function luceDa(altezza: number): Luce {
  if (altezza < -6) return "notte";
  if (altezza < 6) return "oro";
  return "giorno";
}

/**
 * Alba e tramonto del giorno di calendario (fuso di Roma) che contiene
 * `quando`: si scorre la giornata minuto per minuto e si cercano i passaggi
 * per l'orizzonte apparente. 1.440 valutazioni: niente, per un browser.
 */
export function albaTramonto(quando: Date, lat: number, lon: number): { alba: Date | null; tramonto: Date | null } {
  const mezzanotte = mezzanotteRoma(quando);
  let alba: Date | null = null;
  let tramonto: Date | null = null;
  let prima = altezzaSole(mezzanotte, lat, lon) - ORIZZONTE;
  for (let m = 1; m <= 1440; m++) {
    const t = mezzanotte.getTime() + m * 60_000;
    const ora = altezzaSole(new Date(t), lat, lon) - ORIZZONTE;
    // Il passaggio sta fra il minuto prima e questo: si interpola, così l'ora
    // non arriva sempre «al minuto dopo» (collaudato contro l'USNO, 07/10/2026).
    const passaggio = () => new Date(t - 60_000 + (prima / (prima - ora)) * 60_000);
    if (prima < 0 && ora >= 0 && !alba) alba = passaggio();
    if (prima >= 0 && ora < 0 && !tramonto) tramonto = passaggio();
    prima = ora;
  }
  return { alba, tramonto };
}

/** La mezzanotte di Roma del giorno che contiene `quando` (ora legale compresa). */
export function mezzanotteRoma(quando: Date): Date {
  const parti = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(quando);
  const v = (t: string) => Number(parti.find((p) => p.type === t)?.value);
  // Quanto è avanti Roma rispetto a UTC in questo istante (60 o 120 minuti).
  const comeUtc = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"), v("second"));
  const scarto = comeUtc - Math.floor(quando.getTime() / 1000) * 1000;
  return new Date(Date.UTC(v("year"), v("month") - 1, v("day")) - scarto);
}

/** «18:41», ora di Roma, arrotondata al minuto più vicino (come gli almanacchi). */
export function oraRoma(d: Date, locale: string): string {
  const arrotondata = new Date(d.getTime() + 30_000);
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(arrotondata);
}

/**
 * La frazione illuminata della luna (0-1), dall'età del ciclo sinodico a partire
 * da una luna nuova di riferimento (6/1/2000 18:14 UTC). Approssimazione media:
 * qualche punto percentuale, che per dire «luna al 40%» basta (collaudata
 * contro l'USNO il 07/10/2026).
 */
export function lunaIlluminata(quando: Date): number {
  const SINODICO = 29.530588853;
  const giorni = (quando.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86_400_000;
  const eta = ((giorni % SINODICO) + SINODICO) % SINODICO;
  return (1 - Math.cos((2 * Math.PI * eta) / SINODICO)) / 2;
}
