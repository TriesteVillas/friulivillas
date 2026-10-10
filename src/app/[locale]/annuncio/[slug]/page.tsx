import type { Metadata } from "next";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProperties, getProperty } from "@/lib/airtable";
import { isSold } from "@/lib/properties";
import { NOMI_AREA, SLUG_AREA, type Lingua } from "@/lib/aree";
import { areaDiCasa, DATA_MISURA, durata, minuti, NOMI_ORIGINE, puntoDeiTempi } from "@/lib/territorio";
import { dataLunga, ui } from "@/content/territorioUi";
import { scegliSimili } from "@/lib/simili";
import { presenza, soloSiNo, statoDotazioni, vociSchema } from "@/lib/dotazioni";
import PropertyCharacteristics, {
  type Characteristic,
} from "@/components/PropertyCharacteristics";
import PropertyMap from "@/components/PropertyMap";
import PhotoGallery from "@/components/PhotoGallery";
import PhotoImg from "@/components/PhotoImg";
import { photoOgSrc, photoSrc, photoSrcSet } from "@/lib/photoSrc";
import Planimetrie from "@/components/Planimetrie";
import PropertyBadge from "@/components/PropertyBadge";
import PropertyCard from "@/components/PropertyCard";
import StickyNav from "@/components/StickyNav";
import Scene from "@/components/motion/Scene";
import LeadForm from "@/components/LeadForm";
import VisitForm from "@/components/VisitForm";
import TourFrame from "@/components/TourFrame";
import TrackViewItem from "@/components/TrackViewItem";
import {
  buildPropertyView,
  contractBadge,
  clusterBadge,
  descriptionLang,
  localizedDescription,
  localizedTitle,
  metaClamp,
  priceLabel,
  soldBadge,
  translatedDescription,
} from "@/lib/propertyView";
import { pageAlternates, pageOpenGraph, listingJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { formatPrice } from "@/lib/format";
import TaxBox from "@/components/TaxBox";
import AiTag from "@/components/AiTag";
import SfondoVideo from "@/components/media/SfondoVideo";
import EtichettaVideo from "@/components/EtichettaVideo";
import { getVideoAi } from "@/lib/trasparenza";
import { chiaveFile, chiaveYoutube, datiEtichettaVideo, didascaliaVideo } from "@/lib/videoAi";
import {
  contaFotoAi,
  eStile,
  etichettaAi,
  haEtichetta,
  notaSenzaTitolo,
  rigaRiepilogo,
  serieCompleta,
  serieHaAi,
  testoIn,
  togliNotaAi,
} from "@/lib/fotoAi";
import { paginaAiDelGruppo } from "@/lib/paginaAiGruppo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://friulivillas.com";

// La pagina «AI a carte scoperte» (/ai, SPEC §6) su friulivillas.com non c'è
// ancora, e per la SPEC §9.2 resta in anteprima finché la rilettura legale non
// chiude: fino ad allora il riepilogo #foto-ai non la linka (sarebbe un 404
// proprio nella sezione sulla trasparenza). Si accende qui quando la rotta
// esiste in src/app/[locale]/ai. Nel frattempo il riepilogo linka la pagina
// del gruppo su triestevillas.com, solo se risponde 200 (lib/paginaAiGruppo.ts).
const PAGINA_AI_ONLINE = false;

// Ladder dell'hero a tutto schermo. Il fallback resta 2000 px per i desktop
// larghi; il ladder esiste perché con sizes="100vw" un telefono ne serve 780 e
// senza si portava a casa comunque i 2000.
const HERO_WIDTHS = [800, 1200, 1600, 2000] as const;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  const properties = await getProperties();
  return routing.locales.flatMap((locale) =>
    properties.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getProperty(slug);
  if (!property) return {};
  // Titolo e meta description nella lingua della pagina.
  //
  // ORDINE, e conta: su /en, /de e /sl viene prima la descrizione TRADOTTA (così la
  // SERP non mostra italiano a chi cerca in inglese, tedesco o sloveno), ma solo se
  // esiste DAVVERO — `translatedDescription`, non `localizedDescription`, che
  // ripiegherebbe sull'italiano e ce lo farebbe preferire all'one-liner.
  // Quando la traduzione manca il gradino giusto è l'one-liner: è italiano come
  // il ripiego, ma è corto, scritto a mano e pensato per lo snippet, invece del
  // primo pezzo di una descrizione da 1000 caratteri tagliata a metà frase.
  //   en/de → descrizione tradotta → one-liner → descrizione italiana
  //   sl    → slovena, o inglese finché manca → one-liner → descrizione italiana
  //   it    →                        one-liner → descrizione italiana
  const title = localizedTitle(property, locale);
  const description =
    metaClamp(translatedDescription(property, locale)) ??
    property.oneliner ??
    metaClamp(property.description) ??
    "FriuliVillas";
  return {
    title: { absolute: `${title} · FriuliVillas` },
    description,
    alternates: pageAlternates(locale, `/annuncio/${slug}`),
    openGraph: pageOpenGraph(
      locale,
      `/annuncio/${slug}`,
      title,
      description,
      // Copertina con etichetta AI: l'anteprima social è la versione del proxy
      // con la sigla «AI» stampata sopra (un'anteprima non mostra le etichette
      // HTML della pagina) e la marcatura IPTC. Le altre restano com'erano.
      (property.coverPhoto && photoOgSrc(property.coverPhoto)) ?? property.coverPhoto?.url,
    ),
  };
}

// Split a description into readable paragraphs. Honours author-made line breaks
// (blank lines or single newlines); for a single wall of text, groups sentences
// into chunks of ~3. Sentence split only on punctuation + space + capital, so
// "10.200,00" / "ecc." don't cause false breaks. Le maiuscole slovene (Č Š Ž,
// fuori dall'intervallo À-Ý) e la virgoletta d'apertura slovena » contano come
// inizio di frase: senza, un testo sloveno restava un blocco unico ogni volta
// che la frase successiva cominciava con una di loro.
function toParagraphs(text: string): string[] {
  const byBreak = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (byBreak.length > 1) return byBreak;
  const sentences = text
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÝČŠŽĆĐ"«»])/)
    .map((s) => s.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    chunks.push(sentences.slice(i, i + 3).join(" "));
  }
  return chunks.length ? chunks : [text];
}

// Extract 11-char YouTube ids from the common URL shapes.
function youtubeIds(urls: string[]): string[] {
  return urls
    .map(
      (u) =>
        u.match(
          /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/,
        )?.[1],
    )
    .filter((x): x is string => Boolean(x));
}

export default async function PropertyPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const all = await getProperties();
  const property = all.find((p) => p.slug === slug);
  // Old-site /annuncio/<slug> links still indexed by Google land here:
  // send them to the listing index instead of a dead end.
  if (!property) {
    redirect({ href: "/immobili", locale });
    notFound(); // unreachable — narrows the type (redirect isn't typed never)
  }

  const t = await getTranslations("property");
  const tNav = await getTranslations("nav");
  // L'area del territorio (src/lib/aree.ts), non il campo `zona` del CRM: fino al
  // 07/10 il codice «FVG» finiva dentro l'indirizzo («…, FVG, Cervignano»).
  const lingua = locale as Lingua;
  const area = areaDiCasa(property);
  const sede = puntoDeiTempi(property);
  // "Prenota una visita" vive nel namespace lead (usato da VisitForm), non property.
  const tLead = await getTranslations("lead");
  const fsLabel =
    ({ it: "Schermo intero", en: "Fullscreen", de: "Vollbild", sl: "Celozaslonski način" } as Record<
      string,
      string
    >)[locale] ?? "Fullscreen";
  // Quattro scelte, mostrate tre o quattro secondo la griglia (v. la sezione
  // «simili» in fondo): la regola sta in lib/simili.ts, gemello di TSV.
  const similar = scegliSimili(property, all, 4);
  const place = [property.via, property.comune]
    .filter(Boolean)
    .join(", ");
  const hasLocation = property.lat != null && property.lng != null;
  const ytIds = youtubeIds(property.videos);

  // Titolo e descrizione nella lingua del visitatore, con ritorno all'italiano
  // quando la traduzione non è ancora stata scritta (vedi localizedDescription).
  const title = localizedTitle(property, locale);
  // Trasparenza AI (SPEC §5.3-5.4): se la vista del CRM porta la nota, la nota
  // sta nel riepilogo #foto-ai in fondo, e il suo doppione in coda alla
  // descrizione si toglie. Senza nota la descrizione resta identica.
  const tAi = await getTranslations("property.aiFoto");
  const notaAi = testoIn(property.trasparenza?.nota, locale);
  const descrizioneIntera = localizedDescription(property, locale);
  const description =
    descrizioneIntera && notaAi ? togliNotaAi(descrizioneIntera) || null : descrizioneIntera;
  // I conteggi del riepilogo si fanno sulle foto che la pagina mostra
  // (copertina + top 8 + galleria, senza doppioni). «Ritoccate con l'AI» sono le
  // foto con una riga AI del CRM più le sigle messe dal sito; i render senza AI
  // si contano a parte (fotoAi.contaFotoAi).
  const contiAi = contaFotoAi([
    ...(property.coverPhoto ? [property.coverPhoto] : []),
    ...property.topPhotos,
    ...property.photos,
  ]);
  // Il riepilogo §11.2: visibile solo la riga calcolata dai conteggi (mai
  // scritta a mano) e la chiusura; nota, conteggi per tipo e link dentro il
  // comando che si apre. Lo stile (sola luce) qui resta dichiarato, anche se
  // sulle foto non ha etichetta.
  const righeAi = rigaRiepilogo(contiAi).map((x) => tAi(x.chiave, x.valori));
  const heroFoto = property.coverPhoto ?? property.photos[0] ?? null;
  // «Vedi tutte le N foto»: con dati AI il lightbox scorre anche copertina e
  // top 8 (PhotoGallery → serieCompleta), e N deve contare la stessa serie.
  const fotoNelLightbox = serieHaAi(heroFoto, property.topPhotos, property.photos)
    ? serieCompleta(heroFoto, property.topPhotos, property.photos).length
    : property.photos.length;
  const heroAi = haEtichetta(heroFoto?.ai) ? etichettaAi(heroFoto!.ai!, (k) => tAi(k)) : null;
  // Video di testata mp4 (registro content/annunciVideo.ts, 01/10/2026): se
  // l'immobile ne ha uno, sale sulla copertina dell'hero (SfondoVideo); lo
  // YouTube resta nella sezione #video. Senza, l'hero è quello di sempre.
  const heroVideo = property.heroVideo ?? null;
  // Etichette e didascalie dei video dal registro del CRM (SPEC trasparenza
  // §10), per chiave: `fv:<percorso del file 1080>` per il video di testata (il
  // 720p è lo stesso filmato), `youtube:<id>` per la sezione #video. Video senza
  // riga: nessuna etichetta — tranne il video di testata già marcato `ai` nel
  // registro del sito, che tiene la sua frase (SfondoVideo).
  const videoAi = await getVideoAi();
  const rigaTestata = heroVideo ? (videoAi.get(chiaveFile(heroVideo.mp4)) ?? null) : null;
  const etichettaTestata = datiEtichettaVideo(rigaTestata, locale);
  const didascaliaTestata = didascaliaVideo(rigaTestata, locale);
  const ytVideo = ytIds.map((id) => {
    const riga = videoAi.get(chiaveYoutube(id));
    return { id, etichetta: datiEtichettaVideo(riga, locale), didascalia: didascaliaVideo(riga, locale) };
  });
  // Il video di testata dichiarato nel riepilogo (dentro il comando che si
  // apre): nell'hero c'è posto per la sua etichetta, non per la didascalia.
  const videoTestataNelRiepilogo = Boolean(etichettaTestata && didascaliaTestata);
  const riepilogoAi =
    notaAi !== null ||
    contiAi.luce + contiAi.segnalate + contiAi.rendering > 0 ||
    videoTestataNelRiepilogo;
  // Senza foto da contare ma col video di testata dichiarato, la riga dice
  // del video (altrimenti restavano solo titolo e chiusura: review del 02/10).
  const rigaAi = (righeAi.length ? righeAi : videoTestataNelRiepilogo ? [tAi("summaryLineVideoOnly")] : []).join(" ");
  // La nota del CRM dentro il comando che si apre: senza la frase-titolo che
  // ripete il titolo del riepilogo, e a paragrafi anche quando il CRM la manda
  // in un blocco unico (Villa Ronchi: 2.565 caratteri in un paragrafo).
  const paragrafiNota = notaAi ? toParagraphs(notaSenzaTitolo(notaAi.testo)) : [];
  // Il link in fondo al riepilogo: la pagina /ai di questo sito quando ci sarà;
  // fino ad allora quella del gruppo su triestevillas.com, se risponde 200.
  const linkAiGruppo = riepilogoAi && !PAGINA_AI_ONLINE ? await paginaAiDelGruppo(locale) : null;

  // Box costi indicativi (solo vendita), col toggle prima/seconda casa —
  // stesso impianto del gemello TriesteVillas: imposta dallo scenario, fee 4%
  // netta con tag "+ IVA", condominio ordinario, ILIA (esente prima casa),
  // TARI viva col selettore occupanti. Ogni cifra è preceduta da ≈.
  const isSale = property.contratto !== "AFFITTO";
  const ca = (n: number) => `≈ ${formatPrice(n, locale)}`;
  const feeNet = isSale && property.priceSale ? property.priceSale * 0.04 : null;
  const condoAnnuo = property.condoMensile != null ? property.condoMensile * 12 : null;
  // ⚠️ La card TARI vive di tariffe del COMUNE DI TRIESTE (TaxBox: Delibera
  // Consiliare n.18/2026). Su TriesteVillas e TriesteImmobiliare è sempre vera,
  // perché vendono lì; qui il perimetro è l'intera regione, e la stessa card su
  // una casa a Udine o a Grado stamperebbe un importo in euro semplicemente
  // sbagliato — con tanto di link all'esattore triestino. `mqCalp: null` spegne
  // la card (vedi TaxBox), quindi dove non siamo a Trieste non si mostra nulla:
  // meglio un dato assente che un dato preciso e falso.
  // Le altre righe restano: imposte e ILIA arrivano già calcolate da Airtable
  // per quello specifico immobile, e non sono ricavate da tariffe cittadine.
  const isTrieste = (property.comune ?? "").trim().toLowerCase() === "trieste";
  const taxData = isSale
    ? {
        primaImposta: property.impostePrima != null ? ca(property.impostePrima) : null,
        secondaImposta: property.imposteSeconda != null ? ca(property.imposteSeconda) : null,
        commission: feeNet != null ? ca(feeNet) : null,
        condo: condoAnnuo != null ? ca(condoAnnuo) : null,
        ilia: property.iliaAnnua != null ? ca(property.iliaAnnua) : null,
        mqCalp: isTrieste && property.mq != null ? Math.round(property.mq * 0.8) : null,
      }
    : null;
  const hasCosts =
    taxData != null &&
    Boolean(
      taxData.primaImposta ||
        taxData.secondaImposta ||
        taxData.commission ||
        taxData.condo ||
        taxData.ilia ||
        taxData.mqCalp != null,
    );
  const taxLabels = {
    title: t("taxTitle"),
    groupAcquisto: t("taxGroupAcquisto"),
    groupGestione: t("taxGroupGestione"),
    primaCasa: t("taxPrimaCasa"),
    secondaCasa: t("taxSecondaCasa"),
    firstHome: t("taxFirstHome"),
    secondHome: t("taxSecondHome"),
    commission: t("taxCommission"),
    plusVat: t("taxPlusVat"),
    condo: t("taxCondo"),
    ilia: t("taxIlia"),
    tari: t("taxTari"),
    iliaEsente: t("taxIliaEsente"),
    perYear: t("taxPerYear"),
    occupants: t("taxOccupants"),
    footnote: t("taxEstimateFootnote"),
    infoAria: t("taxInfoAria"),
    acquistoPop: {
      title: t("taxInfoTitle"),
      body: [t("taxAiDisclaimer")],
      // Niente «criteri di calcolo» dal 09/10/2026: quel testo era la nota
      // INTERNA sulle imposte che teniamo nel CRM (appunti di lavoro, non
      // scritti per chi compra). Restano le cifre; un testo tornerà solo da un
      // campo scritto per il cliente. Stessa correzione su TSV e TSI.
    },
    condoPop: { title: t("taxCondoInfoTitle"), body: [t("taxCondoInfoBody")] },
    iliaPop: { title: t("taxIliaInfoTitle"), body: [t("taxIliaInfoBody")] },
    tariPop: {
      title: t("taxTariInfoTitle"),
      body: [t("taxTariInfoBody")],
      link: { href: "https://esattospa.it/tributo/tari/", label: t("taxTariInfoLink") },
    },
  };

  // Dotazioni: UNA lettura (lib/dotazioni.ts) per i dati strutturati più giù.
  // Prima «campo non vuoto» valeva «c'è», e il "No" del CRM usciva nel JSON-LD
  // come `Ascensore: true` (misurato il 06-07/10/2026).
  const dot = statoDotazioni(property);
  // Un Sì o un No del CRM ("Si", "No") si traduce nella lingua della pagina;
  // un valore che dice di più ("Parzialmente", una frase) resta com'è.
  const siNo = (raw: string) =>
    soloSiNo(raw) ? (presenza(raw) ? t("yes") : t("no")) : raw;

  const characteristics = [
    // Order matters: PropertyCharacteristics keeps the first 8 (the headline
    // specs) always visible and collapses the rest behind a "show all" toggle.
    // — Primary: always visible —
    property.tipologia && { icon: "home", label: t("type"), value: property.tipologia },
    {
      icon: "contract",
      label: t("contract"),
      value: property.contratto === "AFFITTO" ? t("forRent") : t("forSale"),
    },
    property.mq && { icon: "surface", label: t("surface"), value: t("sqm", { value: property.mq }) },
    property.rooms && { icon: "rooms", label: t("rooms"), value: property.rooms },
    property.camere && { icon: "bedroom", label: t("bedrooms"), value: String(property.camere) },
    property.baths && { icon: "baths", label: t("baths"), value: String(property.baths) },
    property.floor && { icon: "floor", label: t("floor"), value: property.floor },
    property.stato && { icon: "condition", label: t("condition"), value: property.stato },
    // — Secondary: revealed on click —
    property.tipoProprieta && { icon: "ownership", label: t("propertyType"), value: property.tipoProprieta },
    property.disponibilita && { icon: "availability", label: t("availability"), value: property.disponibilita },
    property.cucina && { icon: "kitchen", label: t("kitchen"), value: property.cucina },
    property.terrazzo && { icon: "terrace", label: t("terrace"), value: t("yes") },
    property.balcone && { icon: "balcony", label: t("balcony"), value: t("yes") },
    property.giardino && { icon: "garden", label: t("garden"), value: property.giardino },
    property.pianiEdificio && { icon: "building", label: t("floorsBuilding"), value: String(property.pianiEdificio) },
    property.annoCostruzione && { icon: "year", label: t("yearBuilt"), value: String(property.annoCostruzione) },
    property.ascensore && { icon: "elevator", label: t("elevator"), value: siNo(property.ascensore) },
    property.accessoDisabili && { icon: "accessible", label: t("accessibility"), value: t("yes") },
    property.arredato && { icon: "furnished", label: t("furnished"), value: siNo(property.arredato) },
    property.parcheggio && { icon: "parking", label: t("parking"), value: property.parcheggio },
    property.piscina && { icon: "pool", label: t("pool"), value: property.piscina },
    property.riscaldamento && { icon: "heating", label: t("heating"), value: property.riscaldamento },
    property.classeImmobile && { icon: "grade", label: t("propertyClass"), value: property.classeImmobile },
    property.energyClass && { icon: "energy", label: t("energyClass"), value: property.energyClass },
  ].filter((c): c is Characteristic => Boolean(c));

  // Sticky anchor nav (immobiliare.it style) — only sections that exist.
  const nav = [
    (property.coverPhoto || property.photos.length) && { id: "foto", label: t("galPhotos") },
    description && { id: "descrizione", label: t("descriptionTitle") },
    property.planimetrie.length && { id: "planimetrie", label: t("galPlans") },
    ytIds.length && { id: "video", label: t("galVideo") },
    property.matterportUrl && { id: "tour", label: t("galTour") },
    hasLocation && { id: "posizione", label: t("locationTitle") },
    // Il riepilogo #foto-ai NON sta nella barra (review di misura del 02/10):
    // era la scritta AI che restava più a lungo sullo schermo, per una sezione
    // di due righe. Ci porta il link sotto le miniature della galleria.
  ].filter((x): x is { id: string; label: string } => Boolean(x));

  // Dati strutturati della scheda, dalla lettura unica delle dotazioni (`dot`).
  // Esce solo ciò che si sa — true = c'è, false = il CRM dice di no ("No",
  // "Nessuno") — e il resto si tace. Il commento che stava qui («il campo è
  // popolato SOLO quando la dotazione c'è») era falso.
  const amenities = vociSchema(dot, {
    terrazzo: t("terrace"),
    balcone: t("balcony"),
    giardino: t("garden"),
    piscina: t("pool"),
    ascensore: t("elevator"),
    parcheggio: t("parking"),
    accessoDisabili: t("accessibility"),
  });

  const path = `/annuncio/${property.slug}`;

  return (
    <article>
      <JsonLd
        data={[
          listingJsonLd({
            locale,
            path,
            title,
            description: property.oneliner ?? description ?? null,
            tipologia: property.tipologia,
            contratto: property.contratto,
            via: property.via,
            comune: property.comune,
            mq: property.mq,
            camere: property.camere,
            baths: property.baths,
            floor: property.floor,
            annoCostruzione: property.annoCostruzione,
            priceSale: property.priceSale,
            priceRent: property.priceRent,
            trattativaRiservata: property.trattativaRiservata,
            venduto: isSold(property),
            onlineDa: property.onlineDa,
            amenities,
          }),
          breadcrumbJsonLd(locale, [
            { name: "FriuliVillas", path: "/" },
            { name: tNav("properties"), path: "/immobili" },
            ...(area ? [{ name: NOMI_AREA[area][lingua], path: `/area/${SLUG_AREA[area][lingua]}` }] : []),
            { name: title, path },
          ]),
        ]}
      />
      {/* view_item GA4 con l'immobile (per tutti, consenso permettendo; 10/10/2026).
          Nome pubblico italiano, mai il nome interno; prezzo solo se la scheda lo
          mostra (priceLabel: in trattativa riservata no). */}
      <TrackViewItem
        id={property.recId}
        nome={property.title}
        tipologia={property.tipologia}
        zona={property.comune}
        contratto={property.contratto}
        prezzo={property.trattativaRiservata ? null : property.contratto === "AFFITTO" ? property.priceRent : property.priceSale}
        area={area ? NOMI_AREA[area].it : null}
      />
      {/* Cinematic hero — parallax cover, shared-element morph target */}
      <Scene as="header" mode="cover" smooth={0.14} className="relative h-[82vh] min-h-[520px] overflow-hidden bg-ink-2">
        {/* L'alt delle foto nasce dal titolo italiano in mapRecord (che non conosce
            il locale): sull'immagine principale usiamo il titolo localizzato. Le foto
            della galleria restano con l'alt costruito in mapRecord. */}
        {/* Qui stava il buco più grosso del sito: `.url` è l'ORIGINALE Airtable,
            e con images.unoptimized arrivava intero al browser. Il 2026-07-30 in
            produzione era un PNG da 6,49 MB su una scheda da 12,46 MB di sole
            immagini. Ora passa dal proxy, in WebP; e il srcSet è quello che
            salva il telefono, perché con sizes="100vw" su un 390 a DPR 2 ne
            servono 780 px e senza ladder si scaricavano comunque i 2000. */}
        {(property.coverPhoto ?? property.photos[0]) ? (
          <ViewTransition name={`prop-${property.slug}`} share="morph">
            <PhotoImg
              src={photoSrc((property.coverPhoto ?? property.photos[0])!, 2000)}
              srcSet={photoSrcSet((property.coverPhoto ?? property.photos[0])!, HERO_WIDTHS)}
              sizes="100vw"
              alt={title}
              priority
              className="par-zoom object-cover"
            />
          </ViewTransition>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark to-ink" />
        )}
        {/* Video di testata (content/annunciVideo.ts): layer client-only che
            sale sulla copertina solo quando il filmato suona davvero, con la
            pausa, il velo sotto il testo e — se `ai` — l'etichetta AI sul
            video. Fratello del ViewTransition e prima del velo della pagina.
            Nell'HTML iniziale non c'è nessun <video>. */}
        {heroVideo && (
          <SfondoVideo
            video={heroVideo}
            registro={rigaTestata ? { dati: etichettaTestata } : null}
            locale={locale}
            title={title}
            velo
            linkAi={PAGINA_AI_ONLINE ? "/ai" : undefined}
            layerClassName="par-zoom"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/10 to-ink/90" />
        {/* Etichetta AI della copertina (SPEC §5.1): forma estesa, come nella
            vista singola, in alto a destra sotto l'header fisso — sulla STESSA
            riga del «← Torna agli immobili» e nella stessa colonna della
            scheda (max-w-5xl), non incollata al bordo della finestra. Senza
            etichetta il blocco resta quello di sempre. */}
        {/* Con il video di testata la riga del «← Torna» porta a destra i suoi
            comandi (pausa ed etichetta del video): l'etichetta della copertina
            scende sotto la riga, nella stessa colonna, e sparisce mentre si
            vede il video (parla della foto, non del filmato). */}
        <div
          className={`absolute left-0 right-0 top-24 mx-auto max-w-5xl px-6${
            heroAi && !heroVideo ? " z-[3] flex items-center justify-between gap-3" : ""
          }`}
        >
          <Link
            href="/immobili"
            transitionTypes={["nav-back"]}
            className="group/back text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <span className="inline-block transition-transform duration-300 ease-[var(--ease-lux)] group-hover/back:-translate-x-1">
              ←
            </span>{" "}
            {t("backToList")}
          </Link>
          {heroAi && !heroVideo && <AiTag testo={heroAi.estesa} aria={heroAi.aria} className="shrink-0" />}
        </div>
        {heroAi && heroVideo && (
          <div className="pointer-events-none absolute inset-x-0 top-[9.25rem] z-[3] mx-auto flex max-w-5xl justify-end px-6 [header:has([data-video-visibile])_&]:hidden">
            <AiTag testo={heroAi.estesa} aria={heroAi.aria} className="shrink-0" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-6 pb-12">
          <div className="flex flex-wrap items-center gap-2" data-reveal>
            {/* «Venduto» al posto di «In vendita», non accanto: si smentirebbero. */}
            <PropertyBadge {...(soldBadge(property, t) ?? contractBadge(property, t))} />
            {clusterBadge(property, t) && (
              <PropertyBadge {...clusterBadge(property, t)!} />
            )}
          </div>
          <h1 className="display-chapter mt-4 max-w-3xl text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.5)]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-white/65">
            {t("reference")} {property.id}
            {place && (
              <>
                {" · "}
                {hasLocation ? (
                  <a href="#posizione" className="underline-offset-2 hover:text-white hover:underline">
                    {place}
                  </a>
                ) : (
                  place
                )}
              </>
            )}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <p className="text-3xl font-semibold tracking-tight text-white">
              {priceLabel(property, locale, t)}
            </p>
          </div>
          {/* CTA in evidenza: prenotazione visita (link esterno, es. Open Day) e
              tour 3D immersivo. Guidate dai dati — compaiono solo se valorizzati.
              Il tour è ANCHE embeddato più in basso (sezione #tour); questo è
              l'accesso rapido a schermo intero. */}
          {(property.bookingUrl || property.matterportUrl) && (
            <div className="mt-5 flex flex-wrap items-center gap-3" data-reveal>
              {property.bookingUrl && (
                <a
                  href={property.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {tLead("visitCta")}
                </a>
              )}
              {property.matterportUrl && (
                <a
                  href={property.matterportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/25 backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
                  </svg>
                  {t("galTour")}
                </a>
              )}
            </div>
          )}
        </div>
      </Scene>

      {/* Paper sheet — the dossier */}
      <div className="relative z-10 -mt-5 rounded-t-[2.25rem] bg-paper text-neutral-900 shadow-[0_-24px_60px_rgba(15,39,55,0.16)]">
        <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
          {nav.length > 1 && (
            <StickyNav
              title={title}
              reference={`${t("reference")} ${property.id}`}
              items={nav}
            />
          )}


          <div className="mt-6">
            <PhotoGallery
              cover={property.coverPhoto}
              topPhotos={property.topPhotos}
              allPhotos={property.photos}
              compact
              labels={{
                viewAll: t("galViewAll", { count: fotoNelLightbox }),
                close: t("galClose"),
                photosComing: t("photosComing"),
                grid: t("galGrid"),
                ...(riepilogoAi ? { aiSummary: tAi("summaryTitle") } : {}),
              }}
            />
          </div>

          <PropertyCharacteristics
            title={t("characteristicsTitle")}
            items={characteristics}
            primaryCount={8}
            moreLabel={t("showAllFeatures")}
            lessLabel={t("showLess")}
          />

          {description && (
            <section id="descrizione" className="mt-8 scroll-mt-32" data-reveal>
              <h2 className="text-lg font-semibold">{t("descriptionTitle")}</h2>
              {/* `lang` del testo VERO: su /sl, finché manca lo sloveno, è
                  l'inglese (vedi descriptionLang). Su it/en/de coincide con la
                  pagina tranne quando la traduzione manca e si legge l'italiano. */}
              <div
                lang={descriptionLang(property, locale)}
                className="mt-3 space-y-4 leading-relaxed text-neutral-700"
              >
                {toParagraphs(description).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {hasCosts && taxData && <TaxBox data={taxData} labels={taxLabels} locale={locale} />}

          <Planimetrie
            items={property.planimetrie}
            title={t("galPlans")}
            closeLabel={t("galClose")}
          />

          {ytIds.length > 0 && (
            <section id="video" className="mt-8 scroll-mt-32">
              <h2 className="text-lg font-semibold">{t("galVideo")}</h2>
              <div className="mt-3 space-y-4">
                {ytVideo.map(({ id, etichetta, didascalia }) => (
                  <figure key={id}>
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-900">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${id}`}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        className="absolute inset-0 h-full w-full border-0"
                      />
                      {/* Etichetta del registro dei video (SPEC §10) SOPRA il
                          player, in alto a destra come sulle foto, sulla
                          miniatura e per tutta la riproduzione: `passante`, non
                          prende i clic, e i comandi di YouTube sotto di lei
                          restano usabili. In alto a destra il player di YouTube
                          oggi non ha tasti (solo la coda del titolo): più in
                          basso, al telefono, toccava il tasto play. */}
                      <div className="pointer-events-none absolute right-3 top-3 z-[1]">
                        <EtichettaVideo dati={etichetta} passante />
                      </div>
                    </div>
                    {didascalia && (
                      <figcaption lang={didascalia.lang} className="mt-2 text-pretty text-sm leading-relaxed text-neutral-600">
                        {didascalia.testo}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}

          {property.matterportUrl && (
            <section id="tour" className="mt-8 scroll-mt-32">
              <h2 className="text-lg font-semibold">{t("galTour")}</h2>
              <TourFrame
                src={property.matterportUrl}
                title={t("galTour")}
                fsLabel={fsLabel}
              />
            </section>
          )}

          {property.tags.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">{t("featuresTitle")}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {property.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700"
                  >
                    {tag.replace(/_/g, " ").toLowerCase()}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasLocation && (
            <section id="posizione" className="mt-8 scroll-mt-32">
              <h2 className="text-lg font-semibold">{t("locationTitle")}</h2>
              <div className="mt-3">
                <PropertyMap lat={property.lat!} lng={property.lng!} />
              </div>
              <p className="mt-2 text-sm text-neutral-500">{t("locationApprox")}</p>
            </section>
          )}

          {/* L'area e i tempi misurati dal comune (07/10/2026): OSRM statico, mai dal vivo. */}
          {area && sede && (
            <section id="area" className="mt-8 scroll-mt-32">
              <h2 className="text-lg font-semibold">
                {ui("areaLabel", lingua)}:{" "}
                <Link href={`/area/${SLUG_AREA[area][lingua]}`} className="text-brand underline-offset-4 hover:underline">
                  {NOMI_AREA[area][lingua]}
                </Link>
              </h2>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                {ui("tempiFinoA", lingua, { luogo: sede.luogo })}
              </p>
              <ul className="mt-2 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
                {(["trieste", "udine", "aer_trieste", "aer_venezia", "vienna", "monaco"] as const).map((o) => (
                  <li key={o} className="flex items-baseline justify-between gap-3 border-b border-neutral-100 py-2 text-sm">
                    <span className="text-neutral-600">{NOMI_ORIGINE[o][lingua]}</span>
                    <span className="font-mono tabular-nums text-brand-dark">{durata(minuti(sede.chiave, o), lingua)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-neutral-500">{ui("daDoveNota", lingua, { data: dataLunga(DATA_MISURA, lingua) })}</p>
            </section>
          )}

          {/* Il riepilogo (SPEC v1.3 §11.2, 02/10/2026: «bello, ma spesso
              troppo»): visibili il titolo, UNA riga calcolata dai conteggi e la
              chiusura; la nota del CRM, le foto per tipo e il link a /ai stanno
              dentro un <details> chiuso. Niente tessere coi numeri grandi. Il
              prebuild ferma una nota rimessa fuori dal <details>. */}
          {riepilogoAi && (
            <section id="foto-ai" className="mt-8 scroll-mt-32" data-reveal>
              <h2 className="text-balance text-lg font-semibold">{tAi("summaryTitle")}</h2>
              {/* La chiusura in peso normale, nella stessa frase: in grassetto
                  suonava come una clausola di esclusione di responsabilità. */}
              <p className="mt-2 text-pretty leading-relaxed text-neutral-700">
                {rigaAi && <>{rigaAi} </>}
                <span>{tAi("summaryClosing")}</span>
              </p>
              <details className="group mt-3 rounded-xl border border-neutral-200 bg-white">
                {/* <summary> resta un blocco e il flex sta su uno span
                    interno: un <summary> con display:flex è il caso che i
                    WebKit più vecchi gestivano male (review del 02/10, non
                    provato su iPhone). Il marcatore si toglie con list-none e,
                    su Safari, con ::-webkit-details-marker. */}
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
                            <span className="w-7 shrink-0 text-right font-semibold tabular-nums text-neutral-900">
                              {n}
                            </span>
                            {/* La pillola solo per i tipi che la portano sulla foto:
                                la sola luce non ce l'ha (§11.1). */}
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
                  {/* La nota completa del CRM DOPO i conteggi per tipo: i conteggi
                      si leggono in un colpo d'occhio, la nota è il racconto. */}
                  {notaAi && paragrafiNota.length > 0 && (
                    <div lang={notaAi.lang} className="space-y-3">
                      {paragrafiNota.map((x, i) => (
                        <p key={i}>{x}</p>
                      ))}
                    </div>
                  )}
                  {/* Il video di testata: nell'hero non c'è posto per la sua
                      didascalia (sta nell'aria-label dell'etichetta), qui sì. */}
                  {videoTestataNelRiepilogo && etichettaTestata && didascaliaTestata && (
                    <div>
                      <h3 className="font-semibold text-neutral-900">{t("galVideo")}</h3>
                      <p className="mt-3 flex items-start gap-3 text-neutral-600">
                        <AiTag testo={etichettaTestata.testo} aria={etichettaTestata.testo} className="mt-px shrink-0" />
                        <span lang={didascaliaTestata.lang}>{didascaliaTestata.testo}</span>
                      </p>
                    </div>
                  )}
                  {PAGINA_AI_ONLINE ? (
                    <Link href="/ai" className="inline-block font-medium text-brand underline-offset-2 hover:underline">
                      {tAi("summaryLink")} <span aria-hidden>→</span>
                    </Link>
                  ) : (
                    linkAiGruppo && (
                      <a
                        href={linkAiGruppo}
                        hrefLang={locale}
                        className="inline-block font-medium text-brand underline-offset-2 hover:underline"
                      >
                        {tAi("summaryLinkGruppo")} <span aria-hidden>→</span>
                      </a>
                    )
                  )}
                </div>
              </details>
            </section>
          )}

          {/* immobileNome resta il titolo ITALIANO in tutte le lingue: finisce
              nel CRM come identità del record, e un immobile deve avere un nome solo
              qualunque sia la lingua del visitatore (la lingua viaggia già in `lingua`).
              Stessa regola del log visite della Private Collection. */}
          <LeadForm
            rif={property.id}
            immobileNome={property.title}
            url={`${SITE_URL}${locale === "it" ? "" : `/${locale}`}/annuncio/${property.slug}`}
            sito="friulivillas.com"
            lingua={locale}
            invioAmico={!!(process.env.RESEND_API_KEY && process.env.RESEND_FROM)}
          />

          {/* Anche qui il nome italiano: vedi la nota su LeadForm. */}
          <VisitForm
            rif={property.id}
            immobileNome={property.title}
            url={`${SITE_URL}${locale === "it" ? "" : `/${locale}`}/annuncio/${property.slug}`}
            sito="friulivillas.com"
            lingua={locale}
          />

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-500">
            <a className="hover:text-brand" href="mailto:richieste@triestevillas.com">
              richieste@triestevillas.com
            </a>
            <a className="hover:text-brand" href="tel:0402473628">
              040 2473628
            </a>
          </div>

          {similar.length > 0 && (
            <section className="mt-12 border-t border-neutral-200 pt-10">
              <h2 className="text-2xl font-semibold tracking-tight">
                {t("similarTitle")}
              </h2>
              <div
                className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-sm:[&>*:nth-child(4)]:hidden lg:[&>*:nth-child(4)]:hidden"
                data-reveal-stagger
              >
                {similar.map((p) => (
                  <PropertyCard
                    key={p.slug}
                    view={buildPropertyView(p, locale, t, (() => { const a = areaDiCasa(p); return a ? NOMI_AREA[a][lingua] : null; })())}
                    photosComing={t("photosComing")}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
