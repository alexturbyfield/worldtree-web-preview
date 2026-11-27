import {BufferGeometry,Float32BufferAttribute,Color,Vector3} from 'three';
export type MeadowFlowerForm='spire'|'rosette'|'cloud';
/** Functional flower forms, not unverified occurrence records. Indexed geometry is shared per instance batch. */
export function meadowFlowerGeometry(form:MeadowFlowerForm){
 const positions:number[]=[],colors:number[]=[],uv:number[]=[],indices:number[]=[];
 const tri=(a:Vector3,b:Vector3,c:Vector3,color:string)=>{const base=positions.length/3,tint=new Color(color);for(const p of [a,b,c]){positions.push(...p.toArray());colors.push(...tint.toArray());uv.push(.5,p.y);}indices.push(base,base+1,base+2);};
 const v=(x:number,y:number,z:number)=>new Vector3(x,y,z);
 const stem=(x:number,z:number,h:number,lean:number)=>{const top=v(x+lean,h,z);for(const a of [0,Math.PI/2]){const dx=Math.cos(a)*.009,dz=Math.sin(a)*.009;tri(v(x-dx,0,z-dz),v(x+dx,0,z+dz),top,'#456b43');}return top;};
 const leaf=(x:number,z:number,y:number,a:number,size:number)=>{const base=v(x,y,z),tip=base.clone().add(v(Math.cos(a)*size,size*.28,Math.sin(a)*size)),mid=base.clone().lerp(tip,.55).add(v(0,.06,0)),side=v(-Math.sin(a)*size*.22,0,Math.cos(a)*size*.22);tri(base,mid.clone().add(side),tip,'#58864e');tri(base,tip,mid.clone().sub(side),'#396f4c');};
 const petal=(center:Vector3,angle:number,size:number,color:string)=>{const dir=v(Math.cos(angle),.55,Math.sin(angle)),side=v(-Math.sin(angle),0,Math.cos(angle)).multiplyScalar(size*.7),end=center.clone().addScaledVector(dir,size),mid=center.clone().addScaledVector(dir,size*.55).add(v(0,size*.45,0));tri(center,mid.clone().add(side),end,color);tri(center,end,mid.clone().sub(side),color);};
 if(form==='spire')for(let j=0;j<3;j++){const x=(j-1)*.16,z=Math.sin(j*2.4)*.12,h=.72+j*.12,top=stem(x,z,h,.06);for(let k=0;k<3;k++)leaf(x,z,.08+k*.1,j*2.4+k*2,.23-k*.035);for(let k=0;k<6;k++){const c=top.clone().add(v(0,-.3+k*.055,0)),size=.105*(1-k*.1);for(let a=0;a<3;a++)petal(c,a*2.094+k*.6,size,j%2?'#a67ed9':'#df78b1');}}
 if(form==='rosette')for(let j=0;j<4;j++){const a=j*2.399,x=Math.cos(a)*.2,z=Math.sin(a)*.2,top=stem(x,z,.30+(j%3)*.07,.03);leaf(x,z,.04,a,.27);leaf(x,z,.1,a+2,.19);for(let k=0;k<5;k++)petal(top,k*1.257,.095,j%2?'#b5a2df':'#8ca5d6');tri(top.clone().add(v(-.023,.008,0)),top.clone().add(v(.025,.008,0)),top.clone().add(v(0,.025,.025)),'#efd582');}
 if(form==='cloud')for(let j=0;j<5;j++){const a=j*2.399,x=Math.cos(a)*.22,z=Math.sin(a)*.22,top=stem(x,z,.46+(j%3)*.09,.03);leaf(x,z,.08,a,.23);for(let k=0;k<3;k++){const c=top.clone().add(v(Math.cos(k*2.094)*.07,(k%2)*.035,Math.sin(k*2.094)*.07));for(let n=0;n<3;n++)petal(c,n*2.094,.05,'#eee9ca');}}
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setAttribute('color',new Float32BufferAttribute(colors,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
