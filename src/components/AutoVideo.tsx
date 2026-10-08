"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster: string;
  ariaLabel: string;
  className?: string;
  lazy?: boolean;
  /** 07/10/2026: versione leggera per gli schermi stretti (< 768 px). */
  srcPiccolo?: string;
  /** 07/10/2026: tasto Pausa/Riprendi (WCAG 2.2.2, moto oltre i 5 secondi). Le etichette nella lingua della pagina. */
  pausa?: { pausa: string; riprendi: string };
};

export default function AutoVideo({
  src,
  poster,
  ariaLabel,
  className,
  lazy = false,
  srcPiccolo,
  pausa,
}: Props) {
  const [inPausa, setInPausa] = useState(false);
  // Con una versione leggera la sorgente si sceglie nel browser, PRIMA di montarla:
  // dal server arriva solo il poster, così il telefono non scarica anche il file grande.
  const [sorgente, setSorgente] = useState<string | null>(srcPiccolo ? null : src);
  useEffect(() => {
    if (srcPiccolo) setSorgente(window.matchMedia("(max-width: 767px)").matches ? srcPiccolo : src);
  }, [src, srcPiccolo]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInViewportRef = useRef(!lazy);
  const prefersReducedMotionRef = useRef(false);
  const sourceMountedRef = useRef(!lazy);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(!lazy);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const tryPlay = useCallback(() => {
    const video = videoRef.current;

    if (
      !video ||
      prefersReducedMotionRef.current ||
      (lazy && !isInViewportRef.current)
    ) {
      return;
    }

    void video.play().catch(() => undefined);
  }, [lazy]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Chi risparmia dati (Save-Data) vede il poster, come chi chiede meno movimento.
    const risparmio = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const syncMotionPreference = () => {
      const fermo = motionQuery.matches || risparmio;
      prefersReducedMotionRef.current = fermo;
      setPrefersReducedMotion(fermo);

      if (fermo) {
        videoRef.current?.pause();
      } else if (!lazy || isInViewportRef.current) {
        tryPlay();
      }
    };

    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    return () => {
      motionQuery.removeEventListener("change", syncMotionPreference);
    };
  }, [lazy, tryPlay]);

  useEffect(() => {
    sourceMountedRef.current = hasEnteredViewport && !prefersReducedMotion;

    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion) {
      video.pause();
      video.load();
      return;
    }

    if (hasEnteredViewport) {
      tryPlay();
    }
  }, [hasEnteredViewport, prefersReducedMotion, tryPlay]);

  useEffect(() => {
    if (!lazy) return;

    const video = videoRef.current;
    if (!video) return;

    if (!("IntersectionObserver" in window)) {
      const loadFallback = globalThis.setTimeout(() => {
        isInViewportRef.current = true;
        setHasEnteredViewport(true);
      }, 0);

      return () => {
        globalThis.clearTimeout(loadFallback);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isInViewportRef.current = true;

          if (sourceMountedRef.current) {
            tryPlay();
          } else {
            setHasEnteredViewport(true);
          }
        } else {
          isInViewportRef.current = false;
          video.pause();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [lazy, tryPlay]);

  const shouldMountSource = hasEnteredViewport && !prefersReducedMotion && sorgente !== null;

  const video = (
    <video
      ref={videoRef}
      src={shouldMountSource ? (sorgente ?? undefined) : undefined}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload={lazy ? "none" : "metadata"}
      aria-label={ariaLabel}
      role="img"
      className={className}
    />
  );
  if (!pausa || !shouldMountSource) return video;
  return (
    <>
      {video}
      <button
        type="button"
        onClick={() => {
          const v = videoRef.current;
          if (!v) return;
          if (inPausa) void v.play().catch(() => undefined);
          else v.pause();
          setInPausa(!inPausa);
        }}
        className="absolute right-3 top-36 z-10 rounded-full sm:top-40 bg-black/55 px-3 py-1 text-xs font-medium text-white hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-white"
      >
        {inPausa ? `▶ ${pausa.riprendi}` : `❚❚ ${pausa.pausa}`}
      </button>
    </>
  );
}
