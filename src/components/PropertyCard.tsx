import { ViewTransition } from "react";
import { Link } from "@/i18n/navigation";
import type { PropertyView } from "@/lib/propertyView";
import PropertyBadge from "./PropertyBadge";
import PhotoImg from "./PhotoImg";
import AiTag from "./AiTag";
import SegnoAiDiscreto from "./SegnoAiDiscreto";
import Tilt from "./motion/Tilt";

export default function PropertyCard({
  view,
  photosComing,
  priority = false,
}: {
  view: PropertyView;
  photosComing: string;
  // Prime card visibili senza scorrere: la copertina è il candidato LCP della
  // pagina, quindi non va rimandata al primo scroll.
  priority?: boolean;
}) {
  // «Venduto» vince su tutto: «In vendita» o «Online da N giorni» accanto a una
  // casa venduta direbbero il contrario.
  const leftBadge = view.soldBadge ?? view.recentBadge ?? view.badge;
  const rightBadge = view.clusterBadge ?? view.featuredBadge;

  return (
    <Tilt className="rounded-2xl">
      <Link
        href={`/annuncio/${view.slug}`}
        transitionTypes={["nav-forward"]}
        className="card-cine group block"
        data-slug={view.slug}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-paper">
          {view.cover ? (
            <ViewTransition name={`prop-${view.slug}`} share="morph">
              <PhotoImg
                src={view.cover.url}
                alt={view.cover.alt}
                priority={priority}
                className="card-photo object-cover"
              />
            </ViewTransition>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-paper to-neutral-200 text-sm text-neutral-400">
              {photosComing}
            </div>
          )}
          <span className="card-sheen" aria-hidden />
          {/* Solo nella home (SPEC §11.1): niente pillola, e sulla copertina
              che mostra cose che non esistono un testo piccolo in basso a
              destra. Altrove `coverSegno` è sempre null. */}
          <SegnoAiDiscreto
            dati={view.coverSegno ? { testo: view.coverSegno.testo, descrizione: view.coverSegno.aria } : null}
          />
          {view.coverAi ? (
            // La sigla AI prende l'angolo in alto a destra (SPEC §5.1); l'altra
            // bolla di destra, se c'è, le si mette accanto sulla stessa riga.
            // Le bolle e la sigla stanno in UNA riga che va a capo all'indietro
            // (flex-wrap-reverse): se la card è troppo stretta per tutte, scende
            // la bolla di SINISTRA e la sigla resta nell'angolo. Prima il gruppo
            // di destra era un blocco assoluto a sé, cresciuto della sigla, e
            // sulle card strette copriva «Online da N giorni» (home a 390 e a
            // 1024 px: review post-pubblicazione del 01/10/2026).
            <div className="absolute inset-x-3 top-3 z-[2] flex flex-wrap-reverse items-center justify-between gap-1.5">
              <PropertyBadge {...leftBadge} className="shrink-0 whitespace-nowrap shadow-sm" />
              <div className="ml-auto flex shrink-0 items-center gap-1.5">
                {rightBadge && (
                  <PropertyBadge {...rightBadge} className="shrink-0 whitespace-nowrap shadow-sm" />
                )}
                <AiTag testo={view.coverAi.testo} aria={view.coverAi.aria} compatta className="shrink-0" />
              </div>
            </div>
          ) : (
            // Senza sigla: le due bolle di sempre, identiche a prima.
            <>
              <PropertyBadge {...leftBadge} className="absolute left-3 top-3 z-[2] shadow-sm" />
              {rightBadge && (
                <PropertyBadge
                  {...rightBadge}
                  className="absolute right-3 top-3 z-[2] shadow-sm"
                />
              )}
            </>
          )}
        </div>
        <div className="space-y-1 p-5">
          <p className="text-xl font-semibold tracking-tight text-brand-dark">
            {view.priceLabel}
          </p>
          <h3 className="line-clamp-1 text-sm font-medium text-neutral-800 transition-colors duration-300 group-hover:text-brand">
            {view.title}
          </h3>
          {view.place && <p className="text-sm text-neutral-500">{view.place}</p>}
          {view.meta && <p className="pt-1 text-xs text-neutral-400">{view.meta}</p>}
        </div>
      </Link>
    </Tilt>
  );
}
