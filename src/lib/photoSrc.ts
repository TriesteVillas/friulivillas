// Da dove un componente prende l'URL di una foto.
//
// Sempre da qui, mai da `photo.url` / `photo.thumb` diretti: quelle sono url
// Airtable firmate — ruotano, scadono, e pesano quanto il file caricato (fino a
// 12 MB per un PNG). `photoSrc` le manda invece al proxy /foto, che ricodifica in
// WebP alla larghezza chiesta dietro un URL stabile e cacheabile per sempre.
// Vedi src/app/foto/[att]/[spec]/route.ts per il perché completo.
import type { Photo } from "@/lib/properties";
import { eAi, haEtichetta, siglaDiIptc } from "@/lib/fotoAi";

// Le stesse larghezze dell'allowlist della rotta: chiederne un'altra darebbe 400.
export const PHOTO_WIDTHS = [400, 600, 800, 1200, 1600, 2000] as const;
export type PhotoWidth = (typeof PHOTO_WIDTHS)[number];

/**
 * URL servibile per una foto alla larghezza data.
 *
 * Se l'attachment non ha un id (Airtable non l'ha restituito) si ricade sulla url
 * firmata: meno efficiente, ma la foto si vede. Il fallback è deliberato — una
 * scheda senza immagini sarebbe un danno peggiore di una immagine pesante.
 */
export function photoSrc(photo: Photo, width: PhotoWidth): string {
  if (!photo.id) return width > 900 ? photo.url : photo.thumb;
  return `/foto/${photo.id}/${width}${suffissoIptc(photo)}.webp`;
}

/**
 * La marcatura IPTC «DigitalSourceType» fa parte dell'URL (SPEC §5.7): il proxy
 * la scrive nel file, e il file sta in cache immutabile per un anno. Se la
 * marcatura dipendesse da uno stato letto al momento della richiesta (la vista
 * del CRM), la prima versione servita — magari senza marcatura, perché il CRM
 * non conosceva ancora la foto — resterebbe quella per un anno (review del
 * 01/10). Con la sigla nell'URL, una foto che il CRM classifica o riclassifica
 * cambia URL, e il file nuovo nasce già marcato. Le foto senza dati AI hanno
 * l'URL di sempre.
 */
function suffissoIptc(photo: Photo): string {
  const sigla = photo.ai ? siglaDiIptc(photo.ai.iptc) : null;
  return sigla ? `-${sigla}` : "";
}

/**
 * L'immagine per i social (og:image) della copertina: 1200×630 dal proxy
 * /foto, un URL stabile e leggero (~170 KB) invece della url firmata di
 * Airtable, che pesa quanto il file caricato (2,8 MB misurati su Villa Ronchi)
 * e scade in un paio d'ore — una pagina rimasta in cache più a lungo dava ai
 * crawler e a WhatsApp un link già morto. Tre forme:
 *   · `og-<sigla>.jpg`  — copertina CON etichetta AI (sostanza, haEtichetta):
 *     la sigla «AI» stampata nell'angolo (un'anteprima social non mostra le
 *     etichette HTML della pagina) e la marcatura IPTC nel file;
 *   · `og-<sigla>l.jpg` — copertina passata da un modello SENZA etichetta
 *     (sola luce, §11.1) o render di progetto senza AI: nessuna sigla
 *     stampata, la marcatura IPTC sì (§11.1: resta per tutte le foto passate
 *     da un modello, `ai_luce` compresa). `enh` (ritocco tecnico) non stampa
 *     mai niente e resta `og-enh.jpg`;
 *   · `og.jpg`          — copertina senza dati AI: la foto com'è.
 * Un URL nuovo per ogni forma: `og-ai.jpg` è in cache immutabile per un anno.
 * null solo se la foto non ha un id (resta la url firmata, come prima).
 */
export function photoOgSrc(photo: Photo): string | null {
  if (!photo.id) return null;
  const sigla = photo.ai ? siglaDiIptc(photo.ai.iptc) : null;
  if (!sigla) return `/foto/${photo.id}/og.jpg`;
  // La sigla stampata solo dove la pagina mette l'etichetta E la foto è
  // passata da un modello: non sullo stile (§11.1), non sul render senza AI.
  const stampa = haEtichetta(photo.ai) && eAi(photo.ai.trattamento);
  if (stampa || sigla === "enh") return `/foto/${photo.id}/og-${sigla}.jpg`;
  return `/foto/${photo.id}/og-${sigla}l.jpg`;
}

/**
 * srcSet per un'immagine che cambia dimensione col viewport. Da usare insieme a
 * `sizes`, altrimenti il browser assume 100vw e scarica più del necessario.
 */
export function photoSrcSet(photo: Photo, widths: readonly PhotoWidth[]): string | undefined {
  if (!photo.id) return undefined;
  return widths.map((w) => `${photoSrc(photo, w)} ${w}w`).join(", ");
}
