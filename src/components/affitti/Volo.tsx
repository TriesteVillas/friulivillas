"use client";

import { useEffect, useRef, useState } from "react";
import Scene from "@/components/motion/Scene";
import EtichettaVideo from "@/components/EtichettaVideo";
import type { EtichettaVideoDati } from "@/lib/videoAi";

// Il volo che segue lo scorrimento: una ripresa VERA del drone (nessun modello
// generativo) che avanza quando si scende e torna indietro quando si sale. La
// sezione è alta tre schermi e il video resta fermo al centro (Scene «pin»):
// il suo tempo è il progresso --p della scena. Le tappe sono frasi che entrano
// a certi punti del volo.
//
// Il file è codificato con un fotogramma chiave ogni 5 (il seek su chiavi rade
// va a gradoni) e a 15 fps: è la metà dei fotogrammi, e allo scorrimento non si
// vede. Guardie come gli altri video: niente video con movimento ridotto,
// Save-Data o 2g — resta il poster, cioè il primo fotogramma.

export type Tappa = { da: number; a: number; testo: string };

export default function Volo({
  mp4,
  mp4Sm,
  poster,
  ai,
  titolo,
  tappe,
  nota,
}: {
  mp4: string;
  mp4Sm: string;
  poster: string;
  /** null: ripresa vera */
  ai: EtichettaVideoDati | null;
  titolo: string;
  tappe: Tappa[];
  /** la riga piccola sotto (cosa si vede, da dove, quando) */
  nota: string;
}) {
  const v = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [p, setP] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rete = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (rete?.saveData || (typeof rete?.effectiveType === "string" && /^(slow-)?2g$/.test(rete.effectiveType))) return;
    const piccolo = window.matchMedia("(max-width: 767px)").matches;
    const accendi = () => window.setTimeout(() => setSrc(piccolo ? mp4Sm : mp4), 300);
    if (document.readyState === "complete") accendi();
    else window.addEventListener("load", accendi, { once: true });
    return () => window.removeEventListener("load", accendi);
  }, [mp4, mp4Sm]);

  useEffect(() => {
    const el = v.current;
    if (!el) return;
    // La Scene scrive --p come stile in linea sul proprio elemento (la section).
    const scena = el.closest("section") as HTMLElement | null;
    let corrente = 0;
    let raf = 0;
    let ultimoP = -1;
    const tick = () => {
      const q = scena ? parseFloat(scena.style.getPropertyValue("--p")) || 0 : 0;
      if (Math.abs(q - ultimoP) > 0.002) {
        ultimoP = q;
        setP(q);
      }
      const d = el.duration;
      if (src && Number.isFinite(d) && d > 0) {
        const target = q * Math.max(d - 0.08, 0);
        corrente += (target - corrente) * 0.2;
        if (Math.abs(target - corrente) < 0.004) corrente = target;
        if (Math.abs(el.currentTime - corrente) > 0.01) {
          try {
            el.currentTime = corrente;
          } catch {
            /* metadati non pronti: si riprova al fotogramma dopo */
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [src]);

  return (
    <Scene as="section" mode="pin" className="relative h-[300vh] bg-ink">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <video
            ref={v}
            className="h-full w-full object-cover"
            poster={poster}
            src={src}
            muted
            playsInline
            preload="auto"
            aria-hidden
          />
          <EtichettaVideo dati={ai} className="absolute right-4 top-24 z-[3] sm:right-6" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,21,18,0.6)_0%,rgba(11,21,18,0)_28%,rgba(11,21,18,0)_62%,rgba(11,21,18,0.8)_100%)]"
        />
        <div className="relative z-[2] mx-auto flex h-full max-w-6xl flex-col justify-between px-6 pb-10 pt-28">
          <h2 className="max-w-xl font-[family-name:var(--font-affitti-display)] text-[clamp(2.2rem,5vw,4rem)] leading-[1] text-white">
            {titolo}
          </h2>
          <div className="relative min-h-[7rem]">
            {tappe.map((t, i) => {
              const on = p >= t.da && p < t.a;
              return (
                <p
                  key={i}
                  className={`absolute bottom-6 left-0 max-w-md text-lg leading-snug text-white transition-all duration-700 ease-[var(--ease-lux)] sm:text-xl ${
                    on ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  {t.testo}
                </p>
              );
            })}
            <p className="absolute bottom-0 left-0 text-[11px] text-white/70">{nota}</p>
          </div>
        </div>
        {/* La traccia del volo: quanto si è percorso. */}
        <div aria-hidden className="absolute bottom-0 left-0 h-[3px] bg-sand" style={{ width: `${(p * 100).toFixed(1)}%` }} />
      </div>
    </Scene>
  );
}
