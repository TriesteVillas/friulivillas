// Rigenera il blocco <dati> di src/lib/aree.ts da data/geo/ (07/10/2026).
// Fonti: aree-comuni.csv (ISTAT SITUAS + Piano paesaggistico FVG 2018, schema S4)
// e costa-fvg-lite.geojson (ISTAT «Linea litoranea» 31/12/2021, semplificata).
// Uso: node scripts/genera-aree.mjs
import { readFileSync, writeFileSync } from "node:fs";

const csv = (f) => {
  const [h, ...righe] = readFileSync(f, "utf8").trim().split(/\r?\n/);
  const split = (l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'));
  const cols = split(h);
  return righe.map((l) => Object.fromEntries(split(l).map((v, i) => [cols[i], v])));
};
const chiave = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");

const aree = csv("data/geo/aree-comuni.csv");
const anag = new Map(csv("data/geo/comuni-fvg.csv").map((r) => [r.codice_istat, r]));
const COMUNI = {};
const ALIAS = {};
for (const r of aree) {
  const k = chiave(r.comune);
  const a = anag.get(r.codice_istat);
  COMUNI[k] = [r.comune, r.S4 === "carso-trieste" ? "trieste-carso" : r.S4, Number(a.lat), Number(a.lon), r.codice_istat];
  for (const alt of [a?.denominazione_ufficiale, ...(a?.denominazione_altra_lingua ?? "").split(/[/;]/)]) {
    const ka = alt ? chiave(alt) : "";
    if (ka && ka !== k && !COMUNI[ka]) ALIAS[ka] = k;
  }
}
const costa = JSON.parse(readFileSync("data/geo/costa-fvg-lite.geojson", "utf8"));
const COSTA = [];
for (const f of costa.features) {
  const g = f.geometry;
  const linee = g.type === "LineString" ? [g.coordinates] : g.coordinates;
  for (const l of linee) COSTA.push(l.map(([x, y]) => [Math.round(x * 1e4) / 1e4, Math.round(y * 1e4) / 1e4]));
}
const blocco =
  "// <dati> — generato da scripts/genera-aree.mjs, non modificare a mano\n" +
  `const COMUNI: Record<string, [string, string, number, number, string]> = ${JSON.stringify(COMUNI)};\n` +
  `const ALIAS: Record<string, string> = ${JSON.stringify(ALIAS)};\n` +
  `const COSTA: [number, number][][] = ${JSON.stringify(COSTA)};\n` +
  "// </dati>";
const file = "src/lib/aree.ts";
const src = readFileSync(file, "utf8");
writeFileSync(file, src.replace(/\/\/ <dati>[\s\S]*\/\/ <\/dati>/, blocco));
console.log(`aree: ${Object.keys(COMUNI).length} comuni, ${Object.keys(ALIAS).length} alias, ${COSTA.length} linee di costa`);
