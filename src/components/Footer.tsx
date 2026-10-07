import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Logo from "./Logo";
import CookiePrefsButton from "./CookiePrefsButton";
import { telHref } from "@/lib/format";

// FriuliVillas non ha profili social propri: la lista è vuota di proposito, e
// il blocco "Seguici" si spegne da sé quando non c'è nulla da seguire. Mettere
// qui i canali di TriesteVillas dichiarerebbe come suoi profili che non lo sono.
const SOCIALS: Array<{ name: string; href: string; path: string }> = [];

const NAV = [
  { href: "/", key: "home" },
  { href: "/immobili", key: "properties" },
  { href: "/vendi", key: "sell" },
  { href: "/gruppo", key: "group" },
  { href: "/contatti", key: "contact" },
] as const;

type GroupSiteLocale = "it" | "en" | "de" | "sl";
// URL rifatti il 06/10/2026 (aggiunta SloveniaVillas): ognuno risponde 200
// senza rimandi. triestevillas.com è canonico senza www (www → 308), e
// lignanovillas.com risponde a /it e /de senza barra finale (con barra → 308);
// TriesteAffitti ha /en, /de e /sl veri.
// SappadaVillas (online dal 07/10/2026): italiano sulla radice, poi /en, /de,
// /sl; verificati 200 quel giorno.
const GROUP_SITES = {
  it: {
    tsv: "https://triestevillas.com/",
    tsi: "https://www.triesteimmobiliare.com/",
    affitti: "https://www.triesteaffitti.com/",
    lignano: "https://www.lignanovillas.com/it",
    sappada: "https://sappadavillas.com/",
    slovenia: "https://sloveniavillas.com/it",
  },
  en: {
    tsv: "https://triestevillas.com/en",
    tsi: "https://www.triesteimmobiliare.com/en",
    affitti: "https://www.triesteaffitti.com/en",
    lignano: "https://www.lignanovillas.com/",
    sappada: "https://sappadavillas.com/en",
    slovenia: "https://sloveniavillas.com/",
  },
  de: {
    tsv: "https://triestevillas.com/de",
    tsi: "https://www.triesteimmobiliare.com/de",
    affitti: "https://www.triesteaffitti.com/de",
    lignano: "https://www.lignanovillas.com/de",
    sappada: "https://sappadavillas.com/de",
    slovenia: "https://sloveniavillas.com/de",
  },
  // Sloveno: dal 06/10/2026 tutti i siti del gruppo hanno /sl (verificato 200
  // uno per uno quel giorno); fino ad allora TSI, TA e LV ripiegavano
  // sull'inglese (decisione D7 del progetto sloveno).
  sl: {
    tsv: "https://triestevillas.com/sl",
    tsi: "https://www.triesteimmobiliare.com/sl",
    affitti: "https://www.triesteaffitti.com/sl",
    lignano: "https://www.lignanovillas.com/sl",
    sappada: "https://sappadavillas.com/sl",
    slovenia: "https://sloveniavillas.com/sl",
  },
} as const satisfies Record<GroupSiteLocale, Record<string, string>>;

// Sibling brands (the group ecosystem). TriesteBusiness routes to /gruppo because it has no website.
const GROUP = [
  { label: "TriesteVillas", site: "tsv", external: true },
  { label: "TriesteImmobiliare", site: "tsi", external: true },
  { label: "TriesteAffitti", site: "affitti", external: true },
  { label: "LignanoVillas", site: "lignano", external: true },
  { label: "SappadaVillas", site: "sappada", external: true },
  { label: "SloveniaVillas", site: "slovenia", external: true },
  { label: "TriesteBusiness", href: "/gruppo", external: false },
] as const;

export default async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tContact = await getTranslations("contact");
  const tLegal = await getTranslations("group.legal");
  const year = new Date().getFullYear();
  const phone = tContact("phone");
  const groupSites = GROUP_SITES[locale as GroupSiteLocale] ?? GROUP_SITES.it;

  return (
    <footer className="mt-16 bg-brand-dark text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="max-w-xs text-white/70">{t("tagline")}</p>
          <div className="flex items-center gap-3 pt-1">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <nav className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-white/50">
            {t("sitemapTitle")}
          </h2>
          <ul className="space-y-2 text-white/70">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="transition-colors hover:text-white">
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-white/50">
            {t("groupTitle")}
          </h2>
          <ul className="space-y-2 text-white/70">
            {GROUP.map((b) => {
              if (b.external) {
                return (
                  <li key={b.label}>
                    <a
                      href={groupSites[b.site]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      {b.label} ↗
                    </a>
                  </li>
                );
              }

              return (
                <li key={b.label}>
                  <Link href={b.href} className="transition-colors hover:text-white">
                    {b.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-white/50">
            {t("contactTitle")}
          </h2>
          <dl className="space-y-2 text-white/70">
            <div>
              <dt className="sr-only">{tContact("emailLabel")}</dt>
              <dd>
                <a href={`mailto:${tContact("email")}`} className="transition-colors hover:text-white">
                  {tContact("email")}
                </a>
              </dd>
            </div>
            <div>
              <dt className="sr-only">{tContact("phoneLabel")}</dt>
              <dd>
                <a href={telHref(phone)} className="transition-colors hover:text-white">
                  {phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="sr-only">{tContact("officeLabel")}</dt>
              <dd>{tContact("office")}</dd>
            </div>
            <div>
              <dt className="sr-only">{tContact("hoursLabel")}</dt>
              <dd>{tContact("hours")}</dd>
            </div>
          </dl>
          <div className="space-y-0.5 pt-2 text-xs text-white/70">
            <p className="font-medium text-white/70">{tLegal("company")}</p>
            <p>{tLegal("address")}</p>
            <p>{tLegal("vat")}</p>
            <p>{tLegal("rea")}</p>
            <p>{tLegal("capital")}</p>
            <p>
              PEC{" "}
              <a href={`mailto:${tLegal("pec")}`} className="transition-colors hover:text-white/80">
                {tLegal("pec")}
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} FriuliVillas · {t("poweredBy")}. {t("rights")}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white/70">
              {t("privacy")}
            </Link>
            <CookiePrefsButton className="transition-colors hover:text-white/70" />
            <span className="text-white/75">{t("appointmentNote")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
