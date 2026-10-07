#!/usr/bin/env python3
"""Assegna ogni comune FVG a un'area, in tre schemi, con regole esplicite e riproducibili.

Regole base (applicate in quest'ordine; la prima che vale decide):
  R1 MONTAGNA        ISTAT zona altimetrica = 1 «montagna interna»                        (SITUAS rep. 73)
  R2 CARSO_TRIESTE   ambito di paesaggio PPR dominante = «AP 11 Carso e costiera orientale» (PPR 2018, ettari)
  R3 COSTA_LAGUNA    ambito PPR dominante = «AP 12 Laguna e costa»  OPPURE  ISTAT comune litoraneo = 1
  R4 COLLINE         ISTAT zona altimetrica = 3 «collina interna»  OPPURE  ambito PPR dominante
                     «AP 5 Anfiteatro morenico» / «AP 6 Valli orientali e Collio»
  R5 PIANURA         tutti gli altri

Schemi:
  S3 (3 aree)  MARE = R2+R3 · COLLINE E PIANURA = R4+R5 · MONTAGNA = R1
  S4 (4 aree, raccomandato) COSTA E LAGUNA = R3 · CARSO E TRIESTE = R2 · COLLINE E PIANURA = R4+R5 · MONTAGNA = R1
  S5 (5 aree)  COSTA E LAGUNA = R3 · CARSO E TRIESTE = R2 · COLLINE = R4 · PIANURA = R5 · MONTAGNA = R1
Output: aree-comuni.csv
"""
import csv, os, collections
from attributi import carica

H = os.path.dirname(os.path.abspath(__file__))

S3 = {'R1': 'montagna', 'R2': 'mare', 'R3': 'mare', 'R4': 'colline-pianura', 'R5': 'colline-pianura'}
S4 = {'R1': 'montagna', 'R2': 'carso-trieste', 'R3': 'costa-laguna', 'R4': 'colline-pianura', 'R5': 'colline-pianura'}
S5 = {'R1': 'montagna', 'R2': 'carso-trieste', 'R3': 'costa-laguna', 'R4': 'colline', 'R5': 'pianura'}


def regola(r):
    a = r['ppr_ambito']
    if r['zona_altimetrica_cod'] == '1':
        return 'R1'
    if a.startswith('AP 11 '):
        return 'R2'
    if a.startswith('AP 12 ') or r['litoraneo'] == '1':
        return 'R3'
    if r['zona_altimetrica_cod'] == '3' or a.startswith('AP 5 ') or a.startswith('AP 6 '):
        return 'R4'
    return 'R5'


def main():
    C = carica()
    rows = []
    for c in sorted(C, key=lambda k: C[k]['codice_istat']):
        r = C[c]; g = regola(r)
        rows.append(dict(codice_istat=r['codice_istat'], comune=c, uts=r['uts_ex_provincia'],
                         zona_altimetrica=r['zona_altimetrica'], litoraneo=r['litoraneo'],
                         ppr_ambito=r['ppr_ambito'] or '(assente nel PPR 2018)', ppr_quota=r['ppr_quota_dominante'],
                         ppr_altri=r['ppr_altri'], lr33_montano=r['lr33_montano'], lr33_fascia=r['lr33_fascia'],
                         comunita=r['comunita'], doc=r['doc'], altitudine_municipio_m=r['altitudine_municipio_m'],
                         regola=g, S3=S3[g], S4=S4[g], S5=S5[g]))
    with open(os.path.join(H, 'aree-comuni.csv'), 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
    for s in ('S3', 'S4', 'S5'):
        cnt = collections.Counter(x[s] for x in rows)
        print(s, dict(cnt), 'tot', sum(cnt.values()))
    print('regole', dict(collections.Counter(x['regola'] for x in rows)))


if __name__ == '__main__':
    main()
