#!/usr/bin/env python3
"""Tempi di guida misurati con OSRM (router.project-osrm.org, profilo driving, senza traffico).

Origini: 9 punti (coordinate da Nominatim/OSM, file raw/nominatim/*.json; Trieste da mandato).
Destinazioni: il punto-centro di ognuno dei 215 comuni (comuni-fvg.csv, colonne lat/lon) + 3 frazioni
dei nostri immobili (Viaso, Scodovacca, Begliano; Nominatim).
Table API a lotti (9 sorgenti + 40 destinazioni per richiesta), pausa di 3 s fra le richieste.
Output: tempi-osrm.csv (una riga per coppia origine-destinazione) + raw/osrm/*.json (risposte grezze).
"""
import csv, json, os, time, subprocess, datetime

H = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(H, 'raw', 'osrm'); os.makedirs(RAW, exist_ok=True)

ORIGINI = [  # id, nome, lat, lon, fonte
    ('trieste', 'Trieste, Piazza Unità d\'Italia', 45.6503, 13.7681, 'mandato (coincide con OSM: 45.6501,13.7677)'),
    ('udine', 'Udine, Piazza della Libertà', 46.0632191, 13.2359666, 'Nominatim/OSM raw/nominatim/udine_liberta.json'),
    ('aer_trieste', 'Aeroporto di Trieste (Ronchi dei Legionari), terminal', 45.8214083, 13.4852737, 'Nominatim/OSM raw/nominatim/aeroporto_trieste2.json'),
    ('aer_venezia', 'Aeroporto di Venezia Marco Polo, viale Galilei (accesso terminal)', 45.5051837, 12.3325722, 'Nominatim/OSM'),
    ('lubiana', 'Lubiana, Prešernov trg', 46.0513764, 14.5059895, 'Nominatim/OSM raw/nominatim/lubiana_preseren.json'),
    ('klagenfurt', 'Klagenfurt, Neuer Platz', 46.6240863, 14.3071798, 'Nominatim/OSM raw/nominatim/klagenfurt_neuerplatz.json'),
    ('vienna', 'Vienna, Stephansplatz', 48.2085828, 16.3739210, 'Nominatim/OSM raw/nominatim/vienna_stephansplatz.json'),
    ('monaco', 'Monaco di Baviera, Marienplatz', 48.1370318, 11.5759246, 'Nominatim/OSM raw/nominatim/monaco_marienplatz.json'),
    ('salisburgo', 'Salisburgo, Residenzplatz', 47.7985232, 13.0461545, 'Nominatim/OSM raw/nominatim/salisburgo_residenzplatz.json'),
]
EXTRA = [  # destinazioni non-comune (frazioni dei nostri immobili)
    ('F-viaso', 'Viaso (Socchieve)', 46.4071596, 12.8479407),
    ('F-scodovacca', 'Scodovacca (Cervignano del Friuli)', 45.8217685, 13.3667674),
    ('F-begliano', 'Begliano (San Canzian d\'Isonzo)', 45.8188384, 13.4656826),
]


def main():
    comuni = list(csv.DictReader(open(os.path.join(H, 'comuni-fvg.csv'))))
    dest = [(c['codice_istat'], c['comune'], float(c['lat']), float(c['lon'])) for c in comuni] + EXTRA
    oggi = datetime.date.today().isoformat()
    out = []
    B = 40
    for k in range(0, len(dest), B):
        lot = dest[k:k + B]
        pts = [(o[3], o[2]) for o in ORIGINI] + [(d[3], d[2]) for d in lot]
        coords = ';'.join('%.6f,%.6f' % p for p in pts)
        src = ';'.join(str(i) for i in range(len(ORIGINI)))
        dst = ';'.join(str(i) for i in range(len(ORIGINI), len(pts)))
        url = (f'https://router.project-osrm.org/table/v1/driving/{coords}?sources={src}&destinations={dst}'
               '&annotations=duration,distance')
        fn = os.path.join(RAW, f'table_{k:03d}.json')
        if not os.path.exists(fn):
            for tent in range(4):
                try:
                    # curl: il python di sistema (LibreSSL) fallisce l'handshake TLS col server OSRM
                    data = subprocess.run(['curl', '-sS', '--max-time', '90', '-A',
                                           'TriesteVillas-geo/1.0 (martino@triestevillas.com)', url],
                                          capture_output=True, check=True).stdout
                    j = json.loads(data)
                    assert j['code'] == 'Ok', j
                    open(fn, 'wb').write(data)
                    break
                except Exception as e:
                    print('errore, riprovo', e); time.sleep(10)
            time.sleep(3)
        j = json.load(open(fn))
        for i, o in enumerate(ORIGINI):
            for jx, d in enumerate(lot):
                du = j['durations'][i][jx]; di = j['distances'][i][jx]
                snap = j['destinations'][jx]['distance']
                out.append(dict(origine=o[0], origine_nome=o[1], dest_id=d[0], dest_nome=d[1],
                                dest_lat=d[2], dest_lon=d[3],
                                minuti=round(du / 60, 1) if du is not None else '',
                                km=round(di / 1000, 1) if di is not None else '',
                                snap_dest_m=round(snap), data_misura=oggi,
                                fonte='OSRM router.project-osrm.org table/v1 driving, senza traffico'))
        print('lotto', k, 'ok')
    with open(os.path.join(H, 'tempi-osrm.csv'), 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(out[0])); w.writeheader(); w.writerows(out)
    with open(os.path.join(H, 'origini-osrm.csv'), 'w', newline='') as f:
        w = csv.writer(f); w.writerow(['id', 'nome', 'lat', 'lon', 'fonte']); w.writerows(ORIGINI)
    print('righe', len(out), 'attese', len(ORIGINI) * len(dest))


if __name__ == '__main__':
    main()
