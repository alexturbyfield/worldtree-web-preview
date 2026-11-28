import {hashSeed} from './random';

/** A bounded test set, not a new biome taxonomy or global permission map. */
export const geographicPilotSites=[
 {id:'woodland-europe',name:'Central European woodland',family:'temperate',biome:4,eco:686,lat:50.5,lon:10.5,area:'GER'},
 {id:'woodland-appalachia',name:'Appalachian woodland',family:'temperate',biome:4,eco:331,lat:35.6,lon:-83.5,area:'TEN'},
 {id:'woodland-japan',name:'Japanese deciduous woodland',family:'temperate',biome:4,eco:683,lat:36,lon:138,area:'JAP'},
 {id:'prairie-oklahoma',name:'Oklahoma mixed-grass prairie',family:'prairie',biome:8,eco:389,lat:36.5736504415,lon:-98.3419281896,area:'OKL'},
 {id:'prairie-pampas',name:'Humid Pampas grassland',family:'prairie',biome:8,eco:576,lat:-35,lon:-61,area:'AGE'},
 {id:'prairie-mongolia',name:'Mongolian–Manchurian steppe',family:'prairie',biome:8,eco:734,lat:47,lon:107,area:'MON'},
 {id:'dryforest-costa-rica',name:'Costa Rican seasonal dry woodland',family:'dryforest',biome:2,eco:527,lat:10.85,lon:-85.61,area:'COS'},
 {id:'dryforest-nicaragua',name:'Nicaraguan seasonal dry woodland',family:'dryforest',biome:2,eco:527,lat:12.4,lon:-86.4,area:'NIC'},
 {id:'dryforest-mexico',name:'Jalisco seasonal dry woodland',family:'dryforest',biome:2,eco:534,lat:19.5,lon:-104.9,area:'MXS'},
 {"id":"boreal-finland","name":"Finnish taiga","family":"boreal","biome":6,"eco":717,"lat":66.5,"lon":26,"area":"FIN"},
 {"id":"boreal-canada","name":"Canadian Shield forest","family":"boreal","biome":6,"eco":370,"lat":50.03395423650011,"lon":-79.9693233989495,"area":"ONT"},
 {"id":"boreal-siberia","name":"East Siberian taiga","family":"boreal","biome":6,"eco":710,"lat":61.374604867000016,"lon":113.46115642698791,"area":"YAK"},
 {"id":"tundra-alaska","name":"Alaskan coastal tundra","family":"tundra","biome":11,"eco":407,"lat":70.40569664550017,"lon":-155.5860519265899,"area":"ASK"},
 {"id":"tundra-chukchi","name":"Chukchi tundra","family":"tundra","biome":11,"eco":772,"lat":66.5,"lon":179.5,"area":"MAG"},
 {"id":"tundra-polar","name":"High-Arctic sparse tundra","family":"tundra","biome":11,"eco":778,"lat":79.8425808130001,"lon":22.698212507857455,"area":"SVA"},
 {"id":"mangrove-florida","name":"Florida tidal mangrove","family":"mangrove","biome":14,"eco":612,"lat":25.2,"lon":-80.9,"area":"FLA"},
 {"id":"mangrove-gabon","name":"Gabon tidal mangrove","family":"mangrove","biome":14,"eco":111,"lat":0.07135971000002428,"lon":9.73893832629247,"area":"GAB"},
 {"id":"mangrove-sundarbans","name":"Sundarbans tidal mangrove","family":"mangrove","biome":14,"eco":323,"lat":22.160026979000122,"lon":89.11163382745804,"area":"BAN"},
 {"id":"rainforest-amazon","name":"Amazon moist forest","family":"rainforest","biome":1,"eco":473,"lat":-3.12,"lon":-60.02,"area":"BZN"},
 {"id":"rainforest-congo","name":"Congolian coastal forest","family":"rainforest","biome":1,"eco":5,"lat":-0.732960091999928,"lon":10.536357117199982,"area":"GAB"},
 {"id":"rainforest-borneo","name":"Borneo lowland forest","family":"rainforest","biome":1,"eco":219,"lat":1.49259730950007,"lon":112.82353468527072,"area":"BOR"},
 {"id":"tropicalpine-guatemala","name":"Guatemalan pine–oak","family":"tropicalpine","biome":3,"eco":553,"lat":14.507672,"lon":-89.435797,"area":"GUA"},
 {"id":"tropicalpine-cuba","name":"Cuban pine forest","family":"tropicalpine","biome":3,"eco":554,"lat":22.43424454550015,"lon":-84.18066863974116,"area":"CUB"},
 {"id":"tropicalpine-himalaya","name":"Himalayan subtropical pine","family":"tropicalpine","biome":3,"eco":302,"lat":34.00749877650017,"lon":73.8393963929189,"area":"WHM"},
 {"id":"conifer-puget","name":"Puget conifer forest","family":"conifer","biome":5,"eco":364,"lat":47.6062,"lon":-122.3321,"area":"WAS"},
 {"id":"conifer-alps","name":"Alps conifer forest","family":"conifer","biome":5,"eco":689,"lat":46.094221942500155,"lon":10.609839209495618,"area":"ITA"},
 {"id":"conifer-bc","name":"British Columbia coastal forest","family":"conifer","biome":5,"eco":349,"lat":52.84538420850012,"lon":-127.29099170961274,"area":"BRC"},
 {"id":"savanna-tanzania","name":"Tanzanian savanna","family":"savanna","biome":7,"eco":57,"lat":-2.3,"lon":35.2,"area":"TAN"},
 {"id":"savanna-cerrado","name":"Brazilian Cerrado","family":"savanna","biome":7,"eco":567,"lat":-15.124225762999941,"lon":-53.56781811810714,"area":"BZC"},
 {"id":"savanna-arnhem","name":"Arnhem Land savanna","family":"savanna","biome":7,"eco":181,"lat":-12.848173361499903,"lon":133.41901648916127,"area":"NTA"},
 {"id":"flooded-everglades","name":"Everglades grassland mosaic","family":"flooded","biome":9,"eco":581,"lat":26.20995741900012,"lon":-80.93838259249979,"area":"FLA"},
 {"id":"flooded-pantanal","name":"Pantanal wetland mosaic","family":"flooded","biome":9,"eco":584,"lat":-18.759949358999904,"lon":-56.39052109683886,"area":"BZC"},
 {"id":"flooded-niger","name":"Inner Niger flooded savanna","family":"flooded","biome":9,"eco":71,"lat":15.217014018000043,"lon":-4.285552269107671,"area":"MLI"},
 {"id":"montane-peru","name":"Cordillera Blanca puna","family":"montane","biome":10,"eco":589,"lat":-9.88,"lon":-77.19,"area":"PER"},
 {"id":"montane-ethiopia","name":"Ethiopian montane moorland","family":"montane","biome":10,"eco":80,"lat":10.969166666500087,"lon":39.235833333500096,"area":"ETH"},
 {"id":"montane-altai","name":"Altai alpine meadow","family":"montane","biome":10,"eco":749,"lat":49.65422753150014,"lon":87.34323418135183,"area":"ALT"},
 {"id":"mediterranean-france","name":"Hérault oak scrub","family":"mediterranean","biome":12,"eco":799,"lat":43.72,"lon":3.58,"area":"FRA"},
 {"id":"mediterranean-portugal","name":"Southwest Iberian woodland","family":"mediterranean","biome":12,"eco":805,"lat":38.36740321700009,"lon":-8.271978633460105,"area":"POR"},
 {"id":"mediterranean-italy","name":"Italian sclerophyll woodland","family":"mediterranean","biome":12,"eco":795,"lat":42.60179595000011,"lon":11.949126036466533,"area":"ITA"},
 {"id":"desert-mojave","name":"Mojave rockland","family":"desert","biome":13,"eco":433,"lat":34,"lon":-116.15,"area":"CAL"},
 {"id":"desert-atacama","name":"Atacama rockland study","family":"desert","biome":13,"eco":598,"lat":-22.359061640499903,"lon":-69.33837508798246,"area":"CLN"},
 {"id":"desert-namib","name":"Namib rockland study","family":"desert","biome":13,"eco":103,"lat":-23.976386401999946,"lon":15.074216811019252,"area":"NAM"},
] as const;
export type GeographicPilotSite=typeof geographicPilotSites[number];
export interface PilotContext {
 location:{lat:number;lon:number}|null;
 ecoregion:{ECO_ID:number;BIOME_NUM:number}|null;
 habitat?:string;
 environment?:{unvalidated:string[]};
 palette?:{scientificName:string|null;sources:string[];visual?:{presetId?:string}}[];
 landCover?:{scientificName:string;renderEligible:boolean;growthForm:string}[];
}
export interface RegionalRecipeSelection {
 schemaVersion:1;version:'geographic-pilot-v1'|'bounded-auto-v1';status:'experimental-unreviewed';
 site:{id:string;name:string;family:GeographicPilotSite['family'];biome:number;eco:number;lat:number;lon:number;area:string|null};inputSeed:string;effectiveSeed:string;
 eligibleTreeCandidates:{scientificName:string;sources:string[]}[];
 renderedTreeIdentity:'regional-candidate-architecture'|'conditional-regional-trees'|'unnamed-seasonal-growth-forms'|'none'|'unnamed-conifer-growth-forms';
 limitations:string[];
}
export interface GeographicPilot extends RegionalRecipeSelection {version:'geographic-pilot-v1';site:GeographicPilotSite}
export const pilotHabitat=(site:GeographicPilotSite)=>site.family==='mangrove'?'coastal':[7,8,10,11,13].includes(site.biome)?'grassland':site.family==='flooded'?'wetland':'forest';
export function geographicPilotUrl(id:string){
 const site=geographicPilotSites.find(s=>s.id===id);if(!site)throw Error('Unknown pilot site');
 const params=new URLSearchParams({lat:String(site.lat),lon:String(site.lon),habitat:pilotHabitat(site),seed:'29',density:site.biome===2?'24':'36',structure:site.family==='mediterranean'?'mediterranean-1':'grove-1',appearance:'garden',wind:'0',mode:'painterly',conditional:site.id==='prairie-oklahoma'?'1':'0',geographicPilot:site.id});if(['mangrove','desert'].includes(site.family))params.set('artPass','fidelity');if(site.family==='flooded')params.set('artPass','flooded-finish');return '/explore?'+params;
}
export function resolveGeographicPilot(r:PilotContext,search:string):{pilot:GeographicPilot|null;reason:string|null}{
 const q=new URLSearchParams(search),id=q.get('geographicPilot');if(!id)return {pilot:null,reason:null};
 const site=geographicPilotSites.find(s=>s.id===id),g=r.ecoregion,p=r.location;
 if(q.getAll('geographicPilot').length!==1||!site||!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||!g||g.ECO_ID===0||g.BIOME_NUM!==site.biome||g.ECO_ID!==site.eco||Math.hypot(p.lat-site.lat,p.lon-site.lon)>.08)return {pilot:null,reason:'Pilot site is unknown or outside its tested ecoregion/location envelope; using the existing geographic fallback.'};
 if(q.has('referenceScene')||['alpine','expansion','wave1'].some(k=>q.has(k)))return {pilot:null,reason:'Pilot and reference/study selectors cannot be combined; using the existing geographic fallback.'};
 if((r.habitat&&r.habitat!==pilotHabitat(site))||r.environment?.unvalidated.length)return {pilot:null,reason:'Requested habitat or unmeasured environmental filters are unsupported by this pilot; using the existing geographic fallback.'};
 const eligibleTreeCandidates=regionalCandidates(r,site.family);
 if(['temperate','boreal','conifer','rainforest','mediterranean','mangrove'].includes(site.family)&&!eligibleTreeCandidates.length)return {pilot:null,reason:'No supported tree architecture is backed by the resolved regional palette; using the existing geographic fallback.'};
 const inputSeed=q.get('seed')??'29';
 return {reason:null,pilot:{schemaVersion:1,version:'geographic-pilot-v1',status:'experimental-unreviewed',site,inputSeed,effectiveSeed:String(hashSeed(inputSeed+'|geographic-pilot-v1|'+site.id)),eligibleTreeCandidates,
 renderedTreeIdentity:site.family==='tropicalpine'&&!eligibleTreeCandidates.length?'unnamed-conifer-growth-forms':['temperate','boreal','conifer','rainforest','mediterranean','tropicalpine','mangrove'].includes(site.family)?'regional-candidate-architecture':['tundra','savanna','flooded','montane','desert'].includes(site.family)||site.family==='prairie'&&site.eco!==389?'none':site.family==='prairie'?'conditional-regional-trees':'unnamed-seasonal-growth-forms',
 limitations:['Catalogue ranges establish botanical-country candidates, not occurrence at this point.','Synthetic terrain, moisture fields and population patterns are artistic hypotheses; no DEM or land-cover survey is available.','Reference lighting is a preview state, not an intrinsic regional climate or season.',
 ...(site.family==='prairie'&&site.eco!==389?['No regional nonwoody catalogue is loaded here: grasses and forbs remain unnamed functional forms; no Oklahoma shrubs or trees are imported.']:[]),
 ...(site.family==='tundra'?['No named moss, lichen, sedge or heath catalogue is available here. Sparse polar-desert coverage follows the existing source-classification adapter, not measured soil or phenology.']:[]),
 ...(site.family==='mangrove'?['Country-native candidates with compatible root profiles only; tidal levels, salinity and current shoreline are synthetic, not measured. Water optics remain environment-derived.']:[]),
 ...(site.family==='boreal'?['Genus-level conifer architecture and birch/aspen alternatives are approximations. Country-native range does not establish the local canopy or needle anatomy.']:[]),
 ...(['savanna','flooded','montane','desert'].includes(site.family)?['Ground cover is an unnamed functional-form transfer, not a surveyed regional flora. Unsupported local trees are withheld. Rock, soil and hydrology fields are synthetic.']:[]),
 ...(site.family==='tropicalpine'?['The catalogue lacks eligible local pine taxa at these trial points. Where necessary, trees are explicitly unnamed conifer growth forms supported only by the source biome, not Guatemalan species imported to another country.']:[]),
 ...(site.family==='rainforest'?['Uses a portable layered-forest adapter with actual regional candidates and labelled architecture approximations; no Amazon species list is imported. Tidal root taxa are excluded from this inland forest rendering pool.']:[]),
 ...(site.family==='mediterranean'?['Only resolved cork/holm oak candidates are used; Hérault background assets are withheld outside their location envelope.']:[]),
 ...(site.family==='dryforest'?['The current catalogue cannot substantiate the accepted Guanacaste/gumbo-limbo pair. Rendered trees are explicitly unnamed seasonal growth forms, not named Ceiba or verified local flora.','Costa Rica’s fixed flowering state and location-conditioned matte are withheld. A geographically supported tree-profile adapter and local background asset remain necessary.']:[])]}};
}

/** Shared eligibility contract for manual trials and bounded automatic routing. */
export function regionalCandidates(r:PilotContext,family:GeographicPilotSite['family']){return (r.palette??[]).filter(t=>t.scientificName&&t.sources.length&&family!=='tundra'&&(family!=='temperate'||/^(Quercus|Fagus|Acer|Fraxinus|Betula|Carpinus|Tilia)\s/.test(t.scientificName))&&(!['boreal','conifer'].includes(family)||/^(Picea|Pinus|Larix|Abies|Betula|Populus)\s/.test(t.scientificName))&&(family!=='tropicalpine'||/^Pinus\s/.test(t.scientificName))&&(family!=='mediterranean'||/^Quercus (ilex|suber)$/.test(t.scientificName))&&(family!=='rainforest'||!['red-mangrove','avicennia','stilt-mangrove'].includes(t.visual?.presetId??''))&&(family!=='mangrove'||['red-mangrove','avicennia','stilt-mangrove'].includes(t.visual?.presetId??''))).map(t=>({scientificName:t.scientificName!,sources:t.sources}));}
