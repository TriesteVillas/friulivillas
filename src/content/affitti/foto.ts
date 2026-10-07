// Le foto dei soggiorni: tipo comune e conversione verso il `Photo` del sito
// (lo stesso che usano galleria e lightbox, con la trasparenza AI).
// I registri veri sono generati: foto-top-hill-cottage.ts, foto-chalet-navauce.ts.
import type { FotoAi } from "@/lib/fotoAi";
import type { Photo } from "@/lib/properties";
import type { Lingua } from "./case";

export type FotoAffitto = {
  n: number;
  file: string;
  ruolo: string | null;
  stanza: string | null;
  /** per le simulazioni: il file della foto vera da cui nascono */
  simulazioneDi: string | null;
  url: string;
  thumb: string;
  width: number;
  height: number;
  alt: Partial<Record<Lingua, string>>;
  ai: FotoAi | null;
};

export function comePhoto(f: FotoAffitto, locale: string): Photo {
  const l = (["it", "en", "de", "sl"].includes(locale) ? locale : "it") as Lingua;
  return {
    id: null,
    url: f.url,
    thumb: f.thumb,
    width: f.width,
    height: f.height,
    alt: f.alt[l] || f.alt.en || f.alt.it || "",
    filename: f.file,
    ai: f.ai,
  };
}
