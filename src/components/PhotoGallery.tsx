"use client";

import { useState, ViewTransition } from "react";
import { useTranslations } from "next-intl";
import { photoSrc, photoSrcSet } from "@/lib/photoSrc";
import { etichettaAi, haEtichetta, serieCompleta, serieHaAi } from "@/lib/fotoAi";
import PhotoImg from "./PhotoImg";
import AiTag from "./AiTag";
import type { Photo } from "@/lib/properties";
import Lightbox from "./Lightbox";

// Ladder delle miniature. Serve soprattutto al telefono: il riquadro è 50vw,
// cioè ~195 px CSS su un 390, che a DPR 2 fa 390 px reali — chiedere 600 fissi
// voleva dire scaricare metà in più su otto miniature.
const THUMB_WIDTHS = [400, 600, 800] as const;
// L'immagine grande della galleria è larga quanto lo schermo fino a 1024 px:
// senza ladder un telefono si portava a casa la versione più larga.
const HERO_WIDTHS = [600, 800, 1200, 1600] as const;

export default function PhotoGallery({
  cover,
  topPhotos,
  allPhotos,
  labels,
  morphName,
  compact = false,
}: {
  cover: Photo | null;
  topPhotos: Photo[];
  allPhotos: Photo[];
  labels: {
    viewAll: string;
    close: string;
    photosComing: string;
    grid?: string;
    // Titolo del riepilogo «Come abbiamo usato l'AI in queste foto»: se c'è, sotto
    // le miniature un link porta alla sezione #foto-ai, dove le etichette si
    // spiegano. Senza, nulla cambia.
    aiSummary?: string;
  };
  // Shared-element identity with the listing card cover (PropertyCard).
  morphName?: string;
  // The 4.0 listing page shows the cover in its cinematic hero, so the
  // gallery skips the big lead image and renders thumbnails only.
  compact?: boolean;
}) {
  // idx = foto di partenza; grid = apri sulla griglia di tutte le miniature
  // ("vedi tutte le N foto" deve far SCEGLIERE da dove partire, non imporre
  // lo scroll dalla foto 1).
  const [open, setOpen] = useState<{ idx: number; grid: boolean } | null>(null);
  // Etichetta AI (SPEC §5.1): sigla «AI» sulle miniature, forma estesa sulla
  // foto grande. Le foto senza `ai` restano esattamente come prima.
  const tAi = useTranslations("property.aiFoto");
  const tag = (p: Photo, compatta: boolean) => {
    if (!haEtichetta(p.ai)) return null;
    const e = etichettaAi(p.ai, (k) => tAi(k));
    return (
      <AiTag
        testo={compatta ? e.compatta : e.estesa}
        aria={e.aria}
        compatta={compatta}
        className={`absolute z-[2] ${compatta ? "right-1.5 top-1.5" : "right-3 top-3"}`}
      />
    );
  };
  const hero = cover ?? allPhotos[0] ?? null;
  const thumbs = topPhotos.length ? topPhotos : allPhotos;
  // Con dati AI la serie del lightbox comprende copertina e top 8 (vedi
  // serieCompleta in lib/fotoAi.ts); senza, è quella di sempre.
  const conAi = serieHaAi(hero, topPhotos, allPhotos);
  const fullSet = conAi
    ? serieCompleta(hero, topPhotos, allPhotos)
    : allPhotos.length
      ? allPhotos
      : hero
        ? [hero]
        : [];

  const openAt = (photo: Photo) => {
    let i = fullSet.findIndex((x) => x.url === photo.url);
    // La stessa foto può stare in più campi con url diverse: si ritrova per nome.
    if (i < 0 && conAi && photo.filename !== null)
      i = fullSet.findIndex((x) => x.filename === photo.filename);
    setOpen({ idx: i >= 0 ? i : 0, grid: false });
  };

  if (compact) {
    return (
      <section id="foto" className="scroll-mt-32">
        {thumbs.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {thumbs.slice(0, 8).map((p) => (
              <button
                key={p.url}
                type="button"
                onClick={() => openAt(p)}
                className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100"
              >
                <PhotoImg
                  src={photoSrc(p, 600)}
                  srcSet={photoSrcSet(p, THUMB_WIDTHS)}
                  sizes="(max-width: 640px) 50vw, 25vw"
                  alt={p.alt}
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
                {tag(p, true)}
              </button>
            ))}
          </div>
        )}
        {labels.aiSummary ? (
          // Con le etichette AI: «Vedi tutte» e, accanto, il link che le spiega.
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            {fullSet.length > 1 && (
              <button
                type="button"
                onClick={() => setOpen({ idx: 0, grid: true })}
                className="btn-press rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-brand hover:text-brand"
              >
                {labels.viewAll}
              </button>
            )}
            <a
              href="#foto-ai"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand underline-offset-2 hover:underline"
            >
              <span
                aria-hidden
                className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-ink/85 px-2 text-[11px] font-semibold leading-4 tracking-[0.06em] text-white ring-1 ring-white/35"
              >
                {tAi("glyph")}
              </span>
              <span>
                {labels.aiSummary} <span aria-hidden>→</span>
              </span>
            </a>
          </div>
        ) : (
          fullSet.length > 1 && (
            <button
              type="button"
              onClick={() => setOpen({ idx: 0, grid: true })}
              className="btn-press mt-3 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-brand hover:text-brand"
            >
              {labels.viewAll}
            </button>
          )
        )}
        {open !== null && fullSet.length > 0 && (
          <Lightbox
            photos={fullSet}
            start={open.idx}
            startInGrid={open.grid}
            gridLabel={labels.grid}
            onClose={() => setOpen(null)}
            closeLabel={labels.close}
          />
        )}
      </section>
    );
  }

  return (
    <section id="foto" className="scroll-mt-32">
      {hero ? (
        <div>
          <button
            type="button"
            onClick={() => setOpen({ idx: 0, grid: false })}
            className="group relative block aspect-video w-full overflow-hidden rounded-xl bg-neutral-100"
          >
            <ViewTransition name={morphName} share="morph">
              <PhotoImg
                src={photoSrc(hero, 1600)}
                srcSet={photoSrcSet(hero, HERO_WIDTHS)}
                sizes="(max-width: 1024px) 100vw, 1024px"
                alt={hero.alt}
                className="object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.03]"
                priority
              />
            </ViewTransition>
            {tag(hero, false)}
          </button>
          {thumbs.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {thumbs.slice(0, 8).map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => openAt(p)}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100"
                >
                  <PhotoImg
                    src={photoSrc(p, 600)}
                    srcSet={photoSrcSet(p, THUMB_WIDTHS)}
                    sizes="(max-width: 640px) 50vw, 25vw"
                    alt={p.alt}
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {tag(p, true)}
                </button>
              ))}
            </div>
          )}
          {fullSet.length > 1 && (
            <button
              type="button"
              onClick={() => setOpen({ idx: 0, grid: true })}
              className="mt-3 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-brand hover:text-brand"
            >
              {labels.viewAll}
            </button>
          )}
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-400">
          {labels.photosComing}
        </div>
      )}

      {open !== null && fullSet.length > 0 && (
        <Lightbox
          photos={fullSet}
          start={open.idx}
          startInGrid={open.grid}
          gridLabel={labels.grid}
          onClose={() => setOpen(null)}
          closeLabel={labels.close}
        />
      )}
    </section>
  );
}
