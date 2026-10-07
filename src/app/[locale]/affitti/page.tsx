import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Cormorant_Garamond } from "next/font/google";
import { Link } from "@/i18n/navigation";
import PhotoImg from "@/components/PhotoImg";
import AiTag from "@/components/AiTag";
import JsonLd from "@/components/JsonLd";
import { CASE, type Lingua } from "@/content/affitti/case";
import { BANDA_SOGGIORNI } from "@/content/affitti/nav";
import { comePhoto } from "@/content/affitti/foto";
import { FOTO as FOTO_TH } from "@/content/affitti/foto-top-hill-cottage";
import { FOTO as FOTO_CN } from "@/content/affitti/foto-chalet-navauce";
import { absUrl, pageAlternates, pageOpenGraph } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { etichettaAi, haEtichetta } from "@/lib/fotoAi";

// L'indice dei soggiorni: le case in affitto turistico che FriuliVillas presenta.
// Una pagina corta, che porta alle due schede.

const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-affitti-display",
  display: "swap",
});

const SEO: Record<Lingua, { titolo: string; descrizione: string }> = {
  it: {
    titolo: "Soggiorni in Carnia · case in affitto · FriuliVillas",
    descrizione: "Due case in montagna in Carnia, Friuli: Top Hill Cottage a Viaso e Chalet Navauce a Raveo. Date libere e preventivo.",
  },
  en: {
    titolo: "Stays in Carnia · houses to rent · FriuliVillas",
    descrizione: "Two mountain houses in Carnia, Friuli: Top Hill Cottage in Viaso and Chalet Navauce in Raveo. Free dates and a quote.",
  },
  de: {
    titolo: "Ferienhäuser in Karnien · FriuliVillas",
    descrizione: "Zwei Berghäuser in Karnien, Friaul: Top Hill Cottage in Viaso und Chalet Navauce in Raveo. Freie Termine und Angebot.",
  },
  sl: {
    titolo: "Počitnice v Karniji · hiše za najem · FriuliVillas",
    descrizione: "Dve gorski hiši v Karniji, Furlanija: Top Hill Cottage v Viasu in Chalet Navauce v Raveu. Prosti termini in ponudba.",
  },
};

const lingua = (l: string): Lingua => (l === "en" || l === "de" || l === "sl" ? l : "it");
const FOTO = { "top-hill-cottage": FOTO_TH, "chalet-navauce": FOTO_CN } as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const s = SEO[lingua(locale)];
  return {
    title: { absolute: s.titolo },
    description: s.descrizione,
    alternates: pageAlternates(locale, "/affitti"),
    openGraph: pageOpenGraph(locale, "/affitti", s.titolo, s.descrizione),
  };
}

export default async function Soggiorni({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const L = lingua(locale);
  const T = BANDA_SOGGIORNI[L];
  const tAi = await getTranslations({ locale, namespace: "property.aiFoto" });
  const voci = CASE.map((c) => {
    const f = FOTO[c.slug].find((x) => !x.simulazioneDi);
    return { c, foto: f ? comePhoto(f, L) : null };
  });
  const tag = (p: ReturnType<typeof comePhoto>) => {
    if (!haEtichetta(p.ai)) return null;
    const e = etichettaAi(p.ai, (k) => tAi(k));
    return <AiTag testo={e.estesa} aria={e.aria} className="absolute right-3 top-3 z-[2]" />;
  };

  return (
    <div className={`${display.variable} min-h-screen bg-paper`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: CASE.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(locale, `/affitti/${c.slug}`), name: c.nome })),
        }}
      />
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-36">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">{T.eyebrow}</p>
        <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-affitti-display)] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.95] text-ink">
          {T.titolo}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-700">{T.testo}</p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-28 md:grid-cols-2">
        {voci.map(({ c, foto }) => (
          <Link key={c.slug} href={`/affitti/${c.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink">
              {foto && (
                <PhotoImg
                  src={foto.thumb}
                  srcSet={`${foto.thumb} 960w, ${foto.url} 1920w`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  alt={foto.alt}
                  className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.05]"
                />
              )}
              {foto && tag(foto)}
            </div>
            <h2 className="mt-5 font-[family-name:var(--font-affitti-display)] text-4xl text-ink">{c.nome}</h2>
            <p className="mt-1 text-neutral-700">{T.righe[c.slug]}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-brand">{T.vai} →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
