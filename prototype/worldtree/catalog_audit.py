"""Report evidence gaps and provisional geographic coverage. No network needed."""
import csv, json, argparse
from collections import Counter
from pathlib import Path
from species_catalog import load_catalog

def audit(catalog=None):
    data=catalog or load_catalog(); rows=[]
    for region in data['locality_profiles']:
        for habitat,trees in region['habitats'].items():
            for tree in trees:
                rows.append({'profile_id':region['id'],'habitat':habitat,'scientific_name':tree['scientific_name'],
                             'archetype':tree['archetype'],'confidence':tree.get('confidence','unknown'),
                             'taxon_id':tree.get('taxon_id',''),
                             'species_evidence_url':tree.get('species_evidence_url',''),
                             'range_verified':bool(tree.get('range_verified',False)),
                             'ecoregion_verified':bool(tree.get('ecoregion_verified',False))})
    return {'profiles':len(data['locality_profiles']),'entries':len(rows),
            'unique_taxa':len({r['scientific_name'] for r in rows}),
            'habitats':dict(Counter(r['habitat'] for r in rows)),
            'verified_ranges':sum(r['range_verified'] for r in rows),
            'verified_ecoregions':sum(r['ecoregion_verified'] for r in rows),
            'missing_species_evidence':sum(not r['species_evidence_url'] for r in rows),
            'missing_taxon_ids':sum(not r['taxon_id'] for r in rows),
            'rows':rows}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--csv',type=Path);args=parser.parse_args()
    result=audit()
    if args.csv:
        with args.csv.open('w',newline='',encoding='utf-8') as f:
            writer=csv.DictWriter(f,fieldnames=result['rows'][0].keys());writer.writeheader();writer.writerows(result['rows'])
    print(json.dumps({k:v for k,v in result.items() if k!='rows'},indent=2))
