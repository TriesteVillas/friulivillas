# Mosaico Copernicus GLO-90 -> ritaglio FVG in Web Mercator -> quote f32 + Terrarium WebP + hillshade chiaro.
import glob, json, math, numpy as np, tifffile
from PIL import Image
BB = dict(west=12.30, east=13.95, south=45.55, north=46.65)
OUT_W = 1600
D = "/Users/martino/.tsv-work/FV-RIFACIMENTO/sv/"
mos = np.zeros((2400, 2400), np.float32)  # 12-14E, 45-47N, origine in alto a sinistra (47N,12E)
for f in glob.glob(D + "dem/*.tif"):
    la = int(f.split("_N")[1][:2]); lo = int(f.split("_E0")[1][:2])
    a = tifffile.imread(f).astype(np.float32)
    r0 = (47 - (la + 1)) * 1200; c0 = (lo - 12) * 1200
    mos[r0:r0+1200, c0:c0+1200] = a
res = 1/1200
N = 2**12 * 256
lon2x = lambda lon: (lon + 180) / 360 * N
lat2y = lambda lat: (1 - math.log(math.tan(math.radians(lat)) + 1/math.cos(math.radians(lat))) / math.pi) / 2 * N
px0, px1, py0, py1 = lon2x(BB["west"]), lon2x(BB["east"]), lat2y(BB["north"]), lat2y(BB["south"])
OUT_H = round(OUT_W * (py1 - py0) / (px1 - px0))
xs = px0 + (np.arange(OUT_W) + 0.5) / OUT_W * (px1 - px0)
ys = py0 + (np.arange(OUT_H) + 0.5) / OUT_H * (py1 - py0)
lon = xs / N * 360 - 180
lat = np.degrees(np.arctan(np.sinh(np.pi - 2 * np.pi * ys / N)))
# campionamento bilineare (pixel GLO: centro = 12 + (c+0.5)*res ... il tiepoint è l'angolo)
cf = (lon - 12) / res - 0.5; rf = (47 - lat) / res - 0.5
C, R = np.meshgrid(cf, rf)
c0 = np.floor(C).astype(int); r0 = np.floor(R).astype(int); fx = C - c0; fy = R - r0
g = lambda r, c: mos[np.clip(r, 0, 2399), np.clip(c, 0, 2399)]
z = (g(r0,c0)*(1-fx)*(1-fy) + g(r0,c0+1)*fx*(1-fy) + g(r0+1,c0)*(1-fx)*fy + g(r0+1,c0+1)*fx*fy).astype(np.float32)
mpp = 40075016.686 * math.cos(math.radians((BB["north"]+BB["south"])/2)) / N * (px1-px0)/OUT_W
z.tofile(D + "out/fvg-f32.bin")
v = np.clip(np.round(z) + 32768, 0, 65535).astype(np.uint32)
rgb = np.stack([(v >> 8).astype(np.uint8), (v & 255).astype(np.uint8), np.zeros_like(v, np.uint8)], -1)
Image.fromarray(rgb).save(D + "out/fvg-terrain.webp", lossless=True, method=6)
meta = dict(bbox=BB, width=OUT_W, height=OUT_H, metersPerPixel=mpp, minElevation=float(z.min()), maxElevation=float(z.max()),
  mercator=dict(px0=px0, py0=py0, px1=px1, py1=py1, z=12),
  source="Copernicus DEM GLO-90 (DSM), AWS Open Data copernicus-dem-90m", licence="© DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved")
json.dump(meta, open(D + "out/fvg-terrain.json", "w"), indent=1)
print(meta)
# --- hillshade chiaro (carta in luce): Lambert multidirezionale + tinta ipsometrica + mare/laguna
dy, dx = np.gradient(z, mpp)
ex = 1.6
def shade(az, alt):
    az, alt = math.radians(az), math.radians(alt)
    sl = np.arctan(ex * np.hypot(dx, dy)); asp = np.arctan2(-dx, dy)
    return np.sin(alt)*np.cos(sl) + np.cos(alt)*np.sin(sl)*np.cos(az - asp)
hs = 0.6*shade(315, 40) + 0.25*shade(270, 45) + 0.15*shade(360, 50)
hs = np.clip(hs, 0, 1)
sea = z <= 0.5
# rampa ipsometrica (carta chiara): pianura sabbia chiara -> colline salvia -> montagna pietra -> cime bianche
stops = [(0,(236,231,216)),(60,(232,226,206)),(200,(214,218,196)),(600,(196,203,180)),(1200,(200,196,182)),(2000,(222,219,212)),(3000,(246,245,242))]
hz = np.clip(z, 0, 3000); col = np.zeros(z.shape + (3,), np.float32)
for (h0,c0_),(h1,c1_) in zip(stops, stops[1:]):
    m = (hz >= h0) & (hz <= h1); t = ((hz - h0) / (h1 - h0))[m][:, None]
    col[m] = np.array(c0_) * (1 - t) + np.array(c1_) * t
k = (0.55 + 0.6 * hs)[..., None]
img = np.clip(col * k, 0, 255)
img[sea] = (203, 219, 222)  # mare/laguna petrolio chiarissimo
Image.fromarray(img.astype(np.uint8)).save(D + "out/fvg-rilievo-chiaro.webp", quality=72, method=6)
Image.fromarray(img.astype(np.uint8)).resize((800, round(800*OUT_H/OUT_W)), Image.LANCZOS).save(D + "out/fvg-rilievo-chiaro-800.webp", quality=70, method=6)
# solo ombra in scala di grigi (da usare come strato multiply su colore CSS)
Image.fromarray((np.where(sea, 255, 120 + 135*hs)).astype(np.uint8)).save(D + "out/fvg-hillshade-grigio.webp", quality=60, method=6)
