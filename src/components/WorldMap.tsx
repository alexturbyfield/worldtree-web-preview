'use client';
import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapType } from 'maplibre-gl';
import { biomeColors } from '@/lib/geography';
import { catalog, places, type Place } from '@/lib/catalog';

export default function WorldMap({ selected, onSelect, overlay, coverage, streets }: {selected:Place;onSelect:(p:Place)=>void;overlay:boolean;coverage:boolean;streets:boolean}) {
  const root=useRef<HTMLDivElement>(null), map=useRef<MapType|null>(null), marker=useRef<maplibregl.Marker|null>(null);
  const callback=useRef(onSelect);
  const [ready,setReady]=useState(false), [error,setError]=useState('');
  useEffect(()=>{callback.current=onSelect;},[onSelect]);
  useEffect(()=>{
    if(!root.current)return;
    let m:MapType;
    try {
      maplibregl.setWorkerUrl('/maplibre-worker.mjs');
      m=new maplibregl.Map({container:root.current,center:[-118,42],zoom:2.5,minZoom:0.5,maxZoom:16,attributionControl:false,renderWorldCopies:true,style:{version:8,sources:{land:{type:'geojson',data:'/data/world_land.geojson'},ecoregions:{type:'geojson',data:'/data/resolve-2017/display.geojson'},streets:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'},coverage:{type:'geojson',data:{type:'FeatureCollection',features:catalog.map(r=>({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[r.bounds.west,r.bounds.south],[r.bounds.east,r.bounds.south],[r.bounds.east,r.bounds.north],[r.bounds.west,r.bounds.north],[r.bounds.west,r.bounds.south]]]}}))}}},layers:[{id:'ocean',type:'background',paint:{'background-color':'#dce9e9'}},{id:'land',type:'fill',source:'land',paint:{'fill-color':'#e3e6d8'}},{id:'coast',type:'line',source:'land',paint:{'line-color':'#adbfb4','line-width':0.6}},{id:'streets',type:'raster',source:'streets',minzoom:4,paint:{'raster-opacity':0.72}},{id:'ecoregions',type:'fill',source:'ecoregions',paint:{'fill-color':['match',['get','BIOME_NUM'],...Object.entries(biomeColors).flatMap(([k,v])=>[Number(k),v]),'#d8ded9'] as unknown as maplibregl.ExpressionSpecification,'fill-opacity':0.63}},{id:'boundaries',type:'line',source:'ecoregions',paint:{'line-color':'#335c47','line-width':['interpolate',['linear'],['zoom'],1,0.2,7,0.8],'line-opacity':0.32}},{id:'coverage',type:'line',source:'coverage',layout:{visibility:'none'},paint:{'line-color':'#c07632','line-width':2,'line-dasharray':[3,2]}}]}});
    } catch {queueMicrotask(()=>setError('Your browser could not start the interactive map. Use the location search and presets to inspect trees.'));return;}
    map.current=m;
    m.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
    m.addControl(new maplibregl.AttributionControl({compact:true,customAttribution:'<a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth</a> · <a href="https://doi.org/10.1093/biosci/bix014">RESOLVE 2017</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>'}),'bottom-right');
    m.on('load',()=>setReady(true));
    m.on('error',e=>{ if (e.error?.message?.includes('display.geojson')) setError('Ecoregion overlay could not load. Coordinate lookup is available independently.'); });
    m.on('click',e=>callback.current({name:'Selected location',lat:Math.max(-90,Math.min(90,e.lngLat.lat)),lon:((e.lngLat.lng+180)%360+360)%360-180}));
    const pin=document.createElement('div');pin.className='map-pin';pin.setAttribute('aria-hidden','true');pin.innerHTML='<span></span>';
    marker.current=new maplibregl.Marker({element:pin}).setLngLat([places[0].lon,places[0].lat]).addTo(m);
    const observer=new ResizeObserver(()=>m.resize());observer.observe(root.current);
    return ()=>{observer.disconnect();m.remove();map.current=null;};
  },[]);
  useEffect(()=>{if(!map.current)return;marker.current?.setLngLat([selected.lon,selected.lat]);map.current.flyTo({center:[selected.lon,Math.max(-85,Math.min(85,selected.lat))],zoom:Math.max(map.current.getZoom(),4.7),duration:850,essential:false});},[selected]);
  useEffect(()=>{if(!ready||!map.current)return;for(const id of ['ecoregions','boundaries'])map.current.setLayoutProperty(id,'visibility',overlay?'visible':'none');map.current.setLayoutProperty('coverage','visibility',coverage?'visible':'none');map.current.setLayoutProperty('streets','visibility',streets?'visible':'none');},[overlay,coverage,streets,ready]);
  return <div className="map-wrap"><div className="map-canvas" ref={root} aria-label="Interactive world map. Tap to inspect a location."/><div className="map-caption"><span className="live-dot"/> {overlay?'ECOREGIONS · RESOLVE 2017':'GEOGRAPHIC EXPLORER'}</div><button className="world-button" onClick={()=>map.current?.flyTo({center:[5,20],zoom:0.8,duration:900})} aria-label="Show whole world">◎ <span>World view</span></button><div className="map-hint">Tap anywhere to explore · drag to pan · pinch to zoom</div>{error&&<div className="map-error" role="alert">{error}</div>}</div>;
}
