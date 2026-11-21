from pathlib import Path
import unittest,sys
root=Path(__file__).resolve().parents[1]/'prototype/worldtree'
sys.path.insert(0,str(root))
result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.discover(str(root/'tests')))
sys.exit(not result.wasSuccessful())
