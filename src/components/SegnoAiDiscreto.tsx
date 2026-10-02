// Il segno DISCRETO della home (SPEC trasparenza v1.3 §11.1, 02/10/2026):
// nella home di ogni sito nessuna pillola AI; l'unica eccezione è un'immagine
// che mostra cose che non esistono (simulazione, rendering) o un video animato
// o generato con l'AI — e lì basta un testo piccolo («simulazione», «video
// AI»), non la pillola. La dichiarazione completa resta nella scheda.
//
// Leggibile su qualunque fondo (il testo non deve mai dipendere dallo sfondo):
//   · `foto`  — sopra una foto o un video, in basso a destra, su una piastrina
//     PIENA nera al 60% (la stessa di triesteimmobiliare.com): sul fotogramma
//     più chiaro (bianco) il fondo sotto le lettere è #666, contrasto col
//     bianco 5,7:1. Fino al 02/10 era una sfumatura alta 48 px: sotto le
//     lettere l'opacità scendeva a 0,30-0,50, e su una foto chiara il testo
//     stava a 2,2-3,7:1 (review di misura);
//   · `pagina` — fuori dall'immagine, sul fondo chiaro del sito: neutral-600,
//     ~7:1 anche sul fondo azzurrino sotto il video d'apertura (neutral-500
//     lì stava a 4,3:1). La discrezione la dà la misura, non il grigio chiaro;
//   · `scuro` — sul fondo pieno brand-dark della sezione (bianco al 75%, 8,2:1).
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
        className={`pointer-events-none absolute bottom-2 right-2 z-[2] rounded-[3px] bg-black/60 px-1.5 py-px text-[11px] font-medium leading-4 tracking-[0.02em] text-white [print-color-adjust:exact] ${className}`}
      >
        {testo}
      </span>
    );
  return (
    <span
      lang={dati.lang}
      data-segno-ai=""
      className={`text-[11px] font-medium leading-4 tracking-[0.02em] ${
        tono === "scuro" ? "text-white/75" : "text-neutral-600"
      } ${className}`}
    >
      {testo}
    </span>
  );
}
