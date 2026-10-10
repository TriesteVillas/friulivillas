"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

// view_item con l'immobile (10/10/2026, come su triestevillas.com 28e6fe9): il
// page_view della misurazione avanzata non porta l'item, e senza item non si
// capisce QUALE casa genera interesse. Fino a oggi friulivillas.com non mandava
// nessun view_item: le schede erano solo URL nei rapporti.
//
// L'item porta nome pubblico, tipologia, luogo, contratto e prezzo (quando il
// prezzo è pubblico): i rapporti «Articoli» di GA4 dicono così quali case,
// quali luoghi e quali fasce attirano, non solo quali codici.
//
// Una differenza voluta rispetto a TSV, sul luogo. Su triestevillas.com
// `item_category2` è la `zona` del CRM (Barcola, Centro…). Qui no: la `zona` è
// una tassonomia di TRIESTE e fuori provincia vale «FVG» per quasi tutte le case
// (vedi lib/aree.ts), quindi in `item_category2` va il COMUNE — quello che la
// scheda mostra nell'indirizzo — e in `item_category4` l'AREA del sito («Costa e
// laguna», «Montagna»…, sempre col nome italiano, così i rapporti non si
// spezzano per lingua).
//
// ⛔ Mai il nome interno (che qui non arriva) e mai un prezzo in trattativa
// riservata: si manda solo ciò che la pagina pubblica già mostra.
//
// ⚠️ SI ASPETTA gtag (seconda differenza voluta, misurata il 10/10/2026). Qui
// gtag lo definisce lo script di Analytics in `lazyOnload`, cioè dopo l'evento
// `load`; l'effetto di questo componente gira prima, all'idratazione. Con la
// chiamata secca di TSV, chi ATTERRA sulla scheda (da Google, da un annuncio,
// da un portale — gli ingressi che contano di più) non produceva nessun
// view_item: provato in locale con Chrome headless, zero eventi all'atterraggio
// e uno solo navigando dal catalogo. Quindi si riprova ogni 250 ms per 15 s,
// come LeadArrivato di ortavillas; poi si rinuncia. Mai un push diretto nel
// dataLayer al posto di gtag: entrerebbe prima del `consent default`.
const PASSO_MS = 250;
const TENTATIVI = 60;

// ⛔ L'id è il record opaco (`rec…`), MAI il codice TSV-PROP: è testo libero e a
// volte porta il cognome di chi vende (regola ferrea del gruppo). Il nome
// leggibile sta in `item_name`, che è il nome pubblico. (10/10/2026)
export default function TrackViewItem({
  id, nome, tipologia, zona, contratto, prezzo, area,
}: {
  id: string;
  nome?: string | null;
  tipologia?: string | null;
  /** Il luogo che la scheda mostra: qui il comune (vedi sopra). */
  zona?: string | null;
  contratto?: string | null;
  /** Solo se la pagina lo mostra: null in trattativa riservata. */
  prezzo?: number | null;
  /** L'area del sito (lib/aree.ts), nome italiano. */
  area?: string | null;
}) {
  useEffect(() => {
    const item: Record<string, unknown> = { item_id: id, item_brand: "FriuliVillas" };
    if (nome) item.item_name = nome.slice(0, 100);
    if (tipologia) item.item_category = tipologia.slice(0, 100);
    if (zona) item.item_category2 = zona.slice(0, 100);
    if (contratto) item.item_category3 = contratto.toLowerCase();
    if (area) item.item_category4 = area.slice(0, 100);
    const prezzoOk = typeof prezzo === "number" && Number.isFinite(prezzo) && prezzo > 0;
    if (prezzoOk) item.price = prezzo;
    const evento = prezzoOk ? { currency: "EUR", value: prezzo, items: [item] } : { items: [item] };
    let giri = 0;
    let h = 0;
    const prova = () => {
      if (typeof (window as unknown as { gtag?: unknown }).gtag === "function") {
        track("view_item", evento);
        return;
      }
      if (++giri < TENTATIVI) h = window.setTimeout(prova, PASSO_MS);
    };
    prova();
    return () => window.clearTimeout(h);
  }, [id, nome, tipologia, zona, contratto, prezzo, area]);
  return null;
}
