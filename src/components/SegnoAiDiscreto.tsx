// Il segno DISCRETO della home (SPEC trasparenza v1.3 §11.1, 02/10/2026):
// nella home di ogni sito nessuna pillola AI; l'unica eccezione è un'immagine
// che mostra cose che non esistono (simulazione, rendering) o un video animato
// o generato con l'AI — e lì basta un testo piccolo («simulazione», «video
// AI»), non la pillola. La dichiarazione completa resta nella scheda.
//
// Leggibile su qualunque fondo (il testo non deve mai dipendere dallo sfondo):
//   · `foto`  — sopra una foto o un video: in basso a destra, su una sfumatura
//     nera al 60% che parte dal bordo. Contro il fotogramma più chiaro (bianco)
//     il fondo composto sotto il testo è ~#666, contrasto col bianco ~5,7:1;
//   · `pagina` — fuori dall'immagine, sul fondo chiaro del sito (neutral-500
//     su carta: ~4,8:1);
//   · `scuro` — sul fondo pieno brand-dark della sezione (bianco al 75%).
// Il testo per i lettori di schermo porta anche la descrizione (in `sr-only`:
// l'aria-label su uno span non lo legge nessuno in modo affidabile).
// Senza `testo` non disegna niente: il segno sta nel codice di ogni punto della
// home anche quando oggi non serve (il prebuild lo controlla), e compare da
// solo il giorno in cui il CRM dice che quel video o quella foto è AI.
// Componente di presentazione, niente hook.

export type DatiSegno = {
  testo: string;
  descrizione?: string | null;
  /** la lingua VERA della descrizione, se diversa da quella del segno (ripiego en/it) */
  descrizioneLang?: string | null;
  lang?: string;
} | null;

export default function SegnoAiDiscreto({
  dati,
  tono = "foto",
  className = "",
}: {
  dati: DatiSegno;
  tono?: "foto" | "pagina" | "scuro";
  className?: string;
}) {
  if (!dati) return null;
  const testo = (
    <>
      {dati.testo}
      {dati.descrizione && (
        <span className="sr-only" lang={dati.descrizioneLang ?? undefined}>
          : {dati.descrizione}
        </span>
      )}
    </>
  );
  if (tono === "foto")
    return (
      <span
        lang={dati.lang}
        data-segno-ai=""
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex justify-end bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6 ${className}`}
      >
        <span className="text-[11px] font-medium leading-4 tracking-[0.02em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]">
          {testo}
        </span>
      </span>
    );
  return (
    <span
      lang={dati.lang}
      data-segno-ai=""
      className={`text-[11px] font-medium leading-4 tracking-[0.02em] ${
        tono === "scuro" ? "text-white/75" : "text-neutral-500"
      } ${className}`}
    >
      {testo}
    </span>
  );
}
