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
});

export type Locale = (typeof routing.locales)[number];
