// Le esperienze del territorio che il visitatore può mettere nel suo programma
// («Componi il soggiorno»): ogni voce è un luogo o un'attività VERIFICATI nel
// dossier del territorio della KB (progetti/tophill-cottage/territorio/), con la
// distanza misurata da Viaso. Il server accetta solo questi id.
import type { SlugCasa, Testo4 } from "./case";

export type Stagione = "primavera" | "estate" | "autunno" | "inverno";

export type Esperienza = {
  id: string;
  titolo: Testo4;
  testo: Testo4;
  stagioni: Stagione[];
  /** per quali case la proponiamo */
  case: SlugCasa[];
  /** minuti in auto da ciascuna casa (OSRM, senza traffico), se misurati */
  minuti: Partial<Record<SlugCasa, number>>;
  /** fonte (URL) nel dossier: non si mostra */
  fonte: string;
};

export const ESPERIENZE: Esperienza[] = [];

export const ESPERIENZE_ID: ReadonlySet<string> = new Set(ESPERIENZE.map((e) => e.id));
