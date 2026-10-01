"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import type { VideoAnnuncio } from "@/content/annunciVideo";
import { tSfondoVideo } from "./sfondoVideoStrings";

// IL VIDEO DI TESTATA DELLA SCHEDA (01/10/2026) — filmato muto in loop servito
// da public/, registrato in src/content/annunciVideo.ts (mp4 1080 / mp4Sm 720,
// `ai`). Lo stesso componente di triestevillas.com e triesteaffitti.com
// (SfondoVideo.tsx di quei repo), adattato all'hero di questo sito.
//
// Le garanzie, tutte:
// 1. La COPERTINA non si tocca e resta sempre opaca sotto: è l'LCP e lo
//    snapshot del morph `prop-<slug>`. Il video è un layer che SALE sopra
//    (opacity 0→1), prima del velo della pagina, con lo stesso `par-zoom`
//    della copertina.
// 2. NESSUNA dissolvenza senza fotogrammi: il layer si alza solo all'evento
//    `playing`. Autoplay rifiutato (iOS in risparmio energetico), file assente
//    o illeggibile, o 10 s di riproduzione chiesta senza `playing` → il
//    componente si spegne e resta la foto (fail-safe). Una voce del registro
//    che punta a file non ancora caricati è quindi innocua.
// 3. CLIENT-ONLY e dopo tutto il resto: null sul server e al primo render; i
//    <video> entrano dopo `load` + 200 ms, fuori dal prerender, solo quando
//    l'hero è VICINO allo schermo (250 px) e girano solo quando ne è in vista
//    almeno il 20%. Mai con prefers-reduced-motion, Save-Data o rete 2g/3g:
//    per loro la foto.
// 4. Loop senza stacco: due copie; nell'ultimo secondo la riserva riparte da
//    zero e si dissolve SOPRA quella in scena (z-index scambiato a ogni giro).
// 5. A tutte le larghezze il video copre l'hero come la copertina (qui l'hero
//    ha altezza fissa e il testo ancorato in fondo: la fascia 16:9 dei siti
//    gemelli non avrebbe posto). Sotto i 640 px il file 720p.
// 6. Pausa/Riprendi (WCAG 2.2.2: moto oltre 5 s), alto 44 px; la pausa
//    abbassa il layer e torna la FOTO vera. Fuori vista e a scheda del browser
//    nascosta il video si ferma da sé.
// 7. `ai: true` → l'etichetta di trasparenza sta SUL video, leggibile, nelle
//    quattro lingue (AI Act art. 50 §4), finché si vede il video; col link a
//    /ai solo quando la pagina esiste (`linkAi`). Un video girato davvero
//    (`ai: false`) non la porta.
// 8. L'etichetta AI della COPERTINA (AiTag in page.tsx) sparisce mentre si
//    vede il video: il root porta `data-video-visibile` e la pagina la nasconde
//    con `[header:has([data-video-visibile])_&]:hidden`. Mai un'etichetta che
//    descrive una foto che non si vede, mai due etichette impilate. In pausa
//    torna la foto, e con lei la sua etichetta.
// 9. `velo`: un velo scuro sotto il blocco di testo dell'hero, che sale
//    INSIEME al video e scende con lui: un fotogramma chiaro (facciata
//    bianca, cielo) sotto il titolo lo lasciava a 2-3:1 (misure nel commento
//    di VELO). Non c'è quando si vede la copertina, così la foto resta com'è
//    in ogni altra scheda.

const FADE_S = 1;
const SOGLIA_VISTA = 0.2;
const MARGINE_CARICO = "250px 0px";
const TIMEOUT_MS = 10_000;

// Le stesse guardie di HeroVideo e LoopVideo.
function bloccato(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const rete = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (rete?.saveData) return true;
  return typeof rete?.effectiveType === "string" && /^(slow-)?2g$|^3g$/.test(rete.effectiveType);
}

// Vero solo sul client dopo l'idratazione: niente che dipenda da matchMedia o
// connection può creare un mismatch.
const nessunaSottoscrizione = () => () => {};
function useMontato(): boolean {
  return useSyncExternalStore(nessunaSottoscrizione, () => true, () => false);
}

function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

// Il tasto: bg-ink/75 e non trasparente, sta sopra il video, che può essere un
// cielo chiaro (bianco su ink/75 sopra bianco puro ≈ 9:1).
const PILL =
  "btn-press pointer-events-auto inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full border border-white/40 bg-ink/75 px-3 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

// L'etichetta sul video, coi colori di AiTag (components/AiTag.tsx): fondo ink
// all'85% con filo chiaro e testo bianco, ~11:1 anche su un fotogramma bianco;
// qui è una frase, quindi va a capo invece di stare su una riga.
const ETICHETTA =
  "pointer-events-auto max-w-[15rem] rounded-2xl bg-ink/85 px-3.5 py-1.5 text-right text-xs leading-snug text-white shadow-sm ring-1 ring-white/35 sm:max-w-[20rem] lg:max-w-[26rem] [print-color-adjust:exact]";

/** I comandi dell'hero: sulla RIGA del «← Torna» (top-24), allineati a destra
 *  della colonna della scheda (max-w-5xl, px-6). Da 640 px etichetta e tasto
 *  in fila sulla riga, la sola fascia che il blocco di testo (ancorato in
 *  fondo) non raggiunge; sotto i 640 px il tasto sulla riga e l'etichetta
 *  sotto di lui, dove l'etichetta della copertina sta quando c'è un video. */
const COMANDI =
  "absolute inset-x-0 top-24 z-10 mx-auto flex max-w-5xl flex-col-reverse items-end gap-2 px-6 sm:flex-row sm:items-start sm:justify-end";

/** Il velo del testo (punto 9): l'ink del sito (#0b1512) al 60% sul fondo, 50%
 *  a 20rem, trasparente a 32rem, sopra il velo della pagina (ink/55 → ink/10 →
 *  ink/90). Calcolato sul fotogramma bianco puro alle quote misurate a
 *  1440×900, 1280×720 e 375×667 (collaudo del 01/10): titolo ≥ 6:1 su due
 *  righe (4,4:1 su tre righe al telefono, testo grande), riga «Rif. · via»
 *  (bianco al 65%) ≥ 4,9:1, prezzo ≥ 12:1. Senza: titolo 1,9-3,7:1, riga
 *  2,3-3,3:1. */
const VELO =
  "bg-[linear-gradient(to_top,rgb(11_21_18/0.6)_0,rgb(11_21_18/0.5)_20rem,rgb(11_21_18/0)_32rem)]";

export default function SfondoVideo({
  video,
  locale,
  title,
  velo = false,
  linkAi,
  layerClassName = "",
}: {
  video: VideoAnnuncio;
  locale: string;
  /** Il nome dell'immobile, per il gruppo dei comandi («Video: …»). */
  title: string;
  /** Il velo sotto il testo dell'hero, insieme al video (punto 9). */
  velo?: boolean;
  /** La pagina che spiega l'uso dell'AI; senza, l'etichetta non ha link. */
  linkAi?: string;
  /** Classi in più sul layer (es. `par-zoom`, la parallasse della copertina). */
  layerClassName?: string;
}) {
  const S = tSfondoVideo(locale);
  const montato = useMontato();
  const stretto = useMedia("(max-width: 639px)");
  const sorgente = stretto && video.mp4Sm ? video.mp4Sm : video.mp4;

  const rootRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  // La copia in scena e quella di riserva: si scambiano a ogni giro.
  const scena = useRef<{ active: HTMLVideoElement | null; standby: HTMLVideoElement | null }>({
    active: null,
    standby: null,
  });
  const suonataRef = useRef("");

  const [spento, setSpento] = useState(false);
  // Guardie passate, load + 200 ms, fuori dal prerender.
  const [pronto, setPronto] = useState(false);
  // A 250 px dallo schermo: si montano i <video> (solo i metadati).
  const [vicino, setVicino] = useState(false);
  const [inView, setInView] = useState(false);
  // Una pagina aperta in una tab in secondo piano non fa girare niente.
  const [nascosta, setNascosta] = useState(() => typeof document !== "undefined" && document.visibilityState === "hidden");
  const [pausa, setPausa] = useState(false);
  // La sorgente che ha dichiarato `playing` almeno una volta: da lì layer,
  // tasto ed etichetta. Cambia sorgente (rotazione del telefono) = si riparte.
  const [suonata, setSuonata] = useState("");
  const avviato = pronto && vicino;

  // load + 200 ms, guardie, prerender (la pagina può essere prerenderizzata da
  // un hover su una card: un autoplay invisibile non deve partire).
  useEffect(() => {
    if (!montato) return;
    let t = 0;
    const doc = document as Document & { prerendering?: boolean };
    const via = () => setPronto(true);
    const dopoLoad = () => {
      t = window.setTimeout(() => {
        if (bloccato()) setSpento(true);
        else if (doc.prerendering) document.addEventListener("prerenderingchange", via, { once: true });
        else via();
      }, 200);
    };
    if (document.readyState === "complete") dopoLoad();
    else window.addEventListener("load", dopoLoad, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", dopoLoad);
      document.removeEventListener("prerenderingchange", via);
    };
  }, [montato]);

  // Vicino (si montano i video) e in vista (girano): il root è inset-0
  // dell'hero, quindi ne ha il rettangolo.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || spento || !pronto) return;
    const carico = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVicino(true);
      },
      { rootMargin: MARGINE_CARICO },
    );
    const vista = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting && e.intersectionRatio >= SOGLIA_VISTA),
      { threshold: [0, SOGLIA_VISTA] },
    );
    carico.observe(el);
    vista.observe(el);
    return () => {
      carico.disconnect();
      vista.disconnect();
    };
  }, [montato, spento, pronto]);

  useEffect(() => {
    const onVis = () => setNascosta(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Le due copie appena montate (o rimontate col cambio di sorgente).
  useEffect(() => {
    if (!avviato) return;
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;
    for (const v of [a, b]) {
      v.muted = true;
      v.defaultMuted = true;
    }
    a.style.opacity = "1";
    a.style.zIndex = "1";
    b.style.opacity = "0";
    b.style.zIndex = "0";
    scena.current = { active: a, standby: b };
    const onPlaying = () => {
      suonataRef.current = sorgente;
      setSuonata(sorgente);
      // Una clip più corta di due dissolvenze non ha spazio per l'incrocio:
      // gira col loop nativo (la riserva resta ferma).
      if (Number.isFinite(a.duration) && a.duration <= FADE_S * 2) a.loop = true;
      // La riserva parte da preload="none": la si carica quando la prima suona,
      // con i byte già in cache, senza contendere la banda alla copertina.
      b.preload = "auto";
      b.load();
    };
    // File assente (404) o illeggibile prima del primo fotogramma: resta la foto.
    const onError = () => {
      if (suonataRef.current !== sorgente) setSpento(true);
    };
    a.addEventListener("playing", onPlaying, { once: true });
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("error", onError);
    };
  }, [avviato, sorgente]);

  // Un solo punto decide se il loop gira: in vista, scheda del browser a
  // vista, nessuna pausa chiesta. Fuori da lì le due copie stanno ferme e il
  // rAF non gira.
  const gira = avviato && inView && !nascosta && !pausa;
  useEffect(() => {
    if (!avviato) return;
    const { active, standby } = scena.current;
    if (!active || !standby) return;
    if (!gira) {
      active.pause();
      standby.pause();
      return;
    }
    const mai = suonataRef.current !== sorgente;
    const rifiuto = (e: unknown) => {
      // NotAllowedError = autoplay negato (risparmio energetico, policy);
      // NotSupportedError = file illeggibile o assente. AbortError (una pausa
      // arrivata prima del play) non è un guasto.
      const nome = (e as { name?: string } | null)?.name;
      if (mai && (nome === "NotAllowedError" || nome === "NotSupportedError")) setSpento(true);
    };
    active.play().catch(rifiuto);
    if (Number(standby.style.opacity) > 0) standby.play().catch(() => {});
    // Il timeout guarda se `playing` è arrivato NEL FRATTEMPO (ref, non stato):
    // un video che sta già suonando non va smontato.
    const timeout = mai
      ? window.setTimeout(() => {
          if (suonataRef.current !== sorgente) setSpento(true);
        }, TIMEOUT_MS)
      : 0;

    let raf = 0;
    const tick = () => {
      const s = scena.current;
      const att = s.active;
      const ris = s.standby;
      if (att && ris) {
        const d = att.duration;
        if (Number.isFinite(d) && d > FADE_S * 2 && att.currentTime >= d - FADE_S) {
          if (ris.paused) {
            ris.style.zIndex = "2";
            att.style.zIndex = "1";
            try {
              ris.currentTime = 0;
            } catch {
              /* non ancora scorribile: si riprova al frame dopo */
            }
            ris.play().catch(() => {});
          }
          const k = att.ended ? 1 : Math.min((att.currentTime - (d - FADE_S)) / FADE_S, 1);
          ris.style.opacity = k.toFixed(3);
          if (k >= 1) {
            att.pause();
            att.style.opacity = "0";
            att.style.zIndex = "0";
            ris.style.zIndex = "1";
            scena.current = { active: ris, standby: att };
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [avviato, gira, sorgente]);

  // Video non montato (server, primo render) o spento: resta la copertina, e
  // con lei la sua etichetta (che sta in page.tsx).
  if (!montato || spento) return null;

  const primoPlay = suonata !== "" && suonata === sorgente;
  const visibile = primoPlay && !pausa;
  const etichettaAi = video.ai && visibile;
  const testoAi = video.fotoRitoccate ? S.aiLabelRitoccate : S.aiLabel;
  const VIDEO = "absolute inset-0 h-full w-full object-cover";

  const videos = avviato && (
    <>
      <video
        key={`a:${sorgente}`}
        ref={aRef}
        src={sorgente}
        className={VIDEO}
        muted
        playsInline
        disablePictureInPicture
        // Montato a 250 px dallo schermo: solo i metadati finché non suona.
        preload="metadata"
        aria-hidden
        tabIndex={-1}
      />
      <video
        key={`b:${sorgente}`}
        ref={bRef}
        src={sorgente}
        className={VIDEO}
        style={{ opacity: 0 }}
        muted
        playsInline
        disablePictureInPicture
        preload="none"
        aria-hidden
        tabIndex={-1}
      />
    </>
  );

  // `isolate`: le due copie portano uno z-index in linea (1/2, scambiato a ogni
  // giro); un contesto di impilamento proprio le tiene SOTTO il velo e il testo
  // della pagina.
  const layer = "isolate transition-opacity duration-[1200ms] ease-[var(--ease-lux)]";

  return (
    // data-video-visibile: lo legge l'etichetta di trasparenza della copertina
    // (fratello precedente nell'hero) per sparire mentre si vede il video.
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0"
      data-video-visibile={visibile ? "" : undefined}
    >
      <div className={`absolute inset-0 overflow-hidden ${layer} ${layerClassName}`} style={{ opacity: visibile ? 1 : 0 }}>
        {videos}
      </div>
      {velo && <div aria-hidden className={`absolute inset-0 ${VELO} ${layer}`} style={{ opacity: visibile ? 1 : 0 }} />}

      {/* Comandi: compaiono solo dopo il primo `playing` (prima non c'è niente
          da fermare). Etichetta d'AZIONE che cambia con lo stato, senza
          aria-pressed; sotto i 1024 px solo l'icona (il testo resta ai lettori
          di schermo), così fra 640 e 1024 px etichetta e tasto stanno sulla
          riga accanto al «← Torna». */}
      {primoPlay && (
        <div role="group" aria-label={`${S.group}: ${title}`} className={COMANDI}>
          {etichettaAi && (
            <p className={ETICHETTA}>
              {testoAi}
              {linkAi && (
                <>
                  {" · "}
                  <Link
                    href={linkAi}
                    className="font-medium text-sand underline-offset-2 hover:underline focus-visible:underline"
                  >
                    {S.aiLink} →
                  </Link>
                </>
              )}
            </p>
          )}
          <button type="button" onClick={() => setPausa((p) => !p)} className={PILL}>
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
              {pausa ? (
                <path d="M7 4.5a1 1 0 0 1 1.53-.85l11 7.5a1 1 0 0 1 0 1.7l-11 7.5A1 1 0 0 1 7 19.5v-15Z" />
              ) : (
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              )}
            </svg>
            <span className="sr-only lg:not-sr-only">{pausa ? S.resume : S.pause}</span>
          </button>
        </div>
      )}
    </div>
  );
}
