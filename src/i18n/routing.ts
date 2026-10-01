import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // EN is the authoring master, but IT stays the URL root to preserve existing SEO/links.
  // `sl` (sloveno, dal 2026-10-01, decisione di Martino: le lingue del gruppo
  // sono quattro ovunque) va IN CODA: il LocaleSwitcher mostra le lingue
  // nell'ordine di questo array. Il prebuild (scripts/check-messages.mjs) legge
  // questa lista: una lingua aggiunta qui senza il suo messages/<lingua>.json
  // completo ferma la build.
  locales: ["it", "en", "de", "sl"],
  defaultLocale: "it",
  localePrefix: "as-needed",
  // Tre opzioni SPENTE di proposito (2026-10-01), come su triestevillas.com
  // (audit del 2026-08-11), dove i default di next-intl hanno già fatto danni:
  // - alternateLinks: il proxy emetteva un header HTTP `Link` con un SECONDO
  //   gruppo di hreflang (codici it/en/de/sl, host www) in conflitto con quello
  //   dell'HTML (it-IT/en-GB/de-DE/sl, host di SITE_URL). La fonte unica degli
  //   hreflang è l'HTML: pageAlternates() in lib/seo.ts.
  // - localeDetection: con la negoziazione cookie/Accept-Language un browser
  //   sloveno che apriva «/» veniva rimandato (307) a /sl, e su triestevillas.com
  //   la stessa negoziazione ha lasciato in CDN una URL /en col corpo tedesco.
  //   Ogni URL = una lingua, deterministica; si cambia lingua coi link veri
  //   del LocaleSwitcher.
  // - localeCookie: con la detection spenta il cookie NEXT_LOCALE non serve a
  //   nulla, e un Set-Cookie dentro una risposta che la CDN mette in cache è
  //   proprio il residuo da evitare.
  alternateLinks: false,
  localeDetection: false,
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
