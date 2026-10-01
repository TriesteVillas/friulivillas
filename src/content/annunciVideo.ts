/* Il video di testata delle schede (01/10/2026): un filmato muto in loop,
   servito da public/, che fa da sfondo all'hero della scheda al posto della
   copertina ferma. Stesso registro e stesso formato di triesteaffitti.com e di
   triestevillas.com (src/content/annunciVideo.ts di quei repo): una voce
   copiata da là vale qui, con i suoi file copiati in public/.

   Registro lato sito, chiave = codice di catalogo (TSV-PROP-…, il campo
   `tsv_prop_id` che mapRecord mette in `Property.id`): il CRM non ha un campo
   per il video di testata, e i file vivono in questo repo
   (public/media/annunci/<cartella>/). Una voce qui non può rompere una
   pagina: se un file manca o il filmato non parte, resta la copertina
   (components/media/SfondoVideo.tsx è fail-safe). Una voce per un codice che
   non è nel catalogo non fa niente. Lo YouTube della scheda resta nella
   sezione #video, come prima.

   `ai: true` = filmato generato con l'AI a partire dalle foto dell'immobile:
   sul video compare l'etichetta di trasparenza (art. 50 Reg. UE 2024/1689, AI
   Act) nelle quattro lingue (sfondoVideoStrings.ts). Un video girato davvero si
   registra con `ai: false`. `fotoRitoccate: true` quando le foto di partenza
   erano a loro volta ritoccate con l'AI: l'etichetta lo dice («ritoccate con
   AI e animate con AI», la frase di triesteaffitti.com). Senza, l'etichetta
   dice solo che il video è generato con l'AI dalle foto dell'immobile — vera
   in tutti e due i casi; non si scrive `fotoRitoccate` a caso.

   Codifica: H.264 yuv420p, `+faststart`, senza traccia audio. `mp4` 1080p per
   gli schermi larghi, `mp4Sm` 720p sotto i 640 px; `poster` un fotogramma in
   WebP (1920×1080), `posterSm` lo stesso a 960×540. Il poster oggi la scheda
   non lo scarica (sotto il video c'è già la copertina): sta nel registro per
   parità di formato con gli altri siti. */

export type VideoAnnuncio = {
  /** 1080p, per gli schermi larghi. */
  mp4: string;
  /** 720p, sotto i 640 px di larghezza. Senza, si usa `mp4` ovunque. */
  mp4Sm?: string;
  /** Un fotogramma del filmato (WebP). */
  poster?: string;
  /** Lo stesso fotogramma, più leggero, sotto i 640 px. */
  posterSm?: string;
  /** Generato con l'AI: mostra l'etichetta di trasparenza sul video. */
  ai: boolean;
  /** Le foto di partenza erano già ritoccate con l'AI (cambia la frase). */
  fotoRitoccate?: boolean;
};

export const ANNUNCI_VIDEO: Readonly<Record<string, VideoAnnuncio>> = {
  // Villa con piscina e dependance a Ronchi dei Legionari, 01/10/2026: 10 clip
  // Kling 3.0 (solo carrello in avanti) dalle foto della galleria, a loro volta
  // ritoccate con l'AI; loop senza stacco di 24 s, muto. Hash nel nome.
  "TSV-PROP-0040": {
    mp4: "/media/annunci/villa-ronchi/hero-626eeb37-1080.mp4",
    mp4Sm: "/media/annunci/villa-ronchi/hero-626eeb37-720.mp4",
    poster: "/media/annunci/villa-ronchi/hero-626eeb37-poster.webp",
    posterSm: "/media/annunci/villa-ronchi/hero-626eeb37-poster-sm.webp",
    ai: true,
    fotoRitoccate: true,
  },
};

const MEDIA = "/media/annunci/";
const file = (v: unknown, est: RegExp) => typeof v === "string" && v.startsWith(MEDIA) && est.test(v);

/** Una voce è usabile solo se i file stanno sotto /media/annunci/ e hanno
 *  l'estensione giusta: un refuso nel registro non deve mettere un URL esterno
 *  nell'hero (stessa guardia di triesteaffitti.com e triestevillas.com). */
function valida(v: VideoAnnuncio | undefined): v is VideoAnnuncio {
  return (
    !!v &&
    file(v.mp4, /\.mp4$/) &&
    (v.mp4Sm === undefined || file(v.mp4Sm, /\.mp4$/)) &&
    (v.poster === undefined || file(v.poster, /\.(webp|jpe?g|avif)$/)) &&
    (v.posterSm === undefined || file(v.posterSm, /\.(webp|jpe?g|avif)$/)) &&
    typeof v.ai === "boolean" &&
    (v.fotoRitoccate === undefined || typeof v.fotoRitoccate === "boolean")
  );
}

/** Il video di testata di un immobile, o null (la scheda resta com'era).
 *  La chiave è il codice di catalogo (TSV-PROP-…), mai l'id del record. */
export function videoAnnuncio(code: string | null | undefined): VideoAnnuncio | null {
  const k = code?.trim().toUpperCase();
  if (!k || !Object.prototype.hasOwnProperty.call(ANNUNCI_VIDEO, k)) return null;
  const v = ANNUNCI_VIDEO[k];
  return valida(v) ? v : null;
}
