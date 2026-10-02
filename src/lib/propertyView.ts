import { formatPrice } from "./format";
import { photoSrc } from "./photoSrc";
import { etichettaAi, haEtichetta, segnoHome } from "./fotoAi";
import type { Property } from "./properties";

export type BadgeVariant = "default" | "private" | "cantiere" | "recent" | "featured";
export type Badge = { label: string; variant: BadgeVariant };

// Plain, serializable display model for a property card. Built on the server
// (needs locale + translations) and handed to client components as-is.
export type PropertyView = {
  slug: string;
  title: string;
  zona: string | null;
  place: string;
  priceLabel: string;
  badge: Badge;
  clusterBadge: Badge | null;
  recentBadge?: Badge | null;
  featuredBadge?: Badge | null;
  meta: string;
  cover: { url: string; alt: string } | null;
  // Sigla «AI» sulla copertina della card (SPEC §5.1): null se la copertina non
  // è passata da un modello generativo, se lo è solo nella luce e nei colori
  // (SPEC §11.1), se non lo sappiamo — e sempre nella HOME (§11.1: nessuna
  // pillola AI in home).
  coverAi: { testo: string; aria: string } | null;
  // Solo nella home: il segno DISCRETO (testo piccolo, non la pillola) sulla
  // copertina che mostra cose che non esistono — «simulazione», o «Rendering»
  // per il render di progetto (SPEC §11.1). null altrove e su ogni altra foto.
  coverSegno: { testo: string; aria: string } | null;
  // Cover + up to 8 top photos (9 total), for the in-card photo slider.
  gallery: { url: string; alt: string }[];
};

type Translate = (key: string, values?: Record<string, string | number>) => string;

// Titolo pubblico nella lingua del visitatore: il nome EN/DE/SL quando c'è,
// altrimenti quello italiano. Mai una stringa vuota: `title` è sempre
// valorizzato (mapRecord). Lo sloveno passa dall'inglese prima dell'italiano:
// quando il testo sloveno manca, il ripiego è la lingua internazionale (stessa
// scelta di triestevillas.com).
export function localizedTitle(p: Property, locale: string): string {
  if (locale === "de") return p.titleDe ?? p.title;
  if (locale === "en") return p.titleEn ?? p.title;
  if (locale === "sl") return p.titleSl ?? p.titleEn ?? p.title;
  return p.title;
}

// Descrizione nella lingua del visitatore. La catena di fallback è esplicita e
// finisce SEMPRE sull'italiano — meglio una scheda in italiano che una vuota:
//   EN → descrizione_TSI_EN_# → descrizione_TSI_# → descrizione
//   DE → descrizione_TSI_DE_# → descrizione_TSI_# → descrizione
//   SL → descrizione_tsi_sl (vetrina CRM) → descrizione_TSI_EN_# → descrizione_TSI_# → descrizione
//   IT →                        descrizione_TSI_# → descrizione
// ⚠️ Per lo sloveno si legge SOLO la variante TSI, mai `descrizione_sl` di
// triestevillas.com: le varianti TSI esistono proprio per non pubblicare su due
// siti del gruppo lo stesso testo (duplicate content fra gemelli). Finché il
// CRM non scrive la variante TSI slovena, /sl mostra quella inglese.
// (gli ultimi due gradini sono già risolti in `p.description` da mapRecord).
export function localizedDescription(p: Property, locale: string): string | null {
  return translatedDescription(p, locale) ?? p.description;
}

// SOLO la traduzione vera, senza ripiego sull'italiano: null quando in questa
// lingua non abbiamo ancora scritto niente. Serve a chi deve DISTINGUERE i due
// casi — la meta description, che con una traduzione assente preferisce
// l'one-liner curato (italiano ma corto e scritto per la SERP) al primo pezzo
// della descrizione italiana tagliato a metà. Vedi generateMetadata.
export function translatedDescription(p: Property, locale: string): string | null {
  if (locale === "de") return p.descriptionDe;
  if (locale === "en") return p.descriptionEn;
  if (locale === "sl") return p.descriptionSl ?? p.descriptionEn;
  return null;
}

// Lingua in cui è DAVVERO scritta la descrizione che la pagina mostra, per il
// `lang` del blocco: su /sl, finché manca lo sloveno, il testo è inglese, e
// dichiararlo sloveno farebbe leggere a un sintetizzatore vocale l'inglese con
// la pronuncia slovena (e direbbe a un motore di ricerca una cosa falsa).
export function descriptionLang(p: Property, locale: string): string {
  if (locale === "de" && p.descriptionDe) return "de";
  if (locale === "en" && p.descriptionEn) return "en";
  if (locale === "sl") {
    if (p.descriptionSl) return "sl";
    if (p.descriptionEn) return "en";
  }
  return "it";
}

// Taglio per la meta description: mai a metà parola e con l'ellissi, perché
// quel testo finisce nello snippet Google e nell'OpenGraph. Le descrizioni sono
// lunghe 800-1500 caratteri: senza questo, `slice(0, 150)` tronca dove capita.
export function metaClamp(s: string | null | undefined, max = 160): string | null {
  const t = s?.replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[ ,;:.\-–—]+$/, "") + "…";
}

// Contract badge (always shown): In vendita / In affitto.
export function contractBadge(p: Property, t: Translate): Badge {
  return {
    label: p.contratto === "AFFITTO" ? t("forRent") : t("forSale"),
    variant: "default",
  };
}

// Cluster banner, shown IN ADDITION to the contract badge, only for the two
// special clusters. Null otherwise.
export function clusterBadge(p: Property, t: Translate): Badge | null {
  const cluster = p.cluster?.toUpperCase().trim();
  if (cluster === "PRIVATE") return { label: t("badgePrivate"), variant: "private" };
  if (cluster === "CANTIERI") return { label: t("badgeNewBuild"), variant: "cantiere" };
  return null;
}

// Price label: a reserved-negotiation listing hides the figure.
export function priceLabel(p: Property, locale: string, t: Translate): string {
  if (p.trattativaRiservata) return t("priceReserved");
  if (p.contratto === "AFFITTO") {
    return p.priceRent
      ? `${formatPrice(p.priceRent, locale)}${t("perMonth")}`
      : t("priceOnRequest");
  }
  return p.priceSale ? formatPrice(p.priceSale, locale) : t("priceOnRequest");
}

// «6 locali» nella riga della card. Il sostantivo segue il numero con le regole
// plurali della lingua (`roomsUnit`, ICU): in sloveno sono quattro forme —
// 1 soba, 2 sobi, 3–4 sobe, 5+ sob — e incollare l'etichetta «Sobe» dopo il
// numero scriveva «6 sobe». Il campo `locali` di Airtable è testo: «4», «10»
// o «>5»; si conta sull'ultimo numero, quindi «>5» prende la forma di 5.
// Senza cifre (un valore che non è un conteggio) si torna alla forma di prima.
function roomsMeta(rooms: string, t: Translate): string {
  const n = rooms.match(/(\d+)\s*$/)?.[1];
  return n
    ? `${rooms} ${t("roomsUnit", { count: Number(n) })}`
    : `${rooms} ${t("rooms").toLowerCase()}`;
}

export function buildPropertyView(
  p: Property,
  locale: string,
  t: Translate,
  zonaLabel: string | null,
  // `superficie: "home"` per le card della home (SPEC §11.1): niente pillola,
  // solo il segno discreto sulle simulazioni. Il prebuild controlla che la
  // home lo passi sempre (scripts/check-etichette-ai.mjs).
  opzioni: { superficie?: "home" } = {},
): PropertyView {
  const onlineDays = p.onlineDa
    ? Math.max(0, Math.floor((Date.now() - Date.parse(p.onlineDa)) / 86400000))
    : null;
  const meta = [
    p.tipologia,
    p.mq ? t("sqm", { value: p.mq }) : null,
    p.rooms ? roomsMeta(p.rooms, t) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Cover + top photos (deduped by filename), max 9 (cover + top 8), for the
  // card slider.
  const cardTitle = localizedTitle(p, locale);
  const gallerySeen = new Set<string>();
  // La Private Collection passa da qui (src/app/[locale]/private/page.tsx), e il
  // proxy /foto risolve SOLO gli immobili pubblici: un id privato là dentro dà
  // 404. Quindi i record PRIVATE restano sulla url firmata di Airtable — la
  // guardia non è teorica, senza si romperebbero le foto della collezione.
  const isPrivate = p.cluster?.toUpperCase().trim() === "PRIVATE";
  const gallery: { url: string; alt: string }[] = [];
  for (const ph of [p.coverPhoto, ...p.topPhotos]) {
    if (!ph) continue;
    const key = ph.filename ?? ph.url;
    if (gallerySeen.has(key)) continue;
    gallerySeen.add(key);
    gallery.push({ url: isPrivate ? ph.thumb : photoSrc(ph, 800), alt: cardTitle });
    if (gallery.length >= 9) break;
  }

  const inHome = opzioni.superficie === "home";
  const coverAi =
    !inHome && haEtichetta(p.coverPhoto?.ai) ? etichettaAi(p.coverPhoto!.ai!, (k) => t(`aiFoto.${k}`)) : null;
  const segno = inHome ? segnoHome(p.coverPhoto?.ai) : null;
  const coverSegno = segno
    ? {
        testo: t(`aiFoto.homeSign.${segno}`),
        aria: segno === "rendering" ? t("aiFoto.tag.rendering") : t("aiFoto.homeSign.simulazioneAria"),
      }
    : null;

  return {
    slug: p.slug,
    title: localizedTitle(p, locale),
    gallery,
    coverAi: coverAi ? { testo: coverAi.compatta, aria: coverAi.aria } : null,
    coverSegno,
    zona: p.zona,
    place: [zonaLabel, p.comune].filter(Boolean).join(" · "),
    priceLabel: priceLabel(p, locale, t),
    badge: contractBadge(p, t),
    clusterBadge: clusterBadge(p, t),
    recentBadge:
      onlineDays !== null && onlineDays <= 30
        ? { label: t("onlineDays", { count: onlineDays }), variant: "recent" }
        : null,
    featuredBadge: p.inEvidenza
      ? { label: t("badgeFeatured"), variant: "featured" }
      : null,
    meta,
    // Le card passano dal proxy /foto (WebP alla larghezza giusta, url stabile);
    // solo i record privati restano sulla rendition firmata di Airtable.
    // L'alt segue il titolo localizzato: `coverPhoto.alt` nasce dal titolo italiano
    // in mapRecord (che non conosce il locale), e su /en o /de sarebbe fuori lingua.
    cover: p.coverPhoto
      ? { url: isPrivate ? p.coverPhoto.thumb : photoSrc(p.coverPhoto, 800), alt: cardTitle }
      : null,
  };
}
