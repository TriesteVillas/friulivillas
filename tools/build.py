#!/usr/bin/env python3
"""Genera index.html, en/index.html, de/index.html da un unico template.

Perche' un generatore su un sito "zero build": le tre pagine sono la STESSA pagina in
tre lingue. Mantenerle a mano significa, prima o poi, correggere un refuso in italiano
e dimenticarsene in tedesco. Qui si tocca solo il dizionario STRINGS qui sotto.

Il sito resta statico: l'HTML generato e' committato e GitHub Pages lo serve com'e'.
Nessun build in fase di deploy.

    python3 tools/build.py
"""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SITE = "https://friulivillas.com"
EMAIL = "richieste@triestevillas.com"
PHONE = "331 8940822"
PHONE_TEL = "+393318940822"
WA = "https://wa.me/393318940822"

# Dati societari: FriuliVillas e' un brand, non una societa'. Sono gli stessi di
# triestevillas.com e triesteimmobiliare.com, verbatim dai loro messages/*.json.
LEGAL = {
    "company": "TriesteVillas srl",
    "address": "Via Milano 5, 34132 Trieste",
    "vat": "C.F. / P.IVA 01235580329",
    "capital": "Capitale sociale 10.200,00 € i.v.",
    "pec": "milou@pec.emailc.it",
}

LOCALES = ["it", "en", "de"]
PATHS = {"it": "/", "en": "/en/", "de": "/de/"}
OG_LOCALE = {"it": "it_IT", "en": "en_GB", "de": "de_DE"}

STRINGS = {
    "it": {
        "title": "FriuliVillas — Ville e proprietà selezionate in Friuli Venezia Giulia",
        "description": "FriuliVillas, il brand del gruppo TriesteVillas dedicato al Friuli Venezia Giulia. Il sito è in preparazione: scriveteci a richieste@triestevillas.com.",
        "navGroup": "Il Gruppo",
        "badge": "Coming soon",
        "h1": "Ville e proprietà selezionate in Friuli Venezia Giulia",
        "lede": "FriuliVillas è il brand del gruppo TriesteVillas dedicato al Friuli Venezia Giulia. Stiamo costruendo il sito: nel frattempo, se cercate o volete vendere una proprietà in regione, parliamone.",
        "ctaMail": "Scriveteci",
        "ctaWa": "WhatsApp",
        "scrollLabel": "Scorri",
        "bandTitle": "Il sito arriva presto",
        "bandText": "Nel frattempo le richieste le leggiamo davvero: scriveteci e vi rispondiamo.",
        "bandCta": "Scriveteci una mail",
        "sitemapTitle": "Mappa del sito",
        "home": "Home",
        "contactTitle": "Contatti",
        "rea": "Iscritta alla C.C.I.A.A. di Trieste · REA n° TS 134793",
        "office": "Via Torino 34, Trieste",
        "hours": "Lun–Ven 11:00–16:00",
        "rights": "Tutti i diritti riservati.",
        "brandOf": "Un brand del gruppo TriesteVillas",
        "menuLabel": "Menu",
        "groupEyebrow": "Il Gruppo",
        "groupLede": "Il brand del Gruppo TriesteVillas dedicato al Friuli Venezia Giulia. Non un contenitore generico, ma un progetto costruito per portare nel resto della regione metodo, specializzazione e qualità di lettura.",
        "brands": [
            ("TriesteVillas", "Il polo Luxury del Gruppo a Trieste.", "https://www.triestevillas.com/"),
            ("TriesteImmobiliare", "Ogni tipo di immobile, ogni budget.", "https://www.triesteimmobiliare.com/"),
            ("TriesteAffitti", "Gestione affitti, Flex o Classici.", "https://www.triesteaffitti.com/"),
            ("LignanoVillas", "Luxury a Lignano. English-first, pensato per venditori e compratori esteri.", "https://www.lignanovillas.com/it/"),
        ],
        "groupClose1": "FriuliVillas nasce per applicare questa stessa cultura del lavoro al resto del FVG. E per leggerlo non solo come mercato di immobili, ma come <strong>sistema di ownership</strong>:",
        "groupSeq": "comprare, detenere, mettere a reddito, vendere, riallocare.",
        "groupClose2": "Anche quando le proprietà sono più di una, o quando la vera questione non è il singolo immobile, ma la prossima mossa.",
        "groupKicker": "Brand diversi, una regia sola.",
        "groupSub": "FriuliVillas.com online a breve.",
    },
    "en": {
        "title": "FriuliVillas — Selected villas and properties in Friuli Venezia Giulia",
        "description": "FriuliVillas, the TriesteVillas group's brand for Friuli Venezia Giulia, North-East Italy. The site is being built — write to richieste@triestevillas.com.",
        "navGroup": "The Group",
        "badge": "Coming soon",
        "h1": "Selected villas and properties in Friuli Venezia Giulia",
        "lede": "FriuliVillas is the TriesteVillas group's brand for Friuli Venezia Giulia, in North-East Italy. We are building the site — in the meantime, if you are looking for or selling a property in the region, let's talk.",
        "ctaMail": "Write to us",
        "ctaWa": "WhatsApp",
        "scrollLabel": "Scroll",
        "bandTitle": "The site is coming",
        "bandText": "In the meantime we do read what arrives: write to us and we'll reply.",
        "bandCta": "Send us an email",
        "sitemapTitle": "Site map",
        "home": "Home",
        "contactTitle": "Contact",
        "rea": "Registered with the Trieste Chamber of Commerce · REA no. TS 134793",
        "office": "Via Torino 34, Trieste",
        "hours": "Mon–Fri 11:00–16:00",
        "rights": "All rights reserved.",
        "brandOf": "A brand of the TriesteVillas group",
        "menuLabel": "Menu",
        "groupEyebrow": "The Group",
        "groupLede": "The TriesteVillas Group's brand for Friuli Venezia Giulia. Not a generic container, but a project built to bring method, specialisation and a trained eye to the rest of the region.",
        "brands": [
            ("TriesteVillas", "The Group's luxury arm in Trieste.", "https://www.triestevillas.com/en"),
            ("TriesteImmobiliare", "Every kind of property, every budget.", "https://www.triesteimmobiliare.com/en"),
            ("TriesteAffitti", "Rental management, Flex or classic contracts.", "https://www.triesteaffitti.com/"),
            ("LignanoVillas", "Luxury in Lignano. English-first, built for foreign sellers and buyers.", "https://www.lignanovillas.com/"),
        ],
        "groupClose1": "FriuliVillas exists to apply that same working culture to the rest of the region — and to read it not only as a property market, but as a <strong>system of ownership</strong>:",
        "groupSeq": "buying, holding, putting to income, selling, reallocating.",
        "groupClose2": "Including when there is more than one property, or when the real question is not the single asset but the next move.",
        "groupKicker": "Separate brands, a single direction.",
        "groupSub": "FriuliVillas.com online shortly.",
    },
    "de": {
        "title": "FriuliVillas — Ausgewählte Villen und Immobilien in Friaul-Julisch Venetien",
        "description": "FriuliVillas, die Marke der TriesteVillas-Gruppe für Friaul-Julisch Venetien. Die Website entsteht gerade — schreiben Sie an richieste@triestevillas.com.",
        "navGroup": "Die Gruppe",
        "badge": "Coming soon",
        "h1": "Ausgewählte Villen und Immobilien in Friaul-Julisch Venetien",
        "lede": "FriuliVillas ist die Marke der TriesteVillas-Gruppe für Friaul-Julisch Venetien im Nordosten Italiens. Die Website entsteht gerade — wenn Sie in der Region eine Immobilie suchen oder verkaufen möchten, sprechen Sie uns an.",
        "ctaMail": "Schreiben Sie uns",
        "ctaWa": "WhatsApp",
        "scrollLabel": "Scrollen",
        "bandTitle": "Die Website kommt bald",
        "bandText": "Bis dahin lesen wir jede Anfrage: Schreiben Sie uns, wir antworten.",
        "bandCta": "E-Mail schreiben",
        "sitemapTitle": "Sitemap",
        "home": "Home",
        "contactTitle": "Kontakt",
        "rea": "Eingetragen bei der Handelskammer Triest · REA Nr. TS 134793",
        "office": "Via Torino 34, Triest",
        "hours": "Mo–Fr 11:00–16:00",
        "rights": "Alle Rechte vorbehalten.",
        "brandOf": "Eine Marke der TriesteVillas-Gruppe",
        "menuLabel": "Menu",
        "groupEyebrow": "Die Gruppe",
        "groupLede": "Die Marke der TriesteVillas-Gruppe für Friaul-Julisch Venetien. Kein generischer Sammelbegriff, sondern ein Projekt, das Methode, Spezialisierung und einen geschulten Blick in den Rest der Region trägt.",
        "brands": [
            ("TriesteVillas", "Der Luxusbereich der Gruppe in Triest.", "https://www.triestevillas.com/de"),
            ("TriesteImmobiliare", "Jede Art von Immobilie, jedes Budget.", "https://www.triesteimmobiliare.com/de"),
            ("TriesteAffitti", "Mietverwaltung, Flex oder klassisch.", "https://www.triesteaffitti.com/"),
            ("LignanoVillas", "Luxus in Lignano. English-first, für ausländische Verkäufer und Käufer.", "https://www.lignanovillas.com/de/"),
        ],
        "groupClose1": "FriuliVillas entsteht, um dieselbe Arbeitskultur auf das übrige Friaul-Julisch Venetien anzuwenden — und die Region nicht nur als Immobilienmarkt zu lesen, sondern als <strong>System des Eigentums</strong>:",
        "groupSeq": "kaufen, halten, Ertrag erzielen, verkaufen, umschichten.",
        "groupClose2": "Auch dann, wenn es um mehr als eine Immobilie geht, oder wenn die eigentliche Frage nicht das einzelne Objekt ist, sondern der nächste Schritt.",
        "groupKicker": "Verschiedene Marken, eine Regie.",
        "groupSub": "FriuliVillas.com in Kürze online.",
    },
}

YEAR = 2026  # bump a mano: una pagina statica non ha un runtime che sappia la data


def locale_switcher(current):
    out = []
    for loc in LOCALES:
        label = loc.upper()
        if loc == current:
            out.append(f'<span aria-current="true">{label}</span>')
        else:
            out.append(f'<a href="{PATHS[loc]}" hreflang="{loc}">{label}</a>')
    return "".join(out)


def page(locale):
    s = STRINGS[locale]
    brands = "\n      ".join(
        f'<div class="brand"><p class="brand__name"><a class="brand__link nav-underline" href="{url}" target="_blank" rel="noopener">{name} ↗</a></p><p class="brand__what">{what}</p></div>'
        for name, what, url in s["brands"]
    )
    sitemap_items = (
        f'<li><a href="{PATHS[locale]}">{s["home"]}</a></li>'
        f'<li><a href="{PATHS[locale]}#gruppo">{s["navGroup"]}</a></li>'
    )
    alternates = "".join(
        f'<link rel="alternate" hreflang="{loc}" href="{SITE}{PATHS[loc]}">' + "\n"
        for loc in LOCALES
    )

    return f"""<!doctype html>
<html lang="{locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{s['title']}</title>
<meta name="description" content="{s['description']}">

<link rel="canonical" href="{SITE}{PATHS[locale]}">
{alternates}<link rel="alternate" hreflang="x-default" href="{SITE}/">

<link rel="icon" href="/assets/favicons/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/icon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/favicons/icon-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/assets/favicons/icon-512.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/apple-touch-icon.png">
<meta name="theme-color" content="#0b1512">

<meta property="og:type" content="website">
<meta property="og:url" content="{SITE}{PATHS[locale]}">
<meta property="og:title" content="{s['title']}">
<meta property="og:description" content="{s['description']}">
<meta property="og:image" content="{SITE}/assets/images/og-friulivillas.jpg">
<meta property="og:locale" content="{OG_LOCALE[locale]}">
<meta name="twitter:card" content="summary_large_image">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>

<header class="site-header">
  <div class="pill">
    <a class="pill__brand" href="{PATHS[locale]}" aria-label="FriuliVillas">
      <img src="/assets/logos/friulivillas-wordmark.svg" alt="FriuliVillas" width="317" height="75">
    </a>
    <nav class="pill__nav" aria-label="{s['menuLabel']}">
      <a class="nav-underline" href="#gruppo">{s['navGroup']}</a>
    </nav>
    <div class="pill__end">
      <div class="locale">{locale_switcher(locale)}</div>
      <button class="burger" type="button" data-burger aria-expanded="false" aria-controls="menu" aria-label="{s['menuLabel']}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16"/>
        </svg>
      </button>
    </div>
  </div>
  <div class="sheet" id="menu" data-sheet>
    <ul><li><a href="#gruppo">{s['navGroup']}</a></li></ul>
    <div class="sheet__contacts">
      <a href="mailto:{EMAIL}">{EMAIL}</a>
      <a href="tel:{PHONE_TEL}">{PHONE}</a>
    </div>
  </div>
</header>

<main>
  <section class="hero">
    <video class="hero__video" autoplay muted loop playsinline preload="metadata"
           poster="/assets/images/hero-poster.jpg" aria-hidden="true" tabindex="-1">
      <source src="/assets/video/hero.webm" type="video/webm">
      <source src="/assets/video/hero.mp4" type="video/mp4">
    </video>
    <div class="hero__scrim" aria-hidden="true"></div>

    <div class="hero__inner">
      <p class="hero__badge"><span class="soon">{s['badge']}</span></p>
      <img class="hero__mark" src="/assets/logos/friulivillas-wordmark.svg" alt="FriuliVillas" width="317" height="75">
      <h1>{s['h1']}</h1>
      <p class="hero__lede">{s['lede']}</p>
      <div class="hero__cta">
        <a class="btn btn--solid" href="mailto:{EMAIL}">{s['ctaMail']}</a>
        <a class="btn btn--ghost" href="{WA}" target="_blank" rel="noopener">{s['ctaWa']} {PHONE}</a>
      </div>
    </div>

    <div class="hero__cue" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M6 13l6 6 6-6"/>
      </svg>
      <span class="sr-only">{s['scrollLabel']}</span>
    </div>
  </section>

  <section class="group" id="gruppo">
    <div class="group__wrap">
      <p class="group__eyebrow">{s['groupEyebrow']}</p>
      <p class="group__lede">{s['groupLede']}</p>

      <div class="brands">{brands}</div>

      <div class="group__close">
        <p>{s['groupClose1']} <span class="seq">{s['groupSeq']}</span></p>
        <p>{s['groupClose2']}</p>
      </div>

      <p class="group__kicker">{s['groupKicker']}</p>
      <p class="group__sub">{s['groupSub']}</p>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="footer__band">
    <div class="wrap">
      <h2>{s['bandTitle']}</h2>
      <p>{s['bandText']}</p>
      <a class="btn btn--ghost" href="mailto:{EMAIL}">{s['bandCta']}</a>
    </div>
  </div>

  <div class="wrap footer__grid">
    <div>
      <img class="footer__mark" src="/assets/logos/friulivillas-wordmark.svg" alt="FriuliVillas" width="317" height="75">
      <div class="footer__legal">
        <p class="strong">{LEGAL['company']}</p>
        <p>{LEGAL['address']}</p>
        <p>{LEGAL['vat']}</p>
        <p>{s['rea']}</p>
        <p>{LEGAL['capital']}</p>
        <p>PEC <a href="mailto:{LEGAL['pec']}">{LEGAL['pec']}</a></p>
      </div>
    </div>

    <nav aria-label="{s['sitemapTitle']}">
      <h2 class="col-title">{s['sitemapTitle']}</h2>
      <ul class="footer__sitemap">{sitemap_items}</ul>
    </nav>

    <div>
      <h2 class="col-title">{s['contactTitle']}</h2>
      <div class="footer__contacts">
        <a href="mailto:{EMAIL}">{EMAIL}</a>
        <a href="{WA}" target="_blank" rel="noopener">{PHONE}</a>
        <span>{s['office']}</span>
        <span>{s['hours']}</span>
      </div>
    </div>
  </div>

  <div class="footer__bar">
    <div class="wrap">
      <span>© {YEAR} FriuliVillas — {LEGAL['company']}. {s['rights']}</span>
      <a href="https://triestevillas.com" target="_blank" rel="noopener">{s['brandOf']}</a>
    </div>
  </div>
</footer>

<script src="/assets/js/nav.js" defer></script>
</body>
</html>
"""


def main():
    for locale in LOCALES:
        out = os.path.join(ROOT, "index.html" if locale == "it" else f"{locale}/index.html")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        html = page(locale)
        with open(out, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"{os.path.relpath(out, ROOT):<20} {len(html):>6} byte")

    # sitemap: tre URL, una per lingua
    urls = "".join(
        f"  <url><loc>{SITE}{PATHS[l]}</loc>"
        + "".join(
            f'<xhtml:link rel="alternate" hreflang="{a}" href="{SITE}{PATHS[a]}"/>'
            for a in LOCALES
        )
        + "</url>\n"
        for l in LOCALES
    )
    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + urls + "</urlset>\n"
    )
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(sitemap)
    print("sitemap.xml")


if __name__ == "__main__":
    main()
