// Cancello del prebuild: i dizionari delle lingue devono avere TUTTI le stesse
// chiavi e gli stessi argomenti ICU del master inglese. Nato il 2026-10-01 con
// la quarta lingua (sloveno): next-intl, davanti a una chiave che manca in una
// lingua, non ripiega su un'altra — stampa il percorso della chiave
// («home.hero.title») dentro la pagina. Una stringa aggiunta in tre file su
// quattro diventava quindi un buco visibile solo a chi apre quella lingua.
//
// Le lingue NON sono scritte qui: si leggono da src/i18n/routing.ts, così una
// lingua nuova nel router entra nel controllo senza toccare questo file.
//
// Controlla, per ogni lingua del router:
//   1. che messages/<lingua>.json esista e sia JSON valido;
//   2. stesse chiavi del master (né mancanti né in più) e nessun valore vuoto;
//   3. stessi argomenti ICU ({count}, {value}…) per ogni chiave, e dello
//      STESSO TIPO del master: un `{count, select, …}` dove l'inglese ha
//      `plural` passerebbe il controllo delle forme e sbaglierebbe in silenzio;
//   4. ogni `plural`/`selectordinal`/`select`, in ogni lingua, ha il ramo
//      `other` — senza, intl-messageformat lancia un errore a runtime;
//   5. per lo sloveno: ogni `plural` ha le forme one, two, few e other —
//      lo sloveno ne ha quattro, e «one/other» copiato dall'inglese sbaglia
//      in silenzio con 2, 3 e 4 («2 nepremičnin» invece di «2 nepremičnini»).
// Non si spegne per «sbloccare» la build: si completa il dizionario.
import { existsSync, readFileSync } from "node:fs";

const MASTER = "en";
// Forme plurali CLDR obbligatorie per lingua (solo dove l'inglese non basta).
const PLURALI = { sl: ["one", "two", "few", "other"] };

const routing = readFileSync("src/i18n/routing.ts", "utf8");
const lista = routing.match(/locales:\s*\[([^\]]*)\]/)?.[1];
if (!lista) {
  console.error("✖ check-messages: non trovo `locales: [...]` in src/i18n/routing.ts");
  process.exit(1);
}
const lingue = [...lista.matchAll(/["']([a-z-]+)["']/g)].map((m) => m[1]);

function appiattisci(o, prefisso = "", out = {}) {
  for (const [k, v] of Object.entries(o)) {
    const chiave = prefisso ? `${prefisso}.${k}` : k;
    if (v && typeof v === "object") appiattisci(v, chiave, out);
    else out[chiave] = v;
  }
  return out;
}

// Mini-parser ICU MessageFormat: restituisce gli argomenti usati col loro
// tipo (`plural`, `select`, `number`…, stringa vuota per il semplice {nome}) e,
// per ogni argomento a rami, i selettori. Basta per il confronto fra lingue;
// non valida la sintassi in ogni suo angolo. Limite noto: l'apostrofo ICU
// ('{' per una graffa letterale) non è gestito, e il testo quotato viene letto
// come un argomento — al 2026-10-01 nessun messaggio lo usa (provato: un caso
// costruito apposta passa il controllo; se mai servisse, va gestito qui).
function analizza(testo) {
  const argomenti = new Map(); // nome → tipo
  const plurali = []; // { nome, tipo, selettori: [] }
  const registra = (nome, tipo) => {
    const prima = argomenti.get(nome);
    if (prima !== undefined && prima !== tipo && prima !== "" && tipo !== "")
      throw new Error(`{${nome}} usato sia come ${prima} sia come ${tipo}`);
    if (!prima) argomenti.set(nome, tipo);
  };
  let i = 0;
  const salta = () => {
    while (i < testo.length && /\s/.test(testo[i])) i++;
  };
  function messaggio(dentroRamo) {
    while (i < testo.length) {
      const c = testo[i];
      if (c === "{") {
        i++;
        argomento();
      } else if (c === "}") {
        if (dentroRamo) return;
        throw new Error(`graffa chiusa in più alla posizione ${i}`);
      } else i++;
    }
    if (dentroRamo) throw new Error("ramo non chiuso");
  }
  function argomento() {
    salta();
    let nome = "";
    while (i < testo.length && !/[\s,}]/.test(testo[i])) nome += testo[i++];
    salta();
    if (!nome) throw new Error(`argomento senza nome alla posizione ${i}`);
    if (testo[i] === "}") {
      registra(nome, "");
      i++;
      return;
    }
    if (testo[i] !== ",") throw new Error(`atteso «,» o «}» dopo {${nome}`);
    i++;
    salta();
    let tipo = "";
    while (i < testo.length && /[a-z]/i.test(testo[i])) tipo += testo[i++];
    salta();
    if (!tipo) throw new Error(`{${nome}, …} senza tipo`);
    registra(nome, tipo);
    if (tipo === "plural" || tipo === "selectordinal" || tipo === "select") {
      if (testo[i] !== ",") throw new Error(`atteso «,» dopo ${tipo}`);
      i++;
      const selettori = [];
      for (;;) {
        salta();
        if (testo[i] === "}") {
          i++;
          break;
        }
        let sel = "";
        while (i < testo.length && !/[\s{]/.test(testo[i])) sel += testo[i++];
        if (sel.startsWith("offset:")) continue;
        salta();
        if (testo[i] !== "{") throw new Error(`ramo «${sel}» senza testo`);
        i++;
        selettori.push(sel);
        messaggio(true);
        i++; // la «}» che chiude il ramo
        if (i > testo.length) throw new Error("argomento non chiuso");
      }
      if (!selettori.includes("other")) throw new Error(`{${nome}, ${tipo}} senza il ramo «other»`);
      plurali.push({ nome, tipo, selettori });
      return;
    }
    // number/date/time con eventuale stile: si salta fino alla «}» bilanciata.
    let profondita = 1;
    while (i < testo.length && profondita > 0) {
      if (testo[i] === "{") profondita++;
      else if (testo[i] === "}") profondita--;
      i++;
    }
  }
  messaggio(false);
  return { argomenti, plurali };
}

const errori = [];
const dizionari = {};
for (const l of lingue) {
  const file = `messages/${l}.json`;
  if (!existsSync(file)) {
    errori.push(`${file} non esiste, ma «${l}» è fra le lingue del router`);
    continue;
  }
  try {
    dizionari[l] = appiattisci(JSON.parse(readFileSync(file, "utf8")));
  } catch (e) {
    errori.push(`${file}: JSON non valido (${e.message})`);
  }
}

const master = dizionari[MASTER];
if (!master) {
  errori.push(`manca il master messages/${MASTER}.json`);
} else {
  const argomentiMaster = {};
  for (const [k, v] of Object.entries(master)) {
    try {
      argomentiMaster[k] = analizza(String(v)).argomenti;
    } catch (e) {
      errori.push(`${MASTER}.json → ${k}: ICU illeggibile (${e.message})`);
    }
  }
  for (const [l, diz] of Object.entries(dizionari)) {
    const mancanti = Object.keys(master).filter((k) => !(k in diz));
    const inPiu = Object.keys(diz).filter((k) => !(k in master));
    for (const k of mancanti) errori.push(`${l}.json: manca «${k}»`);
    for (const k of inPiu) errori.push(`${l}.json: chiave «${k}» assente nel master ${MASTER}.json`);
    for (const [k, v] of Object.entries(diz)) {
      if (typeof v !== "string" || v.trim() === "") {
        errori.push(`${l}.json → ${k}: valore vuoto o non testuale`);
        continue;
      }
      if (l === MASTER || !(k in master)) continue;
      let analisi;
      try {
        analisi = analizza(v);
      } catch (e) {
        errori.push(`${l}.json → ${k}: ICU illeggibile (${e.message})`);
        continue;
      }
      const attesi = argomentiMaster[k] ?? new Map();
      const firma = (m) =>
        [...m.entries()]
          .map(([nome, tipo]) => (tipo ? `${nome}, ${tipo}` : nome))
          .sort()
          .join("} {");
      if (firma(attesi) !== firma(analisi.argomenti))
        errori.push(`${l}.json → ${k}: argomenti {${firma(analisi.argomenti)}} invece di {${firma(attesi)}}`);
      const forme = PLURALI[l];
      if (forme)
        for (const p of analisi.plurali.filter((x) => x.tipo === "plural")) {
          const assenti = forme.filter((f) => !p.selettori.includes(f));
          if (assenti.length)
            errori.push(`${l}.json → ${k}: il plurale di {${p.nome}} non ha le forme ${assenti.join(", ")}`);
        }
    }
  }
}

if (errori.length) {
  console.error("✖ check-messages:\n  - " + errori.join("\n  - "));
  process.exit(1);
}
const conteggi = Object.entries(dizionari)
  .map(([l, d]) => `${l} ${Object.keys(d).length}`)
  .join(" · ");
console.log(`✓ check-messages: ${lingue.length} lingue allineate al master ${MASTER} (${conteggi})`);
