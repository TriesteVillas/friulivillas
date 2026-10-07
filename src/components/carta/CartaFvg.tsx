import { Link } from "@/i18n/navigation";
import { AREE, NOMI_AREA, type AreaId, type Lingua } from "@/lib/aree";
import { ALTEZZA, LARGHEZZA, proietta, riquadroArea } from "@/lib/carta";
import { AREE_FORME, COSTA_D, REGIONE_D } from "@/content/carta/forme";

/* La carta in luce del Friuli Venezia Giulia (07/10/2026).
   Rilievo Copernicus GLO-90 (AVIF) + aree, costa e fuori-regione in SVG nello
   stesso Mercatore + punti in HTML (link veri, leggibili dai motori e dai
   lettori di schermo). Nessun JavaScript: è un server component. */

export type PuntoCarta = {
  id: string;
  lat: number;
  lng: number;
  tipo: "casa" | "affitto" | "gruppo" | "citta";
  etichetta: string;
  /** seconda riga, piccola (prezzo, «sito del gruppo»…) */
  nota?: string;
  href?: string;
  esterno?: boolean;
  /** coordinate del comune, non della casa */
  approssimato?: boolean;
};

export const COLORE_AREA: Record<AreaId, string> = {
  "costa-laguna": "#3f7f9a",
  "colline-pianura": "#b8963f",
  montagna: "#2a5f43",
  "trieste-carso": "#8a7766",
};

const TRAMA: Record<AreaId, string> = {
  "costa-laguna": "M0 6 Q3 3 6 6 T12 6",
  "colline-pianura": "M0 12 L12 0",
  montagna: "M0 9 L4.5 3 L9 9",
  "trieste-carso": "M3 3 h.01 M9 9 h.01",
};

export default function CartaFvg({
  locale,
  punti = [],
  evidenzia,
  ritaglio,
  etichetteAree = true,
  conteggi,
  titolo,
  className = "",
  priority = false,
  etichetteCase = false,
  notaApprossimato,
}: {
  locale: Lingua;
  punti?: PuntoCarta[];
  evidenzia?: AreaId | null;
  ritaglio?: AreaId | null;
  etichetteAree?: boolean;
  /** case per area, per l'etichetta («2 in vendita») */
  conteggi?: Partial<Record<AreaId, string>>;
  titolo: string;
  className?: string;
  priority?: boolean;
  /** etichette delle case sempre visibili (carte ritagliate); altrimenti al passaggio o al focus */
  etichetteCase?: boolean;
  /** «posizione indicativa: sede del comune», per le case senza coordinate */
  notaApprossimato?: string;
}) {
  const box = ritaglio ? riquadroArea(ritaglio) : { x: 0, y: 0, w: LARGHEZZA, h: ALTEZZA };
  const pct = (v: number, base: number, tot: number) => `${(((v - base) / tot) * 100).toFixed(3)}%`;
  // Una città di riferimento accanto a una casa (Grado, Palmanova…) copre il segnaposto: si toglie.
  const case_ = punti.filter((p) => p.tipo === "casa" || p.tipo === "affitto");
  const visibili = punti.filter(
    (p) => p.tipo !== "citta" || !case_.some((c) => Math.hypot((c.lat - p.lat) * 111, (c.lng - p.lng) * 78) < 7),
  );
  const scala = LARGHEZZA / box.w; // quanto è ingrandita la carta rispetto a quella intera
  const tratto = 1.6 / Math.sqrt(scala);

  return (
    <figure className={`carta-fvg relative ${className}`} aria-label={titolo}>
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${box.w} / ${box.h}` }}>
        {/* Il rilievo, dimensionato in modo che il riquadro scelto riempia il contenitore. */}
        <picture>
          <source
            type="image/avif"
            srcSet="/geo/rilievo-fvg-800.avif 800w, /geo/rilievo-fvg-1600.avif 1600w"
            sizes={ritaglio ? "100vw" : "(min-width: 1024px) 70vw, 100vw"}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/geo/rilievo-fvg-800.webp"
            alt=""
            width={LARGHEZZA}
            height={ALTEZZA}
            decoding="async"
            fetchPriority={priority ? "high" : undefined}
            loading={priority ? "eager" : "lazy"}
            className="absolute max-w-none select-none"
            style={{
              width: `${(LARGHEZZA / box.w) * 100}%`,
              left: `${(-box.x / box.w) * 100}%`,
              top: `${(-box.y / box.h) * 100}%`,
            }}
          />
        </picture>

        <svg
          viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {AREE.map((a) => (
              <pattern key={a} id={`trama-${a}`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform={`scale(${(1.6 / Math.sqrt(scala)).toFixed(2)})`}>
                <path d={TRAMA[a]} stroke={COLORE_AREA[a]} strokeWidth="1.1" strokeLinecap="round" fill="none" opacity=".55" />
              </pattern>
            ))}
          </defs>
          {/* Fuori regione: smorzato, così si legge il confine. */}
          <path d={`M0,0H${LARGHEZZA}V${ALTEZZA}H0Z${REGIONE_D}`} fill="#f6f3ec" fillOpacity=".72" fillRule="evenodd" />
          {AREE.map((a) => {
            const acceso = evidenzia ? evidenzia === a : true;
            return (
              <g key={a} className="carta-area" data-area={a}>
                <path d={AREE_FORME[a].d} fill={COLORE_AREA[a]} fillOpacity={evidenzia ? (acceso ? 0.2 : 0.04) : 0.12} />
                <path d={AREE_FORME[a].d} fill={`url(#trama-${a})`} opacity={acceso ? 1 : 0.25} />
                <path d={AREE_FORME[a].d} fill="none" stroke={COLORE_AREA[a]} strokeWidth={tratto * (acceso && evidenzia ? 2 : 1)} strokeOpacity={acceso ? 0.9 : 0.35} strokeLinejoin="round" />
              </g>
            );
          })}
          <path d={COSTA_D} fill="none" stroke="#1f4e63" strokeWidth={tratto * 1.1} strokeOpacity=".8" strokeLinejoin="round" />
          <path d={REGIONE_D} fill="none" stroke="#16352a" strokeWidth={tratto * 1.3} strokeOpacity=".7" strokeLinejoin="round" />
        </svg>

        {/* Le aree NON si etichettano sulla carta intera (verifica del 07/10: sul golfo
            le etichette coprivano TriesteVillas, LignanoVillas e SloveniaVillas): lì le
            quattro aree stanno nella legenda accanto, coi loro link. Sulla carta ritagliata
            l'area si nomina in un cartiglio fisso in alto a sinistra. */}
        {etichetteAree && ritaglio ? (
          <span
            className="carta-etichetta absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[clamp(11px,1.3vw,15px)] text-ink shadow-sm"
            style={{ borderLeft: `3px solid ${COLORE_AREA[ritaglio]}` }}
          >
            <span className="block font-display font-semibold leading-tight">{NOMI_AREA[ritaglio][locale]}</span>
            {conteggi?.[ritaglio] ? <span className="mt-0.5 block font-mono text-[0.72em] uppercase tracking-wide opacity-80">{conteggi[ritaglio]}</span> : null}
          </span>
        ) : null}

        {/* Punti: case, affitti, siti del gruppo, città di riferimento. */}
        {visibili.map((p) => {
          const [x, y] = proietta(p.lat, p.lng);
          if (x < box.x || x > box.x + box.w || y < box.y || y > box.y + box.h) return null;
          const style = { left: pct(x, box.x, box.w), top: pct(y, box.y, box.h) };
          const segno =
            p.tipo === "casa" ? (
              <span className={`block h-3.5 w-3.5 rotate-45 rounded-[2px] border-2 shadow ${p.approssimato ? "border-dashed border-brand-dark bg-white" : "border-white bg-brand-dark"}`} />
            ) : p.tipo === "affitto" ? (
              <span className="block h-3.5 w-3.5 rounded-full border-2 border-white bg-[#b8963f] shadow" />
            ) : p.tipo === "gruppo" ? (
              <span className="block h-3 w-3 rounded-full border-2 border-brand-dark bg-white shadow" />
            ) : (
              <span className="block h-2 w-2 rounded-full bg-ink/70" />
            );
          // Vicino ai bordi l'etichetta si apre verso l'interno, o esce dalla carta.
          const fx = (x - box.x) / box.w;
          const fy = (y - box.y) / box.h;
          const allinea = `${fx > 0.82 ? "right-0" : fx < 0.12 ? "left-0" : "left-1/2 -translate-x-1/2"} ${fy > 0.84 ? "bottom-full mb-1" : "top-full mt-1"}`;
          const nascosta = (p.tipo === "casa" || p.tipo === "affitto") && !etichetteCase;
          const soloLargo = p.tipo === "casa" || p.tipo === "affitto" || (p.tipo === "gruppo" && !ritaglio);
          const etichetta = (
            <span
              className={`pointer-events-none absolute whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[clamp(9px,1.05vw,12px)] leading-tight text-ink shadow-sm ${allinea} ${
                nascosta ? "carta-punto-nascosta" : soloLargo ? "carta-punto-etichetta" : ""
              }`}
            >
              <span className={p.tipo === "citta" ? "font-medium" : "font-semibold"}>{p.etichetta}</span>
              {p.nota ? <span className="block font-mono text-[0.85em] text-neutral-500">{p.nota}</span> : null}
              {p.approssimato && notaApprossimato ? <span className="block text-[0.8em] italic text-neutral-500">{notaApprossimato}</span> : null}
            </span>
          );
          const cls = "carta-punto group absolute -translate-x-1/2 -translate-y-1/2";
          if (!p.href)
            return (
              <span key={p.id} className={cls} style={style}>
                {segno}
                {etichetta}
              </span>
            );
          return p.esterno ? (
            <a key={p.id} href={p.href} className={cls} style={style} aria-label={`${p.etichetta}${p.nota ? ` — ${p.nota}` : ""}`}>
              {segno}
              {etichetta}
            </a>
          ) : (
            <Link key={p.id} href={p.href} className={cls} style={style} aria-label={`${p.etichetta}${p.nota ? ` — ${p.nota}` : ""}`}>
              {segno}
              {etichetta}
            </Link>
          );
        })}
      </div>
    </figure>
  );
}
