"use client";

import { useEffect, useRef, useState } from "react";
import EtichettaVideo from "@/components/EtichettaVideo";
import type { EtichettaVideoDati } from "@/lib/videoAi";

// Una banda video a tutta larghezza, in due modi:
//   · «loop»: muto, parte da solo quando entra nello schermo e si ferma quando
//     esce (le stanze di Top Hill che si muovono piano);
//   · «film»: il poster e un tasto ▶; il film parte solo se il visitatore lo
//     chiede, coi comandi del browser (il mini-film dello chalet).
// L'etichetta AI sta sul video per tutta la durata (sono foto animate con l'AI).
// Guardie come gli altri video: movimento ridotto, Save-Data, 2g → solo poster.

export default function BandaVideo({
  mp4,
  mp4Sm,
  poster,
  ai,
  modo,
  eyebrow,
  titolo,
  testo,
  play,
}: {
  mp4: string;
  mp4Sm: string;
  poster: string;
  ai: EtichettaVideoDati | null;
  modo: "loop" | "film";
  eyebrow: string;
  titolo: string;
  testo?: string;
  /** etichetta del tasto ▶ (modo film) */
  play?: string;
}) {
  const v = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [avviato, setAvviato] = useState(false);
  const [bloccato, setBloccato] = useState(false);

  useEffect(() => {
    const rete = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const stop =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      Boolean(rete?.saveData) ||
      (typeof rete?.effectiveType === "string" && /^(slow-)?2g$/.test(rete.effectiveType));
    setBloccato(stop);
    if (stop || modo !== "loop") return;
    const piccolo = window.matchMedia("(max-width: 767px)").matches;
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const video = v.current;
        if (e.isIntersecting) {
          setSrc((s) => s ?? (piccolo ? mp4Sm : mp4));
          video?.play().catch(() => {});
        } else video?.pause();
      },
      { rootMargin: "200px 0px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [modo, mp4, mp4Sm]);

  const avvia = () => {
    const piccolo = window.matchMedia("(max-width: 767px)").matches;
    setSrc(piccolo ? mp4Sm : mp4);
    setAvviato(true);
    requestAnimationFrame(() => v.current?.play().catch(() => {}));
  };

  return (
    <section data-banda-video={modo} className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sand">{eyebrow}</p>
        <h2 className="mt-3 font-[family-name:var(--font-affitti-display)] text-[clamp(2.2rem,5vw,4rem)] leading-[1]">{titolo}</h2>
        {testo && <p className="mt-4 max-w-2xl text-white/80">{testo}</p>}
      </div>
      <div ref={box} className="relative mx-auto aspect-video w-full max-w-[1600px] overflow-hidden">
        <video
          ref={v}
          className="h-full w-full object-cover"
          poster={poster}
          src={src}
          muted={modo === "loop"}
          loop={modo === "loop"}
          playsInline
          controls={modo === "film" && avviato}
          preload={modo === "loop" ? "metadata" : "none"}
          aria-label={titolo}
        />
        <EtichettaVideo dati={ai} className="absolute right-4 top-4 z-[3] sm:right-6 sm:top-6" />
        {modo === "film" && !avviato && (
          <button
            type="button"
            onClick={avvia}
            className="absolute inset-0 z-[2] flex items-center justify-center bg-ink/20 transition-colors hover:bg-ink/10"
            aria-label={play ?? titolo}
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-2xl text-ink shadow-xl">▶</span>
          </button>
        )}
        {modo === "loop" && bloccato && <span className="sr-only">{titolo}</span>}
      </div>
      <div className="h-16" />
    </section>
  );
}
