import * as T from 'three';
import {defaultPreset,parsePreset,MATERIAL_EVENT,MATERIAL_READY,type MaterialEdit} from '../material-workbench';
export function prairieMaterialUniforms(){const v=defaultPreset().values;return {
 prShade:{value:new T.Color(v.prShade)},prBody:{value:new T.Color(v.prBody)},prSun:{value:new T.Color(v.prSun)},prSoil:{value:new T.Color(v.prSoil)},
 prTipIntensity:{value:v.tipIntensity},prDetailStrength:{value:v.detailStrength},prSoilBlend:{value:v.soilBlend},
};}
export type PrairieMaterialUniforms=ReturnType<typeof prairieMaterialUniforms>;
/** Per-scene binding. Defaults preserve each rock batch's original pigment. */
export function bindPrairieMaterials(scene:T.Scene,uniforms:PrairieMaterialUniforms){
 const rocks:{mesh:T.InstancedMesh;count:number;material:T.MeshStandardMaterial;color:T.Color}[]=[];
 scene.traverse(o=>{if(o instanceof T.InstancedMesh&&/^prairie-(low-substrate|foreground-small)-stones$/.test(o.name)&&o.material instanceof T.MeshStandardMaterial)rocks.push({mesh:o,count:o.count,material:o.material,color:o.material.color.clone()});});
 const defaults=defaultPreset();const reference=new T.Color(defaults.values.rockColor);
 const apply=(edit:MaterialEdit)=>{
  const preset=parsePreset(JSON.stringify(edit.preset)),v=edit.enabled?preset.values:defaults.values;
  for(const k of ['prShade','prBody','prSun','prSoil'] as const)uniforms[k].value.set(v[k]);
  uniforms.prTipIntensity.value=v.tipIntensity;uniforms.prDetailStrength.value=v.detailStrength;uniforms.prSoilBlend.value=v.soilBlend;
  const tint=new T.Color(v.rockColor);tint.setRGB(tint.r/reference.r,tint.g/reference.g,tint.b/reference.b);
  for(const rock of rocks){rock.material.color.copy(rock.color).multiply(tint);rock.mesh.count=Math.round(rock.count*v.rockCoverage);}
  scene.userData.artRevision=(scene.userData.artRevision??0)+1;
 };
 const listener=(event:Event)=>apply((event as CustomEvent<MaterialEdit>).detail);
 window.addEventListener(MATERIAL_EVENT,listener);scene.userData.materialWorkbench={apply,uniforms,rockInstances:rocks.reduce((n,r)=>n+r.count,0)};
 window.dispatchEvent(new Event(MATERIAL_READY));
 return()=>{window.removeEventListener(MATERIAL_EVENT,listener);delete scene.userData.materialWorkbench;};
}
