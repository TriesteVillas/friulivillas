"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// Il «programma» del visitatore: le esperienze del territorio che ha messo da
// parte scorrendo le stagioni. Lo legge il modulo di preventivo, che le manda
// con la richiesta: chi risponde sa già cosa organizzare. Vive solo nel
// browser (sessionStorage, ogni accesso protetto: in una finestra privata può
// non esserci), mai in un URL.

type Ctx = {
  scelte: string[];
  cambia: (id: string) => void;
  togli: (id: string) => void;
  svuota: () => void;
};

const ProgrammaCtx = createContext<Ctx | null>(null);
const CHIAVE = "fv-affitti-programma";

export function ProgrammaProvider({ children }: { children: ReactNode }) {
  const [scelte, setScelte] = useState<string[]>([]);

  useEffect(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem(CHIAVE) ?? "[]");
      if (Array.isArray(v)) setScelte(v.filter((x): x is string => typeof x === "string").slice(0, 30));
    } catch {
      /* niente memoria: si parte vuoti */
    }
  }, []);

  const salva = useCallback((v: string[]) => {
    setScelte(v);
    try {
      sessionStorage.setItem(CHIAVE, JSON.stringify(v));
    } catch {
      /* va bene lo stesso */
    }
  }, []);

  const valore = useMemo<Ctx>(
    () => ({
      scelte,
      cambia: (id) => salva(scelte.includes(id) ? scelte.filter((x) => x !== id) : [...scelte, id]),
      togli: (id) => salva(scelte.filter((x) => x !== id)),
      svuota: () => salva([]),
    }),
    [scelte, salva],
  );

  return <ProgrammaCtx.Provider value={valore}>{children}</ProgrammaCtx.Provider>;
}

export function useProgramma(): Ctx {
  const c = useContext(ProgrammaCtx);
  if (!c) throw new Error("useProgramma fuori da ProgrammaProvider");
  return c;
}
