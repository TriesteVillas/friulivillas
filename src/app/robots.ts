import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Stesso interruttore del layout: senza NEXT_PUBLIC_ALLOW_INDEX=true questo
// robots.txt dice `Disallow: /`. Serviva prima del cutover DNS, quando il
// rilancio viveva su un preview *.vercel.app; messo a `true` in produzione il
// 2026-07-30. Continua a valere per i deploy di preview, dove la variabile non
// esiste e il sito deve restare fuori dall'indice.
const ALLOW_INDEX = process.env.NEXT_PUBLIC_ALLOW_INDEX === "true";

export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEX) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    // Niente /private: FriuliVillas non ha una Private Collection.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
