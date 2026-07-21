# friulivillas.com — coming soon

Landing page statica, zero build. Una pagina sola: wordmark, claim IT/EN, contatti.
Stessa impostazione di [`elegie-duino`](https://github.com/TriesteVillas/elegie-duino):
HTML + CSS serviti da **GitHub Pages**, nessun framework, nessuna dipendenza a runtime.

**Deploy = `git push` su `main`.** Non c'è Vercel su questo progetto.

```
index.html                 la pagina
robots.txt                 indicizzazione libera
CNAME                      friulivillas.com  (dominio custom di GitHub Pages)
.nojekyll                  serve i file così come sono, senza passare da Jekyll
assets/css/style.css       tutto lo stile
assets/logos/              wordmark (SVG gradiente + SVG avorio + PNG di fallback)
assets/favicons/           favicon, apple-touch, icone 32/192/512
assets/images/             immagine Open Graph 1200x630
assets/video/              vuota: qui va il video di sfondo (vedi sotto)
```

## Il wordmark

L'originale fornito era un **PNG 317×75** in due verdi piatti (`#1F962B` / `#104C14`) —
troppo poco per un hero su schermi retina, e un verde che sopra un video scuro sparisce.

È stato **vettorializzato** (`potrace` sul canale alpha upscalato 8×) e ricolorato con il
gradiente sabbia/ottone `#E8D5AF → #BE9A63`, cioè la famiglia cromatica del gruppo
(il `--color-sand` `#cfb795` di triestevillas.com). Le forme delle lettere sono quelle
dell'originale: è stato cambiato solo il colore.

Il favicon usa la sola **"f"**, che nel wordmark è una componente connessa a sé
(x 0..44 nelle unità originali) e si isola senza tagliare il traversino né portarsi
dietro la "r".

Gli asset raster (PNG, favicon, Open Graph) sono **derivati dall'SVG**: se cambia il
colore, si rigenerano da lì, non si ritoccano a mano.

## Aggiungere il video di sfondo

Il file **non è ancora arrivato**. Fino ad allora lo sfondo è quello CSS
(`.stage__bg`: alone caldo + vignettatura), che resta comunque come fallback sotto al
video. Quando il video c'è:

1. Metterlo in `assets/video/hero.mp4` — H.264, muto, **max ~4 MB** (limite di GitHub
   per file: 100 MB, ma qui conta il tempo di caricamento su mobile). Utile anche una
   versione `.webm`. Estrarre un fotogramma come `assets/images/hero-poster.jpg`.
2. In `index.html`, subito dopo `<div class="stage__bg">`:
   ```html
   <video class="stage__video" autoplay muted loop playsinline
          poster="./assets/images/hero-poster.jpg" aria-hidden="true">
     <source src="./assets/video/hero.mp4" type="video/mp4">
   </video>
   ```
3. In `style.css` il selettore `.stage__video` va posizionato come `.stage__bg`
   (`position:absolute; inset:0; width:100%; height:100%; object-fit:cover;`) più un
   velo scuro sopra, altrimenti il testo non regge il contrasto sui fotogrammi chiari.

## DNS

Il dominio è registrato via **Tucows** e la zona DNS sta su **Aruba**
(`dns.technorail.com`, `dns2.technorail.com`, `dns3.arubadns.net`, `dns4.arubadns.cz`) —
non su Cloudflare come `triestevillas.com`. Le modifiche si fanno dal pannello Aruba.

Per puntare il dominio a GitHub Pages, sostituire il record A esistente
(`89.46.104.249`, il WordPress Aruba) con:

| Tipo | Nome | Valore |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `triestevillas.github.io.` |

> ⚠️ **Non toccare il record MX** (`mx.friulivillas.com`) né l'SPF
> (`v=spf1 include:_spf.aruba.it ~all`): la posta del dominio è su Aruba e continua a
> funzionare solo se quei record restano dove sono. Si cambia **solo** il web.

Dopo la propagazione, in *Settings → Pages* del repo spuntare **Enforce HTTPS**
(GitHub emette il certificato da solo, ci mette qualche minuto).

`www.friulivillas.com` viene rediretto sull'apex da GitHub Pages.

## Domini collegati

`fvgimmobiliare.com` non ha un sito proprio: fa **redirect** qui, dal repo
[`TriesteVillas/fvgimmobiliare`](https://github.com/TriesteVillas/fvgimmobiliare).

## Anteprima locale

```bash
cd ~/dev/friulivillas && python3 -m http.server 4173
```
