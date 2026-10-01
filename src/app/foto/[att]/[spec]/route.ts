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
import { getPhotoSources } from "@/lib/airtable";
import { getTrasparenza, iptcDi } from "@/lib/trasparenza";

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
  const width = Number(spec.replace(/\.webp$/, ""));
  if (!(WIDTHS as readonly number[]).includes(width)) {
    return new Response(`larghezza non ammessa (${WIDTHS.join(", ")})`, {
      status: 400,
      headers: { "Cache-Control": CACHE_MISS },
    });
  }

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
  const source = width > 900 ? photo.url : photo.thumb;

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
    // La marcatura IPTC «DigitalSourceType» (SPEC §5.7): deve arrivare al
    // visitatore anche dopo la ricodifica. Prima la dice il CRM (la vista
    // trasparenza conosce il trattamento di questa foto), poi il file stesso
    // (Foto di Apple «Clean Up», per esempio, la scrive da sé).
    const tipo =
      iptcDi(await getTrasparenza(), photo.rec, photo.filename) ??
      digitalSourceTypeDi((await immagine.metadata()).xmp);
    let lavoro = immagine
      .rotate() // rispetta l'orientamento EXIF prima di ridimensionare
      .resize({ width, withoutEnlargement: true });
    // ⚠️ Non `keepXmp()`, di proposito: l'XMP sorgente non porta solo la
    // marcatura. Misurato il 01/10/2026 sul catalogo: lo scatto da drone di un
    // annuncio (DJI_0211.JPG) ha 8 KB di XMP con modello del drone, date,
    // altitudine assoluta e assetto di volo; altri programmi ci scrivono anche
    // la posizione GPS. Ricodificando senza metadati non arrivava niente di
    // tutto questo, e così deve restare. Si scrive un XMP NUOVO con la sola
    // DigitalSourceType.
    if (tipo) lavoro = lavoro.withXmp(xmpDigitalSourceType(tipo));
    const out = await lavoro.webp({ quality: 78 }).toBuffer();

    return new Response(new Uint8Array(out), {
      headers: {
        "Content-Type": "image/webp",
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
