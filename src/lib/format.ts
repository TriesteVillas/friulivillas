// Tag Intl per lingua. Chi non è in mappa cade su it-IT — per questo ogni
// lingua del router DEVE avere la sua riga, o i prezzi escono all'italiana
// senza errore. sl-SI: migliaia col punto, € dopo la cifra con lo spazio.
const LOCALE_TAG: Record<string, string> = {
  it: "it-IT",
  en: "en-GB",
  de: "de-DE",
  sl: "sl-SI",
};

export function formatPrice(value: number, locale: string): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale] ?? "it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale] ?? "it-IT").format(value);
}

// Link `tel:` da un numero come lo scrivono i dizionari. L'italiano lo tiene
// senza prefisso («331 8940822»), le altre lingue col prefisso internazionale
// («+39 331 8940822»): anteporre sempre «+39» produceva `tel:+39+39…` su /en e
// /de (verificato in produzione il 2026-10-01), un numero che nessun telefono
// compone. Il prefisso si aggiunge solo se il numero non ne ha già uno.
export function telHref(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `tel:+${digits}` : `tel:+39${digits}`;
}
