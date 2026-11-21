import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from catalog_audit import audit
from species_catalog import recommend
class AuditTests(unittest.TestCase):
 def test_expanded_catalog(self):
  s=audit();self.assertGreaterEqual(s['profiles'],18);self.assertGreaterEqual(s['unique_taxa'],50)
 def test_no_claims_of_verified_ranges(self):
  s=audit();self.assertEqual(s['verified_ranges'],0);self.assertEqual(s['verified_ecoregions'],0)
 def test_borneo_candidate(self):
  r=recommend(2,114);self.assertEqual(r['status'],'provisional_locality_match');self.assertTrue(any('Shorea' in t['scientific_name'] for t in r['species']))
 def test_outside_coverage(self):
  self.assertEqual(recommend(-15,-60)['status'],'no_curated_species')
if __name__=='__main__':unittest.main()
