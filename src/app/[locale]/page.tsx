import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageAlternates, pageOpenGraph } from "@/lib/seo";
import { getProperties } from "@/lib/airtable";
import { isSold, zoneKey } from "@/lib/properties";
import { buildPropertyView } from "@/lib/propertyView";
import PropertyCard from "@/components/PropertyCard";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import Marquee from "@/components/Marquee";
import ClosureBanner from "@/components/ClosureBanner";
import AutoVideo from "@/components/AutoVideo";
import SegnoAiDiscreto from "@/components/SegnoAiDiscreto";
import { getVideoAi } from "@/lib/trasparenza";
import { chiaveFile, segnoVideoHome } from "@/lib/videoAi";
import { BrandMark } from "@/components/Logo";
import BuyerCta from "@/components/BuyerCta";
import SellerCta from "@/components/SellerCta";
import { sloveniaVillasStrings } from "@/content/sloveniaVillasStrings";
import BandaSoggiorni from "@/components/affitti/BandaSoggiorni";

const SELLER_CARDS = ["fast", "zeroFee", "simpleMandate", "marketing"] as const;

// I due video della home. Il percorso è anche la chiave nel registro dei video
// del CRM (`fv:<percorso>`, SPEC trasparenza §10).
//
// LA HOME NON PORTA PILLOLE AI (SPEC v1.3 §11.1, 02/10/2026: «bello, ma spesso
// troppo»): né sulle card né sui video. Un video animato o generato con l'AI
// (`ai_animato`, `ai_generato` nel registro) porta solo un segno DISCRETO,
// «video AI» in piccolo, con la didascalia del registro per i lettori di
// schermo; una copertina che mostra cose che non esistono, «simulazione» (lo
// decide buildPropertyView con `superficie: "home"`). La dichiarazione completa
// resta nella scheda. Il prebuild (check-etichette-ai.mjs) ferma una pillola
// che rientrasse qui.
const VIDEO_HERO = "/video/hero.mp4";
const VIDEO_STAGING = "/video/staging-mansarda.mp4";
const ROUTING = ["luxury", "fvg", "rent", "business", "slovenia"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: { absolute: t("home.title") },
    description: t("home.description"),
    alternates: pageAlternates(locale, "/"),
    openGraph: pageOpenGraph(locale, "/", t("home.ogTitle"), t("home.ogDescription")),
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sv = sloveniaVillasStrings(locale);
  const t = await getTranslations("home");
  const tProp = await getTranslations("property");
  const tZones = await getTranslations("zones");

  const [properties, videoAi] = await Promise.all([getProperties(), getVideoAi()]);
  // Il segno discreto dei video, dal registro del CRM. Lo staging il sito lo
  // sapeva già generato con l'AI (cab0265): senza la sua riga, il segno resta.
  const segnoHero = segnoVideoHome(videoAi.get(chiaveFile(VIDEO_HERO)), locale);
  const segnoStaging = segnoVideoHome(
    videoAi.get(chiaveFile(VIDEO_STAGING)) ?? { trattamento: "ai_generato", etichetta: null, didascalia: null },
    locale,
  );

  // La strip conserva l'ordine di vetrina deciso nel CRM. Il venduto non ci
  // sta: la sezione si chiama «In vendita ora» (e su triestevillas.com vale la
  // stessa regola del 08/09, «il venduto non sta in prima fila»). Resta in
  // /immobili col badge «Venduto».
  const reelItems = properties
    .filter((p) => p.coverPhoto && !isSold(p))
    .slice(0, 8)
    .map((p) => buildPropertyView(p, locale, tProp, tZones(zoneKey(p)), { superficie: "home" }));

  const heroWords = t("hero.titleKinetic").split(" ");

  return (
    <>
      {/* ── Hero — calm harbour light ─────────────────────────────── */}
      <section className="grad-paper-sea relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-6 pb-12 pt-36 sm:pb-16 sm:pt-44">
          <div data-reveal>
            <BrandMark className="h-12 w-auto sm:h-14" />
          </div>
          <p className="eyebrow mt-7" data-reveal>
            {t("hero.eyebrow")}
          </p>
          <h1 className="display-hero mt-3 max-w-3xl text-brand-dark">
            <span className="block">{t("hero.titleLine1")}</span>
            <span className="block text-brand">
              {heroWords.map((w, i) => (
                <span key={i} className="kinetic-line mr-[0.24em] last:mr-0">
                  <span
                    className="kinetic-word"
                    style={{ ["--word-delay" as string]: `${150 + i * 70}ms` }}
                  >
                    {w}
                  </span>
                </span>
              ))}
            </span>
            <span className="block text-neutral-500">{t("hero.titleLine2")}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-neutral-600 sm:text-lg" data-reveal>
            {t("hero.subtitle")}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <SellerCta
              label={t("hero.ctaPrimary")}
              className="btn-hero rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white"
            />
            <Link
              href="/immobili"
              transitionTypes={["nav-forward"]}
              className="btn-press rounded-full border border-brand/40 px-7 py-3 text-sm font-semibold text-brand hover:border-brand hover:bg-brand/5"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
          <figure className="relative mt-14 sm:mt-16" data-reveal>
            <div className="aspect-[16/9] overflow-hidden rounded-3xl border border-brand/15 shadow-[0_24px_70px_-30px_rgba(28,74,107,0.45)]">
              <AutoVideo
                src={VIDEO_HERO}
                poster="/video/hero-poster.jpg"
                ariaLabel={t("hero.videoAlt")}
                className="h-full w-full object-cover"
              />
            </div>
            {/* Il segno discreto (§11.1), sotto il video e a destra, sul fondo
                chiaro della pagina: niente sopra il film. */}
            {segnoHero && (
              <figcaption className="mt-2 text-right leading-none">
                <SegnoAiDiscreto dati={segnoHero} tono="pagina" />
              </figcaption>
            )}
          </figure>
        </div>

        {/* Promise strip — the four numbers */}
        <div className="relative mx-auto max-w-5xl px-6 pb-16">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-brand/15 bg-brand/15 sm:grid-cols-4">
            {(["valuation", "online", "mandate", "fee"] as const).map((k) => (
              <div key={k} className="bg-white/85 px-3 py-5 text-center backdrop-blur sm:px-5 sm:py-6">
                <p className="stat-num">{t(`promiseStrip.${k}`)}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-neutral-500">
            {t("promiseStrip.promoNote")}
          </p>
        </div>
      </section>

      <ClosureBanner />

      <div className="bg-brand-dark py-6 text-white/85">
        <Marquee
          items={[
            t("promiseStrip.fee"),
            t("hero.eyebrow"),
            t("promiseStrip.valuation"),
            t("promiseStrip.mandate"),
            t("promiseStrip.online"),
          ]}
        />
      </div>

      {/* ── Featured listings ─────────────────────────────────────── */}
      {reelItems.length > 0 ? (
        <section className="pt-16">
          <div className="mx-auto max-w-6xl px-6">
            <p className="eyebrow">{t("featured.eyebrow")}</p>
            <h2 className="display-chapter mt-2 text-brand-dark">{t("featured.title")}</h2>
            <p className="mt-3 max-w-2xl text-neutral-600">{t("featured.subtitle")}</p>
          </div>
          <FeaturedCarousel>
            {reelItems.map((v) => (
              <div key={v.slug} className="w-[78vw] shrink-0 snap-start sm:w-[38vw] lg:w-[28vw]">
                <PropertyCard view={v} photosComing={tProp("photosComing")} />
              </div>
            ))}
            <div className="flex w-[40vw] shrink-0 snap-start items-center justify-center sm:w-[24vw]">
              <Link
                href="/immobili"
                transitionTypes={["nav-forward"]}
                className="btn-press rounded-full border border-brand/40 px-8 py-4 text-sm font-semibold text-brand hover:border-brand hover:bg-brand/5"
              >
                {t("featured.viewAll")} →
              </Link>
            </div>
          </FeaturedCarousel>
        </section>
      ) : (
        <section className="mx-auto max-w-5xl px-6 pt-16">
          <p className="eyebrow">{t("featured.eyebrow")}</p>
          <h2 className="display-chapter mt-2 text-brand-dark">{t("featured.title")}</h2>
          <p className="mt-3 max-w-2xl text-neutral-600">{t("featured.empty")}</p>
        </section>
      )}

      {/* ── Soggiorni (07/10/2026): l'affitto, separato dalla vendita ─ */}
      <BandaSoggiorni locale={locale} />

      {/* ── Positioning ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div data-reveal>
          <p className="eyebrow">{t("positioning.eyebrow")}</p>
          <h2 className="display-chapter mt-2 max-w-3xl text-brand-dark">
            {t("positioning.title")}
          </h2>
        </div>
        <p className="mt-5 max-w-2xl text-lg text-neutral-600" data-reveal>
          {t("positioning.body")}
        </p>
        <p className="mt-4 max-w-2xl rounded-2xl border border-neutral-200 bg-paper px-5 py-4 text-sm text-neutral-600">
          {t("positioning.routingNote")}
        </p>
        <Link
          href="/gruppo"
          className="mt-6 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline"
        >
          {t("positioning.cta")} →
        </Link>
      </section>

      {/* ── Marketing video break ─────────────────────────────────── */}
      <section className="relative h-[62vh] min-h-[420px] max-h-[680px] overflow-hidden bg-brand-dark">
        <AutoVideo
          src={VIDEO_STAGING}
          poster="/video/staging-mansarda.jpg"
          ariaLabel={t("videoBreak.alt")}
          className="h-full w-full object-cover object-[center_58%]"
          lazy
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark from-8% via-brand-dark/85 via-25% to-transparent to-46% sm:from-10% sm:via-20% sm:to-36%" />
        {/* L'arredo di questo video è generato con l'AI (home staging virtuale,
            lo stesso file della home di triesteimmobiliare.com): in home basta
            il segno discreto «video AI» (§11.1), visibile sul poster e per tutta
            la durata — in basso a destra, nella fascia piena brand-dark sotto
            il titolo, dove si legge su qualunque fotogramma. Il resto lo dicono
            l'alt del video e, ai lettori di schermo, la didascalia del registro. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[1] sm:bottom-5">
          <div className="mx-auto flex max-w-6xl justify-end px-6">
            <SegnoAiDiscreto dati={segnoStaging} tono="scuro" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-6 pb-10 sm:pb-14" data-reveal>
            <p className="eyebrow text-sand">{t("videoBreak.eyebrow")}</p>
            <p className="mt-2 max-w-4xl text-balance text-2xl font-semibold leading-tight text-white sm:text-3xl">
              {t("videoBreak.title")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Seller value (job #1) ─────────────────────────────────── */}
      <section className="bg-brand-dark text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow text-sand">{t("sellerValue.eyebrow")}</p>
          <h2 className="display-chapter mt-2 max-w-3xl text-white">
            {t("sellerValue.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-white/70">{t("sellerValue.subtitle")}</p>
          <div
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
            data-reveal-stagger
          >
            {SELLER_CARDS.map((c) => (
              <div
                key={c}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/25"
              >
                <h3 className="text-lg font-semibold text-white">
                  {t(`sellerValue.${c}.title`)}
                </h3>
                <p className="mt-2 text-white/70">{t(`sellerValue.${c}.text`)}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/vendi"
              transitionTypes={["nav-forward"]}
              className="btn-hero inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-dark"
            >
              {t("sellerValue.cta")} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Group routing ─────────────────────────────────────────── */}
      <section className="border-y border-neutral-200 bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="eyebrow">{t("groupRouting.eyebrow")}</p>
          <h2 className="display-chapter mt-2 text-brand-dark">{t("groupRouting.title")}</h2>
          <p className="mt-3 max-w-2xl text-neutral-600">{t("groupRouting.body")}</p>
          <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200" data-reveal-stagger>
            {ROUTING.map((r) => (
              <li
                key={r}
                className="flex items-center gap-3 py-4 text-lg font-medium text-brand-dark"
              >
                <span className="text-brand">→</span>
                {t(`groupRouting.${r}`)}
              </li>
            ))}
          </ul>
          <Link
            href="/gruppo"
            className="mt-6 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline"
          >
            {t("groupRouting.cta")} →
          </Link>
        </div>
      </section>

      {/* ── SloveniaVillas (06/10/2026) ───────────────────────────── */}
      {/* Dello stesso gruppo, oltre il confine. Sobria in tutte le lingue; in
          sloveno parla anche ai proprietari. Il limite (oggi in Slovenia non
          mediamo) è scritto nella sezione, non in una nota a parte. */}
      <section id="sloveniavillas" className="mx-auto max-w-5xl px-6 pt-20">
        <div className="grid gap-8 rounded-3xl border border-neutral-200 bg-white px-7 py-10 sm:px-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <div data-reveal="left">
            <p className="eyebrow">{sv.eyebrow}</p>
            <h2 className="display-chapter mt-2 text-brand-dark">{sv.title}</h2>
            <p className="mt-4 max-w-2xl text-neutral-600">{sv.lead}</p>
            {sv.owners ? <p className="mt-4 max-w-2xl text-neutral-600">{sv.owners.text}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={sv.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero inline-block rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white"
              >
                {sv.cta} ↗
              </a>
              {sv.owners ? (
                <a
                  href={sv.owners.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press inline-block rounded-full border border-brand/40 px-7 py-3 text-sm font-semibold text-brand hover:border-brand hover:bg-brand/5"
                >
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
                  <span className="text-xl font-semibold tabular-nums text-brand">{row.min} min</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-neutral-500">{sv.timeNote}</p>
            <p className="mt-2 text-xs text-neutral-500">{sv.limit}</p>
          </div>
        </div>
      </section>

      {/* ── Valuation CTA ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-brand px-7 py-12 text-white sm:px-12">
          <div className="max-w-2xl" data-reveal="left">
            <p className="eyebrow text-white/80">{t("valuationCta.eyebrow")}</p>
            <h2 className="display-chapter mt-2 text-white">{t("valuationCta.title")}</h2>
            <p className="mt-4 text-white/80">{t("valuationCta.body")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SellerCta
              label={t("valuationCta.cta")}
              className="btn-hero rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-dark"
            />
            <BuyerCta
              label={t("valuationCta.secondary")}
              fonteCta="Home · Parla con noi"
              className="btn-press rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10"
            />
          </div>
        </div>
      </section>
    </>
  );
}
