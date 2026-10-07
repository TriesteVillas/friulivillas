import sharp from "sharp";
import { mkdirSync } from "node:fs";
const F = process.env.HOME + "/.tsv-work/FV-RIFACIMENTO/foto/";
const scelte = {
  "costa-laguna": "mare/mare-grado-laguna-aerea.jpg",
  "colline-pianura": "colline/colline-cividale-ponte-del-diavolo.jpg",
  montagna: "montagna/montagna-fusine-mangart-tramonto.jpg",
  "trieste-carso": "mare/mare-duino-castello-falesie.jpg",
};
for (const [a, f] of Object.entries(scelte)) {
  mkdirSync(`public/media/aree/${a}`, { recursive: true });
  for (const w of [800, 1600]) {
    const info = await sharp(F + f).rotate().resize({ width: w, height: Math.round(w * 9 / 16), fit: "cover", position: "attention" }).webp({ quality: w > 1000 ? 58 : 70 }).toFile(`public/media/aree/${a}/foto-${w}.webp`);
    console.log(a, w, info.size);
  }
}
