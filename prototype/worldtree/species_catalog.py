"""Conservative geographic species recommendations with explicit evidence limits."""
import json
from pathlib import Path

ROOT = Path(__file__).parent
CATALOG = ROOT / 'species_associations.json'


def load_catalog(path=CATALOG):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def recommend(lat, lon, habitat='forest', geographic=None, catalog=None):
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError('Coordinates out of range')
    if habitat not in ('forest', 'urban'):
        raise ValueError('Habitat must be forest or urban')
    catalog = catalog or load_catalog()
    geo = geographic or {'status': 'dataset_not_installed'}
    matches = []
    for region in catalog['locality_profiles']:
        b = region['bounds']
        if b['south'] <= lat <= b['north'] and b['west'] <= lon <= b['east']:
            matches.append(region)
    # Geographic bounding boxes are only candidate areas, never verified ecoregion matching.
    if matches:
        region = min(matches, key=lambda r: (r['bounds']['north']-r['bounds']['south'])*(r['bounds']['east']-r['bounds']['west']))
        species = region['habitats'].get(habitat, [])
        if species:
            return {'status':'provisional_locality_match','profile_id':region['id'],
                    'profile_name':region['name'],'habitat':habitat,
                    'confidence':'low','method':'coarse_coordinate_bbox',
                    'message':'Candidate local species only. Bounding-box lookup does not verify actual habitat, abundance, elevation, or ecoregion.',
                    'geography':geo,'species':species,'sources':region['sources']}
    biome = geo.get('biome', '') if geo.get('status') == 'resolved' else ''
    return {'status':'no_curated_species','habitat':habitat,'geography':geo,
            'biome':biome,'species':[], 'confidence':'none',
            'message':'No locality-specific species catalog covers this point. Do not substitute biome archetypes for native species.'}
