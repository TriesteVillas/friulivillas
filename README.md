# friulivillas.com — coming soon

Sito statico su **GitHub Pages**, niente Vercel. **Deploy = `git push` su `main`.**

Veste grafica del gruppo: stesso scheletro di [triestevillas.com](https://triestevillas.com)
e [triesteimmobiliare.com](https://triesteimmobiliare.com) — **Poppins**, header a pillola
di vetro fisso in alto, hero video a tutto schermo, footer con fascia + tre colonne + barra
legale. Ogni brand tiene la stessa struttura e cambia solo l'accento cromatico: TSV
blu-petrolio + sabbia, TSI azzurro, **FriuliVillas verde bosco + sabbia/ottone**.

```
tools/build.py             genera le tre pagine + sitemap.xml   <- si tocca QUESTO
index.html  en/  de/       output generato (committato)
assets/css/style.css       tutto lo stile
assets/js/nav.js           apre/chiude il pannello mobile
assets/logos/              wordmark SVG (gradiente + avorio) + PNG di fallback
assets/video/              hero.mp4 + hero.webm
assets/images/             poster del video + immagine Open Graph
assets/favicons/           favicon, apple-touch, 32/192/512
CNAME .nojekyll robots.txt sitemap.xml
```

## Modificare i testi

Le tre lingue sono la stessa pagina. Non si modificano gli `.html`: si tocca il
dizionario `STRINGS` in **`tools/build.py`** e si rigenera.

```bash
python3 tools/build.py    # riscrive index.html, en/index.html, de/index.html, sitemap.xml
```

L'HTML generato è committato, quindi **il deploy resta senza build**: GitHub Pages serve
i file così come sono.

> ⚠️ I testi tedeschi sono scritti a mano, non tradotti a macchina — sul WordPress di
> triesteaffitti.com TranslatePress aveva prodotto perfino un brand sbagliato
> ("TriesteRentals", "Haus"). Prima di campagne in DE, farli rileggere a un madrelingua.

## Il menu

**Una voce sola: `Il Gruppo`**, ancorata alla sezione `#gruppo` di questa stessa pagina.
Le altre voci di triestevillas.com (Compra · Ristruttura · Possiedi · Vendi) sono state
tolte: puntavano a pagine che non esistono, e un menu di link morti è peggio di un menu
corto. Torneranno quando torneranno le pagine.

L'ancora ha bisogno di `scroll-margin-top: 88px` sulla sezione, altrimenti l'header
`fixed` le finisce sopra e il titolo resta nascosto.

La fascia del footer **non ha un form newsletter** ma un pulsante mailto: su Pages non c'è
backend, e un form che non scrive da nessuna parte è peggio di nessun form.

## La sezione Gruppo

Blocco chiaro (`--paper`) fra hero e footer: dà al sito il ritmo scuro → chiaro → scuro di
triestevillas.com, e sul chiaro il testo lungo si legge davvero. Contiene il
posizionamento del brand, i quattro brand fratelli in tabella e la chiusura sul *sistema
di ownership* — la sequenza `comprare, detenere, mettere a reddito, vendere, riallocare`
è evidenziata in `--brand` perché è il cuore del messaggio, non un elenco qualsiasi.

Il testo è di Martino (21/07/2026), verbatim in italiano. **EN e DE sono traduzioni
mie**: `una regia sola` → `a single direction` / `eine Regie`, `qualità di lettura` →
`a trained eye` / `ein geschulter Blick`. Sono scelte interpretative, non letterali: da
far confermare.

## Il video

`assets/video/hero.mp4` (989 KB) + `.webm` (1,3 MB), **muto, in loop, autoplay**.

La ripresa originale è un drone che scende sulla piscina: il primo e l'ultimo fotogramma
sono lontanissimi, quindi un loop diretto avrebbe fatto uno stacco secco ogni 5 secondi.
Il file montato è un **palindromo** — clip in avanti + la stessa al contrario — così il
punto di giunzione non esiste e la discesa diventa un respiro continuo di 10 secondi.

Rigenerarlo da un nuovo girato:

```bash
ffmpeg -i sorgente.mp4 \
  -filter_complex "[0:v]scale=1280:-2,split[a][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1[out]" \
  -map "[out]" -an -c:v libx264 -crf 30 -preset slow -profile:v main -pix_fmt yuv420p \
  -movflags +faststart assets/video/hero.mp4
ffmpeg -i assets/video/hero.mp4 -frames:v 1 -q:v 4 assets/images/hero-poster.jpg
```

`-an` toglie l'audio: senza, il browser non fa partire l'autoplay. Con
`prefers-reduced-motion: reduce` il video non viene mostrato e resta il poster.

## Il wordmark

L'originale era un **PNG 317×75** in due verdi piatti (`#1F962B`/`#104C14`): troppo poco
per un hero su schermi retina, e un verde che sopra il video sparisce nei fotogrammi
scuri. È stato **vettorializzato** (`potrace` sul canale alpha upscalato 8×) e ricolorato
col gradiente sabbia/ottone `#E8D5AF → #BE9A63`, la famiglia cromatica del gruppo
(il `--color-sand` `#cfb795` di triestevillas.com). Le forme delle lettere sono quelle
dell'originale: è cambiato solo il colore.

Il favicon usa la sola **"f"**, che nel tracciato è una componente connessa a sé e si
isola senza tagliare il traversino né portarsi dietro la "r". Favicon, PNG di fallback e
Open Graph **derivano tutti dall'SVG**: se cambia il colore si rigenerano da lì.

## DNS

Registrar **Tucows**, zona DNS su **Aruba** (`dns.technorail.com`, `dns2.technorail.com`,
`dns3.arubadns.net`, `dns4.arubadns.cz`) — non su Cloudflare come `triestevillas.com`.
Le modifiche si fanno dal pannello Aruba.

Sostituire il record A esistente (`89.46.104.249`, il vecchio WordPress) con:

| Tipo | Nome | Valore |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `triestevillas.github.io.` |

> ⚠️ **Non toccare il record MX** (`mx.friulivillas.com`) né l'SPF
> (`v=spf1 include:_spf.aruba.it ~all`): la posta del dominio è su Aruba e continua a
> funzionare solo se restano dove sono. Si cambia **solo** il web.

Dopo la propagazione, in *Settings → Pages* spuntare **Enforce HTTPS**. GitHub emette il
certificato da solo, ci mette qualche minuto. `www.friulivillas.com` viene rediretto
sull'apex da GitHub Pages.

## Domini collegati

`fvgimmobiliare.com` non ha un sito proprio: fa **redirect** qui, dal repo
[`TriesteVillas/fvgimmobiliare`](https://github.com/TriesteVillas/fvgimmobiliare).

## Anteprima locale

```bash
cd ~/dev/friulivillas && python3 -m http.server 4173
```

I percorsi degli asset sono assoluti (`/assets/...`), quindi il sito va servito dalla
radice — aprire gli `.html` con `file://` non funziona.
