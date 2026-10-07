/* eslint-disable @next/next/no-img-element */
import { Fraunces } from "next/font/google";

// I marchi del gruppo, ciascuno col SUO logo vero, per le card di /gruppo.
//
// Tutti sulla stessa lastra scura, ognuno nella versione che il proprio sito usa
// sulle superfici scure (è lì che vivono le testate di TSV, TSI, TA, LV e SV):
// così otto identità diverse stanno in una griglia sola senza che una sparisca
// sul fondo carta. Nessun logo è ridisegnato:
// - TriesteVillas: public/logo-white.svg di triestevillas-web (la testata).
// - TriesteImmobiliare: la barchetta bianca (public/brand/boat-white.png) + il
//   logotipo in Poppins, come in src/components/Logo.tsx tone="light".
// - TriesteAffitti: la chiave e il logotipo di src/components/Logo.tsx tone="light".
// - FriuliVillas: il wordmark avorio di questo repo.
// - LignanoVillas: il segno tondo e il logotipo di src/components/Logo.tsx tone="light".
// - SloveniaVillas: gli archi delle isocrone in versione «notte» e il logotipo in
//   Fraunces, da src/components/shell/Marchio.tsx di sloveniavillas.
// - SappadaVillas: public/brand/logo-testata-scuro.svg di sappadavillas (segno
//   e nome, senza la riga piccola «Plodn · by TriesteVillas»). È la forma che
//   il suo manuale (docs/logo/finale/MARCHIO.md §4) prescrive quando il segno è
//   alto 30 px: il file ha 16 unità di margine per lato su 152, quindi a 38 px
//   di altezza il segno ne misura esattamente 30 e cade sui pixel. Copiato il
//   07/10/2026.
// - TriesteBusiness: non ha un logo né un sito; si scrive il nome e basta,
//   perché inventargli un segno vorrebbe dire dargli un'identità che non ha.
//
// Decorativi (aria-hidden): il nome del marchio è nel link della card.
// Copiati il 06/10/2026 da origin/main dei rispettivi repo.

// Solo per il logotipo di SloveniaVillas; il CSS si carica solo dove il
// componente è usato (/gruppo).
const fraunces = Fraunces({ subsets: ["latin"], axes: ["opsz"], display: "swap" });

export type MarchioGruppo = "tsv" | "tsi" | "affitti" | "friuli" | "business" | "lignano" | "sappada" | "slovenia";

// Colori dai globals.css / tokens.css di ciascun sito (06/10/2026).
const TA_MENTA = "#aed8c4"; // --color-sand di triesteaffitti
const LV_SABBIA = "#d6b36a"; // --color-sand di lignanovillas
const SV = { iso15: "#f2e6cb", sand300: "#e3cda4", iso45: "#bfa274", fg: "#ede8dd", fg2: "#a7b3bb" };

const SV_ARCHI = [
  { d: "M15.80 12.31A10.41 8.35 27 0 1 11.68 28.12", w: 2.2, c: SV.iso15 },
  { d: "M20.96 7.66A20.57 15.00 27 0 1 10.21 34.92", w: 2.0, c: SV.sand300 },
  { d: "M28.39 4.20A31.94 22.02 27 0 1 6.46 41.24", w: 1.8, c: SV.iso45 },
];

function Lockup({ marchio }: { marchio: MarchioGruppo }) {
  switch (marchio) {
    case "tsv":
      return <img src="/brand/gruppo/triestevillas-white.svg" alt="" width={205} height={36} className="h-7 w-auto" />;
    case "tsi":
      return (
        <span className="inline-flex items-center gap-2.5">
          <img src="/brand/gruppo/triesteimmobiliare-barca-bianca.png" alt="" width={266} height={140} className="h-7 w-auto" />
          <span className="text-lg font-bold tracking-tight text-white">
            Trieste<span className="font-medium text-white/85">Immobiliare</span>
          </span>
        </span>
      );
    case "affitti":
      return (
        <span className="inline-flex items-center gap-2">
          <svg viewBox="0 0 120 80" className="h-7 w-auto text-white" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M28 22c-9.94 0-18 8.06-18 18s8.06 18 18 18 18-8.06 18-18-8.06-18-18-18Zm0 10a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z"
            />
            <rect x="44" y="36" width="56" height="8" rx="3" />
            <rect x="80" y="44" width="8" height="13" rx="2" />
            <rect x="94" y="44" width="8" height="13" rx="2" />
          </svg>
          <span className="text-lg font-semibold tracking-tight text-white">
            Trieste<span style={{ color: TA_MENTA }}>Affitti</span>
          </span>
        </span>
      );
    case "friuli":
      return <img src="/brand/friulivillas-wordmark-avorio.svg" alt="" width={317} height={75} className="h-9 w-auto" />;
    case "lignano":
      return (
        <span className="inline-flex items-center gap-2.5">
          <span
            className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border"
            style={{ borderColor: LV_SABBIA, color: LV_SABBIA }}
          >
            <span className="absolute h-px w-4 -rotate-12 bg-current" />
            <span className="absolute mt-2 h-px w-3 rotate-6 bg-current opacity-75" />
          </span>
          <span className="text-[1.05rem] font-semibold tracking-[-0.035em] text-white">
            Lignano<span style={{ color: LV_SABBIA }}>Villas</span>
          </span>
        </span>
      );
    case "sappada":
      return (
        <img
          src="/brand/gruppo/sappadavillas-logo-testata-scuro.svg"
          alt=""
          width={206}
          height={38}
          className="h-[38px] w-auto"
        />
      );
    case "slovenia":
      return (
        <span className="inline-flex items-center gap-2.5">
          <svg viewBox="4 1.5 40 44" className="h-8 w-[29px] shrink-0" fill="none" strokeLinecap="round">
            {SV_ARCHI.map((a) => (
              <path key={a.d} d={a.d} stroke={a.c} strokeWidth={a.w * 1.15} />
            ))}
          </svg>
          <span className="flex flex-col">
            <span
              className={`${fraunces.className} text-[21px] leading-none tracking-[-0.01em]`}
              style={{ color: SV.fg, fontVariationSettings: '"opsz" 36', fontWeight: 500 }}
            >
              SloveniaVillas
            </span>
            <span
              className="mt-1.5 font-mono text-[9px] font-medium uppercase leading-none tracking-[0.2em]"
              style={{ color: SV.fg2 }}
            >
              by TriesteVillas
            </span>
          </span>
        </span>
      );
    case "business":
      return <span className="text-lg font-semibold tracking-tight text-white/90">TriesteBusiness</span>;
  }
}

/** La lastra col logo, in testa alla card del marchio. */
export default function LastraLogo({ marchio }: { marchio: MarchioGruppo }) {
  return (
    <div
      aria-hidden
      className="-mx-6 -mt-6 mb-5 flex h-24 items-center justify-center bg-ink px-6"
    >
      <Lockup marchio={marchio} />
    </div>
  );
}
