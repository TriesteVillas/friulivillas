// Cancello delle AREE (07/10/2026): il catalogo di friulivillas.com si divide
// per area del territorio (src/lib/aree.ts), non più per il campo `zona` del
// CRM, che è una tassonomia di Trieste.
//
// Cosa controlla:
//   DATI — i 215 comuni del FVG hanno tutti un'area, nei conti del dossier
//     (58 montagna · 10 Trieste e Carso · 9 costa e laguna · 138 colline e pianura).
//   COMPORTAMENTO — le sette case vere del catalogo del 07/10 finiscono dove
//     devono (Grado al mare, Sappada in montagna, Begliano fuori dalla costa per
//     coordinate, Duino e Muggia in Trieste e Carso), più gli affitti di Viaso.
//   IL METRO SA DIRE DI NO — le stesse prove girano sulla regola di prima
//     (raggruppare per `zona`) e DEVONO trovarla in difetto: se un giorno la
//     regola vecchia passa, il metro è rotto.
//   CABLAGGIO — catalogo, home e sitemap non raggruppano più per `zona`.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const ROOT = process.cwd();
const errori = [];
const prova = (cond, msg) => { if (!cond) errori.push(msg); };

const m = await import(pathToFileURL(join(ROOT, "src/lib/aree.ts")).href);

// ── DATI ──────────────────────────────────────────────────────────────
const csv = readFileSync(join(ROOT, "data/geo/aree-comuni.csv"), "utf8").trim().split(/\r?\n/).slice(1);
const nomi = csv.map((l) => (l.match(/^[^,]*,("([^"]|"")*"|[^,]*)/)[1]).replace(/^"|"$/g, ""));
const conti = {};
for (const n of nomi) {
  const a = m.areaDelComune(n);
  prova(a, `comune senza area: ${n}`);
  conti[a] = (conti[a] ?? 0) + 1;
}
const attesi = { montagna: 58, "trieste-carso": 10, "costa-laguna": 9, "colline-pianura": 138 };
prova(nomi.length === 215, `comuni letti: ${nomi.length}, attesi 215`);
for (const [a, n] of Object.entries(attesi)) prova(conti[a] === n, `${a}: ${conti[a]} comuni, attesi ${n}`);

// ── I CASI: le case del catalogo del 07/10 (vetrina del CRM) + gli affitti di Viaso.
const CASI = [
  { id: "isola di Grado", comune: "Grado", zona: "FVG", lat: 45.6781, lng: 13.3979, area: "costa-laguna" },
  { id: "casale di Scodovacca", comune: "Cervignano del Friuli", zona: "FVG", lat: null, lng: null, area: "colline-pianura" },
  { id: "villa di Ronchi", comune: "Ronchi dei Legionari", zona: "FVG", lat: 45.8243, lng: 13.5, area: "colline-pianura" },
  { id: "quadrilocale di Sappada", comune: "Sappada", zona: "FVG", lat: 46.56554, lng: 12.68026, area: "montagna" },
  { id: "bifamiliare di Muggia", comune: "Muggia", zona: "MUGGIA", lat: 45.5981, lng: 13.7483, area: "trieste-carso" },
  { id: "villetta di Duino", comune: "Duino-Aurisina", zona: "SISTIANA-DUINO", lat: null, lng: null, area: "trieste-carso" },
  { id: "villa di Begliano", comune: "San Canzian d'Isonzo", zona: "FVG", lat: 45.8227208, lng: 13.4649991, area: "colline-pianura" },
  { id: "affitto a Viaso", comune: "Socchieve", zona: null, lat: 46.4, lng: 12.83, area: "montagna" },
  { id: "casa a Lignano", comune: "Lignano Sabbiadoro", zona: "FVG", lat: 45.689, lng: 13.13, area: "costa-laguna" },
];
// Le coppie che NON devono stare insieme (il difetto segnalato da Martino il 06/10).
const SEPARATE = [["isola di Grado", "quadrilocale di Sappada"], ["isola di Grado", "villa di Begliano"], ["casale di Scodovacca", "affitto a Viaso"]];

function giudica(regola) {
  const out = [];
  const area = Object.fromEntries(CASI.map((c) => [c.id, regola(c)]));
  for (const c of CASI) if (area[c.id] !== c.area && regola === nuova) out.push(`${c.id}: ${area[c.id]} invece di ${c.area}`);
  for (const [a, b] of SEPARATE) if (area[a] === area[b]) out.push(`${a} e ${b} nello stesso gruppo (${area[a]})`);
  const aree = new Set(Object.values(area));
  if (aree.size < 4) out.push(`solo ${aree.size} gruppi distinti`);
  return out;
}
const nuova = (c) => m.areaDi(c);
const vecchia = (c) => (["CENTRO", "SEMICENTRO", "BARCOLA", "BARCOLA-MIRAMARE", "COSTIERA", "SISTIANA-DUINO", "ALTE", "MUGGIA", "FVG"].includes((c.zona ?? "").toUpperCase()) ? c.zona.toUpperCase() : "ALTRE");

for (const e of giudica(nuova)) errori.push(`regola nuova: ${e}`);
const difettiVecchia = giudica(vecchia);
prova(difettiVecchia.length > 0, "il metro è rotto: la regola per `zona` passa le prove");

// ── CABLAGGIO ─────────────────────────────────────────────────────────
for (const f of ["src/app/[locale]/immobili/page.tsx", "src/app/[locale]/page.tsx", "src/app/sitemap.ts"]) {
  const s = readFileSync(join(ROOT, f), "utf8");
  prova(!/groupByZone|zoneKey/.test(s), `${f} raggruppa ancora per zona`);
}

if (errori.length) {
  console.error(`✖ check-aree: ${errori.length} difetti\n  - ${errori.join("\n  - ")}`);
  process.exit(1);
}
console.log(`✓ check-aree: 215 comuni, ${CASI.length} casi veri, la regola per zona fallisce come deve (${difettiVecchia.length} difetti)`);
