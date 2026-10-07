"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useProgramma } from "./Programma";
import { notti as contaNotti, oggiRoma, type ErrorePreventivo, type TipoSoggiorno } from "@/lib/affitti/preventivo";
import type { Calendario } from "@/lib/affitti/disponibilita";

// Date libere e richiesta di preventivo. Il calendario lo dà SOLO la nostra
// rotta (/api/affitti/disponibilita): il browser non parla mai con Booking.
// Se la rotta dice «su richiesta» (interruttore spento, gruppo oltre la
// capienza, fonte muta) il calendario lascia il posto a due campi data: mai
// date inventate. Il modulo parte con il programma scelto nelle stagioni.

export type TestiPrenota = {
  titolo: string;
  intro: string;
  persone: string;
  adulti: string;
  bambini: string;
  animali: string;
  date: string;
  arrivo: string;
  partenza: string;
  scegliArrivo: string;
  scegliPartenza: string;
  minimo: string; // «Soggiorno minimo {n} notti»
  notti: string; // «{n} notti»
  legendaLibero: string;
  legendaOccupato: string;
  aggiornato: string; // «Disponibilità indicativa, aggiornata alle {ora} del {data}. La conferma arriva con il preventivo.»
  suRichiesta: string;
  suRichiestaPersone: string;
  oltreOrizzonte: string;
  mesePrec: string;
  meseSucc: string;
  ricomincia: string;
  tipo: string;
  tipi: Record<TipoSoggiorno, string>;
  servizi: string;
  serviziNota: string;
  programma: string;
  programmaVuoto: string;
  togli: string;
  entrambe: string | null; // «Siamo un gruppo: proponeteci anche {casa}»
  nome: string;
  email: string;
  telefono: string;
  contattoNota: string;
  messaggio: string;
  messaggioPh: string;
  privacy: string; // con {link}
  privacyLink: string;
  invia: string;
  invio: string;
  grazieTitolo: string;
  grazieTesto: string;
  errore: string;
  errori: Record<ErrorePreventivo, string>;
};

type Props = {
  casa: "top-hill-cottage" | "chalet-navauce";
  nomeCasa: string;
  sorella: { slug: "top-hill-cottage" | "chalet-navauce"; nome: string } | null;
  ospitiMax: number;
  servizi: Array<{ id: string; testo: string }>;
  esperienze: Record<string, string>; // id → titolo nella lingua
  testi: TestiPrenota;
  locale: "it" | "en" | "de" | "sl";
  privacyHref: string;
};

const piu = (iso: string, n: number) => {
  const [a, m, g] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, g + n)).toISOString().slice(0, 10);
};
const giorniFra = (a: string, b: string) => contaNotti(a, b);
const BCP: Record<string, string> = { it: "it-IT", en: "en-GB", de: "de-DE", sl: "sl-SI" };

export default function Prenota({ casa, nomeCasa, sorella, ospitiMax, servizi, esperienze, testi, locale, privacyHref }: Props) {
  const { scelte, togli } = useProgramma();
  const [adulti, setAdulti] = useState(2);
  const [bambini, setBambini] = useState(0);
  const [animali, setAnimali] = useState(false);
  const [entrambe, setEntrambe] = useState(false);
  const [cal, setCal] = useState<Calendario | null>(null);
  const [arrivo, setArrivo] = useState<string>("");
  const [partenza, setPartenza] = useState<string>("");
  const [mese, setMese] = useState(0); // scostamento in mesi dal mese corrente
  const [tipo, setTipo] = useState<TipoSoggiorno>("natura");
  const [serviziScelti, setServiziScelti] = useState<string[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [trappola, setTrappola] = useState("");
  const [stato, setStato] = useState<"pronto" | "invio" | "fatto" | "errore">("pronto");
  const [errori, setErrori] = useState<ErrorePreventivo[]>([]);
  const t0 = useRef<number | null>(null);
  const [oggi, setOggi] = useState<string>("");

  useEffect(() => setOggi(oggiRoma()), []);

  const persone = adulti + bambini;
  const casaRichiesta = entrambe ? "entrambe" : casa;

  // Il calendario si rilegge quando cambia il numero di persone (lo chalet si
  // vende anche a metà: il calendario dipende da quanti si è).
  useEffect(() => {
    let vivo = true;
    const ctl = new AbortController();
    fetch(`/api/affitti/disponibilita?casa=${casa}&persone=${Math.max(1, persone)}`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((c: Calendario | null) => {
        if (vivo) setCal(c ?? { stato: "su-richiesta", perche: "fonte", aggiornataAlle: null, dal: null, arrivi: "", libere: "", orizzonte: null });
      })
      .catch(() => {
        if (vivo) setCal({ stato: "su-richiesta", perche: "fonte", aggiornataAlle: null, dal: null, arrivi: "", libere: "", orizzonte: null });
      });
    return () => {
      vivo = false;
      ctl.abort();
    };
  }, [casa, persone]);

  const conCalendario = cal !== null && cal.stato !== "su-richiesta" && !!cal.dal && !entrambe;

  const idx = (iso: string) => (cal?.dal ? giorniFra(cal.dal, iso) : -1);
  const arrivoPossibile = (iso: string) => {
    if (!conCalendario || iso < oggi) return false;
    const i = idx(iso);
    return i >= 0 && i < cal!.arrivi.length && cal!.arrivi[i] !== "0";
  };
  const minimoDi = (iso: string) => {
    const i = idx(iso);
    return i >= 0 && cal ? parseInt(cal.arrivi[i] ?? "0", 36) || 1 : 1;
  };
  const partenzaPossibile = (iso: string) => {
    if (!conCalendario || !arrivo || iso <= arrivo) return false;
    const n = giorniFra(arrivo, iso);
    if (n < minimoDi(arrivo)) return false;
    const i0 = idx(arrivo);
    for (let k = 0; k < n; k++) if (cal!.libere[i0 + k] !== "1") return false;
    return true;
  };

  const scegliGiorno = (iso: string) => {
    if (!arrivo || (arrivo && partenza)) {
      if (arrivoPossibile(iso)) {
        setArrivo(iso);
        setPartenza("");
      }
      return;
    }
    if (partenzaPossibile(iso)) setPartenza(iso);
    else if (arrivoPossibile(iso)) setArrivo(iso);
  };

  // I due mesi mostrati.
  const mesi = useMemo(() => {
    if (!oggi) return [];
    const [a, m] = oggi.split("-").map(Number);
    return [0, 1].map((d) => {
      const prima = new Date(Date.UTC(a, m - 1 + mese + d, 1));
      const anno = prima.getUTCFullYear();
      const mm = prima.getUTCMonth();
      const giorni = new Date(Date.UTC(anno, mm + 1, 0)).getUTCDate();
      const inizio = (prima.getUTCDay() + 6) % 7; // lunedì = 0
      const titolo = new Intl.DateTimeFormat(BCP[locale], { month: "long", year: "numeric", timeZone: "UTC" }).format(prima);
      const celle: Array<string | null> = Array.from({ length: inizio }, () => null);
      for (let g = 1; g <= giorni; g++) celle.push(`${anno}-${String(mm + 1).padStart(2, "0")}-${String(g).padStart(2, "0")}`);
      return { titolo, celle };
    });
  }, [oggi, mese, locale]);

  const giorniSettimana = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat(BCP[locale], { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + i))),
      ),
    [locale],
  );

  const dataBreve = (iso: string) => {
    const [a, m, g] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat(BCP[locale], { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(a, m - 1, g)));
  };

  const dataConAnno = (iso: string) => {
    const [a, m, g] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat(BCP[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(a, m - 1, g)));
  };

  const nNotti = arrivo && partenza ? giorniFra(arrivo, partenza) : 0;

  const invia = async (e: React.FormEvent) => {
    e.preventDefault();
    setStato("invio");
    setErrori([]);
    try {
      const r = await fetch("/api/affitti/preventivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          casa: casaRichiesta,
          arrivo,
          partenza,
          adulti,
          bambini,
          animali,
          tipo,
          servizi: serviziScelti,
          esperienze: scelte,
          messaggio,
          nome,
          email,
          telefono,
          lingua: locale,
          privacyOk: privacy,
          sito_web: trappola,
          t0: t0.current ?? Date.now(),
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; errori?: ErrorePreventivo[] };
      if (r.ok && j.ok) {
        setStato("fatto");
        return;
      }
      if (j.errori?.length) setErrori(j.errori);
      setStato("errore");
    } catch {
      setStato("errore");
    }
  };

  if (stato === "fatto") {
    return (
      <div className="rounded-3xl bg-brand-dark p-8 text-white sm:p-12" role="status">
        <p className="font-[family-name:var(--font-affitti-display)] text-4xl">{testi.grazieTitolo}</p>
        <p className="mt-4 max-w-xl text-white/85">{testi.grazieTesto}</p>
      </div>
    );
  }

  const stepper = (val: number, set: (n: number) => void, min: number, label: string) => (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-300 bg-white px-3 py-2">
      <span className="text-sm text-neutral-800">{label}</span>
      <span className="flex items-center gap-2">
        <button type="button" aria-label={`− ${label}`} onClick={() => set(Math.max(min, val - 1))} className="h-8 w-8 rounded-full border border-neutral-300 text-lg leading-none">
          −
        </button>
        <span className="w-6 text-center tabular-nums" aria-live="polite">
          {val}
        </span>
        <button type="button" aria-label={`+ ${label}`} onClick={() => set(Math.min(40, val + 1))} className="h-8 w-8 rounded-full border border-neutral-300 text-lg leading-none">
          +
        </button>
      </span>
    </div>
  );

  return (
    <form
      onSubmit={invia}
      onFocusCapture={() => {
        if (t0.current === null) t0.current = Date.now();
      }}
      className="grid gap-10 lg:grid-cols-[1.15fr_1fr]"
      id="preventivo-affitti"
      noValidate
    >
      {/* colonna 1: persone e date */}
      <div className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-700">{testi.persone}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {stepper(adulti, setAdulti, 1, testi.adulti)}
            {stepper(bambini, setBambini, 0, testi.bambini)}
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input type="checkbox" checked={animali} onChange={(e) => setAnimali(e.target.checked)} className="h-4 w-4 accent-brand" />
            {testi.animali}
          </label>
          {sorella && testi.entrambe && (
            <label className="flex items-start gap-2 text-sm text-neutral-800">
              <input type="checkbox" checked={entrambe} onChange={(e) => setEntrambe(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand" />
              {testi.entrambe.replace("{casa}", sorella.nome)}
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-700">{testi.date}</legend>
          {conCalendario ? (
            <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <button type="button" onClick={() => setMese((m) => Math.max(0, m - 1))} disabled={mese === 0} className="h-9 rounded-full px-3 text-sm disabled:opacity-30" aria-label={testi.mesePrec}>
                  ←
                </button>
                <p className="text-sm text-neutral-700" aria-live="polite">
                  {!arrivo ? testi.scegliArrivo : !partenza ? `${testi.scegliPartenza} · ${testi.minimo.replace("{n}", String(minimoDi(arrivo)))}` : `${dataBreve(arrivo)} → ${dataBreve(partenza)} · ${testi.notti.replace("{n}", String(nNotti))}`}
                </p>
                <button type="button" onClick={() => setMese((m) => Math.min(10, m + 1))} className="h-9 rounded-full px-3 text-sm" aria-label={testi.meseSucc}>
                  →
                </button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {mesi.map((m) => (
                  <div key={m.titolo}>
                    <p className="mb-2 text-center text-sm font-semibold capitalize text-ink">{m.titolo}</p>
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-neutral-500">
                      {giorniSettimana.map((g, i) => (
                        <span key={i}>{g}</span>
                      ))}
                    </div>
                    <div className="mt-1 grid grid-cols-7 gap-1">
                      {m.celle.map((iso, i) => {
                        if (!iso) return <span key={`v${i}`} />;
                        const passato = iso < oggi;
                        const puoArrivare = arrivoPossibile(iso);
                        const puoPartire = partenzaPossibile(iso);
                        const scelto = iso === arrivo || iso === partenza;
                        const dentro = arrivo && partenza && iso > arrivo && iso < partenza;
                        const libero = !passato && cal!.libere[idx(iso)] === "1";
                        const attivo = arrivo && !partenza ? puoPartire || puoArrivare : puoArrivare;
                        return (
                          <button
                            key={iso}
                            type="button"
                            disabled={!attivo}
                            onClick={() => scegliGiorno(iso)}
                            aria-pressed={scelto}
                            className={`aspect-square rounded-lg text-sm tabular-nums transition-colors ${
                              scelto
                                ? "bg-brand-dark font-semibold text-white"
                                : dentro
                                  ? "bg-brand/15 text-ink"
                                  : attivo
                                    ? "bg-brand/[0.07] font-medium text-ink hover:bg-brand/20"
                                    : libero
                                      ? "text-neutral-500"
                                      : "text-neutral-300 line-through decoration-neutral-300"
                            }`}
                          >
                            {Number(iso.slice(8))}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-neutral-600">
                <span>
                  <span className="mr-1 inline-block h-3 w-3 rounded bg-brand/20 align-middle" /> {testi.legendaLibero} ·{" "}
                  <span className="mx-1 inline-block h-3 w-3 align-middle text-neutral-300 line-through">12</span> {testi.legendaOccupato}
                </span>
                {(arrivo || partenza) && (
                  <button type="button" onClick={() => { setArrivo(""); setPartenza(""); }} className="underline underline-offset-2">
                    {testi.ricomincia}
                  </button>
                )}
              </div>
              {cal?.aggiornataAlle && (
                <p className="mt-3 text-[11px] leading-snug text-neutral-600">
                  {testi.aggiornato
                    .replace("{ora}", new Intl.DateTimeFormat(BCP[locale], { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" }).format(new Date(cal.aggiornataAlle)))
                    .replace("{data}", new Intl.DateTimeFormat(BCP[locale], { day: "numeric", month: "long", timeZone: "Europe/Rome" }).format(new Date(cal.aggiornataAlle)))}
                  {cal.orizzonte ? ` ${testi.oltreOrizzonte.replace("{data}", dataConAnno(cal.orizzonte))}` : ""}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-neutral-700">
                {cal?.perche === "persone" ? testi.suRichiestaPersone.replace("{n}", String(ospitiMax)) : testi.suRichiesta}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-neutral-700">{testi.arrivo}</span>
                  <input type="date" min={oggi || undefined} value={arrivo} onChange={(e) => setArrivo(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3" />
                </label>
                <label className="block text-sm">
                  <span className="text-neutral-700">{testi.partenza}</span>
                  <input type="date" min={arrivo ? piu(arrivo, 1) : oggi || undefined} value={partenza} onChange={(e) => setPartenza(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3" />
                </label>
              </div>
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-700">{testi.tipo}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(testi.tipi) as TipoSoggiorno[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={tipo === k}
                onClick={() => setTipo(k)}
                className={`h-10 rounded-full px-4 text-sm font-medium transition-colors ${tipo === k ? "bg-brand-dark text-white" : "border border-neutral-300 bg-white text-neutral-800 hover:border-brand"}`}
              >
                {testi.tipi[k]}
              </button>
            ))}
          </div>
        </fieldset>

        {servizi.length > 0 && (
          <fieldset>
            <legend className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-700">{testi.servizi}</legend>
            <p className="mt-1 text-xs text-neutral-600">{testi.serviziNota}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {servizi.map((s) => (
                <label key={s.id} className="flex items-start gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800">
                  <input
                    type="checkbox"
                    checked={serviziScelti.includes(s.id)}
                    onChange={(e) => setServiziScelti((x) => (e.target.checked ? [...x, s.id] : x.filter((y) => y !== s.id)))}
                    className="mt-0.5 h-4 w-4 accent-brand"
                  />
                  {s.testo}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>

      {/* colonna 2: programma e contatti */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-paper p-5">
          <p className="text-sm font-semibold text-ink">{testi.programma}</p>
          {scelte.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {scelte.map((id) => (
                <li key={id} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs text-ink ring-1 ring-neutral-200">
                  {esperienze[id] ?? id}
                  <button type="button" onClick={() => togli(id)} aria-label={`${testi.togli}: ${esperienze[id] ?? id}`} className="ml-1 text-neutral-500 hover:text-ink">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-neutral-600">{testi.programmaVuoto}</p>
          )}
        </div>

        <div className="grid gap-3">
          <label className="block text-sm">
            <span className="text-neutral-700">{testi.nome}</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" className="mt-1 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-neutral-700">{testi.email}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-1 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3" />
            </label>
            <label className="block text-sm">
              <span className="text-neutral-700">{testi.telefono}</span>
              <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" className="mt-1 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3" />
            </label>
          </div>
          <p className="text-[11px] text-neutral-600">{testi.contattoNota}</p>
          <label className="block text-sm">
            <span className="text-neutral-700">{testi.messaggio}</span>
            <textarea value={messaggio} onChange={(e) => setMessaggio(e.target.value)} rows={4} placeholder={testi.messaggioPh} className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2" />
          </label>
          {/* la trappola: invisibile a chi guarda, irresistibile per i robot */}
          <label aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
            Sito web
            <input tabIndex={-1} autoComplete="off" value={trappola} onChange={(e) => setTrappola(e.target.value)} name="sito_web" />
          </label>
          <label className="flex items-start gap-2 text-xs leading-relaxed text-neutral-700">
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
            <span>
              {testi.privacy.split("{link}")[0]}
              <a href={privacyHref} className="underline underline-offset-2">
                {testi.privacyLink}
              </a>
              {testi.privacy.split("{link}")[1] ?? ""}
            </span>
          </label>
        </div>

        {errori.length > 0 && (
          <ul className="space-y-1 rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">
            {errori.map((e) => (
              <li key={e}>{testi.errori[e]}</li>
            ))}
          </ul>
        )}
        {stato === "errore" && errori.length === 0 && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">
            {testi.errore}
          </p>
        )}

        <button
          type="submit"
          disabled={stato === "invio"}
          className="btn-press inline-flex h-13 w-full items-center justify-center rounded-full bg-brand-dark px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-ink disabled:opacity-60"
        >
          {stato === "invio" ? testi.invio : testi.invia.replace("{casa}", entrambe && sorella ? `${nomeCasa} + ${sorella.nome}` : nomeCasa)}
        </button>
      </div>
    </form>
  );
}
