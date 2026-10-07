// La richiesta di preventivo dei soggiorni (Top Hill Cottage, Chalet Navauce):
// la parte PURA, la stessa regola nel browser (per dire subito cosa manca) e
// nel server (che non si fida del browser). Niente I/O qui.
//
// Perché una regola sola: il modulo sta in fondo a una pagina lunga, e chi lo
// riempie non deve scoprire al terzo invio che le date erano rovesciate. E il
// server non deve accettare ciò che il modulo avrebbe rifiutato.
//
// ⛔ La richiesta NON nomina un immobile del CRM: le due case non sono nel
// catalogo di vendita. Il server la registra fra i lead col solo indirizzo
// della pagina (vedi app/api/affitti/preventivo/route.ts).

import { CASE, type SlugCasa, casaDa } from "@/content/affitti/case";

export const TIPI_SOGGIORNO = ["natura", "ritiro", "famiglia", "altro"] as const;
export type TipoSoggiorno = (typeof TIPI_SOGGIORNO)[number];

export type ScelteCasa = SlugCasa | "entrambe";

export type RichiestaPreventivo = {
  casa: ScelteCasa;
  /** AAAA-MM-GG, calendario di Roma */
  arrivo: string;
  partenza: string;
  adulti: number;
  bambini: number;
  animali: boolean;
  tipo: TipoSoggiorno;
  /** id dei servizi del registro della casa: niente fuori registro */
  servizi: string[];
  /** id delle esperienze scelte nel «componi il soggiorno» */
  esperienze: string[];
  messaggio: string;
  nome: string;
  email: string;
  telefono: string;
  lingua: "it" | "en" | "de" | "sl";
  privacyOk: boolean;
};

export type ErrorePreventivo =
  | "casa"
  | "date"
  | "date_passate"
  | "notti"
  | "ospiti"
  | "ospiti_max"
  | "nome"
  | "contatto"
  | "privacy"
  | "tipo";

/** Il tetto di notti che il modulo accetta: oltre, si scrive a mano. */
export const NOTTI_MAX = 60;

const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const cifre = (v: string) => v.replace(/\D/g, "").length;

/** Data di oggi nel calendario di Roma, AAAA-MM-GG (l'orario del gruppo è quello di Trieste). */
export function oggiRoma(adesso: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(adesso);
}

/** Notti fra due date di calendario (aritmetica sul calendario, non sui millisecondi). */
export function notti(arrivo: string, partenza: string): number {
  if (!RE_DATA.test(arrivo) || !RE_DATA.test(partenza)) return NaN;
  const [a1, m1, g1] = arrivo.split("-").map(Number);
  const [a2, m2, g2] = partenza.split("-").map(Number);
  // Date.UTC: mezzanotte UTC di entrambe, nessun fuso e nessuna ora legale in mezzo.
  return Math.round((Date.UTC(a2, m2 - 1, g2) - Date.UTC(a1, m1 - 1, g1)) / 86_400_000);
}

export function dataValida(s: string): boolean {
  if (!RE_DATA.test(s)) return false;
  const [a, m, g] = s.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1, g));
  return d.getUTCFullYear() === a && d.getUTCMonth() === m - 1 && d.getUTCDate() === g;
}

/** Ospiti massimi per la scelta: «entrambe» somma le due case. */
export function ospitiMax(casa: ScelteCasa): number | null {
  if (casa === "entrambe") {
    const tot = CASE.reduce((s, c) => (c.ospitiMax ? s + c.ospitiMax : NaN), 0);
    return Number.isFinite(tot) ? tot : null;
  }
  return casaDa(casa)?.ospitiMax ?? null;
}

export function servizi(casa: ScelteCasa): string[] {
  if (casa === "entrambe") return [...new Set(CASE.flatMap((c) => c.servizi.map((s) => s.id)))];
  return casaDa(casa)?.servizi.map((s) => s.id) ?? [];
}

export function valida(r: RichiestaPreventivo, oggi: string = oggiRoma()): ErrorePreventivo[] {
  const errori: ErrorePreventivo[] = [];
  if (r.casa !== "entrambe" && !casaDa(r.casa)) errori.push("casa");
  if (!(TIPI_SOGGIORNO as readonly string[]).includes(r.tipo)) errori.push("tipo");
  if (!dataValida(r.arrivo) || !dataValida(r.partenza)) errori.push("date");
  else {
    if (r.arrivo < oggi) errori.push("date_passate");
    const n = notti(r.arrivo, r.partenza);
    if (!(n >= 1)) errori.push("date");
    else if (n > NOTTI_MAX) errori.push("notti");
  }
  if (!Number.isInteger(r.adulti) || r.adulti < 1 || !Number.isInteger(r.bambini) || r.bambini < 0)
    errori.push("ospiti");
  else {
    const max = ospitiMax(r.casa);
    if (max !== null && r.adulti + r.bambini > max) errori.push("ospiti_max");
  }
  if (r.nome.trim().length < 2) errori.push("nome");
  if (!isEmail(r.email.trim()) && cifre(r.telefono) < 6) errori.push("contatto");
  if (!r.privacyOk) errori.push("privacy");
  return errori;
}

/**
 * Pulizia di ciò che arriva dal browser: tipi certi, lunghezze tagliate,
 * servizi ed esperienze solo dentro i registri. Restituisce sempre un oggetto
 * completo; la validità la dice `valida`.
 */
export function normalizza(body: Record<string, unknown>, esperienzeAmmesse: ReadonlySet<string>): RichiestaPreventivo {
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.trunc(v) : typeof v === "string" && /^\d{1,3}$/.test(v) ? Number(v) : NaN);
  const casaGrezza = s(body.casa, 40);
  const casa: ScelteCasa = casaGrezza === "entrambe" ? "entrambe" : ((casaDa(casaGrezza)?.slug ?? casaGrezza) as ScelteCasa);
  const ammessi = new Set(servizi(casa));
  const lista = (v: unknown, ok: (x: string) => boolean) =>
    Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && ok(x)))].slice(0, 30) : [];
  const lingua = s(body.lingua, 2);
  return {
    casa,
    arrivo: s(body.arrivo, 10),
    partenza: s(body.partenza, 10),
    adulti: n(body.adulti),
    bambini: body.bambini === undefined || body.bambini === "" ? 0 : n(body.bambini),
    animali: body.animali === true,
    tipo: (TIPI_SOGGIORNO as readonly string[]).includes(s(body.tipo, 20)) ? (s(body.tipo, 20) as TipoSoggiorno) : "altro",
    servizi: lista(body.servizi, (x) => ammessi.has(x)),
    esperienze: lista(body.esperienze, (x) => esperienzeAmmesse.has(x)),
    messaggio: s(body.messaggio, 4000),
    nome: s(body.nome, 120),
    email: s(body.email, 160),
    telefono: s(body.telefono, 40),
    lingua: lingua === "en" || lingua === "de" || lingua === "sl" ? lingua : "it",
    privacyOk: body.privacyOk === true,
  };
}

/** Campo trappola e tempo minimo: chi riempie un modulo in meno di 3 s non è una persona. */
export const TEMPO_MINIMO_MS = 3_000;
export function sembraUnRobot(body: Record<string, unknown>, adesso = Date.now()): boolean {
  if (typeof body.sito_web === "string" && body.sito_web.trim() !== "") return true;
  const t0 = typeof body.t0 === "number" ? body.t0 : NaN;
  if (!Number.isFinite(t0)) return true;
  // Nessun tetto massimo: chi comincia il modulo, va a cena e lo manda dopo è
  // una persona. Il t0 lo fissa il browser al PRIMO tocco del modulo.
  return adesso - t0 < TEMPO_MINIMO_MS;
}
