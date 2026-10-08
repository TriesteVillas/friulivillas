"use client";

import { useState } from "react";
import { photoSrc, photoSrcSet } from "@/lib/photoSrc";
import type { Photo } from "@/lib/properties";
import PhotoImg from "./PhotoImg";
import Lightbox from "./Lightbox";

// Le planimetrie stavano fuori dal proxy /foto: si serviva `photo.url`, cioè
// l'URL firmata di Airtable — che scade in poche ore mentre la pagina resta in
// cache (ISR), quindi il primo visitatore dopo ogni scadenza le vedeva rotte
// (410, audit dei siti del 08/10) — e per giunta l'originale a piena
// risoluzione dentro un riquadro 4:3 grande come mezza colonna. Dal proxy hanno
// un indirizzo stabile e la taglia giusta, come su triestevillas.com. Mai
// etichetta AI sulle planimetrie (SPEC §5.5): photoSrc senza `ai` non mette sigle.
const WIDTHS = [400, 600, 800] as const;

export default function Planimetrie({
  items,
  title,
  closeLabel,
}: {
  items: Photo[];
  title: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (items.length === 0) return null;

  return (
    <section id="planimetrie" className="mt-8 scroll-mt-32">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((p, i) => (
          <button
            key={p.url}
            type="button"
            onClick={() => setOpen(i)}
            className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200 bg-white"
          >
            <PhotoImg
              src={photoSrc(p, 800)}
              srcSet={photoSrcSet(p, WIDTHS)}
              sizes="(max-width: 640px) 100vw, 50vw"
              alt={p.alt}
              className="object-contain p-2"
            />
          </button>
        ))}
      </div>
      {open !== null && (
        <Lightbox
          photos={items}
          start={open}
          onClose={() => setOpen(null)}
          closeLabel={closeLabel}
        />
      )}
    </section>
  );
}
