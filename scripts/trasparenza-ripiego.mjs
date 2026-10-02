// La trasparenza AI quando il CRM non risponde: l'ELENCO DI RIPIEGO, e il
// cancello della build (01/10/2026, review post-pubblicazione di FriuliVillas).
//
// Il guasto che chiude: alla prima lettura dopo un deploy la Data Cache non ha
// copia della vista (la chiave di unstable_cache contiene il sorgente), e se in
// quel momento il CRM è lento o guasto il sito sapeva mettere la sigla «AI»
// solo sui nomi da generatore (`hf_…`). Muggia ha 43 righe AI su 43 senza firma
// nel nome, Le Vigne 46 su 55 (`IMG_*`): quelle foto, copertina di Muggia
// compresa, uscivano NUDE finché un ISR non andava a buon fine.
//
// Due difese, una per momento:
//   1. BUILD — `--build` (nel prebuild): se la vista non è leggibile la build
//      FALLISCE. Su Vercel una build fallita non va in produzione: resta online
//      il deploy precedente, che le etichette le ha.
//   2. RUNTIME — src/content/trasparenza-ripiego.json, versionato: per ogni
//      immobile, l'impronta del nome di ogni foto → il suo trattamento. Lo legge
//      src/lib/trasparenza.ts quando non ha né la vista né una copia buona in
//      memoria: le foto AI escono con l'etichetta del loro trattamento (senza
//      didascalia né nota: è un elenco MINIMO).
//
// Uso (dalla radice del repo):
//   node scripts/trasparenza-ripiego.mjs --scrivi   rigenera l'elenco dalla vista
//                                                   (poi si committa)
//   node scripts/trasparenza-ripiego.mjs --build    il cancello del prebuild:
//       vista illeggibile ⇒ exit 1. Su Vercel (VERCEL=1) riscrive anche
//       l'elenco nel clone della build, così il deploy porta il ripiego più
//       fresco possibile; in locale non tocca il file tracciato e avvisa se è
//       indietro rispetto alla vista.
//
// Perché impronte e non nomi: i nomi dei file a volte portano il nome della
// cartella di chi vende (regola ferrea del KB: dal CRM non escono i nomi dei
// proprietari), e questo file sta in git. Dalla vista si tiene SOLO
// sha256(filename) troncato a 16 caratteri esadecimali, per immobile; il sito
// calcola la stessa impronta sul nome della foto che mostra
// (trasparenza.ts → improntaNome). Le due funzioni vanno tenute identiche.
//
// ── I VIDEO (01/10 sera, SPEC §10) ─────────────────────────────────────────
// La vista porta anche il registro dei video (`video`). L'elenco li tiene in
// chiaro, per chiave (`youtube:<id>`, `fv:<percorso>`) → trattamento (per il
// segno discreto della home, SPEC §11.1), etichetta e didascalia nelle quattro
// lingue: chiavi e testi sono già pubblici sul sito.
// Ci stanno TUTTE le righe, anche quelle senza etichetta (una ripresa vera):
// la riga che dice «niente etichetta» deve vincere anche dal ripiego sulla
// frase scritta a mano (videoAi.ts → etichettaVideoOManuale). Con `video: null`
// (registro illeggibile, vista comunque «letta») la sezione del file NON si
// riscrive: resta l'ultima buona.
// Il cancello poi ELENCA, come avviso e senza fermare la build, i video che il
// sito mostra e che nel registro non hanno riga (e quindi escono senza
// etichetta): gli YouTube delle schede del catalogo (dal catalogo della
// vetrina, `youtube_urls`) e i file video del sito citati nel sorgente.
//
// L'indirizzo della vista è lo stesso del sito: `CRM_TRASPARENZA_URL` (URL
// completa, per i collaudi con una vista di prova) oppure l'origine di
// `CRM_VETRINA_URL`, di default https://tsv-pg.vercel.app.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const SITO = "friulivillas.com";
const FILE = join(process.cwd(), "src/content/trasparenza-ripiego.json");
const TENTATIVI = 3;
const TIMEOUT_MS = 15000;
const PAUSA_MS = 4000;

function origineVetrina() {
  const configurata = (process.env.CRM_VETRINA_URL || "").trim();
  try {
    if (configurata) return new URL(configurata).origin;
  } catch {
    /* URL malformata: si ripiega sul default, come il sito */
  }
  return "https://tsv-pg.vercel.app";
}
const VISTA_URL =
  (process.env.CRM_TRASPARENZA_URL || "").trim() ||
  `${origineVetrina()}/api/vetrina?sito=${SITO}&vista=trasparenza`;

const REC_ID = /^rec[A-Za-z0-9]{14}$/;
const LINGUE = ["it", "en", "de", "sl"];
// Identica a chiaveValida() di src/lib/videoAi.ts.
const RE_CHIAVE_VIDEO = /^(?:youtube:[\w-]{11}|fv:\/[^\s?#]+\.(?:mp4|webm|mov|m4v))$/;
// Identica a youtubeIds() della scheda (src/app/[locale]/annuncio/[slug]/page.tsx).
const RE_YOUTUBE = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/;

function testi(v) {
  if (!v || typeof v !== "object") return null;
  const t = Object.fromEntries(LINGUE.map((l) => [l, typeof v[l] === "string" && v[l].trim() ? v[l].trim() : null]));
  return LINGUE.some((l) => t[l] !== null) ? t : null;
}

/** Il registro dei video della vista, per chiave; null se illeggibile. Come leggiVideo() del sito. */
function videoDa(v) {
  if (!Array.isArray(v)) return null;
  const out = {};
  for (const r of v) {
    if (!r || typeof r.chiave !== "string" || !RE_CHIAVE_VIDEO.test(r.chiave)) continue;
    out[r.chiave] = {
      trattamento: typeof r.trattamento === "string" ? r.trattamento : null,
      etichetta: testi(r.etichetta),
      didascalia: testi(r.didascalia),
    };
  }
  return Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
}

/** Identica a improntaNome() in src/lib/trasparenza.ts. */
export function improntaNome(filename) {
  return createHash("sha256").update(filename, "utf8").digest("hex").slice(0, 16);
}

/** Stessa validazione di leggiRisposta() in src/lib/trasparenza.ts: lancia se non è una vista buona. */
function elencoDa(dati) {
  if (!dati || typeof dati !== "object") throw new Error("risposta non JSON");
  if (dati.vista !== "trasparenza") throw new Error(`vista «${String(dati.vista)}» invece di «trasparenza»`);
  if (dati.stato !== "letta") throw new Error(`stato «${String(dati.stato)}»: il CRM non ha letto le tabelle`);
  if (!Array.isArray(dati.immobili)) throw new Error("risposta senza `immobili`");
  const immobili = {};
  let foto = 0;
  for (const r of dati.immobili) {
    const id = typeof r?.airtable_id === "string" && REC_ID.test(r.airtable_id) ? r.airtable_id : null;
    const t = r?.trasparenza;
    if (!id || !t || typeof t !== "object") continue;
    const nonAbbinate = Number.isFinite(t.conteggi?.ai_non_abbinate) ? t.conteggi.ai_non_abbinate : 0;
    const perImpronta = {};
    for (const f of Array.isArray(t.foto) ? t.foto : []) {
      if (typeof f?.filename !== "string") continue;
      const chiave = improntaNome(f.filename);
      const trattamento = typeof f.trattamento === "string" ? f.trattamento : "ai";
      // Due nomi con la stessa impronta: vince il trattamento che etichetta
      // (mai uno «tecnico» che tolga la sigla a una foto AI).
      if (perImpronta[chiave] && trattamento === "tecnico") continue;
      perImpronta[chiave] = trattamento;
    }
    const chiavi = Object.keys(perImpronta).sort();
    if (!chiavi.length && !nonAbbinate) continue;
    foto += chiavi.length;
    immobili[id] = {
      non_abbinate: nonAbbinate,
      foto: Object.fromEntries(chiavi.map((k) => [k, perImpronta[k]])),
    };
  }
  const ordinati = Object.fromEntries(Object.keys(immobili).sort().map((k) => [k, immobili[k]]));
  return { immobili: ordinati, foto, video: videoDa(dati.video) };
}

const dorme = (ms) => new Promise((r) => setTimeout(r, ms));

async function leggiVista() {
  let ultimo = null;
  for (let i = 1; i <= TENTATIVI; i++) {
    try {
      const res = await fetch(VISTA_URL, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return elencoDa(await res.json());
    } catch (e) {
      ultimo = e instanceof Error ? e.message : String(e);
      console.warn(`  · tentativo ${i}/${TENTATIVI}: ${ultimo}`);
      if (i < TENTATIVI) await dorme(PAUSA_MS);
    }
  }
  throw new Error(ultimo ?? "vista non letta");
}

function leggiFile() {
  try {
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    return null;
  }
}

/** Il registro dei video da scrivere: quello della vista, o (se illeggibile) l'ultimo del file. */
const videoDaScrivere = (vista, file) => vista.video ?? file?.video ?? {};

function scriviFile(elenco, file) {
  const contenuto = {
    _leggimi:
      "Ripiego della trasparenza AI quando la vista del CRM non risponde. Generato da scripts/trasparenza-ripiego.mjs: non si scrive a mano. Foto: chiave = sha256(nome del file) troncato a 16 caratteri, per immobile (id record Airtable). Video: chiave del registro video_trasparenza → trattamento, etichetta e didascalia.",
    versione: 2,
    sito: SITO,
    generato_il: new Date().toISOString(),
    foto: elenco.foto,
    immobili: elenco.immobili,
    video: videoDaScrivere(elenco, file),
  };
  writeFileSync(FILE, JSON.stringify(contenuto, null, 2) + "\n");
}

/** Quante voci cambiano fra il file e la vista (trattamento diverso, in più, in meno). */
function differenze(file, vista) {
  const piatto = (imm) => {
    const m = new Map();
    for (const [rec, v] of Object.entries(imm ?? {})) {
      for (const [k, t] of Object.entries(v.foto ?? {})) m.set(`${rec}/${k}`, t);
      m.set(`${rec}/#non_abbinate`, String(v.non_abbinate ?? 0));
    }
    return m;
  };
  const a = piatto(file?.immobili);
  const b = piatto(vista.immobili);
  // i video: una voce per chiave, confrontata per intero
  for (const [k, v] of Object.entries(file?.video ?? {})) a.set(`video/${k}`, JSON.stringify(v));
  for (const [k, v] of Object.entries(videoDaScrivere(vista, file))) b.set(`video/${k}`, JSON.stringify(v));
  let n = 0;
  for (const [k, v] of b) if (a.get(k) !== v) n++;
  for (const k of a.keys()) if (!b.has(k)) n++;
  return n;
}

const modo = process.argv[2];
if (modo !== "--build" && modo !== "--scrivi") {
  console.error("uso: node scripts/trasparenza-ripiego.mjs --build | --scrivi");
  process.exit(2);
}

let vista;
try {
  vista = await leggiVista();
} catch (e) {
  console.error(`✖ trasparenza-ripiego: la vista del CRM non è leggibile (${e instanceof Error ? e.message : e}).`);
  console.error(`  ${VISTA_URL.replace(/\?.*$/, "?…")}`);
  if (modo === "--build") {
    console.error("  La build si ferma di proposito: senza la vista le foto AI con nomi qualsiasi");
    console.error("  uscirebbero senza etichetta. Su Vercel resta online il deploy precedente.");
  }
  process.exit(1);
}

const file = leggiFile();
const diff = differenze(file, vista);
const quanti = `${Object.keys(vista.immobili).length} immobili, ${vista.foto} foto, ${
  vista.video ? `${Object.keys(vista.video).length} video` : "registro dei video ILLEGGIBILE"
}`;
if (!vista.video)
  console.warn(
    `  ⚠ la vista non porta il registro dei video (\`video: null\`): il sito userà l'ultimo registro buono (${
      Object.keys(file?.video ?? {}).length
    } video nell'elenco di ripiego)`,
  );

if (modo === "--scrivi") {
  if (diff === 0 && file) {
    console.log(`✓ trasparenza-ripiego: l'elenco è già allineato alla vista (${quanti})`);
  } else {
    scriviFile(vista, file);
    console.log(`✓ trasparenza-ripiego: elenco riscritto (${quanti}; ${diff} voci cambiate) → committare src/content/trasparenza-ripiego.json`);
  }
} else if (process.env.VERCEL === "1") {
  if (diff > 0 || !file) scriviFile(vista, file);
  console.log(`✓ trasparenza-ripiego: vista letta (${quanti}); ripiego del deploy ${diff ? `aggiornato (${diff} voci più fresche del repo)` : "uguale al repo"}`);
} else {
  console.log(`✓ trasparenza-ripiego: vista letta (${quanti})`);
  if (diff > 0)
    console.warn(
      `  ⚠ l'elenco nel repo è indietro di ${diff} voci: node scripts/trasparenza-ripiego.mjs --scrivi, poi committare (su Vercel si aggiorna da sé nel deploy)`,
    );
}

// ---- L'avviso: i video del sito senza riga nel registro ----------------------

/** I file video del sito citati nel sorgente (src/), come chiavi `fv:`. Il 720p del video di testata (`mp4Sm`) è lo stesso filmato del 1080. */
function fileVideoDelSito() {
  const out = new Map();
  const giro = (dir) => {
    for (const nome of readdirSync(dir)) {
      const p = join(dir, nome);
      if (statSync(p).isDirectory()) giro(p);
      else if (/\.(ts|tsx|mts)$/.test(nome)) {
        const testo = readFileSync(p, "utf8");
        for (const m of testo.matchAll(/(mp4Sm\s*:\s*)?(["'`])(\/(?:video|media)\/[^"'`\s]+\.(?:mp4|webm|mov|m4v))\2/g)) {
          if (m[1]) continue;
          const chiave = `fv:${m[3]}`;
          if (!out.has(chiave)) out.set(chiave, relative(process.cwd(), p));
        }
      }
    }
  };
  giro(join(process.cwd(), "src"));
  return out;
}

/** Gli YouTube delle schede del catalogo (dal catalogo della vetrina). Null se il catalogo non si legge. */
async function youtubeDelCatalogo() {
  const url = VISTA_URL.replace(/([?&])vista=trasparenza&?/, "$1").replace(/[?&]$/, "");
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dati = await res.json();
    if (!Array.isArray(dati?.immobili)) throw new Error("risposta senza `immobili`");
    const out = new Map();
    for (const r of dati.immobili) {
      const righe = typeof r?.youtube_urls === "string" ? r.youtube_urls.split(/\r?\n/) : [];
      for (const u of righe) {
        const id = u.trim().match(RE_YOUTUBE)?.[1];
        // Il nome PUBBLICO della scheda, mai il nome interno o il codice (che
        // può portare il cognome di chi vende): regola ferrea del KB.
        if (id && !out.has(`youtube:${id}`)) out.set(`youtube:${id}`, typeof r.public_name === "string" ? r.public_name : r.airtable_id);
      }
    }
    return out;
  } catch (e) {
    console.warn(`  ⚠ catalogo della vetrina non letto (${e instanceof Error ? e.message : e}): gli YouTube delle schede non sono stati confrontati col registro`);
    return null;
  }
}

{
  const registro = vista.video ?? file?.video ?? {};
  const daControllare = new Map([...fileVideoDelSito(), ...((await youtubeDelCatalogo()) ?? new Map())]);
  const senzaRiga = [...daControllare].filter(([k]) => !Object.prototype.hasOwnProperty.call(registro, k));
  if (senzaRiga.length) {
    console.warn(`  ⚠ ${senzaRiga.length} video del sito SENZA riga nel registro dei video del CRM: escono senza etichetta finché non si registrano (SPEC §10, trasparenza-video-carica.mjs)`);
    for (const [k, dove] of senzaRiga) console.warn(`    · ${k}  (${dove})`);
  } else {
    console.log(
      `✓ trasparenza-ripiego: i ${daControllare.size} video del sito hanno tutti la loro riga nel registro${vista.video ? "" : " (l'ultimo buono, dall'elenco di ripiego)"}`,
    );
  }
}
