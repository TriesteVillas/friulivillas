import { getPonteSafe, hrefCatalogoTsv } from "@/lib/ponte";
import type { Lingua } from "@/lib/aree";
import { ui } from "@/content/territorioUi";
import { formatPrice } from "@/lib/format";
import SegnoAiDiscreto from "@/components/SegnoAiDiscreto";

/* Il ponte verso Trieste (07/10/2026, src/lib/ponte.ts): poche card vere che
   portano su triestevillas.com. Nessuna pagina qui, nessun testo copiato. */
export default async function PonteTrieste({ locale, quante = 6, id = "trieste" }: { locale: Lingua; quante?: number; id?: string }) {
  const { case: case_, totale } = await getPonteSafe(quante);
  return (
    <section id={id} className="border-y border-neutral-200 bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow">{ui("ponteEyebrow", locale)}</p>
        <h2 className="display-chapter mt-2 max-w-3xl font-display text-brand-dark">{ui("ponteTitolo", locale)}</h2>
        {case_.length ? (
          <>
            <p className="mt-4 max-w-2xl text-neutral-600">{ui("ponteTesto", locale, { n: totale })}</p>
            <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {case_.map((c) => (
                <li key={c.id}>
                  <a href={c.href[locale]} className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg">
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${c.foto.base}/800.webp`}
                        srcSet={`${c.foto.base}/600.webp 600w, ${c.foto.base}/800.webp 800w, ${c.foto.base}/1200.webp 1200w`}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        alt={c.titolo[locale]}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <SegnoAiDiscreto dati={c.segno ? { testo: ui(c.segno === "rendering" ? "rendering" : "simulazione", locale), lang: locale } : null} />
                    </div>
                    <div className="p-5">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                        {c.comune}
                        {" · "}
                        {ui("ponteSuTsv", locale)} ↗
                      </p>
                      <h3 className="mt-1.5 line-clamp-2 font-semibold text-brand-dark">{c.titolo[locale]}</h3>
                      <p className="mt-2 text-sm text-neutral-600">
                        {c.riservata || !c.prezzo ? ui("trattativaRiservata", locale) : `${formatPrice(c.prezzo, locale)}${c.iva ? ` + ${{ it: "IVA", en: "VAT", de: "MwSt.", sl: "DDV" }[locale]}` : ""}`}
                        {c.mq ? ` · ${c.mq} m²` : ""}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-4 max-w-2xl text-neutral-600">{ui("ponteGuasto", locale)}</p>
        )}
        <a
          href={hrefCatalogoTsv(locale)}
          className="btn-press mt-10 inline-block rounded-full border border-brand/40 px-7 py-3 text-sm font-semibold text-brand hover:border-brand hover:bg-brand/5"
        >
          {ui("ponteTutte", locale)} ↗
        </a>
      </div>
    </section>
  );
}
