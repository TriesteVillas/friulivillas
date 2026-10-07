#!/bin/bash
# GeoJSON semplificati (WGS84) dai confini ISTAT generalizzati 01/01/2026 (CC BY 4.0).
# Semplificazione topologica con mapshaper (archi condivisi: niente buchi fra comuni/aree).
# Prerequisiti: classifica.py già eseguito (aree-comuni.csv).
set -euo pipefail
cd "$(dirname "$0")"
SHP=raw/limiti2026/Com01012026_g/Com01012026_g_WGS84.shp
OUT=geojson; mkdir -p $OUT
MS="npx mapshaper"
PCT=${PCT:-25%}   # quota di vertici mantenuti (Visvalingam pesato)

# comuni FVG + attributi area, semplificati
$MS -i $SHP -filter 'COD_REG==6' \
  -join aree-comuni.csv keys=PRO_COM_T,codice_istat string-fields=codice_istat \
  -proj wgs84 -simplify $PCT weighted keep-shapes \
  -filter-fields PRO_COM_T,COMUNE,S3,S4,S5,regola \
  -o $OUT/comuni-fvg.geojson precision=0.0001 format=geojson

# contorno regione (dissolve dei comuni semplificati: stesso tracciato delle aree)
$MS -i $OUT/comuni-fvg.geojson -dissolve -each 'nome="Friuli-Venezia Giulia"' \
  -o $OUT/regione-fvg.geojson precision=0.0001

# aree per schema
for S in S3 S4 S5; do
  $MS -i $OUT/comuni-fvg.geojson -dissolve $S calc='n_comuni=count()' -rename-fields area=$S \
    -o $OUT/aree-$S.geojson precision=0.0001
done
ls -l $OUT
