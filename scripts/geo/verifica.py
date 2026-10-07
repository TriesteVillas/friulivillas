#!/usr/bin/env python3
"""Seconda verifica, indipendente da classifica.py:
 M2 — ricalcolo delle regole direttamente dai byte grezzi (SITUAS JSON + CSV PPR), con codice diverso;
 M3 — conteggio spaziale: ogni comune (punto interno al poligono ISTAT NON semplificato) cade in quale area
      dissolta di geojson/aree-S*.geojson?
 M4 — superfici: somma kmq ISTAT per area vs area geodetica dei poligoni dissolti.
"""
import json, csv, collections, os
import shapefile
from shapely.geometry import shape
from shapely.ops import transform
from pyproj import Transformer, Geod
H = os.path.dirname(os.path.abspath(__file__))
# --- M2
t73 = [r for r in json.load(open(f'{H}/raw/situas-spool-73.json'))['body'] if r['COD_REG'] == '06']
nome = {r['PRO_COM_T']: r['COMUNE_IT'] for r in json.load(open(f'{H}/raw/situas-spool-61.json'))['body'] if r['COD_REG'] == '06'}
ha = collections.defaultdict(dict)
for r in csv.DictReader(open(f'{H}/fonti-regionali/ppr-ambiti-paesaggio.csv')):
    s = r['superficie_ha_nell_ambito']
    if s:
        ha[r['comune']][r['ambito_paesaggio'].split(' - ')[0]] = sum(float(p.replace('.', '').replace(',', '.')) for p in s.split('+'))
m2 = {}
for r in t73:
    n = nome[r['PRO_COM_T']]; amb = max(ha[n], key=ha[n].get) if ha.get(n) else None
    z = int(r['ZONA_ALT']); lit = r['COM_LIT'] == '1'
    if z == 1: a = 'montagna'
    elif amb == 'AP 11': a = 'carso-trieste'
    elif amb == 'AP 12' or lit: a = 'costa-laguna'
    elif z == 3 or amb in ('AP 5', 'AP 6'): a = 'colline'
    else: a = 'pianura'
    m2[r['PRO_COM_T']] = a
c2 = collections.Counter(m2.values())
A = {r['codice_istat']: r for r in csv.DictReader(open(f'{H}/aree-comuni.csv'))}
c1 = collections.Counter(r['S5'] for r in A.values())
diff = [k for k in A if A[k]['S5'] != m2[k]]
print('M1 classifica.py S5:', dict(sorted(c1.items())))
print('M2 ricalcolo grezzo :', dict(sorted(c2.items())), 'differenze comune per comune:', diff)
# --- M3
tr = Transformer.from_crs('EPSG:32632', 'EPSG:4326', always_xy=True).transform
pts = {}
for sr in shapefile.Reader(f'{H}/raw/limiti2026/Com01012026_g/Com01012026_g_WGS84.shp').iterShapeRecords():
    if sr.record['COD_REG'] == 6:
        g = transform(tr, shape(sr.shape.__geo_interface__)); pts[sr.record['PRO_COM_T']] = g.representative_point()
geod = Geod(ellps='WGS84')
for S in ('S3', 'S4', 'S5'):
    aree = [(f['properties']['area'], f['properties']['n_comuni'], shape(f['geometry'])) for f in json.load(open(f'{H}/geojson/aree-{S}.geojson'))['features']]
    c3 = collections.Counter(); miss = []
    for k, p in pts.items():
        hit = [a for a, n, g in aree if g.contains(p)]
        if len(hit) == 1: c3[hit[0]] += 1
        else: miss.append((nome[k], hit))
    cA = collections.Counter(r[S] for r in A.values())
    ok = all(c3[a] == cA[a] for a in cA)
    print(f'M3 {S} spaziale:', dict(sorted(c3.items())), '| n_comuni nel geojson:', {a: n for a, n, g in aree},
          '| ambigui:', miss, '| coincide con M1:', ok)
    # M4
    kmq = collections.defaultdict(float)
    for r in csv.DictReader(open(f'{H}/comuni-fvg.csv')): kmq[A[r['codice_istat']][S]] += float(r['superficie_kmq'])
    for a, n, g in aree:
        ar = abs(geod.geometry_area_perimeter(g)[0]) / 1e6
        print(f'   M4 {S} {a:16} ISTAT {kmq[a]:8.1f} kmq · poligono semplificato {ar:8.1f} kmq · scarto {100*(ar-kmq[a])/kmq[a]:+.2f}%')
# controllo incrociato montagna: ISTAT zona 1 == PPR AP1+AP2+AP3 + Sappada + i montagna interna di AP4/AP6
z1 = {nome[r['PRO_COM_T']] for r in t73 if r['ZONA_ALT'] == '1'}
amb = {n: max(v, key=v.get) for n, v in ha.items() if v}
alpi = {n for n, a in amb.items() if a in ('AP 1', 'AP 2', 'AP 3')} | {'Sappada'}
print('montagna ISTAT', len(z1), '| PPR AP1-3 + Sappada', len(alpi), '| differenza', sorted(z1 ^ alpi))
