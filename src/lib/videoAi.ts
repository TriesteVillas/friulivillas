// La trasparenza AI sui VIDEO — la parte PURA, condivisa fra server e client
// (SPEC trasparenza §10, v1.2 del 01/10/2026 sera). La lettura del registro
// sta in src/lib/trasparenza.ts (server-only), insieme alla vista delle foto.
//
// IL REGISTRO. Nel CRM ogni video pubblicato ha una riga in
// `video_trasparenza`, e la vista `?vista=trasparenza` ne manda la chiave
// `video`: per ogni riga la `chiave` del video, l'`etichetta` già pronta nelle
// quattro lingue (o null: ripresa vera senza voce sintetica, montaggio senza
// foto AI né voce) e la `didascalia` (obbligatoria in quattro lingue quando il
// video non è `reale`). Il sito non decide niente: indicizza per chiave e
// mostra quello che il registro dice.
//
// LA CHIAVE (SPEC §10.1):
//   · YouTube: `youtube:<id di 11 caratteri>`;
//   · un file servito da questo sito: `fv:<percorso servito>`, es.
//     `fv:/video/hero.mp4`. Una variante dello stesso filmato (il 720p del
//     video di testata) si cerca con la chiave del file principale: è lo
//     stesso video.
//
// SENZA RIGA: nessuna etichetta (il prebuild elenca come AVVISO i video del
// catalogo senza riga: scripts/trasparenza-ripiego.mjs). Unica eccezione, per
// non perdere niente: dove il sito sapeva già che il video è AI (lo staging
// della home, il registro content/annunciVideo.ts del video di testata), quel
// sapere resta come ripiego finché il registro non ha la riga.
import { LINGUE_AI, testoIn, type LinguaAi, type Testi } from "./fotoAi";

export const PREFISSO_SITO = "fv";

/** Una riga del registro, ripulita: solo ciò che il sito mostra. */
export type VideoAi = {
  /** `reale` · `ai_montaggio` · `ai_animato` · `ai_generato` (SPEC §10.1); null se manca */
  trattamento: string | null;
  etichetta: Testi | null;
  didascalia: Testi | null;
};

// ---- La home: il segno discreto (SPEC v1.3 §11.1, 02/10/2026) ----------------
// Nella home nessuna pillola: un video animato con l'AI (`ai_animato`) porta
// solo un testo piccolo, «video AI»; un video GENERATO (`ai_generato`: lo
// staging, arredi che nella casa non ci sono) dice la sostanza, «simulazione»,
// come le foto `ai_aggiunte` (review di misura del 02/10: «video AI» sullo
// staging aveva perso il fatto che conta). La didascalia del registro va ai
// lettori di schermo. Il montaggio di foto e la sola voce sintetica, in home,
// non portano niente: la dichiarazione completa sta nella scheda (e nella
// pagina /ai del gruppo). Gli stessi segni valgono per le pagine di marchio
// (/vendi, /contatti): video d'atmosfera, non annunci.
const SEGNO_VIDEO_HOME: Record<"ai_animato" | "ai_generato", Record<LinguaAi, string>> = {
  ai_animato: { it: "video AI", en: "AI video", de: "AI-Video", sl: "AI-video" },
  ai_generato: { it: "simulazione", en: "simulation", de: "Simulation", sl: "simulacija" },
};

export function segnoVideoHome(
  riga: VideoAi | null | undefined,
  locale: string,
): { testo: string; descrizione: string | null; descrizioneLang: LinguaAi | null; lang: LinguaAi } | null {
  const t = riga?.trattamento;
  if (t !== "ai_animato" && t !== "ai_generato") return null;
  const lang = ((LINGUE_AI as readonly string[]).includes(locale) ? locale : "en") as LinguaAi;
  const d = testoIn(riga?.didascalia, locale);
  return { testo: SEGNO_VIDEO_HOME[t][lang], descrizione: d?.testo ?? null, descrizioneLang: d?.lang ?? null, lang };
}

export const chiaveYoutube = (id: string): string => `youtube:${id}`;
export const chiaveFile = (percorso: string): string => `${PREFISSO_SITO}:${percorso}`;

const RE_CHIAVE = /^(?:youtube:[\w-]{11}|fv:\/[^\s?#]+\.(?:mp4|webm|mov|m4v))$/;
/** Le sole chiavi che questo sito sa mostrare (YouTube, o un suo file). */
export const chiaveValida = (k: unknown): k is string => typeof k === "string" && RE_CHIAVE.test(k);

/**
 * Cosa arriva al componente che disegna l'etichetta: testi già nella lingua
 * del visitatore (con `lang` vero quando si ripiega su en/it), e l'aria-label
 * che porta anche la didascalia (chi non vede l'etichetta la sente per intero).
 */
export type EtichettaVideoDati = {
  testo: string;
  lang: LinguaAi;
  didascalia: string | null;
  didascaliaLang: LinguaAi | null;
  aria: string;
};

/**
 * L'etichetta di un video nella lingua della pagina, o null se il registro
 * non ne prevede una. La didascalia viaggia con lei (può esserci anche senza
 * etichetta: la restituisce `didascaliaVideo`).
 */
export function datiEtichettaVideo(riga: VideoAi | null | undefined, locale: string): EtichettaVideoDati | null {
  const e = testoIn(riga?.etichetta, locale);
  if (!e) return null;
  const d = testoIn(riga?.didascalia, locale);
  return {
    testo: e.testo,
    lang: e.lang,
    didascalia: d?.testo ?? null,
    didascaliaLang: d?.lang ?? null,
    aria: d ? `${e.testo}: ${d.testo}` : e.testo,
  };
}

/** La sola didascalia (anche di un video senza etichetta), nella lingua della pagina. */
export function didascaliaVideo(
  riga: VideoAi | null | undefined,
  locale: string,
): { testo: string; lang: LinguaAi } | null {
  return testoIn(riga?.didascalia, locale);
}

/** Testi nelle quattro lingue, o null se nessuna lingua c'è. */
export function testiVideo(v: unknown): Testi | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const t = Object.fromEntries(
    LINGUE_AI.map((l) => [l, typeof o[l] === "string" && (o[l] as string).trim() ? (o[l] as string).trim() : null]),
  ) as Testi;
  return LINGUE_AI.some((l) => t[l] !== null) ? t : null;
}
