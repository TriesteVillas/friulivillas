// Genera src/content/carta/tempi.ts dai tempi OSRM misurati il 07/10/2026
// (data/geo/tempi-osrm.csv: router.project-osrm.org, profilo auto, SENZA
// traffico né attese al confine; destinazione = sede municipale). Il sito non
// chiama mai OSRM dal vivo: legge solo queste misure.
// Uso: node scripts/geo/genera-tempi.mjs
import { readFileSync, writeFileSync } from "node:fs";
const righe = readFileSync("data/geo/tempi-osrm.csv", "utf8").trim().split(/\r?\n/);
const split = (l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, ""));
const cols = split(righe[0]);
const ORIGINI = [];
const T = {};
let data = "";
for (const l of righe.slice(1)) {
  const r = Object.fromEntries(split(l).map((v, i) => [cols[i], v]));
  if (!ORIGINI.includes(r.origine)) ORIGINI.push(r.origine);
  (T[r.dest_id] ??= {})[r.origine] = Math.round(Number(r.minuti));
  data = r.data_misura;
}
const tab = Object.fromEntries(Object.entries(T).map(([k, v]) => [k, ORIGINI.map((o) => v[o] ?? null)]));
writeFileSync(
  "src/content/carta/tempi.ts",
  `// GENERATO da scripts/geo/genera-tempi.mjs — non modificare a mano.
// Minuti in auto, OSRM senza traffico, misurati il ${data}. Chiave: codice ISTAT del comune (o F-<frazione>).
export const DATA_MISURA = ${JSON.stringify(data)};
export const ORIGINI = ${JSON.stringify(ORIGINI)} as const;
export type Origine = (typeof ORIGINI)[number];
export const MINUTI: Record<string, (number | null)[]> = ${JSON.stringify(tab)};
`,
);
console.log(`tempi: ${Object.keys(tab).length} destinazioni × ${ORIGINI.length} origini (${data})`);
