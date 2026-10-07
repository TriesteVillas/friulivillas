import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProperties } from "@/lib/airtable";
import { isSold } from "@/lib/properties";
import { buildPropertyView, localizedTitle } from "@/lib/propertyView";
import PropertyCard from "@/components/PropertyCard";
import CartaFvg, { COLORE_AREA, type PuntoCarta } from "@/components/carta/CartaFvg";
import PonteTrieste from "@/components/PonteTrieste";
import SellerCta from "@/components/SellerCta";
import JsonLd from "@/components/JsonLd";
import AutoVideo from "@/components/AutoVideo";
import EtichettaVideo from "@/components/EtichettaVideo";
import { AREE, NOMI_AREA, SLUG_AREA, areaDaSlug, type AreaId, type Lingua } from "@/lib/aree";
import {
  areaDiCasa,
  comuniDellArea,
  DATA_MISURA,
  durata,
  DA_ORIGINE,
  NOMI_ORIGINE,
  ORIGINI,
  puntiCitta,
  puntiGruppo,
  puntoDiCasa,
  tempiArea,
  urlGemello,
} from "@/lib/territorio";
import { dataLunga, ui } from "@/content/territorioUi";
import { TESTI_AREE } from "@/content/aree/testi";
import { FOTO_AREA, creditoFoto } from "@/content/aree/foto";
import { VIDEO_AREA } from "@/content/aree/video";
import { breadcrumbJsonLd, pageAlternatesPerLingua, pageOpenGraph } from "@/lib/seo";
import { formatPrice } from "@/lib/format";

/* Le pagine d'AREA (07/10/2026, SPEC-2026-10 §2): /area/<slug tradotto>.
   Reggono anche con zero case: tempi misurati, comuni, paesaggi, come è
   tracciato il confine, domande vere. Le case si contano dai dati. */

// dynamicParams resta acceso: uno slug di un’altra lingua deve arrivare alla pagina, che risponde 308 verso quello giusto.

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => AREE.map((a) => ({ locale, slug: SLUG_AREA[a][locale as Lingua] })));
}

function trovaArea(slug: string, locale: Lingua): AreaId | null {
  return areaDaSlug(slug, locale);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = locale as Lingua;
  const area = trovaArea(slug, l);
  if (!area) return {};
  const testo = TESTI_AREE[area][l];
  const paths = Object.fromEntries(routing.locales.map((x) => [x, `/area/${SLUG_AREA[area][x as Lingua]}`]));
  return {
    title: { absolute: `${testo.titleSeo} · FriuliVillas` },
    description: testo.descriptionSeo,
    alternates: pageAlternatesPerLingua(locale, paths),
    openGraph: pageOpenGraph(locale, paths[locale], testo.titleSeo, testo.descriptionSeo, `${FOTO_AREA[area].base}-1600.webp`),
  };
}

const GEMELLO: Partial<Record<AreaId, { sito: "lignano" | "sappada"; nome: string; testo: Record<Lingua, string> }>> = {
  "costa-laguna": {
    sito: "lignano",
    nome: "LignanoVillas",
    testo: {
      it: "Lignano Sabbiadoro ha un sito suo, nello stesso gruppo.",
      en: "Lignano Sabbiadoro has its own site, in the same group.",
      de: "Lignano Sabbiadoro hat eine eigene Seite in derselben Gruppe.",
      sl: "Lignano Sabbiadoro ima svojo stran v isti skupini.",
    },
  },
  montagna: {
    sito: "sappada",
    nome: "SappadaVillas",
    testo: {
      it: "Sappada ha un sito suo, nello stesso gruppo: borgate, monti e mercato misurati.",
      en: "Sappada has its own site, in the same group: hamlets, peaks and market, measured.",
      de: "Sappada hat eine eigene Seite in derselben Gruppe: Weiler, Berge und Markt, gemessen.",
      sl: "Sappada ima svojo stran v isti skupini: zaselki, gore in trg, izmerjeni.",
    },
  },
};

const T = {
  case: { it: "Case in vendita nell'area", en: "Homes for sale in the area", de: "Häuser zum Verkauf im Gebiet", sl: "Hiše naprodaj na območju" },
  paesaggi: { it: "Dentro l'area", en: "Inside the area", de: "Im Gebiet", sl: "Znotraj območja" },
  tempi: { it: "Quanto dista, misurato", en: "How far, measured", de: "Wie weit, gemessen", sl: "Kako daleč, izmerjeno" },
  origine: { it: "Partenza", en: "From", de: "Start", sl: "Izhodišče" },
  piuVicino: { it: "il più vicino", en: "nearest", de: "am nächsten", sl: "najbližja" },
  piuLontano: { it: "il più lontano", en: "farthest", de: "am weitesten", sl: "najbolj oddaljena" },
  comuniTitolo: { it: "I comuni dell'area", en: "Municipalities in the area", de: "Gemeinden im Gebiet", sl: "Občine na območju" },
  confine: { it: "Come è tracciato il confine", en: "How the boundary is drawn", de: "Wie die Grenze gezogen ist", sl: "Kako je zarisana meja" },
  faq: { it: "Domande frequenti", en: "Frequently asked questions", de: "Häufige Fragen", sl: "Pogosta vprašanja" },
  altre: { it: "Le altre aree", en: "The other areas", de: "Die anderen Gebiete", sl: "Druga območja" },
  vendi: { it: "Avete una casa in quest'area?", en: "Do you own a home in this area?", de: "Besitzen Sie ein Haus in diesem Gebiet?", sl: "Imate hišo na tem območju?" },
  vendiTesto: {
    it: "La guardiamo, leggiamo i documenti e il mercato in cui sta davvero, e vi diciamo cosa ne pensiamo.",
    en: "We look at it, read the documents and the market it really sits in, and tell you what we think.",
    de: "Wir sehen es uns an, prüfen die Unterlagen und den Markt, in dem es wirklich liegt, und sagen Ihnen offen unsere Einschätzung.",
    sl: "Ogledamo si jo, preberemo dokumente in trg, na katerem dejansko je, in vam povemo, kaj menimo.",
  },
  home: { it: "Home", en: "Home", de: "Start", sl: "Domov" },
} satisfies Record<string, Record<Lingua, string>>;

export default async function AreaPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: loc, slug } = await params;
  setRequestLocale(loc);
  const locale = loc as Lingua;
  let area = trovaArea(slug, locale);
  if (!area) {
    // Lo slug giusto ma di un'altra lingua (il selettore di lingua tiene lo slug): 308 verso quello di questa lingua.
    for (const l of routing.locales) {
      const a = areaDaSlug(slug, l as Lingua);
      if (a) permanentRedirect(`${locale === "it" ? "" : `/${locale}`}/area/${SLUG_AREA[a][locale]}`);
    }
    notFound();
  }
  area = area as AreaId;
  const testo = TESTI_AREE[area][locale];
  const foto = FOTO_AREA[area];
  const video = VIDEO_AREA[area];
  const tProp = await getTranslations("property");

  const tutte = await getProperties();
  const qui = tutte.filter((p) => areaDiCasa(p) === area);
  const vendite = qui.filter((p) => p.contratto !== "AFFITTO" && !isSold(p));
  const affitti = qui.filter((p) => p.contratto === "AFFITTO" && !isSold(p));
  const nome = NOMI_AREA[area][locale];

  const punti: PuntoCarta[] = [
    ...puntiCitta(locale),
    ...puntiGruppo(locale),
    ...[...vendite, ...affitti].flatMap((p) => {
      const pt = puntoDiCasa(p);
      if (!pt) return [];
      const prezzo = p.priceSale && !p.trattativaRiservata ? formatPrice(p.priceSale, locale) : ui("trattativaRiservata", locale);
      return [{ id: p.id, tipo: p.contratto === "AFFITTO" ? ("affitto" as const) : ("casa" as const), lat: pt.lat, lng: pt.lng, etichetta: p.comune ?? localizedTitle(p, locale), nota: prezzo, href: `/annuncio/${p.slug}` }];
    }),
  ];

  const comuni = comuniDellArea(area);
  const tempi = ORIGINI.map((o) => ({ o, ...tempiArea(area!, o) }));
  const gemello = GEMELLO[area];
  const altre = AREE.filter((a) => a !== area);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: T.home[locale], path: "/" },
          { name: nome, path: `/area/${SLUG_AREA[area][locale]}` },
        ])}
      />

      {/* ── Testata ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10">
          {video ? (
            <>
              <AutoVideo src={video.src} srcPiccolo={video.src.replace("loop-1280", "loop-720")} pausa={{ pausa: { it: "Pausa", en: "Pause", de: "Pause", sl: "Premor" }[locale], riprendi: { it: "Riprendi", en: "Play", de: "Abspielen", sl: "Predvajaj" }[locale] }} poster={video.poster} ariaLabel={foto.alt[locale]} className="h-full w-full object-cover opacity-80" />
              <div className="absolute right-3 top-24 z-10 sm:top-28">
                <EtichettaVideo dati={video.etichetta[locale]} />
              </div>
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${foto.base}-1600.webp`} srcSet={`${foto.base}-800.webp 800w, ${foto.base}-1600.webp 1600w`} sizes="100vw" alt={foto.alt[locale]} fetchPriority="high" className="h-full w-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        </div>
        <div className="pointer-events-none mx-auto max-w-6xl px-4 pb-14 pt-40 sm:px-6 sm:pb-20 sm:pt-52 [&_a]:pointer-events-auto">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/75">
            <Link href="/immobili" className="hover:underline">FriuliVillas</Link> · {ui("areaLabel", locale)}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.1rem,5vw,3.9rem)] font-semibold leading-[1.05]">{testo.h1}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">{testo.sottotitolo}</p>
          <div className="mt-6 h-1 w-24 rounded-full" style={{ background: COLORE_AREA[area] }} />
        </div>
        <div className="absolute bottom-2 right-3 flex flex-col items-end gap-1 text-right">
          <a href={foto.fonte} className="text-[10px] text-white/60 hover:text-white" rel="noopener">
            {creditoFoto(foto, locale)}
            {video ? { it: " · animata con l'AI", en: " · animated with AI", de: " · mit KI animiert", sl: " · animirano z UI" }[locale] : ""}
          </a>
        </div>
      </section>

      {/* ── Carta e numeri ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-brand/15 bg-white">
            <CartaFvg locale={locale} notaApprossimato={ui("posizioneIndicativa", locale)} punti={punti} evidenzia={area} ritaglio={area} etichetteCase titolo={`${ui("cartaTitolo", locale)} — ${nome}`} />
          </div>
          <div>
            <dl className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-paper p-4">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">{ui("comuni", locale)}</dt>
                <dd className="mt-1 font-display text-3xl font-semibold text-brand-dark">{comuni.length}</dd>
              </div>
              <div className="rounded-2xl bg-paper p-4">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">{ui("inVendita", locale)}</dt>
                <dd className="mt-1 font-display text-3xl font-semibold text-brand-dark">{vendite.length}</dd>
              </div>
              {(["trieste", "udine", "vienna", "monaco"] as const).map((o) => (
                <div key={o} className="rounded-2xl bg-paper p-4">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                    {DA_ORIGINE[o][locale]}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-brand-dark">{durata(tempiArea(area!, o).mediana, locale)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-neutral-500">{ui("daDoveNota", locale, { data: dataLunga(DATA_MISURA, locale) })}</p>
          </div>
        </div>
        <div className="mt-12 max-w-3xl space-y-4 text-lg leading-relaxed text-neutral-700">
          {testo.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* ── Le case ─────────────────────────────────────────────── */}
      <section className="border-y border-neutral-200 bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-brand-dark">{T.case[locale]}</h2>
          {vendite.length ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vendite.map((p) => (
                <PropertyCard key={p.slug} view={buildPropertyView(p, locale, tProp, nome)} photosComing={tProp("photosComing")} />
              ))}
            </div>
          ) : (
            <p className="mt-4 max-w-2xl text-neutral-600">{testo.senzaCase}</p>
          )}
          {affitti.length ? (
            <>
              <h3 className="mt-12 font-display text-2xl font-semibold text-brand-dark">{{ it: "In affitto", en: "For rent", de: "Zur Miete", sl: "Za najem" }[locale]}</h3>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {affitti.map((p) => (
                  <PropertyCard key={p.slug} view={buildPropertyView(p, locale, tProp, nome)} photosComing={tProp("photosComing")} />
                ))}
              </div>
            </>
          ) : null}
          {gemello ? (
            <a href={urlGemello(gemello.sito, locale, `area-${area}`)} className="mt-10 flex max-w-2xl items-center justify-between gap-6 rounded-2xl border border-neutral-200 bg-white px-6 py-5 hover:border-brand">
              <span>
                <span className="block font-semibold text-brand-dark">{gemello.nome} ↗</span>
                <span className="block text-sm text-neutral-600">{gemello.testo[locale]}</span>
              </span>
            </a>
          ) : null}
        </div>
      </section>

      {area === "trieste-carso" ? <PonteTrieste locale={locale} quante={6} id="trieste-case" /> : null}

      {/* ── I paesaggi ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold text-brand-dark">{T.paesaggi[locale]}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {testo.paesaggi.map((p) => (
            <article key={p.nome} className="rounded-2xl border border-neutral-200 bg-white p-6" style={{ borderTop: `3px solid ${COLORE_AREA[area!]}` }}>
              <h3 className="font-display text-xl font-semibold text-brand-dark">{p.nome}</h3>
              <p className="mt-2 text-neutral-600">{p.testo}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── I tempi ─────────────────────────────────────────────── */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-brand-dark">{T.tempi[locale]}</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                  <th className="py-2 pr-4 font-normal">{T.origine[locale]}</th>
                  <th className="py-2 pr-4 font-normal">{ui("mediana", locale)}</th>
                  <th className="py-2 pr-4 font-normal">{T.piuVicino[locale]}</th>
                  <th className="py-2 font-normal">{T.piuLontano[locale]}</th>
                </tr>
              </thead>
              <tbody>
                {tempi.map((r) => (
                  <tr key={r.o} className="border-b border-neutral-100">
                    <td className="py-2.5 pr-4 font-medium text-brand-dark">{NOMI_ORIGINE[r.o][locale]}</td>
                    <td className="py-2.5 pr-4 font-mono tabular-nums">{durata(r.mediana, locale)}</td>
                    <td className="py-2.5 pr-4 text-neutral-600">
                      {r.min.comune} <span className="font-mono tabular-nums">{durata(r.min.min, locale)}</span>
                    </td>
                    <td className="py-2.5 text-neutral-600">
                      {r.max.comune} <span className="font-mono tabular-nums">{durata(r.max.min, locale)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-neutral-500">{ui("daDoveNota", locale, { data: dataLunga(DATA_MISURA, locale) })}</p>
        </div>
      </section>

      {/* ── Confine, comuni, domande ────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-brand-dark">{T.confine[locale]}</h2>
        <p className="mt-3 text-neutral-700">{testo.confine}</p>

        <details className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5">
          <summary className="cursor-pointer font-semibold text-brand-dark">
            {T.comuniTitolo[locale]} ({comuni.length})
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">{comuni.join(" · ")}</p>
        </details>

        <h2 className="mt-14 font-display text-2xl font-semibold text-brand-dark">{T.faq[locale]}</h2>
        <div className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
          {testo.faq.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="cursor-pointer list-none font-medium text-brand-dark">
                <span className="mr-2 inline-block text-brand transition-transform group-open:rotate-90">›</span>
                {f.q}
              </summary>
              <p className="mt-2 pl-5 text-neutral-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Chi vende, le altre aree ────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start gap-5 rounded-3xl bg-brand-dark px-7 py-10 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold">{T.vendi[locale]}</h2>
            <p className="mt-2 text-white/75">{T.vendiTesto[locale]}</p>
          </div>
          <SellerCta label={ui("ctaVendi", locale)} className="btn-hero shrink-0 rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-dark" />
        </div>

        <h2 className="mt-16 font-display text-2xl font-semibold text-brand-dark">{T.altre[locale]}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {altre.map((a) => (
            <li key={a}>
              <Link href={`/area/${SLUG_AREA[a][locale]}`} className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="relative aspect-[16/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${FOTO_AREA[a].base}-800.webp`} alt={FOTO_AREA[a].alt[locale]} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <p className="flex items-center gap-2 px-4 py-3 font-semibold text-brand-dark">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORE_AREA[a] }} />
                  {NOMI_AREA[a][locale]} →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
