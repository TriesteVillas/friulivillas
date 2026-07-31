import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    // React <ViewTransition> for route morphs/slides (see globals.css).
    viewTransition: true,
  },
  // Nessun redirect legacy: friulivillas.com non ha un passato da riscrivere.
  // Prima di questo sito il dominio serviva una coming soon statica di tre
  // pagine (/, /en/, /de/) su GitHub Pages, e quei tre percorsi esistono
  // identici anche qui — Next normalizza da sé /en/ → /en. Il blocco di 301
  // che stava qui apparteneva al WordPress di TriesteImmobiliare: copiarlo
  // avrebbe creato redirect verso pagine mai esistite su questo dominio.
  images: {
    // Vercel's Image Optimizer keys its cache on the SOURCE url. Airtable
    // attachment urls are signed and rotate on every ISR revalidation (600s),
    // so each cycle is a fresh cache key → a fresh transformation + cache write,
    // which blows the Hobby free tier and then 402s (alt text instead of photos).
    // We bypass the optimizer and serve Airtable's own sized renditions instead
    // (thumbnails.large for cards/grids; original only for hero + lightbox).
    unoptimized: true,
    remotePatterns: [
      // Airtable attachment CDN (URLs are signed and expire ~2h; refreshed on each ISR revalidation).
      { protocol: "https", hostname: "v5.airtableusercontent.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
