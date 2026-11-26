import {CatmullRomCurve3,QuadraticBezierCurve3,Curve,Vector3} from 'three';
import type {Point,Segment} from '../forest/tree';
export interface GrowthHierarchy {persistence:number;phototropism:number;gravitropism:number;curvature:number;tertiaryFrequency:number;jorquetteHeight?:number;uprightContinuation?:boolean;attachmentRatio?:number;tipRatio?:number}
export interface HierarchyPath {id:number;parentId:number;curve:Curve<Vector3>;first:number;steps:number;radius:number;tipRadius:number;depth:number;role:'wood'|'root'}
export interface Attachment {path:HierarchyPath;u:number}
/** Opt-in path ownership. Legacy trees never enter this builder. All coordinates are tree-local metres. */
export class HierarchyBuilder {
 paths:HierarchyPath[]=[];
 constructor(readonly segments:Segment[],readonly growth:GrowthHierarchy,readonly substrate=0){}
 sample(path:HierarchyPath,u:number){const t=path.curve.getUtoTmapping(u,0),scaled=Math.min(path.steps-1e-9,Math.max(0,t*path.steps)),i=Math.floor(scaled),f=scaled-i,segment=this.segments[path.first+i];return {point:new Vector3(...segment.a).lerp(new Vector3(...segment.b),f),tangent:new Vector3(...segment.tangentA!).lerp(new Vector3(...segment.tangentB!),f).normalize(),radius:segment.r0+(segment.r1-segment.r0)*f};}
 attach(point:Vector3):Attachment|undefined{let best=Infinity,result:Attachment|undefined;for(const path of this.paths.filter(p=>p.role==='wood'))for(let i=0;i<=path.steps;i++){const u=i/path.steps,d=path.curve.getPointAt(u).distanceToSquared(point);if(d<best){best=d;result={path,u};}}return result&&best<Math.pow(result.path.radius*.7+.04,2)?result:undefined;}
 add(points:Vector3[],radius:number,depth:number,taper:number,attachment?:Attachment,role:'wood'|'root'='wood'):HierarchyPath{
  attachment??=this.attach(points[0]);const first=this.segments.length,parent=attachment?this.sample(attachment.path,attachment.u):undefined;
  const start=parent?.point.clone()??points[0].clone(),end=points.at(-1)!.clone(),length=start.distanceTo(end);
  if(parent)radius=Math.min(radius,parent.radius*(role==='root'?.55:this.growth.attachmentRatio??.68));
  const desired=end.clone().sub(start).normalize(),persist=role==='root'?.12:this.growth.persistence/(1+depth*.3),photo=role==='root'?0:this.growth.phototropism,gravity=role==='root'?.25:this.growth.gravitropism;
  const inherited=(parent?.tangent??desired).clone().multiplyScalar(persist).addScaledVector(desired,1-persist).add(new Vector3(0,photo-gravity,0)).normalize();
  const control=start.clone().addScaledVector(inherited,length*.22),shoulder=points[Math.floor(points.length/2)].clone();if(role==='wood'&&depth>0)shoulder.y+=length*this.growth.curvature/(depth+1);
  if(role==='root')control.copy(start).lerp(shoulder,.45);
  const curve=role==='root'?new QuadraticBezierCurve3(start,shoulder,end):new CatmullRomCurve3([start,control,shoulder,end],false,'centripetal'),steps=depth===0?20:role==='root'?12:10;
  const tipRadius=role==='root'?Math.max(.009,radius*.12):depth===0?radius*Math.pow(1-taper,1.1):Math.max(.0007,radius*(this.growth.tipRatio??.012)),id=this.paths.length;
  const path:HierarchyPath={id,parentId:attachment?.path.id??-1,curve,first,steps,radius,tipRadius,depth,role};
  const point=(t:number)=>{const p=t===1?end.clone():curve.getPoint(t);if(role==='root')p.y=t===1?this.substrate:Math.max(this.substrate,p.y);return p.toArray() as Point;};
  for(let i=0;i<steps;i++){const t=i/steps,u=(i+1)/steps,r=(t:number)=>tipRadius+(radius-tipRadius)*Math.pow(1-t,1.2);this.segments.push({a:point(t),b:point(u),r0:r(t),r1:r(u),depth,pathId:id,parentPathId:path.parentId,role,tangentA:(i===0&&parent?parent.tangent:curve.getTangent(t)).toArray() as Point,tangentB:curve.getTangent(u).toArray() as Point,capStart:!parent&&i===0,capEnd:i===steps-1});}
  this.paths.push(path);return path;
 }
}
