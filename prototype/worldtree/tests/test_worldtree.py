import unittest
from worldtree import select_trees, resolve_region

class WorldTreeTests(unittest.TestCase):
    def test_deterministic(self):
        a = select_trees('pnw_lowland_example', count=20, seed=123)
        self.assertEqual(a, select_trees('pnw_lowland_example', count=20, seed=123))
        self.assertEqual(len(a['trees']), 20)
    def test_unknown_region(self):
        with self.assertRaises(ValueError):
            select_trees('unknown')
    def test_coordinate_not_faked(self):
        with self.assertRaises(NotImplementedError):
            resolve_region(47.67, -122.12)
    def test_bad_coordinate(self):
        with self.assertRaises(ValueError):
            resolve_region(100, 0)

if __name__ == '__main__': unittest.main()
