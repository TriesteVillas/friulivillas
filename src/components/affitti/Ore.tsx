"use client";

import { useEffect, useState } from "react";
import Scene from "@/components/motion/Scene";
import PhotoImg from "@/components/PhotoImg";
import AiTag from "@/components/AiTag";
import { useTranslations } from "next-intl";
import { etichettaAi, haEtichetta } from "@/lib/fotoAi";
import type { Photo } from "@/lib/properties";
import { albaTramonto, oraRoma } from "@/lib/affitti/sole";

// «Un giorno lassù»: la stessa casa in tre luci, una sopra l'altra, che si
// scambiano mentre si scorre (la scena resta ferma, --p va da 0 a 1). Il
// giorno e la sera sono fotografie vere; il tramonto è una simulazione e lo
// dice la sua etichetta. Le ore accanto sono quelle di OGGI sopra la casa
// (alba e tramonto calcolati nel browser), così la sezione racconta la
// giornata che c'è adesso.

export default function Ore({
  giorno,
  oro,
  notte,
  coord,
  locale,
  testi,
}: {
  giorno: Photo;
  oro: Photo | null;
  notte: Photo;
  coord: { lat: number; lon: number };
  locale: string;
  testi: { eyebrow: string; titolo: string; voci: { giorno: string; oro: string; notte: string }; nota: string };
}) {
  const tAi = useTranslations("property.aiFoto");
  const [ore, setOre] = useState<{ giorno: string; oro: string; notte: string } | null>(null);

  useEffect(() => {
    const { tramonto } = albaTramonto(new Date(), coord.lat, coord.lon);
    if (!tramonto) return;
    const meno = (min: number) => new Date(tramonto.getTime() - min * 60_000);
    const piu = (min: number) => new Date(tramonto.getTime() + min * 60_000);
    // Le tre ore: metà pomeriggio, mezz'ora prima del tramonto, un'ora dopo.
    setOre({ giorno: oraRoma(meno(300), locale), oro: oraRoma(meno(30), locale), notte: oraRoma(piu(60), locale) });
  }, [coord.lat, coord.lon, locale]);

  // L'etichetta solo dove l'AI ha cambiato la sostanza (la simulazione del tramonto).
  const tag = (p: Photo) => {
    if (!haEtichetta(p.ai)) return null;
    const e = etichettaAi(p.ai, (k) => tAi(k));
    return <AiTag testo={e.estesa} aria={e.aria} className="absolute right-4 top-24 z-[2] sm:right-6" />;
  };

  const strato = (p: Photo, stile: React.CSSProperties) => (
    <div className="absolute inset-0" style={stile}>
      <PhotoImg src={p.url} srcSet={`${p.thumb} 960w, ${p.url} 1920w`} sizes="100vw" alt={p.alt} className="object-cover" />
      {tag(p)}
    </div>
  );

  const voci: Array<{ chiave: "giorno" | "oro" | "notte"; da: number; a: number }> = [
    { chiave: "giorno", da: 0, a: 0.36 },
    { chiave: "oro", da: 0.36, a: 0.68 },
    { chiave: "notte", da: 0.68, a: 1.01 },
  ];

  return (
    <Scene as="section" mode="pin" className="relative h-[260vh] bg-ink">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {strato(giorno, {})}
        {oro && strato(oro, { opacity: "clamp(0, calc((var(--p) - 0.3) * 6), 1)" })}
        {strato(notte, { opacity: "clamp(0, calc((var(--p) - 0.62) * 6), 1)" })}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(11,21,18,0.78)_0%,rgba(11,21,18,0.35)_45%,rgba(11,21,18,0)_75%)]"
        />
        <div className="relative z-[2] mx-auto flex h-full max-w-6xl flex-col justify-center px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sand">{testi.eyebrow}</p>
          <h2 className="mt-3 max-w-md font-[family-name:var(--font-affitti-display)] text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.95] text-white">
            {testi.titolo}
          </h2>
          <ol className="mt-10 max-w-sm space-y-6">
            {voci
              .filter((v) => v.chiave !== "oro" || oro)
              .map((v) => (
                <li
                  key={v.chiave}
                  className="flex gap-4 text-white"
                  style={{
                    opacity: `clamp(0.32, calc(1 - max(${v.da} - var(--p), var(--p) - ${v.a}) * 8), 1)`,
                  }}
                >
                  <span className="w-14 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-sand">{ore ? ore[v.chiave] : ""}</span>
                  <span className="text-lg leading-snug">{testi.voci[v.chiave]}</span>
                </li>
              ))}
          </ol>
          <p className="mt-10 max-w-sm text-[11px] leading-snug text-white/70">{testi.nota}</p>
        </div>
      </div>
    </Scene>
  );
}
