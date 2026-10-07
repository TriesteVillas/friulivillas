// Le foto delle aree (07/10/2026): solo licenze libere (CC0, pubblico dominio,
// CC BY), verificate sulla pagina sorgente il 07/10 — registro completo nella KB
// (progetti/friulivillas/territorio/FOTO-LICENZE.md). Ritagliate in 16:9 e
// ricompresse (scripts/geo/foto-aree.mjs), nessuna modifica generativa: la CC BY
// chiede l'attribuzione, che sta sotto ogni foto.
import type { AreaId, Lingua } from "@/lib/aree";

export type FotoArea = {
  base: string;
  alt: Record<Lingua, string>;
  autore: string;
  licenza: string;
  licenzaUrl: string;
  fonte: string;
};

export const FOTO_AREA: Record<AreaId, FotoArea> = {
  "costa-laguna": {
    base: "/media/aree/costa-laguna/foto",
    alt: {
      it: "Grado e la laguna viste dall'alto",
      en: "Grado and its lagoon from above",
      de: "Grado und die Lagune von oben",
      sl: "Gradež in laguna od zgoraj",
    },
    autore: "sky_hlv",
    licenza: "CC BY 2.0",
    licenzaUrl: "https://creativecommons.org/licenses/by/2.0/",
    fonte: "https://commons.wikimedia.org/wiki/File:Grado_(Italy)_-_50546814116.jpg",
  },
  "colline-pianura": {
    base: "/media/aree/colline-pianura/foto",
    alt: {
      it: "Cividale del Friuli e il Ponte del Diavolo sul Natisone",
      en: "Cividale del Friuli and the Devil's Bridge over the Natisone",
      de: "Cividale del Friuli und die Teufelsbrücke über den Natisone",
      sl: "Čedad in Hudičev most čez Nadižo",
    },
    autore: "Bernd Thaller",
    licenza: "CC BY 2.0",
    licenzaUrl: "https://creativecommons.org/licenses/by/2.0/",
    fonte: "https://commons.wikimedia.org/wiki/File:Cividale_Panorama_(24645109410).jpg",
  },
  montagna: {
    base: "/media/aree/montagna/foto",
    alt: {
      it: "I laghi di Fusine e il Mangart al tramonto",
      en: "The Fusine lakes and Mount Mangart at sunset",
      de: "Die Weißenfelser Seen und der Mangart bei Sonnenuntergang",
      sl: "Belopeška jezera in Mangart ob sončnem zahodu",
    },
    autore: "Dreamy Pixel",
    licenza: "CC BY 4.0",
    licenzaUrl: "https://creativecommons.org/licenses/by/4.0/",
    fonte: "https://commons.wikimedia.org/wiki/File:Mangart_lake_at_sunset.jpg",
  },
  "trieste-carso": {
    base: "/media/aree/trieste-carso/foto",
    alt: {
      it: "Il castello di Duino sulle falesie del Carso",
      en: "Duino Castle on the Karst cliffs",
      de: "Schloss Duino auf den Karstklippen",
      sl: "Devinski grad na kraških pečinah",
    },
    autore: "Daniel Molina García",
    licenza: "CC0",
    licenzaUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    fonte: "https://commons.wikimedia.org/wiki/File:Castello_di_Duino_from_Castelvecchio.jpg",
  },
};

export function creditoFoto(f: FotoArea, l: Lingua): string {
  const foto = { it: "Foto", en: "Photo", de: "Foto", sl: "Foto" }[l];
  return `${foto}: ${f.autore}, ${f.licenza}, Wikimedia Commons`;
}
