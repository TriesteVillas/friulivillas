"use client";

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
