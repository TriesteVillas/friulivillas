"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PhotoImg from "@/components/PhotoImg";
import AiTag from "@/components/AiTag";
import Lightbox from "@/components/Lightbox";
import { etichettaAi, haEtichetta } from "@/lib/fotoAi";
import type { Photo } from "@/lib/properties";

// La galleria dei soggiorni: un mosaico a colonne (ogni foto col suo formato,
// orizzontali e verticali insieme, senza buchi), con le prime `quante` foto in
// pagina e tutte le altre dal tasto «Vedi tutte», che apre la griglia del
// lightbox. Il lightbox è quello del sito, con la trasparenza AI completa
// (etichetta, didascalia, «Vedi l'originale»).
//
// Le foto sono file statici (public/media/affitti/…): `thumb` è la versione da
// ~960 px, `url` quella da ~1920 px.

export default function Mosaico({
  foto,
  anteprima,
  etichetta,
  chiudi,
  griglia,
  vediTutte,
  quante = 12,
  idAncora,
}: {
  /** tutte le foto, nell'ordine del registro (è l'ordine del lightbox e dei numeri della nota AI) */
  foto: Photo[];
  /** l'ordine in cui mostrarle in pagina (le prime `quante`); di default quello di `foto` */
  anteprima?: Photo[];
  /** testo sopra il mosaico, per i lettori di schermo */
  etichetta: string;
  chiudi: string;
  griglia: string;
  vediTutte: string;
  quante?: number;
  idAncora?: string;
}) {
  const tAi = useTranslations("property.aiFoto");
  const [aperta, setAperta] = useState<{ i: number; griglia: boolean } | null>(null);

  const tag = (p: Photo) => {
    if (!haEtichetta(p.ai)) return null;
    const e = etichettaAi(p.ai, (k) => tAi(k));
    return <AiTag testo={e.estesa} aria={e.aria} className="absolute right-3 top-3 z-[2]" />;
  };

  const mostrate = (anteprima ?? foto).slice(0, quante);
  const indice = (p: Photo) => Math.max(0, foto.findIndex((x) => x.url === p.url));

  return (
    <div id={idAncora} className="scroll-mt-28">
      <ul aria-label={etichetta} className="columns-2 gap-2 sm:gap-3 lg:columns-3 [&>li]:mb-2 sm:[&>li]:mb-3">
        {mostrate.map((p) => (
          <li key={p.url} className="break-inside-avoid" data-reveal>
            <button
              type="button"
              onClick={() => setAperta({ i: indice(p), griglia: false })}
              className="group relative block w-full overflow-hidden rounded-xl bg-neutral-200"
              style={{ aspectRatio: `${p.width ?? 3} / ${p.height ?? 2}` }}
            >
              <PhotoImg
                src={p.thumb}
                srcSet={`${p.thumb} 960w, ${p.url} 1920w`}
                sizes="(max-width: 1024px) 50vw, 33vw"
                alt={p.alt}
                className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]"
              />
              {tag(p)}
            </button>
          </li>
        ))}
      </ul>
      {foto.length > 1 && (
        <button
          type="button"
          onClick={() => setAperta({ i: 0, griglia: true })}
          className="btn-press mt-4 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-800 hover:border-brand hover:text-brand"
        >
          {vediTutte} · {foto.length}
        </button>
      )}
      {aperta && (
        <Lightbox
          photos={foto}
          start={aperta.i}
          startInGrid={aperta.griglia}
          gridLabel={griglia}
          closeLabel={chiudi}
          onClose={() => setAperta(null)}
        />
      )}
    </div>
  );
}
