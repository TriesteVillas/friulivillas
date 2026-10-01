// La prova che il cancello check-etichette-ai.mjs SA DIRE DI NO.
//
// Copia src/ in una cartella temporanea, ci applica uno per uno gli
// aggiramenti che il cancello deve fermare, e controlla che si fermi (exit 1);
// sull'albero intatto deve passare (exit 0). Una mutazione che non trova più il
// suo testo è un errore della prova, non un successo: il sorgente è cambiato e
// la prova va aggiornata.
//
// Uso: node scripts/check-etichette-ai.prova.mjs   (non sta nel prebuild)
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CANCELLO = join(process.cwd(), "scripts/check-etichette-ai.mjs");
const HERO_TAG = '<AiTag testo={heroAi.estesa} aria={heroAi.aria} className="shrink-0" />';

const MUTAZIONI = [
  {
    nome: "hero della scheda senza le sue due etichette (la legenda del riepilogo resta nel file)",
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    applica: (s) => conta(s, HERO_TAG, 2) && s.replaceAll(HERO_TAG, "<span />"),
  },
  {
    nome: "miniature compatte della galleria senza etichetta (l'altro ramo la tiene)",
    file: "src/components/PhotoGallery.tsx",
    applica: (s) => conta(s, "{tag(p, true)}", 2) && s.replace("{tag(p, true)}", ""),
  },
  {
    nome: "una seconda foto nel riquadro della card, accanto a quella etichettata",
    file: "src/components/PropertyCard.tsx",
    applica: (s) =>
      conta(s, '<span className="card-sheen" aria-hidden />', 1) &&
      s.replace(
        '<span className="card-sheen" aria-hidden />',
        '<span className="card-sheen" aria-hidden />\n          <PhotoImg src={view.cover?.url ?? ""} alt="" className="object-cover" />',
      ),
  },
  {
    nome: "componente nuovo: foto in un riquadro, etichetta in un altro",
    file: "src/components/NuovaVetrina.tsx",
    nuovo: `import AiTag from "@/components/AiTag";
import PhotoImg from "@/components/PhotoImg";
import { photoSrc } from "@/lib/photoSrc";
import type { Photo } from "@/lib/properties";
export default function NuovaVetrina({ p }: { p: Photo }) {
  return (
    <div>
      <div className="relative aspect-video">
        <PhotoImg src={photoSrc(p, 800)} alt={p.alt} />
      </div>
      <div className="relative">
        <AiTag testo="AI" aria="AI" />
      </div>
    </div>
  );
}
`,
  },
  {
    nome: "video dello staging della home senza la sua etichetta",
    file: "src/app/[locale]/page.tsx",
    applica: (s) =>
      conta(s, '<AiTag testo={tAi("tag.ai_aggiunte")} aria={tAi("tag.ai_aggiunte")} />', 1) &&
      s.replace('<AiTag testo={tAi("tag.ai_aggiunte")} aria={tAi("tag.ai_aggiunte")} />', "<span />"),
  },
  {
    nome: "og:image della scheda presa dalla foto senza photoOgSrc",
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    applica: (s) =>
      conta(s, "(property.coverPhoto && photoOgSrc(property.coverPhoto)) ?? property.coverPhoto?.url", 1) &&
      s.replace("(property.coverPhoto && photoOgSrc(property.coverPhoto)) ?? property.coverPhoto?.url", "property.coverPhoto?.url"),
  },
  {
    nome: "foto dentro una stringa HTML (popup di una mappa)",
    file: "src/lib/popupFoto.ts",
    nuovo: `import { photoSrc } from "@/lib/photoSrc";
import type { Photo } from "@/lib/properties";
export const popup = (p: Photo) => \`<div class="pop"><img src="\${photoSrc(p, 600)}" alt=""></div>\`;
`,
  },
  {
    nome: "un video nuovo al posto di uno esente, con la stessa riga di codice",
    file: "src/app/[locale]/page.tsx",
    applica: (s) => conta(s, 'src="/video/hero.mp4"', 1) && s.replace('src="/video/hero.mp4"', 'src="/video/nuovo-ai.mp4"'),
  },
  {
    nome: "foto come sfondo CSS in un riquadro senza etichetta",
    file: "src/components/SfondoFoto.tsx",
    nuovo: `import { photoSrc } from "@/lib/photoSrc";
import type { Photo } from "@/lib/properties";
export default function SfondoFoto({ p }: { p: Photo }) {
  return (
    <section className="relative">
      <div className="absolute inset-0" style={{ backgroundImage: "url(" + photoSrc(p, 1200) + ")" }} />
    </section>
  );
}
`,
  },
  {
    nome: "vista singola del lightbox AI senza la sua etichetta",
    file: "src/components/Lightbox.tsx",
    applica: (s) => {
      const a = "              <AiTag\n                testo={etichetta.estesa}";
      return conta(s, a, 1) && s.replace(a, "              <NonAiTag\n                testo={etichetta.estesa}");
    },
  },
];

function conta(s, pezzo, atteso) {
  const n = s.split(pezzo).length - 1;
  if (n !== atteso) throw new Error(`la mutazione cerca ${atteso}× «${pezzo.slice(0, 60)}…», ne trova ${n}`);
  return true;
}

function esegui(radice) {
  const r = spawnSync(process.execPath, [CANCELLO, radice], { encoding: "utf8", cwd: process.cwd() });
  return { codice: r.status, uscita: (r.stdout + r.stderr).trim() };
}

const base = mkdtempSync(join(tmpdir(), "prova-etichette-"));
let falliti = 0;
try {
  const intatto = join(base, "intatto");
  cpSync("src", join(intatto, "src"), { recursive: true });
  const r0 = esegui(intatto);
  console.log(`${r0.codice === 0 ? "✓" : "✖"} albero intatto: exit ${r0.codice} (atteso 0)`);
  if (r0.codice !== 0) {
    falliti++;
    console.log("    " + r0.uscita.replace(/\n/g, "\n    "));
  }
  MUTAZIONI.forEach((m, i) => {
    const dir = join(base, `m${i + 1}`);
    cpSync("src", join(dir, "src"), { recursive: true });
    const dest = join(dir, m.file);
    try {
      if (m.nuovo) writeFileSync(dest, m.nuovo);
      else {
        const prima = readFileSync(dest, "utf8");
        writeFileSync(dest, m.applica(prima));
      }
    } catch (e) {
      falliti++;
      console.log(`✖ ${i + 1}. ${m.nome}: PROVA DA AGGIORNARE — ${e.message}`);
      return;
    }
    const r = esegui(dir);
    const ok = r.codice === 1;
    if (!ok) falliti++;
    const motivo = r.uscita.split("\n").find((l) => l.startsWith("  · ")) ?? r.uscita.split("\n")[0];
    console.log(`${ok ? "✓" : "✖"} ${i + 1}. ${m.nome}: exit ${r.codice} (atteso 1)\n    ${motivo.trim()}`);
  });
} finally {
  rmSync(base, { recursive: true, force: true });
}
if (falliti) {
  console.error(`✖ ${falliti} prove non come attese`);
  process.exit(1);
}
console.log(`✓ il cancello passa sull'albero intatto e ferma ${MUTAZIONI.length} aggiramenti su ${MUTAZIONI.length}`);
