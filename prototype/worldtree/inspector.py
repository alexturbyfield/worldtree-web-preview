"""Local browser inspector. No external services required for coordinate lookup."""
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlsplit,parse_qs
import json, argparse
from pathlib import Path
from geo import lookup
from worldtree import load_profiles,select_trees
from species_catalog import recommend
from catalog_audit import audit
ROOT=Path(__file__).parent
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url=urlsplit(self.path); q=parse_qs(url.query)
        try:
            if url.path=='/':
                body=(ROOT/'inspector.html').read_bytes(); typ='text/html; charset=utf-8'
            elif url.path=='/world_land.geojson':
                body=(ROOT/'world_land.geojson').read_bytes();typ='application/geo+json'
            elif url.path=='/ecoregions_map.geojson':
                file=ROOT/'ecoregions_map.geojson'
                if not file.exists(): self.send_error(404,'Import RESOLVE and export overlay first');return
                body=file.read_bytes();typ='application/geo+json'
            elif url.path=='/api/lookup':
                lat=float(q['lat'][0]);lon=float(q['lon'][0]);result=lookup(lat,lon)
                body=json.dumps(result).encode();typ='application/json'
            elif url.path=='/api/sample':
                region=q.get('region',['pnw_lowland_example'])[0];habitat=q.get('habitat',['forest'])[0]
                body=json.dumps(select_trees(region,habitat,12,int(q.get('seed',['42'])[0]))).encode();typ='application/json'
            elif url.path=='/api/recommend':
                lat=float(q['lat'][0]);lon=float(q['lon'][0]);habitat=q.get('habitat',['forest'])[0]
                body=json.dumps(recommend(lat,lon,habitat,lookup(lat,lon))).encode();typ='application/json'
            elif url.path=='/api/catalog/stats':
                stats=audit();stats.pop('rows')
                body=json.dumps(stats).encode();typ='application/json'
            elif url.path=='/api/profiles':
                body=json.dumps(load_profiles()).encode();typ='application/json'
            else:self.send_error(404);return
            self.send_response(200);self.send_header('Content-Type',typ);self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
        except (ValueError,KeyError) as exc:
            body=json.dumps({'error':str(exc)}).encode();self.send_response(400);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(body)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8765);args=parser.parse_args()
    print(f'WorldTree inspector: http://localhost:{args.port}',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
