import unittest,tempfile,json
from pathlib import Path
from geo import import_geojson,lookup
class GeoTests(unittest.TestCase):
 def test_polygon(self):
  with tempfile.TemporaryDirectory() as d:
   path=Path(d)/'tiny.geojson';db=Path(d)/'tiny.sqlite'
   path.write_text(json.dumps({'type':'FeatureCollection','features':[{'type':'Feature','properties':{'ECO_ID':123,'ECO_NAME':'Test region','BIOME_NAME':'Test biome','REALM':'Test realm'},'geometry':{'type':'Polygon','coordinates':[[[0,0],[2,0],[2,2],[0,2],[0,0]]]}}]}))
   self.assertEqual(import_geojson(path,db),1)
   self.assertEqual(lookup(1,1,db)['name'],'Test region')
   self.assertEqual(lookup(3,3,db)['status'],'outside_dataset')
 def test_missing_data(self):
  self.assertEqual(lookup(1,1,'/does/not/exist.sqlite')['status'],'dataset_not_installed')
 def test_bad_coordinates(self):
  with self.assertRaises(ValueError):lookup(91,0)
if __name__=='__main__':unittest.main()
