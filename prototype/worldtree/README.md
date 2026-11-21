# WorldTree MVP

An offline-capable, engine-independent vegetation selector prototype.

## Run

```bash
python3 demo.py --lat 47.67 --lon -122.12 --habitat forest --seed 42
python3 -m unittest discover -s tests
```

The bundled regional profiles are illustrative, not authoritative global coverage. `region_id` can be supplied explicitly; geographic auto-resolution is deliberately unavailable until a licensed ecoregion polygon dataset is imported. Never silently pretend the nearest sample region is accurate.

## Next data ingestion milestone

1. Import a global terrestrial ecoregion GeoJSON/GeoPackage, retaining source attribution and licensing.
2. Create a spatial index and implement point-in-polygon resolution.
3. Build species-region relationships from regional flora references and curated occurrence evidence.
4. Add land-cover/habitat and climate constraints; separate native and planted urban pools.
5. Export compact SQLite/GeoPackage tiles for offline use and implement Unity/Unreal adapters.

## Data model

Each profile carries region metadata and habitat-specific weighted species. Species contain scientific names, common names, archetype IDs, origin, and confidence. Weights are *game sampling weights*, not observed abundances.

## v0.2: global polygon import and browser inspector

**Install:** `python -m pip install shapely` (Python 3.10+ recommended).

1. Obtain RESOLVE 2017 terrestrial ecoregion polygons from the official source, or a GeoJSON derivative with compatible license. Original shapefiles can be converted with QGIS or `ogr2ogr -f GeoJSON ecoregions.geojson Ecoregions2017.shp -t_srs EPSG:4326`.
2. Run `python import_ecoregions.py /path/to/ecoregions.geojson`. This creates an indexed, offline `ecoregions.sqlite` database. It is deliberately **not** included in the distribution, since the source could not be downloaded in this build environment.
3. Run `python inspector.py` and open `http://localhost:8765`. Enter coordinates or click the schematic coordinate grid.
4. The inspector returns the actual ecoregion name, biome, realm and identifier when imported. Tree pools remain illustrative and **are not automatically assigned** to geographic results.

Source: RESOLVE Ecoregions 2017, Dinerstein et al., BioScience 67(6), CC BY 4.0. https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017

The geographic inspector uses a schematic coordinate grid, not a real basemap. Its API is local only. Ecoregion polygons represent potential ecological context, not current forest coverage. A future release will add habitat/land-cover layers and verified ecoregion-to-species mappings.


## v0.3 geographic explorer
Run `python inspector.py`, then visit http://localhost:8765. The interactive world map uses a locally bundled Natural Earth low-resolution land geometry file (public-domain geographic data), so the basemap works without internet. Click to select a location, drag to pan, and scroll or use buttons to zoom. Seattle, Atlanta, and Tokyo presets illustrate the species pools, which remain deliberately independent of the map coordinates until ecological mappings are verified. To enable accurate ecoregion lookup, import a RESOLVE GeoJSON using `python import_ecoregions.py path/to/ecoregions.geojson`.

Map data: Natural Earth low-resolution land geometry, sourced from the pyogrio test fixtures, Natural Earth public-domain geographic dataset. This is not a biome or ecoregion map.

## v0.4: Offline biome overlay

The explorer now displays biome-colored ecoregion polygons **when an independently obtained RESOLVE GeoJSON is imported**. The official global ecoregion dataset is **not bundled**, and this release does not pretend that its example species pools are verified or mapped to every ecoregion.

```bash
python import_ecoregions.py /path/to/RESOLVE_ecoregions.geojson
python ecoregion_overlay.py
python inspector.py
```

The overlay is simplified for rendering performance. Coordinate lookup still uses the unsimplified polygon geometry stored in SQLite. The map has a toggle and a biome legend; without the optional overlay it continues to show the offline Natural Earth basemap. Verify dataset rights and attribution before redistribution. Species-to-ecoregion associations are a separate future curation step.

## v0.5: Geographic candidate tree catalogs

The inspector now calls `/api/recommend?lat=47.6062&lon=-122.3321&habitat=forest` when selecting a location. A separate `species_associations.json` contains candidate native/urban trees for three narrowly bounded seed localities: Seattle, Atlanta and Tokyo. Unlike the earlier manual example dropdown, this panel is connected to selected coordinates. Species carry scientific names, origin, archetype and ecological role, and each locality lists public botanical reference portals for subsequent validation.

**Scientific limitations:** Bounds are coarse rectangles, not verified species ranges or ecoregion joins. The catalogs are plausible preliminary regional candidate lists, not verified species-level ecological associations. Sources are starting points and have not been checked against every individual entry. No abundance, species probability, or global coverage is implied. Outside the three seed areas the system explicitly returns `no_curated_species`. A RESOLVE import still requires separately obtaining the dataset. This release does not claim to have imported it.

To develop this into an authoritative system: link taxa to accepted taxonomic IDs, add per-species supporting references and evidence dates, review candidate presence against local floras and native ranges, join accepted taxa to actual RESOLVE ecoregion IDs, and add climate/landcover/elevation constraints before producing spawn probabilities.

## v0.6: Broad provisional geographic seed catalog and evidence audit

Added 15 geographically distributed seed locality profiles, spanning parts of North America, South America, Europe, Africa, Asia and Oceania. The catalog now has 18 total localities. This is **not** continuous global coverage: outside these rectangular areas, the API returns no curated species. Every new species association is an **unverified candidate**, not a documented native-range occurrence, ecoregion membership, or abundance estimate. The source portals listed are starting points, not citations proving each association. Some boxes cross multiple habitats and may return ecologically unsuitable trees without additional filtering.

Use `python catalog_audit.py` for evidence-gap counts, or `python catalog_audit.py --csv evidence_gaps.csv` to export the review queue. The inspector serves `GET /api/catalog/stats` for these statistics. Taxonomic IDs, species-specific citations, native-range validation, and ecoregion polygon joins are deliberately marked missing until independently verified. The worldwide RESOLVE dataset remains a separate required import.

**Next scientific milestone:** ingest authoritative accepted taxon identifiers and per-species range polygons, reconcile synonyms, intersect those polygons with RESOLVE ecoregions, then review the habitat-specific associations. Avoid turning these provisional seed lists into spawn probabilities until then.
