import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageAlternates, pageOpenGraph } from "@/lib/seo";
import { getProperties } from "@/lib/airtable";
import { isSold } from "@/lib/properties";
import { buildPropertyView, localizedTitle } from "@/lib/propertyView";
import PropertyCard from "@/components/PropertyCard";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import SegnoAiDiscreto from "@/components/SegnoAiDiscreto";
import BuyerCta from "@/components/BuyerCta";
import SellerCta from "@/components/SellerCta";
import CartaFvg, { COLORE_AREA, type PuntoCarta } from "@/components/carta/CartaFvg";
import DaDove from "@/components/carta/DaDove";
import PonteTrieste from "@/components/PonteTrieste";
import { sloveniaVillasStrings } from "@/content/sloveniaVillasStrings";
import { sappadaVillasStrings } from "@/content/sappadaVillasStrings";
import { AREE, NOMI_AREA, SLUG_AREA, type AreaId, type Lingua } from "@/lib/aree";
import {
  areaDiCasa,
  comuniDellArea,
  DATA_MISURA,
  minuti,
  DA_ORIGINE,
  NOMI_ORIGINE,
  ORIGINE_DEFAULT,
  ORIGINI,
  puntiCitta,
  puntiGruppo,
  puntoDeiTempi,
  puntoDiCasa,
  tempiArea,
} from "@/lib/territorio";
import { dataLunga, ui } from "@/content/territorioUi";
import { TESTI_AREE } from "@/content/aree/testi";
import { FOTO_AREA, creditoFoto } from "@/content/aree/foto";
import { formatPrice } from "@/lib/format";

/* La home rifatta (07/10/2026, SPEC-2026-10): la carta in prima schermata, le
   quattro aree, «da dove partite?», le case per area, il ponte verso Trieste,
   chi vende, i siti del gruppo. Via i quattro mp4 di prima: il drone di una
   piscina (con un alt che diceva «paesaggio del FVG») e tre clip copiate da
   triesteimmobiliare.com. LA HOME NON PORTA PILLOLE AI (SPEC trasparenza
   §11.1): solo il segno discreto, che resta vuoto dove non serve. */

const SELLER_CARDS = ["fast", "zeroFee", "simpleMandate", "marketing"] as const;
const ROUTING = ["luxury", "fvg", "rent", "business", "sappada", "slovenia"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: { absolute: t("home.title") },
    description: t("home.description"),
    alternates: pageAlternates(locale, "/"),
    openGraph: pageOpenGraph(locale, "/", t("home.ogTitle"), t("home.ogDescription")),
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: loc } = await params;
  setRequestLocale(loc);
  const locale = loc as Lingua;
  const sv = sloveniaVillasStrings(locale);
  const sap = sappadaVillasStrings(locale);
  const t = await getTranslations("home");
  const tProp = await getTranslations("property");

  const properties = await getProperties();
  // Il venduto non sta in prima fila (regola TSV del 08/09): resta in /immobili col badge.
  const inVendita = properties.filter((p) => !isSold(p) && p.contratto !== "AFFITTO");
  const perArea = new Map<AreaId, typeof inVendita>();
  for (const p of inVendita) {
    const a = areaDiCasa(p);
    if (a) (perArea.get(a) ?? perArea.set(a, []).get(a)!).push(p);
  }

  const reel = inVendita
    .filter((p) => p.coverPhoto)
    .map((p) => {
      const a = areaDiCasa(p);
      return buildPropertyView(p, locale, tProp, a ? NOMI_AREA[a][locale] : null, { superficie: "home" });
    });

  // I punti della carta: le case in vendita, i siti del gruppo, le città di riferimento.
  const puntiCase: PuntoCarta[] = inVendita.flatMap((p) => {
    const pt = puntoDiCasa(p);
    if (!pt) return [];
    const prezzo = p.priceSale && !p.trattativaRiservata ? formatPrice(p.priceSale, locale) : ui("trattativaRiservata", locale);
    return [{ id: p.id, tipo: "casa" as const, lat: pt.lat, lng: pt.lng, etichetta: p.comune ?? localizedTitle(p, locale), nota: prezzo, href: `/annuncio/${p.slug}`, approssimato: pt.approssimato }];
  });
  const punti = [...puntiCitta(locale), ...puntiGruppo(locale), ...puntiCase];

  const conteggi = Object.fromEntries(
    AREE.map((a) => {
      const n = perArea.get(a)?.length ?? 0;
      return [a, n ? `${n} ${ui("inVendita", locale)}` : ui("nessunaInVendita", locale)];
    }),
  ) as Record<AreaId, string>;

  const origDefault = ORIGINE_DEFAULT[locale];
  const ore = { it: "h", en: "h", de: "Std.", sl: "h" }[locale];

  // «Da dove partite?»: tutte le misure nell'HTML, la scelta è del browser.
  const righeAree = AREE.map((a) => ({
    id: a,
    nome: NOMI_AREA[a][locale],
    href: `/area/${SLUG_AREA[a][locale]}`,
    colore: COLORE_AREA[a],
    minuti: ORIGINI.map((o) => tempiArea(a, o).mediana),
  }));
  const righeCase = inVendita.flatMap((p) => {
    const s = puntoDeiTempi(p);
    if (!s) return [];
    return [{ id: p.id, nome: localizedTitle(p, locale), nota: s.luogo, href: `/annuncio/${p.slug}`, minuti: ORIGINI.map((o) => minuti(s.chiave, o)) }];
  });

  const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} ${ore} ${String(m % 60).padStart(2, "0")}` : `${m} min`);

  return (
    <>
      {/* ── 1. La carta ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-28 sm:px-6 sm:pt-32 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-12">
          <div>
            <p className="eyebrow" data-reveal>{ui("heroEyebrow", locale)}</p>
            <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.05] tracking-tight text-brand-dark">
              {ui("heroTitolo", locale)}
            </h1>
            <p className="mt-6 max-w-xl text-base text-neutral-600 sm:text-lg" data-reveal>{ui("heroSotto", locale)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/immobili" transitionTypes={["nav-forward"]} className="btn-hero rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white">
                {ui("ctaCase", locale)}
              </Link>
              <SellerCta label={ui("ctaVendi", locale)} className="btn-press rounded-full border border-brand/40 px-7 py-3 text-sm font-semibold text-brand hover:border-brand hover:bg-brand/5" />
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {AREE.map((a) => (
                <li key={a}>
                  <Link href={`/area/${SLUG_AREA[a][locale]}`} className="group flex items-start gap-2">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORE_AREA[a] }} />
                    <span>
                      <span className="block font-semibold text-brand-dark group-hover:underline">{NOMI_AREA[a][locale]}</span>
                      <span className="block font-mono text-[11px] text-neutral-500">{conteggi[a]}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="overflow-hidden rounded-3xl border border-brand/15 bg-white shadow-[0_30px_80px_-40px_rgba(22,53,42,0.5)]">
              <CartaFvg locale={locale} notaApprossimato={ui("posizioneIndicativa", locale)} punti={punti} conteggi={conteggi} titolo={ui("cartaTitolo", locale)} priority />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-neutral-600">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[1px] bg-brand-dark" />{ui("legendaCasa", locale)}</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-brand-dark bg-white" />{ui("legendaGruppo", locale)}</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-1.5 rounded-full bg-ink/70" />{ui("legendaCitta", locale)}</span>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-neutral-500">{ui("fontiCarta", locale)}</p>
          </div>
        </div>
      </section>

      {/* ── 2. Le quattro aree ────────────────────────────────────── */}
      <section id="aree" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6">
        <p className="eyebrow">{ui("areeEyebrow", locale)}</p>
        <h2 className="display-chapter mt-2 max-w-3xl font-display text-brand-dark">{ui("areeTitolo", locale)}</h2>
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
          {AREE.map((a) => {
            const f = FOTO_AREA[a];
            const tm = tempiArea(a, origDefault);
            const n = perArea.get(a)?.length ?? 0;
            return (
              <li key={a} className="flex">
                <Link href={`/area/${SLUG_AREA[a][locale]}`} className="group flex w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg">
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${f.base}-800.webp`} alt={f.alt[locale]} loading="lazy" decoding="async" width={800} height={450} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    <SegnoAiDiscreto dati={null} />
                    <span className="absolute left-0 top-0 h-1 w-full" style={{ background: COLORE_AREA[a] }} />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-xl font-semibold text-brand-dark">{NOMI_AREA[a][locale]}</h3>
                    <p className="mt-2 flex-1 text-sm text-neutral-600">{TESTI_AREE[a][locale].sottotitolo}</p>
                    <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3 font-mono text-[11px] text-neutral-500">
                      <div>
                        <dt className="sr-only">{ui("comuni", locale)}</dt>
                        <dd><span className="text-brand-dark">{comuniDellArea(a).length}</span> {ui("comuni", locale)}</dd>
                      </div>
                      <div>
                        <dt className="sr-only">{ui("inVendita", locale)}</dt>
                        <dd><span className="text-brand-dark">{n}</span> {ui("inVendita", locale)}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="sr-only">{ui("daOrigine", locale)}</dt>
                        <dd>
                          {DA_ORIGINE[origDefault][locale]}: <span className="text-brand-dark">{fmt(tm.mediana)}</span> ({ui("mediana", locale)})
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-2 text-[10px] text-neutral-400">{creditoFoto(f, locale)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── 3. Da dove partite? ───────────────────────────────────── */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="eyebrow">{ui("daDoveEyebrow", locale)}</p>
          <h2 className="display-chapter mt-2 font-display text-brand-dark">{ui("daDoveTitolo", locale)}</h2>
          <div className="mt-8">
            <DaDove
              origini={ORIGINI.map((o) => NOMI_ORIGINE[o][locale])}
              iniziale={ORIGINI.indexOf(origDefault)}
              aree={righeAree}
              case={righeCase}
              etichette={{ da: ui("daDoveTitolo", locale), aree: ui("areeEyebrow", locale), case: ui("leNostreCase", locale), ore }}
            />
          </div>
          <p className="mt-6 max-w-3xl text-xs text-neutral-500">{ui("daDoveNota", locale, { data: dataLunga(DATA_MISURA, locale) })}</p>
        </div>
      </section>

      {/* ── 4. In vendita, area per area ──────────────────────────── */}
      {reel.length > 0 ? (
        <section className="pt-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="eyebrow">{ui("venditaEyebrow", locale)}</p>
            <h2 className="display-chapter mt-2 font-display text-brand-dark">{ui("venditaTitolo", locale)}</h2>
          </div>
          <FeaturedCarousel>
            {reel.map((v) => (
              <div key={v.slug} className="w-[78vw] shrink-0 snap-start sm:w-[38vw] lg:w-[28vw]">
                <PropertyCard view={v} photosComing={tProp("photosComing")} />
              </div>
            ))}
            <div className="flex w-[40vw] shrink-0 snap-start items-center justify-center sm:w-[24vw]">
              <Link href="/immobili" transitionTypes={["nav-forward"]} className="btn-press rounded-full border border-brand/40 px-8 py-4 text-sm font-semibold text-brand hover:border-brand hover:bg-brand/5">
                {ui("tuttiGliImmobili", locale)} →
              </Link>
            </div>
          </FeaturedCarousel>
        </section>
      ) : null}

      {/* ── 5. Il ponte verso Trieste ─────────────────────────────── */}
      <div className="mt-20">
        <PonteTrieste locale={locale} />
      </div>

      {/* ── 6. Per chi vende ──────────────────────────────────────── */}
      <section className="bg-brand-dark text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow text-sand">{t("sellerValue.eyebrow")}</p>
          <h2 className="display-chapter mt-2 max-w-3xl font-display text-white">{t("sellerValue.title")}</h2>
          <p className="mt-4 max-w-2xl text-white/70">{t("sellerValue.subtitle")}</p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2" data-reveal-stagger>
            {SELLER_CARDS.map((c) => (
              <div key={c} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/25">
                <h3 className="text-lg font-semibold text-white">{t(`sellerValue.${c}.title`)}</h3>
                <p className="mt-2 text-white/70">{t(`sellerValue.${c}.text`)}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/vendi" transitionTypes={["nav-forward"]} className="btn-hero inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-dark">
              {t("sellerValue.cta")} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. SappadaVillas (07/10/2026) ─────────────────────────── */}
      {/* In regione, in montagna: il sito del gruppo per Sappada/Plodn. */}
      <section id="sappadavillas" className="mx-auto max-w-5xl px-6 pt-20">
        <div className="grid gap-8 rounded-3xl border border-neutral-200 bg-white px-7 py-10 sm:px-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <div data-reveal="left">
            <p className="eyebrow">{sap.eyebrow}</p>
            <h2 className="display-chapter mt-2 font-display text-brand-dark">{sap.title}</h2>
            <p className="mt-4 max-w-2xl text-neutral-600">{sap.lead}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={sap.hamlets.href} target="_blank" rel="noopener noreferrer" className="btn-hero inline-block rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white">
                {sap.hamlets.cta} ↗
              </a>
              <a href={sap.compare.href} target="_blank" rel="noopener noreferrer" className="btn-press inline-block rounded-full border border-brand/40 px-7 py-3 text-sm font-semibold text-brand hover:border-brand hover:bg-brand/5">
                {sap.compare.cta} ↗
              </a>
            </div>
          </div>
          <div className="rounded-2xl bg-paper p-6">
            <a href={sap.site.href} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-500 underline-offset-4 transition-colors hover:text-brand hover:underline">
              {sap.site.label} ↗
            </a>
            <dl className="mt-3 divide-y divide-neutral-200">
              {sap.rows.map((row) => (
                <div key={row.name} className="py-3">
                  <dt className="font-medium text-brand-dark">{row.name}</dt>
                  <dd className="mt-1 text-sm text-neutral-600">{row.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── 8. SloveniaVillas (06/10/2026) ────────────────────────── */}
      <section id="sloveniavillas" className="mx-auto max-w-5xl px-6 pt-10">
        <div className="grid gap-8 rounded-3xl border border-neutral-200 bg-white px-7 py-10 sm:px-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <div data-reveal="left">
            <p className="eyebrow">{sv.eyebrow}</p>
            <h2 className="display-chapter mt-2 font-display text-brand-dark">{sv.title}</h2>
            <p className="mt-4 max-w-2xl text-neutral-600">{sv.lead}</p>
            {sv.owners ? <p className="mt-4 max-w-2xl text-neutral-600">{sv.owners.text}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={sv.href} target="_blank" rel="noopener noreferrer" className="btn-hero inline-block rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white">
                {sv.cta} ↗
              </a>
              {sv.owners ? (
                <a href={sv.owners.href} target="_blank" rel="noopener noreferrer" className="btn-press inline-block rounded-full border border-brand/40 px-7 py-3 text-sm font-semibold text-brand hover:border-brand hover:bg-brand/5">
                  {sv.owners.cta} ↗
                </a>
              ) : null}
            </div>
          </div>
          <div className="rounded-2xl bg-paper p-6">
            <p className="text-sm text-neutral-500">{sv.from}</p>
            <ul className="mt-3 divide-y divide-neutral-200">
              {sv.times.map((row) => (
                <li key={row.to} className="flex items-baseline justify-between gap-6 py-3">
                  <span className="text-brand-dark">{row.to}</span>
                  <span className="font-mono text-xl font-semibold tabular-nums text-brand">{row.min} min</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-neutral-500">{sv.timeNote}</p>
            <p className="mt-2 text-xs text-neutral-500">{sv.limit}</p>
          </div>
        </div>
      </section>

      {/* ── 9. Il gruppo ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="eyebrow">{t("groupRouting.eyebrow")}</p>
        <h2 className="display-chapter mt-2 font-display text-brand-dark">{t("groupRouting.title")}</h2>
        <p className="mt-3 max-w-2xl text-neutral-600">{t("groupRouting.body")}</p>
        <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200" data-reveal-stagger>
          {ROUTING.map((r) => (
            <li key={r} className="flex items-center gap-3 py-4 text-lg font-medium text-brand-dark">
              <span className="text-brand">→</span>
              {t(`groupRouting.${r}`)}
            </li>
          ))}
        </ul>
        <Link href="/gruppo" className="mt-6 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline">
          {t("groupRouting.cta")} →
        </Link>
      </section>

      {/* ── 10. Valutazione ───────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-brand px-7 py-12 text-white sm:px-12">
          <div className="max-w-2xl" data-reveal="left">
            <p className="eyebrow text-white/80">{t("valuationCta.eyebrow")}</p>
            <h2 className="display-chapter mt-2 font-display text-white">{t("valuationCta.title")}</h2>
            <p className="mt-4 text-white/80">{t("valuationCta.body")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SellerCta label={t("valuationCta.cta")} className="btn-hero rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-dark" />
            <BuyerCta label={t("valuationCta.secondary")} fonteCta="Home · Parla con noi" className="btn-press rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10" />
          </div>
        </div>
      </section>
    </>
  );
}
