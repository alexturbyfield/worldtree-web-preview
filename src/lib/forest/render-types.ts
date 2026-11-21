export interface RenderStats {calls:number;triangles:number;quality:string;lod:string;frames:number;camera:string;buildMs?:number;renderCpuMs?:number;geometries?:number;textureCount?:number}
export interface CameraView {position:[number,number,number];target:[number,number,number]}
export interface BenchmarkResult {durationMs:number;frames:number;fps:number;medianFrameMs:number;p95FrameMs:number;meanRenderCpuMs:number;calls:number;triangles:number;quality:string;renderer:string;viewport:string;pixelRatio:number;method:string}
export interface RenderOptions {lab?:boolean;debug?:'none'|'wireframe'|'skeleton'}
