// Le recensioni degli ospiti come le racconta la legge (Codice del Consumo
// art. 22 c. 5-bis, art. 23 c. 1 lett. bb-ter/bb-quater; KB
// tophill-cottage/REGOLE-LEGALI §2): il punteggio con piattaforma, numero e
// data della lettura; i TEMI contati da noi sullo stesso insieme dichiarato
// («in X recensioni su N»), positivi o negativi; e accanto il riquadro che dice
// come li abbiamo scelti. Mai «recensioni verificate», niente logo né link
// della piattaforma.

export type TestiRecensioni = {
  eyebrow: string;
  titolo: string;
  punteggio: string;
  dettaglio: string;
  temi: Array<{ n: number; su: number; testo: string }>;
  nota: string;
};

export default function Recensioni({ testi }: { testi: TestiRecensioni }) {
  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">{testi.eyebrow}</p>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-affitti-display)] text-[clamp(2.2rem,5vw,4rem)] leading-[1] text-ink">
          {testi.titolo}
        </h2>
        <div className="mt-12 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div data-reveal>
            <p className="font-[family-name:var(--font-affitti-display)] text-[clamp(5rem,12vw,9rem)] leading-none text-brand-dark">
              {testi.punteggio}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-700">{testi.dettaglio}</p>
          </div>
          <ul className="space-y-5" data-reveal-stagger>
            {testi.temi.map((t) => (
              <li key={t.testo}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-base text-ink">{t.testo}</span>
                  <span className="shrink-0 text-sm tabular-nums text-neutral-600">
                    {t.n}/{t.su}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.round((t.n / t.su) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p id="come-scelte" className="mt-12 max-w-3xl text-xs leading-relaxed text-neutral-600">
          {testi.nota}
        </p>
      </div>
    </section>
  );
}
