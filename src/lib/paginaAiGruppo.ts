import "server-only";
import { unstable_cache } from "next/cache";

// Il link del riepilogo #foto-ai verso la pagina sull'uso dell'AI.
//
// friulivillas.com la sua pagina /ai non ce l'ha ancora (PAGINA_AI_ONLINE nella
// scheda: resta spenta finché la rilettura legale non chiude, SPEC §9.2), e un
// link a /ai qui sarebbe un 404 proprio nella sezione sulla trasparenza. La
// pagina del gruppo su triestevillas.com invece è online, nelle stesse quattro
// lingue: il riepilogo la linka — ma SOLO se risponde 200 (01/10/2026).
//
// Si parte da https://www.triestevillas.com/<lingua>/ai e si seguono i
// redirect (oggi: www → dominio nudo, e /it/ai → /ai): conta che la pagina
// finale risponda 200 e stia su triestevillas.com; il link punta all'indirizzo
// FINALE, così chi clicca non fa la catena di redirect. Un 404, un 410 o un
// redirect fuori dal dominio ⇒ niente link, e la risposta resta in cache per
// un'ora. Un errore di rete o un tempo scaduto LANCIA: la copia buona in cache
// non si perde, e senza copia stavolta il link non c'è (si riprova al giro dopo).

const LINGUE = new Set(["it", "en", "de", "sl"]);
const TIMEOUT_MS = 5000;
const HOST_AMMESSI = new Set(["triestevillas.com", "www.triestevillas.com"]);

const verifica = unstable_cache(
  async (lingua: string): Promise<string | null> => {
    const res = await fetch(`https://www.triestevillas.com/${lingua}/ai`, {
      method: "HEAD",
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status !== 200) return null;
    const finale = new URL(res.url);
    if (finale.protocol !== "https:" || !HOST_AMMESSI.has(finale.hostname)) return null;
    finale.search = "";
    finale.hash = "";
    return finale.toString();
  },
  ["pagina-ai-gruppo-v1"],
  { revalidate: 3600 },
);

/** L'URL della pagina del gruppo sull'uso dell'AI nella lingua data, o null se non risponde 200. */
export async function paginaAiDelGruppo(locale: string): Promise<string | null> {
  if (!LINGUE.has(locale)) return null;
  try {
    return await verifica(locale);
  } catch (e) {
    console.warn(`[pagina-ai] triestevillas.com/${locale}/ai non verificata: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}
