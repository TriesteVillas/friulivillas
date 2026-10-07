// Genera src/content/carta/forme.ts: le forme della carta del FVG proiettate
// nello stesso Mercatore del rilievo (public/geo/rilievo-fvg-*.avif,
// data/geo/rilievo-meta.json), così aree, costa e punti cadono esattamente sul
// rilievo. Fonti: ISTAT confini generalizzati 01/01/2026 e Linea litoranea
// 31/12/2021 (CC BY 4.0); aree da data/geo/aree-S4.geojson.
// Uso: node scripts/geo/genera-carta.mjs
import { readFileSync, writeFileSync } from "node:fs";

const meta = JSON.parse(readFileSync("data/geo/rilievo-meta.json", "utf8"));
const { width: W, height: H } = meta;
const S = 256 * 2 ** meta.mercator.z;
const { px0, py0, px1, py1 } = meta.mercator;
const proj = ([lon, lat]) => {
  const xw = ((lon + 180) / 360) * S;
  const r = (lat * Math.PI) / 180;
  const yw = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * S;
  return [((xw - px0) / (px1 - px0)) * W, ((yw - py0) / (py1 - py0)) * H];
};
const r1 = (n) => Math.round(n * 10) / 10;
const anello = (ring) => "M" + ring.map((p) => proj(p).map(r1).join(",")).join("L") + "Z";
const poligoni = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);
const pathDi = (g) => poligoni(g).map((poly) => poly.map(anello).join("")).join("");

// baricentro dell'anello più grande, per l'etichetta
function centro(g) {
  let best = null, area = 0;
  for (const poly of poligoni(g)) {
    const pts = poly[0].map(proj);
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const f = x0 * y1 - x1 * y0;
      a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
    }
    if (Math.abs(a) > area) { area = Math.abs(a); best = [r1(cx / (3 * a)), r1(cy / (3 * a))]; }
  }
  return best;
}

const aree = JSON.parse(readFileSync("data/geo/aree-S4.geojson", "utf8"));
const AREE = {};
for (const f of aree.features) {
  const id = f.properties.area === "carso-trieste" ? "trieste-carso" : f.properties.area;
  AREE[id] = { d: pathDi(f.geometry), centro: centro(f.geometry), comuni: f.properties.n_comuni };
}
const regione = JSON.parse(readFileSync("data/geo/regione-fvg.geojson", "utf8")).features[0].geometry;
const costa = JSON.parse(readFileSync("data/geo/costa-fvg-lite.geojson", "utf8"));
let costaD = "";
for (const f of costa.features) {
  const g = f.geometry;
  for (const l of g.type === "LineString" ? [g.coordinates] : g.coordinates)
    costaD += "M" + l.map((p) => proj(p).map(r1).join(",")).join("L");
}
const out = `// GENERATO da scripts/geo/genera-carta.mjs — non modificare a mano.
// Mercatore del rilievo: ${W}×${H} px, bbox ${JSON.stringify(meta.bbox)}.
export const LARGHEZZA = ${W};
export const ALTEZZA = ${H};
export const BBOX = ${JSON.stringify(meta.bbox)};
export const MERCATORE = ${JSON.stringify({ ...meta.mercator, S })};
export const AREE_FORME: Record<string, { d: string; centro: [number, number]; comuni: number }> = ${JSON.stringify(AREE)};
export const REGIONE_D = ${JSON.stringify(pathDi(regione))};
export const COSTA_D = ${JSON.stringify(costaD)};
`;
writeFileSync("src/content/carta/forme.ts", out);
console.log("carta:", Object.keys(AREE).join(", "), (out.length / 1024).toFixed(0) + " KB");
