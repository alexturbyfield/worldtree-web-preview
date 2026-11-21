import {test} from 'node:test';
import assert from 'node:assert/strict';
import type {TreeSpecies,VegetationProfile} from '../src/lib/global-types';
import {defaultEnvironment,exportProfile,habitats,resolveVegetation,taxa} from '../src/lib/vegetation';

const location={lat:47.6062,lon:-122.3321,geography:{ECO_ID:364,ECO_NAME:'Puget lowland forests',BIOME_NAME:'Temperate Conifer Forests',BIOME_NUM:5,REALM:'Nearctic'},botanicalArea:{code:'WAS',name:'Washington'}};
const exported=(profile:VegetationProfile)=>JSON.parse(exportProfile(profile)) as VegetationProfile;

test('all 400 catalog records satisfy the game export contract without inventing heights',()=>{
  const profile={...resolveVegetation(location),species:taxa};
  const before=JSON.stringify(profile);
  const result=exported(profile);
  assert.equal(result.species.length,400);
  for(const [i,tree] of result.species.entries()){
    for(const key of ['id','scientificName','taxonId','growthForm','assetArchetype','ecologicalRole'] as const)assert.equal(typeof tree[key],'string',key);
    for(const key of ['commonNames','nativeRegions','ecoregionIds','biomeIds','habitats','sources'] as const)assert.ok(Array.isArray(tree[key]),key);
    assert.ok(['verified','regional','provisional'].includes(tree.confidence));
    assert.equal(tree.evergreen,null);
    assert.equal(Object.hasOwn(tree,'heightMeters'),false,'Unknown height is absent, not null or zero');
    assert.equal(tree.matureHeightM,null,'Existing compatibility field is retained');
    assert.deepEqual(tree,taxa[i],'Source metadata and confidence are preserved');
  }
  assert.equal(JSON.stringify(profile),before,'Export must not modify the source profile');
});

test('a supplied legacy height range also exports through the canonical field',()=>{
  // Synthetic contract fixture only; no measured traits are added to the catalog.
  const tree:TreeSpecies={...taxa[0],matureHeightM:[8,18]};
  Object.freeze(tree.matureHeightM);Object.freeze(tree);
  const profile={...resolveVegetation(location),species:[tree]};
  const result=exported(profile);
  assert.deepEqual(result.species[0].heightMeters,[8,18]);
  assert.deepEqual(result.species[0].matureHeightM,[8,18]);
  assert.equal(Object.hasOwn(tree,'heightMeters'),false);
  assert.equal(result.species[0].confidence,tree.confidence);
  assert.deepEqual(result.species[0].sources,tree.sources);
});

test('an explicit canonical height takes precedence while preserving legacy metadata',()=>{
  // Conflicting values test wire compatibility, not botanical evidence.
  const tree:TreeSpecies={...taxa[0],heightMeters:[10,20],matureHeightM:[8,18]};
  const result=exported({...resolveVegetation(location),species:[tree]});
  assert.deepEqual(result.species[0].heightMeters,[10,20]);
  assert.deepEqual(result.species[0].matureHeightM,[8,18]);
});

test('height normalization preserves deterministic selection, environment and evidence metadata',()=>{
  const input={...location,seed:'export-contract-42'};
  const a=resolveVegetation(input),b=resolveVegetation(input);
  const result=exported(a);
  assert.equal(exportProfile(a),exportProfile(b));
  assert.deepEqual(result.species.map(t=>t.id),a.species.map(t=>t.id));
  assert.equal(result.schemaVersion,'0.8.0');
  assert.equal(result.evidenceLevel,'documented_regional_range');
  assert.equal(result.seed,input.seed);
  assert.deepEqual(result.location,a.location);
  assert.deepEqual(result.environment,a.environment);
  assert.deepEqual(result.sources,a.sources);
  assert.deepEqual(result.limitations,a.limitations);
  assert.equal(result.procedural.spawnWeights,null);
  assert.equal(result.procedural.abundance,null);
});

for(const habitat of habitats)test(`export preserves ${habitat.id} habitat semantics and provisional evidence`,()=>{
  const profile=resolveVegetation({...location,habitat:habitat.id});
  const result=exported(profile);
  assert.equal(result.habitat,habitat.id);
  assert.equal(result.status,profile.status);
  assert.equal(result.evidenceLevel,profile.evidenceLevel);
  assert.deepEqual(result.provisionalCandidates,profile.provisionalCandidates);
  assert.deepEqual(result.growthForms,profile.growthForms);
  if(habitat.id==='urban'){
    assert.equal(result.evidenceLevel,'biome_realm_fallback');
    assert.equal(result.species.length,0);
    assert.ok(result.provisionalCandidates.length>0);
  }
});

test('an unvalidated constraint exports unknown measurements and no eligible species',()=>{
  const profile=resolveVegetation({...location,environment:{...defaultEnvironment,elevationM:1000}});
  const result=exported(profile);
  assert.equal(result.environment.requested.elevationM,1000);
  assert.equal(result.environment.observed.elevationM,null);
  assert.ok(result.environment.unvalidated.includes('elevation'));
  assert.deepEqual(result.species,[]);
});

test('an unsupported location exports an explicit insufficient-data result',()=>{
  const profile=resolveVegetation({lat:25,lon:-140,geography:null});
  const result=exported(profile);
  assert.equal(result.status,'insufficient_data');
  assert.equal(result.evidenceLevel,'insufficient_data');
  assert.equal(result.geography,null);
  assert.deepEqual(result.species,[]);
  assert.deepEqual(result.provisionalCandidates,[]);
});
