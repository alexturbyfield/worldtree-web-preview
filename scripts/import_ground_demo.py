"""Bounded real-source Seattle demo. pip install rasterio pillow numpy (data tooling only)."""
from pathlib import Path
import json,urllib.request,urllib.parse,hashlib,datetime,concurrent.futures
import numpy as np
import rasterio
from rasterio.warp import reproject,transform_bounds,Resampling
from rasterio.transform import from_bounds
from PIL import Image
out=Path('public/data/ground-v1');out.mkdir(parents=True,exist_ok=True)
bounds=[-122.4,47.57,-122.28,47.69]
classes={10:['Tree cover','#67816a'],20:['Shrubland','#9caa7d'],30:['Grassland','#b3bb87'],40:['Cropland','#c3b58b'],50:['Built-up','#ac9895'],60:['Bare / sparse vegetation','#c7c0af'],70:['Snow / ice','#e0e6e6'],80:['Permanent water','#7fabb7'],90:['Herbaceous wetland','#8faeab'],95:['Mangroves','#628b7e'],100:['Moss / lichen','#b5b494']}
url='https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_N45W123_Map.tif'
with rasterio.open(url) as ds:
 window=rasterio.windows.from_bounds(*bounds,ds.transform).round_offsets().round_lengths();a=ds.read(1,window=window);tr=ds.window_transform(window);actual=list(rasterio.windows.bounds(window,ds.transform))
 # RLE preserves every source class pixel, no categorical averaging.
 flat=a.flatten();starts=np.r_[0,np.flatnonzero(flat[1:]!=flat[:-1])+1];pairs=np.column_stack((flat[starts],np.diff(np.r_[starts,len(flat)]))).flatten().tolist()
 (out/'land.json').write_text(json.dumps({'width':a.shape[1],'height':a.shape[0],'bounds':actual,'rle':pairs},separators=(',',':')))
 merc=transform_bounds('EPSG:4326','EPSG:3857',*actual);display=np.zeros((512,512),dtype='uint8');reproject(a,display,src_transform=tr,src_crs=ds.crs,dst_transform=from_bounds(*merc,512,512),dst_crs='EPSG:3857',resampling=Resampling.nearest)
 rgba=np.zeros((512,512,4),dtype='uint8')
 for k,(_,c) in classes.items():rgba[display==k]=[*bytes.fromhex(c[1:]),230]
 Image.fromarray(rgba).save(out/'land.png')
soilcrs='+proj=igh +datum=WGS84 +units=m +no_defs';b=transform_bounds('EPSG:4326',soilcrs,*actual);requests=[]
for prop in ['sand','silt','clay','soc']:
 for stat in ['mean','Q05','Q95']:requests.append((prop,stat))
def fetch(item):
 prop,stat=item;params=[('map',f'/map/{prop}.map'),('SERVICE','WCS'),('VERSION','2.0.1'),('REQUEST','GetCoverage'),('COVERAGEID',f"{prop}_0-5cm_{ {'Q05':'Q0.05','Q95':'Q0.95'}.get(stat,stat)}"),('FORMAT','image/tiff'),('SUBSET',f'x({b[0]},{b[2]})'),('SUBSET',f'y({b[1]},{b[3]})')];u='https://maps.isric.org/mapserv?'+urllib.parse.urlencode(params)
 try:
  data=urllib.request.urlopen(u,timeout=60).read()
  with rasterio.MemoryFile(data) as mem,mem.open() as ds:
   dest=np.full((48,48),-9999,dtype='int16');reproject(ds.read(1),dest,src_transform=ds.transform,src_crs=ds.crs,dst_transform=from_bounds(*actual,48,48),dst_crs='EPSG:4326',src_nodata=ds.nodata,dst_nodata=-9999,resampling=Resampling.nearest)
  return prop+'_'+stat,{'values':[None if int(v)<0 or int(v)>10000 else int(v)/10 for v in dest.flatten()], 'url':u,'sha256':hashlib.sha256(data).hexdigest()}
 except Exception as e:return prop+'_'+stat,{'values':None,'url':u,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:layers=dict(ex.map(fetch,requests))
(out/'soil.json').write_text(json.dumps({'width':48,'height':48,'bounds':actual,'layers':layers},separators=(',',':')))
sand=layers['sand_mean']['values'];silt=layers['silt_mean']['values'];clay=layers['clay_mean']['values']
valid=lambda i:all(v is not None for v in [sand[i],silt[i],clay[i]]) and 90<=sand[i]+silt[i]+clay[i]<=110
if sand and silt and clay:
 src=np.array([sand[i] if valid(i) else -9999 for i in range(48*48)],dtype='float32').reshape(48,48);d=np.full((256,256),-9999,dtype='float32');reproject(src,d,src_transform=from_bounds(*actual,48,48),src_crs='EPSG:4326',dst_transform=from_bounds(*merc,256,256),dst_crs='EPSG:3857',src_nodata=-9999,dst_nodata=-9999,resampling=Resampling.nearest)
 rgba=np.zeros((256,256,4),dtype='uint8');t=np.clip(d/100,0,1)
 for c,(lo,hi) in enumerate(zip([237,228,205],[122,83,54])):rgba[:,:,c]=(lo+(hi-lo)*t).astype('uint8')
 rgba[:,:,3]=np.where(d<0,0,230);Image.fromarray(rgba).save(out/'soil.png')
manifest={'version':'ground-v1','region':'Seattle regional demonstration','bounds':actual,'retrieved':datetime.datetime.now(datetime.timezone.utc).isoformat(),'land':{'source':'ESA WorldCover 2021 v200','url':url,'resolutionMeters':10,'date':'2021','license':'CC BY 4.0','classes':classes,'uncertainty':'InputQuality not imported; classification uncertainty unavailable.','sha256':hashlib.sha256(a.tobytes()).hexdigest()},'soil':{'source':'ISRIC SoilGrids 2.0','url':'https://docs.isric.org/globaldata/soilgrids/SoilGrids_faqs_02.html','resolutionMeters':250,'depth':'0–5 cm','date':'2.0 rolling release; not an observation year','license':'CC BY 4.0','units':{'sand':'%','silt':'%','clay':'%','soc':'g/kg'},'display':'Sand fraction; 48×48 WGS84 nearest-neighbour sample grid, not increased source resolution.','uncertainty':'Q05–Q95 prediction intervals where supplied, not measurement error.'},'fractions':{'source':'Copernicus LC100 Collection 3, 2015–2019','resolutionMeters':100,'status':'not imported','reason':'Requires a separate authenticated download or regional raster preparation. Missing is not zero; WorldCover classes are not fractions.'}}
with rasterio.open(url) as ds:
 manifest['alignmentChecks']=[{'lat':lat,'lon':lon,'sourceCode':int(next(ds.sample([(lon,lat)]))[0])} for lat,lon in [(47.6062,-122.3321),(47.64,-122.338),(47.666,-122.315)]]
(out/'manifest.json').write_text(json.dumps(manifest,indent=2));print([(k,'ok' if v['values'] else v.get('error')) for k,v in layers.items()]);print([(p.name,p.stat().st_size) for p in out.iterdir()])
