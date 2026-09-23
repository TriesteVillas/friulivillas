"use client";

import { useEffect } from "react";
import Script from "next/script";

// ─────────────────────────────────────────────────────────────────────────────
// Google Analytics 4 su friulivillas.com.
//
// Gemello di quello su triestevillas.com e triesteimmobiliare.com. Acceso il
// 2026-09-18 con l'ID del flusso web della proprietà GA4 «friulivillas.com»,
// letto da Martino nella dashboard Analytics: il sito Next.js era andato online
// SENZA nessun tag, e la proprietà diceva «non sono stati ancora ricevuti dati».
// Il vecchio WordPress su Aruba misurava con un Google tag di Site Kit (+ Cookiebot)
// che non alimentava questa proprietà; la coming soon statica non aveva nulla.
//
// L'ID di misurazione è un identificatore PUBBLICO (si legge nel sorgente di
// ogni pagina): sta in chiaro qui e non in una variabile d'ambiente, così non
// può sparire da una env dimenticata a un deploy. Il cancello del prebuild
// (`scripts/check-analytics.mjs`) fa fallire la build se sparisce.
//
// Navigazioni interne: l'App Router cambia pagina con la History API, e la
// "misurazione avanzata" di GA4 (attiva di serie sui flussi web) registra da sé
// i page_view sui cambi di cronologia. Niente listener nostro: due sorgenti di
// page_view sarebbero doppio conteggio.
//
// CONSENSO (Consent Mode v2): si parte con TUTTO negato, quindi prima della
// scelta non viene scritto nessun cookie di statistica — GA riceve solo un ping
// senza identificatori, che nei report NON compare. La scelta arriva da
// CookieBanner (`gtag('consent','update')`) e vale subito, senza ricaricare.
// L'ordine conta: `default` deve entrare nel dataLayer PRIMA di `config`, ed è
// nello stesso script inline proprio per non doverlo sperare.
//
// `lazyOnload`: gtag.js sono ~185 KB; caricarlo dopo l'evento `load` non toglie
// nulla alla misurazione (il dataLayer accumula e consegna) e non compete con
// ciò che la pagina mostra davvero. La guardia `document.prerendering` evita
// un page_view per pagine prerenderizzate che non verranno mai attivate.
// ─────────────────────────────────────────────────────────────────────────────

const GA_ID = "G-W9C6G4GL0P";

export default function Analytics() {
  // ── Gli eventi che contano (23/09/2026) ────────────────────────────────────
  // Senza eventi GA4 misura pagine e basta. Un ascoltatore solo, delegato al
  // documento, per tutti i punti di contatto del sito — così un modulo nuovo o
  // un numero di telefono in una pagina nuova sono già misurati senza toccare
  // niente:
  //   · `generate_lead` (evento raccomandato GA4) a ogni submit di un <form>,
  //     con `modulo` = id/nome del form. In fase di CATTURA, quindi anche se
  //     React chiama preventDefault: conta la richiesta, non l'esito.
  //   · `contatto` al clic su tel: / WhatsApp / mailto:, con `canale`.
  // Nel CRM v4 il job `eventi` li marca come eventi chiave e registra i due
  // parametri come dimensioni: senza, nei report non comparirebbero.
  useEffect(() => {
    const invia = (nome: string, parametri: Record<string, string>) => {
      try { (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", nome, parametri); } catch { /* niente analytics = niente da fare */ }
    };
    const alClic = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const h = a.getAttribute("href") ?? "";
      if (/^tel:/i.test(h)) invia("contatto", { canale: "telefono" });
      else if (/wa\.me|api\.whatsapp\.com|^whatsapp:/i.test(h)) invia("contatto", { canale: "whatsapp" });
      else if (/^mailto:/i.test(h)) invia("contatto", { canale: "email" });
    };
    const alSubmit = (e: Event) => {
      const f = e.target as HTMLFormElement | null;
      if (!f || f.tagName !== "FORM") return;
      invia("generate_lead", { modulo: f.id || f.getAttribute("name") || f.getAttribute("aria-label") || "form" });
    };
    document.addEventListener("click", alClic, true);
    document.addEventListener("submit", alSubmit, true);
    return () => {
      document.removeEventListener("click", alClic, true);
      document.removeEventListener("submit", alSubmit, true);
    };
  }, []);
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
      <Script id="ga4-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{if(localStorage.getItem('fv_consenso_v1')==='si'){gtag('consent','update',{analytics_storage:'granted'});}}catch(e){}
var fvGaConfig=function(){gtag('js', new Date());gtag('config', '${GA_ID}');};
if(document.prerendering){document.addEventListener('prerenderingchange', fvGaConfig, {once:true});}else{fvGaConfig();}`}
      </Script>
    </>
  );
}
