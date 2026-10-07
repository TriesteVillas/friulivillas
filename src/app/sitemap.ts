import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/airtable";
import { routing } from "@/i18n/routing";
import { absUrl, HREFLANG, localizedPath, SITE_URL } from "@/lib/seo";
import { AREE, SLUG_AREA, type Lingua } from "@/lib/aree";

// I codici hreflang vengono da seo.ts e non sono ricopiati qui: la sitemap e
// i <link rel="alternate"> delle pagine devono dire la stessa cosa, e con due
// copie della mappa la quarta lingua (sl, 2026-10-01) andava aggiunta due volte.

// hreflang alternates for a path across all locales (+ x-default → it).
function languagesFor(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[HREFLANG[l]] = absUrl(l, path);
  languages["x-default"] = absUrl("it", path);
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getProperties();

  // «/investimenti» NON c'è, ed era in elenco fino al 2026-10-01: è una pagina
  // del gemello TriesteImmobiliare che qui non è mai esistita, e la sitemap la
  // dichiarava in tre lingue mentre rispondeva 404. Una pagina si aggiunge qui
  // solo quando esiste in src/app/[locale].
  const staticPaths = ["/", "/immobili", "/vendi", "/gruppo", "/contatti", "/privacy"];
  const entries: MetadataRoute.Sitemap = [];

  // lastModified solo dove esiste una data vera: Google lo usa se è
  // «consistently and verifiably accurate», altrimenti impara a ignorarlo.
  // Le pagine fisse non ne hanno una → meglio nessun lastmod del timestamp
  // di build.
  for (const path of staticPaths) {
    const languages = languagesFor(path);
    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}${localizedPath(locale, path) === "/" ? "" : localizedPath(locale, path)}`,
        changeFrequency: path === "/" || path === "/immobili" ? "daily" : "monthly",
        priority: path === "/" ? 1 : path === "/vendi" ? 0.9 : path === "/immobili" ? 0.9 : 0.6,
        alternates: { languages },
      });
    }
  }

  // Le pagine d'area (07/10/2026): lo slug cambia con la lingua, quindi gli
  // alternates si costruiscono da SLUG_AREA e non sostituendo il prefisso.
  for (const a of AREE) {
    const languages: Record<string, string> = {};
    for (const l of routing.locales) languages[HREFLANG[l]] = absUrl(l, `/area/${SLUG_AREA[a][l as Lingua]}`);
    languages["x-default"] = absUrl("it", `/area/${SLUG_AREA[a].it}`);
    for (const locale of routing.locales) {
      entries.push({
        url: absUrl(locale, `/area/${SLUG_AREA[a][locale as Lingua]}`),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages },
      });
    }
  }

  for (const p of properties) {
    const path = `/annuncio/${p.slug}`;
    const languages = languagesFor(path);
    for (const locale of routing.locales) {
      entries.push({
        url: absUrl(locale, path),
        // onlineDa (la messa online) è l'unica data vera che il record porta.
        ...(p.onlineDa ? { lastModified: new Date(p.onlineDa) } : {}),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
