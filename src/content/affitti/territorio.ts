// Il territorio attorno alle due case: i luoghi della «rosa dei tempi», con le
// coordinate e i minuti d'auto MISURATI (OSRM, senza traffico, 07/10/2026) da
// ciascuna casa. Fonte: KB progetti/tophill-cottage/territorio/distanze.json (le
// coordinate delle mete) e ~/.tsv-work/FV-AFFITTI/territorio/osrm-case.json (i tempi
// dalle due case). Per lo chalet i tempi partono dalla strada più vicina: chi non ha
// un fuoristrada aggiunge la jeep o il tratto a piedi dal paese.
import type { PuntoRosa } from "@/components/affitti/RosaTempi";
import type { Lingua, SlugCasa } from "./case";

type PuntoRegistro = Omit<PuntoRosa, "nome"> & { nome: Record<Lingua, string> };

export const ROSA: Record<SlugCasa, PuntoRegistro[]> = {
 "top-hill-cottage": [
  {
   "nome": {
    "it": "Tolmezzo",
    "en": "Tolmezzo",
    "de": "Tolmezzo",
    "sl": "Tolmeč"
   },
   "lat": 46.40594,
   "lon": 13.01516,
   "minuti": 22,
   "km": 16
  },
  {
   "nome": {
    "it": "Udine",
    "en": "Udine",
    "de": "Udine",
    "sl": "Videm"
   },
   "lat": 46.06322,
   "lon": 13.23597,
   "minuti": 60,
   "km": 64.9
  },
  {
   "nome": {
    "it": "Aeroporto di Trieste",
    "en": "Trieste airport",
    "de": "Flughafen Triest",
    "sl": "Letališče Trst"
   },
   "lat": 45.81743,
   "lon": 13.48554,
   "minuti": 81,
   "km": 103.1
  },
  {
   "nome": {
    "it": "Aeroporto di Venezia",
    "en": "Venice airport",
    "de": "Flughafen Venedig",
    "sl": "Letališče Benetke"
   },
   "lat": 45.50485,
   "lon": 12.34063,
   "minuti": 126,
   "km": 180.1
  },
  {
   "nome": {
    "it": "Trieste",
    "en": "Trieste",
    "de": "Triest",
    "sl": "Trst"
   },
   "lat": 45.6501,
   "lon": 13.7677,
   "minuti": 105,
   "km": 133.9
  },
  {
   "nome": {
    "it": "Lignano (mare)",
    "en": "Lignano (sea)",
    "de": "Lignano (Meer)",
    "sl": "Lignano (morje)"
   },
   "lat": 45.68771,
   "lon": 13.13955,
   "minuti": 106,
   "km": 127.9
  },
  {
   "nome": {
    "it": "Lago di Sauris",
    "en": "Lake Sauris",
    "de": "Sauris-See",
    "sl": "Jezero Sauris"
   },
   "lat": 46.44822,
   "lon": 12.73631,
   "minuti": 19,
   "km": 16.4
  },
  {
   "nome": {
    "it": "Forni di Sopra",
    "en": "Forni di Sopra",
    "de": "Forni di Sopra",
    "sl": "Forni di Sopra"
   },
   "lat": 46.41748,
   "lon": 12.58489,
   "minuti": 29,
   "km": 28
  },
  {
   "nome": {
    "it": "Zoncolan",
    "en": "Zoncolan",
    "de": "Zoncolan",
    "sl": "Zoncolan"
   },
   "lat": 46.52153,
   "lon": 12.91983,
   "minuti": 32,
   "km": 23.7
  },
  {
   "nome": {
    "it": "Sappada",
    "en": "Sappada",
    "de": "Sappada",
    "sl": "Sappada"
   },
   "lat": 46.566,
   "lon": 12.68395,
   "minuti": 54,
   "km": 41.9
  },
  {
   "nome": {
    "it": "Cortina d'Ampezzo",
    "en": "Cortina d'Ampezzo",
    "de": "Cortina d'Ampezzo",
    "sl": "Cortina d'Ampezzo"
   },
   "lat": 46.53859,
   "lon": 12.13538,
   "minuti": 93,
   "km": 92
  },
  {
   "nome": {
    "it": "Villach (Austria)",
    "en": "Villach (Austria)",
    "de": "Villach (Österreich)",
    "sl": "Beljak (Avstrija)"
   },
   "lat": 46.61398,
   "lon": 13.84664,
   "minuti": 86,
   "km": 106.4
  }
 ],
 "chalet-navauce": [
  {
   "nome": {
    "it": "Tolmezzo",
    "en": "Tolmezzo",
    "de": "Tolmezzo",
    "sl": "Tolmeč"
   },
   "lat": 46.40594,
   "lon": 13.01516,
   "minuti": 20,
   "km": 13.3
  },
  {
   "nome": {
    "it": "Udine",
    "en": "Udine",
    "de": "Udine",
    "sl": "Videm"
   },
   "lat": 46.06322,
   "lon": 13.23597,
   "minuti": 58,
   "km": 62.2
  },
  {
   "nome": {
    "it": "Aeroporto di Trieste",
    "en": "Trieste airport",
    "de": "Flughafen Triest",
    "sl": "Letališče Trst"
   },
   "lat": 45.81743,
   "lon": 13.48554,
   "minuti": 80,
   "km": 100.5
  },
  {
   "nome": {
    "it": "Aeroporto di Venezia",
    "en": "Venice airport",
    "de": "Flughafen Venedig",
    "sl": "Letališče Benetke"
   },
   "lat": 45.50485,
   "lon": 12.34063,
   "minuti": 124,
   "km": 177.4
  },
  {
   "nome": {
    "it": "Trieste",
    "en": "Trieste",
    "de": "Triest",
    "sl": "Trst"
   },
   "lat": 45.6501,
   "lon": 13.7677,
   "minuti": 104,
   "km": 131.3
  },
  {
   "nome": {
    "it": "Lignano (mare)",
    "en": "Lignano (sea)",
    "de": "Lignano (Meer)",
    "sl": "Lignano (morje)"
   },
   "lat": 45.68771,
   "lon": 13.13955,
   "minuti": 104,
   "km": 125.2
  },
  {
   "nome": {
    "it": "Lago di Sauris",
    "en": "Lake Sauris",
    "de": "Sauris-See",
    "sl": "Jezero Sauris"
   },
   "lat": 46.44822,
   "lon": 12.73631,
   "minuti": 26,
   "km": 22.2
  },
  {
   "nome": {
    "it": "Forni di Sopra",
    "en": "Forni di Sopra",
    "de": "Forni di Sopra",
    "sl": "Forni di Sopra"
   },
   "lat": 46.41748,
   "lon": 12.58489,
   "minuti": 36,
   "km": 33.8
  },
  {
   "nome": {
    "it": "Zoncolan",
    "en": "Zoncolan",
    "de": "Zoncolan",
    "sl": "Zoncolan"
   },
   "lat": 46.52153,
   "lon": 12.91983,
   "minuti": 22,
   "km": 16.4
  },
  {
   "nome": {
    "it": "Sappada",
    "en": "Sappada",
    "de": "Sappada",
    "sl": "Sappada"
   },
   "lat": 46.566,
   "lon": 12.68395,
   "minuti": 44,
   "km": 34.6
  },
  {
   "nome": {
    "it": "Cortina d'Ampezzo",
    "en": "Cortina d'Ampezzo",
    "de": "Cortina d'Ampezzo",
    "sl": "Cortina d'Ampezzo"
   },
   "lat": 46.53859,
   "lon": 12.13538,
   "minuti": 99,
   "km": 97.7
  },
  {
   "nome": {
    "it": "Villach (Austria)",
    "en": "Villach (Austria)",
    "de": "Villach (Österreich)",
    "sl": "Beljak (Avstrija)"
   },
   "lat": 46.61398,
   "lon": 13.84664,
   "minuti": 84,
   "km": 103.7
  }
 ]
};
