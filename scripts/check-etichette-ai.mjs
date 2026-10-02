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
// ETICHETTA = un <AiTag> o un <EtichettaVideo>, o la chiamata a una funzione
// dello stesso file che restituisce un <AiTag> (es. `tag(p, true)` in
// PhotoGallery). Appartiene al riquadro-di-un-punto più vicino fra i suoi
// antenati.
//   1. ogni punto ha un riquadro;
//   2. in ogni riquadro, le etichette sono ALMENO quanti i punti: un'immagine
//      nuova messa accanto a una già etichettata non passa;
//   2b. i VIDEO (<video>, <AutoVideo>, <iframe>) si etichettano col registro dei
//      video del CRM (SPEC §10): nel loro riquadro ci vogliono almeno tanti
//      <EtichettaVideo> quanti video. Un <AiTag> scritto a mano su un video
//      non basta più (01/10 sera): non sa che cosa dice il registro;
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
// ── SPEC v1.3 §11 (02/10/2026): «bello, ma spesso troppo» ──────────────────
// L'etichetta va dove l'AI ha cambiato la SOSTANZA, non lo STILE; la home non
// porta pillole; il riepilogo è corto. Il cancello lo controlla così:
//   5. HOME (`HOME`: la home e, dal 02/10, le pagine di marchio /vendi e
//      /contatti, coi loro video d'atmosfera): nessun <AiTag>, <EtichettaVideo>
//      o componente che si etichetta da sé; ogni punto ha invece un
//      <SegnoAiDiscreto> nel suo riquadro; ogni `buildPropertyView(` passa
//      `{ superficie: "home" }`; e nessun componente importato disegna una
//      pillola, salvo quelli in HOME_SICURI col perché (es. PropertyCard: la
//      sua pillola dipende da `coverAi`, che con `superficie: "home"` è sempre
//      null — regola 7);
//   6. ogni `etichettaAi(` fuori da lib/fotoAi.ts sta nel ramo VERO di una
//      condizione che passa da `haEtichetta(` (la regola stile/sostanza: una
//      condizione rovesciata, `!haEtichetta(x) ? etichettaAi(x) : …`, non
//      vale), e nessuna didascalia di foto si legge con
//      `testoIn(…didascalia…)` saltando `didascaliaFoto()`;
//   7. la REGOLA STESSA si esegue: lib/fotoAi.ts e lib/photoSrc.ts, compilati al
//      volo, devono dire che `ai_luce` e `tecnico` non hanno etichetta, né
//      didascalia, né og:image con la sigla; che `ai` generica e le sostanze
//      sì; il segno discreto solo sulle simulazioni; la riga del riepilogo
//      dai conteggi;
//   8. il riepilogo `#foto-ai`: fuori dal <details> solo titolo, la riga e la
//      chiusura (h2, p, span), niente tessere né liste, nessun testo scritto
//      lì e nessun'altra espressione che `rigaAi`, `tAi("summaryTitle")` e
//      `tAi("summaryClosing")` (una nota rimessa fuori come `<p>{notaAi.testo}</p>`
//      non passa); il <details> c'è ed è chiuso di default (niente `open`).
//
// Uso: node scripts/check-etichette-ai.mjs [radice]   (prebuild: radice = .)
// Prova che sa dire di no: node scripts/check-etichette-ai.prova.mjs
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
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
    "etichetta dal registro dei video del CRM (riga `fv:<mp4>`, SPEC §10) o, senza riga, da content/annunciVideo.ts (`ai: true`); visibile sul video per tutta la durata",
  ],
]);

// I punti che restano senza etichetta, uno per uno: `ancora` è un pezzo del
// sorgente dell'elemento che lo identifica in quel file (deve trovarne UNO).
const ESENZIONI = [
  {
    file: "src/components/Lightbox.tsx",
    ancora: "key={photos[i].url}",
    motivo:
      "vista singola del lightbox senza niente da mostrare: il ramo si sceglie solo se nessuna foto della serie ha un'etichetta (haEtichetta: sostanza, SPEC §11.1) né un originale; altrimenti la vista è VistaConAi, etichettata. Le foto di sola luce e le `tecnico` stanno qui per scelta: non portano etichetta",
  },
  {
    file: "src/components/Lightbox.tsx",
    ancora: "src={originale.m}",
    motivo:
      "l'ORIGINALE (foto prima dell'AI) nella stessa cornice della pubblicata: l'etichetta della cornice passa a «Originale» (variante) quando è visibile",
  },
  // Dal 01/10 sera i video della home, di /vendi, di /contatti e gli YouTube
  // della scheda NON sono più esenti: portano <EtichettaVideo> dal registro dei
  // video del CRM (SPEC §10). Le vecchie esenzioni dicevano «ripresa da drone
  // vera» per /video/hero.mp4 e «DA VERIFICARE» per gli altri due: il
  // censimento dei video del 01/10 li ha registrati tutti e tre `ai_animato`.
  {
    file: "src/app/[locale]/annuncio/[slug]/page.tsx",
    ancora: "<TourFrame",
    motivo: "tour 3D Matterport: scansione dell'immobile, nessun modello generativo",
  },
];

// La home (SPEC §11.1): nessuna pillola, solo il segno discreto. Con lei le
// pagine di marchio, che hanno solo video d'atmosfera (review del 02/10).
const HOME = new Set([
  "src/app/[locale]/page.tsx",
  "src/app/[locale]/vendi/page.tsx",
  "src/app/[locale]/contatti/page.tsx",
]);
// I componenti che la home può usare anche se nel loro sorgente c'è una pillola:
// uno per uno, col perché.
const HOME_SICURI = new Map([
  [
    "PropertyCard",
    "la pillola della card dipende da `view.coverAi`, che buildPropertyView con `superficie: \"home\"` lascia null (regole 5 e 7)",
  ],
]);
// Dove si decidono le regole (non si controllano qui le loro definizioni).
const FILE_REGOLE = new Set(["src/lib/fotoAi.ts", "src/lib/videoAi.ts"]);

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
const TAG_ETICHETTA = new Set(["AiTag", "EtichettaVideo"]);
const TAG_SEGNO_HOME = "SegnoAiDiscreto";
const TAG_VIDEO = new Set(["video", "AutoVideo", "iframe"]);
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

/**
 * C'è, fra gli antenati di `n` (fino al corpo della funzione), una condizione
 * che passa da haEtichetta e di cui `n` sta nel ramo VERO? Una condizione che
 * nomina haEtichetta solo negata (`!haEtichetta(x) ? etichettaAi(x) : …`) non
 * vale: è la regola rovesciata (review del 02/10).
 */
function sottoHaEtichetta(n, sf) {
  const passa = (x) => {
    if (!x) return false;
    const t = x.getText(sf);
    // almeno un haEtichetta( NON preceduto da «!»
    return [...t.matchAll(/(!\s*)?\bhaEtichetta\(/g)].some((m) => !m[1]);
  };
  for (let p = n.parent, figlio = n; p; figlio = p, p = p.parent) {
    if (ts.isConditionalExpression(p) && figlio === p.whenTrue && passa(p.condition)) return true;
    if (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && figlio === p.right && passa(p.left))
      return true;
    if (ts.isIfStatement(p) && figlio === p.thenStatement && passa(p.expression)) return true;
    // una guardia all'inizio della funzione: `if (!haEtichetta(x)) return …;` prima della chiamata
    if (ts.isBlock(p))
      for (const st of p.statements) {
        if (st.pos >= n.pos) break;
        if (!ts.isIfStatement(st) || !/^!\s*haEtichetta\(/.test(st.expression.getText(sf).trim())) continue;
        const allora = ts.isBlock(st.thenStatement) ? st.thenStatement.statements[0] : st.thenStatement;
        if (allora && ts.isReturnStatement(allora)) return true;
      }
    if (ts.isSourceFile(p)) break;
  }
  return false;
}

/** I moduli locali importati da un file (`@/…` o relativi), risolti su disco. */
function importati(sf, rel) {
  const out = new Map(); // nome locale → percorso del file
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause) continue;
    const da = st.moduleSpecifier.text;
    let base = null;
    if (da.startsWith("@/")) base = join(SRC, da.slice(2));
    else if (da.startsWith(".")) base = join(RADICE, rel, "..", da);
    if (!base) continue;
    const trovato = [".tsx", ".ts", "/index.tsx", "/index.ts"].map((e) => base + e).find((f) => existsSync(f));
    if (!trovato) continue;
    const c = st.importClause;
    if (c.name) out.set(c.name.text, trovato);
    if (c.namedBindings && ts.isNamedImports(c.namedBindings))
      for (const el of c.namedBindings.elements) out.set(el.name.text, trovato);
  }
  return out;
}

const PILLOLA_NEL_SORGENTE = /<(?:AiTag|EtichettaVideo|SfondoVideo)\b/;
/** Il componente (o uno dei suoi import locali) disegna una pillola? Restituisce la catena, o null. */
function disegnaPillola(percorso, visti = new Set()) {
  if (visti.has(percorso)) return null;
  visti.add(percorso);
  const testo = readFileSync(percorso, "utf8");
  const r = relative(RADICE, percorso).split("\\").join("/");
  if (PILLOLA_NEL_SORGENTE.test(testo)) return [r];
  const sf = ts.createSourceFile(percorso, testo, ts.ScriptTarget.Latest, true, percorso.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  for (const dest of new Set(importati(sf, r).values())) {
    const sotto = disegnaPillola(dest, visti);
    if (sotto) return [r, ...sotto];
  }
  return null;
}

// ---- Controllo ----------------------------------------------------------------

const errori = [];
const esenzioniUsate = new Map(ESENZIONI.map((e) => [e, 0]));
const riepilogo = { punti: 0, etichettati: 0, autoetichettati: 0, esenti: 0, file: 0, video: 0 };

for (const p of file(SRC)) {
  const rel = relative(RADICE, p).split("\\").join("/");
  if (FILE_SENZA_FOTO.has(rel)) continue;
  const testo = readFileSync(p, "utf8");
  const sf = ts.createSourceFile(p, testo, ts.ScriptTarget.Latest, true, p.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const strumento = STRUMENTI.has(rel);
  const etich = etichettatori(sf);
  const inHome = HOME.has(rel);

  // 6. la regola stile/sostanza non si salta
  if (!FILE_REGOLE.has(rel))
    visita(sf, (n) => {
      if (!ts.isCallExpression(n) || !ts.isIdentifier(n.expression)) return;
      const nome = n.expression.text;
      if (nome === "etichettaAi" && !sottoHaEtichetta(n, sf))
        errori.push(
          `${rel}:${riga(sf, n)}: etichettaAi() senza una condizione che passi da haEtichetta(): così una foto di sola luce (\`ai_luce\`) o \`tecnico\` riavrebbe l'etichetta (SPEC §11.1)`,
        );
      if (nome === "testoIn" && n.arguments[0] && /didascalia/.test(n.arguments[0].getText(sf)))
        errori.push(
          `${rel}:${riga(sf, n)}: didascalia di una foto letta con testoIn(): passa da didascaliaFoto() di lib/fotoAi.ts, che non la mostra sullo stile (SPEC §11.1)`,
        );
    });

  // 8. il riepilogo #foto-ai: corto, il resto nel <details> chiuso
  visita(sf, (n) => {
    if (!eJsxElemento(n)) return;
    const id = attributo(n, "id");
    if (!id?.initializer || !/^["'{`]*foto-ai["'}`]*$/.test(id.initializer.getText(sf))) return;
    let dettagli = 0;
    const fuori = new Set();
    const ESPRESSIONI_AMMESSE = /tAi\(\s*["']summary(?:Title|Closing)["']\s*\)|\brigaAi\b/g;
    const giro = (x, dentroDettagli) => {
      if (!dentroDettagli && ts.isJsxExpression(x) && x.expression) {
        const resto = x.expression.getText(sf).replace(ESPRESSIONI_AMMESSE, "");
        if (/[\p{L}\d_$]/u.test(resto.replace(/<\/?>/g, "")))
          fuori.add(`{${x.expression.getText(sf).slice(0, 50)}} (riga ${riga(sf, x)})`);
      }
      if (!dentroDettagli && ts.isJsxText(x) && x.getText(sf).trim())
        fuori.add(`il testo «${x.getText(sf).trim().slice(0, 40)}» (riga ${riga(sf, x)})`);
      if (eJsxElemento(x) && x !== n) {
        const tag = nomeTag(apertura(x));
        if (tag === "details") {
          dettagli++;
          if (attributo(x, "open"))
            errori.push(`${rel}:${riga(sf, x)}: il <details> del riepilogo #foto-ai è aperto di default (\`open\`): deve partire chiuso (SPEC §11.2)`);
          dentroDettagli = true;
        } else if (!dentroDettagli && !["h2", "p", "span"].includes(tag)) fuori.add(`<${tag}> (riga ${riga(sf, x)})`);
      }
      ts.forEachChild(x, (c) => giro(c, dentroDettagli));
    };
    giro(n, false);
    if (!dettagli)
      errori.push(`${rel}:${riga(sf, n)}: il riepilogo #foto-ai non ha il <details> «Leggi come le abbiamo ritoccate» (SPEC §11.2)`);
    if (fuori.size)
      errori.push(
        `${rel}:${riga(sf, n)}: nella parte visibile del riepilogo #foto-ai solo titolo, riga e chiusura (h2, p, span con rigaAi, summaryTitle, summaryClosing): fuori dal <details> ci sono ${[...fuori].join(", ")} (SPEC §11.2)`,
      );
  });

  // 5. la home: nessuna pillola
  if (inHome) {
    visita(sf, (n) => {
      if (eJsxElemento(n)) {
        const tag = nomeTag(apertura(n));
        if (TAG_ETICHETTA.has(tag) || AUTOETICHETTATI.has(tag))
          errori.push(`${rel}:${riga(sf, n)}: <${tag}> nella home (o in una pagina di marchio): lì nessuna pillola AI, solo <${TAG_SEGNO_HOME}> (SPEC §11.1)`);
      }
      if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "buildPropertyView") {
        const opz = n.arguments[4]?.getText(sf) ?? "";
        if (!/superficie\s*:\s*["']home["']/.test(opz))
          errori.push(
            `${rel}:${riga(sf, n)}: buildPropertyView() nella home senza \`{ superficie: "home" }\`: la card disegnerebbe la pillola AI (SPEC §11.1)`,
          );
      }
    });
    const imp = importati(sf, rel);
    const usati = new Set();
    visita(sf, (n) => {
      if (eJsxElemento(n)) usati.add(nomeTag(apertura(n)));
    });
    for (const nome of usati) {
      const dove = imp.get(nome);
      if (!dove || HOME_SICURI.has(nome)) continue;
      const catena = disegnaPillola(dove);
      if (catena)
        errori.push(
          `${rel}: <${nome}> nella home disegna una pillola AI (${catena.join(" → ")}): in home solo il segno discreto (SPEC §11.1), o una voce in HOME_SICURI col perché`,
        );
    }
  }

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
  const etichetteVideoPer = new Map([...riquadri].map((r) => [r, 0]));
  visita(sf, (n) => {
    const eVideo = eJsxElemento(n) && nomeTag(apertura(n)) === "EtichettaVideo";
    // In home l'etichetta di un punto è il segno discreto (regola 5); altrove la pillola.
    const eEtichetta = inHome
      ? eJsxElemento(n) && nomeTag(apertura(n)) === TAG_SEGNO_HOME
      : (eJsxElemento(n) && TAG_ETICHETTA.has(nomeTag(apertura(n)))) ||
        (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && etich.has(n.expression.text));
    if (!eEtichetta) return;
    for (let p = n.parent; p; p = p.parent)
      if (riquadri.has(p)) {
        etichettePer.set(p, etichettePer.get(p) + 1);
        if (eVideo) etichetteVideoPer.set(p, etichetteVideoPer.get(p) + 1);
        break;
      }
  });
  // 2b. i video vogliono l'etichetta del registro (in home: il segno discreto, regola 5)
  for (const r of inHome ? [] : riquadri) {
    const video = daContare.filter((x) => x.riquadro === r && TAG_VIDEO.has(x.tag));
    if (!video.length) continue;
    riepilogo.video += video.length;
    if (etichetteVideoPer.get(r) < video.length)
      for (const x of video)
        errori.push(
          `${x.dove}: video senza <EtichettaVideo> nel suo riquadro (riga ${riga(sf, r)}): l'etichetta di un video viene dal registro dei video del CRM (SPEC §10)`,
        );
  }
  for (const r of riquadri) {
    const qui = daContare.filter((x) => x.riquadro === r);
    const n = etichettePer.get(r);
    if (n === 0) {
      for (const x of qui)
        errori.push(
          inHome
            ? `${x.dove}: nella home (o in una pagina di marchio) nessun <${TAG_SEGNO_HOME}> nel suo riquadro (riga ${riga(sf, r)}): ogni immagine o video della home porta il segno discreto, che resta vuoto se non serve (SPEC §11.1)`
            : `${x.dove}: nessuna etichetta AI (AiTag) nel suo riquadro (riga ${riga(sf, r)})`,
        );
    } else if (n < qui.length) {
      errori.push(
        `${rel}:${riga(sf, r)}: ${qui.length} immagini nello stesso riquadro e ${n} etichette (${qui.map((x) => x.dove.split(" ")[0]).join(", ")})`,
      );
    } else riepilogo.etichettati += qui.length;
  }
}

// 7. la regola stile/sostanza ESEGUITA: si compilano al volo lib/fotoAi.ts e
// lib/photoSrc.ts (solo i tipi tolti, nessun bundler) e si interrogano.
async function provaRegola() {
  const dir = mkdtempSync(join(tmpdir(), "regola-ai-"));
  try {
    const compila = (da, a, sostituisci = (x) => x) => {
      const sorgente = readFileSync(join(SRC, da), "utf8");
      const js = ts.transpileModule(sorgente, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText;
      writeFileSync(join(dir, a), sostituisci(js));
    };
    compila("lib/fotoAi.ts", "fotoAi.mjs");
    compila("lib/photoSrc.ts", "photoSrc.mjs", (js) => js.replace(/(["'])@\/lib\/fotoAi\1/g, '"./fotoAi.mjs"'));
    const f = await import(pathToFileURL(join(dir, "fotoAi.mjs")).href);
    const ps = await import(pathToFileURL(join(dir, "photoSrc.mjs")).href);
    const foto = (trattamento, extra = {}) => ({
      trattamento,
      iptc: f.IPTC_PER_TRATTAMENTO[trattamento],
      origine: "crm",
      didascalia: { it: "didascalia di prova", en: null, de: null, sl: null },
      originale: null,
      bloccoDifetti: false,
      ...extra,
    });
    const casi = [];
    const atteso = (cosa, ottenuto, voluto) => {
      if (JSON.stringify(ottenuto) !== JSON.stringify(voluto))
        casi.push(`${cosa}: ${JSON.stringify(ottenuto)} invece di ${JSON.stringify(voluto)}`);
    };
    const ETICHETTA = { tecnico: false, ai_luce: false, ai: true, ai_pulizia: true, ai_aggiunte: true, ai_rendering: true, rendering: true };
    // L'og:image: la sigla STAMPATA (og-ai / og-gen) solo dove la pagina mette
    // l'etichetta e la foto è passata da un modello; la sola luce ha la
    // marcatura senza sigla (og-ail), il ritocco tecnico og-enh, una foto senza
    // dati og.jpg — mai la url firmata di Airtable quando c'è l'id.
    const OG = {
      tecnico: "og-enh.jpg",
      ai_luce: "og-ail.jpg",
      ai: "og-ai.jpg",
      ai_pulizia: "og-ai.jpg",
      ai_aggiunte: "og-ai.jpg",
      ai_rendering: "og-gen.jpg",
      rendering: "og-genl.jpg",
    };
    const ogDi = (ai) =>
      ps.photoOgSrc({ id: "attPROVAprova1234", url: "u", thumb: "t", filename: "x.jpg", alt: "", ai })?.split("/").pop() ?? null;
    for (const [t, v] of Object.entries(ETICHETTA)) {
      atteso(`haEtichetta(${t})`, f.haEtichetta(foto(t)), v);
      atteso(`didascaliaFoto(${t}) mostrata`, f.didascaliaFoto(foto(t), "it") !== null, v);
      atteso(`photoOgSrc(${t})`, ogDi(foto(t)), OG[t]);
    }
    atteso("photoOgSrc(senza dati AI)", ogDi(null), "og.jpg");
    atteso("haEtichetta(sigla del sito)", f.haEtichetta(foto("ai", { origine: "generica", didascalia: null })), true);
    // La sola sigla «AI» senza didascalia: nessuna frase di servizio sotto la foto (02/10).
    atteso("didascaliaFoto(ai senza didascalia)", f.didascaliaFoto(foto("ai", { didascalia: null }), "it"), null);
    const SEGNO = { ai: null, ai_luce: null, ai_pulizia: null, tecnico: null, ai_aggiunte: "simulazione", ai_rendering: "simulazione", rendering: "rendering" };
    for (const [t, v] of Object.entries(SEGNO)) atteso(`segnoHome(${t})`, f.segnoHome(foto(t)), v);
    const serie = (spec) =>
      spec.flatMap(([t, n], k) =>
        Array.from({ length: n }, (_, i) => ({ id: `a${k}-${i}`, url: `u${k}-${i}`, filename: `f${k}-${i}.jpg`, ai: t ? foto(t) : null })),
      );
    const righe = (spec) => f.rigaRiepilogo(f.contaFotoAi(serie(spec)));
    const riga = (spec) => righe(spec).map((x) => x.chiave);
    atteso("riga: tutte solo luce", riga([["ai_luce", 39]]), ["summaryLineLightAll"]);
    atteso("riga: alcune solo luce", riga([["ai_luce", 5], [null, 3]]), ["summaryLineLight"]);
    atteso("riga: sostanza e luce (Villa Ronchi)", righe([["ai_luce", 5], ["ai_pulizia", 35]]), [
      { chiave: "summaryLineChanged", valori: { count: 35 } },
      { chiave: "summaryLineLightMore", valori: { count: 5 } },
    ]);
    // La sigla «AI» in ricontrollo NON è «modificata, indicata sulla foto»:
    // gruppo a sé, anche quando accanto ci sono sostanza e luce (review del 02/10).
    atteso("riga: simulazione + in verifica (Scodovacca)", righe([["ai", 39], ["ai_aggiunte", 1]]), [
      { chiave: "summaryLineSimOnly", valori: { count: 1 } },
      { chiave: "summaryLineCheckingMore", valori: { count: 39 } },
    ]);
    atteso("riga: in verifica e luce, a metà classificazione", righe([["ai_luce", 20], ["ai", 20]]), [
      { chiave: "summaryLineChecking", valori: { count: 20 } },
      { chiave: "summaryLineLightMore", valori: { count: 20 } },
    ]);
    atteso("riga: tutte in verifica", riga([["ai", 43]]), ["summaryLineCheckingAll"]);
    atteso("riga: sigla del sito = in verifica", riga([["ai_pulizia", 3]]).concat(
      f.rigaRiepilogo(f.contaFotoAi([{ id: "g", url: "g", filename: "g.jpg", ai: foto("ai", { origine: "generica", didascalia: null }) }])).map((x) => x.chiave),
    ), ["summaryLineChanged", "summaryLineCheckingAll"]);
    atteso("riga: simulazioni dentro le modificate", righe([["ai_pulizia", 12], ["ai_aggiunte", 2]])[0], {
      chiave: "summaryLineChangedSim",
      valori: { count: 14, sim: 2 },
    });
    const c = f.contaFotoAi(serie([["ai_luce", 5], ["ai_pulizia", 35], ["tecnico", 2], ["ai", 3]]));
    atteso("conteggi", [c.pubblicate, c.luce, c.modificate, c.inVerifica, c.segnalate, c.etichettate], [45, 5, 35, 3, 38, 38]);
    for (const x of casi) errori.push(`regola stile/sostanza (lib/fotoAi.ts, lib/photoSrc.ts): ${x} (SPEC §11)`);
  } catch (e) {
    errori.push(`regola stile/sostanza: non si riesce a eseguirla (${e instanceof Error ? e.message : e}) — il cancello deve poterla provare`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
await provaRegola();

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
  `✓ check-etichette-ai: ${riepilogo.punti} punti con immagini in ${riepilogo.file} file — ${riepilogo.etichettati} con l'etichetta nel riquadro (${riepilogo.video} video col registro; in home il segno discreto), ${riepilogo.autoetichettati} che si etichettano da sé, ${riepilogo.esenti} esenti col motivo; regola stile/sostanza eseguita e verde (SPEC §11)`,
);
