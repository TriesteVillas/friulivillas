"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

/* «Da dove partite?» (07/10/2026). Tutti i tempi arrivano già nell'HTML
   (misure OSRM statiche): la scelta della partenza cambia solo cosa si
   mostra, nessun parametro nell'URL e nessuna chiamata. Senza JavaScript si
   legge la partenza di default della lingua. */

export type RigaTempi = { id: string; nome: string; nota?: string; href?: string; esterno?: boolean; colore?: string; minuti: (number | null)[] };

export default function DaDove({
  origini,
  iniziale,
  aree,
  case: caseRighe,
  etichette,
}: {
  origini: string[];
  iniziale: number;
  aree: RigaTempi[];
  case: RigaTempi[];
  etichette: { da: string; aree: string; case: string; ore: string };
}) {
  const [o, setO] = useState(iniziale);
  const fmt = (m: number | null) => {
    if (m == null) return "—";
    const h = Math.floor(m / 60), r = m % 60;
    return h ? `${h} ${etichette.ore} ${String(r).padStart(2, "0")}` : `${r} min`;
  };
  const riga = (r: RigaTempi, max: number) => {
    const m = r.minuti[o];
    const inner = (
      <>
        <span className="flex min-w-0 items-center gap-2">
          {r.colore ? <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.colore }} /> : null}
          <span className="truncate text-brand-dark">{r.nome}</span>
          {r.nota ? <span className="hidden truncate text-xs text-neutral-500 sm:inline">{r.nota}</span> : null}
        </span>
        <span className="flex items-center gap-3">
          <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-neutral-200 sm:block" aria-hidden="true">
            <span className="block h-full rounded-full bg-brand/70 transition-[width] duration-500" style={{ width: `${m == null ? 0 : Math.max(4, (m / max) * 100)}%` }} />
          </span>
          <span className="w-20 text-right font-mono text-sm tabular-nums text-brand-dark">{fmt(m)}</span>
        </span>
      </>
    );
    const cls = "flex items-center justify-between gap-4 py-2.5";
    if (!r.href) return <li key={r.id} className={cls}>{inner}</li>;
    return (
      <li key={r.id}>
        {r.esterno ? (
          <a href={r.href} className={`${cls} hover:bg-white/60`}>{inner}</a>
        ) : (
          <Link href={r.href} className={`${cls} hover:bg-white/60`}>{inner}</Link>
        )}
      </li>
    );
  };
  const tutti = [...aree, ...caseRighe].map((r) => r.minuti[o] ?? 0);
  const max = Math.max(1, ...tutti);

  return (
    <div>
      <div role="radiogroup" aria-label={etichette.da} className="flex flex-wrap gap-2">
        {origini.map((nome, i) => (
          <button
            key={nome}
            type="button"
            role="radio"
            aria-checked={i === o}
            onClick={() => setO(i)}
            className={
              i === o
                ? "btn-press rounded-full bg-brand-dark px-3.5 py-1.5 text-sm font-semibold text-white"
                : "btn-press rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-sm text-neutral-600 hover:border-brand hover:text-brand"
            }
          >
            {nome}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-8 md:grid-cols-2" aria-live="polite">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">{etichette.aree}</p>
          <ul className="mt-2 divide-y divide-neutral-200 border-y border-neutral-200">{aree.map((r) => riga(r, max))}</ul>
        </div>
        {caseRighe.length ? (
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">{etichette.case}</p>
            <ul className="mt-2 divide-y divide-neutral-200 border-y border-neutral-200">{caseRighe.map((r) => riga(r, max))}</ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
