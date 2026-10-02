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
const SEGNO_STAGING = '<SegnoAiDiscreto dati={segnoStaging} tono="scuro" />';
const RIGA_RIEPILOGO = '<span>{tAi("summaryClosing")}</span>\n              </p>';
const SEGNO_VENDI = '<SegnoAiDiscreto dati={segnoVideo} tono="scuro" />';
// La cartella di prova in cui sta lavorando una mutazione (per quelle che scrivono un file in più).
let dirCorrente = "";
const dirOf = () => dirCorrente;

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
    nome: "video dello staging della home senza il suo segno discreto",
    file: "src/app/[locale]/page.tsx",
    applica: (s) => conta(s, SEGNO_STAGING, 1) && s.replace(SEGNO_STAGING, "<span />"),
  },
  {
    nome: "§11.1 · pillola rimessa sul video della home (EtichettaVideo al posto del segno discreto)",
    file: "src/app/[locale]/page.tsx",
    applica: (s) => conta(s, SEGNO_STAGING, 1) && s.replace(SEGNO_STAGING, "<EtichettaVideo dati={null} />"),
  },
  {
    nome: "§11.1 · pillola AiTag accanto al segno discreto della home",
    file: "src/app/[locale]/page.tsx",
    applica: (s) => conta(s, SEGNO_STAGING, 1) && s.replace(SEGNO_STAGING, SEGNO_STAGING + '\n            <AiTag testo="AI" aria="AI" />'),
  },
  {
    nome: "§11.1 · card della home costruite senza `superficie: \"home\"` (tornerebbe la sigla sulla copertina)",
    file: "src/app/[locale]/page.tsx",
    applica: (s) =>
      conta(s, ', { superficie: "home" })', 1) && s.replace(', { superficie: "home" })', ")"),
  },
  {
    nome: "§11.1 · componente nuovo in home che disegna una pillola (reel con AiTag)",
    file: "src/app/[locale]/page.tsx",
    applica: (s) => {
      writeFileSync(
        join(dirOf(s), "src/components/ReelNuovo.tsx"),
        `import AiTag from "./AiTag";\nexport default function ReelNuovo() {\n  return <AiTag testo="AI" aria="AI" />;\n}\n`,
      );
      return (
        conta(s, 'import BuyerCta from "@/components/BuyerCta";', 1) &&
        s
          .replace('import BuyerCta from "@/components/BuyerCta";', 'import BuyerCta from "@/components/BuyerCta";\nimport ReelNuovo from "@/components/ReelNuovo";')
          .replace("<ClosureBanner />", "<ClosureBanner />\n      <ReelNuovo />")
      );
    },
  },
  {
    nome: "§11.1 · il video di testata (SfondoVideo, si etichetta da sé) messo in home",
    file: "src/app/[locale]/page.tsx",
    applica: (s) =>
      conta(s, "<ClosureBanner />", 1) &&
      s.replace("<ClosureBanner />", '<ClosureBanner />\n      <div className="relative"><SfondoVideo video={null as never} locale="it" title="" /></div>'),
  },
  {
    nome: "§11.1 · regola: `ai_luce` torna ad avere l'etichetta (haEtichetta esclude solo `tecnico`)",
    file: "src/lib/fotoAi.ts",
    applica: (s) =>
      conta(s, "return Boolean(ai && !eStile(ai.trattamento));", 1) &&
      s.replace("return Boolean(ai && !eStile(ai.trattamento));", 'return Boolean(ai && ai.trattamento !== "tecnico");'),
  },
  {
    nome: "§11.1 · regola: la didascalia dello stile torna visibile",
    file: "src/lib/fotoAi.ts",
    applica: (s) =>
      conta(s, "  if (!haEtichetta(ai)) return null;\n  return testoIn(ai.didascalia", 1) &&
      s.replace("  if (!haEtichetta(ai)) return null;\n  return testoIn(ai.didascalia", "  if (!ai) return null;\n  return testoIn(ai.didascalia"),
  },
  {
    nome: "§11.1 · og:image con la sigla stampata su una foto di sola luce",
    file: "src/lib/photoSrc.ts",
    applica: (s) =>
      conta(s, "const stampa = haEtichetta(photo.ai) && eAi(photo.ai.trattamento);", 1) &&
      s.replace("const stampa = haEtichetta(photo.ai) && eAi(photo.ai.trattamento);", "const stampa = eAi(photo.ai.trattamento);"),
  },
  {
    nome: "§11.1 · og:image di sola luce tornata alla url firmata (senza la marcatura IPTC)",
    file: "src/lib/photoSrc.ts",
    applica: (s) =>
      conta(s, "  return `/foto/${photo.id}/og-${sigla}l.jpg`;", 1) &&
      s.replace("  return `/foto/${photo.id}/og-${sigla}l.jpg`;", "  return null;"),
  },
  {
    nome: "§11.1 · lightbox: torna la frase di servizio «in preparazione» sotto la sola sigla «AI»",
    file: "src/lib/fotoAi.ts",
    applica: (s) =>
      conta(s, "  if (!haEtichetta(ai)) return null;\n  return testoIn(ai.didascalia, locale);", 1) &&
      s.replace(
        "  if (!haEtichetta(ai)) return null;\n  return testoIn(ai.didascalia, locale);",
        '  if (!haEtichetta(ai)) return null;\n  return testoIn(ai.didascalia, locale) ?? (ai.trattamento === "ai" ? { testo: "in preparazione", lang: locale } : null);',
      ),
  },
  {
    nome: "§11.2 · riga: le foto in ricontrollo contate fra le «modificate, indicate sulla foto»",
    file: "src/lib/fotoAi.ts",
    applica: (s) =>
      conta(s, '        if (ai.trattamento === "ai") c.inVerifica++;\n        else c.modificate++;', 1) &&
      s.replace('        if (ai.trattamento === "ai") c.inVerifica++;\n        else c.modificate++;', "        c.modificate++;"),
  },
  {
    nome: "§11.1 · etichettaAi sotto una condizione rovesciata (!haEtichetta)",
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    applica: (s) =>
      conta(s, "const heroAi = haEtichetta(heroFoto?.ai) ? etichettaAi(", 1) &&
      s.replace("const heroAi = haEtichetta(heroFoto?.ai) ? etichettaAi(", "const heroAi = !haEtichetta(heroFoto?.ai) ? etichettaAi("),
  },
  {
    nome: "§11.1 · regola: il segno discreto della home anche sulle foto di sola luce",
    file: "src/lib/fotoAi.ts",
    applica: (s) =>
      conta(s, '  if (ai.trattamento === "rendering") return "rendering";\n  return null;', 1) &&
      s.replace('  if (ai.trattamento === "rendering") return "rendering";\n  return null;', '  if (ai.trattamento === "rendering") return "rendering";\n  return "simulazione";'),
  },
  {
    nome: "§11.1 · miniature della galleria etichettate senza passare da haEtichetta",
    file: "src/components/PhotoGallery.tsx",
    applica: (s) =>
      conta(s, "    if (!haEtichetta(p.ai)) return null;\n", 1) && s.replace("    if (!haEtichetta(p.ai)) return null;\n", "    if (!p.ai) return null;\n"),
  },
  {
    nome: "§11.1 · didascalia del lightbox letta con testoIn, saltando didascaliaFoto",
    file: "src/components/Lightbox.tsx",
    applica: (s) =>
      conta(s, ": didascaliaFoto(ai, locale);", 1) && s.replace(": didascaliaFoto(ai, locale);", ": testoIn(ai?.didascalia, locale);"),
  },
  {
    nome: "§11.2 · tessere coi numeri grandi rimesse nella parte visibile del riepilogo",
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    applica: (s) =>
      conta(s, RIGA_RIEPILOGO, 1) &&
      s.replace(RIGA_RIEPILOGO, RIGA_RIEPILOGO + '\n              <ul className="grid"><li>40 / 40</li></ul>'),
  },
  {
    nome: "§11.2 · la nota del CRM fuori dal <details>",
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    applica: (s) =>
      conta(s, RIGA_RIEPILOGO, 1) &&
      s.replace(RIGA_RIEPILOGO, RIGA_RIEPILOGO + "\n              {notaAi && <div lang={notaAi.lang}>{notaAi.testo}</div>}"),
  },
  {
    nome: "§11.2 · la nota del CRM fuori dal <details>, dentro un <p> (tag ammesso)",
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    applica: (s) =>
      conta(s, RIGA_RIEPILOGO, 1) && s.replace(RIGA_RIEPILOGO, RIGA_RIEPILOGO + "\n              <p>{notaAi?.testo}</p>"),
  },
  {
    nome: "§11.2 · numeri scritti a mano nella parte visibile («40 / 40» in un <p>)",
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    applica: (s) =>
      conta(s, RIGA_RIEPILOGO, 1) && s.replace(RIGA_RIEPILOGO, RIGA_RIEPILOGO + '\n              <p className="text-2xl">40 / 40</p>'),
  },
  {
    nome: "§11.2 · <details> del riepilogo aperto di default",
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    applica: (s) =>
      conta(s, '<details className="group mt-3', 1) && s.replace('<details className="group mt-3', '<details open className="group mt-3'),
  },
  {
    nome: "§11.2 · riepilogo senza <details> (tutto visibile)",
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    applica: (s) =>
      conta(s, '<details className="group mt-3', 1) &&
      conta(s, "              </details>", 1) &&
      s.replace('<details className="group mt-3', '<div className="group mt-3').replace("              </details>", "              </div>"),
  },
  {
    nome: "YouTube della scheda senza l'etichetta sopra il player",
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    applica: (s) =>
      conta(s, "<EtichettaVideo dati={etichetta} passante />", 1) &&
      s.replace("<EtichettaVideo dati={etichetta} passante />", ""),
  },
  {
    nome: "video di /vendi senza il suo segno discreto",
    file: "src/app/[locale]/vendi/page.tsx",
    applica: (s) => conta(s, SEGNO_VENDI, 1) && s.replace(SEGNO_VENDI, "<span />"),
  },
  {
    nome: "§11.1 · pillola rimessa sul video di /vendi (pagina di marchio, come la home)",
    file: "src/app/[locale]/vendi/page.tsx",
    applica: (s) =>
      conta(s, SEGNO_VENDI, 1) && s.replace(SEGNO_VENDI, SEGNO_VENDI + "\n                  <EtichettaVideo dati={null} />"),
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
    nome: "un secondo video nel riquadro del video della home, accanto a quello col segno",
    file: "src/app/[locale]/page.tsx",
    applica: (s) => {
      const a = '                poster="/video/hero-poster.jpg"\n                ariaLabel={t("hero.videoAlt")}\n                className="h-full w-full object-cover"\n              />';
      return conta(s, a, 1) && s.replace(a, a + '\n              <AutoVideo src="/video/nuovo-ai.mp4" poster="" ariaLabel="" />');
    },
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
    dirCorrente = dir;
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
