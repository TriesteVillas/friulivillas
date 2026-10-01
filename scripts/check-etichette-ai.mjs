// Cancello del prebuild: ogni PUNTO in cui il sito mostra un'immagine o un video
// d'immobile ha la sua etichetta AI accanto, o un'esenzione scritta qui col
// perché (SPEC trasparenza 01/10/2026 §0: «mai una foto modificata con AI
// generativa senza etichetta visibile»).
//
// ── PERCHÉ PER PUNTO E NON PER FILE (review del 01/10 sera) ─────────────────
// La prima versione guardava il FILE: se un file mostrava una foto e citava
// `AiTag` da qualche parte, passava. Aggirata su una copia: tolte l'etichetta
// dell'hero della scheda e quella delle miniature compatte della galleria,
// restava verde, perché in quei file c'erano ALTRE etichette (la legenda del
// riepilogo, le miniature dell'altro ramo). E non vedeva video, poster e
// og:image. Questa versione legge il sorgente come albero (compilatore
// TypeScript, nessuna regex sul JSX) e ragiona punto per punto.
//
// ── LE REGOLE ────────────────────────────────────────────────────────────────
// PUNTO = un elemento JSX che disegna un'immagine o un video: <PhotoImg>, <img>,
// <Image>, <video>, <AutoVideo>, <TourFrame>, <iframe>, <picture>, <source>,
// <SfondoVideo>, o
// qualunque elemento con `backgroundImage` nello stile.
// RIQUADRO del punto = il primo antenato JSX posizionato (classe `relative`,
// `absolute`, `fixed` o `sticky`): è il box rispetto a cui l'etichetta, in
// alto a destra, si posiziona sulla foto.
// ETICHETTA = un <AiTag>, o la chiamata a una funzione dello stesso file che
// restituisce un <AiTag> (es. `tag(p, true)` in PhotoGallery). Appartiene al
// riquadro-di-un-punto più vicino fra i suoi antenati.
//   1. ogni punto ha un riquadro;
//   2. in ogni riquadro, le etichette sono ALMENO quanti i punti: un'immagine
//      nuova messa accanto a una già etichettata non passa;
//   3. i punti che non vogliono etichetta stanno in ESENZIONI (file + un pezzo
//      del sorgente del punto + motivo). Un'esenzione che non trova più il suo
//      punto è un errore: chi rimettesse lì un'immagine passerebbe senza
//      controllo;
//   4. superfici fuori dal JSX: un `<img` o un `url(${…})` dentro una stringa
//      (popup HTML, mail, stili) è un errore fuori da FILE_SENZA_FOTO; un
//      og:image costruito da una foto deve passare da `photoOgSrc` (che stampa
//      la sigla «AI» sull'anteprima social).
// Non prova che l'etichetta dica il vero: prova che chi mostra un'immagine ci
// abbia PENSATO, lì. Non si spegne per «sbloccare» la build: si mette
// l'etichetta, o si scrive l'esenzione col motivo vero.
//
// Uso: node scripts/check-etichette-ai.mjs [radice]   (prebuild: radice = .)
// Prova che sa dire di no: node scripts/check-etichette-ai.prova.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

const RADICE = process.argv[2] ?? ".";
const SRC = join(RADICE, "src");

// File che non mostrano MAI immagini d'immobile: qui non si cercano punti.
const FILE_SENZA_FOTO = new Map([
  ["src/components/Logo.tsx", "loghi SVG statici da /public"],
  ["src/app/[locale]/gruppo/page.tsx", "loghi dei marchi del gruppo"],
  ["src/lib/brandMail.ts", "il logo nell'HTML delle mail"],
  ["src/components/Planimetrie.tsx", "planimetrie: per la SPEC §5.5 niente etichetta né toggle"],
]);

// Gli strumenti: il loro <img>/<video>/<iframe> lo etichetta CHI LI USA, e ogni
// uso è un punto a sé (SfondoVideo invece si etichetta da solo: vedi sotto).
const STRUMENTI = new Map([
  ["src/components/PhotoImg.tsx", "il <img> del proxy /foto"],
  ["src/components/AutoVideo.tsx", "il <video> generico in loop"],
  ["src/components/TourFrame.tsx", "l'<iframe> del tour 3D"],
  ["src/components/media/SfondoVideo.tsx", "il video di testata: disegna da sé l'etichetta del registro"],
]);

// Componenti che portano DENTRO la propria etichetta: il loro uso è un punto
// già etichettato.
const AUTOETICHETTATI = new Map([
  [
    "SfondoVideo",
    "etichetta AI dal registro content/annunciVideo.ts (`ai: true`), visibile sul video per tutta la durata",
  ],
]);

// I punti che restano senza etichetta, uno per uno: `ancora` è un pezzo del
// sorgente dell'elemento che lo identifica in quel file (deve trovarne UNO).
const ESENZIONI = [
  {
    file: "src/components/Lightbox.tsx",
    ancora: "key={photos[i].url}",
    motivo:
      "vista singola del lightbox SENZA dati AI: il ramo si sceglie solo se nessuna foto della serie ha `ai` (conAi = photos.some(p => p.ai)); con dati AI la vista è VistaConAi, etichettata",
  },
  {
    file: "src/components/Lightbox.tsx",
    ancora: "src={originale.m}",
    motivo:
      "l'ORIGINALE (foto prima dell'AI) nella stessa cornice della pubblicata: l'etichetta della cornice passa a «Originale» (variante) quando è visibile",
  },
  {
    file: "src/app/[locale]/page.tsx",
    ancora: 'src="/video/hero.mp4"',
    motivo: "ripresa da drone vera (la piscina della villa), montata a palindromo con ffmpeg: nessun modello generativo",
  },
  {
    file: "src/app/[locale]/vendi/page.tsx",
    ancora: 'src="/video/soggiorno-terrazza.mp4"',
    motivo:
      "⚠️ DA VERIFICARE: lotto di video del 30/07 copiato da triesteimmobiliare.com, provenienza non registrata (sorgenti 1604×1292: forse foto animate con l'AI). Se lo è, va etichettato come lo staging della home",
  },
  {
    file: "src/app/[locale]/contatti/page.tsx",
    ancora: 'src="/video/angolo-studio.mp4"',
    motivo:
      "⚠️ DA VERIFICARE: stesso lotto del 30/07 di soggiorno-terrazza.mp4, provenienza non registrata",
  },
  {
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    ancora: "youtube-nocookie.com/embed",
    motivo:
      "⚠️ video YouTube dal record (oggi due: Sappada e la 0162, riprese vere con un presentatore — verifica finale del 01/10). L'etichetta per video arriva col registro video_trasparenza del CRM (SPEC §10), non ancora in produzione: fino ad allora un video AI nuovo passerebbe da qui",
  },
  {
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    ancora: "<TourFrame",
    motivo: "tour 3D Matterport: scansione dell'immobile, nessun modello generativo",
  },
];

// ---- Lettura ----------------------------------------------------------------

const TAG_PUNTO = new Set([
  "PhotoImg",
  "img",
  "Image",
  "video",
  "AutoVideo",
  "TourFrame",
  "iframe",
  "picture",
  "source",
  ...AUTOETICHETTATI.keys(),
]);
const TAG_ETICHETTA = new Set(["AiTag"]);
const POSIZIONATO = /(?:^|[\s"'`{(])(?:[\w[\]-]+:)*(?:relative|absolute|fixed|sticky)(?=$|[\s"'`})])/;
const FOTO_NEL_TESTO = /coverPhoto|topPhotos|\bphotos\b|photoSrc\(|\.url\b|\.thumb\b|\bcover\b/;

function file(dir) {
  const out = [];
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) out.push(...file(p));
    else if (/\.(ts|tsx|mts)$/.test(nome) && !/\.d\.ts$/.test(nome)) out.push(p);
  }
  return out;
}

const nomeTag = (el) => {
  const t = el.tagName;
  return ts.isIdentifier(t) ? t.text : t.getText();
};
const apertura = (n) => (ts.isJsxElement(n) ? n.openingElement : n);
const eJsxElemento = (n) => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);

function attributo(el, nome) {
  for (const a of apertura(el).attributes.properties)
    if (ts.isJsxAttribute(a) && a.name.getText() === nome) return a;
  return null;
}

function classi(el) {
  const a = attributo(el, "className");
  return a?.initializer ? a.initializer.getText() : "";
}

function riga(sf, n) {
  return sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
}

/** Il primo antenato JSX posizionato. */
function riquadro(n) {
  for (let p = n.parent; p; p = p.parent) if (ts.isJsxElement(p) && POSIZIONATO.test(classi(p))) return p;
  return null;
}

function visita(n, f) {
  f(n);
  ts.forEachChild(n, (c) => visita(c, f));
}

/** Le funzioni del file che restituiscono un'etichetta (anche tramite un'altra). */
function etichettatori(sf) {
  const corpi = new Map();
  visita(sf, (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer &&
        (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer)))
      corpi.set(n.name.text, n.initializer);
    if (ts.isFunctionDeclaration(n) && n.name) corpi.set(n.name.text, n);
  });
  const nomi = new Set();
  for (let giro = 0; giro < 4; giro++) {
    for (const [nome, corpo] of corpi) {
      if (nomi.has(nome)) continue;
      let si = false;
      visita(corpo, (n) => {
        if (eJsxElemento(n) && TAG_ETICHETTA.has(nomeTag(apertura(n)))) si = true;
        if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && nomi.has(n.expression.text)) si = true;
      });
      if (si) nomi.add(nome);
    }
  }
  return nomi;
}

// ---- Controllo ----------------------------------------------------------------

const errori = [];
const esenzioniUsate = new Map(ESENZIONI.map((e) => [e, 0]));
const riepilogo = { punti: 0, etichettati: 0, autoetichettati: 0, esenti: 0, file: 0 };

for (const p of file(SRC)) {
  const rel = relative(RADICE, p).split("\\").join("/");
  if (FILE_SENZA_FOTO.has(rel)) continue;
  const testo = readFileSync(p, "utf8");
  const sf = ts.createSourceFile(p, testo, ts.ScriptTarget.Latest, true, p.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const strumento = STRUMENTI.has(rel);
  const etich = etichettatori(sf);

  // 4. superfici fuori dal JSX
  visita(sf, (n) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)) {
      const s = n.getText(sf);
      if (/<img\b/i.test(s) || (/url\(\s*\$\{/.test(s) && FOTO_NEL_TESTO.test(s)) || /background-image\s*:[^;]*\$\{/i.test(s))
        errori.push(`${rel}:${riga(sf, n)}: immagine dentro una stringa (HTML o CSS): lì l'etichetta AI non arriva`);
    }
    // og:image da una foto: deve passare da photoOgSrc
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "pageOpenGraph" && n.arguments.length >= 5) {
      const img = n.arguments[4].getText(sf);
      if (FOTO_NEL_TESTO.test(img) && !/\bphotoOgSrc\(/.test(img))
        errori.push(`${rel}:${riga(sf, n)}: og:image da una foto senza photoOgSrc (l'anteprima social uscirebbe senza sigla AI)`);
    }
    if (ts.isPropertyAssignment(n) && n.name.getText(sf) === "images") {
      const img = n.initializer.getText(sf);
      if (FOTO_NEL_TESTO.test(img) && !/\bphotoOgSrc\(/.test(img))
        errori.push(`${rel}:${riga(sf, n)}: \`images\` di un'anteprima da una foto senza photoOgSrc`);
    }
  });
  if (strumento) continue;

  // 1-3. i punti e i loro riquadri
  const punti = [];
  visita(sf, (n) => {
    if (!eJsxElemento(n)) return;
    const el = apertura(n);
    const tag = nomeTag(el);
    const stile = attributo(n, "style");
    const sfondo = stile?.initializer && /backgroundImage/.test(stile.initializer.getText(sf));
    if (!TAG_PUNTO.has(tag) && !sfondo) return;
    punti.push({ nodo: n, tag: sfondo && !TAG_PUNTO.has(tag) ? `${tag}[backgroundImage]` : tag, sorgente: n.getText(sf) });
  });
  if (!punti.length) continue;
  riepilogo.file++;

  const daContare = [];
  for (const pt of punti) {
    riepilogo.punti++;
    const dove = `${rel}:${riga(sf, pt.nodo)} <${pt.tag}>`;
    const esenti = ESENZIONI.filter((e) => e.file === rel && pt.sorgente.includes(e.ancora));
    if (esenti.length) {
      for (const e of esenti) esenzioniUsate.set(e, esenzioniUsate.get(e) + 1);
      riepilogo.esenti++;
      continue;
    }
    if (AUTOETICHETTATI.has(pt.tag)) {
      riepilogo.autoetichettati++;
      continue;
    }
    const r = riquadro(pt.nodo);
    if (!r) {
      errori.push(`${dove}: nessun riquadro posizionato attorno (relative/absolute…): l'etichetta AI non ha dove stare`);
      continue;
    }
    daContare.push({ ...pt, dove, riquadro: r });
  }

  // le etichette, assegnate al riquadro-di-un-punto più vicino
  const riquadri = new Set(daContare.map((x) => x.riquadro));
  const etichettePer = new Map([...riquadri].map((r) => [r, 0]));
  visita(sf, (n) => {
    const eEtichetta =
      (eJsxElemento(n) && TAG_ETICHETTA.has(nomeTag(apertura(n)))) ||
      (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && etich.has(n.expression.text));
    if (!eEtichetta) return;
    for (let p = n.parent; p; p = p.parent)
      if (riquadri.has(p)) {
        etichettePer.set(p, etichettePer.get(p) + 1);
        break;
      }
  });
  for (const r of riquadri) {
    const qui = daContare.filter((x) => x.riquadro === r);
    const n = etichettePer.get(r);
    if (n === 0) {
      for (const x of qui) errori.push(`${x.dove}: nessuna etichetta AI (AiTag) nel suo riquadro (riga ${riga(sf, r)})`);
    } else if (n < qui.length) {
      errori.push(
        `${rel}:${riga(sf, r)}: ${qui.length} immagini nello stesso riquadro e ${n} etichette (${qui.map((x) => x.dove.split(" ")[0]).join(", ")})`,
      );
    } else riepilogo.etichettati += qui.length;
  }
}

for (const [e, n] of esenzioniUsate) {
  if (n === 0) errori.push(`esenzione senza più il suo punto: ${e.file} «${e.ancora}» — toglierla da ESENZIONI`);
  if (n > 1) errori.push(`esenzione ambigua: ${e.file} «${e.ancora}» copre ${n} punti — un'ancora per punto`);
}

if (errori.length) {
  console.error("✖ check-etichette-ai:");
  for (const e of errori) console.error("  · " + e);
  console.error("  Vedi l'intestazione di scripts/check-etichette-ai.mjs.");
  process.exit(1);
}
console.log(
  `✓ check-etichette-ai: ${riepilogo.punti} punti con immagini in ${riepilogo.file} file — ${riepilogo.etichettati} con l'etichetta nel riquadro, ${riepilogo.autoetichettati} che si etichettano da sé, ${riepilogo.esenti} esenti col motivo`,
);
