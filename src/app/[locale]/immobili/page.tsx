import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ImmobiliBrowser from "@/components/ImmobiliBrowser";
import BuyerCta from "@/components/BuyerCta";
import CartaFvg, { COLORE_AREA, type PuntoCarta } from "@/components/carta/CartaFvg";
import { Link } from "@/i18n/navigation";
import { getProperties } from "@/lib/airtable";
import { isSold } from "@/lib/properties";
import { buildPropertyView, localizedTitle } from "@/lib/propertyView";
import { pageAlternates, pageOpenGraph } from "@/lib/seo";
import { AREE, NOMI_AREA, SLUG_AREA, type AreaId, type Lingua } from "@/lib/aree";
import { perArea, puntiGruppo, puntoDiCasa } from "@/lib/territorio";
import { ui } from "@/content/territorioUi";
import { formatPrice } from "@/lib/format";
import PonteTrieste from "@/components/PonteTrieste";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: { absolute: t("properties.title") },
    description: t("properties.description"),
    alternates: pageAlternates(locale, "/immobili"),
    openGraph: pageOpenGraph(locale, "/immobili", t("properties.ogTitle"), t("properties.ogDescription")),
  };
}

/* Il catalogo per AREA (07/10/2026), non più per il campo `zona` del CRM:
   src/lib/aree.ts decide, scripts/check-aree.mjs controlla. Vendita e affitto
   in elenchi separati; il venduto in coda alla sua area, col badge. */
export default async function ImmobiliPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: loc } = await params;
  setRequestLocale(loc);
  const locale = loc as Lingua;
  const tProp = await getTranslations("property");
  const tHelp = await getTranslations("immobili.buyerHelp");

  // I cluster PRIVATE sono esclusi alla fonte dal filtro Airtable.
  const properties = await getProperties();
  const vendite = properties.filter((p) => p.contratto !== "AFFITTO");
  const affitti = properties.filter((p) => p.contratto === "AFFITTO");

  const gruppi = (lista: typeof properties, prefisso: string) =>
    perArea(lista).map((g) => {
      const label = g.area ? NOMI_AREA[g.area][locale] : ui("altreZone", locale);
      const items = [...g.items].sort((a, b) => Number(isSold(a)) - Number(isSold(b)));
      return {
        code: `${prefisso}${g.area ?? "altre"}`,
        label,
        items: items.map((p) => buildPropertyView(p, locale, tProp, label)),
      };
    });

  const conteggi = Object.fromEntries(
    AREE.map((a) => {
      const n = vendite.filter((p) => !isSold(p) && perArea([p])[0]?.area === a).length;
      return [a, n ? `${n} ${ui("inVendita", locale)}` : ui("nessunaInVendita", locale)];
    }),
  ) as Record<AreaId, string>;

  const punti: PuntoCarta[] = [
    ...puntiGruppo(locale),
    ...vendite
      .filter((p) => !isSold(p))
      .flatMap((p) => {
        const pt = puntoDiCasa(p);
        if (!pt) return [];
        const prezzo = p.priceSale && !p.trattativaRiservata ? formatPrice(p.priceSale, locale) : ui("trattativaRiservata", locale);
        return [{ id: p.slug, tipo: "casa" as const, lat: pt.lat, lng: pt.lng, etichetta: p.comune ?? localizedTitle(p, locale), nota: prezzo, href: `/annuncio/${p.slug}`, approssimato: pt.approssimato }];
      }),
  ];

  const titoloAffitti = { it: "In affitto", en: "For rent", de: "Zur Miete", sl: "Za najem" }[locale];
  const titoloVendite = { it: "In vendita", en: "For sale", de: "Zum Verkauf", sl: "Naprodaj" }[locale];

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6">
        <header className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end" data-reveal>
          <div>
            <p className="eyebrow">FriuliVillas</p>
            <h1 className="display-chapter mt-3 font-display text-brand-dark">{ui("catalogoTitolo", locale)}</h1>
            <p className="mt-4 max-w-xl text-neutral-600">{ui("catalogoIntro", locale)}</p>
          </div>
          <div>
          <div className="overflow-hidden rounded-2xl border border-brand/15 bg-white">
            <CartaFvg locale={locale} notaApprossimato={ui("posizioneIndicativa", locale)} punti={punti} conteggi={conteggi} titolo={ui("cartaTitolo", locale)} />
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
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
        </header>

        <h2 className="mb-6 font-display text-2xl font-semibold text-brand-dark">{titoloVendite}</h2>
        <ImmobiliBrowser groups={gruppi(vendite, "")} photosComing={tProp("photosComing")} />

        {affitti.length ? (
          <>
            <h2 className="mb-6 mt-16 font-display text-2xl font-semibold text-brand-dark">{titoloAffitti}</h2>
            <ImmobiliBrowser groups={gruppi(affitti, "affitto-")} photosComing={tProp("photosComing")} />
          </>
        ) : null}
      </section>

      <PonteTrieste locale={locale} quante={3} />

      {/* Buyer nudge — "Ricerca libera" */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl" data-reveal="left">
            <p className="eyebrow">{tHelp("eyebrow")}</p>
            <h2 className="display-chapter mt-2 font-display text-brand-dark">{tHelp("title")}</h2>
            <p className="mt-3 text-neutral-600">{tHelp("text")}</p>
          </div>
          <BuyerCta label={tHelp("cta")} fonteCta="Immobili · Ricerca libera" className="btn-hero shrink-0 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white" />
        </div>
      </section>
    </>
  );
}
