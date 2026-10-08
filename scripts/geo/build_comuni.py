#!/usr/bin/env python3
"""Costruisce comuni-fvg.csv dai byte grezzi in raw/ (ISTAT SITUAS + ISTAT confini + ISTAT altimetria + Wikidata).

Fonti (scaricate il 2026-10-07):
- SITUAS report 61/73/74/75, data di riferimento 07/10/2026:
  POST https://situas.istat.it/ShibO2Module/api/Report/Spool/07-10-2026/<id>?&PageNum=1&PageSize=999999
  (corpo {"orderFields":[],"orderDirects":[],"pFilterFields":[],"pFilterValues":[]}) -> raw/situas-spool-<id>.json
- Confini ISTAT generalizzati 01/01/2026 (CC BY 4.0):
  https://www.istat.it/storage/cartografia/confini_amministrativi/generalizzati/2026/Limiti01012026_g.zip
- Altimetria comuni al 31/12/2021 (ISTAT, DEM):
  https://www.istat.it/wp-content/uploads/2026/02/Altimetria_Comuni-al-31_12_2021.xlsx
- Coordinate del centro: Wikidata P625 (CC0) via SPARQL su P635 (codice ISTAT) -> raw/wikidata-comuni-fvg.json,
  accettata solo se cade dentro il poligono ISTAT del comune; altrimenti point_on_surface del poligono.
- Coordinata usata per i tempi (colonne lat/lon), in ordine di precedenza, sempre dentro il poligono ISTAT:
  1) sede municipale OSM (amenity=townhall) da municipi-osm.csv (script municipi_nominatim.py);
  2) nodo place del capoluogo OSM (raw/nominatim-capoluoghi/<codice>.json);
  3) Wikidata P625; 4) representative_point del poligono.
  Le coordinate Wikidata restano nelle colonne wd_lat/wd_lon, con la distanza dalla scelta (dist_wd_m).
"""
import csv, json, os, re, math
import shapefile, openpyxl
from shapely.geometry import shape, Point
from shapely.ops import transform
from pyproj import Transformer

H = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(H, 'raw')

ZONA = {'1': 'montagna interna', '2': 'montagna litoranea', '3': 'collina interna',
        '4': 'collina litoranea', '5': 'pianura'}
DEGURBA = {1: 'città', 2: 'piccole città e sobborghi', 3: 'zone rurali'}
UTS = {'030': 'Udine', '031': 'Gorizia', '032': 'Trieste', '093': 'Pordenone'}


def hav(a, b, c, d):
    p1, p2 = math.radians(a), math.radians(c)
    return 2 * 6371000 * math.asin(math.sqrt(math.sin((p2 - p1) / 2) ** 2 +
                                             math.cos(p1) * math.cos(p2) * math.sin(math.radians(d - b) / 2) ** 2))


def spool(n):
    d = json.load(open(os.path.join(R, f'situas-spool-{n}.json')))
    return {r['PRO_COM_T']: r for r in d['body'] if r['COD_REG'] == '06'}


def main():
    s61, s73, s74, s75 = spool(61), spool(73), spool(74), spool(75)
    assert len(s61) == len(s73) == len(s74) == len(s75) == 215, (len(s61), len(s73), len(s74), len(s75))

    # altimetria DEM 2021
    alt = {}
    wb = openpyxl.load_workbook(os.path.join(R, 'Altimetria_Comuni-al-31_12_2021.xlsx'), read_only=True)
    ws = wb['Comuni 31_12_2021']
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i < 2 or row[1] != 6:
            continue
        alt['%06d' % row[4]] = dict(alt_min=row[8], alt_max=row[9], alt_mediana=row[12], alt_centro_dem=row[13])

    # poligoni (UTM32N -> WGS84)
    tr = Transformer.from_crs('EPSG:32632', 'EPSG:4326', always_xy=True).transform
    shp = shapefile.Reader(os.path.join(R, 'limiti2026/Com01012026_g/Com01012026_g_WGS84.shp'))
    poly = {}
    for sr in shp.iterShapeRecords():
        if sr.record['COD_REG'] == 6:
            poly[sr.record['PRO_COM_T']] = transform(tr, shape(sr.shape.__geo_interface__))
    assert len(poly) == 215

    # wikidata
    wd = {}
    for b in json.load(open(os.path.join(R, 'wikidata-comuni-fvg.json')))['results']['bindings']:
        c = b['istat']['value']
        wd.setdefault(c, []).append(b)

    muni = {r['codice_istat']: r for r in csv.DictReader(open(os.path.join(H, 'municipi-osm.csv')))}

    def capo(code, g):
        fn = os.path.join(R, 'nominatim-capoluoghi', code + '.json')
        if not os.path.exists(fn):
            return None
        for x in json.load(open(fn)):
            if x['category'] == 'place' and x['type'] in ('city', 'town', 'village'):
                pt = (float(x['lat']), float(x['lon']))
                if g.contains(Point(pt[1], pt[0])):
                    return pt
        return None

    rows = []
    for code in sorted(s61):
        a, t, d, p = s61[code], s73[code], s74[code], s75[code]
        g = poly[code]
        lat = lon = None; cfonte = None; wdq = ''; names = {}
        for b in wd.get(code, []):
            if 'coord' not in b:
                continue
            m = re.match(r'Point\(([-\d.]+) ([-\d.]+)\)', b['coord']['value'])
            x, y = float(m.group(1)), float(m.group(2))
            if g.buffer(0.002).contains(Point(x, y)):
                lon, lat = x, y; cfonte = 'wikidata P625 ' + b['item']['value'].rsplit('/', 1)[1]
                wdq = b['item']['value'].rsplit('/', 1)[1]
                names = {k: b[k]['value'] for k in ('sl', 'de', 'fur') if k in b}
                break
        wd_lat, wd_lon = lat, lon
        mu = muni.get(code)
        cap = capo(code, g)
        if mu and mu['muni_lat']:
            lat, lon = float(mu['muni_lat']), float(mu['muni_lon']); cfonte = 'OSM municipio ' + mu['muni_osm']
        elif cap:
            lat, lon = cap; cfonte = 'OSM nodo place capoluogo (Nominatim)'
        if lat is None:
            ps = g.representative_point(); lon, lat = ps.x, ps.y; cfonte = 'ISTAT poligono representative_point'
        assert g.buffer(0.002).contains(Point(lon, lat)), code
        dist_wd = round(hav(lat, lon, wd_lat, wd_lon)) if wd_lat is not None else ''
        al = alt.get(code, {})
        rows.append(dict(
            codice_istat=code, comune=a['COMUNE_IT'], denominazione_ufficiale=a['COMUNE'],
            denominazione_altra_lingua=a.get('COMUNE_A') or '',
            uts_ex_provincia=a['DEN_UTS'], cod_uts=a['COD_UTS'], sigla=a['SIGLA_AUTOMOBILISTICA'],
            zona_altimetrica_cod=t['ZONA_ALT'], zona_altimetrica=ZONA[str(t['ZONA_ALT'])],
            litoraneo=int(t['COM_LIT']), isolano=int(t['COM_ISO']), zone_costiere_2021=t['ZONE_COST_2021'],
            degurba_2021=t['DEGURBA_2021'], altitudine_municipio_m=t['ALT'],
            alt_min_m=al.get('alt_min'), alt_max_m=al.get('alt_max'), alt_mediana_m=al.get('alt_mediana'),
            superficie_kmq=d['AREA_KMQ'], anno_superficie=d['ANNO_AREA'],
            pop_legale=d['POP_LEG'], anno_censimento=d['ANNO_CENSIMENTO'],
            pop_residente=d['POP_RES'], anno_pop_residente=d['ANNO_POP_RES'],
            zone_montane_ue_2014=p['ZONE_MONTANE_2014'], aree_interne_2020=p['AREE_INT_2020'],
            ecoregione_sottosezione=t['DEN_ECO_SSEZ_2018'],
            lat=round(lat, 6), lon=round(lon, 6), coord_fonte=cfonte,
            wd_lat=wd_lat if wd_lat is None else round(wd_lat, 6), wd_lon=wd_lon if wd_lon is None else round(wd_lon, 6),
            dist_wd_m=dist_wd,
            wikidata=wdq, nome_sl_wikidata=names.get('sl', ''), nome_de_wikidata=names.get('de', ''),
            nome_fur_wikidata=names.get('fur', ''),
            fonte='ISTAT SITUAS rep.61/73/74/75 al 07/10/2026; ISTAT Altimetria comuni 31/12/2021 (DEM); '
                  'ISTAT confini generalizzati 01/01/2026; Wikidata (coord, nomi)'))
    out = os.path.join(H, 'comuni-fvg.csv')
    with open(out, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader(); w.writerows(rows)
    print('scritti', len(rows), 'comuni in', out)
    import collections
    print('fonte coordinate:', collections.Counter(r['coord_fonte'].split(' ')[0] + ' ' + r['coord_fonte'].split(' ')[1] for r in rows))
    print('coord da Wikidata/poligono:', [r['comune'] for r in rows if not r['coord_fonte'].startswith('OSM')])
    print('senza altimetria 2021:', [r['comune'] for r in rows if r['alt_min_m'] is None])


if __name__ == '__main__':
    main()
