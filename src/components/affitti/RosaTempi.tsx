// «Da qui»: la rosa dei tempi. Ogni luogo sta nella DIREZIONE vera in cui si
// trova rispetto alla casa (azimut calcolato dalle coordinate) e alla DISTANZA
// IN MINUTI d'auto (OSRM, senza traffico: dossier del territorio nella KB),
// non in chilometri: in montagna conta il tempo, non la linea d'aria. Gli
// anelli sono 15, 30, 60 e 120 minuti; il raggio cresce con la radice dei
// minuti, così i luoghi vicini non si schiacciano al centro.
//
// SVG statico disegnato al build, nessun JavaScript; la comparsa la fa il
// RevealObserver del sito. I nomi sono testo vero (si leggono e si cercano).

export type PuntoRosa = {
  nome: string;
  lat: number;
  lon: number;
  minuti: number;
  km: number;
  /** testo breve sotto il nome, facoltativo («UNESCO», «aeroporto») */
  nota?: string;
};

const RAD = Math.PI / 180;

/** Azimut iniziale (gradi da nord, in senso orario) dalla casa al punto. */
function azimut(da: { lat: number; lon: number }, a: { lat: number; lon: number }): number {
  const f1 = da.lat * RAD;
  const f2 = a.lat * RAD;
  const dl = (a.lon - da.lon) * RAD;
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return ((Math.atan2(y, x) / RAD) + 360) % 360;
}

const ANELLI = [15, 30, 60, 120];

export default function RosaTempi({
  centro,
  nomeCentro,
  punti,
  minuti,
  legenda,
  titolo,
  cardinali,
}: {
  centro: { lat: number; lon: number };
  nomeCentro: string;
  punti: PuntoRosa[];
  /** «{n} min» nella lingua della pagina */
  minuti: (n: number) => string;
  legenda: string;
  titolo: string;
  /** nord, est, sud, ovest nella lingua della pagina */
  cardinali: [string, string, string, string];
}) {
  const W = 860;
  const C = W / 2;
  const R = 360;
  // Un anello vuoto attorno alla casa (R0): i luoghi a dieci minuti non si
  // schiacciano sul centro, e la scala resta monotona (radice dei minuti).
  const R0 = 70;
  const max = Math.max(150, ...punti.map((p) => p.minuti));
  const r = (m: number) => R0 + (R - R0) * Math.sqrt(Math.min(m, max) / max);

  // Posizione e lato dell'etichetta; poi una passata che allontana le etichette
  // che cadono a meno di 30 px l'una dall'altra sullo stesso lato.
  const piazzati = punti
    .map((p) => {
      const a = azimut(centro, p) * RAD;
      const rr = r(p.minuti);
      const x = C + rr * Math.sin(a);
      const y = C - rr * Math.cos(a);
      return { ...p, x, y, ly: y, destra: x >= C };
    })
    .sort((a, b) => a.y - b.y);
  // Etichette: sullo stesso lato, almeno 24 px di distanza verticale fra due
  // etichette che si sovrapporrebbero in orizzontale (stima della larghezza dal
  // numero di caratteri).
  const larghezza = (p: { nome: string; minuti: number }) => (p.nome.length + String(p.minuti).length + 7) * 7.4;
  for (const lato of [true, false]) {
    const gruppo = piazzati.filter((p) => p.destra === lato);
    for (let i = 1; i < gruppo.length; i++) {
      for (let j = 0; j < i; j++) {
        const a = gruppo[j];
        const b = gruppo[i];
        const ax0 = lato ? a.x + 12 : a.x - 12 - larghezza(a);
        const bx0 = lato ? b.x + 12 : b.x - 12 - larghezza(b);
        const sovrapposti = ax0 < bx0 + larghezza(b) && bx0 < ax0 + larghezza(a);
        if (sovrapposti && Math.abs(b.ly - a.ly) < 24) b.ly = a.ly + 24;
      }
    }
  }

  const inOrdine = [...punti].sort((a, b) => a.minuti - b.minuti);
  return (
    <figure className="mx-auto w-full max-w-3xl" data-reveal="scale">
      {/* Sul telefono la rosa non si leggerebbe: lo stesso dato come nastro dei tempi. */}
      <ol className="space-y-2 sm:hidden" aria-label={titolo}>
        {inOrdine.map((p) => (
          <li key={p.nome} className="flex items-center gap-3 text-sm">
            <span className="w-16 shrink-0 text-right font-semibold tabular-nums text-ink">{minuti(p.minuti)}</span>
            <span className="h-1.5 rounded-full bg-sand" style={{ width: `${Math.max(6, Math.round((p.minuti / Math.max(150, inOrdine[inOrdine.length - 1].minuti)) * 45))}%` }} />
            <span className="min-w-0 text-neutral-800">{p.nome}</span>
          </li>
        ))}
      </ol>
      <svg
        viewBox={`0 0 ${W} ${W}`}
        role="img"
        aria-labelledby="rosa-titolo rosa-legenda"
        className="hidden h-auto w-full overflow-visible text-ink sm:block"
      >
        <title id="rosa-titolo">{titolo}</title>
        <desc id="rosa-legenda">
          {punti.map((p) => `${p.nome}: ${minuti(p.minuti)}, ${p.km} km`).join("; ")}
        </desc>
        {/* gli anelli dei minuti */}
        {ANELLI.filter((m) => m <= max).map((m) => (
          <g key={m}>
            <circle cx={C} cy={C} r={r(m)} fill="none" stroke="currentColor" strokeOpacity={0.14} strokeDasharray="2 6" />
            <text x={C + 6} y={C - r(m) - 6} fontSize={12} fill="currentColor" fillOpacity={0.55}>
              {minuti(m)}
            </text>
          </g>
        ))}
        {/* i punti cardinali */}
        {[
          [cardinali[0], C, C - R - 18],
          [cardinali[1], C + R + 18, C + 4],
          [cardinali[2], C, C + R + 26],
          [cardinali[3], C - R - 18, C + 4],
        ].map(([l, x, y], i) => (
          <text key={i} x={x as number} y={y as number} textAnchor="middle" fontSize={13} fontWeight={600} fill="currentColor" fillOpacity={0.4}>
            {l}
          </text>
        ))}
        {/* i raggi e i luoghi */}
        {piazzati.map((p) => (
          <g key={p.nome} className="rosa-punto">
            <line x1={C} y1={C} x2={p.x} y2={p.y} stroke="currentColor" strokeOpacity={0.22} />
            <circle cx={p.x} cy={p.y} r={5} fill="#cfb795" stroke="#0b1512" strokeWidth={1.5} />
            {Math.abs(p.ly - p.y) > 2 && (
              <line x1={p.x} y1={p.y} x2={p.x + (p.destra ? 10 : -10)} y2={p.ly} stroke="currentColor" strokeOpacity={0.3} />
            )}
            <text
              x={p.x + (p.destra ? 12 : -12)}
              y={p.ly + 4}
              textAnchor={p.destra ? "start" : "end"}
              fontSize={15}
              fill="currentColor"
            >
              <tspan fontWeight={600}>{p.nome}</tspan>
              <tspan fillOpacity={0.6}> · {minuti(p.minuti)}</tspan>
            </text>
          </g>
        ))}
        {/* la casa al centro */}
        <circle cx={C} cy={C} r={11} fill="#16352a" />
        <circle cx={C} cy={C} r={20} fill="none" stroke="#16352a" strokeOpacity={0.35} />
        <text x={C} y={C + 40} textAnchor="middle" fontSize={14} fontWeight={700} fill="currentColor">
          {nomeCentro}
        </text>
      </svg>
      <figcaption className="mt-4 text-center text-xs text-neutral-600">{legenda}</figcaption>
    </figure>
  );
}
