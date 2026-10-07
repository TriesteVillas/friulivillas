import "server-only";
import { unstable_cache } from "next/cache";

// Le date libere delle due case, lette dal SERVER e mai dal browser
// (KB: progetti/tophill-cottage/DISPONIBILITA.md, misure del 07/10/2026).
//
// La sola fonte che dice il vero è il calendario che Booking.com vende: lo
// espone l'operazione GraphQL «AvailabilityCalendar» che la sua pagina pubblica
// chiama, senza cookie, token né challenge. yesalps NON entra mai: dà libere
// notti che Booking ha già venduto (13 su 117 a Top Hill, 23 su 88 allo chalet).
//
// ⚠️ I Termini di Booking (sez. A15.2) vietano la lettura automatica: usare
// questa fonte è una decisione di rischio di Martino. Finché non la prende,
// l'interruttore DISPONIBILITA_BOOKING resta spento e le pagine dicono
// «disponibilità su richiesta» — mai date inventate.
//
// Regole che non si piegano (DISPONIBILITA §5.4):
//   · niente cookie, token, Origin/Referer finti né browser headless: se un
//     giorno servissero, ci si ferma;
//   · ogni risposta strana LANCIA dentro la funzione in cache, così Next tiene
//     la copia buona; oltre 48 ore senza una lettura buona → «su richiesta»;
//   · nessun prezzo e nessun testo di Booking escono di qui.

const ENDPOINT = "https://www.booking.com/dml/graphql?lang=it";
const UA = "FriuliVillas-disponibilita/1.0 (+https://friulivillas.com; richieste@triestevillas.com)";
const FINESTRA = 61; // misurato: l'endpoint ne restituisce al massimo 61 per chiamata
const FINESTRE = 6; // 12 mesi
const TIMEOUT_MS = 8_000;
const PAUSA_MS = 900;
const REVALIDATE_S = 6 * 3600;
const ETA_MASSIMA_MS = 48 * 3600_000;

type Fonte = { pagename: string; hotelId: number; adulti: number };

/** Le fasce di persone: dentro una fascia il calendario di Booking è identico (misurato). */
function fonteDi(casa: string, persone: number): Fonte | null {
  if (casa === "top-hill-cottage") {
    return persone >= 1 && persone <= 10 ? { pagename: "top-hill-cottage", hotelId: 13843230, adulti: 2 } : null;
  }
  if (casa === "chalet-navauce") {
    if (persone >= 1 && persone <= 3) return { pagename: "chalet-navauce", hotelId: 10381926, adulti: 3 };
    if (persone >= 4 && persone <= 5) return { pagename: "chalet-navauce", hotelId: 10381926, adulti: 5 };
    return null;
  }
  return null;
}

export type Calendario = {
  stato: "ok" | "vecchia" | "su-richiesta";
  /** perché «su richiesta»: interruttore spento, fascia di persone fuori calendario, fonte muta */
  perche?: "spento" | "persone" | "fonte";
  /** ISO dell'ultima lettura buona */
  aggiornataAlle: string | null;
  /** primo giorno del calendario (AAAA-MM-GG, Roma) */
  dal: string | null;
  /**
   * Un carattere per giorno da `dal`: «0» non si arriva; altrimenti il
   * soggiorno minimo per quell'arrivo in base 36 («2», «3», … «u»).
   */
  arrivi: string;
  /** Un carattere per giorno: «1» notte libera, «0» no (DISPONIBILITA §5.3). */
  libere: string;
  /** ultimo arrivo possibile: oltre, le date non sono ancora in calendario */
  orizzonte: string | null;
};

const SU_RICHIESTA = (perche: Calendario["perche"]): Calendario => ({
  stato: "su-richiesta",
  perche,
  aggiornataAlle: null,
  dal: null,
  arrivi: "",
  libere: "",
  orizzonte: null,
});

const oggiRoma = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
function piuGiorni(iso: string, n: number): string {
  const [a, m, g] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, g + n)).toISOString().slice(0, 10);
}

const QUERY =
  "query AvailabilityCalendar($input: AvailabilityCalendarQueryInput!) { availabilityCalendar(input: $input) { ... on AvailabilityCalendarQueryResult { hotelId days { available checkin minLengthOfStay } } ... on AvailabilityCalendarQueryError { message } __typename } }";

type Giorno = { checkin: string; available: boolean; minLengthOfStay: number };

async function finestra(f: Fonte, startDate: string, amountOfDays: number): Promise<Giorno[]> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": UA, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      operationName: "AvailabilityCalendar",
      variables: {
        input: {
          travelPurpose: 2,
          pagenameDetails: { countryCode: "it", pagename: f.pagename },
          searchConfig: {
            searchConfigDate: { startDate, amountOfDays },
            nbAdults: f.adulti,
            nbRooms: 1,
            nbChildren: 0,
            childrenAges: [],
          },
        },
      },
      query: QUERY,
    }),
  });
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  if (!(res.headers.get("content-type") ?? "").includes("json")) throw new Error("risposta non JSON (challenge o blocco)");
  const json = (await res.json()) as { data?: { availabilityCalendar?: Record<string, unknown> } };
  const ac = json.data?.availabilityCalendar;
  if (!ac || ac.__typename !== "AvailabilityCalendarQueryResult") throw new Error(`tipo «${String(ac?.__typename)}»`);
  if (ac.hotelId !== f.hotelId) throw new Error(`hotelId ${String(ac.hotelId)} invece di ${f.hotelId}`);
  const days = ac.days as unknown;
  if (!Array.isArray(days) || days.length !== amountOfDays) throw new Error(`giorni ${Array.isArray(days) ? days.length : "?"} invece di ${amountOfDays}`);
  const fine = piuGiorni(startDate, amountOfDays);
  const visti = new Set<string>();
  return days.map((d: Record<string, unknown>) => {
    const checkin = String(d.checkin);
    const min = d.minLengthOfStay;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkin) || checkin < startDate || checkin >= fine || visti.has(checkin))
      throw new Error(`data fuori finestra o doppia: ${checkin}`);
    if (typeof d.available !== "boolean") throw new Error("available non booleano");
    if (!Number.isInteger(min) || (min as number) < 1 || (min as number) > 30) throw new Error(`minimo ${String(min)}`);
    visti.add(checkin);
    return { checkin, available: d.available, minLengthOfStay: min as number };
  });
}

async function leggiDaBooking(pagename: string, hotelId: number, adulti: number): Promise<Calendario> {
  const f: Fonte = { pagename, hotelId, adulti };
  const dal = oggiRoma();
  const tutti: Giorno[] = [];
  for (let i = 0; i < FINESTRE; i++) {
    const giorni = await finestra(f, piuGiorni(dal, i * FINESTRA), FINESTRA);
    tutti.push(...giorni);
    if (i < FINESTRE - 1) await new Promise((r) => setTimeout(r, PAUSA_MS));
  }
  tutti.sort((a, b) => a.checkin.localeCompare(b.checkin));
  if (!tutti.some((g) => g.available)) throw new Error("nessun arrivo possibile in 12 mesi: annuncio sospeso?");
  const n = tutti.length;
  const libere = new Array<string>(n).fill("0");
  const arrivi = tutti.map((g, i) => {
    if (!g.available) return "0";
    for (let k = 0; k < g.minLengthOfStay && i + k < n; k++) libere[i + k] = "1";
    return g.minLengthOfStay.toString(36);
  });
  const ultimo = [...tutti].reverse().find((g) => g.available)?.checkin ?? null;
  return {
    stato: "ok",
    aggiornataAlle: new Date().toISOString(),
    dal: tutti[0].checkin,
    arrivi: arrivi.join(""),
    libere: libere.join(""),
    orizzonte: ultimo,
  };
}

// La copia buona nella Data Cache di Next, una per casa e fascia. Una lettura
// rotta lancia e non la sovrascrive.
const inCache = unstable_cache(leggiDaBooking, ["disponibilita-booking-v1"], {
  revalidate: REVALIDATE_S,
  tags: ["disponibilita"],
});

const ultimaBuona = new Map<string, Calendario>();

export function interruttoreAcceso(): boolean {
  return process.env.DISPONIBILITA_BOOKING === "on";
}

export async function calendario(casa: string, persone: number): Promise<Calendario> {
  if (!interruttoreAcceso()) return SU_RICHIESTA("spento");
  const f = fonteDi(casa, persone);
  if (!f) return SU_RICHIESTA("persone");
  const chiave = `${f.pagename}:${f.adulti}`;
  let c: Calendario | undefined;
  try {
    c = await inCache(f.pagename, f.hotelId, f.adulti);
    ultimaBuona.set(chiave, c);
  } catch (e) {
    console.error(`[disponibilita] ${chiave}: ${e instanceof Error ? e.message : String(e)}`);
    c = ultimaBuona.get(chiave);
  }
  if (!c?.aggiornataAlle) return SU_RICHIESTA("fonte");
  const eta = Date.now() - Date.parse(c.aggiornataAlle);
  if (eta > ETA_MASSIMA_MS) return SU_RICHIESTA("fonte");
  return eta > REVALIDATE_S * 1000 * 1.5 ? { ...c, stato: "vecchia" } : c;
}
