import argparse
import json
from worldtree import select_trees, resolve_region

parser = argparse.ArgumentParser()
parser.add_argument('--lat', type=float)
parser.add_argument('--lon', type=float)
parser.add_argument('--region', default=None)
parser.add_argument('--habitat', default='forest')
parser.add_argument('--seed', type=int, default=42)
parser.add_argument('--count', type=int, default=12)
args = parser.parse_args()
if args.region is None:
    if args.lat is None or args.lon is None:
        parser.error('Provide --region; coordinate resolution needs an imported ecoregion dataset')
    region = resolve_region(args.lat, args.lon)
else:
    region = args.region
print(json.dumps(select_trees(region, args.habitat, args.count, args.seed), indent=2))
