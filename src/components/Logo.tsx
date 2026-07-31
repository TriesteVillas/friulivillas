/* eslint-disable @next/next/no-img-element */

// Brand lockup — il wordmark FriuliVillas, vettoriale, nel gradiente sabbia/ottone
// del gruppo (#E8D5AF→#BE9A63). Due file, non un filtro CSS: la versione `avorio`
// è ridisegnata per le superfici scure, dove il gradiente sabbia perde contrasto.
//
// TriesteImmobiliare aveva un mark (la barchetta) separato dal testo. Qui il
// marchio È il lettering: non esiste un simbolo autonomo da affiancargli, e
// inventarne uno avrebbe voluto dire introdurre un elemento di identità che il
// brand non ha.
//
// `<img>` e non `next/image`: sono SVG statici serviti da /public, l'optimizer
// non ha nulla da ottimizzare e in cambio aggiungerebbe una richiesta al suo
// endpoint. Stessa scelta di PhotoImg, per la stessa ragione.

type Tone = "brand" | "light";

const SRC: Record<Tone, string> = {
  brand: "/brand/friulivillas-wordmark.svg",
  light: "/brand/friulivillas-wordmark-avorio.svg",
};

/**
 * Il wordmark da solo, in grande, come elemento decorativo (hero, contatti).
 * Decorativo davvero: il titolo accanto porta già il nome, quindi resta fuori
 * dall'albero di accessibilità invece di farlo leggere due volte.
 */
export function BrandMark({
  tone = "brand",
  className = "h-12 w-auto",
}: {
  tone?: Tone;
  className?: string;
}) {
  return (
    <img
      src={SRC[tone]}
      alt=""
      aria-hidden
      width={317}
      height={75}
      className={className}
    />
  );
}

export default function Logo({
  tone = "brand",
  className = "",
  markClassName = "h-7 w-auto",
}: {
  tone?: Tone;
  className?: string;
  markClassName?: string;
  /** Accettato e ignorato: il wordmark è un'immagine, non testo componibile. */
  wordClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={SRC[tone]}
        alt="FriuliVillas"
        width={317}
        height={75}
        className={markClassName}
      />
    </span>
  );
}
