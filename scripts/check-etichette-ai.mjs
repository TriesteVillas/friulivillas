// Cancello del prebuild: nessuna via nuova per mostrare una foto di un immobile
// senza passare dall'etichetta AI (SPEC trasparenza 01/10/2026 §0: «mai una
// foto modificata con AI generativa senza etichetta visibile»).
//
// Nato dalla review del 01/10: le etichette stanno su copertina, card,
// miniature e lightbox, ma nulla impediva a un componente nuovo di mostrare
// `photoSrc(...)` o un `<PhotoImg>` e lasciare nuda una foto AI. Il controllo è
// testuale, quindi grossolano di proposito: non prova che l'etichetta sia
// giusta, prova che chi mostra una foto ci abbia PENSATO.
//
// Due regole, su ogni .ts/.tsx sotto src/:
//   1. chi mostra una foto d'immobile (usa `<PhotoImg`, `photoSrc(`,
//      `photoSrcSet(` o la copertina della card `view.cover`) deve citare
//      l'etichetta: `AiTag`, `etichettaAi` o `coverAi`;
//   2. chi scrive un `<img` nudo o importa `next/image` deve stare
//      nell'elenco qui sotto, con il perché — è così che una foto passerebbe
//      di lato al proxy e alle etichette.
// Un'eccezione nuova si aggiunge qui, col motivo. Non si spegne per «sbloccare»
// la build.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RADICE = process.argv[2] ?? ".";
const SRC = join(RADICE, "src");

// Regola 1: chi definisce gli strumenti, non chi mostra una foto.
const STRUMENTI = new Map([
  ["src/components/PhotoImg.tsx", "è il componente <img> del proxy: l'etichetta la mette chi lo usa"],
  ["src/lib/photoSrc.ts", "costruisce gli URL; la marcatura IPTC sta nell'URL"],
  ["src/app/foto/[att]/[spec]/route.ts", "il proxy: scrive la marcatura IPTC nel file e la sigla sull'og:image"],
]);
// Regola 2: <img> e next/image ammessi.
const IMG_AMMESSI = new Map([
  ["src/components/PhotoImg.tsx", "il <img> del proxy /foto"],
  ["src/components/Logo.tsx", "loghi SVG statici da /public, non foto d'immobile"],
  ["src/app/[locale]/gruppo/page.tsx", "loghi dei marchi del gruppo, non foto d'immobile"],
  ["src/components/Planimetrie.tsx", "planimetrie: per la SPEC §5.5 niente etichetta"],
  ["src/components/Lightbox.tsx", "l'ORIGINALE dalla vetrina del CRM, con la sua etichetta «Originale»"],
  ["src/lib/brandMail.ts", "il logo nell'HTML delle mail, non foto d'immobile"],
]);

const MOSTRA_FOTO = /<PhotoImg\b|\bphotoSrc\(|\bphotoSrcSet\(|\bview\.cover\b/;
const CITA_ETICHETTA = /\bAiTag\b|\betichettaAi\b|\bcoverAi\b/;
const IMG_NUDO = /<img\b|from\s+["']next\/image["']/;

function file(dir) {
  const out = [];
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) out.push(...file(p));
    else if (/\.(ts|tsx)$/.test(nome)) out.push(p);
  }
  return out;
}

// I commenti non contano: «next/image accoda ?dpl» in un commento non è un uso.
const senzaCommenti = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const errori = [];
let controllati = 0;
for (const p of file(SRC)) {
  const rel = relative(RADICE, p).split("\\").join("/");
  const codice = senzaCommenti(readFileSync(p, "utf8"));
  if (MOSTRA_FOTO.test(codice) && !STRUMENTI.has(rel)) {
    controllati++;
    if (!CITA_ETICHETTA.test(codice))
      errori.push(`${rel}: mostra una foto d'immobile ma non cita l'etichetta AI (AiTag / etichettaAi / coverAi)`);
  }
  if (IMG_NUDO.test(codice) && !IMG_AMMESSI.has(rel))
    errori.push(`${rel}: <img> nudo o next/image fuori dall'elenco: una foto così salta il proxy e l'etichetta AI`);
}

if (errori.length) {
  console.error("✖ check-etichette-ai:");
  for (const e of errori) console.error("  · " + e);
  console.error("  Vedi l'intestazione di scripts/check-etichette-ai.mjs.");
  process.exit(1);
}
console.log(`✓ check-etichette-ai: ${controllati} file mostrano foto e tutti citano l'etichetta AI`);
