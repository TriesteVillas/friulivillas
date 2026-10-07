// Il territorio attorno alle due case: i luoghi della «rosa dei tempi», con le
// coordinate e i minuti d'auto MISURATI (OSRM, senza traffico) dalla casa.
// Fonte: KB progetti/tophill-cottage/territorio/ (distanze.json, cosa-fare.md).
import type { PuntoRosa } from "@/components/affitti/RosaTempi";
import type { Lingua, SlugCasa } from "./case";

export const ROSA: Record<SlugCasa, Array<Omit<PuntoRosa, "nome"> & { nome: Partial<Record<Lingua, string>> & { it: string } }>> = {
  "top-hill-cottage": [],
  "chalet-navauce": [],
};
