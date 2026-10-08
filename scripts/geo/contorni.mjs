// Curve di livello del FVG come SVG statico (stesso metodo di sloveniavillas src/components/mappa/geo.ts:
// griglia campionata bilineare, d3-contour, scarto degli anelli < 2,2 celle, Douglas-Peucker).
import fs from "node:fs"; import zlib from "node:zlib"; import { contours } from "d3-contour";
const meta = JSON.parse(fs.readFileSync("out/fvg-terrain.json", "utf8"));
const b = fs.readFileSync("out/fvg-f32.bin"); const Z = new Float32Array(b.buffer, b.byteOffset, b.length / 4);
const [celle, passo, magg, tol, W, nome, tema] = [ +process.argv[2] || 260, +process.argv[3] || 200, +process.argv[4] || 1000, +process.argv[5] || 1.4, 1600, process.argv[6] || "fvg-contorni", process.argv[7] || "chiaro" ];
const H = Math.round(W * meta.height / meta.width);
const ny = Math.round(celle * H / W), nx = celle;
const camp = (u, v) => { const x = u * meta.width - 0.5, y = v * meta.height - 0.5; const i = Math.max(0, Math.min(meta.width - 2, Math.floor(x))), j = Math.max(0, Math.min(meta.height - 2, Math.floor(y))); const fx = x - i, fy = y - j, w = meta.width;
  return Z[j*w+i]*(1-fx)*(1-fy) + Z[j*w+i+1]*fx*(1-fy) + Z[(j+1)*w+i]*(1-fx)*fy + Z[(j+1)*w+i+1]*fx*fy; };
const G = new Float64Array((nx+2)*(ny+2)).fill(-1e4);
for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) G[(j+1)*(nx+2)+i+1] = camp((i+.5)/nx, (j+.5)/ny);
const sx = W / nx, sy = H / ny, av = (p) => [(p[0]-1)*sx, (p[1]-1)*sy];
function dp(pts, eps) { const n = pts.length; if (n < 3) return pts; const k = new Uint8Array(n); k[0]=k[n-1]=1; const st=[[0,n-1]];
  while (st.length) { const [a,c]=st.pop(); const [ax,ay]=pts[a],[cx,cy]=pts[c]; const dx=cx-ax,dy=cy-ay,l=Math.hypot(dx,dy)||1; let m=-1,ix=-1;
    for (let i=a+1;i<c;i++){ const d=(dx===0&&dy===0)?Math.hypot(pts[i][0]-ax,pts[i][1]-ay):Math.abs(dy*pts[i][0]-dx*pts[i][1]+cx*ay-cy*ax)/l; if(d>m){m=d;ix=i;} } if (m>eps){k[ix]=1; st.push([a,ix],[ix,c]);} }
  return pts.filter((_,i)=>k[i]); }
const linea = (pts) => "M" + pts.map(p => `${Math.round(p[0])} ${Math.round(p[1])}`).join("L") + "Z";
const soglie = []; for (let l = passo; l < 3100; l += passo) soglie.push(l);
let min = "", mag = "", n = 0;
for (const c of contours().size([nx+2, ny+2]).thresholds(soglie)(G)) {
  const isM = c.value % magg === 0; let s = "";
  for (const poli of c.coordinates) for (const an of poli) { const pts = an.map(av); let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for (const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}
    if (x1-x0 < sx*2.2 && y1-y0 < sx*2.2) continue; s += linea(dp(pts, tol)); n++; }
  if (isM) mag += s; else min += s;
}
const [terra] = contours().size([nx+2, ny+2]).thresholds([0.5])(G);
let t = ""; for (const poli of terra.coordinates) for (const an of poli) t += linea(dp(an.map(av), tol*0.6));
const P = tema === "chiaro"
  ? { mare: "#CBDBDE", terra: "#ECE7D8", min: 'stroke="#2A5F43" stroke-opacity=".22" stroke-width=".6"', mag: 'stroke="#2A5F43" stroke-opacity=".5" stroke-width="1"', costa: "#3E6E7E" }
  : { mare: "#04090D", terra: "#0B161E", min: 'stroke="#E3CDA4" stroke-opacity=".13" stroke-width=".6"', mag: 'stroke="#E3CDA4" stroke-opacity=".34" stroke-width="1"', costa: "#CFB795" };
const nse = 'vector-effect="non-scaling-stroke" fill="none"';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${P.mare}"/><path d="${t}" fill="${P.terra}" fill-rule="evenodd"/><path d="${min}" ${P.min} ${nse}/><path d="${mag}" ${P.mag} ${nse}/><path d="${t}" stroke="${P.costa}" stroke-width="1.1" stroke-opacity=".8" ${nse}/></svg>`;
fs.writeFileSync(`out/${nome}.svg`, svg);
console.log(`${nome}: celle ${celle} (${(meta.width*meta.metersPerPixel/celle).toFixed(0)} m), passo ${passo}/${magg}, anelli ${n}, ${(svg.length/1024).toFixed(0)} KB, gzip ${(zlib.gzipSync(svg,{level:9}).length/1024).toFixed(0)} KB, br ${(zlib.brotliCompressSync(svg).length/1024).toFixed(0)} KB`);
