import { Link } from "@/i18n/navigation";
import PhotoImg from "@/components/PhotoImg";
import SegnoAiDiscreto from "@/components/SegnoAiDiscreto";
import { CASE, type Lingua } from "@/content/affitti/case";
import { BANDA_SOGGIORNI } from "@/content/affitti/nav";
import { comePhoto } from "@/content/affitti/foto";
import { FOTO as FOTO_TH } from "@/content/affitti/foto-top-hill-cottage";
import { FOTO as FOTO_CN } from "@/content/affitti/foto-chalet-navauce";

// La banda dei soggiorni in home (dal 07/10/2026): le due case in affitto,
// separate dalla vendita (vendita e affitto non si mescolano). È un file della
// HOME per il cancello delle etichette (scripts/check-etichette-ai.mjs): niente
// pillole, il solo segno discreto, che compare solo se la copertina fosse una
// simulazione (qui sono foto vere).

const COPERTINE = { "top-hill-cottage": FOTO_TH, "chalet-navauce": FOTO_CN } as const;

export default function BandaSoggiorni({ locale }: { locale: string }) {
  const L = (["it", "en", "de", "sl"].includes(locale) ? locale : "it") as Lingua;
  const T = BANDA_SOGGIORNI[L];
  const voci = CASE.map((c) => {
    const f = COPERTINE[c.slug].find((x) => !x.simulazioneDi && !x.ai) ?? COPERTINE[c.slug].find((x) => !x.simulazioneDi);
    return { c, foto: f ? comePhoto(f, L) : null };
  }).filter((v) => v.foto);
  if (!voci.length) return null;

  return (
    <section className="mt-20 bg-brand-dark py-20 text-white sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sand">{T.eyebrow}</p>
        <h2 className="display-chapter mt-2 max-w-3xl text-white">{T.titolo}</h2>
        <p className="mt-4 max-w-2xl text-white/80">{T.testo}</p>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {voci.map(({ c, foto }) => (
            <li key={c.slug}>
              <Link href={`/affitti/${c.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-ink">
                  <PhotoImg
                    src={foto!.thumb}
                    srcSet={`${foto!.thumb} 960w, ${foto!.url} 1920w`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    alt={foto!.alt}
                    className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.05]"
                  />
                  <SegnoAiDiscreto dati={null} />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="text-xl font-semibold">{c.nome}</h3>
                  <span className="text-sm font-semibold text-sand">{T.vai} →</span>
                </div>
                <p className="mt-1 text-sm text-white/70">{T.righe[c.slug]}</p>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/affitti" className="mt-10 inline-block text-sm font-semibold text-sand underline-offset-4 hover:underline">
          {T.tutte} →
        </Link>
      </div>
    </section>
  );
}
