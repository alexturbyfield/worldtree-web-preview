"""Reproducibly vendor RESOLVE 2017; original vertices for lookup, simplified display."""
from pathlib import Path
import json, zipfile, urllib.request, hashlib, gzip
import shapefile
from shapely.geometry import shape, mapping, box
from shapely import make_valid, STRtree

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://storage.googleapis.com/teow2016/Ecoregions2017.zip'
archive = ROOT / 'data/Ecoregions2017.zip'
archive.parent.mkdir(exist_ok=True)
if not archive.exists(): urllib.request.urlretrieve(URL, archive)
raw = ROOT / 'data/raw'
with zipfile.ZipFile(archive) as z: z.extractall(raw)
source = next(raw.rglob('*.shp'))
reader = shapefile.Reader(str(source), encoding='cp1252')
full, display, geometries, repaired = [], [], [], []
def display_coords(value):
    return [display_coords(v) for v in value] if isinstance(value,(list,tuple)) else round(value,4)
for record in reader.iterShapeRecords():
    p = record.record.as_dict()
    geom = shape(record.shape.__geo_interface__)
    if geom.is_empty: continue
    properties = {k: p.get(k) for k in ['ECO_ID','ECO_NAME','BIOME_NUM','BIOME_NAME','REALM','COLOR_BIO','LICENSE']}
    if not geom.is_valid:
        repaired.append(properties['ECO_ID'])
        geom = make_valid(geom)
    feature = {'type':'Feature','properties':properties}
    full.append(feature)
    geometries.append(geom)
    render_geom=mapping(geom.simplify(0.035,preserve_topology=True).simplify(0.035,preserve_topology=False))
    render_geom['coordinates']=display_coords(render_geom['coordinates'])
    display.append({**feature,'geometry':render_geom})
target = ROOT / 'public/data/resolve-2017'
target.mkdir(parents=True,exist_ok=True)
def write(name, features):
    blob=json.dumps({'type':'FeatureCollection','features':features},separators=(',',':'),ensure_ascii=False).encode()
    (target/name).write_bytes(blob)
    return hashlib.sha256(blob).hexdigest()
display_hash=write('display.geojson',display)
tree=STRtree(geometries)
tiles={}
(target/'tiles').mkdir(exist_ok=True)
for y in range(18):
    for x in range(36):
        area=box(-180+x*10,-90+y*10,-170+x*10,-80+y*10)
        features=[]
        for i in sorted(tree.query(area)):
            clipped=geometries[i].intersection(area)
            # Ignore line/point contacts; neighboring tiles contain the actual area.
            if clipped.is_empty or clipped.area==0: continue
            if clipped.geom_type=='GeometryCollection':
                from shapely.ops import unary_union
                clipped=unary_union([g for g in clipped.geoms if g.geom_type in ('Polygon','MultiPolygon')])
            features.append({**full[i],'geometry':mapping(clipped),'bbox':list(clipped.bounds)})
        if not features: continue
        blob=json.dumps({'type':'FeatureCollection','features':features},separators=(',',':'),ensure_ascii=False).encode()
        path=target/'tiles'/f'{x}-{y}.geojson.gz'
        with gzip.GzipFile(filename=str(path),mode='wb',mtime=0) as f: f.write(blob)
        tiles[f'{x}-{y}']={'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    print(f'Tiled latitude band {y+1}/18',flush=True)
manifest={'dataset':'RESOLVE Ecoregions 2017','version':'2017','source':URL,'source_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'license':'CC-BY-4.0','license_url':'https://creativecommons.org/licenses/by/4.0/','attribution':'Dinerstein, E. et al. (2017). An Ecoregion-Based Approach to Protecting Half the Terrestrial Realm. BioScience 67(6):534–545. Ecoregions 2017 © RESOLVE.','citation':'https://doi.org/10.1093/biosci/bix014','feature_count':len(full),'tiles':tiles,'display_sha256':display_hash,'display_tolerance_degrees':0.035,'lookup':'Source vertices in WGS84 retained within 10-degree clipped tiles; no simplification. Source geometry is a dated ecological model, not survey precision.','repaired_feature_ids':repaired,'modifications':'CP1252 decoding; selected attributes; GeoJSON conversion; invalid geometries repaired with Shapely make_valid; clipped gzip lookup tiles; display simplified twice at .035 degrees (second pass removes tiny islands), rounded to four decimals. Includes source Rock and Ice.'}
(target/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(f'Imported {len(full)} regions, {len(tiles)} lookup tiles; {len(repaired)} topology repairs.')
