import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Fraunces, Poppins, Spline_Sans_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import Analytics from "@/components/Analytics";
import CookieBanner from "@/components/CookieBanner";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, ogLocale, orgJsonLd, webSiteJsonLd } from "@/lib/seo";
import "../globals.css";

// Interruttore dell'indicizzazione. Serve a due cose: tenere fuori dall'indice
// le PREVIEW (dove la variabile non c'è) e, qui e ora, tenere fuori il sito
// finché friulivillas.com punta ancora alla coming soon su GitHub Pages.
// ⚠️ Su TriesteImmobiliare questo flag è costato settimane di invisibilità
// perché nessuno lo girò dopo il cutover DNS (sanato il 2026-07-30). Al
// cutover di FriuliVillas va messo `NEXT_PUBLIC_ALLOW_INDEX=true` in
// produzione su Vercel: senza, il sito è noindex+nofollow e non se ne accorge
// nessuno per mesi.
const ALLOW_INDEX = process.env.NEXT_PUBLIC_ALLOW_INDEX === "true";

// Arms scroll reveals before first paint (CSS hides [data-reveal] only under
// html[data-reveal-armed]) so content stays visible when JS never runs.
const REVEAL_ARM_SCRIPT = `if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-reveal-armed","");`;

// `subsets` decide solo quali file PRECARICARE (doc di next/font): il CSS
// generato contiene comunque le @font-face di tutti i sottoinsiemi, ciascuna
// col suo unicode-range, quindi č š ž dello sloveno sono disegnate con Poppins
// anche con il solo "latin" (il browser scarica latin-ext quando incontra la
// prima lettera che gli serve). Aggiungere "latin-ext" qui precaricherebbe
// quattro file in più su OGNI pagina, in tutte e quattro le lingue.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

// 07/10/2026, rifacimento: i titoli in serif da display e i dati in mono, come
// i gemelli (SloveniaVillas, SappadaVillas). Poppins resta il testo corrente.
// Il mono non si precarica: serve a numeri e didascalie, mai sopra la piega.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});
const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-spline",
  display: "swap",
  preload: false,
});

// Match the mobile browser chrome to the favicon's exact ink background.
export const viewport: Viewport = {
  themeColor: "#0b1512",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    // Token Search Console (23/09/2026): pubblico come l'ID GA4. Ottenuto dalla
    // sentinella del CRM v4 (Site Verification API), verificata dallo stesso job.
    verification: { google: "txxKMxo8cyqSvVlnBSsgd5dpCVFY53IN48HiMl9DydM" },
    title: { default: t("title"), template: "%s · FriuliVillas" },
    description: t("description"),
    robots: ALLOW_INDEX
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: "FriuliVillas",
      // Le pagine che dichiarano il loro openGraph (pageOpenGraph) lo
      // sostituiscono per intero; questo vale per quelle che non lo fanno
      // (privacy), che altrimenti uscivano senza og:locale.
      locale: ogLocale(locale),
      images: [{ url: "/brand/og-default.jpg", width: 1200, height: 630, alt: "FriuliVillas" }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${fraunces.variable} ${splineMono.variable} h-full scroll-smooth antialiased`}
      // The head script below adds data-reveal-armed pre-hydration (by design).
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_ARM_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <JsonLd data={[orgJsonLd(), webSiteJsonLd()]} />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <RevealObserver />
          <Analytics />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
