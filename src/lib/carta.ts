// La proiezione della carta (07/10/2026): lo stesso Mercatore del rilievo
// (scripts/geo/genera-carta.mjs). Ogni punto della carta passa da qui, così
// cade esattamente dove lo disegnano rilievo, aree e costa.
import { ALTEZZA, LARGHEZZA, MERCATORE, AREE_FORME } from "@/content/carta/forme";
import type { AreaId } from "./aree";

export { ALTEZZA, LARGHEZZA };

export function proietta(lat: number, lng: number): [number, number] {
  const { S, px0, py0, px1, py1 } = MERCATORE;
  const xw = ((lng + 180) / 360) * S;
  const r = (lat * Math.PI) / 180;
  const yw = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * S;
  return [((xw - px0) / (px1 - px0)) * LARGHEZZA, ((yw - py0) / (py1 - py0)) * ALTEZZA];
}

/** Il riquadro (in px della carta) che contiene un'area, col margine. */
export function riquadroArea(area: AreaId, margine = 0.12): { x: number; y: number; w: number; h: number } {
  const d = AREE_FORME[area].d;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const m of d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)) {
    const x = Number(m[1]), y = Number(m[2]);
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  const w = x1 - x0, h = y1 - y0;
  // Mai più stretto di 4:3 orizzontale né più alto di 1:1, perché in pagina la carta sta in una fascia.
  let X = x0 - w * margine, Y = y0 - h * margine, W = w * (1 + 2 * margine), H = h * (1 + 2 * margine);
  if (W / H < 4 / 3) { const nw = H * (4 / 3); X -= (nw - W) / 2; W = nw; }
  X = Math.max(0, Math.min(X, LARGHEZZA - W)); Y = Math.max(0, Math.min(Y, ALTEZZA - H));
  W = Math.min(W, LARGHEZZA); H = Math.min(H, ALTEZZA);
  return { x: Math.round(X), y: Math.round(Y), w: Math.round(W), h: Math.round(H) };
}
