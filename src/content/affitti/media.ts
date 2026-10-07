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

export type MediaCasa = {
  testata: { giorno: VideoLuce | null; oro: VideoLuce | null; notte: VideoLuce | null };
  volo: { mp4: string; mp4Sm: string; poster: string } | null;
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
      oro: null,
      notte: null,
    },
    volo: { mp4: `${TH}/volo-540-f2af674c.mp4`, mp4Sm: `${TH}/volo-360-1318125a.mp4`, poster: `${TH}/volo-poster-8a520142.webp` },
  },
  "chalet-navauce": {
    testata: { giorno: null, oro: null, notte: null },
    volo: null,
  },
};

export function datiVideo(v: VideoLuce | null, lingua: Lingua) {
  if (!v?.ai) return null;
  const testo = v.ai.etichetta[lingua];
  const didascalia = v.ai.didascalia[lingua];
  return { testo, lang: lingua, didascalia, didascaliaLang: lingua, aria: `${testo}: ${didascalia}` };
}
