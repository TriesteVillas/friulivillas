import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Cormorant_Garamond } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import Testata from "@/components/affitti/Testata";
import Volo from "@/components/affitti/Volo";
import Mosaico from "@/components/affitti/Mosaico";
import Ore from "@/components/affitti/Ore";
import RosaTempi from "@/components/affitti/RosaTempi";
import Stagioni from "@/components/affitti/Stagioni";
import Prenota from "@/components/affitti/Prenota";
import { ProgrammaProvider } from "@/components/affitti/Programma";
import RiepilogoAi from "@/components/affitti/RiepilogoAi";
import Sorella from "@/components/affitti/Sorella";
import BandaVideo from "@/components/affitti/BandaVideo";
import Recensioni from "@/components/affitti/Recensioni";
import { CASE, casaDa, type Lingua, type SlugCasa } from "@/content/affitti/case";
import { UI } from "@/content/affitti/ui";
import { MEDIA, datiVideo } from "@/content/affitti/media";
import { comePhoto, type FotoAffitto } from "@/content/affitti/foto";
import { FOTO as FOTO_TH } from "@/content/affitti/foto-top-hill-cottage";
import { FOTO as FOTO_CN } from "@/content/affitti/foto-chalet-navauce";
import { TESTI_TOPHILL, type TestiPagina } from "@/content/affitti/testi-tophill";
import { TESTI_NAVAUCE } from "@/content/affitti/testi-navauce";
import { ESPERIENZE } from "@/content/affitti/esperienze";
import { ROSA } from "@/content/affitti/territorio";
import { NOTA_AI } from "@/content/affitti/nota-ai";
import { absUrl, pageAlternates, pageOpenGraph, SITE_URL } from "@/lib/seo";

// La pagina di un soggiorno (Top Hill Cottage, Chalet Navauce): un racconto in
// capitoli, dalla testata con la luce di adesso al modulo di preventivo. I
// contenuti sono statici e stanno in src/content/affitti/ (queste case non sono
// nel catalogo del CRM: le presentiamo, non le gestiamo).

const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-affitti-display",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return CASE.map((c) => ({ casa: c.slug }));
}

const TESTI: Record<SlugCasa, Record<Lingua, TestiPagina>> = {
  "top-hill-cottage": TESTI_TOPHILL,
  "chalet-navauce": TESTI_NAVAUCE,
};
const FOTO: Record<SlugCasa, FotoAffitto[]> = { "top-hill-cottage": FOTO_TH, "chalet-navauce": FOTO_CN };

const lingua = (l: string): Lingua => (l === "en" || l === "de" || l === "sl" ? l : "it");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; casa: string }>;
}): Promise<Metadata> {
  const { locale, casa } = await params;
  const c = casaDa(casa);
  if (!c) return {};
  const T = TESTI[c.slug][lingua(locale)];
  const path = `/affitti/${c.slug}`;
  const poster = MEDIA[c.slug].testata.giorno?.poster;
  return {
    title: { absolute: `${T.seo.titolo} · FriuliVillas` },
    description: T.seo.descrizione,
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph(locale, path, T.seo.titolo, T.seo.descrizione, poster ? `${SITE_URL}${poster}` : undefined),
  };
}

export default async function PaginaSoggiorno({ params }: { params: Promise<{ locale: string; casa: string }> }) {
  const { locale, casa } = await params;
  setRequestLocale(locale);
  const c = casaDa(casa);
  if (!c) notFound();
  const L = lingua(locale);
  const T = TESTI[c.slug][L];
  const U = UI[L];
  const media = MEDIA[c.slug];
  const sorella = casaDa(c.sorella) ?? null;
  const Ts = sorella ? TESTI[sorella.slug][L] : null;

  const tutte = FOTO[c.slug];
  const vere = tutte.filter((f) => !f.simulazioneDi);
  // Il mosaico alterna fuori e dentro (le prime 12 si vedono in pagina, le altre dal «Vedi
  // tutte»): nell'ordine del manifest gli esterni stanno tutti in testa.
  const fuori = (f: FotoAffitto) => ["esterno", "veduta", "dettaglio", "territorio"].includes(f.stanza ?? "") || f.ruolo === "notte";
  const alternate: FotoAffitto[] = [];
  {
    const a = vere.filter(fuori);
    const b = vere.filter((f) => !fuori(f));
    while (a.length || b.length) {
      if (a.length) alternate.push(a.shift()!);
      if (b.length) alternate.push(b.shift()!);
    }
  }
  const foto = vere.map((f) => comePhoto(f, L));
  const anteprima = alternate.map((f) => comePhoto(f, L));
  // «Un giorno lassù»: la stessa inquadratura in tre luci, se esiste una foto vera con la sua
  // simulazione al tramonto E quella notturna (lo chalet); altrimenti la copertina, la sua
  // simulazione al tramonto e la prima notte VERA orizzontale (Top Hill).
  const copertina = vere[0] ?? null;
  const simDi = (file: string, luce: "oro" | "notte") =>
    tutte.find((f) => f.simulazioneDi === file && f.luceSimulata === luce) ?? null;
  const terna = vere.find((f) => simDi(f.file, "oro") && simDi(f.file, "notte")) ?? null;
  const baseGiorno = terna ?? vere.find((f) => simDi(f.file, "oro")) ?? copertina;
  const simulazione = baseGiorno ? simDi(baseGiorno.file, "oro") : null;
  const notte = terna
    ? simDi(terna.file, "notte")
    : vere.find((f) => f.ruolo === "notte" && f.width > f.height) ?? null;
  const fotoSorella = sorella ? FOTO[sorella.slug].find((f) => !f.simulazioneDi) ?? null : null;
  // Tutte le foto che la pagina mostra entrano nel conteggio del riepilogo AI.
  const mostrate = [
    ...foto,
    ...[simulazione, notte].filter((f): f is FotoAffitto => Boolean(f?.simulazioneDi)).map((f) => comePhoto(f, L)),
  ];

  // Senza video di giorno, la testata parte dalla copertina (foto ferma, poster).
  const giornoFoto =
    !media.testata.giorno && copertina
      ? { mp4: "", mp4Sm: "", poster: copertina.url, posterSm: copertina.thumb, ai: null }
      : null;
  const varianti = {
    giorno: media.testata.giorno ? { ...media.testata.giorno, ai: datiVideo(media.testata.giorno, L) } : giornoFoto,
    oro: media.testata.oro && { ...media.testata.oro, ai: datiVideo(media.testata.oro, L) },
    notte: media.testata.notte && { ...media.testata.notte, ai: datiVideo(media.testata.notte, L) },
  };
  const videoAi = (["giorno", "oro", "notte"] as const)
    .map((k) => media.testata[k])
    .filter((v): v is NonNullable<typeof v> => Boolean(v?.ai))
    .map((v) => ({ testo: v.ai!.etichetta[L], didascalia: v.ai!.didascalia[L] }));

  const esperienze = ESPERIENZE.filter((e) => e.case.includes(c.slug));
  const rosa = ROSA[c.slug].map((p) => ({ ...p, nome: p.nome[L] }));

  const sezione = "mx-auto max-w-6xl px-6";
  const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.28em] text-brand";
  const titolo = "mt-3 font-[family-name:var(--font-affitti-display)] text-[clamp(2.2rem,5vw,4rem)] leading-[1] text-ink";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    "@id": `${absUrl(locale, `/affitti/${c.slug}`)}#casa`,
    name: c.nome,
    description: T.seo.descrizione,
    url: absUrl(locale, `/affitti/${c.slug}`),
    identifier: c.cin ? { "@type": "PropertyValue", name: "CIN", value: c.cin } : undefined,
    image: foto.slice(0, 6).map((p) => `${SITE_URL}${p.url}`),
    address: {
      "@type": "PostalAddress",
      addressLocality: `${c.localita.frazione}, ${c.localita.comune}`,
      addressRegion: c.localita.regione,
      addressCountry: "IT",
    },
    geo: { "@type": "GeoCoordinates", latitude: Number(c.coord.lat.toFixed(3)), longitude: Number(c.coord.lon.toFixed(3)) },
    containsPlace: c.ospitiMax
      ? { "@type": "Accommodation", occupancy: { "@type": "QuantitativeValue", maxValue: c.ospitiMax } }
      : undefined,
  };

  return (
    <div className={`${display.variable} bg-paper text-ink`}>
      <JsonLd data={jsonLd} />
      <Testata
        varianti={varianti}
        coord={c.coord}
        locale={L}
        ancoraCasa="#casa"
        ancoraPrenota="#prenota"
        testi={{ ...U.testata, ...T.testata, cta1: U.testata.cta1, cta2: U.testata.cta2 }}
      />

      {/* Il manifesto */}
      <section className={`${sezione} py-24 sm:py-32`}>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <h2 className="font-[family-name:var(--font-affitti-display)] text-[clamp(2.4rem,5.5vw,4.6rem)] italic leading-[0.98] text-brand-dark" data-reveal>
            {T.manifesto.titolo}
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-neutral-800" data-reveal>
            {T.manifesto.testo.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-neutral-300 pt-10 sm:grid-cols-4" data-reveal-stagger>
          {T.manifesto.fatti.map((f) => (
            <div key={f.etichetta}>
              <dt className="sr-only">{f.etichetta}</dt>
              <dd className="font-[family-name:var(--font-affitti-display)] text-5xl text-ink">{f.valore}</dd>
              <dd className="mt-1 text-sm text-neutral-600">{f.etichetta}</dd>
            </div>
          ))}
        </dl>
      </section>

      {media.volo && (
        <Volo
          mp4={media.volo.mp4}
          mp4Sm={media.volo.mp4Sm}
          poster={media.volo.poster}
          ai={null}
          titolo={T.volo.titolo}
          tappe={T.volo.tappe}
          nota={T.volo.nota}
        />
      )}

      {media.banda?.modo === "film" && (
        <BandaVideo
          modo="film"
          mp4={media.banda.mp4}
          mp4Sm={media.banda.mp4Sm}
          poster={media.banda.poster}
          ai={datiVideo(media.banda, L)}
          eyebrow={media.banda.testi[L].eyebrow}
          titolo={media.banda.testi[L].titolo}
          testo={media.banda.testi[L].testo}
          play={media.banda.testi[L].play}
        />
      )}

      {/* La casa */}
      <section id="casa" className={`${sezione} scroll-mt-24 py-24 sm:py-32`}>
        <p className={eyebrow}>{T.casa.eyebrow}</p>
        <h2 className={`${titolo} max-w-3xl`}>{T.casa.titolo}</h2>
        <div className="mt-6 grid gap-5 text-lg leading-relaxed text-neutral-800 lg:grid-cols-2 lg:gap-12">
          {T.casa.testo.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {foto.length > 0 && (
          <div className="mt-14">
            <Mosaico foto={foto} anteprima={anteprima} {...U.galleria} />
          </div>
        )}
      </section>

      {media.banda?.modo === "loop" && (
        <BandaVideo
          modo="loop"
          mp4={media.banda.mp4}
          mp4Sm={media.banda.mp4Sm}
          poster={media.banda.poster}
          ai={datiVideo(media.banda, L)}
          eyebrow={media.banda.testi[L].eyebrow}
          titolo={media.banda.testi[L].titolo}
          testo={media.banda.testi[L].testo}
        />
      )}

      {baseGiorno && notte && (
        <Ore
          giorno={comePhoto(baseGiorno, L)}
          oro={simulazione ? comePhoto(simulazione, L) : null}
          notte={comePhoto(notte, L)}
          coord={c.coord}
          locale={L}
          testi={T.ore}
        />
      )}

      {/* Per chi è */}
      <section className={`${sezione} py-24 sm:py-32`}>
        <p className={eyebrow}>{T.modi.eyebrow}</p>
        <h2 className={titolo}>{T.modi.titolo}</h2>
        <ol className="mt-12 grid gap-6 lg:grid-cols-3" data-reveal-stagger>
          {T.modi.voci.map((v, i) => (
            <li key={v.titolo} className="rounded-3xl bg-white p-7 ring-1 ring-neutral-200">
              <span className="font-[family-name:var(--font-affitti-display)] text-4xl italic text-sand">0{i + 1}</span>
              <h3 className="mt-3 text-xl font-semibold text-ink">{v.titolo}</h3>
              <p className="mt-3 leading-relaxed text-neutral-700">{v.testo}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Non solo le chiavi */}
      <section className="bg-brand-dark py-24 text-white sm:py-32">
        <div className={`${sezione} grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20`}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sand">{T.chiavi.eyebrow}</p>
            <h2 className="mt-3 font-[family-name:var(--font-affitti-display)] text-[clamp(2.2rem,5vw,4rem)] leading-[1]">
              {T.chiavi.titolo}
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-white/85">
              {T.chiavi.testo.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <div>
            <ul className="divide-y divide-white/15 border-y border-white/15" data-reveal-stagger>
              {T.chiavi.elenco.map((x) => (
                <li key={x} className="flex items-center gap-4 py-4 text-lg">
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-sand" />
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-white/60">{T.chiavi.nota}</p>
          </div>
        </div>
      </section>

      {T.recensioni && <Recensioni testi={T.recensioni} />}

      {/* Dov'è */}
      <section className={`${sezione} py-24 sm:py-32`}>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.4fr] lg:items-center lg:gap-12">
          <div>
            <p className={eyebrow}>{T.dove.eyebrow}</p>
            <h2 className={titolo}>{T.dove.titolo}</h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-neutral-800">
              {T.dove.testo.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          {rosa.length > 0 && (
            <RosaTempi
              centro={c.coord}
              nomeCentro={c.nome}
              punti={rosa}
              minuti={(n) => U.rosa.minuti.replace("{n}", String(n))}
              legenda={U.rosa.legenda}
              titolo={T.dove.titolo}
              cardinali={U.rosa.cardinali}
            />
          )}
        </div>
      </section>

      <ProgrammaProvider>
        {esperienze.length > 0 && (
          <section className="bg-white py-24 sm:py-32">
            <div className={sezione}>
              <p className={eyebrow}>{T.stagioni.eyebrow}</p>
              <h2 className={titolo}>{T.stagioni.titolo}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-700">{T.stagioni.testo}</p>
              <div className="mt-10">
                <Stagioni
                  voci={esperienze.map((e) => ({
                    id: e.id,
                    titolo: e.titolo[L],
                    testo: e.testo[L],
                    stagioni: e.stagioni,
                    minuti: e.minuti[c.slug] ?? null,
                  }))}
                  nomi={U.stagioni.nomi}
                  testi={U.stagioni}
                />
              </div>
            </div>
          </section>
        )}

        <section id="prenota" className={`${sezione} scroll-mt-24 py-24 sm:py-32`}>
          <p className={eyebrow}>{T.prenota.eyebrow}</p>
          <h2 className={titolo}>{T.prenota.titolo}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-700">{T.prenota.testo}</p>
          <p className="mt-3 text-sm font-medium text-neutral-600">{U.preventivoSuRichiesta}</p>
          <div className="mt-12">
            <Prenota
              casa={c.slug}
              nomeCasa={c.nome}
              sorella={sorella ? { slug: sorella.slug, nome: sorella.nome } : null}
              ospitiMax={c.ospitiMax ?? 12}
              servizi={c.servizi.map((s) => ({ id: s.id, testo: s.testo[L] }))}
              esperienze={Object.fromEntries(esperienze.map((e) => [e.id, e.titolo[L]]))}
              testi={U.prenota}
              locale={L}
              privacyHref={L === "it" ? "/privacy" : `/${L}/privacy`}
            />
          </div>
        </section>
      </ProgrammaProvider>

      {/* Da sapere, CIN e chi pubblica */}
      <section className="border-t border-neutral-300 bg-paper">
        <div className={`${sezione} grid gap-10 py-16 lg:grid-cols-2`}>
          <div>
            <h2 className="text-lg font-semibold text-ink">{T.regole.titolo}</h2>
            <ul className="mt-4 space-y-2 text-neutral-700">
              {T.regole.voci.map((v) => (
                <li key={v} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-neutral-600">
            {c.cin && (
              <p className="text-base text-ink">
                {U.cin}: <strong className="font-semibold tracking-wide">{c.cin}</strong>
                <span className="block text-sm text-neutral-600">
                  {`${c.localita.frazione === c.localita.comune ? c.localita.comune : `${c.localita.frazione} · ${c.localita.comune}`} (${c.localita.provincia})`}
                </span>
              </p>
            )}
            <p>{U.nonLocatore}</p>
          </div>
        </div>
      </section>

      {sorella && Ts && (
        <Sorella
          href={L === "it" ? `/affitti/${sorella.slug}` : `/${L}/affitti/${sorella.slug}`}
          foto={fotoSorella ? comePhoto(fotoSorella, L) : null}
          eyebrow={T.sorella.eyebrow}
          titolo={T.sorella.titolo}
          testo={T.sorella.testo}
          vai={`${U.sorellaVai} ${sorella.nome} →`}
        />
      )}

      <div className={`${sezione} py-16`}>
        <RiepilogoAi foto={mostrate} nota={NOTA_AI[c.slug][L]} video={videoAi} locale={L} />
      </div>
    </div>
  );
}
