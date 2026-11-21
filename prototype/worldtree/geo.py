"""Import GeoJSON ecoregions into an offline SQLite RTree-backed coordinate resolver."""
import json, sqlite3
from pathlib import Path
from shapely.geometry import shape, Point
from shapely import wkb
from shapely.prepared import prep

DB = Path(__file__).with_name('ecoregions.sqlite')

def import_geojson(source, target=DB):
    data=json.loads(Path(source).read_text(encoding='utf-8'))
    if data.get('type') != 'FeatureCollection': raise ValueError('Expected GeoJSON FeatureCollection')
    conn=sqlite3.connect(target)
    try:
        conn.executescript('''DROP TABLE IF EXISTS regions; DROP TABLE IF EXISTS bounds;
        CREATE TABLE regions (id INTEGER PRIMARY KEY, eco_id TEXT, name TEXT, biome TEXT, realm TEXT, geometry BLOB);
        CREATE VIRTUAL TABLE bounds USING rtree(id,minx,maxx,miny,maxy);''')
        n=0
        for f in data['features']:
            if not f.get('geometry'):continue
            p=f.get('properties') or {}; g=shape(f['geometry'])
            if g.is_empty or g.geom_type not in ('Polygon','MultiPolygon'):continue
            n+=1
            def field(*names):
                return next((p[k] for k in names if p.get(k) is not None),'')
            conn.execute('INSERT INTO regions VALUES (?,?,?,?,?,?)',(n,str(field('ECO_ID','eco_id','ecoregion_id')),str(field('ECO_NAME','eco_name','name')),str(field('BIOME_NAME','biome','BIOME')),str(field('REALM','realm')),sqlite3.Binary(g.wkb)))
            minx,miny,maxx,maxy=g.bounds
            conn.execute('INSERT INTO bounds VALUES (?,?,?,?,?)',(n,minx,maxx,miny,maxy))
        conn.commit()
        return n
    finally:conn.close()

def lookup(lat,lon,db=DB):
    if not (-90<=lat<=90 and -180<=lon<=180):raise ValueError('Coordinates out of range')
    if not Path(db).exists():return {'status':'dataset_not_installed','message':'Import RESOLVE GeoJSON to enable worldwide lookup.'}
    conn=sqlite3.connect(f'file:{Path(db).resolve()}?mode=ro',uri=True)
    try:
        rows=conn.execute('''SELECT r.eco_id,r.name,r.biome,r.realm,r.geometry FROM bounds b JOIN regions r ON r.id=b.id
        WHERE b.minx<=? AND b.maxx>=? AND b.miny<=? AND b.maxy>=?''',(lon,lon,lat,lat)).fetchall()
        point=Point(lon,lat)
        for eco_id,name,biome,realm,geom in rows:
            if wkb.loads(geom).covers(point):return {'status':'resolved','eco_id':eco_id,'name':name,'biome':biome,'realm':realm,'species_status':'not_curated'}
        return {'status':'outside_dataset','message':'No terrestrial ecoregion polygon covers this point.'}
    finally:conn.close()
