import { getTranslations } from "next-intl/server";
import AiTag from "@/components/AiTag";
import { contaFotoAi, eStile, rigaRiepilogo } from "@/lib/fotoAi";
import type { Photo } from "@/lib/properties";

// Il riepilogo della trasparenza AI dei soggiorni (SPEC trasparenza v1.3 §11.2),
// con la stessa forma di quello delle schede in vendita, perché il prebuild la
// controlla allo stesso modo (scripts/check-etichette-ai.mjs, regola 8): fuori
// dal <details> solo il titolo, UNA riga calcolata dai conteggi e la chiusura;
// dentro, i conteggi per tipo, la nota completa e i video.
//
// La nota non viene dal CRM (queste case non sono nel catalogo): viene dal
// registro foto per foto della lavorazione (KB, LEGGIMI della consegna), nella
// lingua della pagina.

export type VideoNelRiepilogo = { testo: string; didascalia: string };

export default async function RiepilogoAi({
  foto,
  nota,
  video,
  locale,
}: {
  foto: Photo[];
  nota: string[];
  video: VideoNelRiepilogo[];
  locale: string;
}) {
  const tAi = await getTranslations({ locale, namespace: "property.aiFoto" });
  const t = await getTranslations({ locale, namespace: "property" });
  const contiAi = contaFotoAi(foto);
  const righeAi = rigaRiepilogo(contiAi).map((x) => tAi(x.chiave, x.valori));
  const rigaAi = (righeAi.length ? righeAi : video.length ? [tAi("summaryLineVideoOnly")] : []).join(" ");
  const riepilogoAi = contiAi.luce + contiAi.segnalate + contiAi.rendering > 0 || nota.length > 0 || video.length > 0;
  if (!riepilogoAi) return null;

  return (
    <section id="foto-ai" className="scroll-mt-32" data-reveal>
      <h2 className="text-balance text-lg font-semibold">{tAi("summaryTitle")}</h2>
      <p className="mt-2 text-pretty leading-relaxed text-neutral-700">
        {rigaAi && <>{rigaAi} </>}
        <span>{tAi("summaryClosing")}</span>
      </p>
      <details className="group mt-3 rounded-xl border border-neutral-200 bg-white">
        <summary className="block min-h-11 cursor-pointer list-none rounded-xl px-4 py-2.5 text-sm font-medium text-brand hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 [&::-webkit-details-marker]:hidden">
          <span className="flex min-h-6 items-center justify-between gap-3">
            {tAi("summaryMore")}
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </summary>
        <div className="space-y-5 border-t border-neutral-200 px-4 pb-5 pt-4 text-sm leading-relaxed text-neutral-700 sm:px-5">
          {contiAi.perTipo.length > 0 && (
            <div>
              <h3 className="font-semibold text-neutral-900">{tAi("legendTitle")}</h3>
              <ul className="mt-3 space-y-3">
                {contiAi.perTipo.map(({ tipo, n }) => (
                  <li key={tipo} className="flex items-start gap-3 text-neutral-600">
                    <span className="w-7 shrink-0 text-right font-semibold tabular-nums text-neutral-900">{n}</span>
                    {!eStile(tipo) && (
                      <AiTag
                        testo={tAi(`tag.${tipo}`)}
                        aria={tipo === "ai" ? tAi("genericAria") : tAi(`tag.${tipo}`)}
                        className="mt-px shrink-0"
                      />
                    )}
                    <span>{tAi(`legend.${tipo}`)}</span>
                  </li>
                ))}
              </ul>
              {contiAi.conOriginale > 0 && (
                <p className="mt-3 text-neutral-600">{tAi("detailsOriginals", { count: contiAi.conOriginale })}</p>
              )}
            </div>
          )}
          {nota.length > 0 && (
            <div className="space-y-3">
              {nota.map((x, i) => (
                <p key={i}>{x}</p>
              ))}
            </div>
          )}
          {video.length > 0 && (
            <div>
              <h3 className="font-semibold text-neutral-900">{t("galVideo")}</h3>
              <ul className="mt-3 space-y-3">
                {video.map((v, i) => (
                  <li key={i} className="flex items-start gap-3 text-neutral-600">
                    <AiTag testo={v.testo} aria={v.testo} className="mt-px shrink-0" />
                    <span>{v.didascalia}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
