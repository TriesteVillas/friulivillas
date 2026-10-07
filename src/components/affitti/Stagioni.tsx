"use client";

import { useEffect, useState } from "react";
import { useProgramma } from "./Programma";

// «Cosa fare là», per stagione. Ogni voce è un luogo o un'attività verificati
// nel dossier del territorio, con i minuti d'auto misurati dalla casa. Il tasto
// «+» la mette nel programma del visitatore, che parte col preventivo.
// La stagione aperta all'inizio è quella di OGGI a Trieste (calcolata nel
// browser: la pagina è statica).

export type Stagione = "primavera" | "estate" | "autunno" | "inverno";

export type VoceStagione = {
  id: string;
  titolo: string;
  testo: string;
  stagioni: Stagione[];
  minuti: number | null;
};

const ORDINE: Stagione[] = ["primavera", "estate", "autunno", "inverno"];

function stagioneDiOggi(): Stagione {
  const m = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", month: "numeric" }).format(new Date()));
  if (m >= 3 && m <= 5) return "primavera";
  if (m >= 6 && m <= 8) return "estate";
  if (m >= 9 && m <= 11) return "autunno";
  return "inverno";
}

export default function Stagioni({
  voci,
  nomi,
  testi,
}: {
  voci: VoceStagione[];
  nomi: Record<Stagione, string>;
  testi: {
    aggiungi: string;
    aggiunta: string;
    minuti: string; // «{n} min»
    programma: string; // «Il tuo programma: {n}»
    vaiAlModulo: string;
    scegli: string;
  };
}) {
  const [s, setS] = useState<Stagione>("estate");
  const { scelte, cambia } = useProgramma();
  useEffect(() => setS(stagioneDiOggi()), []);

  const visibili = voci.filter((v) => v.stagioni.includes(s));

  return (
    <div>
      <div role="tablist" aria-label={testi.scegli} className="flex flex-wrap gap-2">
        {ORDINE.map((x) => (
          <button
            key={x}
            role="tab"
            type="button"
            aria-selected={s === x}
            onClick={() => setS(x)}
            className={`h-10 rounded-full px-5 text-sm font-semibold transition-colors ${
              s === x ? "bg-brand-dark text-white" : "border border-neutral-300 text-neutral-800 hover:border-brand"
            }`}
          >
            {nomi[x]}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="tabpanel">
        {visibili.map((v) => {
          const dentro = scelte.includes(v.id);
          return (
            <li key={v.id} className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-base font-semibold text-ink">{v.titolo}</h3>
                {v.minuti !== null && (
                  <span className="shrink-0 text-xs font-medium tabular-nums text-neutral-600">
                    {testi.minuti.replace("{n}", String(v.minuti))}
                  </span>
                )}
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-700">{v.testo}</p>
              <button
                type="button"
                aria-pressed={dentro}
                onClick={() => cambia(v.id)}
                className={`mt-4 inline-flex h-9 items-center self-start rounded-full px-4 text-xs font-semibold transition-colors ${
                  dentro ? "bg-sand text-ink" : "border border-neutral-300 text-neutral-800 hover:border-brand hover:text-brand"
                }`}
              >
                {dentro ? `✓ ${testi.aggiunta}` : `+ ${testi.aggiungi}`}
              </button>
            </li>
          );
        })}
      </ul>

      {/* La barra del programma: compare quando c'è almeno una scelta. */}
      <div
        aria-live="polite"
        className={`sticky bottom-4 z-20 mt-8 flex justify-center transition-all duration-500 ${
          scelte.length ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <a
          href="#prenota"
          className="btn-press inline-flex h-12 items-center gap-3 rounded-full bg-ink px-6 text-sm font-semibold text-white shadow-lg"
        >
          {testi.programma.replace("{n}", String(scelte.length))}
          <span className="text-sand">{testi.vaiAlModulo} →</span>
        </a>
      </div>
    </div>
  );
}
