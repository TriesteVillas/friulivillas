"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import PhotoImg from "@/components/PhotoImg";
import AiTag from "@/components/AiTag";
import Scene from "@/components/motion/Scene";
import { etichettaAi, haEtichetta } from "@/lib/fotoAi";
import type { Photo } from "@/lib/properties";

// La banda che porta all'altra casa (il «backing incrociato» del mandato): la
// foto dell'altra casa a tutta larghezza, in leggera parallasse, e una frase
// vera su cosa le lega.

export default function Sorella({
  href,
  foto,
  eyebrow,
  titolo,
  testo,
  vai,
}: {
  href: string;
  foto: Photo | null;
  eyebrow: string;
  titolo: string;
  testo: string;
  vai: string;
}) {
  const tAi = useTranslations("property.aiFoto");
  const tag = (p: Photo) => {
    if (!haEtichetta(p.ai)) return null;
    const e = etichettaAi(p.ai, (k) => tAi(k));
    return <AiTag testo={e.estesa} aria={e.aria} className="absolute right-4 top-4 z-[2]" />;
  };
  return (
    <Scene as="section" className="relative isolate overflow-hidden bg-ink text-white">
      {foto && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <PhotoImg
            src={foto.url}
            srcSet={`${foto.thumb} 960w, ${foto.url} 1920w`}
            sizes="100vw"
            alt={foto.alt}
            className="object-cover [transform:translateY(calc((var(--p)-0.5)*-6%))_scale(1.12)]"
          />
          {tag(foto)}
        </div>
      )}
      <div aria-hidden className="absolute inset-0 -z-[5] bg-[linear-gradient(90deg,rgba(11,21,18,0.85)_0%,rgba(11,21,18,0.45)_55%,rgba(11,21,18,0.15)_100%)]" />
      <div className="mx-auto flex min-h-[70svh] max-w-6xl flex-col justify-center px-6 py-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sand">{eyebrow}</p>
        <h2 className="mt-3 font-[family-name:var(--font-affitti-display)] text-[clamp(2.6rem,6vw,5rem)] leading-[0.95]">{titolo}</h2>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/85">{testo}</p>
        <Link href={href} className="btn-press mt-8 inline-flex h-12 w-fit items-center rounded-full bg-sand px-6 text-sm font-semibold text-ink hover:bg-white">
          {vai}
        </Link>
      </div>
    </Scene>
  );
}
