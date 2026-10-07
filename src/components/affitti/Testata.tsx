"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import EtichettaVideo from "@/components/EtichettaVideo";
import type { EtichettaVideoDati } from "@/lib/videoAi";
import { albaTramonto, altezzaSole, lunaIlluminata, luceDa, oraRoma, type Luce } from "@/lib/affitti/sole";

// La testata dei soggiorni: la casa con la LUCE CHE C'È ADESSO sopra di lei.
// Di giorno il volo vero del drone; all'ora d'oro e di notte i video della
// stessa casa con quella luce (dichiarati: l'etichetta del video dice cosa ha
// fatto l'AI). La luce si calcola nel browser dalla posizione del sole sopra
// la casa (lib/affitti/sole.ts, collaudato contro l'USNO): una pagina statica
// non sa che ora è. Il visitatore può scegliere un'altra luce coi tre tasti, e
// tornare a quella vera.
//
// Guardie del video come SfondoVideo: niente video con movimento ridotto,
// Save-Data o rete 2g (resta il poster); il file piccolo sotto i 640 px; un
// solo video caricato, quello della luce scelta.

export type VarianteLuce = {
  mp4: string;
  mp4Sm: string;
  poster: string;
  posterSm: string;
  /** null = ripresa vera, nessuna etichetta */
  ai: EtichettaVideoDati | null;
};

export type TestiTestata = {
  eyebrow: string;
  titolo: string;
  sottotitolo: string;
  cta1: string;
  cta2: string;
  /** «Giorno», «Tramonto», «Notte» */
  luci: Record<Luce, string>;
  /** frase della luce vera: {ora} è l'ora del prossimo passaggio, {luna} la luna in % (di notte) */
  adesso: Record<Luce, string> & { notteBuio: string };
  tornaVera: string;
  scegliLuce: string;
  pausa: string;
  riprendi: string;
};

const nessuna = () => () => {};
const useMontato = () => useSyncExternalStore(nessuna, () => true, () => false);

function videoBloccato(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const rete = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (rete?.saveData) return true;
  return typeof rete?.effectiveType === "string" && /^(slow-)?2g$/.test(rete.effectiveType);
}

const ORDINE: Luce[] = ["giorno", "oro", "notte"];

export default function Testata({
  varianti,
  coord,
  testi,
  locale,
  ancoraCasa,
  ancoraPrenota,
}: {
  varianti: Record<Luce, VarianteLuce | null>;
  coord: { lat: number; lon: number };
  testi: TestiTestata;
  locale: string;
  ancoraCasa: string;
  ancoraPrenota: string;
}) {
  const montato = useMontato();
  const [vera, setVera] = useState<Luce>("giorno");
  const [scelta, setScelta] = useState<Luce | null>(null);
  const [riga, setRiga] = useState<string>("");
  const [piccolo, setPiccolo] = useState(false);
  const [bloccato, setBloccato] = useState(true);
  const [inPausa, setInPausa] = useState(false);
  const video = useRef<Record<Luce, HTMLVideoElement | null>>({ giorno: null, oro: null, notte: null });

  // La luce vera, e la frase che la dice, ricalcolate ogni minuto.
  useEffect(() => {
    const aggiorna = () => {
      const ora = new Date();
      const l = luceDa(altezzaSole(ora, coord.lat, coord.lon));
      setVera(l);
      const { alba, tramonto } = albaTramonto(ora, coord.lat, coord.lon);
      // Di notte e al mattino presto la prossima cosa che conta è l'alba;
      // per il resto del giorno, il tramonto.
      const dopoTramonto = tramonto ? ora > tramonto : false;
      const primaAlba = alba ? ora < alba : false;
      const prossima = dopoTramonto
        ? albaTramonto(new Date(ora.getTime() + 86_400_000), coord.lat, coord.lon).alba
        : primaAlba
          ? alba
          : tramonto;
      // Di notte anche la luna: quanta ce n'è adesso (sotto il 4% è una notte senza luna).
      const luna = Math.round(lunaIlluminata(ora) * 100);
      const frase = l === "notte" && luna < 4 ? testi.adesso.notteBuio : testi.adesso[l];
      setRiga(prossima ? frase.replace("{ora}", oraRoma(prossima, locale)).replace("{luna}", String(luna)) : "");
    };
    aggiorna();
    const id = window.setInterval(aggiorna, 60_000);
    return () => window.clearInterval(id);
  }, [coord.lat, coord.lon, locale, testi.adesso]);

  useEffect(() => {
    setBloccato(videoBloccato());
    const mq = window.matchMedia("(max-width: 639px)");
    const su = () => setPiccolo(mq.matches);
    su();
    mq.addEventListener("change", su);
    return () => mq.removeEventListener("change", su);
  }, []);

  const disponibili = ORDINE.filter((l) => varianti[l]);
  const voluta = scelta ?? vera;
  const attiva: Luce = varianti[voluta] ? voluta : (disponibili[0] ?? "giorno");

  // Solo il video attivo gira; gli altri si fermano.
  useEffect(() => {
    if (!montato || bloccato) return;
    for (const l of ORDINE) {
      const v = video.current[l];
      if (!v) continue;
      if (l === attiva && !inPausa) v.play().catch(() => {});
      else v.pause();
    }
  }, [attiva, montato, bloccato, inPausa]);

  return (
    <header className="relative isolate h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink text-white">
      {ORDINE.map((l) => {
        const v = varianti[l];
        if (!v) return null;
        const visibile = l === attiva;
        // Una variante senza mp4 è la sola foto (il poster): la testata regge anche prima dei video.
        const src = montato && !bloccato && visibile && v.mp4 ? (piccolo ? v.mp4Sm || v.mp4 : v.mp4) : undefined;
        return (
          <div
            key={l}
            aria-hidden={!visibile}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-[var(--ease-lux)] ${visibile ? "opacity-100" : "opacity-0"}`}
          >
            <video
              ref={(el) => {
                video.current[l] = el;
              }}
              className="h-full w-full object-cover"
              poster={piccolo ? v.posterSm : v.poster}
              src={src}
              muted
              loop
              playsInline
              preload={visibile ? "auto" : "none"}
              aria-hidden
            />
            <EtichettaVideo dati={visibile ? v.ai : null} className="absolute right-4 top-24 z-[3] sm:right-6" />
          </div>
        );
      })}

      {/* Il velo: il testo bianco regge su qualunque fotogramma (anche un cielo bianco). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(11,21,18,0.55)_0%,rgba(11,21,18,0.05)_26%,rgba(11,21,18,0.45)_52%,rgba(11,21,18,0.92)_100%)] sm:bg-[linear-gradient(180deg,rgba(11,21,18,0.55)_0%,rgba(11,21,18,0.05)_30%,rgba(11,21,18,0.2)_55%,rgba(11,21,18,0.88)_100%)]"
      />

      <div className="relative z-[2] mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 sm:pb-20">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85">{testi.eyebrow}</p>
        <h1 className="font-[family-name:var(--font-affitti-display)] text-[clamp(3rem,9vw,7.5rem)] font-normal leading-[0.92] tracking-[-0.01em] text-white">
          {testi.titolo}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">{testi.sottotitolo}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={ancoraPrenota}
            className="btn-press inline-flex h-12 items-center rounded-full bg-sand px-6 text-sm font-semibold text-ink transition-colors hover:bg-white"
          >
            {testi.cta1}
          </a>
          <a
            href={ancoraCasa}
            className="btn-press inline-flex h-12 items-center rounded-full border border-white/50 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {testi.cta2}
          </a>
        </div>

        {/* La luce: la frase vera e i tre tasti. */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-h-5 text-sm text-white/85" aria-live="polite">
            {montato ? riga : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={testi.scegliLuce}>
            {disponibili.length > 1 &&
              disponibili.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={attiva === l}
                  onClick={() => setScelta(l === vera ? null : l)}
                  className={`h-9 rounded-full px-4 text-xs font-semibold transition-colors ${
                    attiva === l ? "bg-white text-ink" : "border border-white/40 text-white hover:bg-white/10"
                  }`}
                >
                  {testi.luci[l]}
                </button>
              ))}
            {scelta !== null && (
              <button
                type="button"
                onClick={() => setScelta(null)}
                className="h-9 rounded-full px-3 text-xs font-medium text-white/80 underline-offset-4 hover:underline"
              >
                {testi.tornaVera}
              </button>
            )}
            {montato && !bloccato && (
              <button
                type="button"
                onClick={() => setInPausa((p) => !p)}
                aria-label={inPausa ? testi.riprendi : testi.pausa}
                className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white hover:bg-white/10"
              >
                <span aria-hidden className="text-[10px]">
                  {inPausa ? "▶" : "❚❚"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
