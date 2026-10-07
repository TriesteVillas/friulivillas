"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PhotoImg from "@/components/PhotoImg";
import AiTag from "@/components/AiTag";
import Lightbox from "@/components/Lightbox";
import { etichettaAi, haEtichetta } from "@/lib/fotoAi";
import type { Photo } from "@/lib/properties";

// La galleria dei soggiorni: un mosaico, non una griglia di francobolli. Le
// orizzontali prendono due terzi della riga, le verticali un terzo, e la
// prima foto di ogni capitolo è grande. Un clic apre il lightbox del sito, con
// la trasparenza AI completa (etichetta, didascalia, «Vedi l'originale»).
//
// Le foto sono file statici (public/media/affitti/…): `thumb` è la versione da
// ~960 px, `url` quella da ~1920 px.

export default function Mosaico({
  foto,
  etichetta,
  chiudi,
  griglia,
  vediTutte,
  idAncora,
}: {
  foto: Photo[];
  /** testo sopra il mosaico, per i lettori di schermo */
  etichetta: string;
  chiudi: string;
  griglia: string;
  vediTutte: string;
  idAncora?: string;
}) {
  const tAi = useTranslations("property.aiFoto");
  const [aperta, setAperta] = useState<{ i: number; griglia: boolean } | null>(null);

  const tag = (p: Photo) => {
    if (!haEtichetta(p.ai)) return null;
    const e = etichettaAi(p.ai, (k) => tAi(k));
    return <AiTag testo={e.estesa} aria={e.aria} className="absolute right-3 top-3 z-[2]" />;
  };

  return (
    <div id={idAncora} className="scroll-mt-28">
      <ul aria-label={etichetta} className="grid grid-cols-6 gap-2 sm:gap-3" data-reveal-stagger>
        {foto.map((p, i) => {
          const verticale = (p.height ?? 0) > (p.width ?? 0);
          // Il ritmo: ogni sei foto una grande a tutta riga.
          const grande = !verticale && i % 6 === 0;
          const span = grande ? "col-span-6" : verticale ? "col-span-3 sm:col-span-2" : "col-span-6 sm:col-span-4";
          const ar = grande ? "aspect-[16/9] sm:aspect-[21/9]" : verticale ? "aspect-[3/4]" : "aspect-[16/10]";
          return (
            <li key={p.url} className={span}>
              <button
                type="button"
                onClick={() => setAperta({ i, griglia: false })}
                className={`group relative block w-full overflow-hidden rounded-xl bg-neutral-200 ${ar}`}
              >
                <PhotoImg
                  src={p.thumb}
                  srcSet={`${p.thumb} 960w, ${p.url} 1920w`}
                  sizes={grande ? "100vw" : verticale ? "(max-width: 640px) 50vw, 33vw" : "(max-width: 640px) 100vw, 66vw"}
                  alt={p.alt}
                  className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]"
                />
                {tag(p)}
              </button>
            </li>
          );
        })}
      </ul>
      {foto.length > 1 && (
        <button
          type="button"
          onClick={() => setAperta({ i: 0, griglia: true })}
          className="btn-press mt-5 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-800 hover:border-brand hover:text-brand"
        >
          {vediTutte}
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
