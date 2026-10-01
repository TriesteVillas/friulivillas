// L'etichetta AI sulla foto, in alto a destra (SPEC §5.1, Codice di condotta
// UE misura 1.2): visibile senza clic, leggibile su qualunque foto.
//
// Leggibilità: fondo scuro quasi pieno (l'inchiostro del sito, --color-ink, al
// 85%) con un filo chiaro attorno e testo bianco. Contro il BIANCO (la foto più
// chiara possibile) il fondo composto è circa #3b4441 → contrasto col bianco
// ~10:1; contro il nero sale. Il filo `ring-white/35` la stacca dalle foto
// scure, dove il fondo da solo si confonderebbe con l'ombra.
//
// Componente puramente di presentazione (niente hook): i testi arrivano già
// tradotti, così lo usano allo stesso modo le pagine server e i componenti client.

export default function AiTag({
  testo,
  aria,
  compatta = false,
  className = "",
}: {
  /** «AI · modificata», «Originale»… o la sola sigla «AI» sulle miniature */
  testo: string;
  /** cosa legge il lettore di schermo: etichetta e didascalia insieme */
  aria: string;
  compatta?: boolean;
  /** posizione: chi la usa la mette in alto a destra del proprio riquadro */
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={aria}
      title={aria}
      className={`pointer-events-auto inline-flex select-none items-center whitespace-nowrap rounded-md bg-ink/85 font-semibold text-white shadow-sm ring-1 ring-white/35 backdrop-blur-sm ${
        compatta
          ? "px-1.5 py-0.5 text-[11px] leading-4 tracking-[0.06em]"
          : "px-2 py-1 text-xs leading-4 tracking-[0.02em]"
      } ${className}`}
    >
      {testo}
    </span>
  );
}
