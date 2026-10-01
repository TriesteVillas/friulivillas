// Stringhe del video di testata della scheda (SfondoVideo.tsx), nelle quattro
// lingue: le stesse di triestevillas.com (sfondoVideoStrings.ts di quel repo).
// Pattern `*Strings.ts` + Record a quattro chiavi: niente chiavi nuove in
// messages/*.json (check-messages le vorrebbe in tutti e quattro i dizionari),
// e il typecheck obbliga il ramo sloveno.
//
// L'etichetta AI è un obbligo, non un ornamento (AI Act art. 50 §4, protocollo
// spot-video-immobile del KB): il video è fatto di foto dell'immobile animate
// con un modello generativo, e chi guarda lo deve leggere sul video stesso, non
// solo nella pagina /ai. Due frasi, scelte dal registro (content/annunciVideo.ts):
//   · `aiLabel`: il video è generato con l'AI dalle foto dell'immobile — vera
//     sempre, non dice niente sulle foto di partenza;
//   · `aiLabelRitoccate` (voce con `fotoRitoccate: true`): le foto di partenza
//     erano già ritoccate con l'AI, e lo dice — la frase di triesteaffitti.com
//     (sfondoVideoStrings.ts di quel repo), con «immobile» al posto di «casa»
//     perché qui si vendono anche appartamenti.
// Sloveno: «nepremičnina» (vale per casa e appartamento), «umetna inteligenca»
// per esteso; pausa e ripresa con le parole di triestevillas.com.
// `aiLink` serve solo quando la pagina /ai esiste (PAGINA_AI_ONLINE nella
// scheda): fino ad allora l'etichetta resta senza link.

type HomeLang = "it" | "en" | "de" | "sl";
// Ramo `sl` esplicito: senza, lo sloveno cadrebbe sull'italiano senza errore.
const asLang = (locale: string): HomeLang =>
  locale === "en" || locale === "de" || locale === "sl" ? locale : "it";

export type SfondoVideoStrings = {
  /** La dichiarazione sul video. */
  aiLabel: string;
  /** La stessa, quando le foto di partenza erano già ritoccate con l'AI. */
  aiLabelRitoccate: string;
  /** Il link alla pagina /ai. */
  aiLink: string;
  /** Tasto di pausa (WCAG 2.2.2): etichetta d'AZIONE, cambia con lo stato. */
  pause: string;
  resume: string;
  /** Nome del gruppo dei comandi per i lettori di schermo: «Video: {titolo}». */
  group: string;
};

export const SFONDO_VIDEO_STRINGS: Record<HomeLang, SfondoVideoStrings> = {
  it: {
    aiLabel: "Video generato con l'AI dalle foto di questo immobile",
    aiLabelRitoccate: "Video dalle foto di questo immobile, ritoccate con AI e animate con AI",
    aiLink: "Come usiamo l'AI",
    pause: "Metti in pausa il video",
    resume: "Riprendi il video",
    group: "Video",
  },
  en: {
    aiLabel: "Video generated with AI from photos of this property",
    aiLabelRitoccate: "Video from photos of this property, retouched with AI and animated with AI",
    aiLink: "How we use AI",
    pause: "Pause the video",
    resume: "Play the video",
    group: "Video",
  },
  de: {
    aiLabel: "Mit KI erzeugtes Video aus Fotos dieser Immobilie",
    aiLabelRitoccate: "Video aus Fotos dieser Immobilie, mit KI retuschiert und mit KI animiert",
    aiLink: "Wie wir KI einsetzen",
    pause: "Video anhalten",
    resume: "Video fortsetzen",
    group: "Video",
  },
  sl: {
    aiLabel: "Video, ustvarjen z umetno inteligenco iz fotografij te nepremičnine",
    aiLabelRitoccate: "Video iz fotografij te nepremičnine, retuširanih in animiranih z umetno inteligenco",
    aiLink: "Kako uporabljamo umetno inteligenco",
    pause: "Ustavite video",
    resume: "Predvajajte video",
    group: "Video",
  },
};

export const tSfondoVideo = (locale: string): SfondoVideoStrings => SFONDO_VIDEO_STRINGS[asLang(locale)];
