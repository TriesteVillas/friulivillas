// L'etichetta AI su un VIDEO (SPEC trasparenza §10): il testo del registro
// `video_trasparenza` del CRM («AI · video animato», «Video · foto AI · voce
// AI»…), in alto a destra del riquadro del video come l'etichetta delle foto,
// visibile per tutta la riproduzione e sul poster o sulla miniatura.
//
// Stesso aspetto di AiTag (la pillola delle foto: fondo ink all'85% con filo
// chiaro, ~11:1 anche su un fotogramma bianco), con due differenze:
//   · l'aria-label porta anche la DIDASCALIA: chi non vede l'etichetta sente
//     per intero che cosa l'AI ha fatto in quel video;
//   · `passante`: sopra un iframe (YouTube) l'etichetta non prende i clic, così
//     i comandi del player sotto di lei restano tutti usabili.
// Senza dati (video senza riga, o riga che non prevede etichetta) non disegna
// niente. Componente di presentazione, niente hook: lo usano allo stesso modo
// le pagine server e i componenti client.
import type { EtichettaVideoDati } from "@/lib/videoAi";

export default function EtichettaVideo({
  dati,
  passante = false,
  className = "",
}: {
  dati: EtichettaVideoDati | null;
  passante?: boolean;
  /** posizione: chi la usa la mette in alto a destra del riquadro del video */
  className?: string;
}) {
  if (!dati) return null;
  return (
    <span
      role="img"
      aria-label={dati.aria}
      title={passante ? undefined : dati.aria}
      lang={dati.lang}
      data-etichetta-video=""
      className={`${passante ? "pointer-events-none" : "pointer-events-auto"} inline-flex select-none items-center justify-center whitespace-nowrap rounded-full bg-ink/85 px-2.5 py-1 text-xs font-semibold leading-4 tracking-[0.02em] text-white shadow-sm ring-1 ring-white/35 [print-color-adjust:exact] ${className}`}
    >
      {dati.testo}
    </span>
  );
}
