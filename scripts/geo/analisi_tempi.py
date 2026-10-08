#!/usr/bin/env python3
"""Aggrega tempi-osrm.csv per area (schemi S3/S4/S5): mediana, min, max (minuti) da ogni origine.
E tabella dei tempi verso i comuni/frazioni dei nostri immobili. Output: tempi-aree.csv, tempi-immobili.csv"""
import csv, statistics, collections, os
H = os.path.dirname(os.path.abspath(__file__))
T = list(csv.DictReader(open(os.path.join(H, 'tempi-osrm.csv'))))
A = {r['codice_istat']: r for r in csv.DictReader(open(os.path.join(H, 'aree-comuni.csv')))}
ORIG = ['trieste', 'udine', 'aer_trieste', 'aer_venezia', 'lubiana', 'klagenfurt', 'vienna', 'monaco', 'salisburgo']
out = []
for S in ('S3', 'S4', 'S5'):
    g = collections.defaultdict(lambda: collections.defaultdict(list))
    for t in T:
        if t['dest_id'] in A:
            g[A[t['dest_id']][S]][t['origine']].append((float(t['minuti']), t['dest_nome']))
    for area in sorted(g):
        for o in ORIG:
            v = g[area][o]; m = [x[0] for x in v]
            mn = min(v); mx = max(v)
            out.append(dict(schema=S, area=area, origine=o, n_comuni=len(v), mediana_min=round(statistics.median(m)),
                            min_min=round(mn[0]), comune_min=mn[1], max_min=round(mx[0]), comune_max=mx[1]))
with open(os.path.join(H, 'tempi-aree.csv'), 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(out[0])); w.writeheader(); w.writerows(out)
IMM = [('031009', 'Grado'), ('F-scodovacca', 'Cervignano del Friuli · Scodovacca'), ('031016', 'Ronchi dei Legionari'),
       ('F-begliano', "San Canzian d'Isonzo · Begliano"), ('030189', 'Sappada'), ('032001', 'Duino Aurisina'),
       ('032003', 'Muggia'), ('F-viaso', 'Socchieve · Viaso'), ('030049', 'Lignano Sabbiadoro')]
idx = {(t['origine'], t['dest_id']): t for t in T}
rows = []
for d, n in IMM:
    r = {'destinazione': n, 'dest_id': d}
    for o in ORIG:
        t = idx[(o, d)]; r[o] = round(float(t['minuti']))
        assert d.startswith('F-') or t['dest_nome'].split(' ')[0] in n, (d, t['dest_nome'])
    rows.append(r)
with open(os.path.join(H, 'tempi-immobili.csv'), 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
for r in rows: print(r)
for r in out:
    if r['schema'] == 'S5' and r['origine'] in ('trieste', 'udine', 'vienna', 'monaco'): print(r)
