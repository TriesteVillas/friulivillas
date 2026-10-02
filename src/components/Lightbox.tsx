"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { photoSrc, photoSrcSet } from "@/lib/photoSrc";
import { useSwipe } from "@/lib/useSwipe";
import PhotoImg from "./PhotoImg";

// Vedi PhotoGallery per il perché delle ladder. Qui la foto grande occupa 92vw:
// senza srcSet un telefono scaricava la versione da 2000 px per un riquadro da
// 360, cioè cinque volte i pixel che riesce a mostrare.
const GRID_WIDTHS = [400, 600, 800] as const;
const FULL_WIDTHS = [800, 1200, 1600, 2000] as const;
import { useLocale, useTranslations } from "next-intl";
import type { Photo } from "@/lib/properties";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { didascaliaFoto, etichettaAi, haEtichetta } from "@/lib/fotoAi";
import AiTag from "./AiTag";

export default function Lightbox({
  photos,
  start,
  onClose,
  closeLabel,
  startInGrid = false,
  gridLabel,
}: {
  photos: Photo[];
  start: number;
  onClose: () => void;
  closeLabel: string;
  // "Vedi tutte le N foto" apre qui: una griglia di tutte le miniature, così
  // il visitatore SCEGLIE da dove partire invece di scrollare dalla foto 1.
  startInGrid?: boolean;
  gridLabel?: string;
}) {
  const t = useTranslations("ui");
  const tAi = useTranslations("property.aiFoto");
  const locale = useLocale();
  const panelRef = useFocusTrap<HTMLDivElement>(true);
  const [i, setI] = useState(start);
  const [grid, setGrid] = useState(startInGrid);
  // «Vedi l'originale»: vale per la foto corrente, e ogni cambio di foto riparte
  // dalla versione pubblicata. Si ricorda l'INDICE a cui il visitatore l'ha
  // chiesto (un cambio di foto lo rende falso da sé) e lo si azzera a ogni passo.
  const [originaleDi, setOriginaleDi] = useState<number | null>(null);
  const step = useCallback(
    (d: number) => {
      setOriginaleDi(null);
      setI((x) => (x + d + photos.length) % photos.length);
    },
    [photos.length],
  );
  // Trasparenza AI (SPEC §5.2): la vista singola cambia impianto — foto,
  // etichetta, didascalia, bottone — SOLO se almeno una foto della serie ha
  // qualcosa da MOSTRARE: un'etichetta (sostanza, §11.1) o un originale da
  // confrontare. Una serie di sole foto ritoccate nella luce senza originali
  // (dal 02/10 senza etichetta né didascalia) torna al lightbox di sempre, come
  // le serie senza dati e le planimetrie.
  const conAi = photos.some((p) => Boolean(p.ai?.originale) || haEtichetta(p.ai));
  // Originali che la vetrina non serve più (ritirati: 404): il bottone sparisce
  // invece di mostrare un riquadro vuoto con l'etichetta «Originale».
  const [rotti, setRotti] = useState<ReadonlySet<string>>(() => new Set());
  const segnaRotto = useCallback((url: string) => {
    setRotti((r) => (r.has(url) ? r : new Set(r).add(url)));
  }, []);
  const corrente = photos[i];
  const originaleDichiarato = corrente.ai?.originale ?? null;
  const originale = originaleDichiarato && !rotti.has(originaleDichiarato.m) ? originaleDichiarato : null;
  const vediOriginale = originale !== null && originaleDi === i;
  const toggleOriginale = useCallback(() => {
    const o = photos[i].ai?.originale;
    if (!o || rotti.has(o.m)) return;
    setOriginaleDi((x) => (x === i ? null : i));
  }, [i, photos, rotti]);

  // Con la trasparenza AI la pillola dell'header del sito si nasconde finché il
  // lightbox è aperto (globals.css, html[data-lightbox-open]): il foglio della
  // scheda è un contesto d'impilamento più basso dell'header, che altrimenti
  // resta SOPRA il lightbox e copre l'angolo in alto a destra della foto —
  // cioè proprio l'etichetta. Senza dati AI il lightbox resta com'era.
  useEffect(() => {
    if (!conAi) return;
    const h = document.documentElement;
    h.setAttribute("data-lightbox-open", "");
    return () => h.removeAttribute("data-lightbox-open");
  }, [conAi]);

  // Trascinamento col dito: sul telefono è il gesto naturale, e le frecce sono
  // comunque lì per chi le cerca. Gli handler stanno sull'intero pannello, non
  // solo sulla foto: con object-contain una foto orizzontale su uno schermo
  // verticale occupa una fascia sottile al centro, e chiedere di partire da lì
  // vorrebbe dire farlo fallire quasi sempre.
  const swipe = useSwipe((d) => step(d));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      // Tasto O: «Vedi l'originale» (SPEC §5.2). Solo nella vista singola e
      // senza modificatori, per non rubare Cmd/Ctrl+O al browser.
      else if (
        (e.key === "o" || e.key === "O") &&
        !grid &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      )
        toggleOriginale();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step, grid, toggleOriginale]);

  // Chi apre il lightbox quasi sempre preme subito la freccia. Senza precarico
  // ogni passo è una richiesta che parte da zero — e la prima volta che una foto
  // viene chiesta il proxy deve ricodificarla, quindi si aspetta. Le due
  // adiacenti si scaricano mentre si guarda la corrente: al passo successivo
  // sono già nella cache del browser. Solo due, non tutte: una scheda con
  // quaranta foto non deve tirarne giù quaranta perché una è stata aperta.
  useEffect(() => {
    if (grid || photos.length < 2) return;
    for (const d of [1, -1]) {
      const p = photos[(i + d + photos.length) % photos.length];
      const img = new window.Image();
      // srcset e sizes vanno impostati come sul tag renderizzato, altrimenti il
      // browser sceglie una larghezza diversa e il precarico non serve a nulla.
      const set = photoSrcSet(p, FULL_WIDTHS);
      if (set) {
        img.sizes = "92vw";
        img.srcset = set;
      }
      img.src = photoSrc(p, 2000);
    }
  }, [i, grid, photos]);

  if (grid) {
    return (
      <div
        ref={panelRef}
        tabIndex={-1}
        className="lightbox-enter fixed inset-0 z-50 overflow-y-auto bg-black/95 outline-none backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-black/80 px-4 py-3 backdrop-blur sm:px-6">
          <p className="text-sm text-white/70">
            {gridLabel ?? ""} {gridLabel ? "· " : ""}
            {photos.length}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
          >
            ×
          </button>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 p-4 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
          {photos.map((p, idx) => (
            <button
              key={p.url}
              type="button"
              onClick={() => {
                setOriginaleDi(null);
                setI(idx);
                setGrid(false);
              }}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-900"
            >
              <PhotoImg
                src={photoSrc(p, 600)}
                srcSet={photoSrcSet(p, GRID_WIDTHS)}
                sizes="(max-width: 640px) 50vw, 25vw"
                alt={p.alt}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                // Le prime dodici riempiono già la finestra: lazy le farebbe
                // arrivare a scatti mentre si scorre. Niente fetchPriority alto,
                // però: darlo a dodici immagini insieme non dà priorità a nessuna.
                loading={idx < 12 ? "eager" : "lazy"}
              />
              <span className="absolute bottom-1.5 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white/85">
                {idx + 1}
              </span>
              {haEtichetta(p.ai) &&
                (() => {
                  const e = etichettaAi(p.ai, (k) => tAi(k));
                  return (
                    <AiTag
                      testo={e.compatta}
                      aria={e.aria}
                      compatta
                      className="absolute right-1.5 top-1.5 z-[2]"
                    />
                  );
                })()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className="lightbox-enter fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 outline-none backdrop-blur-sm"
      // Uno swipe che finisce sullo sfondo non deve chiudere la galleria.
      onClick={() => {
        if (swipe.eraUnTrascinamento()) return;
        onClose();
      }}
      {...swipe.handlers}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
      >
        ×
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setGrid(true);
        }}
        aria-label={gridLabel ?? "Grid"}
        title={gridLabel}
        className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label={t("prev")}
            className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition-colors hover:bg-white/20"
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label={t("next")}
            className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition-colors hover:bg-white/20"
          >
            <span aria-hidden>›</span>
          </button>
        </>
      )}
      {conAi ? (
        <VistaConAi
          // Una foto nuova riparte da capo: didascalia chiusa, misure rifatte.
          key={corrente.url}
          foto={corrente}
          originale={originale}
          indice={i}
          totale={photos.length}
          locale={locale}
          tAi={(k) => tAi(k)}
          vediOriginale={vediOriginale}
          onToggle={toggleOriginale}
          onOriginaleRotto={segnaRotto}
          onClickFoto={(e) => {
            swipe.eraUnTrascinamento();
            e.stopPropagation();
          }}
        />
      ) : (
        <>
          <div
            className="relative h-[85vh] w-[92vw] max-w-6xl"
            onClick={(e) => {
              // Qui il click si ferma comunque (toccare la foto non chiude), ma il
              // flag va consumato lo stesso: altrimenti uno swipe finito sulla foto
              // lo lascerebbe alzato e si mangerebbe il click successivo.
              swipe.eraUnTrascinamento();
              e.stopPropagation();
            }}
          >
            <PhotoImg
              key={photos[i].url}
              src={photoSrc(photos[i], 2000)}
              srcSet={photoSrcSet(photos[i], FULL_WIDTHS)}
              sizes="92vw"
              alt={photos[i].alt}
              className="lightbox-photo object-contain"
              priority
            />
          </div>
          <p className="absolute bottom-4 text-sm text-white/70">
            {i + 1} / {photos.length}
          </p>
        </>
      )}
    </div>
  );
}

// ---- Vista singola con la trasparenza AI (SPEC §5.2) --------------------------
//
// Tre righe fisse, dall'alto: la foto, la didascalia, il bottone con il
// contatore. La riga della foto prende tutto lo spazio che resta ed è un
// contenitore (`container-type: size`): il riquadro della foto ha le SUE
// proporzioni (misure Airtable) e la massima misura che ci sta — `min(100cqw,
// 100cqh × r)` — così l'etichetta cade nell'angolo in alto a destra
// dell'immagine e non del riquadro vuoto attorno.
//
// Stabile sotto il dito (review di design del 01/10): la cornice NON cambia
// misura quando si passa all'originale (l'originale si adatta dentro, con
// object-contain), e la didascalia ha un'altezza riservata — tre righe sul
// telefono, due da 640 px in su, con «Leggi tutto» se il testo è più lungo —
// quindi il bottone non si sposta né fra pubblicata e originale né da una foto
// all'altra.
//
// `pt-12`: la × e il bottone della griglia stanno in alto, a 16–60 px dal
// bordo; la foto parte sotto, così l'etichetta non finisce mai sotto la ×.
// Da 1280 px di larghezza il margine non serve: la colonna (max-w-6xl, 1152 px)
// finisce prima della × (bordo destro a V/2 + 576 ≤ V − 60 per V ≥ 1272), e la
// foto torna alta quasi quanto sul lightbox di sempre (767 contro 765 px a
// 1440×900). Sui telefoni in orizzontale (altezza ≤ 500 px) la foto è limitata
// dall'altezza, sta al centro e non arriva agli angoli: anche lì il margine si
// toglie, e la didascalia scende a una riga.
//
// L'originale si carica appena la foto è aperta, nascosto sotto la pubblicata:
// il clic (o il tasto O) li scambia all'istante, senza attesa di rete.
function VistaConAi({
  foto,
  originale,
  indice,
  totale,
  locale,
  tAi,
  vediOriginale,
  onToggle,
  onOriginaleRotto,
  onClickFoto,
}: {
  foto: Photo;
  /** l'originale da mostrare, già tolto se la vetrina non lo serve più */
  originale: NonNullable<Photo["ai"]>["originale"];
  indice: number;
  totale: number;
  locale: string;
  tAi: (k: string) => string;
  vediOriginale: boolean;
  onToggle: () => void;
  onOriginaleRotto: (url: string) => void;
  onClickFoto: (e: React.MouseEvent) => void;
}) {
  const ai = foto.ai ?? null;
  // «Leggi tutto»: la didascalia lunga si apre a richiesta (vedi Didascalia).
  const [aperta, setAperta] = useState(false);
  const [tagliata, setTagliata] = useState(false);
  const proporzione = (w: number | null | undefined, h: number | null | undefined) =>
    w && h && w > 0 && h > 0 ? w / h : null;
  // Una cornice sola per pubblicata e originale: se cambiasse misura, il
  // bottone premuto scapperebbe da sotto il dito.
  const r = proporzione(foto.width, foto.height) ?? proporzione(originale?.larghezza, originale?.altezza) ?? 1.5;
  // L'originale può avere proporzioni diverse (la versione AI è spesso
  // ritagliata): dentro la cornice sta con object-contain, con due bande. La
  // sua etichetta «Originale» va nell'angolo dell'IMMAGINE, non della cornice:
  // se ne conosce la proporzione (dal CRM, o misurata al caricamento) e la si
  // sposta di quanto è larga la banda.
  const [misuraOriginale, setMisuraOriginale] = useState<number | null>(null);
  const rOriginale = proporzione(originale?.larghezza, originale?.altezza) ?? misuraOriginale;
  let posizioneOriginale: React.CSSProperties | undefined;
  if (vediOriginale && rOriginale) {
    if (rOriginale > r) posizioneOriginale = { top: `${((1 - r / rOriginale) / 2) * 100}%` };
    else if (rOriginale < r) posizioneOriginale = { right: `${((1 - rOriginale / r) / 2) * 100}%` };
  }

  const etichetta = ai && (vediOriginale || haEtichetta(ai)) ? etichettaAi(ai, tAi, vediOriginale) : null;
  // La didascalia: quella del CRM nella lingua del visitatore; sull'originale
  // quella fissa dell'originale; sulla sola sigla «AI» senza didascalia, il suo
  // significato in chiaro — l'aria-label non si vede, e sul telefono neanche il
  // tooltip. Mai sullo stile (`ai_luce`, `tecnico`: SPEC §11.1): la regola è
  // didascaliaFoto() di lib/fotoAi.ts. «Vedi l'originale» resta se c'è.
  const didascalia = vediOriginale
    ? { testo: tAi("originalCaption"), lang: locale }
    : didascaliaFoto(ai, locale, tAi("genericCaption"));

  // srcset dell'originale: `m` ha il lato lungo a 1600, `xl` a 2560 (SPEC §3).
  let srcSetOriginale: string | undefined;
  if (originale) {
    const w = originale.larghezza;
    const h = originale.altezza;
    const lungo = w && h ? Math.max(w, h) : null;
    const wXl = w && lungo ? Math.round((w * Math.min(lungo, 2560)) / lungo) : 2560;
    const wM = w && lungo ? Math.round((w * Math.min(lungo, 1600)) / lungo) : 1600;
    srcSetOriginale = wM < wXl ? `${originale.m} ${wM}w, ${originale.xl} ${wXl}w` : `${originale.xl} ${wXl}w`;
  }

  return (
    <figure
      className="relative z-[1] grid h-full w-full max-w-6xl grid-rows-[minmax(0,1fr)_auto_auto] justify-items-center pt-12 min-[1280px]:pt-0 [@media(max-height:500px)]:pt-0"
      onClick={onClickFoto}
    >
      <div className="flex h-full min-h-0 w-full items-center justify-center [container-type:size]">
        <div
          className="relative"
          style={{ width: `min(100cqw, calc(100cqh * ${r}))`, aspectRatio: String(r) }}
        >
          <PhotoImg
            key={foto.url}
            src={photoSrc(foto, 2000)}
            srcSet={photoSrcSet(foto, FULL_WIDTHS)}
            sizes="92vw"
            alt={foto.alt}
            aria-hidden={vediOriginale}
            className={`lightbox-photo object-contain transition-opacity duration-150 ${vediOriginale ? "opacity-0" : "opacity-100"}`}
            priority
          />
          {originale && (
            // eslint-disable-next-line @next/next/no-img-element -- l'originale arriva dalla vetrina del CRM (non immutabile), non dal proxy /foto: vedi SPEC §9.1.
            <img
              key={originale.xl}
              src={originale.m}
              srcSet={srcSetOriginale}
              sizes="92vw"
              alt={`${foto.alt} — ${tAi("tag.originale")}`}
              loading="eager"
              decoding="async"
              draggable={false}
              aria-hidden={!vediOriginale}
              onError={() => onOriginaleRotto(originale.m)}
              onLoad={(e) => {
                const im = e.currentTarget;
                if (im.naturalWidth > 0 && im.naturalHeight > 0) setMisuraOriginale(im.naturalWidth / im.naturalHeight);
              }}
              className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-150 [-webkit-user-drag:none] ${vediOriginale ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />
          )}
          {etichetta && (
            // Il riquadro dell'immagine davvero mostrata (la cornice, o la parte
            // della cornice occupata dall'originale): l'etichetta sta nel suo
            // angolo in alto a destra.
            <div className="pointer-events-none absolute inset-0 z-[2]" style={posizioneOriginale}>
              <AiTag
                testo={etichetta.estesa}
                aria={etichetta.aria}
                variante={vediOriginale ? "originale" : "ai"}
                className="absolute right-2 top-2 sm:right-3 sm:top-3"
              />
            </div>
          )}
        </div>
      </div>
      <Didascalia
        testo={didascalia?.testo ?? null}
        lang={didascalia?.lang ?? locale}
        aperta={aperta}
        onTagliata={setTagliata}
      />
      {/* La riga dei comandi c'è sempre, sempre alta quanto il bottone (anche
          sulle foto che non l'hanno) e sempre allo stesso posto: anche «Leggi
          tutto» sta qui, non sotto la didascalia, dove comparendo su una foto
          e non sull'altra avrebbe spostato il bottone. */}
      <div className="mt-2 flex min-h-11 flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:min-h-9 [@media(max-height:500px)]:mt-1">
        {originale && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-pressed={vediOriginale}
            aria-keyshortcuts="O"
            title={`${tAi("showOriginal")} (O)`}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:min-h-0 ${
              vediOriginale
                ? "bg-white text-ink ring-white"
                : "bg-white/10 text-white ring-white/40 hover:bg-white/20"
            }`}
          >
            {vediOriginale ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <rect x="3.5" y="3.5" width="12" height="12" rx="1.5" />
                <rect x="8.5" y="8.5" width="12" height="12" rx="1.5" />
              </svg>
            )}
            {tAi("showOriginal")}
            <kbd
              aria-hidden="true"
              className={`ml-0.5 hidden rounded border px-1 font-sans text-[10px] leading-4 [@media(pointer:fine)]:inline ${
                vediOriginale ? "border-ink/25 text-ink/60" : "border-white/30 text-white/60"
              }`}
            >
              O
            </kbd>
          </button>
        )}
        {didascalia && (tagliata || aperta) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAperta((x) => !x);
            }}
            aria-expanded={aperta}
            className="min-h-11 text-sm font-medium text-white underline underline-offset-2 hover:text-white/80 sm:min-h-0"
          >
            {aperta ? tAi("readLess") : tAi("readMore")}
          </button>
        )}
        <p className="text-sm text-white/70">
          {indice + 1} / {totale}
        </p>
      </div>
    </figure>
  );
}

// La didascalia ad altezza riservata: tre righe sul telefono, due da 640 px in
// su, una sui telefoni in orizzontale. Se il testo non ci sta, «Leggi tutto»
// (nella riga dei comandi) la apre, e solo allora la foto cede spazio: prima
// `max-h-28 overflow-y-auto` tagliava senza avviso le ultime righe proprio
// delle simulazioni, dove la SPEC §7.1 vuole la spiegazione completa, dentro un
// pannello che rubava i trascinamenti del dito.
function Didascalia({
  testo,
  lang,
  aperta,
  onTagliata,
}: {
  testo: string | null;
  lang: string;
  aperta: boolean;
  onTagliata: (x: boolean) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || aperta) return;
    const misura = () => onTagliata(el.scrollHeight > el.clientHeight + 1);
    misura();
    const ro = new ResizeObserver(misura);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aperta, testo, onTagliata]);

  const riserva = "min-h-[3lh] sm:min-h-[2lh] [@media(max-height:500px)]:min-h-[1lh]";
  const righe = aperta ? "" : "line-clamp-3 sm:line-clamp-2 [@media(max-height:500px)]:line-clamp-1";
  return (
    <div className="mt-3 flex w-full max-w-3xl justify-center px-2 [@media(max-height:500px)]:mt-1">
      {testo ? (
        <figcaption
          ref={ref}
          lang={lang}
          aria-live="polite"
          className={`text-balance text-center text-sm leading-relaxed text-white/85 ${riserva} ${righe}`}
        >
          {testo}
        </figcaption>
      ) : (
        <div aria-hidden className={`text-sm leading-relaxed ${riserva}`} />
      )}
    </div>
  );
}
