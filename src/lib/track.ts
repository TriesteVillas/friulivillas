// L'evento GA4 `generate_lead`, e solo dai moduli che generano una richiesta
// ARRIVATA (09/10/2026, «conta solo le richieste arrivate davvero, su tutti i
// siti» — Martino). Fino a quel giorno lo sparava l'ascoltatore generico su
// OGNI submit (Analytics.tsx): contava la richiesta anche quando il server la
// rifiutava, anche quando la validazione la fermava, e contava come lead
// anche «Invia a un amico». Ora parte solo dopo la risposta ok del server,
// con `modulo` (la dimensione che il CRM registra su GA4). Come lib/track.ts
// di triestevillas.com, che l'ha fatto per primo (audit 08/10/2026).
export function track(event: string, params?: Record<string, unknown>) {
  const p =
    event === "generate_lead" && params && params.modulo == null && params.form != null
      ? { ...params, modulo: params.form }
      : params;
  try {
    (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", event, p);
  } catch {
    /* gtag assente (niente consenso al caricamento, blocker): l'evento si perde e va bene così */
  }
}
