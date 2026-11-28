import * as T from 'three';
/** Portable generation/selection contract; no runtime generation service. */
export interface LandscapeMatteAsset {
 schemaVersion:1;id:string;asset:string;
 conditioning:{location:{lat:number;lon:number};ecoregionId:number;biomeId:number;topography:{source:string;measured:boolean;landform:string};landCover:string[];seed:string;season:string;timeOfDay:string;weather:string;viewAzimuth:number;horizonFraction:number};
 layers:{position:[number,number,number];size:[number,number];yaw:number;opacity:number}[];
 supportedView:{anchor:[number,number,number];maxHorizontalDisplacement:number;maxElevation:number;halfAngleDegrees:number};
 provenance:{method:string;source:string;limitations:string[]};
}
/** Opt-in world planes: real translation parallax, shared sky/fog, no camera-following billboard. */
export function mountLandscapeMatte(scene:T.Scene,spec:LandscapeMatteAsset,load:(url:string)=>T.Texture){
 const pilot=scene.userData.environmentSelection?.regional??scene.userData.environmentSelection?.pilot;if(pilot&&Math.hypot(pilot.site.lat-spec.conditioning.location.lat,pilot.site.lon-spec.conditioning.location.lon)>.08){(scene.userData.withheldRegionalMattes??=[]).push({id:spec.id,reason:'Location-conditioned reference asset outside its geographic pilot envelope'});return()=>{};}
 const texture=load(spec.asset);texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;
 const group=new T.Group();group.name='landscape-matte-'+spec.id;
 for(const layer of spec.layers){const material=new T.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.025,opacity:layer.opacity,depthWrite:false,side:T.DoubleSide,fog:true,toneMapped:false});
  material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',`diffuseColor.a*=smoothstep(0.,.07,vMapUv.y)*smoothstep(0.,.035,vMapUv.x)*(1.-smoothstep(.965,1.,vMapUv.x));\n#include <alphatest_fragment>`);};material.customProgramCacheKey=()=> 'landscape-matte-alpha-1';
  const mesh=new T.Mesh(new T.PlaneGeometry(...layer.size),material);mesh.position.fromArray(layer.position);mesh.rotation.y=layer.yaw;group.add(mesh);
 }scene.add(group);
 const old=scene.onBeforeRender,anchor=new T.Vector3(...spec.supportedView.anchor),forward=new T.Vector3(Math.sin(spec.conditioning.viewAzimuth),0,-Math.cos(spec.conditioning.viewAzimuth)),view=new T.Vector3();
 scene.onBeforeRender=function(...args){old.apply(this,args);const camera=args[2];camera.getWorldDirection(view);view.y=0;view.normalize();group.visible=camera.position.y-anchor.y<spec.supportedView.maxElevation&&Math.hypot(camera.position.x-anchor.x,camera.position.z-anchor.z)<spec.supportedView.maxHorizontalDisplacement&&view.dot(forward)>Math.cos(spec.supportedView.halfAngleDegrees*Math.PI/180);};
 scene.userData.landscapeMatte={...spec,visibility:'World-space static plane; hidden outside declared camera envelope and in elevated inspection. No 360-degree claim.'};
 return()=>{scene.onBeforeRender=old;scene.remove(group);group.children.forEach(o=>{const m=o as T.Mesh;m.geometry.dispose();(m.material as T.Material).dispose();});delete scene.userData.landscapeMatte;};
}
