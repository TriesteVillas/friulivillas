import { NextResponse } from "next/server";
import { splitNomeCerta } from "@/lib/nomesplit";
import { brandMailShell, mailContact, mailCta, mailRecapCard, mailText } from "@/lib/brandMail";
import { casaDa } from "@/content/affitti/case";
import { ESPERIENZE_ID } from "@/content/affitti/esperienze";
import {
  normalizza,
  notti,
  sembraUnRobot,
  valida,
  type RichiestaPreventivo,
} from "@/lib/affitti/preventivo";

// La richiesta di preventivo dei soggiorni (Top Hill Cottage, Chalet Navauce).
//
// Due consegne, indipendenti, e la richiesta è «ricevuta» se ne riesce almeno
// una (prima, al 07/10/2026, la sola Airtable: FriuliVillas su Vercel non ha
// ancora la chiave di Resend):
//   1. una riga in LEAD_ di Airtable, come gli altri moduli del sito: da lì la
//      copia dei 30′ la porta nel CRM. Con i valori di `tipo_richiesta` e
//      `motivo` che ESISTONO già (un valore nuovo, via typecast, creerebbe
//      un'opzione su un campo condiviso coi marchi) e ⛔ MAI `immobile` né
//      `immobile_rif`: le case non sono nel catalogo, un collegamento creerebbe
//      un record fantasma in PROPRIETA;
//   2. la mail a richieste@triestevillas.com (risposta diretta al cliente) e il
//      riepilogo al cliente nella sua lingua, via Resend, quando c'è la chiave.
// Rotta separata da /api/lead per non toccare i moduli della vendita.

const LEADS_BASE_ID = process.env.LEADS_BASE_ID ?? "app1ZDay9vQNU5V2u";
const LEADS_TABLE = process.env.LEADS_TABLE ?? "tbl1RolmcvI7WxDdr";
const LEADS_TOKEN = process.env.LEADS_AIRTABLE_TOKEN ?? process.env.AIRTABLE_TOKEN;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM;
const NOTIFY_EMAIL = process.env.LEAD_NOTIFY_EMAIL ?? "richieste@triestevillas.com";
const SITE = ((process.env.NEXT_PUBLIC_SITE_URL || "").trim() || "https://friulivillas.com").replace(/\/$/, "");

const esc = (s: string) =>
  s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);

async function salvaLead(fields: Record<string, unknown>): Promise<boolean> {
  if (!LEADS_TOKEN) return false;
  const post = (f: Record<string, unknown>) =>
    fetch(`https://api.airtable.com/v0/${LEADS_BASE_ID}/${LEADS_TABLE}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${LEADS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ records: [{ fields: f }], typecast: true }),
    });
  try {
    const res = await post(fields);
    if (res.ok) return true;
    const errore = await res.text();
    // Stessa riprova di /api/lead: una lingua che il select non ha ancora (sl)
    // non deve costare il cliente.
    if (res.status === 422 && "lingua" in fields && /INVALID_MULTIPLE_CHOICE_OPTIONS/.test(errore)) {
      const { lingua: _l, ...senza } = fields;
      void _l;
      const retry = await post(senza);
      if (retry.ok) return true;
    }
    console.error(`[preventivo] airtable ${res.status}: ${errore.slice(0, 300)}`);
    return false;
  } catch (e) {
    console.error("[preventivo] airtable irraggiungibile:", e);
    return false;
  }
}

async function mail(to: string, subject: string, html: string, replyTo?: string): Promise<boolean> {
  if (!RESEND_API_KEY || !RESEND_FROM) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) console.error(`[preventivo] resend ${res.status} → ${to}: ${(await res.text()).slice(0, 300)}`);
    return res.ok;
  } catch (e) {
    console.error(`[preventivo] resend irraggiungibile → ${to}:`, e);
    return false;
  }
}

const NOME_TIPO: Record<RichiestaPreventivo["tipo"], string> = {
  natura: "Vacanza nella natura",
  ritiro: "Ritiro aziendale / meeting",
  famiglia: "Famiglia o amici",
  altro: "Altro",
};

function dataLeggibile(iso: string, lingua: string): string {
  const [a, m, g] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(lingua === "sl" ? "sl-SI" : lingua === "de" ? "de-DE" : lingua === "en" ? "en-GB" : "it-IT", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(a, m - 1, g)));
}

function nomeCase(r: RichiestaPreventivo): string {
  if (r.casa === "entrambe") return "Top Hill Cottage + Chalet Navauce";
  return casaDa(r.casa)?.nome ?? r.casa;
}

function servizioTesto(id: string, lingua: RichiestaPreventivo["lingua"]): string {
  const casaSlug = ["top-hill-cottage", "chalet-navauce"] as const;
  for (const s of casaSlug) {
    const v = casaDa(s)?.servizi.find((x) => x.id === id);
    if (v) return v.testo[lingua];
  }
  return id;
}

// Lo sloveno ha quattro forme, decise dalle ultime due cifre (CLDR: one = 1,
// two = 2, few = 3-4, other = il resto, 101 si comporta come 1).
function slMolti(n: number, uno: string, due: string, pochi: string, altri: string): string {
  const r = n % 100;
  return r === 1 ? uno : r === 2 ? due : r === 3 || r === 4 ? pochi : altri;
}

const RECAP = {
  it: {
    subject: (casa: string) => `Abbiamo ricevuto la vostra richiesta per ${casa} — FriuliVillas`,
    hello: "Buongiorno",
    body: "abbiamo ricevuto la vostra richiesta di disponibilità e preventivo. Vi risponderemo con le date confermate e le condizioni; la richiesta può essere girata a chi gestisce la casa, perché vi risponda direttamente.",
    card: "La vostra richiesta",
    casa: "Casa", date: "Date", ospiti: "Ospiti", tipo: "Tipo di soggiorno", servizi: "Servizi richiesti", esperienze: "Esperienze", msg: "Messaggio",
    cta: "Torna alla casa",
    closing: `Per qualsiasi cosa rispondete pure a questa email o chiamateci allo ${mailContact.phone}.`,
    adulti: (n: number) => `${n} ${n === 1 ? "adulto" : "adulti"}`, bambini: (n: number) => `${n} ${n === 1 ? "bambino" : "bambini"}`, notti: (n: number) => `${n} ${n === 1 ? "notte" : "notti"}`,
  },
  en: {
    subject: (casa: string) => `We received your request for ${casa} — FriuliVillas`,
    hello: "Hello",
    body: "we received your request for availability and a quote. We will reply with the confirmed dates and terms; your request may be passed on to the people who run the house, so that they can answer you directly.",
    card: "Your request",
    casa: "House", date: "Dates", ospiti: "Guests", tipo: "Type of stay", servizi: "Services requested", esperienze: "Experiences", msg: "Message",
    cta: "Back to the house",
    closing: `Feel free to reply to this email or call us on +39 ${mailContact.phone}.`,
    adulti: (n: number) => `${n} ${n === 1 ? "adult" : "adults"}`, bambini: (n: number) => `${n} ${n === 1 ? "child" : "children"}`, notti: (n: number) => `${n} ${n === 1 ? "night" : "nights"}`,
  },
  de: {
    subject: (casa: string) => `Wir haben Ihre Anfrage für ${casa} erhalten — FriuliVillas`,
    hello: "Guten Tag",
    body: "wir haben Ihre Anfrage zu Verfügbarkeit und Preis erhalten. Wir antworten Ihnen mit den bestätigten Daten und Konditionen; Ihre Anfrage kann an die Verwalter des Hauses weitergegeben werden, damit diese Ihnen direkt antworten.",
    card: "Ihre Anfrage",
    casa: "Haus", date: "Daten", ospiti: "Gäste", tipo: "Art des Aufenthalts", servizi: "Gewünschte Leistungen", esperienze: "Erlebnisse", msg: "Nachricht",
    cta: "Zurück zum Haus",
    closing: `Antworten Sie gerne auf diese E-Mail oder rufen Sie uns an unter +39 ${mailContact.phone}.`,
    adulti: (n: number) => `${n} ${n === 1 ? "Erwachsener" : "Erwachsene"}`, bambini: (n: number) => `${n} ${n === 1 ? "Kind" : "Kinder"}`, notti: (n: number) => `${n} ${n === 1 ? "Nacht" : "Nächte"}`,
  },
  sl: {
    subject: (casa: string) => `Prejeli smo vaše povpraševanje za ${casa} – FriuliVillas`,
    hello: "Pozdravljeni",
    body: "prejeli smo vaše povpraševanje o razpoložljivosti in ceni. Odgovorili vam bomo s potrjenimi datumi in pogoji; povpraševanje lahko posredujemo tistim, ki hišo upravljajo, da vam odgovorijo neposredno. Odgovarjamo v italijanščini, angleščini ali nemščini.",
    card: "Vaše povpraševanje",
    casa: "Hiša", date: "Datumi", ospiti: "Gostje", tipo: "Vrsta bivanja", servizi: "Želene storitve", esperienze: "Doživetja", msg: "Sporočilo",
    cta: "Nazaj na hišo",
    closing: `Če imate vprašanja, odgovorite na to sporočilo ali nas pokličite na +39 ${mailContact.phone}.`,
    adulti: (n: number) => `${n} ${slMolti(n, "odrasla oseba", "odrasli osebi", "odrasle osebe", "odraslih oseb")}`,
    bambini: (n: number) => `${n} ${slMolti(n, "otrok", "otroka", "otroci", "otrok")}`,
    notti: (n: number) => `${n} ${slMolti(n, "noč", "noči", "noči", "noči")}`,
  },
} as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  // Il robot riceve un «ok»: dirgli di no gli insegnerebbe a passare.
  if (sembraUnRobot(body)) return NextResponse.json({ ok: true });

  const r = normalizza(body, ESPERIENZE_ID);
  const errori = valida(r);
  if (errori.length) return NextResponse.json({ ok: false, errori }, { status: 400 });

  const n = notti(r.arrivo, r.partenza);
  const casa = nomeCase(r);
  const pagina =
    r.casa === "entrambe"
      ? `${SITE}${r.lingua === "it" ? "" : `/${r.lingua}`}/affitti`
      : `${SITE}${r.lingua === "it" ? "" : `/${r.lingua}`}/affitti/${r.casa}`;
  const dateIt = `${dataLeggibile(r.arrivo, "it")} → ${dataLeggibile(r.partenza, "it")} (${n} ${n === 1 ? "notte" : "notti"})`;
  const ospitiIt = `${r.adulti} adulti${r.bambini ? `, ${r.bambini} bambini` : ""}${r.animali ? ", con animali" : ""}`;
  const serviziIt = r.servizi.map((id) => servizioTesto(id, "it"));

  const riepilogoInterno = [
    `Casa: ${casa}`,
    `Date: ${dateIt}`,
    `Ospiti: ${ospitiIt}`,
    `Tipo di soggiorno: ${NOME_TIPO[r.tipo]}`,
    serviziIt.length ? `Servizi richiesti: ${serviziIt.join("; ")}` : "",
    r.esperienze.length ? `Esperienze scelte: ${r.esperienze.join("; ")}` : "",
    r.messaggio ? `Messaggio: ${r.messaggio}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const sp = splitNomeCerta(r.nome);
  const salvato = await salvaLead({
    nome_completo: r.nome,
    nome: sp ? sp.nome : r.nome,
    ...(sp ? { cognome: sp.cognome } : {}),
    email: r.email,
    telefono: r.telefono,
    canale: "Sito FriuliVillas",
    azienda: "FriuliVillas",
    tipo_richiesta: "Richiesta info",
    motivo: "Richiedere disponibilità",
    messaggio: `[Soggiorno in affitto — preventivo]\n${riepilogoInterno}`,
    disponibilita_visita: dateIt,
    privacy_ok: r.privacyOk,
    immobile_url: pagina,
    lingua: r.lingua,
    stato: "NUOVO",
    data_contatto: new Date().toISOString(),
    import_source: ["WEB_FORM"],
  });

  const righe = (rows: Array<[string, string]>) =>
    rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7a82;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
      .join("");
  const inviataInterna = await mail(
    NOTIFY_EMAIL,
    `Preventivo soggiorno: ${casa} · ${r.arrivo} → ${r.partenza} · ${r.adulti + r.bambini} ospiti`,
    `<p><strong>Richiesta di preventivo per un soggiorno</strong> dal sito FriuliVillas.</p>
     <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${righe([
       ["Casa", casa],
       ["Date", dateIt],
       ["Ospiti", ospitiIt],
       ["Tipo", NOME_TIPO[r.tipo]],
       ["Servizi", serviziIt.join("; ")],
       ["Esperienze", r.esperienze.join("; ")],
       ["Messaggio", r.messaggio],
       ["Nome", r.nome],
       ["Email", r.email],
       ["Telefono", r.telefono],
       ["Lingua", r.lingua],
       ["Pagina", pagina],
     ])}</table>
     <p style="font-size:12px;color:#6b7a82">Le due case non sono in gestione nostra: la richiesta va girata a chi le gestisce. ${salvato ? "Salvata anche fra i lead." : "⚠️ NON salvata fra i lead (Airtable non ha risposto): questa mail è l'unica traccia."}</p>`,
    r.email || undefined,
  );

  if (!salvato && !inviataInterna) {
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
  }

  if (r.email) {
    const L = RECAP[r.lingua];
    const rows: Array<[string, string]> = [
      [L.casa, casa],
      [L.date, `${dataLeggibile(r.arrivo, r.lingua)} → ${dataLeggibile(r.partenza, r.lingua)} · ${L.notti(n)}`],
      [L.ospiti, [L.adulti(r.adulti), r.bambini ? L.bambini(r.bambini) : ""].filter(Boolean).join(", ")],
      [L.servizi, r.servizi.map((id) => servizioTesto(id, r.lingua)).join(", ")],
      [L.msg, r.messaggio],
    ].filter(([, v]) => v) as Array<[string, string]>;
    const html = brandMailShell({
      lang: r.lingua,
      body: `<p style="${mailText.title}">${L.hello}${r.nome ? `${r.lingua === "sl" ? ", " : " "}${esc(r.nome)}` : ""},</p>
        <p style="${mailText.p}">${L.body.charAt(0).toUpperCase() + L.body.slice(1)}</p>
        ${mailRecapCard(L.card, rows.map(([k, v]) => [esc(k), esc(v)] as [string, string]))}
        ${mailCta(esc(pagina), L.cta)}
        <p style="${mailText.p}">${L.closing}</p>
        <p style="${mailText.small}">FriuliVillas · ${mailContact.email}</p>`,
    });
    await mail(r.email, L.subject(casa), html, NOTIFY_EMAIL);
  }

  return NextResponse.json({ ok: true });
}
