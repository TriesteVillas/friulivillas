// Proxy foto con URL STABILE.
//
// Il problema che risolve. Le foto vivono su Airtable, che le serve da url
// FIRMATE: ruotano a ogni revalidation e scadono. Conseguenze:
//   1. L'optimizer di Vercel indicizza la cache sulla url sorgente, quindi ogni
//      rotazione era una cache key nuova → una trasformazione e una scrittura di
//      cache nuove. Ha bruciato il free tier e iniziato a rispondere 402, con
//      next/image che rendeva l'alt al posto della foto. Da lì `unoptimized: true`
//      in next.config, cioè foto servite grezze. Su questo sito voleva dire, il
//      2026-07-30 in produzione, una scheda da 12,46 MB di sole immagini con un
//      hero PNG da 6,49 MB: circa venti secondi su una 4G normale.
//   2. Google Immagini non ha un indirizzo stabile da indicizzare: l'URL che
//      trova al crawl non è quella che troverà dopo. Per un sito immobiliare è
//      un canale intero perso.
// `thumbnails.full` di Airtable non è una via d'uscita: conserva il formato di
// partenza e pesa quasi quanto l'originale. Serve ricodificare.
//
// Come lo risolve. La chiave dell'URL è l'id attachment di Airtable — l'unico
// identificatore stabile della foto (le url ruotano, i filename si ripetono fra
// immobili) — più la larghezza. Stessa foto, stessa larghezza → sempre lo stesso
// URL, quindi UNA trasformazione e poi CDN per sempre.
//
// Dall'08/10/2026, col catalogo dal CRM (CATALOGO_SORGENTE=pg), l'indice viene
// dalla vetrina e la sorgente da ricodificare è la rotta foto del CRM
// (/api/vetrina/foto/<rec>/<att>/<m|xl>) invece dell'URL firmata di Airtable:
// stessi byte, stesso indirizzo pubblico qui. Vedi getPhotoSources().
//
// Confine di riservatezza: si risolve solo dentro getPhotoSources(), che gira
// sullo stesso FILTER di getProperties() — cioè i soli immobili pubblicabili
// online. Le foto della Private Collection NON sono raggiungibili
// da qui: un id privato dà 404. Vale la pena esplicitarlo: qui gli URL sono
// duraturi, mentre quelli firmati scadono, e un endpoint pubblico e permanente
// su foto riservate sarebbe un'esposizione nuova.
//
// Perché l'URL non deve MAI portarsi dietro una query. Il piano di cache di
// Vercel indicizza sulla url COMPLETA di query string. `next/image` accoda
// `?dpl=<id del deploy>` (skew protection) a ogni src locale: significa che a
// ogni deploy tutte le foto diventano chiavi di cache nuove e l'intera cache si
// butta via. Misurato il 2026-07-30 in produzione: stessa foto, cache key nuova
// → MISS a 1,01 s; subito dopo → HIT a 0,085 s. Da qui le foto si servono con
// un <img> nudo (src/components/PhotoImg.tsx), non con next/image.
//
// La marcatura IPTC «DigitalSourceType» (SPEC §5.7) viaggia NELL'URL, come
// sigla: `/foto/<att>/<w>-ai.webp` (composite), `-gen` (trainedAlgorithmicMedia),
// `-enh` (algorithmicallyEnhanced). La mette photoSrc() quando la foto ha dati
// di trasparenza dal CRM, o la sigla «AI» del sito. Così il contenuto resta una
// funzione dell'URL — quindi la cache immutabile resta vera — e il proxy non
// chiede niente al CRM: prima lo interrogava a ogni mancato colpo di CDN (fino a
// 5 s di attesa) e scolpiva per un anno la marcatura di quel momento.
// Senza sigla vale quella che il file stesso dichiara (Foto di Apple «Clean Up»
// la scrive da sé), come prima.
//
// `/foto/<att>/og-<sigla>.jpg`: l'anteprima social (og:image) di una copertina
// con etichetta AI — 1200×630, sigla «AI» stampata in alto a destra, perché
// un'anteprima social non mostra le etichette HTML della pagina.
// `/foto/<att>/og-<sigla>l.jpg`: la stessa marcatura, senza sigla stampata
// (copertina di sola luce, render senza AI). `/foto/<att>/og.jpg`: senza dati AI.
import { getPhotoSources } from "@/lib/airtable";
import { IPTC_PER_SIGLA, type SiglaIptc } from "@/lib/fotoAi";

// sharp gira solo su Node, non su Edge.
export const runtime = "nodejs";

// Larghezze ammesse. Una allowlist e non un numero libero: ogni valore è una
// voce di cache in più e una leva per far lavorare il server a vuoto.
const WIDTHS = [400, 600, 800, 1200, 1600, 2000] as const;

const ATT_ID = /^att[A-Za-z0-9]{14}$/;

// Un anno, immutable: l'URL identifica una foto e una larghezza precise, quindi
// il contenuto non cambia mai. Se la foto viene sostituita su Airtable cambia
// l'id attachment, quindi cambia l'URL — non serve invalidare nulla.
const CACHE_HIT = "public, max-age=31536000, s-maxage=31536000, immutable";
// Il 404 si tiene corto: una foto appena pubblicata non deve restare "assente"
// in cache per un anno.
const CACHE_MISS = "public, max-age=60, s-maxage=60";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ att: string; spec: string }> },
) {
  const { att, spec } = await params;

  if (!ATT_ID.test(att)) {
    return new Response("id attachment non valido", {
      status: 400,
      headers: { "Cache-Control": CACHE_MISS },
    });
  }
  const richiesta = leggiSpec(spec);
  if (!richiesta) {
    return new Response(`larghezza non ammessa (${WIDTHS.join(", ")}, oppure og)`, {
      status: 400,
      headers: { "Cache-Control": CACHE_MISS },
    });
  }
  const { width, og, sigla, stampa } = richiesta;

  const photo = (await getPhotoSources()).get(att);
  if (!photo) {
    return new Response("foto non trovata", {
      status: 404,
      headers: { "Cache-Control": CACHE_MISS },
    });
  }

  // Sorgente: la rendition `large` di Airtable (917 px) basta per le larghezze
  // piccole ed evita di scaricare l'originale da 12 MB per produrne una miniatura.
  // Sopra i 900 px serve l'originale, altrimenti si scalerebbe in su del già scalato.
  const source = og || width > 900 ? photo.url : photo.thumb;

  try {
    const upstream = await fetch(source, { cache: "no-store" });
    if (!upstream.ok) {
      // Url firmata scaduta: il chiamante riprova dopo la prossima revalidation,
      // quando la pagina avrà una url fresca.
      return new Response("sorgente non disponibile", {
        status: 502,
        headers: { "Cache-Control": CACHE_MISS },
      });
    }
    const input = Buffer.from(await upstream.arrayBuffer());

    const { default: sharp } = await import("sharp");
    const immagine = sharp(input);
    const tipo = sigla
      ? IPTC_PER_SIGLA[sigla]
      : digitalSourceTypeDi((await immagine.metadata()).xmp);
    let lavoro = immagine.rotate(); // rispetta l'orientamento EXIF prima di ridimensionare
    lavoro = og
      ? lavoro.resize({ width: OG_W, height: OG_H, fit: "cover" })
      : lavoro.resize({ width, withoutEnlargement: true });
    // La sigla «AI» stampata sull'anteprima social: solo per le marcature AI
    // (non per `enh`, il ritocco tecnico, che sulla pagina non ha etichetta)
    // e non per le varianti `…l` (sola luce, render senza AI: §11.1).
    if (og && stampa) {
      lavoro = lavoro.composite([{ input: Buffer.from(svgSiglaAi(OG_W, OG_H)), top: 0, left: 0 }]);
    }
    // ⚠️ Non `keepXmp()`, di proposito: l'XMP sorgente non porta solo la
    // marcatura. Misurato il 01/10/2026 sul catalogo: lo scatto da drone di un
    // annuncio (DJI_0211.JPG) ha 8 KB di XMP con modello del drone, date,
    // altitudine assoluta e assetto di volo; altri programmi ci scrivono anche
    // la posizione GPS. Ricodificando senza metadati non arrivava niente di
    // tutto questo, e così deve restare. Si scrive un XMP NUOVO con la sola
    // DigitalSourceType.
    if (tipo) lavoro = lavoro.withXmp(xmpDigitalSourceType(tipo));
    const out = og
      ? await lavoro.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
      : await lavoro.webp({ quality: 78 }).toBuffer();

    return new Response(new Uint8Array(out), {
      headers: {
        "Content-Type": og ? "image/jpeg" : "image/webp",
        "Content-Length": String(out.byteLength),
        "Cache-Control": CACHE_HIT,
      },
    });
  } catch {
    return new Response("ricodifica fallita", {
      status: 500,
      headers: { "Cache-Control": CACHE_MISS },
    });
  }
}

// ---- Cosa chiede l'URL ---------------------------------------------------------

const OG_W = 1200;
const OG_H = 630;
const SPEC_FOTO = /^(\d{3,4})(?:-(ai|gen|enh))?(?:\.webp)?$/;
// `og-ail.jpg` / `og-genl.jpg` (02/10, SPEC §11.1): la stessa marcatura IPTC
// SENZA la sigla stampata — la copertina di sola luce (o il render senza AI)
// non porta etichetta sulla pagina, e non la porta neanche sull'anteprima.
const SPEC_OG = /^og(?:-(?:(ai|gen)(l)?|(enh)))?\.jpg$/;

function leggiSpec(
  spec: string,
): { width: number; og: boolean; sigla: SiglaIptc | null; stampa: boolean } | null {
  const og = SPEC_OG.exec(spec);
  if (og) {
    const sigla = ((og[1] ?? og[3]) as SiglaIptc | undefined) ?? null;
    return { width: OG_W, og: true, sigla, stampa: (sigla === "ai" || sigla === "gen") && !og[2] };
  }
  const m = SPEC_FOTO.exec(spec);
  if (!m) return null;
  const width = Number(m[1]);
  if (!(WIDTHS as readonly number[]).includes(width)) return null;
  return { width, og: false, sigla: (m[2] as SiglaIptc | undefined) ?? null, stampa: false };
}

// ---- La sigla «AI» disegnata sull'anteprima social ------------------------------
//
// Stessa forma dell'etichetta della pagina (AiTag): pillola scura dell'inchiostro
// del sito all'85%, filo chiaro, «AI» bianco. Le lettere sono TRACCIATI, non
// testo: sul server di Vercel non ci sono font di sistema garantiti, e un <text>
// SVG potrebbe uscire a quadratini o vuoto.
function svgSiglaAi(w: number, h: number): string {
  const k = w / 1200;
  const ph = 56 * k; // altezza della pillola
  const pw = 104 * k;
  const x0 = w - 28 * k - pw;
  const y0 = 28 * k;
  const cx = x0 + pw / 2;
  const alto = y0 + ph / 2 - 13 * k; // lettere alte 26
  const basso = y0 + ph / 2 + 13 * k;
  const sw = 5.5 * k;
  const aSx = cx - 18.5 * k; // gamba sinistra della A
  const aDx = aSx + 22 * k; // gamba destra
  const apice = (aSx + aDx) / 2;
  const yBarra = alto + 26 * k * 0.64;
  const dBarra = ((basso - yBarra) / (basso - alto)) * (11 * k);
  const xI = aDx + 12.5 * k;
  const f = (n: number) => n.toFixed(1);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<rect x="${f(x0)}" y="${f(y0)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph / 2)}" fill="#0b1512" fill-opacity="0.85" stroke="#ffffff" stroke-opacity="0.35" stroke-width="${f(2 * k)}"/>` +
    `<g fill="none" stroke="#ffffff" stroke-width="${f(sw)}">` +
    `<path d="M${f(aSx)} ${f(basso)} L${f(apice)} ${f(alto)} L${f(aDx)} ${f(basso)}" stroke-linejoin="round"/>` +
    `<path d="M${f(aSx + dBarra)} ${f(yBarra)} L${f(aDx - dBarra)} ${f(yBarra)}"/>` +
    `<path d="M${f(xI)} ${f(alto)} L${f(xI)} ${f(basso)}"/>` +
    `</g></svg>`
  );
}

// ---- XMP minimo con la sola DigitalSourceType ---------------------------------

const IPTC_DST = "http://cv.iptc.org/newscodes/digitalsourcetype/";
const CODICE = /^[A-Za-z]{3,60}$/;

/** Il codice DigitalSourceType scritto nell'XMP del file sorgente, se c'è. */
function digitalSourceTypeDi(xmp: Buffer | undefined): string | null {
  if (!xmp) return null;
  const testo = xmp.toString("utf8");
  const m =
    testo.match(/DigitalSourceType>\s*([^<\s]+)\s*</) ??
    testo.match(/DigitalSourceType="([^"]+)"/) ??
    testo.match(/DigitalSourceType\s+rdf:resource="([^"]+)"/);
  if (!m) return null;
  const codice = m[1].replace(/^https?:\/\/cv\.iptc\.org\/newscodes\/digitalsourcetype\//, "");
  return CODICE.test(codice) ? codice : null;
}

function xmpDigitalSourceType(codice: string): string {
  const c = CODICE.test(codice) ? codice : "trainedAlgorithmicMedia";
  return (
    `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>` +
    `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">` +
    `<rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/">` +
    `<Iptc4xmpExt:DigitalSourceType>${IPTC_DST}${c}</Iptc4xmpExt:DigitalSourceType>` +
    `</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`
  );
}
