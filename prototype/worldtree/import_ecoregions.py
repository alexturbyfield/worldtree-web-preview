import argparse
from geo import import_geojson
p=argparse.ArgumentParser(description='Import licensed RESOLVE ecoregion GeoJSON')
p.add_argument('geojson',help='Path to a GeoJSON FeatureCollection in EPSG:4326')
a=p.parse_args()
print(f'Imported {import_geojson(a.geojson)} polygon features into ecoregions.sqlite')
