// I loop di testata delle pagine d'area (07/10/2026): image-to-video da foto a
// licenza libera (src/content/aree/foto.ts), quindi animati con l'AI e
// dichiarati con l'etichetta in quattro lingue. Registro dei modelli, prompt e
// verifiche nella KB (progetti/friulivillas/RIPRESA.md). Un'area senza voce qui
// mostra la foto ferma.
import type { AreaId, Lingua } from "@/lib/aree";
import type { EtichettaVideoDati } from "@/lib/videoAi";

export type VideoArea = { src: string; poster: string; etichetta: Record<Lingua, EtichettaVideoDati> };

const etichetta = (didascalia: Record<Lingua, string>): Record<Lingua, EtichettaVideoDati> => {
  const testo = { it: "Video animato con l'AI", en: "AI-animated video", de: "Mit KI animiertes Video", sl: "Video, animiran z UI" };
  return Object.fromEntries(
    (Object.keys(testo) as Lingua[]).map((l) => [
      l,
      { testo: testo[l], lang: l, didascalia: didascalia[l], didascaliaLang: l, aria: `${testo[l]}: ${didascalia[l]}` },
    ]),
  ) as Record<Lingua, EtichettaVideoDati>;
};

// Modello: Higgsfield seedance_2_5 (image-to-video, 5 s), push-in lento e solo
// acqua, nuvole, fronde e luce in movimento; verificato a occhio su tre
// fotogrammi contro la foto (07/10/2026). Crossfade di 0,5 s per chiudere il loop.
const DIDA: Record<AreaId, Record<Lingua, string>> = {
  "costa-laguna": {
    it: "La foto di Grado e della laguna è animata con l'AI: si muovono solo acqua, nuvole e luce.",
    en: "The photo of Grado and the lagoon is animated with AI: only water, clouds and light move.",
    de: "Das Foto von Grado und der Lagune ist mit KI animiert: Nur Wasser, Wolken und Licht bewegen sich.",
    sl: "Fotografija Gradeža in lagune je animirana z UI: premikajo se le voda, oblaki in svetloba.",
  },
  "colline-pianura": {
    it: "La foto di Cividale è animata con l'AI: si muovono solo acqua, fronde, nuvole e luce.",
    en: "The photo of Cividale is animated with AI: only water, leaves, clouds and light move.",
    de: "Das Foto von Cividale ist mit KI animiert: Nur Wasser, Laub, Wolken und Licht bewegen sich.",
    sl: "Fotografija Čedada je animirana z UI: premikajo se le voda, listje, oblaki in svetloba.",
  },
  montagna: {
    it: "La foto dei laghi di Fusine è animata con l'AI: si muovono solo acqua, nuvole e luce.",
    en: "The photo of the Fusine lakes is animated with AI: only water, clouds and light move.",
    de: "Das Foto der Weißenfelser Seen ist mit KI animiert: Nur Wasser, Wolken und Licht bewegen sich.",
    sl: "Fotografija Belopeških jezer je animirana z UI: premikajo se le voda, oblaki in svetloba.",
  },
  "trieste-carso": {
    it: "La foto del castello di Duino è animata con l'AI: si muovono solo mare, nuvole e luce.",
    en: "The photo of Duino Castle is animated with AI: only sea, clouds and light move.",
    de: "Das Foto von Schloss Duino ist mit KI animiert: Nur Meer, Wolken und Licht bewegen sich.",
    sl: "Fotografija Devinskega gradu je animirana z UI: premikajo se le morje, oblaki in svetloba.",
  },
};

export const VIDEO_AREA: Partial<Record<AreaId, VideoArea>> = Object.fromEntries(
  (Object.keys(DIDA) as AreaId[]).map((a) => [
    a,
    { src: `/media/aree/${a}/loop-1280.mp4`, poster: `/media/aree/${a}/poster-1600.webp`, etichetta: etichetta(DIDA[a]) },
  ]),
);
