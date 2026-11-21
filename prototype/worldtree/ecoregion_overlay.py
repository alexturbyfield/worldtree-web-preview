"""Export simplified ecoregion polygons for an offline SVG inspector.
Requires a locally imported, properly licensed RESOLVE GeoJSON source.
"""
import argparse, json, sqlite3
from pathlib import Path
from shapely import wkb
from shapely.geometry import mapping
from shapely.ops import transform

ROOT=Path(__file__).parent

def export(db=ROOT/'ecoregions.sqlite', destination=ROOT/'ecoregions_map.geojson', tolerance=0.12):
    if not Path(db).is_file():
        raise FileNotFoundError('Import the RESOLVE ecoregion GeoJSON first using import_ecoregions.py')
    conn=sqlite3.connect(f'file:{Path(db).resolve()}?mode=ro',uri=True)
    features=[]
    try:
        for eco_id,name,biome,realm,blob in conn.execute('SELECT eco_id,name,biome,realm,geometry FROM regions'):
            geom=wkb.loads(blob).simplify(tolerance,preserve_topology=True)
            if geom.is_empty: continue
            features.append({'type':'Feature','properties':{'eco_id':eco_id,'name':name,'biome':biome,'realm':realm},'geometry':mapping(geom)})
    finally: conn.close()
    Path(destination).write_text(json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')),encoding='utf8')
    return len(features)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--tolerance',type=float,default=0.12);p.add_argument('--output',default=str(ROOT/'ecoregions_map.geojson'));a=p.parse_args()
    print('Exported',export(destination=a.output,tolerance=a.tolerance),'ecoregion polygons')
