// I video dei soggiorni: la testata nelle tre luci e il volo che segue lo
// scorrimento. File in public/media/affitti/<casa>/video/, nome con l'hash dei
// byte (cache immutabile: un video rifatto cambia nome).
//
// `ai`: null per le riprese VERE (il volo del drone dell'estate 2022, nessun
// modello generativo); per i video animati con l'AI l'etichetta e la
// didascalia nelle quattro lingue, che la pagina passa all'EtichettaVideo.
import type { Lingua, SlugCasa, Testo4 } from "./case";

export type VideoLuce = {
  mp4: string;
  mp4Sm: string;
  poster: string;
  posterSm: string;
  ai: { etichetta: Testo4; didascalia: Testo4 } | null;
};

/** Una banda video a tutta larghezza (BandaVideo): «loop» muto che parte da
 *  solo (le stanze di Top Hill) o «film» col tasto ▶ (il mini-film dello
 *  chalet). Sempre foto animate con l'AI: `ai` non è mai null. */
export type BandaVideoMedia = {
  modo: "loop" | "film";
  mp4: string;
  mp4Sm: string;
  poster: string;
  ai: { etichetta: Testo4; didascalia: Testo4 };
  testi: Record<Lingua, { eyebrow: string; titolo: string; testo: string; play?: string }>;
};

export type MediaCasa = {
  testata: { giorno: VideoLuce | null; oro: VideoLuce | null; notte: VideoLuce | null };
  volo: { mp4: string; mp4Sm: string; poster: string } | null;
  banda: BandaVideoMedia | null;
};

/** L'etichetta dei video animati con l'AI, con le parole delle pagine d'area
 *  (src/content/aree/video.ts). */
export const ETICHETTA_ANIMATO: Testo4 = {
  it: "Video animato con l'AI",
  en: "AI-animated video",
  de: "Mit KI animiertes Video",
  sl: "Video, animiran z UI",
};

const TH = "/media/affitti/top-hill-cottage/video";

export const MEDIA: Record<SlugCasa, MediaCasa> = {
  "top-hill-cottage": {
    testata: {
      giorno: {
        mp4: `${TH}/giorno-1080-07459434.mp4`,
        mp4Sm: `${TH}/giorno-720-4cbe19d9.mp4`,
        poster: `${TH}/giorno-poster-89b5b404.webp`,
        posterSm: `${TH}/giorno-poster-sm-a453790f.webp`,
        ai: null,
      },
      // Tramonto: la simulazione 31 (luce e cielo della sera sulla foto 01) in quattro
      // inquadrature — due animate con Kling, due con un ingrandimento digitale in locale
      // (la foto era stata ricorretta dopo la generazione) — più la sala da pranzo (03).
      oro: {
        mp4: `${TH}/oro-1080-7ea6a948.mp4`,
        mp4Sm: `${TH}/oro-720-24ad2563.mp4`,
        poster: `${TH}/oro-poster-c4ab8d9c.webp`,
        posterSm: `${TH}/oro-poster-sm-f8910579.webp`,
        ai: {
          etichetta: {
            it: "Tramonto simulato con l'AI",
            en: "AI-simulated sunset",
            de: "Mit KI simulierter Sonnenuntergang",
            sl: "Sončni zahod, simuliran z UI",
          },
          didascalia: {
            it: "Simulazione: sulla foto vera della casa la luce della sera e il cielo sono ricreati con l'AI; le ombre restano quelle del pomeriggio. Animazione in parte con l'AI, in parte con un avvicinamento digitale. La sala da pranzo è una foto vera schiarita con l'AI.",
            en: "Simulation: on a real photo of the house, the evening light and sky are recreated with AI; the shadows remain those of the afternoon. Animated partly with AI and partly with a digital zoom. The dining room is a real photo brightened with AI.",
            de: "Simulation: Auf einem echten Foto des Hauses sind Abendlicht und Himmel mit KI nachgebildet; die Schatten bleiben die des Nachmittags. Teils mit KI, teils mit einem digitalen Zoom animiert. Das Esszimmer ist ein echtes, mit KI aufgehelltes Foto.",
            sl: "Simulacija: na resnični fotografiji hiše sta večerna svetloba in nebo poustvarjena z UI; sence ostajajo popoldanske. Animirano deloma z UI in deloma z digitalnim približevanjem. Jedilnica je resnična fotografija, posvetljena z UI.",
          },
        },
      },
      // Notte: le quattro notturne VERE (27, 28, 29, 30), animate con un avvicinamento.
      notte: {
        mp4: `${TH}/notte-1080-cc0bcd55.mp4`,
        mp4Sm: `${TH}/notte-720-505c9fe7.mp4`,
        poster: `${TH}/notte-poster-5b247243.webp`,
        posterSm: `${TH}/notte-poster-sm-dc76bba7.webp`,
        ai: {
          etichetta: ETICHETTA_ANIMATO,
          didascalia: {
            it: "Foto notturne vere della casa, animate con l'AI con un lento avvicinamento; in tre è stata tolta con l'AI una borsa lasciata dietro la vetrata. Le luci accese sono quelle delle foto.",
            en: "Real night photos of the house, animated with AI with a slow push-in; in three, a bag left behind the glass was removed with AI. The lights on are those in the photos.",
            de: "Echte Nachtfotos des Hauses, mit KI animiert, mit einer langsamen Annäherung; auf dreien wurde mit KI eine hinter der Glasfront stehende Tasche entfernt. Die eingeschalteten Lichter sind die der Fotos.",
            sl: "Resnične nočne fotografije hiše, animirane z UI s počasnim približevanjem; na treh je bila z UI odstranjena torba za stekleno steno. Prižgane luči so tiste s fotografij.",
          },
        },
      },
    },
    volo: { mp4: `${TH}/volo-540-f2af674c.mp4`, mp4Sm: `${TH}/volo-360-1318125a.mp4`, poster: `${TH}/volo-poster-8a520142.webp` },
    // Le stanze: sei interni (12, 04, 06, 11, 08, 15) animati con un avvicinamento.
    banda: {
      modo: "loop",
      mp4: `${TH}/stanze-1080-16c811c6.mp4`,
      mp4Sm: `${TH}/stanze-720-34b18330.mp4`,
      poster: `${TH}/stanze-poster-0e91ed94.webp`,
      ai: {
        etichetta: ETICHETTA_ANIMATO,
        didascalia: {
          it: "Le foto degli interni, schiarite con l'AI (in cucina sono stati tolti due cavi) e animate con l'AI con un lento avvicinamento. Stanze, arredi e vedute sono quelli delle foto.",
          en: "The interior photos, brightened with AI (two cables were removed in the kitchen) and animated with AI with a slow push-in. Rooms, furniture and views are those in the photos.",
          de: "Die Innenfotos, mit KI aufgehellt (in der Küche wurden zwei Kabel entfernt) und mit KI animiert, mit einer langsamen Annäherung. Räume, Möbel und Ausblicke sind die der Fotos.",
          sl: "Fotografije notranjosti, posvetljene z UI (v kuhinji sta bila odstranjena dva kabla) in animirane z UI s počasnim približevanjem. Prostori, pohištvo in razgledi so tisti s fotografij.",
        },
      },
      testi: {
        it: {
          eyebrow: "Dentro",
          titolo: "Le stanze, piano.",
          testo: "L'ingresso, la sala da pranzo, la cucina con la stufa, il soggiorno col camino, la scala davanti alla vetrata, la camera sotto le travi.",
        },
        en: {
          eyebrow: "Inside",
          titolo: "The rooms, slowly.",
          testo: "The entrance, the dining room, the kitchen with its stove, the living room with the fireplace, the staircase by the glass wall, the bedroom under the beams.",
        },
        de: {
          eyebrow: "Drinnen",
          titolo: "Die Räume, in Ruhe.",
          testo: "Der Eingang, das Esszimmer, die Küche mit dem Ofen, das Wohnzimmer mit dem Kamin, die Treppe vor der Glaswand, das Schlafzimmer unter den Balken.",
        },
        sl: {
          eyebrow: "Notranjost",
          titolo: "Prostori, počasi.",
          testo: "Vhod, jedilnica, kuhinja s pečjo, dnevna soba s kaminom, stopnišče ob stekleni steni, spalnica pod tramovi.",
        },
      },
    },
  },
  "chalet-navauce": {
    testata: { giorno: null, oro: null, notte: null },
    volo: null,
    banda: null,
  },
};

export function datiVideo(v: { ai: VideoLuce["ai"] } | null, lingua: Lingua) {
  if (!v?.ai) return null;
  const testo = v.ai.etichetta[lingua];
  const didascalia = v.ai.didascalia[lingua];
  return { testo, lang: lingua, didascalia, didascaliaLang: lingua, aria: `${testo}: ${didascalia}` };
}
