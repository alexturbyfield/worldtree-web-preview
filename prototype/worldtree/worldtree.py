"""Minimal deterministic WorldTree selector, standard-library only."""
from __future__ import annotations
import json
import random
from pathlib import Path

DATA_PATH = Path(__file__).with_name('profiles.json')


def load_profiles(path=DATA_PATH):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def select_trees(region_id: str, habitat='forest', count=12, seed=0, profiles=None):
    if count < 0:
        raise ValueError('count must be nonnegative')
    profiles = profiles if profiles is not None else load_profiles()
    region = profiles['regions'].get(region_id)
    if region is None:
        raise ValueError(f'Unknown region: {region_id}')
    pool = region['habitats'].get(habitat)
    if not pool:
        raise ValueError(f'No species pool for habitat: {habitat}')
    weights = [item['weight'] for item in pool]
    if any(w < 0 for w in weights) or sum(weights) <= 0:
        raise ValueError('Invalid species weights')
    rng = random.Random(seed)
    return {'region_id': region_id, 'habitat': habitat, 'seed': seed,
            'data_status': 'illustrative', 'trees': rng.choices(pool, weights=weights, k=count)}


def resolve_region(lat: float, lon: float):
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError('Invalid coordinates')
    raise NotImplementedError('Import authoritative ecoregion polygons before coordinate lookup')
