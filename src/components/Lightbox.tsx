"use client";

import { useCallback, useEffect, useState } from "react";
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
import { etichettaAi, haEtichetta, testoIn } from "@/lib/fotoAi";
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
  // dati AI. Le serie senza (e le planimetrie, che non ne hanno mai) restano
  // identiche a prima.
  const conAi = photos.some((p) => p.ai);
  const corrente = photos[i];
  const originale = corrente.ai?.originale ?? null;
  const vediOriginale = originale !== null && originaleDi === i;
  const toggleOriginale = useCallback(() => {
    if (!photos[i].ai?.originale) return;
    setOriginaleDi((x) => (x === i ? null : i));
  }, [i, photos]);

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
                  const e = etichettaAi(p.ai, locale, (k) => tAi(k));
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
          foto={corrente}
          indice={i}
          totale={photos.length}
          locale={locale}
          tAi={(k) => tAi(k)}
          vediOriginale={vediOriginale}
          onToggle={toggleOriginale}
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
// La foto sta in un riquadro che ha le SUE proporzioni (dalle misure Airtable,
// o da quelle dell'originale quando si guarda quello), così l'etichetta cade
// nell'angolo in alto a destra dell'immagine e non del riquadro vuoto attorno.
// Sotto: la didascalia (figcaption) e il bottone «Vedi l'originale».
// L'originale si carica appena la foto è aperta, nascosto sotto la pubblicata:
// il clic (o il tasto O) li scambia all'istante, senza attesa di rete.
function VistaConAi({
  foto,
  indice,
  totale,
  locale,
  tAi,
  vediOriginale,
  onToggle,
  onClickFoto,
}: {
  foto: Photo;
  indice: number;
  totale: number;
  locale: string;
  tAi: (k: string) => string;
  vediOriginale: boolean;
  onToggle: () => void;
  onClickFoto: (e: React.MouseEvent) => void;
}) {
  const ai = foto.ai ?? null;
  const originale = ai?.originale ?? null;
  const proporzione = (w: number | null | undefined, h: number | null | undefined) =>
    w && h && w > 0 && h > 0 ? w / h : null;
  const rPubblicata = proporzione(foto.width, foto.height);
  const rOriginale = originale ? proporzione(originale.larghezza, originale.altezza) : null;
  const r = (vediOriginale ? rOriginale ?? rPubblicata : rPubblicata) ?? 1.5;

  const etichetta = ai && (vediOriginale || haEtichetta(ai)) ? etichettaAi(ai, locale, tAi, vediOriginale) : null;
  const didascalia = vediOriginale
    ? { testo: tAi("originalCaption"), lang: locale }
    : testoIn(ai?.didascalia, locale);

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
    // `pt-[4.75rem]`: l'header del sito (pillola fissa, alta fino a 72 px dal
    // bordo) resta SOPRA il lightbox — il foglio della scheda è un contesto di
    // impilamento più basso — e senza questo margine copriva proprio l'angolo
    // in alto a destra della foto, cioè l'etichetta.
    <figure
      className="relative z-[1] flex max-h-full w-full max-w-6xl flex-col items-center pt-[4.75rem]"
      onClick={onClickFoto}
    >
      <div
        className="relative"
        style={{
          // Larga quanto può, ma mai più alta dello spazio che resta fra
          // l'header e didascalia + bottone.
          width: `min(92vw, 72rem, calc((100dvh - 16.75rem) * ${r}))`,
          aspectRatio: String(r),
        }}
      >
        <PhotoImg
          key={foto.url}
          src={photoSrc(foto, 2000)}
          srcSet={photoSrcSet(foto, FULL_WIDTHS)}
          sizes="92vw"
          alt={foto.alt}
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
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-150 [-webkit-user-drag:none] ${vediOriginale ? "opacity-100" : "pointer-events-none opacity-0"}`}
          />
        )}
        {etichetta && (
          <AiTag
            testo={etichetta.estesa}
            aria={etichetta.aria}
            className="absolute right-2 top-2 z-[2] sm:right-3 sm:top-3"
          />
        )}
      </div>
      {didascalia && (
        <figcaption
          lang={didascalia.lang}
          aria-live="polite"
          className="mt-3 max-h-28 max-w-3xl overflow-y-auto px-2 text-center text-sm leading-relaxed text-white/85"
        >
          {didascalia.testo}
        </figcaption>
      )}
      <div className="mt-3 flex items-center gap-4">
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
            className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              vediOriginale
                ? "bg-white text-ink ring-white"
                : "bg-white/10 text-white ring-white/40 hover:bg-white/20"
            }`}
          >
            {tAi("showOriginal")}
          </button>
        )}
        <p className="text-sm text-white/70">
          {indice + 1} / {totale}
        </p>
      </div>
    </figure>
  );
}
