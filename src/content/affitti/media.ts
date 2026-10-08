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
const CN = "/media/affitti/chalet-navauce/video";

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
    testata: {
      // Giorno: 01, 03, 02, 08, 06, 05, tutte animate con Kling.
      giorno: {
        mp4: `${CN}/giorno-1080-18121c2e.mp4`,
        mp4Sm: `${CN}/giorno-720-4a4ff5ef.mp4`,
        poster: `${CN}/giorno-poster-e939cb5b.webp`,
        posterSm: `${CN}/giorno-poster-sm-515be8ba.webp`,
        ai: {
          etichetta: ETICHETTA_ANIMATO,
          didascalia: {
            it: "Foto dello chalet di giorno, ritoccate con l'AI (in gran parte immagini piccole ricostruite dal modello) e animate con l'AI con un lento avvicinamento.",
            en: "Daytime photos of the chalet, retouched with AI (mostly small images rebuilt by the model) and animated with AI with a slow push-in.",
            de: "Tagesfotos des Chalets, mit KI bearbeitet (größtenteils kleine, vom Modell rekonstruierte Bilder) und mit KI animiert, mit einer langsamen Annäherung.",
            sl: "Dnevne fotografije brunarice, obdelane z UI (večinoma majhne slike, ki jih je poustvaril model) in animirane z UI s počasnim približevanjem.",
          },
        },
      },
      // Sera: le simulazioni 28 e 27 (Kling) e 29 (ingrandimento digitale).
      oro: {
        mp4: `${CN}/oro-1080-ecad84da.mp4`,
        mp4Sm: `${CN}/oro-720-b5ce5c4f.mp4`,
        poster: `${CN}/oro-poster-2758c93f.webp`,
        posterSm: `${CN}/oro-poster-sm-3d8d4f88.webp`,
        ai: {
          etichetta: {
            it: "Sera simulata con l'AI",
            en: "AI-simulated evening",
            de: "Mit KI simulierter Abend",
            sl: "Večer, simuliran z UI",
          },
          didascalia: {
            it: "Simulazione: le foto vere dello chalet con la luce della sera e del tramonto ricreata con l'AI. Animazione in parte con l'AI, in parte con un avvicinamento digitale.",
            en: "Simulation: real photos of the chalet with the evening and sunset light recreated with AI. Animated partly with AI and partly with a digital zoom.",
            de: "Simulation: echte Fotos des Chalets, Abend- und Sonnenuntergangslicht mit KI nachgebildet. Teils mit KI, teils mit einem digitalen Zoom animiert.",
            sl: "Simulacija: resnične fotografije brunarice z večerno svetlobo in sončnim zahodom, poustvarjenima z UI. Animirano deloma z UI in deloma z digitalnim približevanjem.",
          },
        },
      },
      // Notte: la simulazione 30 (Kling), poi la notte vera 26 (ingrandimento digitale).
      notte: {
        mp4: `${CN}/notte-1080-8eefb6b1.mp4`,
        mp4Sm: `${CN}/notte-720-4f0bccdd.mp4`,
        poster: `${CN}/notte-poster-b627b79e.webp`,
        posterSm: `${CN}/notte-poster-sm-58c864a2.webp`,
        ai: {
          etichetta: {
            it: "Notte simulata con l'AI",
            en: "AI-simulated night",
            de: "Mit KI simulierte Nacht",
            sl: "Noč, simulirana z UI",
          },
          didascalia: {
            it: "La prima inquadratura è una simulazione: lo chalet di notte con accese le quattro finestre e il faretto che esistono, ricreato e animato con l'AI. La seconda è una foto notturna vera, avvicinata con un ingrandimento digitale.",
            en: "The first shot is a simulation: the chalet at night with its four windows and the gable spotlight lit, recreated and animated with AI. The second is a real night photo, brought closer with a digital zoom.",
            de: "Die erste Einstellung ist eine Simulation: das Chalet bei Nacht mit den vier Fenstern und dem Giebelstrahler erleuchtet, mit KI nachgebildet und animiert. Die zweite ist ein echtes Nachtfoto, mit einem digitalen Zoom herangeholt.",
            sl: "Prvi kader je simulacija: brunarica ponoči s štirimi prižganimi okni in žarometom na zatrepu, poustvarjena in animirana z UI. Drugi je resnična nočna fotografija, približana z digitalnim približevanjem.",
          },
        },
      },
    },
    volo: null,
    // Il film dello chalet (44 s): 18 inquadrature, 7 delle quali ingrandimenti digitali
    // senza AI; tramonto (29), sere (27, 28) e prima notte (30) sono simulazioni.
    banda: {
      modo: "film",
      mp4: `${CN}/film-1080-27f2a3dc.mp4`,
      mp4Sm: `${CN}/film-720-7d7fdc14.mp4`,
      poster: `${CN}/film-poster-1622e647.webp`,
      ai: {
        etichetta: ETICHETTA_ANIMATO,
        didascalia: {
          it: "Le foto dello chalet, ritoccate con l'AI, animate con l'AI e montate in sequenza; sette inquadrature sono un semplice ingrandimento digitale, senza animazione AI. Il tramonto, le due sere e la prima notte sono simulazioni; l'ultima inquadratura è la notte vera.",
          en: "The chalet's photos, retouched with AI, animated with AI and edited in sequence; seven shots are a plain digital zoom, without AI animation. The sunset, the two evenings and the first night are simulations; the last shot is the real night.",
          de: "Die Fotos des Chalets, mit KI bearbeitet, mit KI animiert und aneinandergeschnitten; sieben Einstellungen sind ein einfacher digitaler Zoom ohne KI-Animation. Der Sonnenuntergang, die beiden Abende und die erste Nacht sind Simulationen; die letzte Einstellung ist die echte Nacht.",
          sl: "Fotografije brunarice, obdelane z UI, animirane z UI in zmontirane v zaporedje; sedem kadrov je le digitalno približevanje, brez animacije z UI. Sončni zahod, oba večera in prva noč so simulacije; zadnji kader je resnična noč.",
        },
      },
      testi: {
        it: {
          eyebrow: "Il film dello chalet",
          titolo: "Dall'arrivo alla notte.",
          testo: "La valle, lo steccato, il sentiero di lastre, il prato, la pietra e il larice, le camere, la terrazza e le pecore; poi la sera e la notte. Quarantaquattro secondi, senza audio.",
          play: "Guarda il film",
        },
        en: {
          eyebrow: "The chalet film",
          titolo: "From arrival to night.",
          testo: "The valley, the fence, the flagstone path, the meadow, stone and larch, the bedrooms, the terrace and the sheep; then evening and night. Forty-four seconds, no sound.",
          play: "Watch the film",
        },
        de: {
          eyebrow: "Der Film zum Chalet",
          titolo: "Von der Ankunft bis zur Nacht.",
          testo: "Das Tal, der Zaun, der Plattenweg, die Wiese, Stein und Lärche, die Zimmer, die Terrasse und die Schafe; dann Abend und Nacht. Vierundvierzig Sekunden, ohne Ton.",
          play: "Film ansehen",
        },
        sl: {
          eyebrow: "Film o brunarici",
          titolo: "Od prihoda do noči.",
          testo: "Dolina, ograja, pot iz kamnitih plošč, travnik, kamen in macesen, sobe, terasa in ovce; nato večer in noč. Štiriinštirideset sekund, brez zvoka.",
          play: "Oglejte si film",
        },
      },
    },
  },
};

export function datiVideo(v: { ai: VideoLuce["ai"] } | null, lingua: Lingua) {
  if (!v?.ai) return null;
  const testo = v.ai.etichetta[lingua];
  const didascalia = v.ai.didascalia[lingua];
  return { testo, lang: lingua, didascalia, didascaliaLang: lingua, aria: `${testo}: ${didascalia}` };
}
