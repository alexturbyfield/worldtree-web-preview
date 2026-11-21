import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from species_catalog import recommend
class CatalogTests(unittest.TestCase):
 def test_seattle_forest(self):
  d=recommend(47.6062,-122.3321)
  self.assertEqual(d['status'],'provisional_locality_match')
  self.assertTrue(any(x['id']=='pseudotsuga_menziesii' for x in d['species']))
 def test_tokyo_urban(self):
  d=recommend(35.6762,139.6503,'urban')
  self.assertTrue(any(x['id']=='ginkgo_biloba' for x in d['species']))
 def test_no_false_global_species(self):
  self.assertEqual(recommend(-15,-60)['species'],[])
 def test_invalid(self):
  with self.assertRaises(ValueError):recommend(100,0)
if __name__=='__main__':unittest.main()
