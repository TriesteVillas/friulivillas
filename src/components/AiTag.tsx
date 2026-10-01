// L'etichetta AI sulla foto, in alto a destra (SPEC §5.1, Codice di condotta
// UE misura 1.2): visibile senza clic, leggibile su qualunque foto.
//
// Leggibilità: fondo scuro quasi pieno (l'inchiostro del sito, --color-ink, al
// 85%) con un filo chiaro attorno e testo bianco. Contro il BIANCO (la foto più
// chiara possibile) il fondo composto è circa #2f3735 → contrasto col bianco
// ~11,9:1 (misurato sulle schermate, review di design del 01/10); contro il
// nero sale. Il filo `ring-white/35` la stacca dalle foto scure, dove il fondo
// da solo si confonderebbe con l'ombra.
//
// Forma: la pillola `rounded-full` del sito (PropertyBadge, l'header, i bottoni),
// alta 24 px come PropertyBadge, così sulla card le due bolle stanno in riga.
// Niente `backdrop-blur`: all'85% d'opacità non si vede, e nella griglia del
// lightbox sono fino a 55 filtri che il telefono ricalcola a ogni scorrimento.
//
// `variante="originale"`: i colori invertiti (chiaro su scuro → scuro su
// chiaro) per dire a colpo d'occhio che si sta guardando la foto PRIMA dell'AI,
// come il bottone «Vedi l'originale» quando è premuto.
//
// Componente puramente di presentazione (niente hook): i testi arrivano già
// tradotti, così lo usano allo stesso modo le pagine server e i componenti client.

export default function AiTag({
  testo,
  aria,
  compatta = false,
  variante = "ai",
  className = "",
}: {
  /** «AI · modificata», «Originale»… o la sola sigla «AI» sulle miniature */
  testo: string;
  /** cosa legge il lettore di schermo: CORTO (sta dentro bottoni e link) */
  aria: string;
  compatta?: boolean;
  variante?: "ai" | "originale";
  /** posizione: chi la usa la mette in alto a destra del proprio riquadro */
  className?: string;
}) {
  const colori =
    variante === "originale"
      ? "bg-white/90 text-ink ring-1 ring-black/10"
      : "bg-ink/85 text-white ring-1 ring-white/35";
  return (
    <span
      role="img"
      aria-label={aria}
      title={aria}
      className={`pointer-events-auto inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold shadow-sm ${colori} ${
        compatta
          ? "h-6 min-w-6 px-2 text-[11px] leading-4 tracking-[0.06em]"
          : "px-2.5 py-1 text-xs leading-4 tracking-[0.02em]"
      } ${className}`}
    >
      {testo}
    </span>
  );
}
