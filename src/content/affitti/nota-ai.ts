// La nota sull'uso dell'AI nelle foto di ciascun soggiorno, nelle quattro
// lingue: è il riassunto del registro foto per foto della lavorazione
// (KB: progetti/<casa>/FOTO-2026-10-07.md e il LEGGIMI della consegna).
// Ogni paragrafo è un elemento dell'array. Mai una frase che il registro non provi.
import type { Lingua, SlugCasa } from "./case";

export const NOTA_AI: Record<SlugCasa, Record<Lingua, string[]>> = {
  "top-hill-cottage": { it: [], en: [], de: [], sl: [] },
  "chalet-navauce": { it: [], en: [], de: [], sl: [] },
};
