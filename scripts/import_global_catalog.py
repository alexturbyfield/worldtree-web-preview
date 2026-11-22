"""Import a reproducible, geographically balanced 400-taxon WCVP subset.

No occurrences are converted into native ranges, and no ecoregion memberships
are inferred. Original v0.6 locality JSON is never modified.
"""
from pathlib import Path
import csv, io, json, zipfile, urllib.request, hashlib, collections
from shapely.geometry import shape, mapping
from shapely import make_valid
import shapefile

ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'data/sources'; RAW.mkdir(exist_ok=True,parents=True)
OUT=ROOT/'data/global'; OUT.mkdir(exist_ok=True,parents=True)
PUBLIC=ROOT/'public/data/v08'; PUBLIC.mkdir(exist_ok=True,parents=True)
WCVP='https://sftp.kew.org/pub/data-repositories/WCVP/wcvp.zip'
TDWG='https://raw.githubusercontent.com/tdwg/wgsrpd/f68afd99aa94adadaa3e0328e4aadda75ecc4215/geojson/level3.geojson'
def download(url,path):
    if not path.exists(): urllib.request.urlretrieve(url,path)
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def write(path,data): path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
download(WCVP,RAW/'wcvp.zip');download(TDWG,RAW/'tdwg-level3.geojson')
assert digest(RAW/'wcvp.zip')=='d32ea2b3a85e489b14e83bcc9eae7274532e1d113753f7be290d4b2dfde573fa', 'The Kew latest download changed. Obtain the pinned WCVP v16 archive from DOI 10.34885/egs6-cp24; do not relabel a newer release as v16.'
assert digest(RAW/'tdwg-level3.geojson')=='c172bcf6aba20e19477adc60aebf0023068f0175dca8480f0760b090dcf64840', 'TDWG input differs from the pinned source commit.'
legacy=json.loads((ROOT/'data/species_associations.json').read_text(encoding='utf-8'))
original={t['scientific_name']:t for r in legacy['locality_profiles'] for trees in r['habitats'].values() for t in trees}
priority=set(original)|set('''Betula pubescens|Adansonia grandidieri|Adansonia za|Adansonia rubrostipa|Ravenala madagascariensis|Didierea madagascariensis|Alluaudia procera|Dracaena cinnabari|Boswellia sacra|Phoenix dactylifera|Vachellia tortilis|Vachellia erioloba|Balanites aegyptiaca|Cedrus atlantica|Cedrus libani|Argania spinosa|Pinus canariensis|Juniperus procera|Podocarpus latifolius|Milicia excelsa|Entandrophragma cylindricum|Gilbertiodendron dewevrei|Pterocarpus angolensis|Ceiba pentandra|Bertholletia excelsa|Hevea brasiliensis|Theobroma cacao|Swietenia macrophylla|Tabebuia rosea|Araucaria angustifolia|Fitzroya cupressoides|Nothofagus antarctica|Pinus palustris|Pinus ponderosa|Quercus virginiana|Sequoia sempervirens|Sequoiadendron giganteum|Picea glauca|Betula papyrifera|Acer saccharum|Taxodium distichum|Rhizophora mangle|Rhizophora mucronata|Avicennia marina|Rhizophora stylosa|Picea obovata|Larix gmelinii|Larix sibirica|Pinus sibirica|Populus euphratica|Haloxylon ammodendron|Prosopis cineraria|Abies spectabilis|Pinus roxburghii|Shorea robusta|Tectona grandis|Ficus religiosa|Ficus benghalensis|Azadirachta indica|Dipterocarpus alatus|Dipterocarpus grandiflorus|Dryobalanops aromatica|Eusideroxylon zwageri|Rubroshorea leprosula|Cryptomeria japonica|Chamaecyparis obtusa|Fagus crenata|Cinnamomum camphora|Magnolia grandiflora|Acer palmatum|Metrosideros polymorpha|Acacia koa|Pritchardia pacifica|Pandanus tectorius|Cocos nucifera|Artocarpus altilis|Araucaria heterophylla|Agathis lanceolata|Santalum austrocaledonicum|Dacrydium cupressinum|Nothofagus fusca|Metrosideros excelsa|Eucalyptus regnans|Eucalyptus marginata|Eucalyptus camaldulensis|Corymbia calophylla|Acacia aneura|Adansonia gregorii|Brachychiton rupestris|Cecropia peltata|Roystonea regia|Pinus occidentalis|Swietenia mahagoni|Guaiacum officinale'''.split('|'))
archive=zipfile.ZipFile(RAW/'wcvp.zip')
accepted={}; aliases={}; priority_rows={}
for r in csv.DictReader(io.TextIOWrapper(archive.open('wcvp_names.csv'),encoding='utf-8-sig'),delimiter='|',quoting=csv.QUOTE_NONE):
    if r['taxon_name'] in priority:
        # Homonyms exist: Pinus taeda L. is accepted; P. taeda Blanco is illegitimate.
        rank={'Accepted':0,'Synonym':1}
        previous=priority_rows.get(r['taxon_name'])
        if previous is None or rank.get(r['taxon_status'],9)<rank.get(previous['taxon_status'],9):
            priority_rows[r['taxon_name']]=r
            if r['accepted_plant_name_id'] and r['taxon_status'] in rank: aliases[r['taxon_name']]=r['accepted_plant_name_id']
    if r['taxon_rank']=='Species' and r['taxon_status']=='Accepted' and 'tree' in r['lifeform_description'].lower() and not r['species_hybrid'] and r['powo_id']:
        accepted[r['plant_name_id']]=r
distributions=collections.defaultdict(list); areas={}
for r in csv.DictReader(io.TextIOWrapper(archive.open('wcvp_distribution.csv'),encoding='utf-8-sig'),delimiter='|',quoting=csv.QUOTE_NONE):
    areas[r['area_code_l3']]={'code':r['area_code_l3'],'name':r['area'],'region':r['region'],'continent':r['continent'],'regionCode':r['region_code_l2']}
    if r['plant_name_id'] in accepted and r['introduced']=='0' and r['extinct']=='0' and r['location_doubtful']=='0':
        distributions[r['plant_name_id']].append(r['area_code_l3'])
eligible={k:r for k,r in accepted.items() if distributions[k]}
selected={k for k in aliases.values() if k in eligible}
# Round-robin over botanical regions, then native areas, then distinct genera.
# A deterministic coverage sample, not a claim of ecological dominance.
by_region=collections.defaultdict(list)
for k,r in eligible.items():
    for region in {areas[c]['regionCode'] for c in distributions[k]}:
        by_region[region].append(k)
for region in by_region:
    by_region[region].sort(key=lambda k:(len(distributions[k]),hashlib.sha256(eligible[k]['taxon_name'].encode()).hexdigest()))
seen_genera={eligible[k]['genus'] for k in selected}
while len(selected)<400:
    progress=False
    for region in sorted(by_region):
        pool=by_region[region]
        choice=next((k for k in pool if k not in selected and eligible[k]['genus'] not in seen_genera),None)
        if choice is None: choice=next((k for k in pool if k not in selected),None)
        if choice:
            selected.add(choice);seen_genera.add(eligible[choice]['genus']);progress=True
        if len(selected)==400: break
    if not progress:break
# Add the missing Batch 1 taxa without replacing any of the original 400 records.
selected.update(k for k,r in eligible.items() if r['taxon_name'] in {'Populus tremuloides','Salix babylonica'})
taxa=[]
for k in sorted(selected,key=lambda k:eligible[k]['taxon_name']):
    r=eligible[k]; old=[original[n] for n,key in aliases.items() if key==k and n in original]
    url='https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:'+r['powo_id']
    archetype=old[0]['archetype'] if old else ('palm' if r['family']=='Arecaceae' else 'conifer' if r['family'] in ('Pinaceae','Cupressaceae','Podocarpaceae','Araucariaceae','Taxaceae') else 'broadleaf_tree')
    taxa.append({'id':'wcvp:'+k,'scientificName':r['taxon_name'],'authors':r['taxon_authors'],'accepted':True,'family':r['family'],'genus':r['genus'],'ipniId':r['ipni_id'] or None,'powoId':r['powo_id'],'commonNames':sorted({t['common_name'] for t in old}),'commonNameEvidence':'prototype_provisional' if old else 'not_imported','synonyms':sorted(n for n,key in aliases.items() if key==k and n!=r['taxon_name']),'nativeRange':r['geographic_area'],'nativeAreaCodes':sorted(set(distributions[k])),'growthForm':r['lifeform_description'],'climate':r['climate_description'],'leafHabit':None,'matureHeightM':None,'role':'regional_native_candidate','archetype':archetype,'archetypeEvidence':'procedural_design_only','sourceId':'wcvp-16','evidenceUrl':url,'taxonomyConfidence':'source_accepted','rangeConfidence':'documented_botanical_country','ecoregionVerified':False,'habitatVerified':False})
for t in taxa:
    t.update({'taxonId':t['id'],'nativeRegions':t['nativeAreaCodes'],'ecoregionIds':[],'biomeIds':[],'habitats':[],'assetArchetype':t['archetype'],'evergreen':None,'ecologicalRole':t['role'],'confidence':'regional','sources':[t['evidenceUrl'],'https://doi.org/10.34885/egs6-cp24']})
write(OUT/'taxa.json',taxa)
write(OUT/'areas.json',sorted(areas.values(),key=lambda a:a['code']))
write(OUT/'legacy-links.json',{n:('wcvp:'+aliases[n] if aliases.get(n) in selected else None) for n in sorted(original)})
if not (OUT/'ecoregion-associations.json').exists(): write(OUT/'ecoregion-associations.json',[])
tdwg=json.loads((RAW/'tdwg-level3.geojson').read_text())
for f in tdwg['features']:
    f['bbox']=list(shape(f['geometry']).bounds)
# Keep the source coordinates; boundary mismatches with RESOLVE remain explicit.
write(PUBLIC/'botanical-countries.geojson',tdwg)
display=json.loads((ROOT/'public/data/resolve-2017/display.geojson').read_text(encoding='utf-8'))
# Accurate interior audit points from the unsimplified source, not display centroids.
index=[]
if (OUT/'ecoregions.json').exists(): index=json.loads((OUT/'ecoregions.json').read_text(encoding='utf-8'))
else:
    shp=next((ROOT/'data/raw').rglob('*.shp'))
    for record in shapefile.Reader(str(shp),encoding='cp1252').iterShapeRecords():
        p=record.record.as_dict();g=shape(record.shape.__geo_interface__)
        if not g.is_valid:g=make_valid(g)
        pt=g.representative_point()
        index.append({'id':int(p['ECO_ID']),'name':p['ECO_NAME'],'biome':p['BIOME_NAME'],'biomeId':int(p['BIOME_NUM']),'realm':p['REALM'],'auditPoint':{'lat':pt.y,'lon':pt.x}})
write(OUT/'ecoregions.json',index)
manifest={'version':'0.8.0','taxa':len(taxa),'sourceRelease':'WCVP 16, extracted 2026-06-04','retrieved':'2026-11-21','sources':[{'id':'wcvp-16','name':'World Checklist of Vascular Plants v16','url':WCVP,'sha256':digest(RAW/'wcvp.zip'),'license':'CC-BY-3.0','licenseUrl':'https://creativecommons.org/licenses/by/3.0/','licenseEvidence':'README_WCVP.xlsx in the actual source archive states CC BY 3.0; the GBIF Darwin Core distribution advertises CC BY 4.0. This import uses the archive license.','citation':'Govaerts R (ed.). 2026. WCVP: World Checklist of Vascular Plants. Royal Botanic Gardens, Kew. https://doi.org/10.34885/egs6-cp24','modifications':'Accepted tree species subset; native/extant/non-doubtful country records only; normalized names and identifiers; procedural archetypes not botanical evidence.'},{'id':'wgsrpd-2001','name':'TDWG WGSRPD Level 3 botanical countries','url':TDWG,'sha256':digest(RAW/'tdwg-level3.geojson'),'license':'CC-BY-4.0','licenseUrl':'https://creativecommons.org/licenses/by/4.0/','licenseEvidence':'TDWG platform terms https://www.tdwg.org/about/terms-of-use/','citation':'Brummitt, R.K. (2001). World Geographical Scheme for Recording Plant Distributions, Edition 2. TDWG / Hunt Institute.','modifications':'Source geometry retained; bounding boxes added. These old coarse botanical boundaries can differ from RESOLVE coastlines.'}],'selection':'Priority original and distinctive taxa, followed by deterministic round-robin across botanical regions with genus diversity; not abundance, dominance, or an exhaustive flora.','missingTraits':['leaf habit','mature height','species-specific ecological roles','local habitat validation','verified species/ecoregion associations'],'legacyTaxa':len(original),'legacyResolved':sum(v is not None for v in json.loads((OUT/'legacy-links.json').read_text()).values()),'files':{p.name:digest(p) for p in [OUT/n for n in ['taxa.json','areas.json','legacy-links.json','ecoregion-associations.json','ecoregions.json']]},'botanicalGeometrySha256':digest(PUBLIC/'botanical-countries.geojson')}
write(OUT/'provenance.json',manifest);write(PUBLIC/'provenance.json',manifest)
write(PUBLIC/'taxa.json',taxa)
print(json.dumps({'taxa':len(taxa),'nativeAreas':len({c for t in taxa for c in t['nativeAreaCodes']}),'legacyResolved':manifest['legacyResolved'],'unresolvedLegacy':[n for n,key in json.loads((OUT/'legacy-links.json').read_text()).items() if not key],'ecoregions':len(index)},indent=2))
